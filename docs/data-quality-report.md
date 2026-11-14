# NASA FIRMS Wildfire Dataset Quality & Audit Report

**Date of Audit:** October 10, 2026  
**Platform:** Fire Intelligence Platform  
**Data Sources:** Brazil (2020–2024) & Canada (2020–2024) NASA FIRMS Satellite Observations  

---

## 1. Executive Summary

A comprehensive automated audit was conducted on all CSV datasets residing in the `brazil/` and `canada/` directories. All files were parsed, schema-validated, and verified for spatial and temporal integrity.

- **Total CSV Files Discovered:** 10 files (5 Brazil, 5 Canada)
- **Total Historical Observations:** **10,871,712** records
- **Total Raw Size on Disk:** **849.03 MB** (~0.83 GB)
- **Time Coverage:** January 1, 2020 – December 31, 2024 (5 full calendar years)
- **Spatial Coverage:** 
  - Latitude: `-33.7397°` to `+81.1716°`
  - Longitude: `-141.0038°` to `-34.7002°`
- **Invalid Coordinate Count:** `0` (100% of rows have valid coordinates within `[-90, 90]` and `[-180, 180]`)
- **Missing Required Columns:** `0` across all files

---

## 2. Dataset Inventory & File Breakdown

| Country | File Name | Size (MB) | Observation Count | Date Range (Min - Max) | Delimiter |
|:---|:---|:---:|:---:|:---:|:---:|
| **Brazil** | `viirs-jpss1_2020_Brazil.csv` | 127.50 | 1,633,648 | 2020-01-01 to 2020-12-31 | `,` |
| **Brazil** | `viirs-jpss1_2021_Brazil.csv` | 101.85 | 1,304,753 | 2021-01-01 to 2021-12-31 | `,` |
| **Brazil** | `viirs-jpss1_2022_Brazil.csv` | 113.23 | 1,452,881 | 2022-01-01 to 2022-12-31 | `,` |
| **Brazil** | `viirs-jpss1_2023_Brazil.csv` | 102.24 | 1,312,648 | 2023-01-01 to 2023-12-31 | `,` |
| **Brazil** | `viirs-jpss1_2024_Brazil.csv` | 154.99 | 1,988,404 | 2024-01-01 to 2024-12-31 | `,` |
| **Canada** | `viirs-jpss1_2020_Canada.csv` | 3.73 | 47,623 | 2020-01-01 to 2020-12-31 | `,` |
| **Canada** | `viirs-jpss1_2021_Canada.csv` | 36.59 | 467,782 | 2021-01-01 to 2021-12-31 | `,` |
| **Canada** | `viirs-jpss1_2022_Canada.csv` | 13.88 | 176,869 | 2022-01-01 to 2022-12-31 | `,` |
| **Canada** | `viirs-jpss1_2023_Canada.csv` | 131.78 | 1,681,190 | 2023-01-01 to 2023-12-31 | `,` |
| **Canada** | `viirs-jpss1_2024_Canada.csv` | 63.24 | 805,914 | 2024-01-01 to 2024-12-31 | `,` |
| **TOTAL** | **10 Files** | **849.03 MB** | **10,871,712** | **2020-01-01 to 2024-12-31** | |

### Subtotals by Country:
- **Brazil:** 7,692,334 observations (70.76% of total)
- **Canada:** 3,179,378 observations (29.24% of total)

---

## 3. Schema Homogeneity & Column Consistency

All 10 CSV files share an identical 15-column NASA FIRMS JPSS-1 VIIRS layout:

```text
latitude, longitude, bright_ti4, scan, track, acq_date, acq_time, satellite, instrument, confidence, version, bright_ti5, frp, daynight, type
```

There are zero missing columns and zero unexpected schema deviations across the files.

---

## 4. Column Statistical Distribution & Data Quality

### 4.1 Satellite & Instrument Metadata
- `satellite`: 100% `N20` (NOAA-20 / JPSS-1 spacecraft).
- `instrument`: 100% `VIIRS` (Visible Infrared Imaging Radiometer Suite 375m I-Band).
- `version`: 100% `2` (NASA FIRMS Product Collection 2).

### 4.2 Confidence Levels
In the VIIRS 375m product, confidence is categorized into three qualitative tiers:
- **Nominal (`n`):** 9,463,930 records (**87.05%**)
- **Low (`l`):** 814,062 records (**7.49%**)
- **High (`h`):** 593,720 records (**5.46%**)

*Normalization Strategy:* Stored as raw string (`n`, `l`, `h`), and normalized to numeric scalar percentages (`70.0%`, `30.0%`, `95.0%`) for cross-sensor comparison with MODIS 0–100% numeric values.

### 4.3 Day / Night Distribution
- **Daytime (`D`):** 6,430,282 records (**59.15%**)
- **Nighttime (`N`):** 4,441,430 records (**40.85%**)

### 4.4 Detection Type
NASA FIRMS categorizes thermal anomalies into four classes:
- **Type 0 (Presumed vegetation fire):** 10,670,395 records (**98.15%**)
- **Type 2 (Other static land source / Industrial / Gas flares):** 115,442 records (**1.06%**)
- **Type 3 (Offshore detection / Oil rigs):** 85,875 records (**0.79%**)
- **Type 1 (Active volcano):** 0 records

*Operational Rule:* By default, fire risk analytics and wildfire maps filter for `type = 0` (or allow user toggles) to prevent industrial refinery flares from skewing wildfire statistics.

### 4.5 Fire Radiative Power (FRP)
- **Minimum Value:** `-3.8 MW`
- **Maximum Value:** `2,966.53 MW`
- **Median Range:** `2.5 – 15.0 MW`

*Quality Finding:* Minor negative FRP values (e.g. `-3.8 MW`) occur infrequently in raw satellite data due to background temperature subtraction artifacts.  
*Ingestion Strategy:* Negative values are clamped to `0.0 MW` while preserving the unedited raw value in `raw_properties.original_frp` for auditing.

### 4.6 Brightness Temperatures
- `bright_ti4` (3.75 µm channel): `0.0 K` to `367.0 K` (mean ~`325 K`)
- `bright_ti5` (11.0 µm channel): `192.41 K` to `381.17 K` (mean ~`290 K`)

---

## 5. Deduplication and Idempotency Policy

1. **Deterministic Fingerprint:** Each observation is indexed by `(round(lat, 4), round(lon, 4), acq_date, acq_time, satellite, instrument)`.
2. **File Checksum Tracking:** The SHA-256 fingerprint of each source CSV is calculated prior to ingestion. If a file checksum already exists in `ingestion_files` with status `COMPLETED`, the file is skipped automatically.
3. **Re-import Safety:** Passing `--force` resets the tracking record and safely re-loads data without corrupting database integrity.
