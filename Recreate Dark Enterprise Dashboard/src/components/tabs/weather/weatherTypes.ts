export type MetricMode = 'temperature' | 'wind' | 'humidity' | 'drought';

export type Language = 'en' | 'ar';

export interface StationData {
  id: string;
  name: string;
  nameAr?: string;
  code: string;
  xPercent: number; // 0 to 100 on map
  yPercent: number; // 0 to 100 on map
  temp: number;
  condition: string;
  windSpeed: number;
  windDir: string;
  humidity: number;
  droughtIndex: number;
  rainfall24h: number;
  status: 'Normal' | 'Moderate' | 'High' | 'Extreme';
  alertCount: number;
}

export interface ExposureItem {
  id: string;
  district: string;
  districtAr: string;
  status: string;
  statusAr: string;
  maxExp: string;
  riskLevel: 'Normal' | 'Moderate' | 'High' | 'Extreme';
  riskColor: string;
}

export interface RadarOutlookItem {
  id: string;
  station: string;
  stationAr: string;
  forecast: string;
  rainProb: string;
  moisture: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskColor: string;
}

export interface ForecastDayItem {
  id: string;
  dayName: string;
  dayNameAr: string;
  dateStr: string;
  temp: number;
  tempHigh: number;
  tempLow: number;
  condition: string;
  conditionAr: string;
  iconType: 'sun' | 'cloud-sun' | 'rain-cloud' | 'radar-thumbnail';
  isRadarThumbnail?: boolean;
  radarLabel?: string;
  radarLabelAr?: string;
  windSpeed: number;
  humidity: number;
  droughtScore: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  unit: string;
}

export interface RegionData {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  current: {
    temp: number;
    condition: string;
    conditionAr: string;
    windSpeed: number;
    windDirection: string;
    windDirectionAr: string;
    windDegrees: number;
    humidity: number;
    droughtIndex: number;
    droughtSeverity: 'Moderate' | 'High' | 'Severe' | 'Extreme';
    droughtSeverityAr: string;
    pressure: number;
    uvIndex: number;
    airQuality: string;
    updatedAt: string;
  };
  forecast: ForecastDayItem[];
  alertCounts: {
    affectedInfra: number;
    threatScore: number;
    priorityAreas: number;
    alertSectors: number;
  };
  exposureList: ExposureItem[];
  radarOutlook: RadarOutlookItem[];
  stations: StationData[];
  charts: {
    temperature: ChartDataPoint[];
    wind: ChartDataPoint[];
    humidity: ChartDataPoint[];
    drought: ChartDataPoint[];
  };
}
