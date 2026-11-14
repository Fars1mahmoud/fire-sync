export interface Hotspot {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  frp: number; // Fire Radiative Power in MW
  tempK: number;
  confidence: number;
  satellite: 'VIIRS' | 'MODIS';
  status: 'Critical' | 'High' | 'Contained';
  acres: number;
  timeDetected: string;
  dateDetected?: string;
  stateOrRegion?: string;
  region?: string;
  year?: number;
  dayOfYear?: number;
  normalizedAreaWeight?: number;
  xPct?: number; // Position on map 0-100
  yPct?: number;
}

export interface TacticalAircraft {
  id: string;
  callsign: string;
  type: 'Canadair CL-415' | 'Sikorsky S-64 Air-Crane' | 'Bell 412 Recon';
  status: 'En Route' | 'Water Drop Active' | 'Refilling at Sea' | 'Standby';
  fuelPct: number;
  waterCapacityLiters: number;
  lat: number;
  lon: number;
  xPct: number;
  yPct: number;
  targetHotspot: string;
  dropsCompleted: number;
}

export interface SatelliteOverpass {
  satellite: string;
  sensor: string;
  resolution: string;
  overpassTimeUTC: string;
  countdownMinutes: number;
  coverage: string;
  status: 'Upcoming' | 'In Progress' | 'Processed';
}

import nasaFirmsHotspots from './nasa_firms_hotspots.json';

export const REALISTIC_HOTSPOTS: Hotspot[] = [
  ...(nasaFirmsHotspots as Hotspot[]),
  {
    id: 'HOT-GR-01',
    name: 'Rhodes Forest Front',
    country: 'Greece',
    lat: 36.18,
    lon: 27.95,
    frp: 340,
    tempK: 368,
    confidence: 99,
    satellite: 'VIIRS',
    status: 'Critical',
    acres: 14200,
    timeDetected: '13:42 UTC',
    xPct: 69,
    yPct: 34
  },
  {
    id: 'HOT-GR-02',
    name: 'Attica & Mount Parnitha',
    country: 'Greece',
    lat: 38.15,
    lon: 23.72,
    frp: 285,
    tempK: 361,
    confidence: 97,
    satellite: 'VIIRS',
    status: 'Critical',
    acres: 9800,
    timeDetected: '14:15 UTC',
    xPct: 66,
    yPct: 38
  },
  {
    id: 'HOT-IT-01',
    name: 'Sicily & Mount Etna Flank',
    country: 'Italy',
    lat: 37.65,
    lon: 14.98,
    frp: 220,
    tempK: 354,
    confidence: 95,
    satellite: 'MODIS',
    status: 'High',
    acres: 8400,
    timeDetected: '12:20 UTC',
    xPct: 46,
    yPct: 35
  },
  {
    id: 'HOT-ES-01',
    name: 'Valencia & Alicante Foothills',
    country: 'Spain',
    lat: 39.22,
    lon: -0.55,
    frp: 195,
    tempK: 349,
    confidence: 94,
    satellite: 'VIIRS',
    status: 'High',
    acres: 11200,
    timeDetected: '11:05 UTC',
    xPct: 12,
    yPct: 38
  },
  {
    id: 'HOT-TR-01',
    name: 'Antalya & Manavgat Pinewoods',
    country: 'Turkey',
    lat: 36.88,
    lon: 31.42,
    frp: 310,
    tempK: 365,
    confidence: 98,
    satellite: 'VIIRS',
    status: 'Critical',
    acres: 13500,
    timeDetected: '14:30 UTC',
    xPct: 86,
    yPct: 41
  },
  {
    id: 'HOT-DZ-01',
    name: 'Kabylie Forest Range',
    country: 'Algeria',
    lat: 36.65,
    lon: 4.25,
    frp: 245,
    tempK: 358,
    confidence: 96,
    satellite: 'MODIS',
    status: 'High',
    acres: 7600,
    timeDetected: '10:50 UTC',
    xPct: 20,
    yPct: 56
  }
];

