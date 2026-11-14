# NASA FIRMS & Fire Intelligence Data Dictionary

This document details the data attributes, physical units, sensor specifications, and database schema mappings for satellite fire observations and platform models.

---

## 1. Raw NASA FIRMS VIIRS I-Band (375m) Schema

The ingested CSV files from the NOAA-20 / JPSS-1 spacecraft (`satellite=N20`, `instrument=VIIRS`) have the following raw attributes:

| Source Column | Data Type | Physical Unit | Valid Range | Description & Meaning | Database Field |
|:---|:---|:---|:---|:---|:---|
| `latitude` | `FLOAT` | Decimal Degrees | `[-90.0, 90.0]` | Geographic latitude of the pixel center (WGS 84 / EPSG:4326). | `latitude`, `geom` (Point) |
| `longitude` | `FLOAT` | Decimal Degrees | `[-180.0, 180.0]` | Geographic longitude of the pixel center (WGS 84 / EPSG:4326). | `longitude`, `geom` (Point) |
| `bright_ti4` | `FLOAT` | Kelvin ($K$) | `[0.0, 400.0]` | VIIRS I-4 thermal brightness temperature at $3.75\ \mu\text{m}$. Primary channel for thermal anomaly detection. | `bright_ti4` |
| `scan` | `FLOAT` | Kilometers ($km$) | `[0.2, 5.0]` | Pixel spatial resolution along the cross-track scan direction. | `scan` |
| `track` | `FLOAT` | Kilometers ($km$) | `[0.2, 5.0]` | Pixel spatial resolution along the along-track flight direction. | `track` |
| `acq_date` | `STRING` (`YYYY-MM-DD`) | Date | ISO 8601 | Observation acquisition date in UTC. | `acq_date` (`DATE`) |
| `acq_time` | `INTEGER` / `STRING` | Time (HHMM) | `0000`–`2359` | Satellite overpass time in UTC. Can be 3 or 4 digits (e.g. `533` $\rightarrow$ `0533`). | `acq_time` (`VARCHAR(4)`) |
| `satellite` | `STRING` | Categorical | `N20`, `1`, `A`, `T` | Satellite identifier (`N20` = NOAA-20 / JPSS-1, `1` = Suomi-NPP, `A` = Aqua, `T` = Terra). | `satellite` |
| `instrument` | `STRING` | Categorical | `VIIRS`, `MODIS` | Sensor package (`VIIRS` = 375m/750m, `MODIS` = 1km). | `instrument` |
| `confidence` | `STRING` / `INTEGER` | Categorical / % | `l`, `n`, `h` (VIIRS) or `0`–`100` (MODIS) | Detection quality: `l` = Low (30%), `n` = Nominal (70%), `h` = High (95%). | `confidence`, `confidence_numeric` |
| `version` | `STRING` | Version tag | e.g. `2`, `2.0NRT` | Collection processing version. Collection 2 is standard archive. | `version` |
| `bright_ti5` | `FLOAT` | Kelvin ($K$) | `[150.0, 400.0]` | VIIRS I-5 thermal brightness temperature at $11.0\ \mu\text{m}$. Used for split-window cloud/water filtering. | `bright_ti5` |
| `frp` | `FLOAT` | Megawatts ($\text{MW}$) | $\ge 0.0$ | Fire Radiative Power: instantaneous pixel-integrated radiative energy release rate. Direct metric of fire intensity. | `frp` |
| `daynight` | `STRING` | Categorical | `D`, `N` | `D` = Solar daytime overpass; `N` = Solar nighttime overpass. | `daynight` |
| `type` | `INTEGER` | Categorical | `0`, `1`, `2`, `3` | Detection classification: `0` = Presumed vegetation fire, `1` = Active volcano, `2` = Static industrial flare, `3` = Offshore flare. | `detection_type` |

---

## 2. Platform Database Tables & Entities

### 2.1 `countries`
- **`iso_code`** (`VARCHAR(3)`, Primary Key): Standard ISO-3166 alpha-3 code (e.g. `BRA`, `CAN`).
- **`name`** (`VARCHAR(100)`): Full English country designation.
- **`created_at`** (`TIMESTAMPTZ`): Record creation audit timestamp.

