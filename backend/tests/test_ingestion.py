import os
import tempfile
import pytest

from app.ingestion.validators import validate_raw_record
from app.ingestion.normalization import normalize_record, normalize_acq_time, normalize_confidence
from app.ingestion.deduplication import create_detection_fingerprint
from app.ingestion.importer import IngestionPipeline

def test_validate_valid_record():
    valid = {
        "latitude": "-15.7801",
        "longitude": "-47.9292",
        "acq_date": "2024-08-15",
        "acq_time": "1430",
        "satellite": "N20",
        "instrument": "VIIRS"
    }
    is_valid, reason = validate_raw_record(valid)
    assert is_valid is True
    assert reason is None

def test_validate_invalid_coordinates():
    invalid_lat = {
        "latitude": "95.5", # Out of range
        "longitude": "-47.9292",
        "acq_date": "2024-08-15",
        "acq_time": "1430",
        "satellite": "N20",
        "instrument": "VIIRS"
    }
    is_valid, reason = validate_raw_record(invalid_lat)
    assert is_valid is False
    assert "Latitude" in reason

    invalid_lon = {
        "latitude": "45.0",
        "longitude": "-195.0", # Out of range
        "acq_date": "2024-08-15",
        "acq_time": "1430",
        "satellite": "N20",
        "instrument": "VIIRS"
    }
    is_valid, reason = validate_raw_record(invalid_lon)
    assert is_valid is False
    assert "Longitude" in reason

def test_validate_invalid_date():
    invalid_date = {
        "latitude": "45.0",
        "longitude": "-75.0",
        "acq_date": "2024-99-99", # Invalid date
        "acq_time": "1430",
        "satellite": "N20",
        "instrument": "VIIRS"
    }
    is_valid, reason = validate_raw_record(invalid_date)
    assert is_valid is False
    assert "date format" in reason

def test_normalize_acq_time():
    assert normalize_acq_time("533") == "0533"
    assert normalize_acq_time("1430") == "1430"
    assert normalize_acq_time("0005") == "0005"
    assert normalize_acq_time(420) == "0420"

def test_normalize_confidence():
    conf_l, num_l = normalize_confidence("l")
    assert conf_l == "l" and num_l == 30.0

    conf_n, num_n = normalize_confidence("n")
    assert conf_n == "n" and num_n == 70.0

    conf_h, num_h = normalize_confidence("h")
    assert conf_h == "h" and num_h == 95.0

    conf_num, val = normalize_confidence("85")
    assert conf_num == "85" and val == 85.0

def test_deduplication_fingerprint():
    r1 = {
        "latitude": -12.34567,
        "longitude": -45.67891,
        "acq_date": "2024-08-10",
        "acq_time": "0533",
        "satellite": "N20",
        "instrument": "VIIRS"
    }
    r2 = {
        "latitude": -12.34571, # within round(4)
        "longitude": -45.67894, # within round(4)
        "acq_date": "2024-08-10",
        "acq_time": "0533",
        "satellite": "N20",
        "instrument": "VIIRS"
    }
    assert create_detection_fingerprint(r1) == create_detection_fingerprint(r2)

def test_empty_and_corrupt_csv_handling(db_session):
    pipeline = IngestionPipeline(db_session)
    
    # 1. Empty CSV
    with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False) as tf:
        tf.write("latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight,type\n")
        temp_path = tf.name

    try:
        res = pipeline.process_file(temp_path, country_code="CAN", force_reimport=True)
        assert res["status"] == "COMPLETED"
        assert res["rows_inserted"] == 0
    finally:
        os.remove(temp_path)
