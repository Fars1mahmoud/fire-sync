/**
 * Regional Layer Data Provider for Leaflet Satellite Map
 * Powers all 11 Map Layers across Brazil, Canada, Mediterranean, California, Egypt, and Global:
 * 1. Active Fires (VIIRS / MODIS)
 * 2. Fire Risk (Prediction)
 * 3. Weather (Wind, Temp, Humidity)
 * 4. Wind Overlay
 * 5. Smoke (Sentinel-5P)
 * 6. Infrastructure (OSM)
 * 7. Population
 * 8. Protected Habitats (IUCN)
 * 9. Evacuation Routes
 * 10. Burn Scar (Post-Fire)
 * 11. Vegetation (NDVI)
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface WeatherStationData {
  id: string;
  name: string;
  coords: LatLng;
  tempC: number;
  humidityPct: number;
  windSpeedKmh: number;
  windCompass: string;
  pressureHPa: number;
  kbdi: number; // Keetch-Byram Drought Index (0-800)
  fwi: number; // Canadian Fire Weather Index
  status: 'Extreme' | 'Critical' | 'High' | 'Moderate';
}

export interface WindVectorData {
  id: string;
  coords: LatLng;
  speedKmh: number;
  bearingDeg: number;
  compass: string;
  gustsKmh: number;
}

export interface SmokePlumeData {
  id: string;
  name: string;
  aqi: number;
  category: 'Hazardous' | 'Very Unhealthy' | 'Unhealthy' | 'Moderate';
  pm25: number;
  coColumn: string;
  polygon: [number, number][];
}

export interface FireRiskZoneData {
  id: string;
  name: string;
  center: LatLng;
  radiusMeters: number;
  riskScore: number; // 0 - 100%
  spreadDirection: string;
  spreadVelocityKmh: number;
  polygon?: [number, number][];
}

export interface InfrastructureAssetData {
  id: string;
  name: string;
  type: 'Hospital' | 'FireStation' | 'PowerSubstation' | 'WaterReservoir' | 'Airport';
  icon: string;
  color: string;
  coords: LatLng;
  capacityOrPower: string;
  threatLevel: 'Immediate Threat' | 'Elevated Risk' | 'Active Defense' | 'Operational Buffer';
  distanceToFireKm: number;
}

export interface PopulationCenterData {
  id: string;
  name: string;
  coords: LatLng;
  population: string;
  evacuationStatus: 'Evacuation Order' | 'Evacuation Warning' | 'Shelter in Place' | 'Standby Advisory';
  bufferRadiusMeters: number;
  warningRadiusMeters: number;
}

export interface ProtectedHabitatData {
  id: string;
  name: string;
  iucnCategory: string;
  areaHa: string;
  center: LatLng;
  boundaryPolygon: [number, number][];
  endangeredSpecies: { name: string; status: string; threat: string }[];
}

export interface EvacuationRouteData {
  id: string;
  corridorName: string;
  safeRouteCoords: [number, number][];
  blockedRouteCoords?: [number, number][];
  blockedReason?: string;
  shelters: {
    name: string;
    coords: LatLng;
    capacity: string;
    vhfFreq: string;
  }[];
}

export interface BurnScarData {
  id: string;
  name: string;
  polygon: [number, number][];
  burnedHectares: string;
  severity: 'Extreme Crown Burn' | 'High Severity' | 'Moderate Charring';
  daysAgo: number;
  dnbrScore: number;
}

export interface VegetationZoneData {
  id: string;
  name: string;
  type: 'high_fuel_risk' | 'dense_canopy_moisture';
  ndviScore: number;
  description: string;
  polygon: [number, number][];
}

export interface RegionalLayersBundle {
  regionId: string;
  weatherStations: WeatherStationData[];
  windVectors: WindVectorData[];
  smokePlumes: SmokePlumeData[];
  fireRiskZones: FireRiskZoneData[];
  infrastructureAssets: InfrastructureAssetData[];
  populationCenters: PopulationCenterData[];
  protectedHabitats: ProtectedHabitatData[];
  evacuationRoute: EvacuationRouteData;
  burnScars: BurnScarData[];
  vegetationZones: VegetationZoneData[];
}

export function getRegionalLayersData(regionId: string, centerLat: number, centerLng: number): RegionalLayersBundle {
  const normId = regionId.toLowerCase();

  // 1. BRAZIL (AMAZON / MATO GROSSO / CERRADO)
  if (normId.includes('brazil') || normId === 'br') {
    const lat = centerLat || -11.86;
    const lng = centerLng || -55.51;

    return {
      regionId: 'brazil',
      weatherStations: [
        {
          id: 'WS-BRA-01',
          name: 'Sinop Aeroporto Weather Station (INMET 83332)',
          coords: { lat: lat + 0.05, lng: lng - 0.08 },
          tempC: 36.8,
          humidityPct: 18,
          windSpeedKmh: 31,
          windCompass: 'ENE',
          pressureHPa: 1009,
          kbdi: 742,
          fwi: 52,
          status: 'Extreme',
        },
        {
          id: 'WS-BRA-02',
          name: 'Sorriso Agro-Climatology Tower',
          coords: { lat: lat - 0.42, lng: lng + 0.15 },
          tempC: 35.4,
          humidityPct: 22,
          windSpeedKmh: 24,
          windCompass: 'E',
          pressureHPa: 1011,
          kbdi: 685,
          fwi: 44,
          status: 'Critical',
        },
        {
          id: 'WS-BRA-03',
          name: 'Teles Pires River Catchment Station',
          coords: { lat: lat + 0.45, lng: lng + 0.32 },
          tempC: 34.2,
          humidityPct: 29,
          windSpeedKmh: 19,
          windCompass: 'ENE',
          pressureHPa: 1012,
          kbdi: 620,
          fwi: 38,
          status: 'High',
        },
      ],
      windVectors: [
        { id: 'WV-1', coords: { lat: lat + 0.3, lng: lng - 0.3 }, speedKmh: 32, bearingDeg: 65, compass: 'ENE', gustsKmh: 46 },
        { id: 'WV-2', coords: { lat: lat + 0.3, lng: lng + 0.3 }, speedKmh: 29, bearingDeg: 70, compass: 'ENE', gustsKmh: 42 },
        { id: 'WV-3', coords: { lat: lat, lng: lng }, speedKmh: 31, bearingDeg: 68, compass: 'ENE', gustsKmh: 45 },
        { id: 'WV-4', coords: { lat: lat - 0.3, lng: lng - 0.3 }, speedKmh: 28, bearingDeg: 65, compass: 'ENE', gustsKmh: 40 },
        { id: 'WV-5', coords: { lat: lat - 0.3, lng: lng + 0.3 }, speedKmh: 26, bearingDeg: 72, compass: 'ENE', gustsKmh: 38 },
      ],
      smokePlumes: [
        {
          id: 'SMK-BRA-01',
          name: 'Sinop-Teles Pires Sentinel-5P Smoke Dispersion',
          aqi: 245,
          category: 'Hazardous',
          pm25: 195,
          coColumn: '5.2 mol/m²',
          polygon: [
            [lat, lng],
            [lat - 0.15, lng + 0.45],
            [lat - 0.35, lng + 0.85],
            [lat - 0.55, lng + 0.70],
            [lat - 0.30, lng + 0.25],
          ],
        },
      ],
      fireRiskZones: [
        {
          id: 'FRZ-BRA-01',
          name: 'Xingu-Teles Pires Front Spread Corridor',
          center: { lat: lat + 0.1, lng: lng + 0.1 },
          radiusMeters: 42000,
          riskScore: 94,
          spreadDirection: 'West-Southwest (245°)',
          spreadVelocityKmh: 3.6,
        },
      ],
      infrastructureAssets: [
        {
          id: 'INF-01',
          name: 'Hospital Regional de Sinop (Trauma Ward)',
          type: 'Hospital',
          icon: '🏥',
          color: '#38bdf8',
          coords: { lat: lat - 0.05, lng: lng - 0.06 },
          capacityOrPower: '210 triage beds & Burn Unit',
          threatLevel: 'Elevated Risk',
          distanceToFireKm: 7.8,
        },
        {
          id: 'INF-02',
          name: 'Corpo de Bombeiros Militar 4º BBM Airbase',
          type: 'FireStation',
          icon: '🚒',
          color: '#ef4444',
          coords: { lat: lat + 0.03, lng: lng - 0.02 },
          capacityOrPower: '8 Air Tractor AT-802F Water Bombers',
          threatLevel: 'Active Defense',
          distanceToFireKm: 4.2,
        },
        {
          id: 'INF-03',
          name: 'Teles Pires Hydroelectric 500kV Substation',
          type: 'PowerSubstation',
          icon: '⚡',
          color: '#f59e0b',
          coords: { lat: lat + 0.32, lng: lng + 0.18 },
          capacityOrPower: '1,820 MW Generation Grid Node',
          threatLevel: 'Immediate Threat',
          distanceToFireKm: 3.1,
        },
        {
          id: 'INF-04',
          name: 'Sinop Municipal Water Intake & Reservoir',
          type: 'WaterReservoir',
          icon: '💧',
          color: '#06b6d4',
          coords: { lat: lat - 0.12, lng: lng - 0.15 },
          capacityOrPower: '42,000 m³ Emergency Pumping Reservoir',
          threatLevel: 'Operational Buffer',
          distanceToFireKm: 12.4,
        },
      ],
      populationCenters: [
        {
          id: 'POP-01',
          name: 'Sinop Metropolitan Center',
          coords: { lat: lat - 0.02, lng: lng - 0.03 },
          population: '196,000 residents',
          evacuationStatus: 'Evacuation Warning',
          bufferRadiusMeters: 14000,
          warningRadiusMeters: 28000,
        },
        {
          id: 'POP-02',
          name: 'Sorriso Agricultural District',
          coords: { lat: lat - 0.48, lng: lng + 0.12 },
          population: '110,000 residents',
          evacuationStatus: 'Standby Advisory',
          bufferRadiusMeters: 10000,
          warningRadiusMeters: 22000,
        },
      ],
      protectedHabitats: [
        {
          id: 'HAB-BRA-01',
          name: 'Parque Nacional do Xingu / FUNAI Indigenous Reserve',
          iucnCategory: 'Category II (National Park) & Indigenous Biosphere',
          areaHa: '2,642,000 Ha',
          center: { lat: lat + 0.4, lng: lng + 0.5 },
          boundaryPolygon: [
            [lat + 0.15, lng + 0.25],
            [lat + 0.65, lng + 0.35],
            [lat + 0.75, lng + 0.95],
            [lat + 0.20, lng + 0.85],
          ],
          endangeredSpecies: [
            { name: 'Jaguar (Panthera onca)', status: 'Vulnerable', threat: 'Riparian river corridors under heavy flame breach' },
            { name: 'Giant Armadillo (Priodontes maximus)', status: 'Vulnerable', threat: 'Peat smoke burrow suffocation' },
            { name: 'Hyacinth Macaw (Anodorhynchus)', status: 'Endangered', threat: 'Manduvi palm canopy nesting destruction' },
          ],
        },
      ],
      evacuationRoute: {
        id: 'EVAC-BRA',
        corridorName: 'BR-163 Federal Highway Southbound Evacuation Corridor',
        safeRouteCoords: [
          [lat + 0.18, lng - 0.02],
          [lat + 0.05, lng - 0.04],
          [lat - 0.08, lng - 0.07],
          [lat - 0.25, lng - 0.12],
          [lat - 0.45, lng - 0.18],
        ],
        blockedRouteCoords: [
          [lat + 0.15, lng + 0.08],
          [lat + 0.28, lng + 0.22],
        ],
        blockedReason: 'MT-220 Rural Feeder CLOSED: Crown flame crossing & zero visibility dense smoke',
        shelters: [
          {
            name: 'Ginásio Olímpico de Sinop Safe Assembly Shelter',
            coords: { lat: lat - 0.08, lng: lng - 0.07 },
            capacity: '3,500 evacuees',
            vhfFreq: '156.800 MHz (VHF Channel 16)',
          },
          {
            name: 'Sorriso Municipal Reception Pavilion',
            coords: { lat: lat - 0.45, lng: lng - 0.18 },
            capacity: '5,000 evacuees',
            vhfFreq: '162.400 MHz (Civil Defense)',
          },
        ],
      },
      burnScars: [
        {
          id: 'BS-01',
          name: 'Mato Grosso Southern Flank Historic Burn Scar',
          polygon: [
            [lat - 0.25, lng - 0.45],
            [lat - 0.15, lng - 0.20],
            [lat - 0.35, lng - 0.15],
            [lat - 0.48, lng - 0.38],
          ],
          burnedHectares: '48,600 Hectares',
          severity: 'Extreme Crown Burn',
          daysAgo: 11,
          dnbrScore: 0.68,
        },
      ],
      vegetationZones: [
        {
          id: 'VEG-01',
          name: 'Riparian Humid Rainforest Buffer (Natural Fire Retardant)',
          type: 'dense_canopy_moisture',
          ndviScore: 0.78,
          description: 'High moisture dense canopy, resistant to surface fire penetration',
          polygon: [
            [lat + 0.10, lng - 0.40],
            [lat + 0.40, lng - 0.30],
            [lat + 0.35, lng - 0.15],
            [lat + 0.05, lng - 0.25],
          ],
        },
        {
          id: 'VEG-02',
          name: 'Dry Cerrado Grassland & Tallow Shrub (High Flame Velocity)',
          type: 'high_fuel_risk',
          ndviScore: 0.19,
          description: 'Desiccated fine fuels: Critical ignition risk & rapid headfire velocity',
          polygon: [
            [lat - 0.05, lng + 0.15],
            [lat + 0.25, lng + 0.20],
            [lat + 0.20, lng + 0.45],
            [lat - 0.10, lng + 0.38],
          ],
        },
      ],
    };
  }

  // 2. CANADA (BOREAL / ALBERTA / FORT MCMURRAY)
  if (normId.includes('canada') || normId === 'ca') {
    const lat = centerLat || 56.73;
    const lng = centerLng || -111.38;

    return {
      regionId: 'canada',
      weatherStations: [
        {
          id: 'WS-CAN-01',
          name: 'Fort McMurray Airport Auto Station (YMM)',
          coords: { lat: lat - 0.08, lng: lng - 0.12 },
          tempC: 31.4,
          humidityPct: 16,
          windSpeedKmh: 38,
          windCompass: 'NW',
          pressureHPa: 1004,
          kbdi: 680,
          fwi: 58,
          status: 'Extreme',
        },
        {
          id: 'WS-CAN-02',
          name: 'Anzac Athabasca Boreal Station',
          coords: { lat: lat - 0.35, lng: lng + 0.22 },
          tempC: 29.8,
          humidityPct: 21,
          windSpeedKmh: 30,
          windCompass: 'NW',
          pressureHPa: 1006,
          kbdi: 615,
          fwi: 47,
          status: 'Critical',
        },
      ],
      windVectors: [
        { id: 'WV-C1', coords: { lat: lat + 0.2, lng: lng - 0.2 }, speedKmh: 38, bearingDeg: 315, compass: 'NW', gustsKmh: 54 },
        { id: 'WV-C2', coords: { lat: lat, lng: lng }, speedKmh: 36, bearingDeg: 320, compass: 'NW', gustsKmh: 50 },
        { id: 'WV-C3', coords: { lat: lat - 0.2, lng: lng + 0.2 }, speedKmh: 34, bearingDeg: 310, compass: 'NW', gustsKmh: 48 },
      ],
      smokePlumes: [
        {
          id: 'SMK-CAN-01',
          name: 'Athabasca Boreal Pyrocumulonimbus Plume',
          aqi: 285,
          category: 'Hazardous',
          pm25: 235,
          coColumn: '6.4 mol/m²',
          polygon: [
            [lat, lng],
            [lat - 0.25, lng - 0.35],
            [lat - 0.55, lng - 0.70],
            [lat - 0.75, lng - 0.50],
            [lat - 0.35, lng - 0.10],
          ],
        },
      ],
      fireRiskZones: [
        {
          id: 'FRZ-CAN-01',
          name: 'Horse River & Clearwater Valley Boreal Front',
          center: { lat, lng },
          radiusMeters: 45000,
          riskScore: 96,
          spreadDirection: 'Southeast (135°)',
          spreadVelocityKmh: 4.8,
        },
      ],
      infrastructureAssets: [
        {
          id: 'INF-C01',
          name: 'Northern Lights Regional Health Centre',
          type: 'Hospital',
          icon: '🏥',
          color: '#38bdf8',
          coords: { lat: lat + 0.02, lng: lng - 0.02 },
          capacityOrPower: '120 acute beds / Airway Triage',
          threatLevel: 'Elevated Risk',
          distanceToFireKm: 6.4,
        },
        {
          id: 'INF-C02',
          name: 'Alberta Wildfire Tanker Base 21',
          type: 'FireStation',
          icon: '🚒',
          color: '#ef4444',
          coords: { lat: lat - 0.05, lng: lng - 0.08 },
          capacityOrPower: '4 Convair 580 & Electra Water Bombers',
          threatLevel: 'Active Defense',
          distanceToFireKm: 4.8,
        },
      ],
      populationCenters: [
        {
          id: 'POP-C01',
          name: 'Fort McMurray Urban Service Area',
          coords: { lat, lng },
          population: '68,000 residents',
          evacuationStatus: 'Evacuation Warning',
          bufferRadiusMeters: 12000,
          warningRadiusMeters: 25000,
        },
      ],
      protectedHabitats: [
        {
          id: 'HAB-CAN-01',
          name: 'Wood Buffalo National Park UNESCO Biosphere',
          iucnCategory: 'Category II (National Park) / World Heritage',
          areaHa: '4,480,000 Ha',
          center: { lat: lat + 1.2, lng: lng - 0.8 },
          boundaryPolygon: [
            [lat + 0.6, lng - 1.2],
            [lat + 1.6, lng - 1.4],
            [lat + 1.8, lng - 0.4],
            [lat + 0.8, lng - 0.2],
          ],
          endangeredSpecies: [
            { name: 'Wood Bison (Bison athabascae)', status: 'Near Threatened', threat: 'Boreal taiga meadow forage perimeters in fire path' },
            { name: 'Whooping Crane (Grus americana)', status: 'Endangered', threat: 'Nesting catchment smoke toxicity' },
          ],
        },
      ],
      evacuationRoute: {
        id: 'EVAC-CAN',
        corridorName: 'Highway 63 Southbound Life-Line Arterial',
        safeRouteCoords: [
          [lat + 0.05, lng - 0.02],
          [lat - 0.15, lng - 0.08],
          [lat - 0.35, lng - 0.15],
          [lat - 0.65, lng - 0.22],
        ],
        shelters: [
          {
            name: 'Anzac Recreation Safe Haven Center',
            coords: { lat: lat - 0.38, lng: lng - 0.18 },
            capacity: '4,000 evacuees',
            vhfFreq: '146.520 MHz',
          },
        ],
      },
      burnScars: [
        {
          id: 'BS-C01',
          name: 'Taiga Boreal Charcoal Scar 2024',
          polygon: [
            [lat + 0.25, lng - 0.35],
            [lat + 0.45, lng - 0.20],
            [lat + 0.35, lng + 0.05],
            [lat + 0.15, lng - 0.10],
          ],
          burnedHectares: '62,400 Hectares',
          severity: 'High Severity',
          daysAgo: 18,
          dnbrScore: 0.74,
        },
      ],
      vegetationZones: [
        {
          id: 'VEG-C01',
          name: 'Dense Jack Pine & Black Spruce (Extreme Torching Fuel)',
          type: 'high_fuel_risk',
          ndviScore: 0.24,
          description: 'Dry coniferous boreal crown fuel with explosive torching resin',
          polygon: [
            [lat - 0.10, lng + 0.10],
            [lat + 0.15, lng + 0.25],
            [lat + 0.05, lng + 0.40],
            [lat - 0.20, lng + 0.25],
          ],
        },
      ],
    };
  }

  // 3. EGYPT (NILE DELTA / COAST / WADI NATRUN)
  if (normId.includes('egypt') || normId === 'eg') {
    const lat = centerLat || 30.85;
    const lng = centerLng || 31.25;

    return {
      regionId: 'egypt',
      weatherStations: [
        {
          id: 'WS-EGY-01',
          name: 'Tanta Central Delta Weather Station (EMA 62366)',
          coords: { lat: lat - 0.05, lng: lng - 0.02 },
          tempC: 38.2,
          humidityPct: 24,
          windSpeedKmh: 28,
          windCompass: 'NNW',
          pressureHPa: 1013,
          kbdi: 690,
          fwi: 41,
          status: 'Critical',
        },
        {
          id: 'WS-EGY-02',
          name: 'Alexandria Coastal Monitoring Tower',
          coords: { lat: lat + 0.35, lng: lng - 1.25 },
          tempC: 32.5,
          humidityPct: 48,
          windSpeedKmh: 34,
          windCompass: 'NW',
          pressureHPa: 1015,
          kbdi: 520,
          fwi: 32,
          status: 'Moderate',
        },
      ],
      windVectors: [
        { id: 'WV-E1', coords: { lat: lat + 0.2, lng: lng - 0.2 }, speedKmh: 29, bearingDeg: 340, compass: 'NNW', gustsKmh: 42 },
        { id: 'WV-E2', coords: { lat: lat, lng: lng }, speedKmh: 28, bearingDeg: 345, compass: 'NNW', gustsKmh: 40 },
        { id: 'WV-E3', coords: { lat: lat - 0.2, lng: lng + 0.2 }, speedKmh: 26, bearingDeg: 335, compass: 'NNW', gustsKmh: 38 },
      ],
      smokePlumes: [
        {
          id: 'SMK-EGY-01',
          name: 'Delta Agricultural Biomass & Thermal Haze Plume',
          aqi: 185,
          category: 'Unhealthy',
          pm25: 145,
          coColumn: '3.8 mol/m²',
          polygon: [
            [lat, lng],
            [lat - 0.15, lng - 0.08],
            [lat - 0.35, lng - 0.15],
            [lat - 0.40, lng + 0.10],
            [lat - 0.18, lng + 0.18],
          ],
        },
      ],
      fireRiskZones: [
        {
          id: 'FRZ-EGY-01',
          name: 'Delta Rice-Straw & Palm Belt Spread Risk',
          center: { lat, lng },
          radiusMeters: 32000,
          riskScore: 88,
          spreadDirection: 'South-Southeast (160°)',
          spreadVelocityKmh: 2.8,
        },
      ],
      infrastructureAssets: [
        {
          id: 'INF-E01',
          name: 'Tanta University Emergency Hospital',
          type: 'Hospital',
          icon: '🏥',
          color: '#38bdf8',
          coords: { lat: lat - 0.08, lng: lng - 0.01 },
          capacityOrPower: '450 Beds / Respiratory Center',
          threatLevel: 'Elevated Risk',
          distanceToFireKm: 8.5,
        },
        {
          id: 'INF-E02',
          name: 'Civil Protection Delta Central Fire Station',
          type: 'FireStation',
          icon: '🚒',
          color: '#ef4444',
          coords: { lat: lat + 0.02, lng: lng - 0.04 },
          capacityOrPower: '18 Heavy Foam Pumping Engines',
          threatLevel: 'Active Defense',
          distanceToFireKm: 5.2,
        },
        {
          id: 'INF-E03',
          name: 'Talkha 750kV Combined Cycle Power Station',
          type: 'PowerSubstation',
          icon: '⚡',
          color: '#f59e0b',
          coords: { lat: lat + 0.28, lng: lng + 0.14 },
          capacityOrPower: '1,450 MW Grid Generation Hub',
          threatLevel: 'Immediate Threat',
          distanceToFireKm: 4.1,
        },
      ],
      populationCenters: [
        {
          id: 'POP-E01',
          name: 'Tanta Urban District',
          coords: { lat: lat - 0.06, lng: lng - 0.02 },
          population: '580,000 residents',
          evacuationStatus: 'Evacuation Warning',
          bufferRadiusMeters: 12000,
          warningRadiusMeters: 24000,
        },
        {
          id: 'POP-E02',
          name: 'Mansoura Municipal Center',
          coords: { lat: lat + 0.26, lng: lng + 0.18 },
          population: '620,000 residents',
          evacuationStatus: 'Standby Advisory',
          bufferRadiusMeters: 14000,
          warningRadiusMeters: 28000,
        },
      ],
      protectedHabitats: [
        {
          id: 'HAB-EGY-01',
          name: 'Wadi El Rayan & Lake Burullus Wetland Biosphere',
          iucnCategory: 'Category IV (Ramsar Wetland Protected Area)',
          areaHa: '46,200 Ha',
          center: { lat: lat + 0.65, lng: lng - 0.35 },
          boundaryPolygon: [
            [lat + 0.50, lng - 0.60],
            [lat + 0.80, lng - 0.55],
            [lat + 0.75, lng - 0.10],
            [lat + 0.45, lng - 0.20],
          ],
          endangeredSpecies: [
            { name: 'Egyptian Tortoise (Testudo kleinmanni)', status: 'Critically Endangered', threat: 'Shrubland fire entrapment' },
            { name: 'Slender-horned Gazelle (Gazella leptoceros)', status: 'Endangered', threat: 'Marshland reed bed destruction' },
          ],
        },
      ],
      evacuationRoute: {
        id: 'EVAC-EGY',
        corridorName: 'Cairo-Alexandria Agricultural Highway (Route 1)',
        safeRouteCoords: [
          [lat + 0.35, lng + 0.12],
          [lat + 0.15, lng + 0.05],
          [lat - 0.10, lng - 0.04],
          [lat - 0.35, lng - 0.12],
        ],
        shelters: [
          {
            name: 'Tanta Youth & Sports Safe Emergency Haven',
            coords: { lat: lat - 0.10, lng: lng - 0.04 },
            capacity: '4,500 citizens',
            vhfFreq: '155.500 MHz (Civil Defense)',
          },
        ],
      },
      burnScars: [
        {
          id: 'BS-E01',
          name: 'Delta Agrarian Residue Burn Perimeter',
          polygon: [
            [lat + 0.12, lng - 0.25],
            [lat + 0.22, lng - 0.15],
            [lat + 0.18, lng - 0.05],
            [lat + 0.05, lng - 0.18],
          ],
          burnedHectares: '14,200 Hectares',
          severity: 'Moderate Charring',
          daysAgo: 6,
          dnbrScore: 0.48,
        },
      ],
      vegetationZones: [
        {
          id: 'VEG-E01',
          name: 'Nile Canal Alluvial Crop Canopy (Moist Buffer)',
          type: 'dense_canopy_moisture',
          ndviScore: 0.81,
          description: 'High-yield irrigated silt canopy, serves as vegetative firebreak',
          polygon: [
            [lat - 0.15, lng + 0.10],
            [lat + 0.05, lng + 0.22],
            [lat - 0.05, lng + 0.35],
            [lat - 0.22, lng + 0.25],
          ],
        },
      ],
    };
  }

  // 4. MEDITERRANEAN BASIN / GREECE / CALIFORNIA / DEFAULT GENERAL FALLBACK
  const lat = centerLat || 38.2;
  const lng = centerLng || 23.7;

  return {
    regionId: normId,
    weatherStations: [
      {
        id: 'WS-GEN-01',
        name: `${normId.toUpperCase()} Regional Met Station 01`,
        coords: { lat: lat + 0.05, lng: lng - 0.05 },
        tempC: 34.6,
        humidityPct: 20,
        windSpeedKmh: 30,
        windCompass: 'NE',
        pressureHPa: 1012,
        kbdi: 710,
        fwi: 49,
        status: 'Extreme',
      },
      {
        id: 'WS-GEN-02',
        name: `${normId.toUpperCase()} Regional Met Station 02`,
        coords: { lat: lat - 0.15, lng: lng + 0.12 },
        tempC: 33.1,
        humidityPct: 24,
        windSpeedKmh: 25,
        windCompass: 'NE',
        pressureHPa: 1014,
        kbdi: 640,
        fwi: 41,
        status: 'Critical',
      },
    ],
    windVectors: [
      { id: 'WV-G1', coords: { lat: lat + 0.2, lng: lng - 0.2 }, speedKmh: 32, bearingDeg: 45, compass: 'NE', gustsKmh: 45 },
      { id: 'WV-G2', coords: { lat: lat, lng: lng }, speedKmh: 30, bearingDeg: 45, compass: 'NE', gustsKmh: 42 },
      { id: 'WV-G3', coords: { lat: lat - 0.2, lng: lng + 0.2 }, speedKmh: 28, bearingDeg: 50, compass: 'NE', gustsKmh: 39 },
    ],
    smokePlumes: [
      {
        id: 'SMK-GEN-01',
        name: 'Regional Atmospheric Dispersion Plume',
        aqi: 215,
        category: 'Very Unhealthy',
        pm25: 175,
        coColumn: '4.2 mol/m²',
        polygon: [
          [lat, lng],
          [lat - 0.18, lng - 0.15],
          [lat - 0.38, lng - 0.30],
          [lat - 0.45, lng - 0.10],
          [lat - 0.20, lng + 0.05],
        ],
      },
    ],
    fireRiskZones: [
      {
        id: 'FRZ-GEN-01',
        name: 'High Hazard Spread Danger Sector',
        center: { lat, lng },
        radiusMeters: 38000,
        riskScore: 91,
        spreadDirection: 'Southwest (225°)',
        spreadVelocityKmh: 3.4,
      },
    ],
    infrastructureAssets: [
      {
        id: 'INF-G01',
        name: 'Regional Trauma Hospital & Emergency Care',
        type: 'Hospital',
        icon: '🏥',
        color: '#38bdf8',
        coords: { lat: lat - 0.06, lng: lng - 0.05 },
        capacityOrPower: '180 acute beds',
        threatLevel: 'Elevated Risk',
        distanceToFireKm: 7.2,
      },
      {
        id: 'INF-G02',
        name: 'Central Wildfire Rapid Response Hub',
        type: 'FireStation',
        icon: '🚒',
        color: '#ef4444',
        coords: { lat: lat + 0.04, lng: lng - 0.02 },
        capacityOrPower: 'Heavy Tanker Deployment Fleet',
        threatLevel: 'Active Defense',
        distanceToFireKm: 4.8,
      },
      {
        id: 'INF-G03',
        name: 'Regional Power Grid High-Voltage Hub',
        type: 'PowerSubstation',
        icon: '⚡',
        color: '#f59e0b',
        coords: { lat: lat + 0.18, lng: lng + 0.15 },
        capacityOrPower: '850 MW Grid Transmission Node',
        threatLevel: 'Immediate Threat',
        distanceToFireKm: 3.5,
      },
    ],
    populationCenters: [
      {
        id: 'POP-G01',
        name: 'Regional Municipal Hub',
        coords: { lat: lat - 0.04, lng: lng - 0.02 },
        population: '145,000 residents',
        evacuationStatus: 'Evacuation Warning',
        bufferRadiusMeters: 12000,
        warningRadiusMeters: 24000,
      },
    ],
    protectedHabitats: [
      {
        id: 'HAB-GEN-01',
        name: 'Protected Regional Nature Reserve / IUCN Biopark',
        iucnCategory: 'Category II (National Biosphere Reserve)',
        areaHa: '78,400 Ha',
        center: { lat: lat + 0.35, lng: lng + 0.25 },
        boundaryPolygon: [
          [lat + 0.15, lng + 0.10],
          [lat + 0.45, lng + 0.15],
          [lat + 0.50, lng + 0.45],
          [lat + 0.20, lng + 0.40],
        ],
        endangeredSpecies: [
          { name: 'Endangered Regional Fauna', status: 'Endangered', threat: 'Primary wildlife corridor in direct path of thermal front' },
        ],
      },
    ],
    evacuationRoute: {
      id: 'EVAC-GEN',
      corridorName: 'Primary Highway Safe Evacuation Arterial',
      safeRouteCoords: [
        [lat + 0.20, lng - 0.05],
        [lat + 0.05, lng - 0.08],
        [lat - 0.15, lng - 0.12],
        [lat - 0.35, lng - 0.18],
      ],
      shelters: [
        {
          name: 'Civic Auditorium Safe Assembly Haven',
          coords: { lat: lat - 0.15, lng: lng - 0.12 },
          capacity: '3,000 citizens',
          vhfFreq: '156.800 MHz',
        },
      ],
    },
    burnScars: [
      {
        id: 'BS-GEN-01',
        name: 'Historic Charred Perimeter Scar',
        polygon: [
          [lat - 0.18, lng - 0.32],
          [lat - 0.08, lng - 0.22],
          [lat - 0.22, lng - 0.14],
          [lat - 0.32, lng - 0.24],
        ],
        burnedHectares: '28,400 Hectares',
        severity: 'High Severity',
        daysAgo: 9,
        dnbrScore: 0.62,
      },
    ],
    vegetationZones: [
      {
        id: 'VEG-GEN-01',
        name: 'Dry Chaparral / Pine Needles (High Ignition Risk)',
        type: 'high_fuel_risk',
        ndviScore: 0.22,
        description: 'Dry fine fuels with rapid spotting potential',
        polygon: [
          [lat - 0.05, lng + 0.12],
          [lat + 0.15, lng + 0.18],
          [lat + 0.10, lng + 0.32],
          [lat - 0.10, lng + 0.26],
        ],
      },
    ],
  };
}
