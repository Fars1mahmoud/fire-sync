export type RiskLevel = 'Low' | 'Moderate' | 'High';

export type RouteId = 'route-a' | 'route-b' | 'route-c';

export type MapLayerKey =
  | 'fire'
  | 'roads'
  | 'safeRoute'
  | 'alternative'
  | 'detour'
  | 'blocked';

export interface EvacuationRoute {
  id: RouteId;
  name: string;
  distanceKm: number;
  distanceLabel: string;
  estTimeMinutes: number;
  estTimeLabel: string;
  riskLevel: RiskLevel;
  polyline: Array<[number, number]>; // Normalized 0..1000 x 0..640 coordinates
  geoCoordinates?: Array<[number, number]>; // [lat, lon]
  color: string;
  secondaryColor?: string;
  layerKey: MapLayerKey;
  steps: string[];
  corridorSummary: string;
  nearestFireDistanceKm?: number;
  nearestFireFRP?: number;
}

export interface MapMarker {
  id: string;
  type: 'fire' | 'safe' | 'unit' | 'target' | 'command' | 'blocked';
  x: number;
  y: number;
  lat?: number;
  lon?: number;
  title: string;
  subtitle: string;
  severity?: string;
  layerKey: MapLayerKey;
}

export interface RouteSearchInput {
  originCity: string;
  originCoords: string;
  destinationZone: string;
  destinationMode: string;
}

export interface RouteValidationResult {
  valid: boolean;
  error?: string;
}

export interface EvacuationSummaryData {
  totalEvacueesStaged: number;
  safeCorridorsActive: number;
  blockedRoadSegments: number;
  activeConvoys: number;
  closestFireKm: number;
  highestFRP: number;
  highRiskZones: number;
  sheltersCapacityPercent: number;
  timestamp: string;
}

export interface ConvoyDispatchPayload {
  routeId: string;
  sector: string;
  unitType: string;
  destination: string;
}

export interface ConvoyDispatchResponse {
  dispatchId: string;
  status: string;
  assignedUnit: string;
  routeId: string;
  sector: string;
  destination: string;
  etaMinutes: number;
  message: string;
  timestamp: string;
}