export const TACTICAL_FLEET: TacticalAircraft[] = [
  {
    id: 'AIR-01',
    callsign: 'PELICAN 22',
    type: 'Canadair CL-415',
    status: 'Water Drop Active',
    fuelPct: 78,
    waterCapacityLiters: 6140,
    lat: 36.3,
    lon: 28.1,
    xPct: 67,
    yPct: 33,
    targetHotspot: 'Rhodes Forest Front',
    dropsCompleted: 7
  },
  {
    id: 'AIR-02',
    callsign: 'ICARUS 04',
    type: 'Canadair CL-415',
    status: 'Refilling at Sea',
    fuelPct: 62,
    waterCapacityLiters: 6140,
    lat: 38.0,
    lon: 24.1,
    xPct: 65,
    yPct: 36,
    targetHotspot: 'Attica & Mount Parnitha',
    dropsCompleted: 5
  },
  {
    id: 'AIR-03',
    callsign: 'SKYCRANE 09',
    type: 'Sikorsky S-64 Air-Crane',
    status: 'En Route',
    fuelPct: 85,
    waterCapacityLiters: 9500,
    lat: 37.5,
    lon: 15.2,
    xPct: 47,
    yPct: 34,
    targetHotspot: 'Sicily & Mount Etna Flank',
    dropsCompleted: 3
  }
];

export const SATELLITE_OVERPASS_SCHEDULE: SatelliteOverpass[] = [
  {
    satellite: 'Suomi-NPP',
    sensor: 'VIIRS (375m I-Band)',
    resolution: '375 m',
    overpassTimeUTC: '14:48 UTC',
    countdownMinutes: 28,
    coverage: 'East Mediterranean & Greece',
    status: 'Upcoming'
  },
  {
    satellite: 'Aqua',
    sensor: 'MODIS (Thermal 4µm/11µm)',
    resolution: '1000 m',
    overpassTimeUTC: '15:20 UTC',
    countdownMinutes: 60,
    coverage: 'Central Mediterranean & Italy',
    status: 'Upcoming'
  },
  {
    satellite: 'Sentinel-2A',
    sensor: 'MSI (SWIR / NDVI)',
    resolution: '10 m / 20 m',
    overpassTimeUTC: '16:05 UTC',
    countdownMinutes: 105,
    coverage: 'Peloponnese & Rhodes Burn Scar',
    status: 'Upcoming'
  },
  {
    satellite: 'Sentinel-5P',
    sensor: 'TROPOMI (NO2 & AOD)',
    resolution: '3.5 x 5.5 km',
    overpassTimeUTC: '17:15 UTC',
    countdownMinutes: 175,
    coverage: 'European Basin Aerosol Plume',
    status: 'Upcoming'
  }
];

export const MONTHLY_ANOMALY_DATA = [
  { month: 'Jan', current: 18, historical: 22, anomaly: 0 },
  { month: 'Feb', current: 24, historical: 26, anomaly: 0 },
  { month: 'Mar', current: 35, historical: 38, anomaly: 0 },
  { month: 'Apr', current: 52, historical: 48, anomaly: 8 },
  { month: 'May', current: 85, historical: 70, anomaly: 18 },
  { month: 'Jun', current: 145, historical: 110, anomaly: 45 },
  { month: 'Jul', current: 188, historical: 135, anomaly: 85 },
  { month: 'Aug', current: 205, historical: 142, anomaly: 95 },
  { month: 'Sep', current: 135, historical: 98, anomaly: 55 },
  { month: 'Oct', current: 70, historical: 62, anomaly: 15 },
  { month: 'Nov', current: 38, historical: 35, anomaly: 5 },
  { month: 'Dec', current: 22, historical: 24, anomaly: 0 },
];

export const KPIS = {
  activeFires: { value: '1,248', change: '+12%', labelEn: 'Active Fires', labelAr: 'الحرائق النشطة' },
  fireArea: { value: '58,320', unit: 'ha', change: '+35%', labelEn: 'Fire Area (ha)', labelAr: 'المساحة المحترقة (هكتار)' },
  frp: { value: '12,450', unit: 'MW', change: '+28%', labelEn: 'FRP (MW)', labelAr: 'طاقة الإشعاع (ميجاوات)' },
  highRiskAreas: { value: '18', change: '+6', labelEn: 'High Risk Areas', labelAr: 'المناطق عالية الخطورة' },
  affectedCities: { value: '27', change: '+4', labelEn: 'Affected Cities', labelAr: 'المدن المتأثرة' },
  nearbyPopulation: { value: '2.3M', change: '+48%', labelEn: 'Nearby Population', labelAr: 'السكان المهددون' },
};

// Containment & Water Dropping Engineering Model
export function calculateSuppressionRequirements(totalFrpMw: number, burnedAreaHa: number) {
  // Fireline needed approx = 0.08 * sqrt(burnedAreaHa * 10000)
  const firelineKm = Math.round(0.08 * Math.sqrt(burnedAreaHa * 10000) * 10) / 10;
  // Water required: approx 15 liters per MW per hour * active hours
  const waterTonsRequired = Math.round((totalFrpMw * 12.5) / 100);
  const retardantFoamTons = Math.round(waterTonsRequired * 0.08);
  const aerialDropsNeeded = Math.ceil((waterTonsRequired * 1000) / 6140); // Canadair capacity
  const estimatedContainmentHours = Math.round(Math.max(12, firelineKm * 1.8));

  return {
    firelineKm,
    waterTonsRequired,
    retardantFoamTons,
    aerialDropsNeeded,
    estimatedContainmentHours
  };
}

