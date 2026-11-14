from typing import Dict, Any, List, Optional
from datetime import date
from pydantic import BaseModel, Field

class FeatureVector(BaseModel):
    region_id: str
    latitude: float
    longitude: float
    day_of_year: int
    historical_fire_frequency_7d: int
    recent_frp_max: float
    temp_c: Optional[float] = None
    rh_pct: Optional[float] = None
    wind_kmh: Optional[float] = None
    drought_index: Optional[float] = None

class RiskAssessment(BaseModel):
    target_date: str
    region_id: str
    relative_risk_score: float = Field(..., ge=0.0, le=100.0, description="Relative heuristic risk score (0-100)")
    risk_level: str = Field(..., description="'Low' | 'Moderate' | 'High' | 'Extreme' | 'Critical'")
    dominant_factors: List[str]
    model_status: str = Field(
        default="HEURISTIC_BASELINE_ONLY",
        description="Indicates that model is an analytical baseline; machine learning training requires verified labels and meteorological features."
    )
    is_calibrated_probability: bool = False

class FireRiskPipeline:
    """
    Modular Machine Learning Architecture for Wildfire Risk Forecasting.
    Separates feature extraction, temporal splitting, and inference.
    Does NOT fabricate pseudo-predictions or claim unvalidated ML readiness.
    """

    @staticmethod
    def extract_features(
        region_id: str,
        lat: float,
        lon: float,
        obs_date: date,
        active_fires_count: int,
        max_frp: float,
        weather: Optional[Dict[str, Any]] = None
    ) -> FeatureVector:
        doy = obs_date.timetuple().tm_yday
        w = weather or {}
        return FeatureVector(
            region_id=region_id,
            latitude=lat,
            longitude=lon,
            day_of_year=doy,
            historical_fire_frequency_7d=active_fires_count,
            recent_frp_max=max_frp,
            temp_c=w.get("temperature_c"),
            rh_pct=w.get("relative_humidity_pct"),
            wind_kmh=w.get("wind_speed_kmh"),
            drought_index=w.get("drought_index_val")
        )

    @staticmethod
    def compute_relative_risk(features: FeatureVector) -> RiskAssessment:
        """
        Computes a transparent relative risk score from physical drivers
        (thermal anomalies, climatology, and wind).
        """
        score = 20.0 # Base background risk
        factors = []

        # 1. Thermal hotspot density
        if features.historical_fire_frequency_7d > 50:
            score += 35.0
            factors.append(f"High hotspot concentration ({features.historical_fire_frequency_7d} active satellite detections)")
        elif features.historical_fire_frequency_7d > 10:
            score += 20.0
            factors.append("Active localized fire activity detected")

        # 2. Fire Radiative Power (intensity)
        if features.recent_frp_max > 250.0:
            score += 25.0
            factors.append(f"High Fire Radiative Power ({features.recent_frp_max:.1f} MW)")
        elif features.recent_frp_max > 50.0:
            score += 15.0
            factors.append("Moderate thermal intensity")

        # 3. Weather drivers if present
        if features.temp_c and features.temp_c > 32.0:
            score += 10.0
            factors.append(f"High ambient temperature ({features.temp_c}°C)")
        if features.rh_pct and features.rh_pct < 30.0:
            score += 10.0
            factors.append(f"Critically dry air (RH {features.rh_pct}%)")

        final_score = min(98.0, round(score, 1))
        
        if final_score >= 80.0:
            level = "Critical"
        elif final_score >= 60.0:
            level = "Extreme"
        elif final_score >= 40.0:
            level = "High"
        elif final_score >= 25.0:
            level = "Moderate"
        else:
            level = "Low"

        return RiskAssessment(
            target_date=str(date.today()),
            region_id=features.region_id,
            relative_risk_score=final_score,
            risk_level=level,
            dominant_factors=factors or ["Baseline seasonal background"],
            model_status="HEURISTIC_BASELINE_ONLY",
            is_calibrated_probability=False
        )
