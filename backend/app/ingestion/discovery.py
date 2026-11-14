import os
import hashlib
from typing import List, Dict, Any
from app.core.logging import logger

def calculate_sha256(file_path: str, chunk_size: int = 1024 * 1024) -> str:
    """Calculates SHA-256 checksum of a file efficiently"""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)
    return hasher.hexdigest()

def discover_csv_files(base_dirs: Dict[str, str]) -> List[Dict[str, Any]]:
    """
    Discovers CSV files from directory mappings.
    base_dirs: e.g. {"BRA": "../brazil", "CAN": "../canada"}
    Returns a list of file metadata dictionaries.
    """
    discovered = []
    
    for country_code, folder_path in base_dirs.items():
        if not os.path.exists(folder_path):
            logger.warning(f"Dataset path does not exist: {folder_path} (country: {country_code})")
            continue
            
        for root, _, filenames in os.walk(folder_path):
            for fname in filenames:
                # Ignore temp, hidden or system files
                if fname.startswith(".") or fname.startswith("~") or not fname.lower().endswith(".csv"):
                    continue
                    
                full_path = os.path.abspath(os.path.join(root, fname))
                file_size = os.path.getsize(full_path)
                
                # Fast discovery (checksum computed when importing or auditing)
                discovered.append({
                    "filename": fname,
                    "file_path": full_path,
                    "country_code": country_code,
                    "file_size_bytes": file_size,
                    "file_size_mb": round(file_size / (1024 * 1024), 2)
                })
                
    logger.info(f"Discovered {len(discovered)} valid CSV dataset files across {len(base_dirs)} country sources.")
    return discovered
