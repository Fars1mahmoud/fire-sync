# Fire Intelligence Platform — Backend Service

A modular Python FastAPI backend and PostGIS database system for the Fire Intelligence Platform. It manages historical satellite fire detections (NASA FIRMS VIIRS 375m & MODIS), geospatial queries, climatological baseline analytics, and frontend API services.

---

## 1. Tech Stack

- **Runtime:** Python 3.12
- **Framework:** FastAPI + Pydantic v2
- **ORM / Persistence:** SQLAlchemy 2.x + GeoAlchemy2 + psycopg3
- **Spatial Engine:** PostgreSQL 16 + PostGIS 3.4
- **Analytics:** DuckDB + Pandas + NumPy + SciPy + Scikit-Learn
- **Migrations:** Alembic
- **Testing:** Pytest + Pytest-Asyncio + HTTPX

---

## 2. Directory Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/          # FastAPI REST route controllers
│   │   │   ├── health.py    # Health & PostGIS connectivity checks
│   │   │   ├── fires.py     # Paginated fire detections & map endpoints
│   │   │   ├── regions.py   # Region management & polygon queries
│   │   │   ├── analytics.py # Historical baseline & anomaly endpoints
│   │   │   └── ingestion.py # Ingestion job status & rejected rows
│   ├── core/
│   │   ├── config.py        # Pydantic Settings & environment variables
│   │   └── logging.py       # Structured logging configuration
│   ├── db/
│   │   ├── models.py        # SQLAlchemy 2.x PostGIS spatial ORM models
│   │   ├── session.py       # Engine pool & session generator
│   │   └── init_db.py       # DB schema seeding & initial metadata
│   ├── ingestion/
│   │   ├── discovery.py     # CSV file discovery & SHA-256 fingerprinting
│   │   ├── schema_inspector.py # Dynamic CSV schema profiling
│   │   ├── validators.py    # Coordinate & value range validation
│   │   ├── normalization.py # UTC time & confidence normalization
│   │   ├── deduplication.py # Deterministic multi-tier deduplication
│   │   └── importer.py      # Chunked streaming batch database loader
│   ├── repositories/
│   │   └── fire_repository.py # High-performance PostGIS query layer
│   ├── services/
│   │   ├── analytics_service.py     # Climatological anomaly & baseline engine
│   │   ├── harmonization_service.py # VIIRS/MODIS grid resolution harmonizer
│   │   ├── weather_service.py       # Extensible meteorological foundation
│   │   └── ml_service.py            # Modular ML risk forecast architecture
│   ├── cli.py               # Typer CLI (audit, validate, status, ingest)
│   └── main.py              # FastAPI application entrypoint & middleware
├── init-db/
│   └── 01-init.sql          # PostGIS extension initialization script
├── migrations/              # Alembic database migrations
├── tests/                   # Automated unit & integration test suite
├── docker-compose.yml       # PostgreSQL 16 + PostGIS 3.4 container
├── requirements.txt         # Production dependencies
├── alembic.ini              # Alembic migration configuration
└── .env.example             # Template environment variables
```

---

## 3. Quickstart Guide

### 3.1 Start Database with Docker
```powershell
# In backend/ directory
docker compose up -d

# Verify container is healthy
docker compose ps
```

### 3.2 Python Environment Setup
```powershell
# Create Python 3.12 virtual environment (e.g. with uv or venv)
uv venv --python 3.12 .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
uv pip install -r requirements.txt
```

### 3.3 Initialize Schema & Run Migrations
```powershell
# Apply Alembic migrations
.\.venv\Scripts\python.exe -m alembic upgrade head

# Seed initial countries, regions, and sensor metadata
.\.venv\Scripts\python.exe -m app.db.init_db
```

### 3.4 Start FastAPI Development Server
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- Database Check: [http://localhost:8000/api/v1/health/database](http://localhost:8000/api/v1/health/database)

---

## 4. Ingestion CLI Commands

The ingestion pipeline is completely idempotent and handles all CSV files in `brazil/` and `canada/`:

```powershell
# 1. Audit datasets without modifying the database
.\.venv\Scripts\python.exe -m app.cli audit

# 2. Run data quality validation checks
.\.venv\Scripts\python.exe -m app.cli validate

# 3. Check ingestion database status
.\.venv\Scripts\python.exe -m app.cli status

# 4. Ingest datasets (e.g. Brazil only, Canada only, or all)
.\.venv\Scripts\python.exe -m app.cli ingest --country BR
.\.venv\Scripts\python.exe -m app.cli ingest --country CA
.\.venv\Scripts\python.exe -m app.cli ingest --all

# 5. Ingest sample batch (e.g. 10,000 rows for rapid testing)
.\.venv\Scripts\python.exe -m app.cli ingest --country BR --max-rows 10000
```

---

## 5. Running Automated Tests

Run the full pytest suite (22 tests covering ingestion, normalization, PostGIS spatial queries, analytics, and API routes):
```powershell
.\.venv\Scripts\python.exe -m pytest tests -v
```

---

## 6. Database Backup & Restore

### Backup Database:
```powershell
docker exec -t fire_intelligence_db pg_dump -U postgres -d fire_intelligence > backup_fire_intelligence.sql
```

### Restore Database:
```powershell
cat backup_fire_intelligence.sql | docker exec -i fire_intelligence_db psql -U postgres -d fire_intelligence
```
