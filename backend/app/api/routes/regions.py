from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Region, FireDetection
from app.schemas.region import RegionResponse, RegionCreate
from app.repositories.fire_repository import FireRepository
from app.schemas.detection import FrontendHotspot

router = APIRouter(prefix="/regions", tags=["Monitoring Regions"])

@router.get("", response_model=List[RegionResponse])
def list_regions(db: Session = Depends(get_db)):
    """Lists all configured monitoring regions with live active fire counts"""
    regions = db.query(Region).order_by(Region.id).all()
    results = []
    for r in regions:
        # Calculate active fire count within region bounds
        q = db.query(FireDetection)
        if r.bounds_sw_lat is not None and r.bounds_ne_lat is not None:
            q = q.filter(FireDetection.latitude.between(r.bounds_sw_lat, r.bounds_ne_lat))
        if r.bounds_sw_lon is not None and r.bounds_ne_lon is not None:
            q = q.filter(FireDetection.longitude.between(r.bounds_sw_lon, r.bounds_ne_lon))
        if r.country_code:
            q = q.filter(FireDetection.country_code == r.country_code)
        
        cnt = q.count()
        resp = RegionResponse.model_validate(r)
        resp.active_fires_count = cnt
        results.append(resp)
    return results

@router.get("/{region_id}", response_model=RegionResponse)
def get_region(region_id: str, db: Session = Depends(get_db)):
    """Retrieves metadata and bounding box for a specific monitoring region"""
    r = db.query(Region).filter(Region.id == region_id.lower()).first()
    if not r:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    
    q = db.query(FireDetection)
    if r.bounds_sw_lat is not None and r.bounds_ne_lat is not None:
        q = q.filter(FireDetection.latitude.between(r.bounds_sw_lat, r.bounds_ne_lat))
    if r.bounds_sw_lon is not None and r.bounds_ne_lon is not None:
        q = q.filter(FireDetection.longitude.between(r.bounds_sw_lon, r.bounds_ne_lon))
    if r.country_code:
        q = q.filter(FireDetection.country_code == r.country_code)

    resp = RegionResponse.model_validate(r)
    resp.active_fires_count = q.count()
    return resp

@router.get("/{region_id}/fires", response_model=List[FrontendHotspot])
def get_region_fires(
    region_id: str,
    limit: int = Query(500, le=2000),
    db: Session = Depends(get_db)
):
    """Retrieves hotspot observations within the boundaries of a monitoring region"""
    repo = FireRepository(db)
    _, hotspots = repo.get_map_hotspots(region_id=region_id, limit=limit)
    return hotspots

@router.post("", response_model=RegionResponse)
def create_custom_region(payload: RegionCreate, db: Session = Depends(get_db)):
    """Registers a new custom geographic monitoring region"""
    existing = db.query(Region).filter(Region.id == payload.id.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Region ID '{payload.id}' already exists")

    new_reg = Region(
        id=payload.id.lower(),
        country_code=payload.country_code,
        name_en=payload.name_en,
        name_ar=payload.name_ar,
        flag=payload.flag,
        center_lat=payload.center_lat,
        center_lon=payload.center_lon,
        default_zoom=payload.default_zoom,
        bounds_sw_lat=payload.bounds_sw_lat,
        bounds_sw_lon=payload.bounds_sw_lon,
        bounds_ne_lat=payload.bounds_ne_lat,
        bounds_ne_lon=payload.bounds_ne_lon,
        risk_baseline=payload.risk_baseline,
        description_en=payload.description_en,
        description_ar=payload.description_ar,
        geojson_polygon=payload.geojson_polygon
    )
    db.add(new_reg)
    db.commit()
    db.refresh(new_reg)
    return RegionResponse.model_validate(new_reg)
