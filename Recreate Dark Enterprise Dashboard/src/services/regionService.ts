/**
 * Regional Definition & Global Geographic Context Service
 * Manages spatial boundaries, map centers, and regional baselines for:
 * - Mediterranean Basin
 * - California
 * - Custom Geographic Polygon / Bounding Box
 */

import type { LatLngPoint } from './gisService';

export interface RegionDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  flag: string;
  center: LatLngPoint;
  defaultZoom: number;
  bounds: [LatLngPoint, LatLngPoint]; // SW, NE
  timezone: string;
  nominalAreaKm2: number;
  riskBaseline: 'Critical' | 'Extreme' | 'High' | 'Moderate' | 'Low';
  descriptionEn: string;
  descriptionAr: string;
  // Regional Baseline Statistics for Dynamic Dashboard Calculations
  baseActiveFires: number;
  baseBurnedAreaHa: number;
  baseFrpMW: number;
  baseCriticalAreas: number;
  baseAffectedCities: number;
  basePopulationAtRisk: string;
  monthlyPeakMonthIndex: number; // 0-11 (e.g. 7 = Aug)
  anomalyPct: number;
}

export const SUPPORTED_REGIONS: Record<string, RegionDefinition> = {
  'Brazil': {
    id: 'brazil',
    nameEn: 'Brazil',
    nameAr: 'البرازيل (حوض الأمازون وسيرادو وبانتانال)',
    flag: '🇧🇷',
    center: { lat: -10.82, lng: -55.45 },
    defaultZoom: 4,
    bounds: [
      { lat: -33.75, lng: -73.99 },
      { lat: 5.27, lng: -34.79 },
    ],
    timezone: 'UTC-3 (BRT)',
    nominalAreaKm2: 8515767,
    riskBaseline: 'Extreme',
    descriptionEn: 'Amazon rainforest basin, Pantanal wetlands, and Cerrado savanna agricultural burn belts (7.69M satellite detections 2020–2024).',
    descriptionAr: 'حوض غابات الأمازون ومستنقعات بانتانال وسافانا سيرادو (7.69 مليون رصد قمر صناعي بين 2020 و 2024).',
    baseActiveFires: 4950,
    baseBurnedAreaHa: 215000,
    baseFrpMW: 48900,
    baseCriticalAreas: 42,
    baseAffectedCities: 54,
    basePopulationAtRisk: '5.6M',
    monthlyPeakMonthIndex: 8, // September
    anomalyPct: 228,
  },
  'Canada': {
    id: 'canada',
    nameEn: 'Canada',
    nameAr: 'كندا (الغابات الشمالية وألبرتا وكيبك)',
    flag: '🇨🇦',
    center: { lat: 56.13, lng: -106.35 },
    defaultZoom: 4,
    bounds: [
      { lat: 41.68, lng: -141.0 },
      { lat: 83.11, lng: -52.62 },
    ],
    timezone: 'UTC-6 (MDT)',
    nominalAreaKm2: 9984670,
    riskBaseline: 'Critical',
    descriptionEn: 'Boreal coniferous forests, Northwest Territories, Alberta, and Quebec wildfire belts (3.18M satellite detections 2020–2024).',
    descriptionAr: 'الغابات الشمالية الصنوبرية الشاسعة في ألبرتا والمقاطعات الشمالية الغربية وكيبك (3.18 مليون رصد قمر صناعي).',
    baseActiveFires: 3820,
    baseBurnedAreaHa: 284000,
    baseFrpMW: 54200,
    baseCriticalAreas: 36,
    baseAffectedCities: 41,
    basePopulationAtRisk: '3.9M',
    monthlyPeakMonthIndex: 6, // July (2023 mega-season)
    anomalyPct: 312,
  },
  'Mediterranean Basin': {
    id: 'mediterranean',
    nameEn: 'Mediterranean Basin',
    nameAr: 'حوض البحر الأبيض المتوسط (كامل)',
    flag: '🌍',
    center: { lat: 38.0, lng: 20.0 },
    defaultZoom: 5,
    bounds: [
      { lat: 30.0, lng: -10.0 },
      { lat: 46.0, lng: 37.0 },
    ],
    timezone: 'UTC+2 / UTC+3',
    nominalAreaKm2: 2500000,
    riskBaseline: 'Extreme',
    descriptionEn: 'Southern Europe, Levant, and North Africa fire belt under Meltemi and Sirocco wind influence.',
    descriptionAr: 'حزام حرائق جنوب أوروبا والمشرق وشمال إفريقيا تحت تأثير رياح الملتيمي والشيروكو.',
    baseActiveFires: 1248,
    baseBurnedAreaHa: 58320,
    baseFrpMW: 12450,
    baseCriticalAreas: 18,
    baseAffectedCities: 27,
    basePopulationAtRisk: '2.3M',
    monthlyPeakMonthIndex: 7, // August
    anomalyPct: 180,
  },
  'California': {
    id: 'california',
    nameEn: 'California',
    nameAr: 'ولاية كاليفورنيا (سييرا وبوت)',
    flag: '🇺🇸',
    center: { lat: 37.2, lng: -119.5 },
    defaultZoom: 6,
    bounds: [
      { lat: 32.5, lng: -124.5 },
      { lat: 42.0, lng: -114.1 },
    ],
    timezone: 'UTC-7 (PDT)',
    nominalAreaKm2: 423970,
    riskBaseline: 'Critical',
    descriptionEn: 'Sierra Nevada, Plumas, Shasta, and chaparral belts driven by Diablo and Santa Ana winds.',
    descriptionAr: 'غابات سييرا نيفادا وبلوماس وشاستا وأحزمة الشابارال تحت رياح ديابلو وسانتا آنا الجافة.',
    baseActiveFires: 1894,
    baseBurnedAreaHa: 89450,
    baseFrpMW: 18720,
    baseCriticalAreas: 24,
    baseAffectedCities: 34,
    basePopulationAtRisk: '3.8M',
    monthlyPeakMonthIndex: 8, // September
    anomalyPct: 220,
  },
  'Italy & Sicily': {
    id: 'italy',
    nameEn: 'Italy & Sicily',
    nameAr: 'إيطاليا وصقلية (إتنا وكالابريا)',
    flag: '🇮🇹',
    center: { lat: 38.8, lng: 15.2 },
    defaultZoom: 7,
    bounds: [
      { lat: 36.4, lng: 11.8 },
      { lat: 42.5, lng: 18.5 },
    ],
    timezone: 'UTC+2 (CEST)',
    nominalAreaKm2: 302073,
    riskBaseline: 'High',
    descriptionEn: 'Mount Etna flanks, Catania plain, and Calabria mountains under hot African Sirocco airmasses.',
    descriptionAr: 'منحدرات جبل إتنا وسهل كاتانيا وجبال كالابريا المتأثرة بالكتل الهوائية الإفريقية الحارة.',
    baseActiveFires: 285,
    baseBurnedAreaHa: 24600,
    baseFrpMW: 6400,
    baseCriticalAreas: 6,
    baseAffectedCities: 9,
    basePopulationAtRisk: '320k',
    monthlyPeakMonthIndex: 6, // July
    anomalyPct: 155,
  },
  'Spain': {
    id: 'spain',
    nameEn: 'Spain',
    nameAr: 'إسبانيا (فالنسيا وأليكانتي)',
    flag: '🇪🇸',
    center: { lat: 39.5, lng: -0.8 },
    defaultZoom: 7,
    bounds: [
      { lat: 36.0, lng: -9.5 },
      { lat: 43.8, lng: 3.3 },
    ],
    timezone: 'UTC+2 (CEST)',
    nominalAreaKm2: 505990,
    riskBaseline: 'High',
    descriptionEn: 'Levante coastal mountain forests and inland scrublands susceptible to high heatwaves and dry Poniente winds.',
    descriptionAr: 'غابات الساحل الشرقي وأحراج فالنسيا المعرضة للموجات الحارة الشديدة ورياح بونينتي الجافة.',
    baseActiveFires: 310,
    baseBurnedAreaHa: 28900,
    baseFrpMW: 7200,
    baseCriticalAreas: 7,
    baseAffectedCities: 11,
    basePopulationAtRisk: '410k',
    monthlyPeakMonthIndex: 7, // August
    anomalyPct: 165,
  },
  'Algeria': {
    id: 'algeria',
    nameEn: 'Algeria',
    nameAr: 'الجزائر (منطقة القبائل وجبال الأطلس)',
    flag: '🇩🇿',
    center: { lat: 36.5, lng: 4.5 },
    defaultZoom: 7,
    bounds: [
      { lat: 33.0, lng: -2.0 },
      { lat: 37.5, lng: 8.5 },
    ],
    timezone: 'UTC+1 (CET)',
    nominalAreaKm2: 2381741,
    riskBaseline: 'Extreme',
    descriptionEn: 'Djurdjura and Tell Atlas cork-oak forests influenced by scorching southern Chehili desert winds.',
    descriptionAr: 'غابات البلوط والفلين في جبال جرجرة والأطلس التلي المتأثرة برياح الشهيلي الصحراوية اللافحة.',
    baseActiveFires: 240,
    baseBurnedAreaHa: 19800,
    baseFrpMW: 5800,
    baseCriticalAreas: 5,
    baseAffectedCities: 8,
    basePopulationAtRisk: '260k',
    monthlyPeakMonthIndex: 7, // August
    anomalyPct: 190,
  },
  'Turkey': {
    id: 'turkey',
    nameEn: 'Turkey',
    nameAr: 'تركيا (أنطاليا والساحل المتوسطي)',
    flag: '🇹🇷',
    center: { lat: 37.0, lng: 31.5 },
    defaultZoom: 7,
    bounds: [
      { lat: 35.8, lng: 26.0 },
      { lat: 42.1, lng: 44.8 },
    ],
    timezone: 'UTC+3 (TRT)',
    nominalAreaKm2: 783562,
    riskBaseline: 'Extreme',
    descriptionEn: 'Taurus Mountain pine reserves and Mediterranean coastline subject to low humidity and sudden gusty fronts.',
    descriptionAr: 'غابات الصنوبر في جبال طوروس والساحل الجنوبي المعرضة لانخفاض حاد في الرطوبة والرياح المفاجئة.',
    baseActiveFires: 380,
    baseBurnedAreaHa: 34500,
    baseFrpMW: 8900,
    baseCriticalAreas: 8,
    baseAffectedCities: 13,
    basePopulationAtRisk: '520k',
    monthlyPeakMonthIndex: 6, // July
    anomalyPct: 175,
  },
  'Egypt': {
    id: 'egypt',
    nameEn: 'Egypt',
    nameAr: 'مصر (الساحل الشمالي ودلتا النيل)',
    flag: '🇪🇬',
    center: { lat: 31.0, lng: 30.5 },
    defaultZoom: 7,
    bounds: [
      { lat: 29.5, lng: 25.0 },
      { lat: 32.0, lng: 34.5 },
    ],
    timezone: 'UTC+3 (EEST)',
    nominalAreaKm2: 1010408,
    riskBaseline: 'Moderate',
    descriptionEn: 'North coast scrub vegetation, agricultural delta perimeters, and Wadi El Natrun reed belts.',
    descriptionAr: 'الأحراش الساحلية الشمالية، وأطراف الدلتا الزراعية، وأحواض القصب في وادي النطرون وسيناء.',
    baseActiveFires: 95,
    baseBurnedAreaHa: 6200,
    baseFrpMW: 1850,
    baseCriticalAreas: 2,
    baseAffectedCities: 4,
    basePopulationAtRisk: '140k',
    monthlyPeakMonthIndex: 5, // June
    anomalyPct: 130,
  },

  'Global (Beta)': {
    id: 'global',
    nameEn: 'Global (Beta)',
    nameAr: 'الرصد العالمي (تجريبي)',
    flag: '🌐',
    center: { lat: 20.0, lng: 0.0 },
    defaultZoom: 3,
    bounds: [
      { lat: -60.0, lng: -180.0 },
      { lat: 75.0, lng: 180.0 },
    ],
    timezone: 'UTC',
    nominalAreaKm2: 510000000,
    riskBaseline: 'High',
    descriptionEn: 'Planetary satellite surveillance covering Boreal, Mediterranean, Australian, and Savanna biomes.',
    descriptionAr: 'مراقبة عبر الأقمار الصناعية الكوكبية لجميع النطاقات الحيوية المعرضة للاشتعال حول العالم.',
    baseActiveFires: 4890,
    baseBurnedAreaHa: 280000,
    baseFrpMW: 54000,
    baseCriticalAreas: 68,
    baseAffectedCities: 112,
    basePopulationAtRisk: '12.5M',
    monthlyPeakMonthIndex: 7, // August
    anomalyPct: 160,
  },
};

