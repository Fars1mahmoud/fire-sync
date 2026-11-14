# FastAPI REST API Specification

The **Fire Intelligence Platform API** is built with FastAPI and SQLAlchemy 2.x, providing asynchronous, high-performance geospatial data access and historical wildfire analytics.

- **Base URL:** `http://localhost:8000/api/v1`
- **Interactive OpenAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Specification:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 1. System Endpoints

### `GET /api/v1/health`
Returns the operational health of the FastAPI backend application.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-10-10T20:47:39.146236Z"
}
```

---

### `GET /api/v1/health/database`
Tests live connectivity to PostgreSQL, inspects the PostGIS extension version, and verifies table row counts.

**Response:**
```json
{
  "status": "connected",
  "database": "fire_intelligence",
  "postgis_version": "3.4 USE_GEOS=1 USE_PROJ=1 USE_STATS=1",
  "tables_count": 10,
  "detections_count": 9998,
  "countries_count": 4
}
```

---

### `GET /api/v1/metadata`
Returns registered countries, monitoring regions, and satellite sensor specifications.

---

## 2. Fire Detection Endpoints

### `GET /api/v1/fires`
Queries paginated fire detection observations with filtering by country, date range, satellite, FRP, and spatial bounding box.

**Query Parameters:**
| Parameter | Type | Required | Description |
|:---|:---|:---:|:---|
| `country` | `string` | No | ISO-3166 alpha-3 code (e.g. `BRA`, `CAN`). |
| `start_date` | `date` | No | Start date inclusive (`YYYY-MM-DD`). |
| `end_date` | `date` | No | End date inclusive (`YYYY-MM-DD`). |
| `satellite` | `string` | No | Satellite code (e.g. `N20`). |
| `instrument` | `string` | No | Instrument code (e.g. `VIIRS`). |
| `min_frp` | `float` | No | Minimum Fire Radiative Power in MW. |
| `confidence` | `string` | No | Filter by confidence category (`l`, `n`, `h`). |
| `bbox` | `string` | No | Bounding box in `min_lon,min_lat,max_lon,max_lat` format. |
| `page` | `integer` | No | Page number (default: `1`). |
| `page_size` | `integer` | No | Records per page (default: `50`, max: `1000`). |

**Response:**
```json
{
  "total": 5000,
  "page": 1,
  "page_size": 50,
  "total_pages": 100,
  "items": [
    {
      "id": 8812,
      "country_code": "BRA",
      "latitude": -9.8451,
      "longitude": -56.3214,
      "acq_date": "2024-08-15",
      "acq_time": "1730",
      "satellite": "N20",
      "instrument": "VIIRS",
      "confidence": "h",
      "confidence_numeric": 95.0,
      "bright_ti4": 348.5,
      "bright_ti5": 298.2,
      "frp": 64.2,
      "daynight": "D",
      "detection_type": 0
    }
  ]
}
```

---

## 3. Frontend Map Endpoints

### `GET /api/v1/fires/map`
Returns formatted fire detections tailored for frontend Leaflet and Mapbox visualizations. Supports viewport bounding boxes and zoom-dependent sampling to prevent browser DOM overload.

**Query Parameters:**
- `country` (`string`): Filter by country code (`BRA`, `CAN`).
- `start_date`, `end_date` (`date`): Temporal window.
- `min_frp` (`float`): Minimum FRP threshold.
- `bbox` (`string`): Viewport bounding box (`min_lon,min_lat,max_lon,max_lat`).
- `limit` (`integer`): Target hotspot count (default: `1000`, max: `5000`).

**Response Schema:**
```json
{
  "count": 500,
  "total_in_query": 5000,
  "sampled": true,
  "hotspots": [
    {
      "id": "HOT-BRA-8812",
      "name": "Brazil Fire Cluster #8812",
      "country": "Brazil",
      "stateOrRegion": "Amazonas",
      "coordinates": [-9.8451, -56.3214],
      "frp": 64.2,
      "confidence": "high",
      "brightnessTemperature": 348.5,
      "detectionDate": "2024-08-15",
      "detectionTime": "17:30 UTC",
      "satellite": "NOAA-20 (VIIRS)",
      "dayNight": "Day",
      "type": "Vegetation Fire"
    }
  ]
}
```

---

## 4. Geographic Regions Endpoints

### `GET /api/v1/regions`
Lists all monitored geographic regions.

### `GET /api/v1/regions/{region_id}`
Returns details for a specific region including bounding box and GeoJSON geometry.

### `GET /api/v1/regions/{region_id}/fires`
Queries detections within the spatial polygon or bounding box of a specific region.

---

## 5. Analytics & Anomaly Detection Endpoints

### `GET /api/v1/analytics/summary`
Calculates aggregated high-level summary KPIs (total detections, total FRP, peak FRP, high-confidence count, day vs night distribution).

### `GET /api/v1/analytics/daily`
Computes daily aggregated observation counts and summed radiative power for activity calendars and timeline plots.

### `GET /api/v1/analytics/monthly`
Computes monthly aggregations across multiple years for seasonality inspection.

### `GET /api/v1/analytics/yearly`
Computes annual total fire counts and mean FRP across the 2020–2024 historical baseline.

### `GET /api/v1/analytics/frp`
Generates Fire Radiative Power intensity histogram bins (`0-10`, `10-50`, `50-100`, `100-500`, `500+` MW).

### `GET /api/v1/analytics/anomalies`
Calculates statistical climatological anomalies using multi-year day-of-year baselines:
- Compares observed daily counts against historical mean ($\mu$) and standard deviation ($\sigma$).
- Computes normalized Z-scores.
- Flags statistical anomalies ($Z > 2.0$) categorized as `elevated`, `severe`, or `critical`.

### `GET /api/v1/analytics/compare`
Produces direct comparative analytics between countries (e.g. Brazil vs Canada) across equivalent temporal periods.

### `GET /api/v1/analytics/harmonized`
Aggregates heterogeneous satellite observations (VIIRS 375m and MODIS 1km) into equal-area spatial grid cells (e.g. 0.1° resolution) without fabricating artificial cross-sensor scaling.

---

## 6. Ingestion Endpoints

### `GET /api/v1/ingestion/status`
Returns ingestion file status and database row count metrics.

### `GET /api/v1/ingestion/files/{file_id}/rejected`
Retrieves paginated records from `rejected_rows` for a specific ingestion job for auditing.
