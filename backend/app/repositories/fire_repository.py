from typing import List, Optional, Tuple, Dict, Any
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func, select, and_, or_, desc

from app.db.models import FireDetection, Region, Country
from app.schemas.detection import FrontendHotspot

class FireRepository:
    def __init__(self, db: Session):
        self.db = db

    def query_detections(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        country: Optional[str] = None,
        satellite: Optional[str] = None,
        instrument: Optional[str] = None,
        confidence: Optional[str] = None,
        min_frp: Optional[float] = None,
        min_lat: Optional[float] = None,
        max_lat: Optional[float] = None,
        min_lon: Optional[float] = None,
        max_lon: Optional[float] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[int, List[FireDetection]]:
        filters = []

        if start_date:
            filters.append(FireDetection.acq_date >= start_date)
        if end_date:
            filters.append(FireDetection.acq_date <= end_date)
        if country:
            c_code = country.upper()
            if c_code in ("BRAZIL", "BR"):
                c_code = "BRA"
            elif c_code in ("CANADA", "CA"):
                c_code = "CAN"
            filters.append(FireDetection.country_code == c_code)
        if satellite:
            filters.append(FireDetection.satellite.ilike(f"%{satellite}%"))
        if instrument:
            filters.append(FireDetection.instrument.ilike(f"%{instrument}%"))
        if confidence:
            filters.append(FireDetection.confidence == confidence.lower())
        if min_frp is not None:
            filters.append(FireDetection.frp >= min_frp)

        # Bounding box filter
        if min_lat is not None and max_lat is not None:
            filters.append(FireDetection.latitude.between(min_lat, max_lat))
        if min_lon is not None and max_lon is not None:
            filters.append(FireDetection.longitude.between(min_lon, max_lon))

        query = self.db.query(FireDetection)
        if filters:
            query = query.filter(and_(*filters))

        total = query.count()
        offset = (page - 1) * page_size
        items = query.order_by(desc(FireDetection.acq_date), desc(FireDetection.frp)).offset(offset).limit(page_size).all()

        return total, items

    def get_map_hotspots(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        country: Optional[str] = None,
        region_id: Optional[str] = None,
        instrument: Optional[str] = None,
        min_lat: Optional[float] = None,
        max_lat: Optional[float] = None,
        min_lon: Optional[float] = None,
        max_lon: Optional[float] = None,
        limit: int = 500
    ) -> Tuple[int, List[FrontendHotspot]]:
        filters = []

        if start_date:
            filters.append(FireDetection.acq_date >= start_date)
        if end_date:
            filters.append(FireDetection.acq_date <= end_date)

        # Region resolution
        if region_id and region_id.lower() != "global":
            reg = self.db.query(Region).filter(Region.id == region_id.lower()).first()
            if reg:
                if reg.bounds_sw_lat is not None and reg.bounds_ne_lat is not None:
                    filters.append(FireDetection.latitude.between(reg.bounds_sw_lat, reg.bounds_ne_lat))
                if reg.bounds_sw_lon is not None and reg.bounds_ne_lon is not None:
                    filters.append(FireDetection.longitude.between(reg.bounds_sw_lon, reg.bounds_ne_lon))
                if reg.country_code:
                    filters.append(FireDetection.country_code == reg.country_code)

        if country:
            c_code = country.upper()
            if c_code in ("BRAZIL", "BR"):
                c_code = "BRA"
            elif c_code in ("CANADA", "CA"):
                c_code = "CAN"
            elif c_code in ("EGYPT", "EG"):
                c_code = "EGY"
            filters.append(FireDetection.country_code == c_code)

        if instrument:
            filters.append(FireDetection.instrument.ilike(f"%{instrument}%"))

        if min_lat is not None and max_lat is not None:
            filters.append(FireDetection.latitude.between(min_lat, max_lat))
        if min_lon is not None and max_lon is not None:
            filters.append(FireDetection.longitude.between(min_lon, max_lon))

        query = self.db.query(FireDetection)
        if filters:
            query = query.filter(and_(*filters))

        total_matching = query.count()
        # Order by highest FRP and latest date for high tactical relevance
        rows = query.order_by(desc(FireDetection.frp), desc(FireDetection.acq_date)).limit(limit).all()

        hotspots = []
        for r in rows:
            # Map database record into FrontendHotspot format
            frp = round(r.frp or 0.0, 1)
            tempK = round(r.bright_ti4 or 330.0, 1)
            conf_pct = r.confidence_numeric if r.confidence_numeric is not None else (
                95.0 if r.confidence == 'h' else (70.0 if r.confidence == 'n' else 35.0)
            )
            status = "Critical" if frp >= 200 else ("High" if frp >= 50 else "Contained")
            # Estimated nominal thermal plume area (acres proportional to FRP)
            acres = round(frp * 25.5, 0)
            
            c_name = "Brazil" if r.country_code == "BRA" else ("Canada" if r.country_code == "CAN" else ("Egypt" if r.country_code == "EGY" else r.country_code))
            region_label = "Amazon Biome" if r.country_code == "BRA" else ("Boreal Belt" if r.country_code == "CAN" else ("Nile Delta & Coast" if r.country_code == "EGY" else r.country_code))

            time_str = f"{r.acq_time[:2]}:{r.acq_time[2:]} UTC" if len(r.acq_time) == 4 else f"{r.acq_time} UTC"

            hotspots.append(FrontendHotspot(
                id=f"HOT-{r.country_code}-{r.id}",
                name=f"{c_name} Fire Cluster #{r.id} ({frp} MW)",
                country=c_name,
                stateOrRegion=region_label,
                lat=r.latitude,
                lon=r.longitude,
                frp=frp,
                tempK=tempK,
                confidence=conf_pct,
                satellite=r.instrument, # VIIRS or MODIS
                status=status,
                acres=acres,
                timeDetected=time_str,
                dateDetected=str(r.acq_date),
                region=c_name,
                year=r.acq_date.year,
                dayOfYear=r.acq_date.timetuple().tm_yday,
                normalizedAreaWeight=1.0
            ))

        return total_matching, hotspots
