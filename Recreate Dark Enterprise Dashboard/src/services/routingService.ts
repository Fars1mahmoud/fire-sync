/**
 * Tactical Road-Based Evacuation Routing Service
 * Identifies:
 * - Safe Evacuation Corridors (cleared of flame front & dense smoke)
 * - Blocked Roads & Active Fire Traps (closed due to spotting/debris)
 * - Assembly Centers & Designated Safe Shelters
 */

import type { LatLngPoint } from './gisService';
import { RegionService } from './regionService';

export interface RouteWaypoint {
  km: number;
  name: string;
  coords: LatLngPoint;
  instructions: string;
  status: 'Open' | 'Caution' | 'Closed';
}

export interface EvacuationPlan {
  region: string;
  totalDistanceKm: number;
  safeRoutePillLabel: string;
  statusSummary: string;
  safeRouteCoordinates: LatLngPoint[];
  waypoints: RouteWaypoint[];
  blockedRoadCoordinates: LatLngPoint[];
  blockedRoadReason: string;
  evacuationPoints: {
    id: string;
    name: string;
    coords: LatLngPoint;
    capacity: string;
    contactVHF: string;
  }[];
}

export const REGIONAL_EVACUATION_PLANS: Record<string, EvacuationPlan> = {
  'Brazil': {
    region: 'Brazil',
    totalDistanceKm: 26.5,
    safeRoutePillLabel: 'BR-163 Corridor (26 km)',
    statusSummary: 'OPEN & PATROLLED: Federal Highway Police escort active southwards away from active Cerrado flanks.',
    safeRouteCoordinates: [
      { lat: -11.75, lng: -55.55 },
      { lat: -11.80, lng: -55.53 },
      { lat: -11.86, lng: -55.51 },
      { lat: -11.95, lng: -55.48 },
    ],
    waypoints: [
      { km: 0.0, name: 'Sinop North Staging Checkpoint', coords: { lat: -11.75, lng: -55.55 }, instructions: 'Evacuee convoy formation & filter masks distribution', status: 'Open' },
      { km: 8.4, name: 'Teles Pires Bridge Crossing', coords: { lat: -11.80, lng: -55.53 }, instructions: 'Single-lane police traffic contraflow', status: 'Open' },
      { km: 16.2, name: 'Aeroporto de Sinop Triage Hub', coords: { lat: -11.86, lng: -55.51 }, instructions: 'Emergency medical station & shelter coaches', status: 'Open' },
      { km: 26.5, name: 'Centro de Eventos Municipal Safe Shelter', coords: { lat: -11.95, lng: -55.48 }, instructions: 'Final reception center with potable water and logistics', status: 'Open' },
    ],
    blockedRoadCoordinates: [
      { lat: -11.68, lng: -55.62 },
      { lat: -11.72, lng: -55.59 },
    ],
    blockedRoadReason: 'MT-220 rural feeder is closed due to heavy biomass smoke and zero visibility.',
    evacuationPoints: [
      { id: 'EVAC-BRA-01', name: 'Ginásio Olímpico de Sinop', coords: { lat: -11.86, lng: -55.51 }, capacity: '3,200 evacuees', contactVHF: 'VHF 156.800 MHz' },
      { id: 'EVAC-BRA-02', name: 'Centro Comunitário Corumbá', coords: { lat: -19.01, lng: -57.65 }, capacity: '1,800 evacuees', contactVHF: 'Bombeiros Ch 1' },
    ],
  },
  'Canada': {
    region: 'Canada',
    totalDistanceKm: 34.0,
    safeRoutePillLabel: 'Highway 63 Southbound (34 km)',
    statusSummary: 'OPEN & TRAFFIC-REGULATED: RCMP contraflow active southwards towards Anzac.',
    safeRouteCoordinates: [
      { lat: 56.73, lng: -111.38 },
      { lat: 56.62, lng: -111.32 },
      { lat: 56.50, lng: -111.20 },
      { lat: 56.42, lng: -111.05 },
    ],
    waypoints: [
      { km: 0.0, name: 'Fort McMurray South Gate', coords: { lat: 56.73, lng: -111.38 }, instructions: 'RCMP registration & mandatory headlamp usage', status: 'Open' },
      { km: 12.0, name: 'Gregoire Lake Junction', coords: { lat: 56.62, lng: -111.32 }, instructions: 'Fuel replenishment & emergency medical tender', status: 'Open' },
      { km: 22.5, name: 'Anzac Recreation Center Reception', coords: { lat: 56.50, lng: -111.20 }, instructions: 'Temporary shelter assignment & Red Cross registration', status: 'Open' },
      { km: 34.0, name: 'Wandering River Secondary Staging', coords: { lat: 56.42, lng: -111.05 }, instructions: 'Boreal smoke buffer zone & bus transfers to Edmonton', status: 'Open' },
    ],
    blockedRoadCoordinates: [
      { lat: 56.85, lng: -111.45 },
      { lat: 56.92, lng: -111.52 },
    ],
    blockedRoadReason: 'Highway 63 Northbound is closed past Fort McKay due to crown fire rollover.',
    evacuationPoints: [
      { id: 'EVAC-CAN-01', name: 'MacDonald Island Park (Fort McMurray)', coords: { lat: 56.73, lng: -111.38 }, capacity: '4,500 evacuees', contactVHF: 'Alberta First Responders 155.000' },
      { id: 'EVAC-CAN-02', name: 'Anzac Community Hall', coords: { lat: 56.45, lng: -111.05 }, capacity: '1,200 evacuees', contactVHF: 'VHF Emergency 1' },
    ],
  },
  'Mediterranean Basin': {
    region: 'Mediterranean Basin',
    totalDistanceKm: 12.4,
    safeRoutePillLabel: 'Safe Route 01 (12 km)',
    statusSummary: 'OPEN & MONITORED: Continuous air tanker smoke clearance active along coastal highway.',
    safeRouteCoordinates: [
      { lat: 36.14, lng: 27.93 },
      { lat: 36.12, lng: 27.97 },
      { lat: 36.08, lng: 28.01 },
      { lat: 36.04, lng: 28.05 },
      { lat: 36.01, lng: 28.07 },
    ],
    waypoints: [
      { km: 0.0, name: 'Assembly Area Alpha', coords: { lat: 36.14, lng: 27.93 }, instructions: 'Evacuee vehicle staging & registration', status: 'Open' },
      { km: 4.2, name: 'Coastal Highway 8A Junction', coords: { lat: 36.12, lng: 27.97 }, instructions: 'Police escort checkpoint & water replenishment', status: 'Open' },
      { km: 8.5, name: 'Lardos Bay Triage Point', coords: { lat: 36.08, lng: 28.01 }, instructions: 'Secondary medical triage & air-conditioned buses', status: 'Open' },
      { km: 12.4, name: 'Safe Haven Coastal Shelter', coords: { lat: 36.01, lng: 28.07 }, instructions: 'Final reception center with emergency provisions', status: 'Open' },
    ],
    blockedRoadCoordinates: [
      { lat: 36.18, lng: 27.94 },
      { lat: 36.16, lng: 27.91 },
      { lat: 36.15, lng: 27.88 },
    ],
    blockedRoadReason: 'Mountain Road 3 is blocked by dense smoke plume (PM2.5 > 350 µg/m³) and active flame rollover.',
    evacuationPoints: [
      { id: 'EVAC-MED-01', name: 'Gennadi Municipal Sports Center', coords: { lat: 36.02, lng: 27.92 }, capacity: '1,400 beds', contactVHF: 'Channel 16 / 72' },
      { id: 'EVAC-MED-02', name: 'Port of Rhodes Maritime Pier', coords: { lat: 36.44, lng: 28.23 }, capacity: '3,500 vessel evacuation slots', contactVHF: 'VHF Ch 12 Coast Guard' },
    ],
  },
  'California': {
    region: 'California',
    totalDistanceKm: 18.6,
    safeRoutePillLabel: 'Skyway Safe Route (19 km)',
    statusSummary: 'OPEN & TRAFFIC-REGULATED: Caltrans contraflow active westward to Chico.',
    safeRouteCoordinates: [
      { lat: 39.76, lng: -121.61 },
      { lat: 39.75, lng: -121.68 },
      { lat: 39.74, lng: -121.75 },
      { lat: 39.72, lng: -121.83 },
    ],
    waypoints: [
      { km: 0.0, name: 'Paradise Skyway Onramp', coords: { lat: 39.76, lng: -121.61 }, instructions: 'Contraflow entry. Two westbound lanes open.', status: 'Open' },
      { km: 6.8, name: 'Neal Road Staging Checkpoint', coords: { lat: 39.75, lng: -121.68 }, instructions: 'Cal Fire traffic control & fuel tender station', status: 'Open' },
      { km: 12.4, name: 'Highway 99 Interchange', coords: { lat: 39.74, lng: -121.75 }, instructions: 'Follow signs south to Silver Dollar Fairgrounds', status: 'Open' },
      { km: 18.6, name: 'Silver Dollar Fairgrounds Shelter', coords: { lat: 39.72, lng: -121.83 }, instructions: 'Red Cross evacuation shelter & small animal care', status: 'Open' },
    ],
    blockedRoadCoordinates: [
      { lat: 39.85, lng: -121.48 },
      { lat: 39.89, lng: -121.42 },
      { lat: 39.95, lng: -121.35 },
    ],
    blockedRoadReason: 'Highway 70 Feather River Canyon is CLOSED due to active crown fire rollouts and rockfall debris.',
    evacuationPoints: [
      { id: 'EVAC-CAL-01', name: 'Silver Dollar Fairgrounds (Chico)', coords: { lat: 39.72, lng: -121.83 }, capacity: '2,800 evacuees', contactVHF: 'CALCORD 156.075 MHz' },
      { id: 'EVAC-CAL-02', name: 'Butte County Fairgrounds (Gridley)', coords: { lat: 39.36, lng: -121.69 }, capacity: '1,500 evacuees', contactVHF: 'Cal Fire Command 1' },
    ],
  },
};

export class RoutingService {
  public static getEvacuationPlan(regionName: string): EvacuationPlan {
    const regDef = RegionService.getRegionById(regionName);
    if (regDef.id === 'brazil') {
      return REGIONAL_EVACUATION_PLANS['Brazil'];
    }
    if (regDef.id === 'canada') {
      return REGIONAL_EVACUATION_PLANS['Canada'];
    }
    if (regDef.id === 'california') {
      return REGIONAL_EVACUATION_PLANS['California'];
    }
    return REGIONAL_EVACUATION_PLANS['Mediterranean Basin'] || REGIONAL_EVACUATION_PLANS['Brazil'];
  }
}
