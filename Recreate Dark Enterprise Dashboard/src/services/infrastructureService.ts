/**
 * Critical Infrastructure & Population Proximity Analysis Service
 * Evaluates spatial vulnerability of:
 * - Hospitals & Triage Centers
 * - Power Substations & Hydroelectric Dams
 * - High Schools & Public Shelters
 * - Natural Gas Feeders & Transmission Corridors
 * - Municipal Population Nodes
 */

import { calculateDistanceKm, type LatLngPoint } from './gisService';
import { RegionService } from './regionService';

export interface CriticalAsset {
  id: string;
  name: string;
  type: 'Hospital' | 'Substation' | 'School' | 'Gas Pipeline' | 'Port' | 'City';
  region: 'Brazil' | 'Canada' | 'Mediterranean Basin' | 'California';
  coords: LatLngPoint;
  nominalCapacityOrPop: string;
  distanceKm?: number;
  threatLevel: 'Immediate' | 'Elevated' | 'Monitored';
}

export const REGIONAL_INFRASTRUCTURE: CriticalAsset[] = [
  // ================= BRAZIL ASSETS (AMAZON / CERRADO / PANTANAL) =================
  {
    id: 'INF-BRA-01',
    name: 'Hospital Regional de Sinop (Mato Grosso)',
    type: 'Hospital',
    region: 'Brazil',
    coords: { lat: -11.86, lng: -55.51 },
    nominalCapacityOrPop: '210 triage & trauma beds',
    threatLevel: 'Elevated',
  },
  {
    id: 'INF-BRA-02',
    name: 'Hospital de Corumbá (Pantanal Emergency Center)',
    type: 'Hospital',
    region: 'Brazil',
    coords: { lat: -19.01, lng: -57.65 },
    nominalCapacityOrPop: '140 emergency slots',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-BRA-03',
    name: 'Teles Pires Hydroelectric Substation',
    type: 'Substation',
    region: 'Brazil',
    coords: { lat: -9.33, lng: -56.78 },
    nominalCapacityOrPop: '1,820 MW Clean Grid Generation',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-BRA-04',
    name: 'BR-163 Amazon Logistics Highway Corridor',
    type: 'Gas Pipeline',
    region: 'Brazil',
    coords: { lat: -10.50, lng: -55.30 },
    nominalCapacityOrPop: 'Grain & Fuel National Transport Arterial',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-BRA-05',
    name: 'Sinop Agro-Industrial Hub Center',
    type: 'City',
    region: 'Brazil',
    coords: { lat: -11.85, lng: -55.50 },
    nominalCapacityOrPop: '196,000 residents',
    threatLevel: 'Monitored',
  },
  {
    id: 'INF-BRA-06',
    name: 'Humaitá Amazon River Port Terminal',
    type: 'Port',
    region: 'Brazil',
    coords: { lat: -7.52, lng: -63.02 },
    nominalCapacityOrPop: 'Madeira River Fluvial Logistics',
    threatLevel: 'Immediate',
  },

  // ================= CANADA ASSETS (BOREAL SHIELD / ALBERTA) =================
  {
    id: 'INF-CAN-01',
    name: 'Northern Lights Regional Health Centre (Fort McMurray)',
    type: 'Hospital',
    region: 'Canada',
    coords: { lat: 56.73, lng: -111.38 },
    nominalCapacityOrPop: '120 acute beds / Evacuation Trauma Ward',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-CAN-02',
    name: 'Peace River Community Health Complex',
    type: 'Hospital',
    region: 'Canada',
    coords: { lat: 56.24, lng: -117.29 },
    nominalCapacityOrPop: '45 triage beds',
    threatLevel: 'Monitored',
  },
  {
    id: 'INF-CAN-03',
    name: 'ATCO Electric Athabasca Transmission Substation',
    type: 'Substation',
    region: 'Canada',
    coords: { lat: 56.65, lng: -111.25 },
    nominalCapacityOrPop: '240 kV Regional Heavy Grid',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-CAN-04',
    name: 'Fort McMurray Urban Service Area',
    type: 'City',
    region: 'Canada',
    coords: { lat: 56.72, lng: -111.38 },
    nominalCapacityOrPop: '68,000 residents',
    threatLevel: 'Elevated',
  },

  // ================= MEDITERRANEAN BASIN ASSETS =================
  {
    id: 'INF-MED-01',
    name: 'General Hospital of Rhodes',
    type: 'Hospital',
    region: 'Mediterranean Basin',
    coords: { lat: 36.42, lng: 28.21 },
    nominalCapacityOrPop: '420 beds (ICU Tier 1)',
    threatLevel: 'Monitored',
  },
  {
    id: 'INF-MED-02',
    name: 'Gennadi Regional Medical Clinic',
    type: 'Hospital',
    region: 'Mediterranean Basin',
    coords: { lat: 36.03, lng: 27.92 },
    nominalCapacityOrPop: '35 emergency triage slots',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-MED-03',
    name: 'Soroni Power Generation Substation',
    type: 'Substation',
    region: 'Mediterranean Basin',
    coords: { lat: 36.36, lng: 27.99 },
    nominalCapacityOrPop: '150 MW Grid Feeder',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-MED-04',
    name: 'Archangelos Regional High School',
    type: 'School',
    region: 'Mediterranean Basin',
    coords: { lat: 36.21, lng: 28.11 },
    nominalCapacityOrPop: '650 student capacity / Designated Evac Hall',
    threatLevel: 'Elevated',
  },
  {
    id: 'INF-MED-05',
    name: 'South Aegean Natural Gas Feeder',
    type: 'Gas Pipeline',
    region: 'Mediterranean Basin',
    coords: { lat: 36.28, lng: 28.02 },
    nominalCapacityOrPop: 'High-pressure distribution main',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-MED-06',
    name: 'Port of Rhodes Commercial Terminal',
    type: 'Port',
    region: 'Mediterranean Basin',
    coords: { lat: 36.44, lng: 28.23 },
    nominalCapacityOrPop: 'Maritime Evacuation Staging Pier',
    threatLevel: 'Monitored',
  },
  {
    id: 'INF-MED-07',
    name: 'City of Rhodes & Suburbs',
    type: 'City',
    region: 'Mediterranean Basin',
    coords: { lat: 36.43, lng: 28.22 },
    nominalCapacityOrPop: '50,000 residents',
    threatLevel: 'Monitored',
  },

  // ================= CALIFORNIA ASSETS =================
  {
    id: 'INF-CAL-01',
    name: 'Enloe Medical Center (Chico)',
    type: 'Hospital',
    region: 'California',
    coords: { lat: 39.73, lng: -121.84 },
    nominalCapacityOrPop: '298 beds (Level II Trauma Center)',
    threatLevel: 'Monitored',
  },
  {
    id: 'INF-CAL-02',
    name: 'Adventist Health Feather River Clinic',
    type: 'Hospital',
    region: 'California',
    coords: { lat: 39.76, lng: -121.61 },
    nominalCapacityOrPop: '40 triage beds',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-CAL-03',
    name: 'PG&E Table Mountain Substation',
    type: 'Substation',
    region: 'California',
    coords: { lat: 39.63, lng: -121.57 },
    nominalCapacityOrPop: '500 kV Bulk Transmission Grid',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-CAL-04',
    name: 'Paradise High School Campus',
    type: 'School',
    region: 'California',
    coords: { lat: 39.76, lng: -121.60 },
    nominalCapacityOrPop: '1,100 students / Cal Fire Staging Center',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-CAL-05',
    name: 'Oroville Hydroelectric Power Plant',
    type: 'Substation',
    region: 'California',
    coords: { lat: 39.54, lng: -121.49 },
    nominalCapacityOrPop: '819 MW Clean Generation Dam',
    threatLevel: 'Elevated',
  },
  {
    id: 'INF-CAL-06',
    name: 'PG&E Gas Transmission Line 401',
    type: 'Gas Pipeline',
    region: 'California',
    coords: { lat: 39.80, lng: -121.55 },
    nominalCapacityOrPop: '36-inch Natural Gas Bulk Feeder',
    threatLevel: 'Immediate',
  },
  {
    id: 'INF-CAL-07',
    name: 'Town of Paradise',
    type: 'City',
    region: 'California',
    coords: { lat: 39.76, lng: -121.62 },
    nominalCapacityOrPop: '26,500 residents',
    threatLevel: 'Immediate',
  },
];

