# Database Schema & Spatial Architecture

The platform uses **PostgreSQL 16** with the **PostGIS 3.4** spatial extension. Coordinates are projected in **WGS 84 (EPSG:4326)**.

---

## 1. Entity-Relationship Model

```mermaid
erDiagram
    COUNTRIES ||--o{ REGIONS : "contains"
    COUNTRIES ||--o{ INGESTION_FILES : "sources"
    COUNTRIES ||--o{ FIRE_DETECTIONS : "locates"
    INGESTION_FILES ||--o{ REJECTED_ROWS : "logs"
    INGESTION_FILES ||--o{ FIRE_DETECTIONS : "ingests"
    SATELLITE_SOURCES ||--o{ FIRE_DETECTIONS : "observes"

    COUNTRIES {
        varchar iso_code PK
        varchar name
        timestamptz created_at
    }

    REGIONS {
        varchar id PK
        varchar country_code FK
        varchar name_en
        varchar name_ar
        float center_lat
        float center_lon
        int default_zoom
        float bounds_sw_lat
        float bounds_sw_lon
        float bounds_ne_lat
        float bounds_ne_lon
        varchar risk_baseline
        jsonb geojson_polygon
        timestamptz created_at
    }

    SATELLITE_SOURCES {
        varchar id PK
        varchar satellite
        varchar instrument
        varchar provider
        varchar product_id
        float spatial_resolution_m
        varchar version
        timestamptz created_at
    }

    INGESTION_FILES {
        int id PK
        varchar filename
        text file_path
        varchar file_checksum
        varchar country_code FK
        bigint file_size_bytes
        varchar status
        int rows_processed
        int rows_inserted
        int rows_skipped
        int rows_rejected
        text error_summary
        timestamptz started_at
        timestamptz completed_at
    }

    REJECTED_ROWS {
        bigint id PK
        int file_id FK
        int row_number
        text raw_payload
        text rejection_reason
        timestamptz created_at
    }

    FIRE_DETECTIONS {
        bigint id PK
        varchar country_code FK
        int file_id FK
        float latitude
        float longitude
        geometry geom
        date acq_date
        varchar acq_time
        varchar satellite
        varchar instrument
        varchar confidence
        float confidence_numeric
        float bright_ti4
        float bright_ti5
        float scan
        float track
        float frp
        varchar daynight
        int detection_type
        varchar version
        jsonb raw_properties
        timestamptz created_at
    }
```

---

## 2. Table Specifications & Indexes

### 2.1 `countries`
- **Primary Key:** `iso_code` (`VARCHAR(3)`) e.g. `'BRA'`, `'CAN'`.
- **Fields:** `name` (`VARCHAR(100)`), `created_at` (`TIMESTAMPTZ`).

### 2.2 `regions`
- **Primary Key:** `id` (`VARCHAR(50)`) e.g. `'brazil'`, `'canada'`, `'mediterranean'`.
- **Spatial Bounds:** `bounds_sw_lat`, `bounds_sw_lon`, `bounds_ne_lat`, `bounds_ne_lon`.
- **Polygon Boundary:** `geojson_polygon` (`JSONB`).

### 2.3 `satellite_sources`
- **Primary Key:** `id` (`VARCHAR(50)`) e.g. `'VIIRS_N20'`, `'MODIS_AQUA'`.
- **Fields:** `satellite`, `instrument`, `provider`, `spatial_resolution_m`, `version`.

### 2.4 `ingestion_files`
- **Primary Key:** `id` (`SERIAL`).
- **Unique Fingerprint:** `file_checksum` (`VARCHAR(64)` SHA-256).
- **Status State Machine:** `PENDING` ➔ `PROCESSING` ➔ `COMPLETED` | `FAILED`.
- **Row Counters:** `rows_processed`, `rows_inserted`, `rows_skipped`, `rows_rejected`.

### 2.5 `rejected_rows`
- **Primary Key:** `id` (`BIGSERIAL`).
- **Foreign Key:** `file_id` references `ingestion_files(id)` with `ON DELETE CASCADE`.
- **Fields:** `row_number`, `raw_payload`, `rejection_reason`.

### 2.6 `fire_detections`
- **Primary Key:** `id` (`BIGSERIAL`).
- **Geographic Coordinates:** `latitude` (`FLOAT`), `longitude` (`FLOAT`).
- **PostGIS Column:** `geom` (`geometry(Point, 4326)`).
- **Observations:** `acq_date` (`DATE`), `acq_time` (`VARCHAR(4)` HHMM UTC).
- **Thermal Radiative Attributes:** `frp` (`FLOAT` in MW), `bright_ti4` (`FLOAT` in K), `bright_ti5` (`FLOAT` in K).
- **Quality & Context:** `confidence`, `confidence_numeric` (0-100%), `daynight` (`D`/`N`), `detection_type` (0=vegetation, 1=volcano, 2=industrial, 3=offshore).

---

## 3. Performance Indexes

1. **Spatial GiST Index:** `CREATE INDEX idx_fire_detections_geom ON fire_detections USING GIST (geom);`
2. **Temporal B-Tree Index:** `CREATE INDEX idx_fire_detections_acq_date ON fire_detections (acq_date);`
3. **Composite Country & Date Index:** `CREATE INDEX ix_fire_detections_country_date ON fire_detections (country_code, acq_date);`
4. **Composite Date & FRP Index:** `CREATE INDEX ix_fire_detections_date_frp ON fire_detections (acq_date, frp);`
5. **Deduplication Composite Index:** `CREATE INDEX ix_fire_detections_dedup ON fire_detections (latitude, longitude, acq_date, acq_time, satellite);`
