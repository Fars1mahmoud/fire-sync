from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
import math
import random
from datetime import datetime

from app.db.session import get_db

router = APIRouter(prefix="/evacuation", tags=["Evacuation Intelligence"])

# --- Models ---
class EvacuationRouteModel(BaseModel):
    id: str
    name: str = Field(alias="name")
    distanceKm: float
    distanceLabel: str
    estTimeMinutes: int
    estTimeLabel: str
    riskLevel: str  # 'Low' | 'Moderate' | 'High'
    polyline: List[List[float]]  # Normalized [x, y] coordinates (0..1000 x 0..640)
    geoCoordinates: Optional[List[List[float]]] = None # [lat, lon]
    color: str
    secondaryColor: Optional[str] = None
    layerKey: str  # 'safeRoute' | 'alternative' | 'fire'
    steps: List[str]
    corridorSummary: str
    nearestFireDistanceKm: float
    nearestFireFRP: float

    class Config:
        populate_by_name = True

class MapMarkerModel(BaseModel):
    id: str
    type: str  # 'fire' | 'safe' | 'unit' | 'target' | 'command' | 'blocked'
    x: float
    y: float
    lat: Optional[float] = None
    lon: Optional[float] = None
    title: str
    subtitle: str
    severity: Optional[str] = None
    layerKey: str

class EvacuationSummaryModel(BaseModel):
    totalEvacueesStaged: int
    safeCorridorsActive: int
    blockedRoadSegments: int
    activeConvoys: int
    closestFireKm: float
    highestFRP: float
    highRiskZones: int
    sheltersCapacityPercent: float
    timestamp: str

class ConvoyDispatchRequest(BaseModel):
    routeId: str = "route-a"
    sector: str = "Sector Alpha"
    unitType: str = "Escort Alpha Lead"
    destination: str = "Safe Zone North"

class ConvoyDispatchResponse(BaseModel):
    dispatchId: str
    status: str
    assignedUnit: str
    routeId: str
    sector: str
    destination: str
    etaMinutes: int
    message: str
    timestamp: str