export class RegionService {
  public static getAllRegions(): RegionDefinition[] {
    return Object.values(SUPPORTED_REGIONS);
  }

  public static getRegionById(nameOrId: string): RegionDefinition {
    if (!nameOrId) return SUPPORTED_REGIONS['Brazil'];
    const lower = nameOrId.toLowerCase().trim();

    // 1. Direct key/id match
    for (const key of Object.keys(SUPPORTED_REGIONS)) {
      const reg = SUPPORTED_REGIONS[key];
      if (
        reg.id.toLowerCase() === lower ||
        reg.nameEn.toLowerCase() === lower ||
        reg.nameAr.toLowerCase() === lower ||
        key.toLowerCase() === lower ||
        lower.includes(reg.id.toLowerCase())
      ) {
        return reg;
      }
    }

    // 2. Multilingual & Geo aliases (Brazil & Canada first!)
    if (lower.includes('brazil') || lower.includes('brasil') || lower.includes('برازيل') || lower.includes('amazon') || lower.includes('أمازون')) {
      return SUPPORTED_REGIONS['Brazil'];
    }
    if (lower.includes('canada') || lower.includes('canadien') || lower.includes('كندا') || lower.includes('alberta') || lower.includes('ألبرتا') || lower.includes('quebec') || lower.includes('كيبك')) {
      return SUPPORTED_REGIONS['Canada'];
    }
    if (lower.includes('californ') || lower.includes('usa') || lower.includes('united states')) {
      return SUPPORTED_REGIONS['California'];
    }
    if (lower.includes('greec') || lower.includes('athens') || lower.includes('rhodes') || lower.includes('يونان')) {
      return SUPPORTED_REGIONS['Greece'];
    }
    if (lower.includes('ital') || lower.includes('sicil') || lower.includes('etna') || lower.includes('إيطال') || lower.includes('صقلي')) {
      return SUPPORTED_REGIONS['Italy & Sicily'];
    }
    if (lower.includes('spain') || lower.includes('valenc') || lower.includes('إسبان') || lower.includes('اسبان')) {
      return SUPPORTED_REGIONS['Spain'];
    }
    if (lower.includes('alger') || lower.includes('kabyl') || lower.includes('جزائر')) {
      return SUPPORTED_REGIONS['Algeria'];
    }
    if (lower.includes('turk') || lower.includes('antal') || lower.includes('تركي')) {
      return SUPPORTED_REGIONS['Turkey'];
    }
    if (lower.includes('egypt') || lower.includes('alex') || lower.includes('مصر') || lower.includes('سيناء')) {
      return SUPPORTED_REGIONS['Egypt'];
    }
    if (lower.includes('global') || lower.includes('عالم')) {
      return SUPPORTED_REGIONS['Global (Beta)'];
    }

    return SUPPORTED_REGIONS['Brazil'];
  }

