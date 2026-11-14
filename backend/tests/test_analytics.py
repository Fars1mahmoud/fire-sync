import pytest

def test_analytics_summary(client):
    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_detections" in data
    assert "total_frp_mw" in data
    assert "high_confidence_pct" in data

def test_analytics_daily(client):
    res = client.get("/api/v1/analytics/daily?limit=30")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)

def test_analytics_monthly(client):
    res = client.get("/api/v1/analytics/monthly?year=2024")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 12

def test_analytics_yearly(client):
    res = client.get("/api/v1/analytics/yearly")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)

def test_analytics_frp_distribution(client):
    res = client.get("/api/v1/analytics/frp")
    assert res.status_code == 200
    bins = res.json()
    assert len(bins) == 5

def test_analytics_anomalies(client):
    res = client.get("/api/v1/analytics/anomalies?year=2024")
    assert res.status_code == 200
    anomalies = res.json()
    assert len(anomalies) == 12
    for a in anomalies:
        assert "historical_baseline" in a
        assert "current_count" in a
        assert "is_anomaly" in a

def test_analytics_compare(client):
    res = client.get("/api/v1/analytics/compare")
    assert res.status_code == 200
    data = res.json()
    assert "brazil" in data
    assert "canada" in data