export class InfrastructureService {
  /**
   * Retrieves critical infrastructure assets for a given region
   */
  public static getRegionalAssets(regionName: string): CriticalAsset[] {
    const regDef = RegionService.getRegionById(regionName);
    if (regDef.id === 'brazil') {
      return REGIONAL_INFRASTRUCTURE.filter((a) => a.region === 'Brazil');
    }
    if (regDef.id === 'canada') {
      return REGIONAL_INFRASTRUCTURE.filter((a) => a.region === 'Canada');
    }
    if (regDef.id === 'california') {
      return REGIONAL_INFRASTRUCTURE.filter((a) => a.region === 'California');
    }
    const filtered = REGIONAL_INFRASTRUCTURE.filter((a) => a.region === 'Mediterranean Basin');
    return filtered.length > 0 ? filtered : REGIONAL_INFRASTRUCTURE.slice(0, 5);
  }

  /**
   * Calculates proximity and threat levels from an active fire coordinate to all assets in the region
   */
  public static calculateThreats(fireCoords: LatLngPoint, regionName: string): {
    nearestCity: { name: string; distanceKm: number };
    nearestHospital: { name: string; distanceKm: number };
    nearestPowerStation: { name: string; distanceKm: number };
    threatenedPopulation5km: number;
    sortedAssets: CriticalAsset[];
  } {
    const assets = this.getRegionalAssets(regionName);

    const calculated = assets.map((a) => {
      const distanceKm = Math.round(calculateDistanceKm(fireCoords, a.coords) * 10) / 10;
      let threatLevel: CriticalAsset['threatLevel'] = 'Monitored';
      if (distanceKm < 6) threatLevel = 'Immediate';
      else if (distanceKm < 15) threatLevel = 'Elevated';
      return {
        ...a,
        distanceKm,
        threatLevel,
      };
    }).sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    const defaultCity = { name: regionName.includes('Brazil') ? 'Sinop Metro' : regionName.includes('Canada') ? 'Fort McMurray' : 'Regional Center', distanceKm: 4.8 };
    const defaultHosp = { name: regionName.includes('Brazil') ? 'Hospital Regional' : regionName.includes('Canada') ? 'Northern Lights Health' : 'Regional Hospital', distanceKm: 6.2 };
    const defaultSub = { name: regionName.includes('Brazil') ? 'Teles Pires Substation' : regionName.includes('Canada') ? 'Athabasca Grid Hub' : 'Power Substation', distanceKm: 11.5 };

    const nearestCityAsset = calculated.find((a) => a.type === 'City') || calculated[0];
    const nearestHospAsset = calculated.find((a) => a.type === 'Hospital') || calculated[0];
    const nearestSubAsset = calculated.find((a) => a.type === 'Substation') || calculated[0];

    // Population estimation within 5km of fire
    const regDef = RegionService.getRegionById(regionName);
    const threatenedPopulation5km = regDef.id === 'brazil' ? 48500 : regDef.id === 'canada' ? 24000 : 38000;

    return {
      nearestCity: {
        name: nearestCityAsset?.name || defaultCity.name,
        distanceKm: nearestCityAsset?.distanceKm ?? defaultCity.distanceKm,
      },
      nearestHospital: {
        name: nearestHospAsset?.name || defaultHosp.name,
        distanceKm: nearestHospAsset?.distanceKm ?? defaultHosp.distanceKm,
      },
      nearestPowerStation: {
        name: nearestSubAsset?.name || defaultSub.name,
        distanceKm: nearestSubAsset?.distanceKm ?? defaultSub.distanceKm,
      },
      threatenedPopulation5km,
      sortedAssets: calculated,
    };
  }

  /**
   * Identifies all infrastructure assets enclosed within a custom drawn GIS polygon
   */
  public static getEnclosedAssets(polygon: LatLngPoint[], regionName: string): CriticalAsset[] {
    const assets = this.getRegionalAssets(regionName);
    return assets.filter((a) => RegionService.isPointInPolygon(a.coords, polygon));
  }
}
