from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict

class LatLng(BaseModel):
    lat: float
    lng: float

class RegionBase(BaseModel):
    id: str
    country_code: Optional[str] = None
    name_en: str
    name_ar: Optional[str] = None
    flag: Optional[str] = "🔥"
    center_lat: float
    center_lon: float
    default_zoom: int = 5
    bounds_sw_lat: Optional[float] = None
    bounds_sw_lon: Optional[float] = None
    bounds_ne_lat: Optional[float] = None
    bounds_ne_lon: Optional[float] = None
    risk_baseline: str = "Moderate"
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    geojson_polygon: Optional[Dict[str, Any]] = None

class RegionCreate(RegionBase):
    pass

class RegionResponse(RegionBase):
    active_fires_count: Optional[int] = 0
    recent_frp_mw: Optional[float] = 0.0
    model_config = ConfigDict(from_attributes=True)
