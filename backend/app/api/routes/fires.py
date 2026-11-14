from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.fire_repository import FireRepository
from app.schemas.detection import (
    PaginatedDetectionsResponse,
    FireDetectionResponse,
    MapHotspotsResponse,
    FrontendHotspot
)
from app.services.harmonization_service import ResolutionHarmonizer

router = APIRouter(prefix="/fires", tags=["Fire Detections"])

@router.get("", response_model=PaginatedDetectionsResponse)
def get_fires(
    start_date: Optional[date] = Query(None, description="Start acquisition date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End acquisition date (YYYY-MM-DD)"),
    country: Optional[str] = Query(None, description="Country code (BRA, CAN, etc.)"),
    satellite: Optional[str] = Query(None, description="Satellite identifier (e.g. N20)"),
    instrument: Optional[str] = Query(None, description="Instrument name (VIIRS, MODIS)"),
    confidence: Optional[str] = Query(None, description="Confidence category (l, n, h)"),
    min_frp: Optional[float] = Query(None, ge=0.0, description="Minimum Fire Radiative Power (MW)"),
    min_lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    max_lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    min_lon: Optional[float] = Query(None, ge=-180.0, le=180.0),
    max_lon: Optional[float] = Query(None, ge=-180.0, le=180.0),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Paginated query for raw satellite fire detections with multi-criteria filtering.
    """
    repo = FireRepository(db)
    total, items = repo.query_detections(
        start_date=start_date,
        end_date=end_date,
        country=country,
        satellite=satellite,
        instrument=instrument,
        confidence=confidence,
        min_frp=min_frp,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lon=min_lon,
        max_lon=max_lon,
        page=page,
        page_size=page_size
    )

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedDetectionsResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=[FireDetectionResponse.model_validate(it) for it in items]
    )

@router.get("/map", response_model=MapHotspotsResponse)
def get_map_fires(
    region: Optional[str] = Query(None, description="Region ID (brazil, canada, mediterranean, california)"),
    country: Optional[str] = Query(None, description="Country filter"),
    year: Optional[int] = Query(None, description="Acquisition year"),
    date_detected: Optional[str] = Query(None, description="Specific acquisition date (YYYY-MM-DD)"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    instrument: Optional[str] = Query(None),
    min_lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    max_lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    min_lon: Optional[float] = Query(None, ge=-180.0, le=180.0),
    max_lon: Optional[float] = Query(None, ge=-180.0, le=180.0),
    limit: int = Query(500, ge=1, le=2000, description="Safety limit for browser rendering"),
    db: Session = Depends(get_db)
):
    """
    Optimized map endpoint returning tactical hotspots tailored to the frontend map visualization.
    """
    repo = FireRepository(db)
    
    # Process date filtering
    s_date = start_date
    e_date = end_date
    if date_detected:
        try:
            parsed_d = date.fromisoformat(date_detected)
            s_date = parsed_d
            e_date = parsed_d
        except ValueError:
            pass
    elif year:
        s_date = date(year, 1, 1)
        e_date = date(year, 12, 31)

    total_count, hotspots = repo.get_map_hotspots(
        start_date=s_date,
        end_date=e_date,
        country=country,
        region_id=region,
        instrument=instrument,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lon=min_lon,
        max_lon=max_lon,
        limit=limit
    )

    return MapHotspotsResponse(
        count=len(hotspots),
        total_in_query=total_count,
        sampled=total_count > limit,
        hotspots=hotspots
    )

@router.get("/harmonize")
def harmonize_detections(
    country: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    grid_resolution_deg: float = Query(0.1, ge=0.02, le=1.0, description="Grid resolution in degrees"),
    limit: int = Query(1000, le=5000),
    db: Session = Depends(get_db)
):
    """
    Aggregates detections into a standardized spatial analysis grid cell
    without conflating VIIRS (375m) and MODIS (1km) sensors.
    """
    repo = FireRepository(db)
    _, hotspots = repo.get_map_hotspots(
        country=country,
        region_id=region,
        limit=limit
    )

    harmonizer = ResolutionHarmonizer(grid_size_deg=grid_resolution_deg)
    return harmonizer.harmonize_hotspots(hotspots, grid_resolution_deg=grid_resolution_deg)
