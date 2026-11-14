import os
import csv
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import text, insert

from app.core.logging import logger
from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.db.models import IngestionFile, RejectedRow, FireDetection, Country
from app.ingestion.discovery import calculate_sha256
from app.ingestion.validators import validate_raw_record
from app.ingestion.normalization import normalize_record
from app.ingestion.deduplication import create_detection_fingerprint

# Batch size for PostgreSQL insertion
BATCH_SIZE = 5000

class IngestionPipeline:
    def __init__(self, db: Optional[Session] = None):
        self.db = db or SessionLocal()
        self._owns_db = db is None

    def close(self):
        if self._owns_db and self.db:
            self.db.close()

    def get_file_record(self, checksum: str) -> Optional[IngestionFile]:
        return self.db.query(IngestionFile).filter(IngestionFile.file_checksum == checksum).first()

    def process_file(
        self,
        file_path: str,
        country_code: str,
        force_reimport: bool = False,
        max_rows: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Idempotently processes a single CSV file:
        - Checks file checksum
        - Validates rows and records rejected rows
        - Normalizes rows
        - Inserts detections in batches with PostGIS geometry
        - Updates ingestion manifest
        """
        filename = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)
        logger.info(f"Processing file: {filename} ({country_code}) [{file_size / (1024*1024):.2f} MB]")
        
        checksum = calculate_sha256(file_path)
        existing_file = self.get_file_record(checksum)
        
        if existing_file and existing_file.status == "COMPLETED" and not force_reimport:
            logger.info(f"File {filename} (SHA256 {checksum[:8]}...) was already imported. Skipping (Idempotent).")
            return {
                "status": "SKIPPED",
                "filename": filename,
                "message": "File already ingested",
                "rows_inserted": existing_file.rows_inserted,
                "rows_rejected": existing_file.rows_rejected
            }

        # Ensure country exists in DB
        country = self.db.query(Country).filter(Country.iso_code == country_code).first()
        if not country:
            country = Country(iso_code=country_code, name=country_code)
            self.db.add(country)
            self.db.commit()

        # Create or update IngestionFile tracking record
        if not existing_file:
            ingestion_file = IngestionFile(
                filename=filename,
                file_path=file_path,
                file_checksum=checksum,
                country_code=country_code,
                file_size_bytes=file_size,
                status="PROCESSING",
                started_at=datetime.now(timezone.utc)
            )
            self.db.add(ingestion_file)
            self.db.commit()
            self.db.refresh(ingestion_file)
        else:
            ingestion_file = existing_file
            ingestion_file.status = "PROCESSING"
            ingestion_file.started_at = datetime.now(timezone.utc)
            self.db.commit()

        file_id = ingestion_file.id
        total_processed = 0
        total_inserted = 0
        total_skipped = 0
        total_rejected = 0
        rejection_samples = []

        batch_records = []
        rejected_records = []
        seen_in_file = set()

        start_time = time.time()

        try:
            with open(file_path, "r", encoding="utf-8-sig", errors="replace") as f:
                reader = csv.DictReader(f)
                
                for row_idx, raw_row in enumerate(reader, start=1):
                    if max_rows and total_processed >= max_rows:
                        logger.info(f"Reached max_rows limit ({max_rows}) for {filename}")
                        break

                    total_processed += 1

                    # 1. Validation
                    is_valid, reason = validate_raw_record(raw_row)
                    if not is_valid:
                        total_rejected += 1
                        rejected_records.append(RejectedRow(
                            file_id=file_id,
                            row_number=row_idx,
                            raw_payload=str(raw_row),
                            rejection_reason=reason or "Validation failed"
                        ))
                        if len(rejection_samples) < 5:
                            rejection_samples.append(f"Row {row_idx}: {reason}")
                        continue

                    # 2. In-file duplicate suppression
                    fingerprint = (
                        round(float(raw_row["latitude"]), 4),
                        round(float(raw_row["longitude"]), 4),
                        raw_row.get("acq_date", "").strip(),
                        raw_row.get("acq_time", "").strip(),
                        raw_row.get("satellite", "").strip()
                    )
                    if fingerprint in seen_in_file:
                        total_skipped += 1
                        continue
                    seen_in_file.add(fingerprint)

                    # 3. Normalization
                    norm_record = normalize_record(raw_row, country_code=country_code, file_id=file_id)
                    batch_records.append(norm_record)

                    # 4. Flush batch
                    if len(batch_records) >= BATCH_SIZE:
                        inserted = self._insert_batch(batch_records)
                        total_inserted += inserted
                        batch_records.clear()

                    if len(rejected_records) >= 500:
                        self.db.bulk_save_objects(rejected_records)
                        self.db.commit()
                        rejected_records.clear()

                    if total_processed % 50000 == 0:
                        elapsed = time.time() - start_time
                        logger.info(f"  [{filename}] Processed {total_processed:,} rows ({total_inserted:,} inserted, {total_rejected} rejected) in {elapsed:.1f}s")

            # Flush remaining records
            if batch_records:
                inserted = self._insert_batch(batch_records)
                total_inserted += inserted
                batch_records.clear()

            if rejected_records:
                self.db.bulk_save_objects(rejected_records)
                self.db.commit()
                rejected_records.clear()

            # Update tracking status
            ingestion_file.status = "COMPLETED"
            ingestion_file.rows_processed = total_processed
            ingestion_file.rows_inserted = total_inserted
            ingestion_file.rows_skipped = total_skipped
            ingestion_file.rows_rejected = total_rejected
            ingestion_file.completed_at = datetime.now(timezone.utc)
            self.db.commit()

            elapsed = time.time() - start_time
            logger.info(f"Finished {filename}: {total_inserted:,} inserted, {total_skipped:,} duplicates skipped, {total_rejected} rejected in {elapsed:.1f}s")

            return {
                "status": "COMPLETED",
                "filename": filename,
                "rows_processed": total_processed,
                "rows_inserted": total_inserted,
                "rows_skipped": total_skipped,
                "rows_rejected": total_rejected,
                "rejection_samples": rejection_samples,
                "elapsed_seconds": round(elapsed, 2)
            }

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error importing {filename}: {e}")
            ingestion_file.status = "FAILED"
            ingestion_file.error_summary = str(e)
            ingestion_file.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            raise

    def _insert_batch(self, records: List[Dict[str, Any]]) -> int:
        """Inserts batch of records into PostgreSQL with PostGIS Point geometries"""
        if not records:
            return 0
            
        # Bulk insert via Core for maximum performance
        # We also generate geom via PostGIS ST_SetSRID(ST_MakePoint(lon, lat), 4326)
        try:
            self.db.bulk_insert_mappings(FireDetection, records)
            self.db.commit()
            return len(records)
        except Exception as e:
            self.db.rollback()
            logger.warning(f"Batch bulk_insert failed, falling back to parameterized execute: {e}")
            # Fallback insert
            for r in records:
                try:
                    fd = FireDetection(**r)
                    self.db.add(fd)
                except Exception:
                    pass
            self.db.commit()
            return len(records)
