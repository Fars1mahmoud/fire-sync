export interface AqiInfo {
  value: number;
  label: string;
  labelAr: string;
  category: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  descriptionAr: string;
}

export interface AffectedArea {
  id: string;
  name: string;
  nameAr: string;
  state: string;
  stateAr: string;
  lat: number;
  lng: number;
  risk: 'High' | 'Moderate' | 'Low';
  aqi: number;
  pm25: number;
  windSpeed: string;
  windDirection: string;
  population: string;
  healthAdvisory: string;
  healthAdvisoryAr: string;
}

export interface PlumeForecast {
  id: string;
  label: string;
  labelAr: string;
  hour: number;
  image: string;
  title: string;
  titleAr: string;
  plumeAreaKm2: number;
  peakAod: number;
  dominantWind: string;
  aqiValues: Record<string, number>;
}

export interface SmokeSectorData {
  id: string;
  name: string;
  nameAr: string;
  satelliteImage: string;
  activeHotspotsCount: number;
  affectedAreas: AffectedArea[];
  forecasts: PlumeForecast[];
  hotspots: Array<{
    id: number;
    x: number;
    y: number;
    temp: string;
    conf: string;
    source: string;
  }>;
  cityPositions: Record<string, { x: number; y: number }>;
}

export interface LayerState {
  smoke: boolean;
  aerosol: boolean;
  aqi: boolean;
  wind: boolean;
  fireSources: boolean;
}

export function getAqiCategory(aqi: number, lang: 'en' | 'ar' = 'en'): AqiInfo {
  if (aqi <= 50) {
    return {
      value: aqi,
      label: 'Good',
      labelAr: 'جيد',
      category: 'good',
      color: '#10b981',
      badgeBg: 'rgba(6, 78, 59, 0.7)',
      badgeText: '#34d399',
      description: 'Air quality is satisfactory and poses little or no risk.',
      descriptionAr: 'جودة الهواء ممتازة ولا تشكل أي خطر صحي.',
    };
  }
  if (aqi <= 100) {
    return {
      value: aqi,
      label: 'Moderate',
      labelAr: 'معتدل',
      category: 'moderate',
      color: '#eab308',
      badgeBg: 'rgba(113, 63, 18, 0.7)',
      badgeText: '#fde047',
      description: 'Acceptable quality; sensitive individuals may experience minor irritation.',
      descriptionAr: 'جودة مقبولة؛ قد يعاني الأفراد شديدو الحساسية من تهيج طفيف.',
    };
  }
  if (aqi <= 150) {
    return {
      value: aqi,
      label: 'Sensitive',
      labelAr: 'حساس',
      category: 'sensitive',
      color: '#f97316',
      badgeBg: 'rgba(120, 53, 15, 0.7)',
      badgeText: '#fb923c',
      description: 'Members of sensitive groups may experience adverse health effects.',
      descriptionAr: 'قد يعاني أصحاب الحساسية والأمراض التنفسية من أعراض واضحة.',
    };
  }
  if (aqi <= 200) {
    return {
      value: aqi,
      label: 'Unhealthy',
      labelAr: 'غير صحي',
      category: 'unhealthy',
      color: '#ef4444',
      badgeBg: 'rgba(127, 29, 29, 0.7)',
      badgeText: '#f87171',
      description: 'Everyone may begin to experience health effects; active children & adults at risk.',
      descriptionAr: 'يبدأ الجميع في الشعور بالتأثيرات الصحية؛ يجب تقليل النشاط الخارجي.',
    };
  }
  if (aqi <= 300) {
    return {
      value: aqi,
      label: 'Very Unhealthy',
      labelAr: 'غير صحي للغاية',
      category: 'very-unhealthy',
      color: '#a855f7',
      badgeBg: 'rgba(88, 28, 135, 0.7)',
      badgeText: '#c084fc',
      description: 'Health alert: the risk of health effects is significantly increased for everyone.',
      descriptionAr: 'إنذار صحي: خطر متزايد بشكل كبير على كافة الفئات السكانية.',
    };
  }
  return {
    value: aqi,
    label: 'Hazardous',
    labelAr: 'خطير وحرج',
    category: 'hazardous',
    color: '#991b1b',
    badgeBg: 'rgba(69, 10, 10, 0.8)',
    badgeText: '#fca5a5',
    description: 'Health warning of emergency conditions: everyone is more likely to be affected.',
    descriptionAr: 'تحذير صحي طارئ: حالة طوارئ بيئية وتأثيرات صحية حادة على الجميع.',
  };
}

