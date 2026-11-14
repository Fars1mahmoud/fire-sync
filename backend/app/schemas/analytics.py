from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class DailyActivityPoint(BaseModel):
    date: str
    count: int
    total_frp: float
    avg_frp: float
    max_frp: float
    high_confidence_count: int

class MonthlyActivityPoint(BaseModel):
    year: int
    month: int
    month_name: str
    count: int
    total_frp: float
    avg_frp: float

class YearlyActivityPoint(BaseModel):
    year: int
    count: int
    total_frp: float
    avg_frp: float
    peak_date: Optional[str] = None
    peak_count: Optional[int] = 0

class FRPDistributionBin(BaseModel):
    range_label: str
    min_frp: float
    max_frp: float
    count: int
    percentage: float

class AnomalyPoint(BaseModel):
    month: str
    historical_baseline: int
    current_count: int
    anomaly_delta: int
    anomaly_percentage: float
    is_anomaly: bool

class ComparisonSummary(BaseModel):
    current_period: Dict[str, Any]
    baseline_period: Dict[str, Any]
    change_pct: float
    frp_change_pct: float
    interpretation: str

class AnalyticsSummaryResponse(BaseModel):
    total_detections: int
    total_frp_mw: float
    avg_frp_mw: float
    max_frp_mw: float
    high_confidence_pct: float
    day_pct: float
    night_pct: float
    vegetation_fires_pct: float
    date_range: Dict[str, str]

class HistoricalOverviewResponse(BaseModel):
    region: str
    country_code: Optional[str] = None
    metrics: List[Dict[str, Any]]
    yearly_bars: List[Dict[str, Any]]
    seasonal_pattern: List[Dict[str, Any]]
    heatmap_years: List[str]
    heatmap_months: List[str]
    heatmap_rows: List[Dict[str, Any]]
    year_comparison: List[Dict[str, Any]]


class FireRiskHotspot(BaseModel):
    id: str
    name: str
    state: str
    xPercent: float
    yPercent: float
    latitude: float
    longitude: float
    riskScore: int
    level: str  # 'critical' | 'high' | 'moderate' | 'low'
    temperature: str
    droughtIndex: int
    windSpeed: str
    activeHotspots: int
    timestamp: str
    frp: float
    confidence: float
    satellite: str


class FireRiskStat(BaseModel):
    level: str
    label: str
    count: int
    color: str
    range: str
    percentage: float


class FireRiskTrendPoint(BaseModel):
    timeLabel: str
    high: int
    moderate: int
    low: int


class FireRiskOverviewResponse(BaseModel):
    country: str
    period: str
    active_inputs: Dict[str, bool]
    stats: List[FireRiskStat]
    hotspots: List[FireRiskHotspot]
    trend: List[FireRiskTrendPoint]
    total_zones: int
    model_metadata: Dict[str, Any]

