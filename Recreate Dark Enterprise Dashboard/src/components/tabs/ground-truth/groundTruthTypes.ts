export type ReportType = 'confirmed' | 'false' | 'review';
export type ReportFilter = 'all' | 'pending' | 'confirmed' | 'false';

export interface GalleryPhoto {
  url: string;
  label: string;
  labelAr: string;
  type: 'optical' | 'thermal' | 'plume' | 'satellite';
}

export interface FireReport {
  id: string;
  title: string;
  titleAr?: string;
  type: ReportType;
  status: 'confirmed' | 'pending' | 'false';
  locationName: string;
  locationNameAr?: string;
  timeAgo: string;
  timeAgoAr?: string;
  timestamp: number;
  coordinates: string;
  coordsGps: { lat: number; lng: number };
  mapPosition: { x: number; y: number }; // Percentage fallback
  imageUrl: string;
  galleryImages?: GalleryPhoto[];
  description?: string;
  descriptionAr?: string;
  confidence?: number;
  reporterName?: string;
  reporterRole?: string;
  frpMw?: number;
  tempK?: number;
  satelliteSource?: string;
}

export interface NetworkNode {
  id: string;
  lat: number;
  lng: number;
  x: number; // Percentage fallback
  y: number; // Percentage fallback
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  label: string;
  type: 'fire' | 'warning' | 'alert' | 'clear' | 'sensor';
  reportId?: string;
  hasPulse?: boolean;
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  color: string;
  width?: number;
  dashed?: boolean;
}

export interface GroundTruthSector {
  id: string;
  name: string;
  nameAr: string;
  center: { lat: number; lng: number };
  defaultZoom: number;
  satelliteMapImage: string;
  presetCoordinates: Array<{ label: string; labelAr: string; coords: string; lat: number; lng: number; x: number; y: number }>;
}

export const GROUND_TRUTH_SECTORS: Record<string, GroundTruthSector> = {
  'basin-central': {
    id: 'basin-central',
    name: 'Amazon Basin & Cerrado (Brazil)',
    nameAr: 'حوض الأمازون وسيرادو (البرازيل)',
    center: { lat: -6.5000, lng: -58.5000 },
    defaultZoom: 7,
    satelliteMapImage: '/assets/ground-truth/forest_satellite_map_1793981648264.jpg',
    presetCoordinates: [
      {
        label: 'Sector 4B North (Active Canopy Fire)',
        labelAr: 'قطاع 4B شمالاً (حريق تاجي نشط)',
        coords: '280 - 20-15.1 205 - 36.5878',
        lat: -7.0507,
        lng: -59.3079,
        x: 57,
        y: 44,
      },
      {
        label: 'Sector 2W West Ridge (Agricultural)',
        labelAr: 'قطاع 2W غرباً (حرق زراعي مضبوط)',
        coords: '264 - 18-09.3 198 - 35.8821',
        lat: -9.786,
        lng: -66.1295,
        x: 31,
        y: 52,
      },
      {
        label: 'Sector 9 Valley Station (Scrubland)',
        labelAr: 'قطاع 9 محطة الوادي (أراضي شجيرية)',
        coords: '30 - 3.0216 327 - 65.4595',
        lat: -3.0216,
        lng: -65.4595,
        x: 42,
        y: 27,
      },
      {
        label: 'Canyon Ridge Sector 7 (Flank Blaze)',
        labelAr: 'حافة الوادي قطاع 7 (جبهة مشتعلة)',
        coords: '292 - 23-10.4 214 - 37.1042',
        lat: -6.6171,
        lng: -53.1555,
        x: 41,
        y: 57,
      },
    ],
  },

  'canada': {
    id: 'canada',
    name: 'Canada Boreal Mega-Corridor',
    nameAr: 'ممر الغابات الشمالية (كندا)',
    center: { lat: 56.7261, lng: -111.3790 },
    defaultZoom: 6,
    satelliteMapImage: '/assets/ground-truth/forest_satellite_map_1793981648264.jpg',
    presetCoordinates: [
      {
        label: 'Fort McMurray Perimeter (Crown Fire)',
        labelAr: 'محيط فورت ماكموراي (حريق تاجي)',
        coords: '310 - 24-11.2 220 - 56.7261',
        lat: 56.7261,
        lng: -111.379,
        x: 54,
        y: 46,
      },
      {
        label: 'Yellowknife Great Slave Buffer',
        labelAr: 'نطاق بحيرة سليف العظمى (يلونايف)',
        coords: '325 - 26-04.8 235 - 62.4541',
        lat: 62.4541,
        lng: -114.371,
        x: 35,
        y: 30,
      },
    ],
  },

  'egypt': {
    id: 'egypt',
    name: 'Egypt & Mediterranean Interface',
    nameAr: 'مصر وواجهة البحر المتوسط',
    center: { lat: 30.5000, lng: 31.8000 },
    defaultZoom: 7,
    satelliteMapImage: '/assets/ground-truth/forest_satellite_map_1793981648264.jpg',
    presetCoordinates: [
      {
        label: 'East Delta Agricultural Ridge',
        labelAr: 'الحزام الزراعي بشرق الدلتا',
        coords: '185 - 12-05.4 140 - 30.7326',
        lat: 30.7326,
        lng: 31.7195,
        x: 52,
        y: 45,
      },
      {
        label: 'Sinai Wadi Foothill Sector',
        labelAr: 'قطاع وادي شبه جزيرة سيناء',
        coords: '192 - 14-18.2 148 - 28.5393',
        lat: 28.5393,
        lng: 33.975,
        x: 65,
        y: 60,
      },
    ],
  },
};

