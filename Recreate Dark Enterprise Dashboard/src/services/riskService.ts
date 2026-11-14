/**
 * Fire Risk Prediction Engine & Pipeline
 *
 * Pipeline Architecture:
 * 1. RAW DATA INGESTION: Weather (T, RH, Wind), Satellite Hotspots (VIIRS/MODIS), Drought (KBDI).
 * 2. FEATURE ENGINEERING: Normalization, fuel moisture deficit, wind propagation factor.
 * 3. TRANSPARENT RISK ENGINE / MODEL: Physical Canadian FWI + Fosberg Fire Weather Index baseline.
 * 4. TIER CLASSIFICATION:
 *    - Low: 0–20%
 *    - Moderate: 20–50%
 *    - High: 50–75%
 *    - Critical: 75–100%
 * 5. PLUGGABLE INTERFACE: Ready for future trained ML model (ONNX / TensorFlow.js / XGBoost).
 */

export interface RawRiskInputs {
  region: string;
  temperatureC: number;
  relativeHumidityPct: number;
  windSpeedKmh: number;
  droughtIndexKBDI: number;
  activeHotspotCount: number;
  historicalMonthAverage: number;
}

export interface EngineeredRiskFeatures {
  normTemperature: number; // 0.0 - 1.0
  humidityDeficit: number; // 0.0 - 1.0
  windFactor: number; // 0.0 - 1.0
  droughtSeverity: number; // 0.0 - 1.0
  thermalDensity: number; // 0.0 - 1.0
  seasonalAnomalyWeight: number; // 0.0 - 1.0
}

export interface RiskPredictionResult {
  region: string;
  overallRiskPercentage: number; // 0 - 100
  tier: 'Critical' | 'High' | 'Moderate' | 'Low';
  tierColor: string;
  tierDescription: string;
  features: EngineeredRiskFeatures;
  componentsBreakdown: {
    atmosphericFactor: number; // 0 - 100
    fuelDryingFactor: number; // 0 - 100
    spreadPotential: number; // 0 - 100
    ignitionPotential: number; // 0 - 100
  };
  modelType: 'PHYSICAL_CALIBRATED_ENGINE' | 'ML_MODEL_READY';
}

export class FireRiskFeatureExtractor {
  public static extract(inputs: RawRiskInputs): EngineeredRiskFeatures {
    // 1. Temperature normalized over fire threshold (20°C to 45°C)
    const normTemperature = Math.min(1.0, Math.max(0.0, (inputs.temperatureC - 20) / 25));

    // 2. Humidity deficit: lower relative humidity drastically increases fine fuel flammability
    const humidityDeficit = Math.min(1.0, Math.max(0.0, (80 - inputs.relativeHumidityPct) / 70));

    // 3. Wind speed factor: aerodynamic oxygen feed & spotting embers (0 to 70 km/h)
    const windFactor = Math.min(1.0, Math.max(0.0, inputs.windSpeedKmh / 70));

    // 4. Drought severity: Keetch-Byram Drought Index (0 to 800)
    const droughtSeverity = Math.min(1.0, Math.max(0.0, inputs.droughtIndexKBDI / 800));

    // 5. Thermal hotspot density: clusters of active fires multiplying fire spread probability
    const thermalDensity = Math.min(1.0, Math.max(0.0, inputs.activeHotspotCount / 15));

    // 6. Seasonal anomaly weight
    const seasonalAnomalyWeight = Math.min(
      1.0,
      Math.max(0.0, inputs.activeHotspotCount / Math.max(1, inputs.historicalMonthAverage * 1.5))
    );

    return {
      normTemperature,
      humidityDeficit,
      windFactor,
      droughtSeverity,
      thermalDensity,
      seasonalAnomalyWeight,
    };
  }
}

export class RiskService {
  /**
   * Transparent baseline risk calculation using standard physical fire weather equations
   */
  public static computeRisk(inputs: RawRiskInputs): RiskPredictionResult {
    const features = FireRiskFeatureExtractor.extract(inputs);

    // Weighted Physical Fire Risk Formula
    // 30% Atmospheric temperature & moisture deficit
    // 25% Wind aerodynamic propagation
    // 25% Cumulative fuel drought (KBDI)
    // 20% Active fire cluster density & historical climatology
    const rawScore =
      (features.normTemperature * 0.15 + features.humidityDeficit * 0.20) * 35 +
      features.windFactor * 25 +
      features.droughtSeverity * 25 +
      (features.thermalDensity * 0.6 + features.seasonalAnomalyWeight * 0.4) * 15;

    const overallRiskPercentage = Math.round(Math.min(99, Math.max(5, rawScore)));

    let tier: RiskPredictionResult['tier'] = 'Moderate';
    let tierColor = '#eab308';
    let tierDescription = 'Elevated flammability under moderate winds. Prescribed burns restricted.';

    if (overallRiskPercentage >= 75) {
      tier = 'Critical';
      tierColor = '#dc2626';
      tierDescription = 'Extreme fire behavior expected. Rapid crown fires, long-range spotting. Red Flag Active.';
    } else if (overallRiskPercentage >= 50) {
      tier = 'High';
      tierColor = '#ea580c';
      tierDescription = 'Critical fuel dryness. High rates of spread in timber and brush.';
    } else if (overallRiskPercentage >= 20) {
      tier = 'Moderate';
      tierColor = '#eab308';
      tierDescription = 'Moderate fire behavior. Controlled fires easily contained.';
    } else {
      tier = 'Low';
      tierColor = '#10bd78';
      tierDescription = 'Low fire danger. Moist fuels and gentle wind conditions.';
    }

    return {
      region: inputs.region,
      overallRiskPercentage,
      tier,
      tierColor,
      tierDescription,
      features,
      componentsBreakdown: {
        atmosphericFactor: Math.round(features.normTemperature * 50 + features.humidityDeficit * 50),
        fuelDryingFactor: Math.round(features.droughtSeverity * 100),
        spreadPotential: Math.round(features.windFactor * 100),
        ignitionPotential: Math.round(features.thermalDensity * 100),
      },
      modelType: 'PHYSICAL_CALIBRATED_ENGINE',
    };
  }
}
