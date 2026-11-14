import csv
from typing import Dict, List, Tuple, Any
from app.core.logging import logger

STANDARD_FIRMS_COLUMNS = [
    "latitude", "longitude", "bright_ti4", "scan", "track",
    "acq_date", "acq_time", "satellite", "instrument", "confidence",
    "version", "bright_ti5", "frp", "daynight", "type"
]

def inspect_csv_schema(file_path: str) -> Dict[str, Any]:
    """
    Inspects delimiter, header columns, BOM presence, and sample rows.
    """
    with open(file_path, "r", encoding="utf-8-sig", errors="replace") as f:
        first_line = f.readline()
        delimiter = "," if "," in first_line else (";" if ";" in first_line else "\t")
        
        # Parse header
        f.seek(0)
        reader = csv.reader(f, delimiter=delimiter)
        header = next(reader, [])
        cleaned_header = [col.strip().strip('"').lower() for col in header]
        
        # Sample rows
        sample_rows = []
        for _ in range(5):
            try:
                row = next(reader)
                if row:
                    sample_rows.append(row)
            except StopIteration:
                break
                
    missing_standard_cols = [c for c in STANDARD_FIRMS_COLUMNS if c not in cleaned_header]
    extra_cols = [c for c in cleaned_header if c not in STANDARD_FIRMS_COLUMNS]
    
    return {
        "delimiter": delimiter,
        "columns": cleaned_header,
        "column_count": len(cleaned_header),
        "is_standard_firms": len(missing_standard_cols) == 0,
        "missing_columns": missing_standard_cols,
        "extra_columns": extra_cols,
        "sample_count": len(sample_rows)
    }