### 2.2 `regions`
- **`id`** (`VARCHAR(50)`, Primary Key): Sluggified monitoring region identifier (e.g. `brazil`, `canada`, `mediterranean`, `california`).
- **`country_code`** (`VARCHAR(3)`, Foreign Key): Linked country code. Nullable for cross-border trans-national monitoring zones.
- **`name_en`** (`VARCHAR(100)`): English display title.
- **`name_ar`** (`VARCHAR(100)`): Multilingual Arabic title.
- **`center_lat`**, **`center_lon`** (`FLOAT`): Map viewpoint default center coordinates.
- **`default_zoom`** (`INTEGER`): Leaflet camera initial zoom level.
- **`bounds_sw_lat`**, **`bounds_sw_lon`**, **`bounds_ne_lat`**, **`bounds_ne_lon`** (`FLOAT`): Spatial viewport bounding box envelope.
- **`risk_baseline`** (`VARCHAR(20)`): Climatological baseline risk rating (`low`, `moderate`, `high`, `extreme`).
- **`geojson_polygon`** (`JSONB`): Optional GeoJSON Polygon or MultiPolygon representation of region boundary.
- **`created_at`** (`TIMESTAMPTZ`): Creation timestamp.

### 2.3 `satellite_sources`
- **`id`** (`VARCHAR(50)`, Primary Key): Unique platform sensor ID (e.g. `VIIRS_N20`, `VIIRS_SNPP`, `MODIS_AQUA`, `MODIS_TERRA`).
- **`satellite`** (`VARCHAR(50)`): Spacecraft name (e.g. `NOAA-20`, `Suomi-NPP`, `Aqua`, `Terra`).
- **`instrument`** (`VARCHAR(50)`): Sensor name (`VIIRS`, `MODIS`).
- **`provider`** (`VARCHAR(100)`): Data provider (e.g. `NASA FIRMS`, `NOAA CLASS`).
- **`product_id`** (`VARCHAR(100)`): Product stream code (e.g. `VNP14IMGTDL`, `VJ114IMGTDL`).
- **`spatial_resolution_m`** (`FLOAT`): Native spatial resolution at nadir in meters (e.g. `375.0` for VIIRS I-band, `1000.0` for MODIS).
- **`version`** (`VARCHAR(20)`): Product collection version.
- **`created_at`** (`TIMESTAMPTZ`): Creation timestamp.

### 2.4 `ingestion_files`
- **`id`** (`SERIAL`, Primary Key): Ingestion job identifier.
- **`filename`** (`VARCHAR(255)`): Source CSV filename.
- **`file_path`** (`TEXT`): Relative path on disk.
- **`file_checksum`** (`VARCHAR(64)`): Hexadecimal SHA-256 cryptographic digest of the source file. Guarantees idempotency.
- **`country_code`** (`VARCHAR(3)`, Foreign Key): Provisional country identifier.
- **`file_size_bytes`** (`BIGINT`): Source file size in bytes.
- **`status`** (`VARCHAR(20)`): State machine status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
- **`rows_processed`** (`INTEGER`): Total lines read from file.
- **`rows_inserted`** (`INTEGER`): Valid unique rows committed to database.
- **`rows_skipped`** (`INTEGER`): Duplicate or pre-existing rows skipped.
- **`rows_rejected`** (`INTEGER`): Invalid rows written to error log.
- **`error_summary`** (`TEXT`): Error message or stack trace if status is `FAILED`.
- **`started_at`** (`TIMESTAMPTZ`): Ingestion start timestamp.
- **`completed_at`** (`TIMESTAMPTZ`): Ingestion finish timestamp.

### 2.5 `rejected_rows`
- **`id`** (`BIGSERIAL`, Primary Key): Rejection log identifier.
- **`file_id`** (`INTEGER`, Foreign Key): Associated ingestion job ID.
- **`row_number`** (`INTEGER`): 1-indexed row number in source CSV.
- **`raw_payload`** (`TEXT`): Complete unparsed raw row text.
- **`rejection_reason`** (`TEXT`): Validation failure explanation (e.g. `Latitude out of range [-90, 90]`, `Invalid acquisition date`).
- **`created_at`** (`TIMESTAMPTZ`): Error recording timestamp.