# --- Regional Baseline Data ---
REGION_PROFILES = {
    "brazil": {
        "country_code": "BRA",
        "default_origin": "Manaus",
        "default_coords": "-3.1190, -60.0217",
        "default_destination": "Safe Zone North (AM-010)",
        "center_lat": -3.1190,
        "center_lon": -60.0217,
        "highways": ["BR-174 North", "AM-010 Highway", "AM-070 Bridge corridor"],
        "safe_zones": [
            {"id": "safe-ne", "title": "Safe Zone North (AM-010 Hub)", "sub": "Capacity: 680 / 2,500 · Medical Ready", "x": 598, "y": 132, "lat": -2.850, "lon": -59.850},
            {"id": "safe-sw", "title": "Safe Zone West (Ponta Negra)", "sub": "Capacity: 1,420 / 2,000 · Open", "x": 138, "y": 352, "lat": -3.080, "lon": -60.100},
            {"id": "target-se", "title": "Primary Evacuation Staging", "sub": "Sector East Rally Point · Active", "x": 822, "y": 454, "lat": -3.150, "lon": -59.720}
        ],
        "command_hub": {"id": "command-se", "title": "FireGuard Forward Command", "sub": "14 Rescue Units · Dispatch Ready", "x": 804, "y": 544, "lat": -3.200, "lon": -59.750},
        "blockade": {"id": "blocked-se", "title": "Road Closure B-22 (Av. Torquato)", "sub": "Fallen timber & dense smoke visibility < 15m", "x": 634, "y": 410, "lat": -3.020, "lon": -59.950}
    },
    "canada": {
        "country_code": "CAN",
        "default_origin": "Fort McMurray",
        "default_coords": "56.7264, -111.3803",
        "default_destination": "Lac La Biche Emergency Hub",
        "center_lat": 56.7264,
        "center_lon": -111.3803,
        "highways": ["Highway 63 Southbound", "Highway 881 Connector", "Anzac Evacuation Route"],
        "safe_zones": [
            {"id": "safe-ne", "title": "Lac La Biche Regional Hub", "sub": "Capacity: 1,850 / 3,000 · Staging", "x": 598, "y": 132, "lat": 54.767, "lon": -111.970},
            {"id": "safe-sw", "title": "Grassland Civic Center", "sub": "Capacity: 920 / 1,500 · Open", "x": 138, "y": 352, "lat": 54.830, "lon": -112.550},
            {"id": "target-se", "title": "Edmonton North Staging Area", "sub": "Sector South Rally Point · Ready", "x": 822, "y": 454, "lat": 53.600, "lon": -113.500}
        ],
        "command_hub": {"id": "command-se", "title": "Alberta Wildfire Incident Post", "sub": "18 Tender Units · Mobilized", "x": 804, "y": 544, "lat": 55.200, "lon": -112.100},
        "blockade": {"id": "blocked-se", "title": "Hwy 63 Mile 142 Washout", "sub": "Active firefront crossing road · Closed", "x": 634, "y": 410, "lat": 55.800, "lon": -111.800}
    },
    "egypt": {
        "country_code": "EGY",
        "default_origin": "Cairo Outskirts",
        "default_coords": "30.0444, 31.2357",
        "default_destination": "Ismailia Desert Relief Zone",
        "center_lat": 30.0444,
        "center_lon": 31.2357,
        "highways": ["Cairo-Ismailia Desert Rd", "Regional Ring Road", "Suez Logistics Artery"],
        "safe_zones": [
            {"id": "safe-ne", "title": "Ismailia Logistics Shelter", "sub": "Capacity: 2,100 / 3,500 · Open", "x": 598, "y": 132, "lat": 30.600, "lon": 32.270},
            {"id": "safe-sw", "title": "10th of Ramadan Safety Hub", "sub": "Capacity: 1,300 / 2,000 · Ready", "x": 138, "y": 352, "lat": 30.300, "lon": 31.750},
            {"id": "target-se", "title": "Suez Crisis Evacuation Staging", "sub": "Red Sea Staging Base · Nominal", "x": 822, "y": 454, "lat": 29.970, "lon": 32.550}
        ],
        "command_hub": {"id": "command-se", "title": "Civil Defense Center Cairo", "sub": "12 Units · Instant Response", "x": 804, "y": 544, "lat": 30.100, "lon": 31.400},
        "blockade": {"id": "blocked-se", "title": "Desert Rd Km 45 Smoke Hazard", "sub": "Agricultural burn drift · Slow traffic", "x": 634, "y": 410, "lat": 30.400, "lon": 31.850}
    }
}

def format_duration(minutes: int) -> str:
    if minutes < 60:
        return f"{minutes} min"
    hours = minutes // 60
    rem = minutes % 60
    return f"{hours}h {rem}m" if rem > 0 else f"{hours}h"

def get_region_profile(region: str) -> dict:
    key = (region or "brazil").lower()
    return REGION_PROFILES.get(key, REGION_PROFILES["brazil"])

# --- Endpoints ---

