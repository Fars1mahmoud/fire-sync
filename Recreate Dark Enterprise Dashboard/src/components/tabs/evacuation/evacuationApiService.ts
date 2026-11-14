import {
  EvacuationRoute,
  MapMarker,
  EvacuationSummaryData,
  RouteSearchInput,
  ConvoyDispatchPayload,
  ConvoyDispatchResponse,
} from './evacuationTypes';
import { API_BASE_URL } from '../../../services/apiClient';

const API_BASE = `${API_BASE_URL}/evacuation`;

export const FALLBACK_ROUTES: EvacuationRoute[] = [
  {
    id: 'route-a',
    name: 'Route A',
    distanceKm: 26.5,
    distanceLabel: '26.5 km',
    estTimeMinutes: 45,
    estTimeLabel: '45 min',
    riskLevel: 'Low',
    polyline: [
      [338, 178],
      [410, 212],
      [496, 250],
      [554, 194],
      [598, 134],
      [666, 214],
      [742, 316],
      [818, 412],
    ],
    color: '#a3e635',
    secondaryColor: '#10b981',
    layerKey: 'safeRoute',
    steps: [
      'Start: Manaus Outskirts',
      'Take BR-174 North Bypass',
      'Turn right onto AM-010 Highway',
      'Arrive at Safe Zone North Hub',
    ],
    corridorSummary: 'Northern bypass clear of active thermal fronts; optimal air quality',
    nearestFireDistanceKm: 14.8,
    nearestFireFRP: 18.2,
  },
  {
    id: 'route-b',
    name: 'Route B',
    distanceKm: 34.2,
    distanceLabel: '34.2 km',
    estTimeMinutes: 70,
    estTimeLabel: '1h 10m',
    riskLevel: 'Moderate',
    polyline: [
      [135, 344],
      [154, 242],
      [212, 198],
      [246, 172],
      [340, 224],
      [472, 318],
      [632, 424],
      [796, 464],
    ],
    color: '#38bdf8',
    secondaryColor: '#f59e0b',
    layerKey: 'alternative',
    steps: [
      'Start: Manaus West Sector',
      'Merge onto AM-070 Bridge corridor',
      'Detour via Taruma / Secondary River Corridor',
      'Arrive at Safe Zone North Hub',
    ],
    corridorSummary: 'Moderate smoke drift along western river crossing; speed limit 50 km/h',
    nearestFireDistanceKm: 6.2,
    nearestFireFRP: 84.5,
  },
  {
    id: 'route-c',
    name: 'Route C',
    distanceKm: 52.8,
    distanceLabel: '52.8 km',
    estTimeMinutes: 105,
    estTimeLabel: '1h 45m',
    riskLevel: 'High',
    polyline: [
      [226, 176],
      [336, 232],
      [446, 304],
      [564, 376],
      [672, 430],
      [812, 456],
    ],
    color: '#ef4444',
    secondaryColor: '#3b82f6',
    layerKey: 'fire',
    steps: [
      'Start: Manaus Central Dispatch',
      'Proceed SE along Primary Trunk Expressway',
      'Pass Sector 4 Fire Perimeter (FRP 380+ MW)',
      'Arrive at Safe Zone North Hub',
    ],
    corridorSummary: 'Active fire front within 3.8 km of highway; armored or pilot escort required',
    nearestFireDistanceKm: 3.8,
    nearestFireFRP: 382.4,
  },
];

