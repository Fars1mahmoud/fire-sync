from typing import Optional, List, Any, Dict
from datetime import date
from pydantic import BaseModel, Field, ConfigDict

class FireDetectionBase(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    acq_date: date
    acq_time: str = Field(..., max_length=4)
    satellite: str
    instrument: str
    confidence: str
    confidence_numeric: Optional[float] = None
    bright_ti4: Optional[float] = None
    bright_ti5: Optional[float] = None
    scan: Optional[float] = None
    track: Optional[float] = None
    frp: Optional[float] = None
    daynight: Optional[str] = None
    detection_type: int = 0
    country_code: str

class FireDetectionResponse(FireDetectionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Frontend-compatible Hotspot item matching the existing frontend interface
class FrontendHotspot(BaseModel):
    id: str
    name: str
    country: str
    stateOrRegion: str
    lat: float
    lon: float
    frp: float
    tempK: float
    confidence: float
    satellite: str # 'VIIRS' | 'MODIS'
    status: str # 'Critical' | 'High' | 'Contained'
    acres: float
    timeDetected: str
    dateDetected: str
    region: str
    year: int
    dayOfYear: int
    normalizedAreaWeight: Optional[float] = 1.0

class PaginatedDetectionsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[FireDetectionResponse]

class MapHotspotsResponse(BaseModel):
    count: int
    total_in_query: int
    sampled: bool
    hotspots: List[FrontendHotspot]
