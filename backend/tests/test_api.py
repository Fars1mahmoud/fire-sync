import pytest

def test_health_endpoints(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data

    db_res = client.get("/api/v1/health/database")
    assert db_res.status_code == 200
    db_data = db_res.json()
    assert db_data["status"] == "connected"
    assert db_data["tables_count"] > 0
    assert "postgis_version" in db_data

def test_metadata_endpoint(client):
    res = client.get("/api/v1/metadata")
    assert res.status_code == 200
    data = res.json()
    assert "Brazil (BRA)" in data["geographic_coverage"]
    assert "VIIRS (NOAA-20 / JPSS-1 375m)" in data["sensors"]

def test_fires_query_and_pagination(client):
    res = client.get("/api/v1/fires?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "items" in data
    assert len(data["items"]) <= 10

def test_fires_filter_country(client):
    res = client.get("/api/v1/fires?country=CAN&page_size=5")
    assert res.status_code == 200
    data = res.json()
    for item in data["items"]:
        assert item["country_code"] == "CAN"

def test_fires_map_endpoint(client):
    res = client.get("/api/v1/fires/map?region=canada&limit=25")
    assert res.status_code == 200
    data = res.json()
    assert "hotspots" in data
    assert "count" in data
    if data["hotspots"]:
        h = data["hotspots"][0]
        assert "lat" in h
        assert "lon" in h
        assert "frp" in h
        assert "satellite" in h

def test_regions_endpoint(client):
    res = client.get("/api/v1/regions")
    assert res.status_code == 200
    regions = res.json()
    assert len(regions) >= 4
    region_ids = [r["id"] for r in regions]
    assert "brazil" in region_ids
    assert "canada" in region_ids

def test_ingestion_status_endpoint(client):
    res = client.get("/api/v1/ingestion/status")
    assert res.status_code == 200
    data = res.json()
    assert "total_files" in data
    assert "files" in data