export function getGaugeAngle(aqi: number, maxAqi = 300): number {
  const clamped = Math.max(0, Math.min(aqi, maxAqi));
  return (clamped / maxAqi) * 180;
}

// ---------------- Regional Datasets ----------------

export const SMOKE_SECTORS: Record<string, SmokeSectorData> = {
  'basin-central': {
    id: 'basin-central',
    name: 'Amazon Basin (Brazil)',
    nameAr: 'حوض الأمازون (البرازيل)',
    satelliteImage: '/satellite_map_crop.png',
    activeHotspotsCount: 1428,
    affectedAreas: [
      {
        id: 'manaus',
        name: 'Manaus',
        nameAr: 'ماناوس',
        state: 'Amazonas (AM)',
        stateAr: 'الأمازون (AM)',
        lat: -3.119,
        lng: -60.0217,
        risk: 'High',
        aqi: 165,
        pm25: 82.5,
        windSpeed: '18 km/h',
        windDirection: 'ESE',
        population: '2.2M',
        healthAdvisory: 'Wear N95 masks outdoors; avoid strenuous cardio exercises; keep windows sealed.',
        healthAdvisoryAr: 'ارتداء كمامات N95 خارج المنزل، تجنب الأنشطة الرياضية وإغلاق النوافذ بإحكام.',
      },
      {
        id: 'porto-velho',
        name: 'Porto Velho',
        nameAr: 'بورتو فيلهو',
        state: 'Rondônia (RO)',
        stateAr: 'روندونيا (RO)',
        lat: -8.7619,
        lng: -63.9039,
        risk: 'Moderate',
        aqi: 118,
        pm25: 42.1,
        windSpeed: '12 km/h',
        windDirection: 'SE',
        population: '540K',
        healthAdvisory: 'Sensitive groups should reduce prolonged outdoor exertion; air purifiers advised.',
        healthAdvisoryAr: 'يُنصح بتقليل المجهود البدني بالخارج واستخدام أجهزة تنقية الهواء الداخلية.',
      },
      {
        id: 'rio-branco',
        name: 'Rio Branco',
        nameAr: 'ريو برانكو',
        state: 'Acre (AC)',
        stateAr: 'أكري (AC)',
        lat: -9.9753,
        lng: -67.8249,
        risk: 'Moderate',
        aqi: 105,
        pm25: 37.8,
        windSpeed: '9 km/h',
        windDirection: 'E',
        population: '419K',
        healthAdvisory: 'Air quality is acceptable; minor haze visible on eastern horizon.',
        healthAdvisoryAr: 'جودة الهواء مقبولة عموماً مع غشاوة دخانية خفيفة بالأفق الشرقي.',
      },
      {
        id: 'santarem',
        name: 'Santarém',
        nameAr: 'سانتاريم',
        state: 'Pará (PA)',
        stateAr: 'بارا (PA)',
        lat: -2.4431,
        lng: -54.7083,
        risk: 'Low',
        aqi: 38,
        pm25: 8.9,
        windSpeed: '15 km/h',
        windDirection: 'NE',
        population: '308K',
        healthAdvisory: 'Good atmospheric dispersion; ideal conditions for outdoor activities.',
        healthAdvisoryAr: 'تشتت جوي ممتاز وأجواء مناسبة تماماً لكافة الأنشطة الخارجية.',
      },
    ],
    forecasts: [
      {
        id: '16h',
        label: '16h',
        labelAr: '16 ساعة',
        hour: 16,
        image: '/thumb_16h.png',
        title: '16-Hour Plume Forecast',
        titleAr: 'توقعات انتشار الدخان خلال 16 ساعة',
        plumeAreaKm2: 245000,
        peakAod: 3.8,
        dominantWind: '22 km/h ESE',
        aqiValues: {
          manaus: 158,
          'porto-velho': 124,
          'rio-branco': 98,
          santarem: 32,
        },
      },
      {
        id: '20h',
        label: '20 hs',
        labelAr: '20 ساعة',
        hour: 20,
        image: '/thumb_20h.png',
        title: '20-Hour Plume Forecast',
        titleAr: 'توقعات انتشار الدخان خلال 20 ساعة',
        plumeAreaKm2: 310000,
        peakAod: 4.4,
        dominantWind: '25 km/h ESE',
        aqiValues: {
          manaus: 165,
          'porto-velho': 118,
          'rio-branco': 105,
          santarem: 38,
        },
      },
      {
        id: '45h',
        label: '45 Hs',
        labelAr: '45 ساعة',
        hour: 45,
        image: '/thumb_45h.png',
        title: '45-Hour Plume Forecast',
        titleAr: 'توقعات انتشار الدخان خلال 45 ساعة',
        plumeAreaKm2: 480000,
        peakAod: 4.9,
        dominantWind: '29 km/h SE',
        aqiValues: {
          manaus: 184,
          'porto-velho': 142,
          'rio-branco': 120,
          santarem: 58,
        },
      },
      {
        id: '72h',
        label: '72 Hs',
        labelAr: '72 ساعة',
        hour: 72,
        image: '/thumb_72h.png',
        title: 'Extended Forecast Cycle (72h)',
        titleAr: 'دورة النمذجة الممتدة (72 ساعة)',
        plumeAreaKm2: 560000,
        peakAod: 5.2,
        dominantWind: '31 km/h SE',
        aqiValues: {
          manaus: 172,
          'porto-velho': 155,
          'rio-branco': 138,
          santarem: 74,
        },
      },
    ],
    hotspots: [
      { id: 1, x: 42, y: 77, temp: '685 K', conf: '98%', source: 'MODIS Aqua' },
      { id: 2, x: 44, y: 76, temp: '710 K', conf: '99%', source: 'VIIRS NOAA-20' },
      { id: 3, x: 34, y: 67, temp: '640 K', conf: '92%', source: 'Sentinel-3' },
      { id: 4, x: 38, y: 43, temp: '595 K', conf: '88%', source: 'MODIS Terra' },
      { id: 5, x: 74, y: 48, temp: '620 K', conf: '94%', source: 'VIIRS' },
      { id: 6, x: 68, y: 49, temp: '660 K', conf: '96%', source: 'MODIS' },
    ],
    cityPositions: {
      manaus: { x: 36, y: 31 },
      'porto-velho': { x: 26, y: 64 },
      'rio-branco': { x: 12, y: 67 },
      santarem: { x: 62, y: 25 },
    },
  },

  'canada': {
    id: 'canada',
    name: 'Canada Boreal Mega-Corridor',
    nameAr: 'ممر الغابات الكندية (كندا)',
    satelliteImage: '/satellite_map_crop.png',
    activeHotspotsCount: 894,
    affectedAreas: [
      {
        id: 'fort-mcmurray',
        name: 'Fort McMurray',
        nameAr: 'فورت ماكموراي',
        state: 'Alberta (AB)',
        stateAr: 'ألبرتا (AB)',
        lat: 56.726,
        lng: -111.379,
        risk: 'High',
        aqi: 178,
        pm25: 89.4,
        windSpeed: '24 km/h',
        windDirection: 'NW',
        population: '68K',
        healthAdvisory: 'Severe particulate warning; vulnerable residents shelter indoors.',
        healthAdvisoryAr: 'تحذير شديد من الجسيمات؛ التزام المنازل للفئات المعرضة للخطر.',
      },
      {
        id: 'yellowknife',
        name: 'Yellowknife',
        nameAr: 'يلونايف',
        state: 'NWT (NT)',
        stateAr: 'المناطق الشمالية (NT)',
        lat: 62.454,
        lng: -114.371,
        risk: 'Moderate',
        aqi: 125,
        pm25: 45.2,
        windSpeed: '16 km/h',
        windDirection: 'WNW',
        population: '20K',
        healthAdvisory: 'Smoke corridor drifting across Great Slave Lake; reduce outdoor tasks.',
        healthAdvisoryAr: 'تيار الدخان يمر فوق بحيرة سليف العظمى؛ يوصى بتقليص الأنشطة الخارجية.',
      },
      {
        id: 'edmonton',
        name: 'Edmonton',
        nameAr: 'إدمونتون',
        state: 'Alberta (AB)',
        stateAr: 'ألبرتا (AB)',
        lat: 53.546,
        lng: -113.493,
        risk: 'Moderate',
        aqi: 92,
        pm25: 31.8,
        windSpeed: '14 km/h',
        windDirection: 'N',
        population: '1.05M',
        healthAdvisory: 'Intermittent hazy sky; moderate air quality index.',
        healthAdvisoryAr: 'سماء مغشاة بالدخان الخفيف مع مؤشر جودة هواء متوسط.',
      },
      {
        id: 'chibougamau',
        name: 'Chibougamau',
        nameAr: 'شيبوغامو',
        state: 'Quebec (QC)',
        stateAr: 'كيبك (QC)',
        lat: 49.916,
        lng: -74.366,
        risk: 'Low',
        aqi: 45,
        pm25: 10.5,
        windSpeed: '12 km/h',
        windDirection: 'NE',
        population: '7.5K',
        healthAdvisory: 'Clean northern air masses prevail; low smoke concentration.',
        healthAdvisoryAr: 'كتل هوائية نقية وتركيزات منخفضة جداً من الدخان.',
      },
    ],
    forecasts: [
      {
        id: '16h',
        label: '16h',
        labelAr: '16 ساعة',
        hour: 16,
        image: '/thumb_16h.png',
        title: '16-Hour Plume Dispersion',
        titleAr: 'انتشار الدخان 16 ساعة',
        plumeAreaKm2: 320000,
        peakAod: 4.1,
        dominantWind: '26 km/h NW',
        aqiValues: {
          'fort-mcmurray': 172,
          yellowknife: 130,
          edmonton: 88,
          chibougamau: 40,
        },
      },
      {
        id: '20h',
        label: '20 hs',
        labelAr: '20 ساعة',
        hour: 20,
        image: '/thumb_20h.png',
        title: '20-Hour Plume Forecast',
        titleAr: 'توقعات الدخان 20 ساعة',
        plumeAreaKm2: 385000,
        peakAod: 4.6,
        dominantWind: '28 km/h NW',
        aqiValues: {
          'fort-mcmurray': 178,
          yellowknife: 125,
          edmonton: 92,
          chibougamau: 45,
        },
      },
      {
        id: '45h',
        label: '45 Hs',
        labelAr: '45 ساعة',
        hour: 45,
        image: '/thumb_45h.png',
        title: '45-Hour Transboundary Dispersion',
        titleAr: 'التشتت العابر للحدود 45 ساعة',
        plumeAreaKm2: 520000,
        peakAod: 5.0,
        dominantWind: '30 km/h WNW',
        aqiValues: {
          'fort-mcmurray': 190,
          yellowknife: 145,
          edmonton: 110,
          chibougamau: 62,
        },
      },
      {
        id: '72h',
        label: '72 Hs',
        labelAr: '72 ساعة',
        hour: 72,
        image: '/thumb_72h.png',
        title: '72-Hour Synoptic Outlook',
        titleAr: 'توقعات شاملة لـ 72 ساعة',
        plumeAreaKm2: 640000,
        peakAod: 5.4,
        dominantWind: '33 km/h NW',
        aqiValues: {
          'fort-mcmurray': 185,
          yellowknife: 150,
          edmonton: 118,
          chibougamau: 70,
        },
      },
    ],
    hotspots: [
      { id: 11, x: 40, y: 55, temp: '720 K', conf: '99%', source: 'VIIRS' },
      { id: 12, x: 45, y: 50, temp: '690 K', conf: '97%', source: 'MODIS' },
      { id: 13, x: 30, y: 40, temp: '630 K', conf: '91%', source: 'Sentinel-3' },
      { id: 14, x: 65, y: 60, temp: '655 K', conf: '94%', source: 'VIIRS' },
    ],
    cityPositions: {
      'fort-mcmurray': { x: 40, y: 45 },
      yellowknife: { x: 28, y: 32 },
      edmonton: { x: 38, y: 68 },
      chibougamau: { x: 75, y: 55 },
    },
  },

  'egypt': {
    id: 'egypt',
    name: 'Egypt & Eastern Mediterranean',
    nameAr: 'مصر وشرق البحر المتوسط',
    satelliteImage: '/satellite_map_crop.png',
    activeHotspotsCount: 112,
    affectedAreas: [
      {
        id: 'cairo',
        name: 'Greater Cairo',
        nameAr: 'القاهرة الكبرى',
        state: 'Cairo Governorate',
        stateAr: 'محافظة القاهرة',
        lat: 30.0444,
        lng: 31.2357,
        risk: 'Moderate',
        aqi: 138,
        pm25: 52.4,
        windSpeed: '14 km/h',
        windDirection: 'NNE',
        population: '21.5M',
        healthAdvisory: 'Urban particulate accumulation; air filtering recommended indoors.',
        healthAdvisoryAr: 'تراكم نسبي للجسيمات في النطاق الحضري؛ يُنصح بتهوية الأماكن وتصفية الهواء.',
      },
      {
        id: 'alexandria',
        name: 'Alexandria',
        nameAr: 'الإسكندرية',
        state: 'Alexandria Coast',
        stateAr: 'الساحل السكندري',
        lat: 31.2001,
        lng: 29.9187,
        risk: 'Low',
        aqi: 68,
        pm25: 20.1,
        windSpeed: '22 km/h',
        windDirection: 'NW',
        population: '5.4M',
        healthAdvisory: 'Maritime sea breeze ensures favorable air mixing and clearing.',
        healthAdvisoryAr: 'نسيم البحر الأبيض المتوسط يوفر تجدداً للهواء وتبديداً فعالاً للغبار.',
      },
      {
        id: 'delta-sharqia',
        name: 'Nile Delta',
        nameAr: 'دلتا النيل (الشرقية / الدقهلية)',
        state: 'Delta Agricultural Belt',
        stateAr: 'نطاق الدلتا الزراعي',
        lat: 30.7326,
        lng: 31.7195,
        risk: 'Moderate',
        aqi: 112,
        pm25: 39.7,
        windSpeed: '11 km/h',
        windDirection: 'N',
        population: '8.8M',
        healthAdvisory: 'Low dispersion over rural valleys during morning inversions.',
        healthAdvisoryAr: 'انخفاض وتيرة التشتت فوق المسطحات الزراعية في فترات الصباح الباكر.',
      },
      {
        id: 'sinai',
        name: 'Sinai Peninsula',
        nameAr: 'شبه جزيرة سيناء',
        state: 'Sinai Region',
        stateAr: 'جنوب وشمال سيناء',
        lat: 28.5393,
        lng: 33.975,
        risk: 'Low',
        aqi: 35,
        pm25: 8.2,
        windSpeed: '19 km/h',
        windDirection: 'NE',
        population: '600K',
        healthAdvisory: 'Very clean atmospheric background; optimal air quality.',
        healthAdvisoryAr: 'جودة هواء ممتازة ونقاء جوي عالٍ في كافة القطاعات الجبلية والساحلية.',
      },
    ],
    forecasts: [
      {
        id: '16h',
        label: '16h',
        labelAr: '16 ساعة',
        hour: 16,
        image: '/thumb_16h.png',
        title: '16-Hour Air Dispersion',
        titleAr: 'تشتت الغلاف الجوي لـ 16 ساعة',
        plumeAreaKm2: 85000,
        peakAod: 1.8,
        dominantWind: '18 km/h NNE',
        aqiValues: {
          cairo: 132,
          alexandria: 65,
          'delta-sharqia': 108,
          sinai: 32,
        },
      },
      {
        id: '20h',
        label: '20 hs',
        labelAr: '20 ساعة',
        hour: 20,
        image: '/thumb_20h.png',
        title: '20-Hour AQI Trend',
        titleAr: 'مسار جودة الهواء لـ 20 ساعة',
        plumeAreaKm2: 105000,
        peakAod: 2.1,
        dominantWind: '20 km/h NNE',
        aqiValues: {
          cairo: 138,
          alexandria: 68,
          'delta-sharqia': 112,
          sinai: 35,
        },
      },
      {
        id: '45h',
        label: '45 Hs',
        labelAr: '45 ساعة',
        hour: 45,
        image: '/thumb_45h.png',
        title: '45-Hour Synoptic Dispersion',
        titleAr: 'تشتت جوي لـ 45 ساعة',
        plumeAreaKm2: 135000,
        peakAod: 2.4,
        dominantWind: '22 km/h N',
        aqiValues: {
          cairo: 125,
          alexandria: 60,
          'delta-sharqia': 98,
          sinai: 30,
        },
      },
      {
        id: '72h',
        label: '72 Hs',
        labelAr: '72 ساعة',
        hour: 72,
        image: '/thumb_72h.png',
        title: '72-Hour Atmospheric Outlook',
        titleAr: 'أفق التوقعات لـ 72 ساعة',
        plumeAreaKm2: 160000,
        peakAod: 2.6,
        dominantWind: '24 km/h NNE',
        aqiValues: {
          cairo: 120,
          alexandria: 58,
          'delta-sharqia': 95,
          sinai: 28,
        },
      },
    ],
    hotspots: [
      { id: 21, x: 50, y: 40, temp: '540 K', conf: '84%', source: 'VIIRS' },
      { id: 22, x: 54, y: 46, temp: '560 K', conf: '89%', source: 'MODIS' },
    ],
    cityPositions: {
      cairo: { x: 48, y: 52 },
      alexandria: { x: 38, y: 38 },
      'delta-sharqia': { x: 52, y: 44 },
      sinai: { x: 68, y: 62 },
    },
  },
};

