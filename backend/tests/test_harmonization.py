import pytest
from app.services.harmonization_service import ResolutionHarmonizer
from app.schemas.detection import FrontendHotspot

def test_resolution_harmonizer_grid():
    harmonizer = ResolutionHarmonizer(grid_size_deg=0.1)
    
    hotspots = [
        FrontendHotspot(
            id="H1", name="Fire 1", country="Canada", stateOrRegion="Boreal",
            lat=52.123, lon=-114.456, frp=150.0, tempK=340.0, confidence=95.0,
            satellite="VIIRS", status="Critical", acres=3800, timeDetected="14:00 UTC",
            dateDetected="2024-06-15", region="Canada", year=2024, dayOfYear=167
        ),
        FrontendHotspot(
            id="H2", name="Fire 2", country="Canada", stateOrRegion="Boreal",
            lat=52.145, lon=-114.482, frp=90.0, tempK=330.0, confidence=80.0,
            satellite="VIIRS", status="High", acres=2200, timeDetected="14:00 UTC",
            dateDetected="2024-06-15", region="Canada", year=2024, dayOfYear=167
        ),
        FrontendHotspot(
            id="H3", name="Fire 3", country="Canada", stateOrRegion="Boreal",
            lat=54.500, lon=-118.000, frp=300.0, tempK=360.0, confidence=99.0,
            satellite="MODIS", status="Critical", acres=7600, timeDetected="18:30 UTC",
            dateDetected="2024-06-15", region="Canada", year=2024, dayOfYear=167
        )
    ]

    result = harmonizer.harmonize_hotspots(hotspots, grid_resolution_deg=0.1)
    assert result["total_input_detections"] == 3
    assert result["sensor_breakdown"]["VIIRS"]["count"] == 2
    assert result["sensor_breakdown"]["MODIS"]["count"] == 1
    assert len(result["grid_cells"]) >= 2
    assert "scientific_disclaimer" in result