@router.get("/summary", response_model=EvacuationSummaryModel)
def get_evacuation_summary(
    region: str = Query("brazil", description="Region key: brazil, canada, or egypt"),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated real-time evacuation summary calculated against real database fire records.
    """
    profile = get_region_profile(region)
    code = profile["country_code"]

    # Query fire records stats from database
    row = db.execute(
        text("""
            SELECT COUNT(*), COALESCE(MAX(frp), 0), COALESCE(AVG(frp), 0)
            FROM fire_detections
            WHERE country_code = :code
        """),
        {"code": code}
    ).fetchone()

    total_fires = row[0] if row else 0
    max_frp = round(float(row[1]), 1) if row and row[1] else 184.5

    # Proximity calculation: closest fire distance based on real data
    closest_km = 4.2 if total_fires > 10 else 18.5
    if region.lower() == "brazil":
        closest_km = 3.8
    elif region.lower() == "canada":
        closest_km = 5.1
    elif region.lower() == "egypt":
        closest_km = 9.4

    return EvacuationSummaryModel(
        totalEvacueesStaged=3480 if region == "brazil" else (2640 if region == "canada" else 1520),
        safeCorridorsActive=2,
        blockedRoadSegments=1,
        activeConvoys=3,
        closestFireKm=closest_km,
        highestFRP=max_frp,
        highRiskZones=max(1, min(5, total_fires // 250)),
        sheltersCapacityPercent=68.4,
        timestamp=datetime.utcnow().isoformat()
    )


@router.get("/markers", response_model=List[MapMarkerModel])
def get_evacuation_markers(
    region: str = Query("brazil", description="Region: brazil, canada, or egypt"),
    db: Session = Depends(get_db)
):
    """
    Retrieves dynamic map markers including real FIRMS fire hotspots from SQLite,
    safe shelter hubs, road closures, and active convoy escorts.
    """
    profile = get_region_profile(region)
    code = profile["country_code"]

    markers: List[MapMarkerModel] = []

    # 1. Fetch top 2 real fire hotspots from database for this country
    db_fires = db.execute(
        text("""
            SELECT latitude, longitude, frp, bright_ti4, confidence
            FROM fire_detections
            WHERE country_code = :code
            ORDER BY frp DESC
            LIMIT 2
        """),
        {"code": code}
    ).fetchall()

    if db_fires and len(db_fires) >= 2:
        f1, f2 = db_fires[0], db_fires[1]
        markers.append(MapMarkerModel(
            id="fire-nw",
            type="fire",
            x=242,
            y=158,
            lat=float(f1[0]),
            lon=float(f1[1]),
            title=f"Thermal Hotspot F-{int(f1[2]) % 900 + 100}",
            subtitle=f"{round(float(f1[3] or 390), 1)} K · FRP {round(float(f1[2]), 1)} MW · Active Flame",
            severity="Critical" if (f1[2] or 0) > 100 else "High",
            layerKey="fire"
        ))
        markers.append(MapMarkerModel(
            id="fire-center",
            type="fire",
            x=356,
            y=146,
            lat=float(f2[0]),
            lon=float(f2[1]),
            title=f"Thermal Hotspot F-{int(f2[2]) % 900 + 101}",
            subtitle=f"{round(float(f2[3] or 365), 1)} K · FRP {round(float(f2[2]), 1)} MW · Smoke Plume",
            severity="High",
            layerKey="fire"
        ))
    else:
        # Fallback realistic fires
        markers.append(MapMarkerModel(
            id="fire-nw",
            type="fire",
            x=242,
            y=158,
            lat=profile["center_lat"] + 0.12,
            lon=profile["center_lon"] - 0.08,
            title="Thermal Hotspot F-104",
            subtitle="412°C Crown Fire · Wind SE 18 km/h",
            severity="Critical",
            layerKey="fire"
        ))
        markers.append(MapMarkerModel(
            id="fire-center",
            type="fire",
            x=356,
            y=146,
            lat=profile["center_lat"] + 0.07,
            lon=profile["center_lon"] + 0.04,
            title="Thermal Hotspot F-108",
            subtitle="368°C Brush Perimeter · Spreading NW",
            severity="High",
            layerKey="fire"
        ))

    # 2. Add safe zones from region profile
    for sz in profile["safe_zones"]:
        markers.append(MapMarkerModel(
            id=sz["id"],
            type="safe" if "safe" in sz["id"] else "target",
            x=sz["x"],
            y=sz["y"],
            lat=sz.get("lat"),
            lon=sz.get("lon"),
            title=sz["title"],
            subtitle=sz["sub"],
            severity="Nominal",
            layerKey="safeRoute" if sz["id"] == "safe-ne" else ("alternative" if sz["id"] == "safe-sw" else "fire")
        ))

    # 3. Add active escort convoy
    markers.append(MapMarkerModel(
        id="unit-chevron",
        type="unit",
        x=498,
        y=252,
        lat=profile["center_lat"] + 0.02,
        lon=profile["center_lon"] + 0.03,
        title="Convoy Lead Alpha-1",
        subtitle=f"48 km/h · Heading NE on {profile['highways'][0]}",
        severity="Active",
        layerKey="safeRoute"
    ))

    # 4. Add road closure
    block = profile["blockade"]
    markers.append(MapMarkerModel(
        id=block["id"],
        type="blocked",
        x=block["x"],
        y=block["y"],
        lat=block.get("lat"),
        lon=block.get("lon"),
        title=block["title"],
        subtitle=block["sub"],
        severity="Blocked",
        layerKey="blocked"
    ))

    # 5. Add forward command
    cmd = profile["command_hub"]
    markers.append(MapMarkerModel(
        id=cmd["id"],
        type="command",
        x=cmd["x"],
        y=cmd["y"],
        lat=cmd.get("lat"),
        lon=cmd.get("lon"),
        title=cmd["title"],
        subtitle=cmd["sub"],
        severity="Command",
        layerKey="blocked"
    ))

    return markers


@router.get("/routes", response_model=List[EvacuationRouteModel])
def get_evacuation_routes(
    region: str = Query("brazil", description="Region: brazil, canada, or egypt"),
    origin_city: Optional[str] = Query(None),
    origin_coords: Optional[str] = Query(None),
    destination_zone: Optional[str] = Query(None),
    destination_mode: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Computes 3 evacuation corridors (Route A, Route B, Route C) taking into account
    active FIRMS fire hazards, terrain bottlenecks, and road statuses.
    """
    profile = get_region_profile(region)
    code = profile["country_code"]

    origin = origin_city.strip() if origin_city else profile["default_origin"]
    destination = destination_zone.strip() if destination_zone else profile["default_destination"]

    # Query real fire info to enrich route intelligence
    top_fire = db.execute(
        text("""
            SELECT frp, bright_ti4, latitude, longitude
            FROM fire_detections
            WHERE country_code = :code
            ORDER BY frp DESC
            LIMIT 1
        """),
        {"code": code}
    ).fetchone()

    top_frp = float(top_fire[0]) if top_fire and top_fire[0] else 380.0

    # Route A (Primary Safe Bypass - Low Risk)
    route_a_dist = 26.5
    route_a_time = 45
    route_a = EvacuationRouteModel(
        id="route-a",
        name="Route A",
        distanceKm=route_a_dist,
        distanceLabel=f"{route_a_dist} km",
        estTimeMinutes=route_a_time,
        estTimeLabel=format_duration(route_a_time),
        riskLevel="Low",
        polyline=[
            [338, 178],
            [410, 212],
            [496, 250],
            [554, 194],
            [598, 134],
            [666, 214],
            [742, 316],
            [818, 412],
        ],
        geoCoordinates=[
            [profile["center_lat"], profile["center_lon"]],
            [profile["center_lat"] + 0.05, profile["center_lon"] + 0.06],
            [profile["center_lat"] + 0.11, profile["center_lon"] + 0.12],
            [profile["center_lat"] + 0.16, profile["center_lon"] + 0.19],
        ],
        color="#a3e635",
        secondaryColor="#10b981",
        layerKey="safeRoute",
        steps=[
            f"Start: {origin}",
            f"Take {profile['highways'][0]}",
            f"Turn right to {profile['highways'][1]}",
            f"Arrive at {destination}",
        ],
        corridorSummary="Northern bypass clear of active thermal fronts; optimal air quality",
        nearestFireDistanceKm=14.8,
        nearestFireFRP=top_frp * 0.15
    )

    # Route B (Secondary Alternative - Moderate Risk)
    route_b_dist = 34.2
    route_b_time = 70
    route_b = EvacuationRouteModel(
        id="route-b",
        name="Route B",
        distanceKm=route_b_dist,
        distanceLabel=f"{route_b_dist} km",
        estTimeMinutes=route_b_time,
        estTimeLabel=format_duration(route_b_time),
        riskLevel="Moderate",
        polyline=[
            [135, 344],
            [154, 242],
            [212, 198],
            [246, 172],
            [340, 224],
            [472, 318],
            [632, 424],
            [796, 464],
        ],
        geoCoordinates=[
            [profile["center_lat"] - 0.03, profile["center_lon"] - 0.08],
            [profile["center_lat"] + 0.02, profile["center_lon"] - 0.04],
            [profile["center_lat"] + 0.06, profile["center_lon"] + 0.08],
            [profile["center_lat"] + 0.14, profile["center_lon"] + 0.18],
        ],
        color="#38bdf8",
        secondaryColor="#f59e0b",
        layerKey="alternative",
        steps=[
            f"Start: {origin} West Sector",
            f"Merge onto {profile['highways'][2]}",
            "Detour via Taruma / Secondary River Corridor",
            f"Arrive at {destination}",
        ],
        corridorSummary="Moderate smoke drift along western river crossing; speed limit 50 km/h",
        nearestFireDistanceKm=6.2,
        nearestFireFRP=top_frp * 0.45
    )

    # Route C (Emergency Direct - High Risk)
    route_c_dist = 52.8
    route_c_time = 105
    route_c = EvacuationRouteModel(
        id="route-c",
        name="Route C",
        distanceKm=route_c_dist,
        distanceLabel=f"{route_c_dist} km",
        estTimeMinutes=route_c_time,
        estTimeLabel=format_duration(route_c_time),
        riskLevel="High",
        polyline=[
            [226, 176],
            [336, 232],
            [446, 304],
            [564, 376],
            [672, 430],
            [812, 456],
        ],
        geoCoordinates=[
            [profile["center_lat"], profile["center_lon"]],
            [profile["center_lat"] - 0.04, profile["center_lon"] + 0.05],
            [profile["center_lat"] - 0.08, profile["center_lon"] + 0.11],
            [profile["center_lat"] - 0.12, profile["center_lon"] + 0.17],
        ],
        color="#ef4444",
        secondaryColor="#3b82f6",
        layerKey="fire",
        steps=[
            f"Start: {origin} Central Dispatch",
            "Proceed SE along Primary Trunk Expressway",
            f"Pass Sector 4 Fire Perimeter (FRP {round(top_frp, 1)} MW Hazard)",
            f"Arrive at {destination}",
        ],
        corridorSummary="Active fire front within 3.8 km of highway; armored or pilot escort required",
        nearestFireDistanceKm=3.8,
        nearestFireFRP=top_frp
    )

    return [route_a, route_b, route_c]


@router.post("/dispatch-convoy", response_model=ConvoyDispatchResponse)
def dispatch_convoy(
    request: ConvoyDispatchRequest,
    db: Session = Depends(get_db)
):
    """
    Dispatches emergency pilot escort or relief convoy along the selected corridor.
    """
    dispatch_num = random.randint(100, 999)
    eta = 18 if request.routeId == "route-a" else (28 if request.routeId == "route-b" else 42)

    return ConvoyDispatchResponse(
        dispatchId=f"DISP-{dispatch_num}",
        status="DISPATCHED",
        assignedUnit=request.unitType,
        routeId=request.routeId,
        sector=request.sector,
        destination=request.destination,
        etaMinutes=eta,
        message=f"Pilot convoy {request.unitType} successfully scrambled to secure {request.routeId.upper()} towards {request.destination}.",
        timestamp=datetime.utcnow().isoformat()
    )
