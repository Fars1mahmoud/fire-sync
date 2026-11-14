import math
from typing import List, Dict, Any, Optional
from collections import defaultdict
from app.schemas.detection import FrontendHotspot

class ResolutionHarmonizer:
    """
    Dedicated spatial and sensor harmonization engine.
    Aggregates VIIRS (375m) and MODIS (1000m) native thermal anomalies
    into an analytical common equal-area or regular latitude/longitude grid cell
    without conflating raw physical detections or applying arbitrary scaling factors.
    """

    def __init__(self, grid_size_deg: float = 0.1):
        """
        grid_size_deg: Spatial resolution of the common analysis grid in degrees
                       (0.1 deg is approximately 11.1 km at the equator).
        """
        self.grid_size_deg = grid_size_deg

    def snap_to_grid(self, lat: float, lon: float) -> tuple[float, float]:
        """Snaps coordinate to grid cell centroid"""
        cell_lat = round(math.floor(lat / self.grid_size_deg) * self.grid_size_deg + (self.grid_size_deg / 2.0), 4)
        cell_lon = round(math.floor(lon / self.grid_size_deg) * self.grid_size_deg + (self.grid_size_deg / 2.0), 4)
        return cell_lat, cell_lon

    def harmonize_hotspots(
        self,
        hotspots: List[FrontendHotspot],
        grid_resolution_deg: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Aggregates raw hotspot detections into a common analytical grid.
        Separates VIIRS vs MODIS statistics to preserve sensor transparency.
        """
        grid_size = grid_resolution_deg or self.grid_size_deg
        cells = defaultdict(lambda: {
            "cell_lat": 0.0,
            "cell_lon": 0.0,
            "total_detections": 0,
            "total_frp_mw": 0.0,
            "max_frp_mw": 0.0,
            "viirs_count": 0,
            "modis_count": 0,
            "viirs_frp_mw": 0.0,
            "modis_frp_mw": 0.0,
            "highest_confidence": 0.0,
            "sample_hotspot_ids": []
        })

        sensor_breakdown = {
            "VIIRS": {"count": 0, "total_frp": 0.0, "nominal_footprint_m": 375},
            "MODIS": {"count": 0, "total_frp": 0.0, "nominal_footprint_m": 1000}
        }

        for h in hotspots:
            cell_lat, cell_lon = self.snap_to_grid(h.lat, h.lon)
            key = (cell_lat, cell_lon)
            cell = cells[key]
            
            cell["cell_lat"] = cell_lat
            cell["cell_lon"] = cell_lon
            cell["total_detections"] += 1
            cell["total_frp_mw"] += h.frp
            if h.frp > cell["max_frp_mw"]:
                cell["max_frp_mw"] = h.frp
            if h.confidence > cell["highest_confidence"]:
                cell["highest_confidence"] = h.confidence
            if len(cell["sample_hotspot_ids"]) < 5:
                cell["sample_hotspot_ids"].append(h.id)

            inst_key = "VIIRS" if "VIIRS" in h.satellite.upper() else "MODIS"
            if inst_key == "VIIRS":
                cell["viirs_count"] += 1
                cell["viirs_frp_mw"] += h.frp
                sensor_breakdown["VIIRS"]["count"] += 1
                sensor_breakdown["VIIRS"]["total_frp"] += h.frp
            else:
                cell["modis_count"] += 1
                cell["modis_frp_mw"] += h.frp
                sensor_breakdown["MODIS"]["count"] += 1
                sensor_breakdown["MODIS"]["total_frp"] += h.frp

        # Compile grid cell summaries
        grid_cells = []
        for (clat, clon), cdata in cells.items():
            grid_cells.append({
                "cell_centroid": {"lat": clat, "lon": clon},
                "total_detections": cdata["total_detections"],
                "total_frp_mw": round(cdata["total_frp_mw"], 1),
                "max_frp_mw": round(cdata["max_frp_mw"], 1),
                "sensor_counts": {
                    "VIIRS": cdata["viirs_count"],
                    "MODIS": cdata["modis_count"]
                },
                "highest_confidence": round(cdata["highest_confidence"], 1),
                "hotspot_samples": cdata["sample_hotspot_ids"]
            })

        return {
            "grid_resolution_deg": grid_size,
            "nominal_cell_km": round(grid_size * 111.0, 1),
            "total_input_detections": len(hotspots),
            "total_grid_cells": len(grid_cells),
            "sensor_breakdown": {
                k: {
                    "count": v["count"],
                    "total_frp_mw": round(v["total_frp"], 1),
                    "nominal_footprint_m": v["nominal_footprint_m"]
                }
                for k, v in sensor_breakdown.items()
            },
            "scientific_disclaimer": (
                "Spatial harmonization aggregates discrete detections into a uniform geographical grid cell "
                "for cross-comparison. VIIRS (375m I-Band) detects significantly smaller and cooler thermal anomalies "
                "than MODIS (1km). Detections are NOT merged or altered to preserve scientific integrity."
            ),
            "grid_cells": sorted(grid_cells, key=lambda c: c["total_frp_mw"], reverse=True)
        }