// GIS GeoJSON / KML / CSV Exporters
export function exportHotspotsAsGeoJSON(hotspots: Hotspot[]): string {
  const featureCollection = {
    type: 'FeatureCollection',
    metadata: {
      generatedBy: 'NASA FireGuard Enterprise GIS',
      timestamp: new Date().toISOString(),
      count: hotspots.length,
      coordinateSystem: 'EPSG:4326 (WGS84)'
    },
    features: hotspots.map((h) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [h.lon, h.lat]
      },
      properties: {
        id: h.id,
        name: h.name,
        country: h.country,
        frp_mw: h.frp,
        brightness_temp_k: h.tempK,
        confidence_pct: h.confidence,
        satellite_sensor: h.satellite,
        status: h.status,
        burned_acres: h.acres,
        time_detected_utc: h.timeDetected
      }
    }))
  };
  return JSON.stringify(featureCollection, null, 2);
}

export function exportHotspotsAsKML(hotspots: Hotspot[]): string {
  const placemarks = hotspots.map((h) => `
    <Placemark>
      <name>${h.name} (${h.frp} MW)</name>
      <description><![CDATA[
        <b>Status:</b> ${h.status}<br/>
        <b>FRP:</b> ${h.frp} MW<br/>
        <b>Sensor:</b> ${h.satellite} (${h.confidence}%)<br/>
        <b>Time:</b> ${h.timeDetected}<br/>
        <b>Country:</b> ${h.country}
      ]]></description>
      <Point>
        <coordinates>${h.lon},${h.lat},0</coordinates>
      </Point>
    </Placemark>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>NASA FireGuard Active Hotspots</name>
    ${placemarks}
  </Document>
</kml>`;
}

export function exportHotspotsAsCSV(hotspots: Hotspot[]): string {
  const header = 'id,name,country,latitude,longitude,frp_mw,brightness_temp_kelvin,confidence_pct,satellite,status,acres,time_utc\n';
  const rows = hotspots.map(h =>
    `"${h.id}","${h.name}","${h.country}",${h.lat},${h.lon},${h.frp},${h.tempK},${h.confidence},"${h.satellite}","${h.status}",${h.acres},"${h.timeDetected}"`
  ).join('\n');
  return header + rows;
}

export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const TRANSLATIONS = {
  en: {
    appTitle: 'Fire sync',
    appSubtitle: 'Global Wildfire Monitoring & Prediction',
    searchPlaceholder: 'Search location (city, region, coordinates)...',
    emergencyMode: 'Emergency Mode',
    emergencyActive: 'EMERGENCY PROTOCOL ACTIVE',
    lowBandwidth: 'Low-Bandwidth Mode',
    colorblindMode: 'Colorblind Mode',
    regionSelection: 'Region Selection',
    predefined: 'Predefined',
    custom: 'Custom',
    mediterraneanBasin: 'Mediterranean Basin',
    california: 'California',
    globalBeta: 'Global (Beta)',
    mapLayers: 'Map Layers',
    activeFiresLayer: 'Active Fires (VIIRS / MODIS)',
    fireRiskLayer: 'Fire Risk (Prediction)',
    weatherLayer: 'Weather (Wind, Temp, Humidity)',
    windOverlayLayer: 'Wind Overlay',
    smokeLayer: 'Smoke (Sentinel-5P)',
    infraLayer: 'Infrastructure (OSM)',
    populationLayer: 'Population',
    habitatsLayer: 'Protected Habitats (IUCN)',
    evacRoutesLayer: 'Evacuation Routes',
    burnScarLayer: 'Burn Scar (Post-Fire)',
    vegetationLayer: 'Vegetation (NDVI)',
    fleetLayer: 'Tactical Aircraft (Canadair)',
    spreadVectorsLayer: 'Fire Spread Vectors (3h/6h/12h)',
    timeRange: 'Time Range',
    satelliteData: 'Satellite Data',
    modis: 'MODIS (1 km)',
    viirs: 'VIIRS (375 m)',
    resNorm: 'Resolution Normalization',
    fireRadiativePower: 'Fire Radiative Power (MW)',
    scale500km: '500 km',
    fireActivityCalendar: 'Fire Activity Calendar',
    liveWeather: 'Live Weather',
    nasaPower: '(NASA POWER)',
    fireRiskPrediction: 'Fire Risk Prediction',
    next3Days: '(Next 3 Days)',
    anomalyChart: 'Anomaly Chart',
    fireActivityCount: 'Fire Activity (Count)',
    currentYear: 'Current Year (2024)',
    historicalAvg: 'Historical Average (2015-2023)',
    anomaly: 'Anomaly',
    unusualActivity: 'Unusual Activity',
    smokeAirQuality: 'Smoke & Air Quality',
    groundTruth: 'Ground Truth / Citizen Reports',
    confirmedFire: 'Confirmed Fire',
    possibleFire: 'Possible Fire',
    falseDetection: 'False Detection',
    submitReport: 'Submit Report',
    infraProximity: 'Infrastructure & Proximity',
    nearestCity: 'Nearest City: 3.2 km',
    nearestHospital: 'Nearest Hospital: 5.1 km',
    popWithin5km: 'Population within 5 km: 42,000',
    evacuationRouting: 'Evacuation Routing',
    suggestedRoute: 'Suggested Route',
    blockedRoad: 'Blocked Road',
    evacuationPoint: 'Evacuation Point',
    safeRoutePill: 'Safe Route (12 km)',
    postFireRecovery: 'Post-Fire Recovery',
    before2023: 'Before (2023)',
    after2024: 'After (2024)',
    ndvi: 'NDVI',
    vegRecovery: 'Vegetation Recovery: 24%',
    estRecoveryTime: 'Est. Recovery Time: 3-5 years',
    forestTimeMachine: 'Forest Time Machine',
    whatIfSimulator: 'What-If Fire Simulator',
    windSpeed: 'Wind Speed',
    windDir: 'Wind Direction',
    temp: 'Temperature',
    soilMoisture: 'Soil Moisture',
    runSimulation: 'Run Simulation',
    predictedSpread: 'Predicted Spread (3 Days)',
    fireDataSonification: 'Fire Data Sonification',
    biodiversityAlert: 'Biodiversity Alert',
    protectedHabitatNearby: 'Protected habitat nearby',
    distance4km: 'Distance: 4.1 km',
    speciesAtRisk: 'Species at risk: 3',
    generateSituationReport: 'Generate Situation Report',
    reportType: 'Report Type',
    fullAnalysis: 'Full Analysis',
    language: 'Language',
    generatePdf: 'Generate PDF',
    bilingualReport: 'Bilingual Report',
    exportData: 'Export GIS Data',
    broadcastSimulator: 'Broadcast Alert Simulator',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    none: 'None',
    critical: 'Critical',
    gisTools: 'GIS Tools',
    ruler: 'Measure Distance & Area',
    polygon: 'Polygon Freehand Area',
    opacity: 'Layer Opacity',
    splitCompare: 'Split Screen Satellite',
    arLens: 'AR Fire Lens',
    overpassSchedule: 'Satellite Overpass Countdown'
  },
  ar: {
    appTitle: 'فاير سينك | Fire sync',
    appSubtitle: 'الرصد والتنبؤ بحرائق الغابات عالمياً - وكالة ناسا',
    searchPlaceholder: 'ابحث عن موقع (مدينة، إقليم، إحداثيات)...',
    emergencyMode: 'وضع الطوارئ',
    emergencyActive: 'بروتوكول الطوارئ القصوى مفعّل',
    lowBandwidth: 'نمط الاتصال الضعيف (للميدان)',
    colorblindMode: 'نمط عمى الألوان',
    regionSelection: 'تحديد النطاق الجغرافي',
    predefined: 'مسبق التحديد',
    custom: 'مخصص',
    mediterraneanBasin: 'حوض البحر الأبيض المتوسط',
    california: 'كاليفورنيا',
    globalBeta: 'العالمي (تجريبي)',
    mapLayers: 'طبقات الخريطة',
    activeFiresLayer: 'الحرائق النشطة (VIIRS / MODIS)',
    fireRiskLayer: 'مخاطر الحرائق (التنبؤ)',
    weatherLayer: 'الطقس (الرياح، الحرارة، الرطوبة)',
    windOverlayLayer: 'متجهات الرياح الجوية',
    smokeLayer: 'الدخان والغازات (Sentinel-5P)',
    infraLayer: 'البنية التحتية والمنشآت (OSM)',
    populationLayer: 'الكثافة السكانية',
    habitatsLayer: 'المحميات الطبيعية (IUCN)',
    evacRoutesLayer: 'مسارات الإخلاء والإنقاذ',
    burnScarLayer: 'آثار الحريق السابقة (Burn Scar)',
    vegetationLayer: 'الغطاء النباتي (NDVI)',
    fleetLayer: 'طائرات الإطفاء التكتيكية (Canadair)',
    spreadVectorsLayer: 'متجهات انتشار الحريق (3/6/12 ساعة)',
    timeRange: 'النطاق الزمني',
    satelliteData: 'بيانات الأقمار الصناعية',
    modis: 'موديس MODIS (1 كم)',
    viirs: 'فيرز VIIRS (375 م)',
    resNorm: 'معايرة دقة المستشعرات',
    fireRadiativePower: 'طاقة الإشعاع الحراري (ميجاوات)',
    scale500km: '500 كم',
    fireActivityCalendar: 'تقويم النشاط الحراري',
    liveWeather: 'الطقس الحي',
    nasaPower: '(ناسا POWER)',
    fireRiskPrediction: 'تنبؤ مخاطر الحرائق',
    next3Days: '(خلال 3 أيام)',
    anomalyChart: 'مخطط النشاط الاستثنائي (الانحراف)',
    fireActivityCount: 'تعداد الحرائق النشطة',
    currentYear: 'العام الحالي (2024)',
    historicalAvg: 'المتوسط التاريخي (2015-2023)',
    anomaly: 'نشاط شاذ',
    unusualActivity: 'نشاط استثنائي حرج',
    smokeAirQuality: 'الدخان وجودة الهواء',
    groundTruth: 'البلاغات الميدانية والتحقق',
    confirmedFire: 'حريق مؤكد',
    possibleFire: 'حريق محتمل',
    falseDetection: 'إنذار خاطئ',
    submitReport: 'إرسال بلاغ ميداني',
    infraProximity: 'البنية التحتية ونطاق الأمان',
    nearestCity: 'أقرب مدينة: 3.2 كم',
    nearestHospital: 'أقرب مستشفى: 5.1 كم',
    popWithin5km: 'السكان ضمن نطاق 5 كم: 42,000 نسمة',
    evacuationRouting: 'مسار الإخلاء التكتيكي',
    suggestedRoute: 'المسار الآمن المقترح',
    blockedRoad: 'طريق مقطوع بالنيران',
    evacuationPoint: 'نقطة التجمع والإيواء',
    safeRoutePill: 'مسار آمن (12 كم)',
    postFireRecovery: 'التعافي البيئي بعد الحريق',
    before2023: 'قبل (2023)',
    after2024: 'بعد (2024)',
    ndvi: 'مؤشر الغطاء النباتي (NDVI)',
    vegRecovery: 'نسبة تجدد الغطاء: 24%',
    estRecoveryTime: 'المدة المقدرة للتعافي: 3-5 سنوات',
    forestTimeMachine: 'آلة الزمن للغابات (التطور التاريخي)',
    whatIfSimulator: 'محاكي سيناريوهات انتشار الحريق',
    windSpeed: 'سرعة الرياح',
    windDir: 'اتجاه الرياح',
    temp: 'درجة الحرارة',
    soilMoisture: 'رطوبة التربة',
    runSimulation: 'تشغيل المحاكاة',
    predictedSpread: 'التوسع المتوقع (3 أيام)',
    fireDataSonification: 'الصوتنة الصوتية للبيانات',
    biodiversityAlert: 'تنبيه التنوع البيولوجي',
    protectedHabitatNearby: 'محمية بيئية قريبة مهددة',
    distance4km: 'المسافة: 4.1 كم',
    speciesAtRisk: 'الأنواع المعرضة للخطر: 3',
    generateSituationReport: 'إصدار تقرير الموقف الميداني',
    reportType: 'نوع التقرير',
    fullAnalysis: 'تحليل شامل متكامل',
    language: 'اللغة',
    generatePdf: 'توليد ملف PDF',
    bilingualReport: 'تقرير ثنائي اللغة',
    exportData: 'تصدير بيانات GIS',
    broadcastSimulator: 'محاكي بث رسائل الطوارئ',
    high: 'مرتفع',
    moderate: 'متوسط',
    low: 'منخفض',
    none: 'معدوم',
    critical: 'حرج جداً',
    gisTools: 'أدوات التحليل الجغرافي',
    ruler: 'قياس المسافات والمساحات',
    polygon: 'تحديد مضلع حر',
    opacity: 'شفافية الطبقات',
    splitCompare: 'مقارنة فضائية منقسمة',
    arLens: 'عدسة الواقع المعزز AR',
    overpassSchedule: 'جدول مرور الأقمار الصناعية'
  }
};
