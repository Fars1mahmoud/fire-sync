export interface RecoveryMetrics {
  burnScarAreaHa: number;
  burnScarFormatted: string;
  vegetationIndexPct: number;
  recoveryProgressPct: number;
  estRecoveryTime: string;
  estRecoveryTimeAr?: string;
  highSeverityBurnPct?: number;
  seedlingsPlanted?: string;
}

export interface NdviDataPoint {
  month: string;
  monthAr?: string;
  beforeFire: number;
  afterFire: number;
  ndviTarget: number;
}

export interface RecoveryStage {
  code: 'S' | 'E' | 'V' | 'N';
  label: string;
  labelAr: string;
  duration: string;
  durationAr: string;
  badgeBg: string;
  badgeTextColor: string;
  glowColor: string;
  description: string;
  descriptionAr: string;
  ndviRange: string;
  sliderTarget: number; // Target slider percentage 0-100
}

export interface RecoverySector {
  id: string;
  name: string;
  nameAr: string;
  center: { lat: number; lng: number };
  defaultZoom: number;
  baseHa: number;
  stages: RecoveryStage[];
  ndviSeries: NdviDataPoint[];
}

export const RECOVERY_STAGES: RecoveryStage[] = [
  {
    code: 'S',
    label: 'Severe Impact',
    labelAr: 'أثر حراري شديد',
    duration: '3-6 months',
    durationAr: '3-6 أشهر',
    badgeBg: '#dc2626',
    badgeTextColor: '#ffffff',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    description: 'Complete canopy loss, ash layer mineralization, high soil erosion risk during heavy rains.',
    descriptionAr: 'فقدان كامل للمظلة الشجرية، تفحم التربة السطحية، وحساسية عالية للانجراف مع الأمطار.',
    ndviRange: '0.05 - 0.18',
    sliderTarget: 25,
  },
  {
    code: 'E',
    label: 'Early Recovery',
    labelAr: 'التعافي المبكر',
    duration: '3-12 months',
    durationAr: '3-12 شهراً',
    badgeBg: '#ea580c',
    badgeTextColor: '#ffffff',
    glowColor: 'rgba(234, 88, 12, 0.4)',
    description: 'Pioneer herbaceous emergence, nitrogen-fixing grasses, stabilization of topsoil layer.',
    descriptionAr: 'ظهور الأعشاب الرائدة، نباتات تثبيت النيتروجين، وبدء استقرار الطبقة السطحية للتربة.',
    ndviRange: '0.19 - 0.35',
    sliderTarget: 50,
  },
  {
    code: 'V',
    label: 'Vegetation Return',
    labelAr: 'عودة الغطاء النباتي',
    duration: '2-4 years',
    durationAr: '2-4 سنوات',
    badgeBg: '#84cc16',
    badgeTextColor: '#052e16',
    glowColor: 'rgba(132, 204, 22, 0.4)',
    description: 'Shrubland expansion, native saplings establishment, secondary ecological succession.',
    descriptionAr: 'تمدد الشجيرات البرية، تجذر الشتلات المحلية، وبدء التتابع البيئي الثانوي.',
    ndviRange: '0.36 - 0.58',
    sliderTarget: 75,
  },
  {
    code: 'N',
    label: 'Near Normal',
    labelAr: 'قريب من الوضع الطبيعي',
    duration: '5+ years',
    durationAr: '5+ سنوات',
    badgeBg: '#10b981',
    badgeTextColor: '#ffffff',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    description: 'Full canopy closure, complex multi-story habitat, stable faunal biodiversity return.',
    descriptionAr: 'إغلاق المظلة الشجرية الكاملة، استقرار الموائل متعددة الطبقات، وعودة التنوع البيولوجي.',
    ndviRange: '0.59 - 0.85',
    sliderTarget: 95,
  },
];

