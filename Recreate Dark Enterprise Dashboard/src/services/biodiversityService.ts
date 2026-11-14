/**
 * IUCN Red List Biodiversity & Protected Habitat Service
 * Monitors fire encroachment on Natura 2000 and US Wilderness Sanctuaries.
 */

import { calculateDistanceKm, type LatLngPoint } from './gisService';

export interface EndangeredSpecies {
  commonName: string;
  scientificName: string;
  iucnStatus: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened';
  estimatedPopulationInZone: string;
  threatDetails: string;
}

export interface ProtectedSanctuary {
  id: string;
  name: string;
  region: 'Mediterranean Basin' | 'California';
  coords: LatLngPoint;
  designation: string;
  areaHa: number;
  species: EndangeredSpecies[];
  boundaryPolygon: LatLngPoint[];
}

export const REGIONAL_SANCTUARIES: ProtectedSanctuary[] = [
  {
    id: 'SANCT-BRA-01',
    name: 'Xingu Indigenous Reserve & Amazon Biome Sanctuary',
    region: 'Brazil' as any,
    coords: { lat: -11.20, lng: -53.50 },
    designation: 'Federal Protected Biosphere / FUNAI Indigenous Land',
    areaHa: 2642000,
    boundaryPolygon: [
      { lat: -10.50, lng: -54.00 },
      { lat: -10.80, lng: -53.00 },
      { lat: -12.00, lng: -53.20 },
      { lat: -11.80, lng: -54.20 },
    ],
    species: [
      {
        commonName: 'Jaguar (Onça-Pintada)',
        scientificName: 'Panthera onca',
        iucnStatus: 'Vulnerable',
        estimatedPopulationInZone: '620 individuals',
        threatDetails: 'Primary riparian hunting corridors along Xingu river breached by active thermal anomalies.',
      },
      {
        commonName: 'Giant Armadillo',
        scientificName: 'Priodontes maximus',
        iucnStatus: 'Vulnerable',
        threatDetails: 'Subterranean burrow suffocation due to dense peat smoke ingress.',
        estimatedPopulationInZone: 'Low density',
      },
      {
        commonName: 'Hyacinth Macaw',
        scientificName: 'Anodorhynchus hyacinthinus',
        iucnStatus: 'Vulnerable',
        threatDetails: 'Loss of Manduvi palm nesting hollows destroyed by intense crown fires.',
        estimatedPopulationInZone: '1,400 breeding pairs',
      },
    ],
  },
  {
    id: 'SANCT-CAN-01',
    name: 'Wood Buffalo National Park Boreal Sanctuary',
    region: 'Canada' as any,
    coords: { lat: 59.38, lng: -112.98 },
    designation: 'UNESCO World Heritage / Dark Sky Preserve',
    areaHa: 4480000,
    boundaryPolygon: [
      { lat: 58.50, lng: -114.50 },
      { lat: 60.00, lng: -114.00 },
      { lat: 60.10, lng: -111.50 },
      { lat: 58.60, lng: -112.00 },
    ],
    species: [
      {
        commonName: 'Wood Bison',
        scientificName: 'Bison bison athabascae',
        iucnStatus: 'Near Threatened',
        estimatedPopulationInZone: '3,100 animals',
        threatDetails: 'Boreal taiga meadow forage perimeters subject to active crown burns.',
      },
      {
        commonName: 'Whooping Crane',
        scientificName: 'Grus americana',
        iucnStatus: 'Endangered',
        threatDetails: 'Only self-sustaining wild nesting grounds in the world threatened by smoke and water catchment dry-out.',
        estimatedPopulationInZone: '500 individuals',
      },
    ],
  },
  {
    id: 'SANCT-MED-01',
    name: 'Mount Parnitha National Park / Natura 2000 Reserve',
    region: 'Mediterranean Basin',
    coords: { lat: 38.16, lng: 23.71 },
    designation: 'Special Protection Area (SPA) GR3000001',
    areaHa: 38120,
    boundaryPolygon: [
      { lat: 38.12, lng: 23.65 },
      { lat: 38.20, lng: 23.68 },
      { lat: 38.22, lng: 23.78 },
      { lat: 38.15, lng: 23.82 },
      { lat: 38.10, lng: 23.72 },
    ],
    species: [
      {
        commonName: 'European Red Deer',
        scientificName: 'Cervus elaphus',
        iucnStatus: 'Endangered',
        estimatedPopulationInZone: '240 individuals',
        threatDetails: 'Primary valley grazing grounds directly on the eastern flame trajectory.',
      },
      {
        commonName: "Hermann's Tortoise",
        scientificName: 'Testudo hermanni',
        iucnStatus: 'Vulnerable',
        threatDetails: 'Slow ground dispersal makes this species vulnerable to fast-moving grassfire flanks.',
        estimatedPopulationInZone: 'Isolated colony',
      },
    ],
  },
  {
    id: 'SANCT-CAL-01',
    name: 'Yosemite Wilderness & Mariposa Grove Reserve',
    region: 'California',
    coords: { lat: 37.51, lng: -119.60 },
    designation: 'UNESCO Biosphere / National Wilderness Area',
    areaHa: 285150,
    boundaryPolygon: [
      { lat: 37.45, lng: -119.70 },
      { lat: 37.58, lng: -119.65 },
      { lat: 37.60, lng: -119.50 },
      { lat: 37.48, lng: -119.48 },
    ],
    species: [
      {
        commonName: 'Giant Sequoia',
        scientificName: 'Sequoiadendron giganteum',
        iucnStatus: 'Endangered',
        estimatedPopulationInZone: '500 mature monarchs',
        threatDetails: 'High-intensity crown fire breaching historical fire-adapted bark thresholds.',
      },
    ],
  },
];

export class BiodiversityService {
  public static getRegionalSanctuary(regionName: string): ProtectedSanctuary {
    const lower = regionName.toLowerCase();
    if (lower.includes('canada')) {
      return REGIONAL_SANCTUARIES[1];
    }
    if (lower.includes('california')) {
      return REGIONAL_SANCTUARIES[3];
    }
    if (lower.includes('mediterranean') || lower.includes('greece')) {
      return REGIONAL_SANCTUARIES[2];
    }
    // Default to Brazil
    return REGIONAL_SANCTUARIES[0];
  }

  public static checkSanctuaryThreat(fireCoords: LatLngPoint, regionName: string) {
    const sanct = this.getRegionalSanctuary(regionName);
    const distanceKm = calculateDistanceKm(fireCoords, sanct.coords);

    let threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MONITORED' = 'MONITORED';
    if (distanceKm < 5) threatLevel = 'CRITICAL';
    else if (distanceKm < 15) threatLevel = 'HIGH';
    else if (distanceKm < 30) threatLevel = 'ELEVATED';

    return {
      sanctuary: sanct,
      distanceKm: Math.round(distanceKm * 10) / 10,
      threatLevel,
      speciesAtRiskCount: sanct.species.length,
      alertHeadline: `Protected habitat nearby: ${sanct.name} (${Math.round(distanceKm * 10) / 10} km)`,
    };
  }
}