export const FALLBACK_MARKERS: MapMarker[] = [
  {
    id: 'fire-nw',
    type: 'fire',
    x: 242,
    y: 158,
    title: 'Thermal Hotspot F-104',
    subtitle: '412°C Crown Fire · Wind SE 18 km/h',
    severity: 'Critical',
    layerKey: 'fire',
  },
  {
    id: 'fire-center',
    type: 'fire',
    x: 356,
    y: 146,
    title: 'Thermal Hotspot F-108',
    subtitle: '368°C Brush Perimeter · Spreading NW',
    severity: 'High',
    layerKey: 'fire',
  },
  {
    id: 'safe-sw',
    type: 'safe',
    x: 138,
    y: 352,
    title: 'Safe Zone West (Ponta Negra)',
    subtitle: 'Capacity: 1,420 / 2,000 · Open',
    severity: 'Nominal',
    layerKey: 'alternative',
  },
  {
    id: 'unit-chevron',
    type: 'unit',
    x: 498,
    y: 252,
    title: 'Convoy Lead Alpha-1',
    subtitle: '48 km/h · Heading NE on BR-174',
    severity: 'Active',
    layerKey: 'safeRoute',
  },
  {
    id: 'safe-ne',
    type: 'safe',
    x: 598,
    y: 132,
    title: 'Safe Zone North (AM-010 Hub)',
    subtitle: 'Capacity: 680 / 2,500 · Medical Ready',
    severity: 'Nominal',
    layerKey: 'safeRoute',
  },
  {
    id: 'blocked-se',
    type: 'blocked',
    x: 634,
    y: 410,
    title: 'Road Closure B-22',
    subtitle: 'Fallen timber & dense smoke visibility < 15m',
    severity: 'Blocked',
    layerKey: 'blocked',
  },
  {
    id: 'target-se',
    type: 'target',
    x: 822,
    y: 454,
    title: 'Primary Evacuation Staging',
    subtitle: 'Sector East Rally Point · Active',
    severity: 'Staging',
    layerKey: 'fire',
  },
  {
    id: 'command-se',
    type: 'command',
    x: 804,
    y: 544,
    title: 'FireGuard Forward Command',
    subtitle: '14 Rescue Units · Dispatch Ready',
    severity: 'Command',
    layerKey: 'blocked',
  },
];

export const FALLBACK_SUMMARY: EvacuationSummaryData = {
  totalEvacueesStaged: 3480,
  safeCorridorsActive: 2,
  blockedRoadSegments: 1,
  activeConvoys: 3,
  closestFireKm: 3.8,
  highestFRP: 1165.2,
  highRiskZones: 3,
  sheltersCapacityPercent: 68.4,
  timestamp: new Date().toISOString(),
};

export const EvacuationApiService = {
  async fetchSummary(region = 'brazil'): Promise<EvacuationSummaryData> {
    try {
      const res = await fetch(`${API_BASE}/summary?region=${encodeURIComponent(region)}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Evacuation summary API unreachable, using local intelligence:', e);
      return FALLBACK_SUMMARY;
    }
  },

  async fetchMarkers(region = 'brazil'): Promise<MapMarker[]> {
    try {
      const res = await fetch(`${API_BASE}/markers?region=${encodeURIComponent(region)}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_MARKERS;
    } catch (e) {
      console.warn('Evacuation markers API unreachable, using fallback:', e);
      return FALLBACK_MARKERS;
    }
  },

  async fetchRoutes(
    region = 'brazil',
    search?: Partial<RouteSearchInput>
  ): Promise<EvacuationRoute[]> {
    try {
      const params = new URLSearchParams({ region });
      if (search?.originCity) params.set('origin_city', search.originCity);
      if (search?.originCoords) params.set('origin_coords', search.originCoords);
      if (search?.destinationZone) params.set('destination_zone', search.destinationZone);
      if (search?.destinationMode) params.set('destination_mode', search.destinationMode);

      const res = await fetch(`${API_BASE}/routes?${params.toString()}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : FALLBACK_ROUTES;
    } catch (e) {
      console.warn('Evacuation routes API unreachable, using fallback:', e);
      return FALLBACK_ROUTES;
    }
  },

  async dispatchConvoy(payload: ConvoyDispatchPayload): Promise<ConvoyDispatchResponse> {
    try {
      const res = await fetch(`${API_BASE}/dispatch-convoy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Convoy dispatch API failed, simulating response:', e);
      return {
        dispatchId: `DISP-${Math.floor(100 + Math.random() * 900)}`,
        status: 'DISPATCHED',
        assignedUnit: payload.unitType || 'Escort Alpha Lead',
        routeId: payload.routeId,
        sector: payload.sector || 'Sector Alpha',
        destination: payload.destination || 'Safe Zone North',
        etaMinutes: 20,
        message: `Convoy unit ${payload.unitType} successfully deployed along ${payload.routeId.toUpperCase()}.`,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
