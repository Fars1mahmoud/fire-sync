export type LayerId =
  | 'cities'
  | 'hospitals'
  | 'airports'
  | 'power'
  | 'roads'
  | 'industrial'
  | 'other';

export type FilterTabId =
  | 'all'
  | 'hospitals'
  | 'power'
  | 'roads'
  | 'cities'
  | 'other';

export type RiskLevel = 'High' | 'Moderate' | 'Low';

export type ExposureStatus = 'At Risk' | 'Monitor' | 'Safe';

export type MarkerVisual = 'red-large' | 'red-small' | 'orange' | 'blue-yellow';

export interface LayerDefinition {
  id: LayerId;
  label: string;
  labelAr: string;
  accentColor: string;
}

export interface FilterTabDefinition {
  id: FilterTabId;
  label: string;
  labelAr: string;
}

export interface Facility {
  id: string;
  name: string;
  nameAr?: string;
  nearestLabel: string;
  nearestSubLabel?: string;
  directionLabel: string;
  typeLabel: string;
  layerId: LayerId;
  distanceKm: number;
  risk: RiskLevel;
  status: ExposureStatus;
  markerVisual: MarkerVisual;
  coords: { x: number; y: number };
  lat: number;
  lng: number;
  latLng: string;
  isPrimary: boolean;
  details: string;
  detailsAr?: string;
  action?: string;
  closestFire?: {
    lat: number;
    lng: number;
    frp: number;
    confidence: string;
  };
}

export interface LegendDot {
  id: string;
  color: string;
  label: string;
  labelAr: string;
  layerId: LayerId;
}

export interface InfrastructureSummary {
  region: string;
  databaseConnected: boolean;
  totalMonitored: number;
  atRiskCount: number;
  monitorCount: number;
  safeCount: number;
  closestDistanceKm: number;
  closestFacilityName: string;
  threatenedPowerCapacity: string;
  hospitalBedsAtRisk: string;
  primaryEvacuationCorridor: string;
  activeFireFrontCount: number;
}
