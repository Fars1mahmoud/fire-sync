from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import IngestionFile
from app.schemas.ingestion import IngestionStatusResponse, IngestionFileSummary

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Provenance"])

@router.get("/status", response_model=IngestionStatusResponse)
def get_ingestion_status(db: Session = Depends(get_db)):
    """Retrieves ingestion manifest status, file fingerprints, and data provenance counts"""
    files = db.query(IngestionFile).order_by(IngestionFile.id).all()
    
    total_files = len(files)
    completed_files = sum(1 for f in files if f.status == "COMPLETED")
    failed_files = sum(1 for f in files if f.status == "FAILED")
    processing_files = sum(1 for f in files if f.status == "PROCESSING")
    
    total_inserted = sum(f.rows_inserted for f in files)
    total_rejected = sum(f.rows_rejected for f in files)

    return IngestionStatusResponse(
        total_files=total_files,
        completed_files=completed_files,
        failed_files=failed_files,
        processing_files=processing_files,
        total_rows_imported=total_inserted,
        total_rows_rejected=total_rejected,
        files=[IngestionFileSummary.model_validate(f) for f in files]
    )

@router.get("/jobs")
def get_ingestion_jobs(db: Session = Depends(get_db)):
    """Lists current and completed ingestion operations"""
    recent = db.query(IngestionFile).order_by(IngestionFile.id.desc()).limit(20).all()
    return [
        {
            "job_id": f"INGEST-{f.id}",
            "filename": f.filename,
            "country": f.country_code,
            "status": f.status,
            "rows_inserted": f.rows_inserted,
            "rows_rejected": f.rows_rejected,
            "started_at": f.started_at,
            "completed_at": f.completed_at
        }
        for f in recent
    ]
