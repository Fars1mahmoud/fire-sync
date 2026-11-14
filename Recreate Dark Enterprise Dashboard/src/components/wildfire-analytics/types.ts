export interface MetricCardData {
  title: string;
  value: string;
  icon: 'flame' | 'tree' | 'calendar' | 'flame-orange' | 'trending-up';
  titleColor?: string;
  valueColor?: string;
  iconColor?: string;
  subtext?: string;
}

export interface YearlyBarGroup {
  yearLabel: string;
  yearNum: number;
  bars: {
    heightPercent: number;
    value: number;
    hasGreenCap: boolean;
    capHeightPercent?: number;
    burnedHa: string;
  }[];
}

export interface SeasonalPoint {
  month: string;
  v2021: number;
  v2022: number;
  v2023: number;
  v2024: number;
  [key: string]: string | number;
}

export interface HeatmapCell {
  intensity: string;
  color: string;
  incidents: number;
  severity: string;
}

export interface HeatmapRow {
  id: string;
  label: string;
  cells: HeatmapCell[];
}

export interface YearComparisonRow {
  year: number;
  detection: string;
  peakArea: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}