  /**
   * Identifies which geographic region contains a given coordinate point
   */
  public static findRegionByPoint(point: LatLngPoint): RegionDefinition {
    // 1. Check primary regions first (Brazil and Canada)
    if (this.isPointInBounds(point, SUPPORTED_REGIONS['Brazil'].bounds)) {
      return SUPPORTED_REGIONS['Brazil'];
    }
    if (this.isPointInBounds(point, SUPPORTED_REGIONS['Canada'].bounds)) {
      return SUPPORTED_REGIONS['Canada'];
    }

    // 2. Check other monitored regions
    const otherKeys = ['California', 'Greece', 'Italy & Sicily', 'Spain', 'Algeria', 'Turkey', 'Egypt', 'Mediterranean Basin'];
    for (const key of otherKeys) {
      const def = SUPPORTED_REGIONS[key];
      if (def && this.isPointInBounds(point, def.bounds)) {
        return def;
      }
    }

    // 3. Fallback to Brazil / Global
    return SUPPORTED_REGIONS['Brazil'];
  }

  /**
   * Checks if a coordinate point is within a geographic bounding box
   */
  public static isPointInBounds(point: LatLngPoint, bounds: [LatLngPoint, LatLngPoint]): boolean {
    const [sw, ne] = bounds;
    return (
      point.lat >= Math.min(sw.lat, ne.lat) &&
      point.lat <= Math.max(sw.lat, ne.lat) &&
      point.lng >= Math.min(sw.lng, ne.lng) &&
      point.lng <= Math.max(sw.lng, ne.lng)
    );
  }

  /**
   * Ray-casting algorithm to test if a point is inside a polygon
   */
  public static isPointInPolygon(point: LatLngPoint, polygon: LatLngPoint[]): boolean {
    if (polygon.length < 3) return true;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;

      const intersect =
        yi > point.lat !== yj > point.lat &&
        point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}
