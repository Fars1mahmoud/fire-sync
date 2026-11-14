export type PredictionPeriod = 'Next 12 Hours' | 'Next 24 Hours' | 'Next 72 Hours' | 'Next 7 Days';

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface RiskStat {
  level: RiskLevel;
  label: string;
  count: number;
  color: string;
  range: string;
  percentage: number;
}

export interface ModelInputConfig {
  id: 'temperature' | 'drought' | 'weather' | 'history';
  label: string;
  labelAr: string;
  icon: string;
  value: string;
  active: boolean;
  unit: string;
  impactScore: number;
}

export interface Hotspot {
  id: string;
  name: string;
  state: string;
  xPercent: number; // Position on region map (percentage 0-100)
  yPercent: number;
  latitude?: number;
  longitude?: number;
  riskScore: number;
  level: RiskLevel;
  temperature: string;
  droughtIndex: number;
  windSpeed: string;
  activeHotspots: number;
  timestamp: string;
  frp?: number;
  confidence?: number;
  satellite?: string;
}

export interface TrendDataPoint {
  timeLabel: string;
  high: number;
  moderate: number;
  low: number;
}

export interface ModelMetadata {
  fwi?: number;
  kbdi?: number;
  ffmc?: number;
  dmc?: number;
  dc?: number;
  isi?: number;
  bui?: number;
  total_satellite_detections_evaluated?: number;
  satellites?: string[];
  engine_version?: string;
}

export interface FireRiskOverviewResponse {
  country: string;
  period: string;
  active_inputs: Record<string, boolean>;
  stats: RiskStat[];
  hotspots: Hotspot[];
  trend: TrendDataPoint[];
  total_zones: number;
  model_metadata: ModelMetadata;
}
