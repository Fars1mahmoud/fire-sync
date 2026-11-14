import { PredictionPeriod, RiskLevel, RiskStat, TrendDataPoint, Hotspot } from './types';

export const BASE_STATS: Record<PredictionPeriod, { critical: number; high: number; moderate: number; low: number }> = {
  'Next 12 Hours': {
    critical: 18,
    high: 94,
    moderate: 210,
    low: 580,
  },
  'Next 24 Hours': {
    critical: 24,
    high: 112,
    moderate: 245,
    low: 530,
  },
  'Next 72 Hours': {
    critical: 38,
    high: 148,
    moderate: 310,
    low: 490,
  },
  'Next 7 Days': {
    critical: 52,
    high: 185,
    moderate: 390,
    low: 420,
  },
};

export function calculateRiskStats(
  period: PredictionPeriod,
  activeInputs: { temperature: boolean; drought: boolean; weather: boolean; history: boolean }
): RiskStat[] {
  const base = BASE_STATS[period] || BASE_STATS['Next 24 Hours'];
  
  // Calculate multiplier based on active model inputs
  let multiplier = 1.0;
  if (!activeInputs.temperature) multiplier *= 0.85;
  if (!activeInputs.drought) multiplier *= 0.90;
  if (!activeInputs.weather) multiplier *= 0.92;
  if (!activeInputs.history) multiplier *= 0.95;

  const critical = Math.round(base.critical * multiplier);
  const high = Math.round(base.high * multiplier);
  const moderate = Math.round(base.moderate * multiplier);
  const low = Math.round(base.low * (2 - multiplier));

  return [
    {
      level: 'critical',
      label: 'Critical Areas',
      count: critical,
      color: '#ef233c',
      range: '75-100%',
      percentage: 94,
    },
    {
      level: 'high',
      label: 'High Risk Areas',
      count: high,
      color: '#f77f00',
      range: '50-75%',
      percentage: 68,
    },
    {
      level: 'moderate',
      label: 'Moderate Areas',
      count: moderate,
      color: '#ffd166',
      range: '20-50%',
      percentage: 35,
    },
    {
      level: 'low',
      label: 'Low Risk Areas',
      count: low,
      color: '#06d6a0',
      range: 'Low',
      percentage: 12,
    },
  ];
}

export function getTrendDataPoints(period: PredictionPeriod): TrendDataPoint[] {
  if (period === 'Next 12 Hours') {
    return [
      { timeLabel: '0h', high: 20, moderate: 12, low: 8 },
      { timeLabel: '2h', high: 38, moderate: 22, low: 18 },
      { timeLabel: '4h', high: 55, moderate: 35, low: 28 },
      { timeLabel: '6h', high: 72, moderate: 48, low: 34 },
      { timeLabel: '8h', high: 64, moderate: 42, low: 31 },
      { timeLabel: '12h', high: 82, moderate: 56, low: 45 },
    ];
  }

  // Exact data points mirroring the curve in the image:
  // X: 24, 2h, 4h, 5h, 6h, 7d
  // Peak for High curve reaches ~130-135 at 5h, starting around 25 at 24, dipping at 4h, peaking at 5h, rising again at 7d.
  return [
    { timeLabel: '24', high: 25, moderate: 15, low: 10 },
    { timeLabel: '2h', high: 78, moderate: 48, low: 38 },
    { timeLabel: '4h', high: 56, moderate: 32, low: 34 },
    { timeLabel: '5h', high: 132, moderate: 74, low: 76 },
    { timeLabel: '6h', high: 70, moderate: 45, low: 48 },
    { timeLabel: '7d', high: 118, moderate: 65, low: 72 },
  ];
}

export function calculateCompositeRiskIndex(
  tempCelsius: number,
  droughtIndex: number, // 0 - 800 (KBDI)
  windKmh: number,
  historyIncidents: number
): number {
  const normTemp = Math.min(Math.max((tempCelsius - 20) / 25, 0), 1) * 35;
  const normDrought = Math.min(Math.max(droughtIndex / 800, 0), 1) * 35;
  const normWind = Math.min(Math.max(windKmh / 50, 0), 1) * 15;
  const normHistory = Math.min(Math.max(historyIncidents / 100, 0), 1) * 15;

  return Math.min(Math.round(normTemp + normDrought + normWind + normHistory), 100);
}

