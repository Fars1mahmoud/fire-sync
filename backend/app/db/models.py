import datetime
from typing import Optional, Any, Dict
from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    Float,
    String,
    Date,
    DateTime,
    ForeignKey,
    Text,
    Index,
    JSON,
    func
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

JSON_TYPE = JSON().with_variant(JSONB, "postgresql")

import os
try:
    from app.core.config import settings
    _IS_POSTGRES = "postgresql" in settings.DATABASE_URL.lower()
except Exception:
    _IS_POSTGRES = True

# Try importing GeoAlchemy2, fall back gracefully if needed
try:
    from geoalchemy2 import Geometry
    HAS_GEOALCHEMY = True and _IS_POSTGRES and (os.environ.get("TESTING") != "1")
except ImportError:
    Geometry = None
    HAS_GEOALCHEMY = False

from app.db.session import Base


class Country(Base):
    __tablename__ = "countries"

    iso_code = Column(String(3), primary_key=True, index=True) # e.g. "BRA", "CAN", "GRC", "USA"
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    regions = relationship("Region", back_populates="country", cascade="all, delete-orphan")
    ingestion_files = relationship("IngestionFile", back_populates="country")
    detections = relationship("FireDetection", back_populates="country")


class Region(Base):
    __tablename__ = "regions"

    id = Column(String(50), primary_key=True, index=True) # e.g. "brazil", "canada", "mediterranean", "california"
    country_code = Column(String(3), ForeignKey("countries.iso_code", ondelete="SET NULL"), nullable=True, index=True)
    name_en = Column(String(100), nullable=False)
    name_ar = Column(String(150), nullable=True)
    flag = Column(String(10), nullable=True)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    default_zoom = Column(Integer, default=5, nullable=False)
    bounds_sw_lat = Column(Float, nullable=True)
    bounds_sw_lon = Column(Float, nullable=True)
    bounds_ne_lat = Column(Float, nullable=True)
    bounds_ne_lon = Column(Float, nullable=True)
    risk_baseline = Column(String(20), default="Moderate", nullable=False)
    description_en = Column(Text, nullable=True)
    description_ar = Column(Text, nullable=True)
    geojson_polygon = Column(JSON_TYPE, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    country = relationship("Country", back_populates="regions")


class SatelliteSource(Base):
    __tablename__ = "satellite_sources"

    id = Column(String(50), primary_key=True, index=True) # e.g. "VIIRS_N20", "MODIS_TERRA"
    satellite = Column(String(50), nullable=False, index=True)
    instrument = Column(String(50), nullable=False, index=True)
    provider = Column(String(100), default="NASA FIRMS", nullable=False)
    product_id = Column(String(100), nullable=True)
    spatial_resolution_m = Column(Float, default=375.0, nullable=False)
    version = Column(String(20), default="2", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class IngestionFile(Base):
    __tablename__ = "ingestion_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False, index=True)
    file_path = Column(Text, nullable=False)
    file_checksum = Column(String(64), unique=True, nullable=False, index=True) # SHA-256
    country_code = Column(String(3), ForeignKey("countries.iso_code"), nullable=False, index=True)
    file_size_bytes = Column(BigInteger().with_variant(Integer, "sqlite"), nullable=False)
    status = Column(String(20), default="PENDING", nullable=False, index=True) # PENDING, PROCESSING, COMPLETED, FAILED, PARTIAL
    rows_processed = Column(Integer, default=0, nullable=False)
    rows_inserted = Column(Integer, default=0, nullable=False)
    rows_skipped = Column(Integer, default=0, nullable=False)
    rows_rejected = Column(Integer, default=0, nullable=False)
    error_summary = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    country = relationship("Country", back_populates="ingestion_files")
    rejected_rows = relationship("RejectedRow", back_populates="file", cascade="all, delete-orphan")
    detections = relationship("FireDetection", back_populates="source_file")


class RejectedRow(Base):
    __tablename__ = "rejected_rows"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("ingestion_files.id", ondelete="CASCADE"), nullable=False, index=True)
    row_number = Column(Integer, nullable=False)
    raw_payload = Column(Text, nullable=False)
    rejection_reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    file = relationship("IngestionFile", back_populates="rejected_rows")


class FireDetection(Base):
    __tablename__ = "fire_detections"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    country_code = Column(String(3), ForeignKey("countries.iso_code"), nullable=False, index=True)
    file_id = Column(Integer, ForeignKey("ingestion_files.id", ondelete="SET NULL"), nullable=True, index=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # PostGIS geometry column
    if HAS_GEOALCHEMY:
        geom = Column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True), nullable=True)
    else:
        geom = None

    acq_date = Column(Date, nullable=False, index=True)
    acq_time = Column(String(4), nullable=False) # e.g. "0330", "1415"
    satellite = Column(String(50), nullable=False, index=True)
    instrument = Column(String(50), nullable=False, index=True)
    confidence = Column(String(10), nullable=False, index=True) # 'l', 'n', 'h', or numeric 0-100
    confidence_numeric = Column(Float, nullable=True) # Normalized 0-100%

    bright_ti4 = Column(Float, nullable=True)
    bright_ti5 = Column(Float, nullable=True)
    scan = Column(Float, nullable=True)
    track = Column(Float, nullable=True)
    frp = Column(Float, nullable=True, index=True)
    daynight = Column(String(1), nullable=True) # 'D' or 'N'
    detection_type = Column(Integer, default=0, nullable=False, index=True) # 0=veg, 1=volcano, 2=static, 3=offshore
    version = Column(String(20), default="2", nullable=False)

    raw_properties = Column(JSON_TYPE, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    country = relationship("Country", back_populates="detections")
    source_file = relationship("IngestionFile", back_populates="detections")

    __table_args__ = (
        Index("ix_fire_detections_country_date", "country_code", "acq_date"),
        Index("ix_fire_detections_date_frp", "acq_date", "frp"),
        Index("ix_fire_detections_lat_lon", "latitude", "longitude"),
        Index("ix_fire_detections_dedup", "latitude", "longitude", "acq_date", "acq_time", "satellite"),
    )
