from typing import Tuple, Optional, Dict, Any
from datetime import datetime

def validate_raw_record(row: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validates a raw row from the CSV dataset.
    Returns (True, None) if valid, or (False, reason) if rejected.
    """
    # 1. Coordinates
    try:
        lat = float(row.get("latitude", ""))
        lon = float(row.get("longitude", ""))
    except (ValueError, TypeError):
        return False, "Invalid or non-numeric latitude/longitude coordinates"
        
    if not (-90.0 <= lat <= 90.0):
        return False, f"Latitude {lat} out of valid range [-90, 90]"
    if not (-180.0 <= lon <= 180.0):
        return False, f"Longitude {lon} out of valid range [-180, 180]"

    # 2. Date
    raw_date = row.get("acq_date", "").strip()
    if not raw_date:
        return False, "Missing acquisition date"
    try:
        datetime.strptime(raw_date, "%Y-%m-%d")
    except ValueError:
        return False, f"Invalid acquisition date format '{raw_date}' (expected YYYY-MM-DD)"

    # 3. Time
    raw_time = str(row.get("acq_time", "")).strip()
    if not raw_time:
        return False, "Missing acquisition time"

    # 4. Satellite & Instrument
    sat = row.get("satellite", "").strip()
    inst = row.get("instrument", "").strip()
    if not sat or not inst:
        return False, "Missing satellite or instrument identifier"

    return True, None