export const INITIAL_GROUND_TRUTH_REPORTS: FireReport[] = [
  {
    id: 'report-1',
    title: 'Confirmed Fire',
    titleAr: 'حريق مؤكد',
    type: 'confirmed',
    status: 'confirmed',
    locationName: 'Sector 4B North (Canopy Ridge)',
    locationNameAr: 'قطاع 4B شمالاً (الحزام الشجري)',
    timeAgo: '1 hour ago',
    timeAgoAr: 'منذ ساعة',
    timestamp: Date.now() - 3600000,
    coordinates: '280 - 20-15.1 205 - 36.5878',
    coordsGps: { lat: -7.0507, lng: -59.3079 },
    mapPosition: { x: 57, y: 44 },
    imageUrl: '/assets/ground-truth/wildfire_blaze_1793981574666.jpg',
    galleryImages: [
      {
        url: '/assets/ground-truth/wildfire_blaze_1793981574666.jpg',
        label: 'Active Canopy Fire Front (Field Scout)',
        labelAr: 'جبهة الحريق التاجي النشط (الراصد الميداني)',
        type: 'optical',
      },
      {
        url: '/assets/ground-truth/night_embers_1793982264731.jpg',
        label: 'High-Temperature Thermal Night IR Pass',
        labelAr: 'مسار الأشعة تحت الحمراء الحرارية الليلية',
        type: 'thermal',
      },
      {
        url: '/assets/ground-truth/smoke_plume_1793981610168.jpg',
        label: 'Dense Smoke Plume Dispersion (Drone)',
        labelAr: 'عمود الدخان الكثيف المتصاعد (طائرة مسيرة)',
        type: 'plume',
      },
      {
        url: '/assets/ground-truth/forest_satellite_map_1793981648264.jpg',
        label: 'High-Resolution Satellite Multi-Band',
        labelAr: 'صورة القمر الصناعي متعددة الأطياف',
        type: 'satellite',
      },
    ],
    description: 'Active canopy blaze detected on northeastern ridge. 15-knot winds spreading south-east toward park perimeter.',
    descriptionAr: 'حريق تاجي نشط على الحافة الشمالية الشرقية. رياح بسرعة 15 عقدة تدفع النيران جنوب شرق نحو حدود المحمية.',
    confidence: 98,
    reporterName: 'Ranger Station Beta',
    reporterRole: 'Forest Ranger Patrol',
    frpMw: 429.5,
    tempK: 367,
    satelliteSource: 'VIIRS 375m & Ground IR',
  },
  {
    id: 'report-2',
    title: 'False Detection',
    titleAr: 'إنذار خاطئ',
    type: 'false',
    status: 'false',
    locationName: 'Sector 2W West Ridge Farm',
    locationNameAr: 'مزرعة الحافة الغربية قطاع 2W',
    timeAgo: '2 hours ago',
    timeAgoAr: 'منذ ساعتين',
    timestamp: Date.now() - 7200000,
    coordinates: '264 - 18-09.3 198 - 35.8821',
    coordsGps: { lat: -9.7860, lng: -66.1295 },
    mapPosition: { x: 31, y: 52 },
    imageUrl: '/assets/ground-truth/false_detection_1793981594833.jpg',
    galleryImages: [
      {
        url: '/assets/ground-truth/false_detection_1793981594833.jpg',
        label: 'Controlled Agricultural Burn (Verified)',
        labelAr: 'حرق زراعي وقائي معتمد ميدانياً',
        type: 'optical',
      },
      {
        url: '/assets/ground-truth/smoke_plume_1793981610168.jpg',
        label: 'Low Thermal Signature Plume',
        labelAr: 'عمود دخان منخفض البصمة الحرارية',
        type: 'plume',
      },
    ],
    description: 'Controlled agricultural prescribed burn verified by regional rangers. No threat to forest perimeter.',
    descriptionAr: 'حرق زراعي وقائي مضبوط ومصرح به تم التحقق منه ميدانياً. لا يوجد أي خطر على الغابة.',
    confidence: 94,
    reporterName: 'Carlos Mendonca',
    reporterRole: 'Agricultural Fire Warden',
    frpMw: 14.5,
    tempK: 312,
    satelliteSource: 'Sentinel-3 SLSTR',
  },
  {
    id: 'report-3',
    title: 'Needs Review',
    titleAr: 'قيد المراجعة والتدقيق',
    type: 'review',
    status: 'pending',
    locationName: 'Sector 9 Valley Station',
    locationNameAr: 'محطة الوادي قطاع 9',
    timeAgo: '3 hours ago',
    timeAgoAr: 'منذ 3 ساعات',
    timestamp: Date.now() - 10800000,
    coordinates: '30 - 3.0216 327 - 65.4595',
    coordsGps: { lat: -3.0216, lng: -65.4595 },
    mapPosition: { x: 42, y: 27 },
    imageUrl: '/assets/ground-truth/smoke_plume_1793981610168.jpg',
    galleryImages: [
      {
        url: '/assets/ground-truth/smoke_plume_1793981610168.jpg',
        label: 'Thermal Camera Plume Sighting',
        labelAr: 'رصد عمود الدخان عبر كاميرا حرارية',
        type: 'thermal',
      },
      {
        url: '/assets/ground-truth/distant_smoke_1793982282910.jpg',
        label: 'Distant Lookout Observation',
        labelAr: 'رصد بصري من برج المراقبة',
        type: 'optical',
      },
    ],
    description: 'Thermal camera flagged faint grey smoke plume in scrubland sector 9. Patrol drone dispatched for live feed.',
    descriptionAr: 'الكاميرا الحرارية رصدت عمود دخان رمادي خفيف في القطاع 9. تم توجيه طائرة مسيرة للتحقق البصري.',
    confidence: 76,
    reporterName: 'Drone Unit Alpha-2',
    reporterRole: 'Autonomous UAV Scout',
    frpMw: 88.0,
    tempK: 334,
    satelliteSource: 'VIIRS 375m',
  },
  {
    id: 'report-4',
    title: 'Needs Review',
    titleAr: 'قيد المراجعة والتدقيق',
    type: 'review',
    status: 'pending',
    locationName: 'Pine Forest East Canopy',
    locationNameAr: 'الغابة الشرقية (حزام الصنوبر)',
    timeAgo: '3 hours ago',
    timeAgoAr: 'منذ 3 ساعات',
    timestamp: Date.now() - 11400000,
    coordinates: '288 - 21-42.0 209 - 36.9015',
    coordsGps: { lat: -8.1200, lng: -62.8000 },
    mapPosition: { x: 36, y: 67 },
    imageUrl: '/assets/ground-truth/pine_forest_fire_1793981623482.jpg',
    galleryImages: [
      {
        url: '/assets/ground-truth/pine_forest_fire_1793981623482.jpg',
        label: 'Understory Pine Fire (Field)',
        labelAr: 'حريق طبقة تحتية بأشجار الصنوبر',
        type: 'optical',
      },
      {
        url: '/assets/ground-truth/night_embers_1793982264731.jpg',
        label: 'Under-Canopy Ground Embers',
        labelAr: 'جمرات حرارية تحت مظلة الغابة',
        type: 'thermal',
      },
    ],
    description: 'Ground infrared sensor cluster triggered high heat signature under pine tree canopy with rising ash.',
    descriptionAr: 'مستشعرات الأشعة تحت الحمراء الأرضية سجلت بصمة حرارية مرتفعة تحت أشجار الصنوبر مع تصاعد رماد.',
    confidence: 82,
    reporterName: 'IoT Sensor Node #412',
    reporterRole: 'Ground Sensor Mesh',
    frpMw: 142.0,
    tempK: 345,
    satelliteSource: 'NASA FIRMS VIIRS',
  },
  {
    id: 'report-5',
    title: 'Confirmed Fire',
    titleAr: 'حريق مؤكد',
    type: 'confirmed',
    status: 'confirmed',
    locationName: 'Canyon Ridge Sector 7',
    locationNameAr: 'حافة الوادي قطاع 7',
    timeAgo: '4 hours ago',
    timeAgoAr: 'منذ 4 ساعات',
    timestamp: Date.now() - 14400000,
    coordinates: '292 - 23-10.4 214 - 37.1042',
    coordsGps: { lat: -6.6171, lng: -53.1555 },
    mapPosition: { x: 41, y: 57 },
    imageUrl: '/assets/ground-truth/canyon_wildfire_1793982250385.jpg',
    galleryImages: [
      {
        url: '/assets/ground-truth/canyon_wildfire_1793982250385.jpg',
        label: 'Ravine Flank Firefront (Aerial)',
        labelAr: 'جبهة النيران بمنحدر الوادي (جوي)',
        type: 'optical',
      },
      {
        url: '/assets/ground-truth/wildfire_blaze_1793981574666.jpg',
        label: 'Major Canopy Fire Ignition',
        labelAr: 'اشتعال ناري تاجي واسع النطاق',
        type: 'optical',
      },
    ],
    description: 'Massive canyon ridge blaze moving along western ravine flank. Thermal intensity critical (>800 MW).',
    descriptionAr: 'حريق ضخم بحافة الوادي يمتد عبر المنحدر الغربي. الشدة الحرارية حرجة تتجاوز 800 ميجاوات.',
    confidence: 99,
    reporterName: 'Chief Warden Santos',
    reporterRole: 'Regional Fire Command',
    frpMw: 890.2,
    tempK: 410,
    satelliteSource: 'VIIRS NOAA-20 & MODIS',
  },
  {
    id: 'report-6',
    title: 'Needs Review',
    titleAr: 'قيد المراجعة والتدقيق',
    type: 'review',
    status: 'pending',
    locationName: 'Lookout Tower Alpha',
    locationNameAr: 'برج المراقبة ألفا',
    timeAgo: '5 hours ago',
    timeAgoAr: 'منذ 5 ساعات',
    timestamp: Date.now() - 18000000,
    coordinates: '278 - 19-48.2 203 - 36.4219',
    coordsGps: { lat: -4.8500, lng: -60.1000 },
    mapPosition: { x: 50, y: 22 },
    imageUrl: '/assets/ground-truth/distant_smoke_1793982282910.jpg',
    galleryImages: [
      {
        url: '/assets/ground-truth/distant_smoke_1793982282910.jpg',
        label: 'Distant Horizon Smoke Column',
        labelAr: 'عمود دخان أفقي بعيد',
        type: 'optical',
      },
    ],
    description: 'Ranger optical watch detected distant cumulus smoke plume over northeastern valley basin.',
    descriptionAr: 'رصد بصري لعمود دخاني ركامي بعيد فوق حوض الوادي الشمالي الشرقي.',
    confidence: 79,
    reporterName: 'Lookout Watcher',
    reporterRole: 'Observation Tower',
    frpMw: 65.0,
    tempK: 325,
    satelliteSource: 'Optical & Weather Radar',
  },
];