export const INITIAL_NDVI_SERIES: NdviDataPoint[] = [
  { month: 'Jan', monthAr: 'يناير', beforeFire: 75, afterFire: 50, ndviTarget: 60 },
  { month: 'Feb', monthAr: 'فبراير', beforeFire: 120, afterFire: 65, ndviTarget: 80 },
  { month: 'Mar', monthAr: 'مارس', beforeFire: 180, afterFire: 110, ndviTarget: 140 },
  { month: 'Apr', monthAr: 'أبريل', beforeFire: 260, afterFire: 135, ndviTarget: 175 },
  { month: 'May', monthAr: 'مايو', beforeFire: 240, afterFire: 185, ndviTarget: 210 },
  { month: 'Jun', monthAr: 'يونيو', beforeFire: 210, afterFire: 220, ndviTarget: 245 },
  { month: 'Jul', monthAr: 'يوليو', beforeFire: 270, afterFire: 240, ndviTarget: 280 },
  { month: 'Aug', monthAr: 'أغسطس', beforeFire: 250, afterFire: 255, ndviTarget: 310 },
  { month: 'Sep', monthAr: 'سبتمبر', beforeFire: 320, afterFire: 290, ndviTarget: 350 },
  { month: 'Oct', monthAr: 'أكتوبر', beforeFire: 380, afterFire: 340, ndviTarget: 395 },
  { month: 'Nov', monthAr: 'نوفمبر', beforeFire: 430, afterFire: 390, ndviTarget: 440 },
  { month: 'Dec', monthAr: 'ديسمبر', beforeFire: 485, afterFire: 445, ndviTarget: 475 },
];

export const RECOVERY_SECTORS: Record<string, RecoverySector> = {
  'basin-central': {
    id: 'basin-central',
    name: 'Amazon Basin & Cerrado (Brazil)',
    nameAr: 'حوض الأمازون وسيرادو (البرازيل)',
    center: { lat: -7.0507, lng: -59.3079 },
    defaultZoom: 9,
    baseHa: 125000,
    stages: RECOVERY_STAGES,
    ndviSeries: INITIAL_NDVI_SERIES,
  },
  'canada': {
    id: 'canada',
    name: 'Canada Boreal Mega-Belt (Alberta)',
    nameAr: 'ممر الغابات الشمالية (كندا)',
    center: { lat: 56.7261, lng: -111.3790 },
    defaultZoom: 8,
    baseHa: 245000,
    stages: RECOVERY_STAGES,
    ndviSeries: [
      { month: 'Jan', monthAr: 'يناير', beforeFire: 40, afterFire: 20, ndviTarget: 30 },
      { month: 'Feb', monthAr: 'فبراير', beforeFire: 60, afterFire: 35, ndviTarget: 50 },
      { month: 'Mar', monthAr: 'مارس', beforeFire: 110, afterFire: 55, ndviTarget: 80 },
      { month: 'Apr', monthAr: 'أبريل', beforeFire: 190, afterFire: 90, ndviTarget: 120 },
      { month: 'May', monthAr: 'مايو', beforeFire: 310, afterFire: 140, ndviTarget: 180 },
      { month: 'Jun', monthAr: 'يونيو', beforeFire: 420, afterFire: 210, ndviTarget: 260 },
      { month: 'Jul', monthAr: 'يوليو', beforeFire: 470, afterFire: 280, ndviTarget: 330 },
      { month: 'Aug', monthAr: 'أغسطس', beforeFire: 440, afterFire: 310, ndviTarget: 360 },
      { month: 'Sep', monthAr: 'سبتمبر', beforeFire: 350, afterFire: 260, ndviTarget: 320 },
      { month: 'Oct', monthAr: 'أكتوبر', beforeFire: 220, afterFire: 180, ndviTarget: 230 },
      { month: 'Nov', monthAr: 'نوفمبر', beforeFire: 110, afterFire: 90, ndviTarget: 130 },
      { month: 'Dec', monthAr: 'ديسمبر', beforeFire: 50, afterFire: 40, ndviTarget: 60 },
    ],
  },
  'egypt': {
    id: 'egypt',
    name: 'Egypt & Mediterranean Coastal Belt',
    nameAr: 'مصر وحزام الساحل المتوسطي',
    center: { lat: 30.7326, lng: 31.7195 },
    defaultZoom: 9,
    baseHa: 48500,
    stages: RECOVERY_STAGES,
    ndviSeries: [
      { month: 'Jan', monthAr: 'يناير', beforeFire: 140, afterFire: 90, ndviTarget: 110 },
      { month: 'Feb', monthAr: 'فبراير', beforeFire: 190, afterFire: 120, ndviTarget: 150 },
      { month: 'Mar', monthAr: 'مارس', beforeFire: 270, afterFire: 180, ndviTarget: 220 },
      { month: 'Apr', monthAr: 'أبريل', beforeFire: 330, afterFire: 230, ndviTarget: 270 },
      { month: 'May', monthAr: 'مايو', beforeFire: 310, afterFire: 240, ndviTarget: 280 },
      { month: 'Jun', monthAr: 'يونيو', beforeFire: 280, afterFire: 230, ndviTarget: 260 },
      { month: 'Jul', monthAr: 'يوليو', beforeFire: 260, afterFire: 220, ndviTarget: 250 },
      { month: 'Aug', monthAr: 'أغسطس', beforeFire: 270, afterFire: 230, ndviTarget: 260 },
      { month: 'Sep', monthAr: 'سبتمبر', beforeFire: 320, afterFire: 270, ndviTarget: 300 },
      { month: 'Oct', monthAr: 'أكتوبر', beforeFire: 370, afterFire: 320, ndviTarget: 350 },
      { month: 'Nov', monthAr: 'نوفمبر', beforeFire: 340, afterFire: 300, ndviTarget: 330 },
      { month: 'Dec', monthAr: 'ديسمبر', beforeFire: 210, afterFire: 170, ndviTarget: 190 },
    ],
  },
};

