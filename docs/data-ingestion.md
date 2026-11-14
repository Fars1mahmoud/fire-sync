# Data Ingestion Pipeline & Operations Guide

The **Fire Intelligence Platform** includes a production-ready, idempotent data ingestion engine written in Python. It handles file discovery, schema inspection, cryptographic deduplication, row-level validation, chunked batch loading into PostgreSQL/PostGIS, and error auditing.

---

## 1. Pipeline Architecture

```mermaid
flowchart TD
    A[Raw CSV Files: brazil/, canada/] --> B[File Discovery & SHA-256 Checksum]
    B --> C{Checksum in ingestion_files?}
    C -->|Status = COMPLETED & no --force| D[Skip File (Zero Overhead)]
    C -->|New File or --force| E[Schema Inspector]
    E --> F[Chunked Streaming Reader (chunk_size = 5,000)]
    F --> G[Validator & Normalizer]
    G -->|Valid Row| H[Deduplication Filter]
    G -->|Invalid Row| I[Log to rejected_rows table]
    H --> J[PostGIS Point Geometry Builder]
    J --> K[SQLAlchemy Batch Bulk Insert]
    K --> L[Update ingestion_files status: COMPLETED]
```

---

## 2. Ingestion CLI Commands

The CLI is implemented using Typer and resides in `backend/app/cli.py`. You can run it from the `backend/` directory using the virtual environment:

### 2.1 Audit Datasets
Inspects all CSV files in `brazil/` and `canada/`, printing row counts, file sizes, column schemas, and date ranges without modifying the database:
```powershell
cd c:\Users\Dell\Desktop\NASA\backend
.\.venv\Scripts\python.exe -m app.cli audit
```

### 2.2 Validate Datasets
Performs a deep data quality validation check on the first $N$ rows of every file (default: 1,000 rows), checking latitude/longitude ranges, date/time formatting, and confidence categories:
```powershell
.\.venv\Scripts\python.exe -m app.cli validate --sample-size 5000
```

### 2.3 Check Ingestion Status
Displays a tabular summary of all tracked source files, their SHA-256 fingerprints, processing status, and row count metrics (`processed`, `inserted`, `skipped`, `rejected`):
```powershell
.\.venv\Scripts\python.exe -m app.cli status
```

### 2.4 Ingest Datasets

#### Ingest all discovered files:
```powershell
.\.venv\Scripts\python.exe -m app.cli ingest --all
```

#### Ingest a specific country:
```powershell
# Brazil only
.\.venv\Scripts\python.exe -m app.cli ingest --country BR

# Canada only
.\.venv\Scripts\python.exe -m app.cli ingest --country CA
```

#### Ingest a controlled batch sample (useful for quick verification):
```powershell
.\.venv\Scripts\python.exe -m app.cli ingest --country BR --max-rows 10000
```

#### Force re-importing previously completed files:
```powershell
.\.venv\Scripts\python.exe -m app.cli ingest --country BR --force
```

#### Custom batch size:
```powershell
.\.venv\Scripts\python.exe -m app.cli ingest --all --batch-size 10000
```

---

## 3. Idempotency & Deduplication Policy

The pipeline implements a two-tier deduplication and idempotency safeguard:

1. **File-Level Fingerprinting (Cryptographic):**
   - Before reading rows, the pipeline calculates the **SHA-256** checksum of the file.
   - It checks `ingestion_files` table in PostgreSQL.
   - If a record with this hash exists with status `COMPLETED`, the entire file is skipped with zero CPU or database overhead.
2. **Observation-Level Deterministic Composite Key:**
   - Observations that share identical spatial and temporal properties:
     $$\text{Key} = \left(\text{round}(\text{lat}, 4),\, \text{round}(\text{lon}, 4),\, \text{acq\_date},\, \text{acq\_time},\, \text{satellite},\, \text{instrument}\right)$$
   - Within each chunk, in-flight duplicates are dropped.
   - Cross-sensor detections (e.g. MODIS 1km observing the same fire as VIIRS 375m) are **preserved as distinct records** because their observation geometry, timestamp, and satellite source differ.

---

## 4. Rejection & Error Auditing

The pipeline **never silently discards data**. When a row fails validation (e.g. coordinates outside $[-90, 90]$ or $[-180, 180]$, unparseable dates, negative coordinates in corrupt formats):
1. The row is quarantined.
2. An entry is written to the `rejected_rows` table containing:
   - `file_id`: foreign key to the source file
   - `row_number`: exact line number in the CSV
   - `raw_payload`: full unparsed CSV text
   - `rejection_reason`: human-readable explanation
3. The ingestion run proceeds without crashing the entire batch.

To query rejected rows via SQL:
```sql
SELECT f.filename, r.row_number, r.rejection_reason, r.raw_payload
FROM rejected_rows r
JOIN ingestion_files f ON r.file_id = f.id
ORDER BY r.created_at DESC
LIMIT 50;
```

---

## 5. Adding New Countries & Regions

The architecture is designed for seamless global expansion:

### Step 1: Add Country to Database
Add an entry to the `countries` table:
```sql
INSERT INTO countries (iso_code, name) VALUES ('USA', 'United States');
```
Or use the seed helper in `backend/app/db/init_db.py`.

### Step 2: Organize Data Directory
Create a directory named after the country or ISO code (e.g. `usa/` or `data/usa/`) containing NASA FIRMS CSV files:
```text
usa/
└── viirs-jpss1_2024_United_States.csv
```

### Step 3: Run Ingestion
The discovery engine will automatically find the new folder:
```powershell
.\.venv\Scripts\python.exe -m app.cli ingest --country USA
```

---

## 6. Adding New Satellite Instruments (e.g. MODIS, Sentinel-3)

The database schema is sensor-agnostic:
1. Register the sensor in `satellite_sources`:
   ```sql
   INSERT INTO satellite_sources (id, satellite, instrument, provider, spatial_resolution_m, version)
   VALUES ('MODIS_TERRA', 'Terra', 'MODIS', 'NASA FIRMS', 1000.0, '6.1');
   ```
2. The schema inspector automatically recognizes standard MODIS column naming variants (`brightness` instead of `bright_ti4`, `confidence` as 0–100 integer instead of `l`/`n`/`h`).
3. Confidence normalization translates numeric 0–100 percentages to uniform scalar floats, enabling cross-sensor analysis in the Harmonization module.
