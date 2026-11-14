from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "healthy"})
    version: str = Field(..., json_schema_extra={"example": "1.0.0"})
    environment: str = Field(..., json_schema_extra={"example": "development"})
    timestamp: str

class DatabaseHealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "connected"})
    database: str = Field(..., json_schema_extra={"example": "fire_intelligence"})
    postgis_version: Optional[str] = None
    tables_count: int
    detections_count: int
    countries_count: int

class MetadataResponse(BaseModel):
    project_name: str
    geographic_coverage: list[str]
    sensors: list[str]
    date_coverage: Dict[str, str]
    total_detections: int
    operational_db: str
    analytical_engine: str
