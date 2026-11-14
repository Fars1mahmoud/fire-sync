/**
 * Typed API Client for Fire Intelligence Backend
 * Connects frontend dashboard components to FastAPI endpoints.
 */

export const getApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export interface BackendHealth {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface DatabaseHealth {
  status: string;
  database: string;
  postgis_version: string;
  tables_count: number;
  detections_count: number;
  countries_count: number;
}

export interface MapHotspotRecord {
  id: string;
  name: string;
  country: string;
  stateOrRegion: string;
  lat: number;
  lon: number;
  frp: number;
  tempK: number;
  confidence: number;
  satellite: 'VIIRS' | 'MODIS' | string;
  status: 'Critical' | 'High' | 'Contained';
  acres: number;
  timeDetected: string;
  dateDetected: string;
  region: string;
  year: number;
  dayOfYear: number;
  normalizedAreaWeight?: number;
}

export interface MapHotspotsResponse {
  count: number;
  total_in_query: number;
  sampled: boolean;
  hotspots: MapHotspotRecord[];
}

export interface AnalyticsSummary {
  total_detections: number;
  total_frp_mw: number;
  avg_frp_mw: number;
  max_frp_mw: number;
  high_confidence_pct: number;
  day_pct: number;
  night_pct: number;
  vegetation_fires_pct: number;
  date_range: { start: string; end: string };
}

export interface AnomalyItem {
  month: string;
  historical_baseline: number;
  current_count: number;
  anomaly_delta: number;
  anomaly_percentage: number;
  is_anomaly: boolean;
}

export interface DailyActivityItem {
  date: string;
  count: number;
  total_frp: number;
  avg_frp: number;
  max_frp: number;
  high_confidence_count: number;
}

export class ApiClient {
  private static backendAvailable: boolean = true;
  private static lastHealthCheckTime: number = 0;

  public static async checkHealth(): Promise<boolean> {
    const now = Date.now();
    // Cache health check for 10 seconds
    if (now - this.lastHealthCheckTime < 10000) {
      return this.backendAvailable;
    }
    this.lastHealthCheckTime = now;
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      this.backendAvailable = res.ok;
      return res.ok;
    } catch {
      this.backendAvailable = false;
      return false;
    }
  }

  public static isConnected(): boolean {
    return this.backendAvailable;
  }

  public static async fetchMapHotspots(params: {
    region?: string;
    country?: string;
    year?: number;
    dateDetected?: string;
    instrument?: string;
    minLat?: number;
    maxLat?: number;
    minLon?: number;
    maxLon?: number;
    limit?: number;
  } = {}): Promise<MapHotspotsResponse | null> {
    try {
      const query = new URLSearchParams();
      if (params.region) query.set('region', params.region);
      if (params.country) query.set('country', params.country);
      if (params.year) query.set('year', String(params.year));
      if (params.dateDetected) query.set('date_detected', params.dateDetected);
      if (params.instrument) query.set('instrument', params.instrument);
      if (params.minLat !== undefined) query.set('min_lat', String(params.minLat));
      if (params.maxLat !== undefined) query.set('max_lat', String(params.maxLat));
      if (params.minLon !== undefined) query.set('min_lon', String(params.minLon));
      if (params.maxLon !== undefined) query.set('max_lon', String(params.maxLon));
      if (params.limit !== undefined) query.set('limit', String(params.limit));

      const res = await fetch(`${API_BASE_URL}/fires/map?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(1200),
      });

      if (!res.ok) return null;
      this.backendAvailable = true;
      return (await res.json()) as MapHotspotsResponse;
    } catch (err) {
      this.backendAvailable = false;
      return null;
    }
  }

  public static async fetchAnalyticsSummary(params: {
    country?: string;
    year?: number;
  } = {}): Promise<AnalyticsSummary | null> {
    try {
      const query = new URLSearchParams();
      if (params.country) query.set('country', params.country);
      if (params.year) query.set('year', String(params.year));

      const res = await fetch(`${API_BASE_URL}/analytics/summary?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return (await res.json()) as AnalyticsSummary;
    } catch {
      return null;
    }
  }

  public static async fetchDailyActivity(params: {
    country?: string;
    year?: number;
    limit?: number;
  } = {}): Promise<DailyActivityItem[] | null> {
    try {
      const query = new URLSearchParams();
      if (params.country) query.set('country', params.country);
      if (params.year) query.set('year', String(params.year));
      if (params.limit) query.set('limit', String(params.limit));

      const res = await fetch(`${API_BASE_URL}/analytics/daily?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return (await res.json()) as DailyActivityItem[];
    } catch {
      return null;
    }
  }

  public static async fetchAnomalies(params: {
    country?: string;
    year?: number;
  } = {}): Promise<AnomalyItem[] | null> {
    try {
      const query = new URLSearchParams();
      if (params.country) query.set('country', params.country);
      if (params.year) query.set('year', String(params.year));

      const res = await fetch(`${API_BASE_URL}/analytics/anomalies?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return (await res.json()) as AnomalyItem[];
    } catch {
      return null;
    }
  }

  public static async fetchHistoricalOverview(params: {
    country?: string;
    confidence?: string;
  } = {}): Promise<HistoricalOverviewData | null> {
    try {
      const query = new URLSearchParams();
      if (params.country) query.set('country', params.country);
      if (params.confidence) query.set('confidence', params.confidence);

      const res = await fetch(`${API_BASE_URL}/analytics/historical-overview?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return null;
      return (await res.json()) as HistoricalOverviewData;
    } catch {
      return null;
    }
  }

  public static async fetchFireRisk(params: {
    country?: string;
    period?: string;
    temperature?: boolean;
    drought?: boolean;
    weather?: boolean;
    history?: boolean;
  } = {}): Promise<FireRiskOverviewData | null> {
    try {
      const query = new URLSearchParams();
      if (params.country) query.set('country', params.country);
      if (params.period) query.set('period', params.period);
      if (params.temperature !== undefined) query.set('temperature', String(params.temperature));
      if (params.drought !== undefined) query.set('drought', String(params.drought));
      if (params.weather !== undefined) query.set('weather', String(params.weather));
      if (params.history !== undefined) query.set('history', String(params.history));

      const res = await fetch(`${API_BASE_URL}/analytics/fire-risk?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return (await res.json()) as FireRiskOverviewData;
    } catch {
      return null;
    }
  }
}

export interface FireRiskOverviewData {
  country: string;
  period: string;
  active_inputs: Record<string, boolean>;
  stats: {
    level: 'critical' | 'high' | 'moderate' | 'low';
    label: string;
    count: number;
    color: string;
    range: string;
    percentage: number;
  }[];
  hotspots: {
    id: string;
    name: string;
    state: string;
    xPercent: number;
    yPercent: number;
    latitude?: number;
    longitude?: number;
    riskScore: number;
    level: 'critical' | 'high' | 'moderate' | 'low';
    temperature: string;
    droughtIndex: number;
    windSpeed: string;
    activeHotspots: number;
    timestamp: string;
    frp?: number;
    confidence?: number;
    satellite?: string;
  }[];
  trend: {
    timeLabel: string;
    high: number;
    moderate: number;
    low: number;
  }[];
  total_zones: number;
  model_metadata: {
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
  };
}

export interface HistoricalOverviewData {
  region: string;
  country_code?: string;
  metrics: {
    title: string;
    value: string;
    icon: 'flame' | 'tree' | 'calendar' | 'flame-orange' | 'trending-up';
    titleColor?: string;
    valueColor?: string;
    iconColor?: string;
    subtext?: string;
  }[];
  yearly_bars: {
    yearLabel: string;
    yearNum: number;
    bars: {
      heightPercent: number;
      value: number;
      hasGreenCap: boolean;
      capHeightPercent?: number;
      burnedHa: string;
    }[];
  }[];
  seasonal_pattern: {
    month: string;
    v2021: number;
    v2022: number;
    v2023: number;
    v2024: number;
  }[];
  heatmap_years: string[];
  heatmap_months: string[];
  heatmap_rows: {
    id: string;
    label: string;
    cells: {
      intensity: string;
      color: string;
      incidents: number;
      severity: string;
    }[];
  }[];
  year_comparison: {
    year: number;
    detection: string;
    peakArea: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  }[];
}

