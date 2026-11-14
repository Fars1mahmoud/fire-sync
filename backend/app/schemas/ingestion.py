from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class IngestionFileSummary(BaseModel):
    id: int
    filename: str
    country_code: str
    file_size_bytes: int
    status: str
    rows_processed: int
    rows_inserted: int
    rows_skipped: int
    rows_rejected: int
    error_summary: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class IngestionStatusResponse(BaseModel):
    total_files: int
    completed_files: int
    failed_files: int
    processing_files: int
    total_rows_imported: int
    total_rows_rejected: int
    files: List[IngestionFileSummary]

class IngestionJobResponse(BaseModel):
    job_id: str
    status: str
    message: str