export const INITIAL_NETWORK_NODES: NetworkNode[] = [
  { id: 'node-1', lat: -7.0507, lng: -59.3079, x: 57, y: 44, color: 'red', label: 'Field-1', type: 'fire', reportId: 'report-1', hasPulse: true },
  { id: 'node-2', lat: -9.7860, lng: -66.1295, x: 31, y: 52, color: 'yellow', label: 'Field-2', type: 'alert', reportId: 'report-2' },
  { id: 'node-3', lat: -3.0216, lng: -65.4595, x: 42, y: 27, color: 'orange', label: 'Field-3', type: 'warning', reportId: 'report-3' },
  { id: 'node-4', lat: -8.1200, lng: -62.8000, x: 36, y: 67, color: 'orange', label: 'Field-4', type: 'warning', reportId: 'report-4' },
  { id: 'node-5', lat: -6.6171, lng: -53.1555, x: 41, y: 57, color: 'red', label: 'Field-5', type: 'fire', reportId: 'report-5', hasPulse: true },
  { id: 'node-6', lat: -4.8500, lng: -60.1000, x: 50, y: 22, color: 'yellow', label: 'Field-6', type: 'alert', reportId: 'report-6' },
  { id: 'node-s1', lat: -6.0000, lng: -61.0000, x: 38, y: 38, color: 'blue', label: 'Sensor-Alpha', type: 'sensor' },
  { id: 'node-s2', lat: -5.5000, lng: -58.2000, x: 48, y: 36, color: 'blue', label: 'Sensor-Beta', type: 'sensor' },
  { id: 'node-s3', lat: -8.2000, lng: -64.5000, x: 32, y: 47, color: 'blue', label: 'Sensor-Gamma', type: 'sensor' },
  { id: 'node-s4', lat: -7.5000, lng: -56.0000, x: 54, y: 83, color: 'blue', label: 'Sensor-Delta', type: 'sensor' },
  { id: 'node-c1', lat: -8.9000, lng: -60.5000, x: 26, y: 48, color: 'green', label: 'Clear-Zone-1', type: 'clear' },
  { id: 'node-c2', lat: -4.2000, lng: -56.8000, x: 62, y: 35, color: 'green', label: 'Clear-Zone-2', type: 'clear' },
];

export const INITIAL_NETWORK_EDGES: NetworkEdge[] = [
  { id: 'e1', from: 'node-s1', to: 'node-3', color: '#38bdf8', width: 1.5 },
  { id: 'e2', from: 'node-s1', to: 'node-s2', color: '#38bdf8', width: 1.8 },
  { id: 'e3', from: 'node-s2', to: 'node-1', color: '#ef4444', width: 2.0 },
  { id: 'e4', from: 'node-s3', to: 'node-2', color: '#eab308', width: 1.5 },
  { id: 'e5', from: 'node-s1', to: 'node-s3', color: '#38bdf8', width: 1.5 },
  { id: 'e6', from: 'node-5', to: 'node-4', color: '#f97316', width: 1.6 },
  { id: 'e7', from: 'node-s4', to: 'node-4', color: '#38bdf8', width: 1.4 },
  { id: 'e8', from: 'node-6', to: 'node-s2', color: '#eab308', width: 1.4 },
];