export const SAMPLE_HOTSPOTS_BY_COUNTRY: Record<string, Hotspot[]> = {
  BRA: [
    {
      id: 'spot-bra-1',
      name: 'Rondônia / Mato Grosso Corridor',
      state: 'Mato Grosso & Rondônia',
      latitude: -11.50,
      longitude: -61.20,
      xPercent: 55,
      yPercent: 43,
      riskScore: 94,
      level: 'critical',
      temperature: '38.4°C',
      droughtIndex: 720,
      windSpeed: '28 km/h',
      activeHotspots: 24,
      frp: 380.5,
      confidence: 96,
      satellite: 'VIIRS NOAA-20',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-bra-2',
      name: 'South Pará Forest Fringe',
      state: 'Pará',
      latitude: -6.80,
      longitude: -52.40,
      xPercent: 58,
      yPercent: 32,
      riskScore: 88,
      level: 'critical',
      temperature: '36.8°C',
      droughtIndex: 680,
      windSpeed: '22 km/h',
      activeHotspots: 18,
      frp: 295.0,
      confidence: 94,
      satellite: 'Terra (MODIS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-bra-3',
      name: 'Cerrado Biosphere Central',
      state: 'Goiás',
      latitude: -15.80,
      longitude: -49.50,
      xPercent: 62,
      yPercent: 55,
      riskScore: 72,
      level: 'high',
      temperature: '34.5°C',
      droughtIndex: 590,
      windSpeed: '18 km/h',
      activeHotspots: 11,
      frp: 180.2,
      confidence: 88,
      satellite: 'Aqua (MODIS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-bra-4',
      name: 'Pantanal Wetlands Border',
      state: 'Mato Grosso do Sul',
      latitude: -19.50,
      longitude: -56.80,
      xPercent: 48,
      yPercent: 62,
      riskScore: 68,
      level: 'high',
      temperature: '35.1°C',
      droughtIndex: 540,
      windSpeed: '19 km/h',
      activeHotspots: 9,
      frp: 145.0,
      confidence: 86,
      satellite: 'Suomi-NPP (VIIRS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-bra-5',
      name: 'Atlantic Forest Transition',
      state: 'Minas Gerais',
      latitude: -20.20,
      longitude: -43.80,
      xPercent: 70,
      yPercent: 68,
      riskScore: 42,
      level: 'moderate',
      temperature: '29.2°C',
      droughtIndex: 410,
      windSpeed: '14 km/h',
      activeHotspots: 4,
      frp: 62.0,
      confidence: 78,
      satellite: 'GOES-16 ABI',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-bra-6',
      name: 'Southern Pampas',
      state: 'Rio Grande do Sul',
      latitude: -29.80,
      longitude: -53.20,
      xPercent: 50,
      yPercent: 82,
      riskScore: 16,
      level: 'low',
      temperature: '22.0°C',
      droughtIndex: 210,
      windSpeed: '12 km/h',
      activeHotspots: 1,
      frp: 18.0,
      confidence: 65,
      satellite: 'Terra (MODIS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
  ],
  CAN: [
    {
      id: 'spot-can-1',
      name: 'Peace River Boreal Sector',
      state: 'Alberta / BC',
      latitude: 52.5193,
      longitude: -122.9989,
      xPercent: 28,
      yPercent: 44,
      riskScore: 98,
      level: 'critical',
      temperature: '52.4°C',
      droughtIndex: 780,
      windSpeed: '42 km/h',
      activeHotspots: 125,
      frp: 1496.9,
      confidence: 100,
      satellite: 'Terra (MODIS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-can-2',
      name: 'Fort McMurray Athabasca Zone',
      state: 'Alberta',
      latitude: 56.72,
      longitude: -111.38,
      xPercent: 38,
      yPercent: 52,
      riskScore: 89,
      level: 'critical',
      temperature: '44.8°C',
      droughtIndex: 730,
      windSpeed: '36 km/h',
      activeHotspots: 68,
      frp: 920.4,
      confidence: 96,
      satellite: 'VIIRS NOAA-20',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-can-3',
      name: 'Yellowknife Great Slave Taiga',
      state: 'Northwest Territories',
      latitude: 62.45,
      longitude: -114.37,
      xPercent: 35,
      yPercent: 38,
      riskScore: 76,
      level: 'critical',
      temperature: '38.2°C',
      droughtIndex: 670,
      windSpeed: '28 km/h',
      activeHotspots: 44,
      frp: 610.0,
      confidence: 92,
      satellite: 'Suomi-NPP (VIIRS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-can-4',
      name: 'Okanagan Valley Conifer Fringe',
      state: 'British Columbia',
      latitude: 49.88,
      longitude: -119.49,
      xPercent: 22,
      yPercent: 50,
      riskScore: 68,
      level: 'high',
      temperature: '35.6°C',
      droughtIndex: 580,
      windSpeed: '24 km/h',
      activeHotspots: 21,
      frp: 310.5,
      confidence: 88,
      satellite: 'Aqua (MODIS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-can-5',
      name: 'James Bay Lowland Peat Belt',
      state: 'Quebec & Ontario',
      latitude: 52.20,
      longitude: -81.50,
      xPercent: 62,
      yPercent: 58,
      riskScore: 45,
      level: 'moderate',
      temperature: '26.8°C',
      droughtIndex: 420,
      windSpeed: '18 km/h',
      activeHotspots: 8,
      frp: 85.0,
      confidence: 76,
      satellite: 'VIIRS NOAA-20',
      timestamp: '2026-10-24 14:00 UTC',
    },
  ],
  EGY: [
    {
      id: 'spot-egy-1',
      name: 'Matrouh Coastal Ridge & Escarpment',
      state: 'Matrouh',
      latitude: 31.35,
      longitude: 27.24,
      xPercent: 32,
      yPercent: 34,
      riskScore: 84,
      level: 'critical',
      temperature: '38.6°C',
      droughtIndex: 690,
      windSpeed: '32 km/h',
      activeHotspots: 16,
      frp: 124.5,
      confidence: 88,
      satellite: 'NOAA-20 (VIIRS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-egy-2',
      name: 'Nile Delta Agricultural Fringe',
      state: 'Kafr El Sheikh & Beheira',
      latitude: 31.15,
      longitude: 30.85,
      xPercent: 58,
      yPercent: 28,
      riskScore: 78,
      level: 'critical',
      temperature: '36.2°C',
      droughtIndex: 620,
      windSpeed: '22 km/h',
      activeHotspots: 28,
      frp: 215.0,
      confidence: 92,
      satellite: 'Suomi-NPP (VIIRS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-egy-3',
      name: 'Sinai High Mountains & Wadi Feiran',
      state: 'South Sinai',
      latitude: 28.53,
      longitude: 33.95,
      xPercent: 75,
      yPercent: 42,
      riskScore: 66,
      level: 'high',
      temperature: '33.4°C',
      droughtIndex: 580,
      windSpeed: '26 km/h',
      activeHotspots: 9,
      frp: 86.4,
      confidence: 85,
      satellite: 'Aqua (MODIS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-egy-4',
      name: 'Western Oases Boundary',
      state: 'New Valley (Kharga & Dakhla)',
      latitude: 25.50,
      longitude: 29.00,
      xPercent: 44,
      yPercent: 62,
      riskScore: 48,
      level: 'moderate',
      temperature: '39.8°C',
      droughtIndex: 740,
      windSpeed: '18 km/h',
      activeHotspots: 6,
      frp: 45.2,
      confidence: 76,
      satellite: 'NOAA-20 (VIIRS)',
      timestamp: '2026-10-24 14:00 UTC',
    },
    {
      id: 'spot-egy-5',
      name: 'Red Sea Coastal Scrub Escarpment',
      state: 'Red Sea (Hurghada / Safaga)',
      latitude: 26.72,
      longitude: 33.60,
      xPercent: 72,
      yPercent: 65,
      riskScore: 36,
      level: 'moderate',
      temperature: '35.0°C',
      droughtIndex: 510,
      windSpeed: '24 km/h',
      activeHotspots: 4,
      frp: 32.0,
      confidence: 72,
      satellite: 'Sentinel-3 SLSTR',
      timestamp: '2026-10-24 14:00 UTC',
    },
  ],
};

export function getSampleHotspotsByCountry(country: string = 'BRA'): Hotspot[] {
  const code = (country || 'BRA').toUpperCase();
  if (SAMPLE_HOTSPOTS_BY_COUNTRY[code]) {
    return SAMPLE_HOTSPOTS_BY_COUNTRY[code];
  }
  return SAMPLE_HOTSPOTS_BY_COUNTRY['BRA'];
}

export const SAMPLE_HOTSPOTS: Hotspot[] = SAMPLE_HOTSPOTS_BY_COUNTRY.BRA;
