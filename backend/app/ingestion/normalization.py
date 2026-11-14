from typing import Dict, Any, Optional
from datetime import datetime, date

def normalize_acq_time(raw_time: Any) -> str:
    """Normalizes UTC time string e.g. '533' -> '0533', '1420' -> '1420'"""
    s = str(raw_time).strip().replace(":", "")
    if s.endswith(".0"):
        s = s[:-2]
    # Pad to 4 digits (e.g. 533 -> 0533)
    return s.zfill(4)[:4]

def normalize_confidence(conf_val: Any) -> tuple[str, Optional[float]]:
    """
    Normalizes confidence value.
    Returns (raw_string, numeric_0_to_100_percent).
    VIIRS: 'l' (low) -> 30%, 'n' (nominal) -> 70%, 'h' (high) -> 95%
    MODIS / Numeric: 0-100%
    """
    s = str(conf_val).strip().lower()
    if s == "l":
        return "l", 30.0
    elif s == "n":
        return "n", 70.0
    elif s == "h":
        return "h", 95.0
    try:
        val = float(s)
        return str(int(val)), max(0.0, min(100.0, val))
    except ValueError:
        return s, None

def normalize_record(row: Dict[str, Any], country_code: str, file_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Normalizes a validated CSV row into the internal FireDetection structure.
    """
    lat = round(float(row["latitude"]), 5)
    lon = round(float(row["longitude"]), 5)
    
    # Parse date
    acq_date = datetime.strptime(row["acq_date"].strip(), "%Y-%m-%d").date()
    acq_time = normalize_acq_time(row.get("acq_time", ""))
    
    conf_str, conf_num = normalize_confidence(row.get("confidence", "n"))
    
    # FRP: clamp negative artifacts to 0.0
    raw_frp = float(row.get("frp", 0.0) or 0.0)
    frp = max(0.0, round(raw_frp, 2))
    
    # Brightness temperatures
    ti4 = float(row.get("bright_ti4", 0.0) or 0.0) if row.get("bright_ti4") else None
    ti5 = float(row.get("bright_ti5", 0.0) or 0.0) if row.get("bright_ti5") else None
    scan = float(row.get("scan", 0.0) or 0.0) if row.get("scan") else None
    track = float(row.get("track", 0.0) or 0.0) if row.get("track") else None
    
    # Type: 0=veg, 1=volcano, 2=static/industrial, 3=offshore
    try:
        det_type = int(row.get("type", 0) or 0)
    except (ValueError, TypeError):
        det_type = 0
        
    daynight = str(row.get("daynight", "D")).strip().upper()
    if daynight not in ("D", "N"):
        daynight = "D"

    return {
        "country_code": country_code,
        "file_id": file_id,
        "latitude": lat,
        "longitude": lon,
        "acq_date": acq_date,
        "acq_time": acq_time,
        "satellite": str(row.get("satellite", "N20")).strip(),
        "instrument": str(row.get("instrument", "VIIRS")).strip(),
        "confidence": conf_str,
        "confidence_numeric": conf_num,
        "bright_ti4": ti4,
        "bright_ti5": ti5,
        "scan": scan,
        "track": track,
        "frp": frp,
        "daynight": daynight,
        "detection_type": det_type,
        "version": str(row.get("version", "2")).strip(),
        "raw_properties": {
            "original_frp": raw_frp,
            "original_confidence": str(row.get("confidence", "")).strip()
        }
    }
