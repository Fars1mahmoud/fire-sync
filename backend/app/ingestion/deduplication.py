from typing import Dict, Any, Tuple

def create_detection_fingerprint(record: Dict[str, Any]) -> Tuple[float, float, str, str, str, str]:
    """
    Creates a deterministic deduplication tuple:
    (lat_rounded_4, lon_rounded_4, acq_date_str, acq_time_str, satellite, instrument)
    
    This preserves distinct sensor passes and different instruments while preventing
    re-importing identical satellite observations.
    """
    return (
        round(float(record["latitude"]), 4),
        round(float(record["longitude"]), 4),
        str(record["acq_date"]),
        str(record["acq_time"]),
        str(record.get("satellite", "")).upper(),
        str(record.get("instrument", "")).upper()
    )
