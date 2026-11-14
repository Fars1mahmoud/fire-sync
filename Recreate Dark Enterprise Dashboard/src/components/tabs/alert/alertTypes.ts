export type SeverityLevel = 'Critical' | 'High' | 'Moderate' | 'Low';
export type AlertStatus = 'Unresolved' | 'Acknowledged' | 'Resolved';

export interface AlertItem {
  id: string;
  title: string;
  titleAr?: string;
  subtitle: string;
  subtitleAr?: string;
  severity: SeverityLevel;
  status: AlertStatus;
  timeArabic: string;
  timeEnglish: string;
  timestamp: number;
  region: string;
  regionAr?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  frpMw: number; // Fire Radiative Power (MW)
  confidence: number; // 0-100%
  windSpeed: string;
  windSpeedAr?: string;
  humidity: string;
  satellite: string;
  category?: 'EVACUATION' | 'SMOKE' | 'EXTREME_FIRE' | 'INFRASTRUCTURE';
}

export interface AlertRule {
  id: string;
  triggerType: string;
  triggerTypeAr?: string;
  riskLevel: SeverityLevel;
  region: string;
  regionAr?: string;
  channels: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  createdAt: number;
}

const NOW = Date.now();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-001',
    title: 'New Fire Detected',
    titleAr: 'رصد اشتعال حريق جديد',
    subtitle: 'High Infrared Signature Detected in Canopy',
    subtitleAr: 'بصمة حرارية مرتفعة جداً تحت المظلة الشجرية',
    severity: 'Critical',
    status: 'Unresolved',
    timeArabic: 'منذ 15 دقيقة',
    timeEnglish: '15 mins ago',
    timestamp: NOW - 15 * MINUTE,
    region: 'Brazil (Amazon - Sector 4)',
    regionAr: 'البرازيل (حوض الأمازون — القطاع 4)',
    coordinates: { lat: -3.4653, lng: -62.2159 },
    frpMw: 642,
    confidence: 98,
    windSpeed: '28 km/h ENE',
    windSpeedAr: '28 كم/ساعة شمال شرق',
    humidity: '18% RH',
    satellite: 'VIIRS / NOAA-20 Suomi-NPP',
    category: 'EXTREME_FIRE',
  },
  {
    id: 'alt-002',
    title: 'High Risk Increase',
    titleAr: 'تصاعد سريع في مستوى الخطورة',
    subtitle: 'Thermal Cluster Rapid Perimeter Expansion',
    subtitleAr: 'توسع محيط البؤرة الحرارية بسرعة فائقة',
    severity: 'High',
    status: 'Unresolved',
    timeArabic: 'منذ ساعة واحدة',
    timeEnglish: '1 hour ago',
    timestamp: NOW - 1 * HOUR,
    region: 'Brazil (Mato Grosso Basin)',
    regionAr: 'البرازيل (حوض ماتو غروسو)',
    coordinates: { lat: -12.6819, lng: -56.9211 },
    frpMw: 380,
    confidence: 91,
    windSpeed: '22 km/h NE',
    windSpeedAr: '22 كم/ساعة شمال شرق',
    humidity: '24% RH',
    satellite: 'MODIS / Terra Satellite',
    category: 'EXTREME_FIRE',
  },
  {
    id: 'alt-003',
    title: 'Fire Approaching Settlement',
    titleAr: 'اقتراب النيران من تجمع سكاني',
    subtitle: 'Perimeter within 3.2km of Residential Zone',
    subtitleAr: 'خط النار على بعد 3.2 كم من التجمع السكاني',
    severity: 'High',
    status: 'Acknowledged',
    timeArabic: 'منذ 3 ساعات',
    timeEnglish: '3 hours ago',
    timestamp: NOW - 3 * HOUR,
    region: 'Bolivia (Chiquitania Border)',
    regionAr: 'بوليفيا (حدود تشيكيتانيا)',
    coordinates: { lat: -16.2902, lng: -60.9632 },
    frpMw: 520,
    confidence: 95,
    windSpeed: '31 km/h S',
    windSpeedAr: '31 كم/ساعة جنوباً',
    humidity: '16% RH',
    satellite: 'Sentinel-2 Multispectral Hub',
    category: 'EVACUATION',
  },
  {
    id: 'alt-004',
    title: 'Smoke Affecting City',
    titleAr: 'دخان كثيف يؤثر على المدينة',
    subtitle: 'Air Quality Index Approaching Hazardous Level',
    subtitleAr: 'مؤشر جودة الهواء يقترب من المستويات الخطرة',
    severity: 'Moderate',
    status: 'Acknowledged',
    timeArabic: 'منذ 3 ساعات',
    timeEnglish: '3 hours ago',
    timestamp: NOW - 3 * HOUR - 5 * MINUTE,
    region: 'Brazil (Porto Velho Metro)',
    regionAr: 'البرازيل (منطقة بورتو فيلهو)',
    coordinates: { lat: -8.7619, lng: -63.9039 },
    frpMw: 195,
    confidence: 84,
    windSpeed: '14 km/h W',
    windSpeedAr: '14 كم/ساعة غرباً',
    humidity: '32% RH',
    satellite: 'GOES-16 Geostationary',
    category: 'SMOKE',
  },
  {
    id: 'alt-005',
    title: 'Weather Conditions Critical',
    titleAr: 'ظروف مناخية حرجة لإشعال النيران',
    subtitle: 'Extreme Dryness, Gusts Exceeding 45 km/h',
    subtitleAr: 'جفاف قياسي ورياح تتجاوز 45 كم/ساعة',
    severity: 'Moderate',
    status: 'Unresolved',
    timeArabic: 'منذ يوم واحد',
    timeEnglish: '1 day ago',
    timestamp: NOW - 1 * DAY,
    region: 'Canada (Fort McMurray Corridor)',
    regionAr: 'كندا (ممر فورت ماكموراي)',
    coordinates: { lat: 56.7261, lng: -111.3790 },
    frpMw: 140,
    confidence: 79,
    windSpeed: '38 km/h SE Gusting 50',
    windSpeedAr: '38 كم/ساعة جنوب شرق مع هبات 50',
    humidity: '12% RH',
    satellite: 'VIIRS NOAA-20',
    category: 'INFRASTRUCTURE',
  },
];

export const INITIAL_RULES: AlertRule[] = [
  {
    id: 'rule-01',
    triggerType: 'New Fire Detection',
    triggerTypeAr: 'رصد حريق جديد',
    riskLevel: 'Critical',
    region: 'Brazil (Amazon)',
    regionAr: 'البرازيل (حوض الأمازون)',
    channels: { email: true, sms: true, inApp: true },
    createdAt: NOW - 5 * DAY,
  },
  {
    id: 'rule-02',
    triggerType: 'Thermal Anomaly Spike',
    triggerTypeAr: 'قفزة مفاجئة في البصمة الحرارية',
    riskLevel: 'High',
    region: 'Bolivia (Chiquitania)',
    regionAr: 'بوليفيا (تشيكيتانيا)',
    channels: { email: true, sms: false, inApp: true },
    createdAt: NOW - 3 * DAY,
  },
  {
    id: 'rule-03',
    triggerType: 'Smoke Plume Incursion',
    triggerTypeAr: 'توغل عمود دخاني باتجاه المدن',
    riskLevel: 'Moderate',
    region: 'Brazil (Cerrado)',
    regionAr: 'البرازيل (السيرادو)',
    channels: { email: false, sms: false, inApp: true },
    createdAt: NOW - 1 * DAY,
  },
];

