from typing import List, Optional, Dict, Any
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    DailyActivityPoint,
    MonthlyActivityPoint,
    YearlyActivityPoint,
    FRPDistributionBin,
    AnomalyPoint,
    AnalyticsSummaryResponse,
    HistoricalOverviewResponse,
    FireRiskOverviewResponse
)

router = APIRouter(prefix="/analytics", tags=["Historical Analytics & Anomalies"])

@router.get("/fire-risk", response_model=FireRiskOverviewResponse)
@router.get("/risk-overview", response_model=FireRiskOverviewResponse)
def get_fire_risk_overview(
    country: Optional[str] = Query("BRA", description="Country code (BRA, CAN, EGY, ALL)"),
    period: str = Query("Next 24 Hours", description="Prediction period (Next 12 Hours, Next 24 Hours, Next 72 Hours, Next 7 Days)"),
    temperature: bool = Query(True, description="Enable temperature factor"),
    drought: bool = Query(True, description="Enable drought factor"),
    weather: bool = Query(True, description="Enable weather/wind factor"),
    history: bool = Query(True, description="Enable historical cluster factor"),
    db: Session = Depends(get_db)
):
    """
    Predictive Fire Risk modeling endpoint:
    Aggregates real satellite detections, physical fuel indices, meteorological factors,
    and returns tactical hotspots, statistical risk distributions, and multi-horizon trend curves.
    """
    service = AnalyticsService(db)
    return service.get_fire_risk_overview(
        country=country,
        period=period,
        active_inputs={
            "temperature": temperature,
            "drought": drought,
            "weather": weather,
            "history": history
        }
    )

@router.get("/historical-overview", response_model=HistoricalOverviewResponse)
def get_historical_overview(
    country: Optional[str] = Query(None, description="Country filter (BRA, CAN, EGY, GRC, USA, ALL)"),
    confidence: Optional[str] = Query(None, description="Confidence filter (all, high)"),
    db: Session = Depends(get_db)
):
    """
    Consolidated historical overview for FireBoard Analytics:
    Headline KPIs, yearly bar breakdown, seasonal pattern curve, heatmap matrix, and comparison table.
    """
    service = AnalyticsService(db)
    return service.get_historical_overview(country=country, confidence=confidence)


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    country: Optional[str] = Query(None, description="Country filter (BRA, CAN)"),
    year: Optional[int] = Query(None, description="Year filter (e.g. 2024)"),
    db: Session = Depends(get_db)
):
    """Computes headline dashboard metrics (total count, FRP sum, high confidence %, day/night %)"""
    service = AnalyticsService(db)
    return service.get_summary_metrics(country=country, year=year)

@router.get("/daily", response_model=List[DailyActivityPoint])
def get_daily_activity(
    country: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(365, ge=1, le=1825),
    db: Session = Depends(get_db)
):
    """Daily fire detection timeline and radiative power trends"""
    service = AnalyticsService(db)
    return service.get_daily_activity(
        country=country,
        year=year,
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )

@router.get("/monthly", response_model=List[MonthlyActivityPoint])
def get_monthly_activity(
    country: Optional[str] = Query(None),
    year: int = Query(2024, ge=2000, le=2030),
    db: Session = Depends(get_db)
):
    """Monthly fire activity breakdown across all 12 months for seasonal analysis"""
    service = AnalyticsService(db)
    return service.get_monthly_activity(country=country, year=year)

@router.get("/yearly", response_model=List[YearlyActivityPoint])
def get_yearly_trends(
    country: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Multi-year historical activity trend (2020 through 2024)"""
    service = AnalyticsService(db)
    return service.get_yearly_trends(country=country)

@router.get("/frp", response_model=List[FRPDistributionBin])
def get_frp_distribution(
    country: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Histogram distribution of Fire Radiative Power (MW) categories"""
    service = AnalyticsService(db)
    return service.get_frp_distribution(country=country, year=year)

@router.get("/anomalies", response_model=List[AnomalyPoint])
def get_anomalies(
    country: Optional[str] = Query(None),
    year: int = Query(2024, ge=2020, le=2024),
    db: Session = Depends(get_db)
):
    """
    Computes climatological anomaly deviations against multi-year historical baselines.
    Highlights unseasonal surges or extreme wildfire episodes.
    """
    service = AnalyticsService(db)
    return service.get_anomalies(country=country, year=year)

@router.get("/compare")
def compare_regions(db: Session = Depends(get_db)):
    """Comparative analysis contrasting Brazil (Amazon/Cerrado) vs Canada (Boreal) wildfire dynamics"""
    service = AnalyticsService(db)
    return service.compare_regions()
