import os
import sys
from datetime import date
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Mark testing mode before app imports
os.environ["TESTING"] = "1"
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import Base, get_db
from app.db.models import FireDetection, IngestionFile
from app.db.init_db import init_database
from app.main import app

# Create in-memory SQLite engine for tests
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
    expire_on_commit=False
)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_database(target_engine=test_engine, session_factory=TestingSessionLocal)
    db = TestingSessionLocal()

    # Seed sample IngestionFile
    ing_file = IngestionFile(
        filename="test_can_sample.csv",
        file_path="/test/path",
        file_checksum="testchecksum1234567890",
        country_code="CAN",
        file_size_bytes=1024,
        status="COMPLETED",
        rows_processed=10,
        rows_inserted=10,
        rows_skipped=0,
        rows_rejected=0
    )
    db.add(ing_file)
    db.commit()

    # Seed sample detections for tests
    sample_fires = [
        FireDetection(
            country_code="CAN",
            file_id=ing_file.id,
            latitude=56.13,
            longitude=-106.35,
            acq_date=date(2024, 7, 10),
            acq_time="2015",
            satellite="N20",
            instrument="VIIRS",
            confidence="h",
            confidence_numeric=95.0,
            frp=120.5,
            bright_ti4=340.2,
            daynight="D",
            detection_type=0
        ),
        FireDetection(
            country_code="CAN",
            file_id=ing_file.id,
            latitude=57.55,
            longitude=-121.90,
            acq_date=date(2023, 6, 20),
            acq_time="1845",
            satellite="Terra",
            instrument="MODIS",
            confidence="85",
            confidence_numeric=85.0,
            frp=65.0,
            bright_ti4=332.0,
            daynight="D",
            detection_type=0
        ),
        FireDetection(
            country_code="BRA",
            file_id=ing_file.id,
            latitude=-10.82,
            longitude=-55.45,
            acq_date=date(2024, 8, 15),
            acq_time="1630",
            satellite="N20",
            instrument="VIIRS",
            confidence="h",
            confidence_numeric=98.0,
            frp=185.0,
            bright_ti4=350.0,
            daynight="D",
            detection_type=0
        ),
        FireDetection(
            country_code="BRA",
            file_id=ing_file.id,
            latitude=-7.52,
            longitude=-63.02,
            acq_date=date(2023, 9, 12),
            acq_time="1330",
            satellite="Aqua",
            instrument="MODIS",
            confidence="75",
            confidence_numeric=75.0,
            frp=45.0,
            bright_ti4=328.0,
            daynight="D",
            detection_type=0
        )
    ]
    db.add_all(sample_fires)
    db.commit()
    db.close()
    yield

@pytest.fixture(scope="session")
def db_session(setup_test_db):
    db = TestingSessionLocal()
    yield db
    db.close()

@pytest.fixture(scope="session")
def client(setup_test_db):
    with TestClient(app) as c:
        yield c