export function getStageFromSlider(sliderPos: number): 'S' | 'E' | 'V' | 'N' {
  if (sliderPos <= 35) return 'S';
  if (sliderPos <= 65) return 'E';
  if (sliderPos <= 85) return 'V';
  return 'N';
}

export function getSliderTargetFromStage(code: string): number {
  switch (code) {
    case 'S': return 25;
    case 'E': return 50;
    case 'V': return 75;
    case 'N': return 95;
    default: return 50;
  }
}

/**
 * Calculates dynamic live metrics based on slider position (0-100%)
 * At slider = 50%: returns exactly 125,000 ha, +42%, 24%, 3-5 years!
 */
export function calculateDynamicMetrics(sliderPos: number, baseHa: number): RecoveryMetrics {
  // sliderPos goes from 0 (all After/Burned revealed) to 100 (all Before/Pristine unburned)
  // Let revealFactor be how much is burned (100 - sliderPos) / 50 -> at sliderPos 50, revealFactor = 1.0
  const factor = (100 - sliderPos) / 50;

  const burnScarHa = Math.round(baseHa * factor);
  const formattedHa = Math.max(0, burnScarHa).toLocaleString('en-US') + ' ha';

  // Vegetation Index: at 50% -> +42%, at 100% -> +88%, at 0% -> -72%
  const vegIndex = Math.round(88 - factor * 46);

  // Recovery progress: at 50% -> 24%, at 100% -> 98%, at 0% -> 5%
  const progress = Math.min(100, Math.max(4, Math.round(98 - factor * 74)));

  let estTime = '3-5 years';
  let estTimeAr = '3-5 سنوات';
  if (sliderPos > 85) {
    estTime = 'Near Pristine';
    estTimeAr = 'وضع طبيعي شبه كامل';
  } else if (sliderPos > 65) {
    estTime = '1-2 years';
    estTimeAr = '1-2 سنة';
  } else if (sliderPos > 40) {
    estTime = '3-5 years';
    estTimeAr = '3-5 سنوات';
  } else {
    estTime = '6-10 years';
    estTimeAr = '6-10 سنوات';
  }

  const seedlings = Math.round(1420000 * Math.max(0.1, factor)).toLocaleString('en-US');

  return {
    burnScarAreaHa: Math.max(0, burnScarHa),
    burnScarFormatted: formattedHa,
    vegetationIndexPct: vegIndex,
    recoveryProgressPct: progress,
    estRecoveryTime: estTime,
    estRecoveryTimeAr: estTimeAr,
    seedlingsPlanted: seedlings,
  };
}