### 2.6 `fire_detections`
- **`id`** (`BIGSERIAL`, Primary Key): Global observation unique identifier.
- **`country_code`** (`VARCHAR(3)`, Foreign Key): Target country code.
- **`file_id`** (`INTEGER`, Foreign Key): Ingestion source file ID.
- **`latitude`** (`FLOAT`): WGS 84 latitude in degrees.
- **`longitude`** (`FLOAT`): WGS 84 longitude in degrees.
- **`geom`** (`geometry(Point, 4326)`): PostGIS binary geometry for spatial index acceleration.
- **`acq_date`** (`DATE`): Observation acquisition date in UTC.
- **`acq_time`** (`VARCHAR(4)`): Observation time in 4-digit 24h UTC format (`HHMM`).
- **`satellite`** (`VARCHAR(20)`): Satellite designation (`N20`, etc.).
- **`instrument`** (`VARCHAR(20)`): Sensor instrument (`VIIRS`, etc.).
- **`confidence`** (`VARCHAR(10)`): Qualitative confidence (`l`, `n`, `h`).
- **`confidence_numeric`** (`FLOAT`): Normalized scalar confidence percentage (`30.0`, `70.0`, `95.0`, or `0-100%`).
- **`bright_ti4`** (`FLOAT`): 3.75 µm brightness temperature in Kelvin.
- **`bright_ti5`** (`FLOAT`): 11.0 µm brightness temperature in Kelvin.
- **`scan`** (`FLOAT`): Scan pixel dimension in km.
- **`track`** (`FLOAT`): Track pixel dimension in km.
- **`frp`** (`FLOAT`): Fire Radiative Power in Megawatts ($\ge 0.0$).
- **`daynight`** (`VARCHAR(1)`): Day (`D`) or Night (`N`).
- **`detection_type`** (`INTEGER`): Land use classification code (`0` = vegetation, `2` = industrial, `3` = offshore).
- **`version`** (`VARCHAR(20)`): Product version string.
- **`raw_properties`** (`JSONB`): Auxiliary JSON metadata (e.g. original un-clamped FRP, source file line number).
- **`created_at`** (`TIMESTAMPTZ`): Database commit timestamp.

---

## 3. Sensor Harmonization Data Structures

### Harmonized Grid Cell (`HarmonizedGridCell`)
- **`grid_id`** (`VARCHAR`): Centroid identifier e.g. `G_-12.350_-45.600`.
- **`cell_lat`**, **`cell_lon`** (`FLOAT`): Center coordinates of the equal-area spatial grid cell.
- **`cell_size_deg`** (`FLOAT`): Grid cell dimension in decimal degrees (default: `0.1°` $\approx 11\ \text{km}$).
- **`date`** (`DATE`): Date of temporal binning.
- **`country_code`** (`VARCHAR(3)`): Country identifier.
- **`viirs_detection_count`** (`INTEGER`): Count of 375m VIIRS detections within cell.
- **`modis_detection_count`** (`INTEGER`): Count of 1km MODIS detections within cell.
- **`total_detections`** (`INTEGER`): Total aggregated detections ($N_{\text{VIIRS}} + N_{\text{MODIS}}$).
- **`total_frp_mw`** (`FLOAT`): Summed radiative power across all sensors in cell.
- **`max_frp_mw`** (`FLOAT`): Peak FRP observed within cell.
- **`mean_confidence`** (`FLOAT`): Weighted mean confidence percentage.
- **`fire_activity_index`** (`FLOAT`): Relative activity score ($0.0$ to $100.0$) scaled log-linearly.

---

## 4. Anomaly Detection Data Structures

### Daily Anomaly Point (`AnomalyDataPoint`)
- **`date`** (`DATE`): Observation date.
- **`observed_count`** (`INTEGER`): Observed satellite detection count.
- **`historical_baseline`** (`FLOAT`): Multi-year mean detection count for this calendar day-of-year.
- **`std_dev`** (`FLOAT`): Standard deviation for this calendar day-of-year.
- **`anomaly_score`** (`FLOAT`): Normalized Z-score:
  $$Z = \frac{\text{observed} - \text{baseline}}{\max(\text{std\_dev}, 1.0)}$$
- **`is_anomaly`** (`BOOLEAN`): Flagged `true` if $Z > 2.0$ (statistically significant breakout).
- **`severity`** (`VARCHAR`): Qualitative severity (`normal`, `elevated`, `severe`, `critical`).
