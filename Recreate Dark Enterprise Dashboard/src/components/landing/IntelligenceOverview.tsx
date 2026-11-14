import React from 'react';
import { FlameIcon, ChartLineIcon, LeafIcon, ArrowRightIcon } from '../icons';

interface IntelligenceOverviewProps {
  onLearnMore?: (section: string) => void;
  lang: 'en' | 'ar';
}

export const IntelligenceOverview: React.FC<IntelligenceOverviewProps> = ({
  onLearnMore,
  lang,
}) => {
  const cards = [
    {
      id: 'detection',
      titleEn: 'Fire Detection',
      titleAr: 'رصد الحرائق الآني',
      taglineEn: 'Real-time & Historical Observations',
      taglineAr: 'رصد فوري وسجلات تاريخية متكاملة',
      descEn:
        'Continuous orbital thermal anomaly surveillance fusing 375m high-resolution VIIRS sensors with NASA MODIS baselines for validated fire radiative power (FRP) and false-alarm suppression.',
      descAr:
        'مراقبة مدارية مستمرة للشذوذ الحراري تدمج دقة 375م من مستشعر VIIRS مع سجلات MODIS لحساب طاقة الحريق الإشعاعية (FRP) بدقة مع تنقية البلاغات الزائفة.',
      icon: <FlameIcon size={24} className="card-primary-icon fire" />,
      stats: [
        { labelEn: 'Resolution', labelAr: 'الدقة المكانية', val: '375m / 1km' },
        { labelEn: 'Latency', labelAr: 'زمن التحديث', val: '< 3 hours' },
        { labelEn: 'Confidence', labelAr: 'مستوى الثقة', val: '99.4%' },
      ],
      badge: 'REAL-TIME SENSING',
    },
    {
      id: 'patterns',
      titleEn: 'Pattern Intelligence',
      titleAr: 'ذكاء الأنماط والسلوك',
      taglineEn: 'Seasonal Trends & Recurrence Cycles',
      taglineAr: 'الأنماط الموسمية ودورات تكرار الاشتعال',
      descEn:
        'Decadal comparative analysis that models recurring burn perimeters, fire return intervals, and climatic drought correlations to project vulnerable fire corridors before ignition starts.',
      descAr:
        'تحليل مقارن يمتد لعقود يرصد حدود الحرائق المتكررة ودورات عودتها ويربطها بمؤشرات الجفاف للتنبؤ بالممرات الحيوية المعرضة للخطر قبل اشتعالها.',
      icon: <ChartLineIcon size={24} className="card-primary-icon chart" />,
      stats: [
        { labelEn: 'Historical Depth', labelAr: 'العمق الزمني', val: '2000–2024' },
        { labelEn: 'Pattern Models', labelAr: 'النماذج التنبؤية', val: '14 Regions' },
        { labelEn: 'Anomaly Triage', labelAr: 'فرز الشذوذ', val: 'Multi-Tier' },
      ],
      badge: 'HISTORICAL PATTERNS',
    },
    {
      id: 'context',
      titleEn: 'Environmental Context',
      titleAr: 'السياق والبيئة الشاملة',
      taglineEn: 'Ecosystem & Infrastructure Triage',
      taglineAr: 'تقييم النظم البيئية والبنية التحتية',
      descEn:
        'Fuses active fire fronts with Copernicus Sentinel-2 vegetation stress (NDVI), live wind vector fields, wildland-urban interfaces (WUI), and critical evacuation corridors.',
      descAr:
        'دمج خطوط تقدم النيران مع مؤشرات إجهاد الغطاء النباتي (NDVI)، ومجالات الرياح اللحظية، ومناطق التداخل السكني-الحرجي، ومسارات الإخلاء الآمنة.',
      icon: <LeafIcon size={24} className="card-primary-icon leaf" />,
      stats: [
        { labelEn: 'NDVI Canopy', labelAr: 'الغطاء النباتي', val: 'Copernicus 10m' },
        { labelEn: 'Wind Vector', labelAr: 'حقول الرياح', val: 'ERA5 Real-Time' },
        { labelEn: 'Infra Safety', labelAr: 'الأمان الميداني', val: 'Auto-Routing' },
      ],
      badge: 'ECOLOGICAL INTELLIGENCE',
    },
  ];

  return (
    <section className="intelligence-overview-section" id="overview">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-eyebrow-badge">
            <span>NASA EARTHDATA • COPERNICUS EMS • ESA</span>
          </div>
          <h2 className="section-title-large">
            {lang === 'ar' ? (
              <>من بيانات الأقمار الصناعية إلى <span className="highlight-cyan">معلومات استخباراتية قابلة للتنفيذ</span></>
            ) : (
              <>From Satellite Data to <span className="highlight-cyan">Actionable Intelligence</span></>
            )}
          </h2>
          <p className="section-subtitle-text">
            {lang === 'ar'
              ? 'تدمج المنظومة بين أرصاد مستشعري MODIS وVIIRS لتقديم طبقة موحدة من ذكاء الحرائق تغطي كافة مراحل الرصد والإنذار المبكر والتخفيف من الآثار.'
              : 'Our unified geospatial framework calibrates multi-sensor orbital observations into calibrated thermal layers for decision makers, analysts, and emergency response teams.'}
          </p>
        </div>

        {/* 3 Premium Cards Grid */}
        <div className="intel-cards-grid">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="intel-card"
              onClick={() => onLearnMore?.(card.id)}
              role="button"
              tabIndex={0}
            >
              <div className="card-top-row">
                <div className="card-icon-container">
                  {card.icon}
                </div>
                <span className="card-category-badge">{card.badge}</span>
              </div>

              <h3 className="card-headline">
                {lang === 'ar' ? card.titleAr : card.titleEn}
              </h3>
              <p className="card-tagline">
                {lang === 'ar' ? card.taglineAr : card.taglineEn}
              </p>
              <p className="card-narrative">
                {lang === 'ar' ? card.descAr : card.descEn}
              </p>

              {/* Card Mini Stats Row */}
              <div className="card-stats-row">
                {card.stats.map((s, idx) => (
                  <div key={idx} className="card-stat-item">
                    <span className="stat-label">{lang === 'ar' ? s.labelAr : s.labelEn}</span>
                    <span className="stat-val">{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Card Footer Link */}
              <div className="card-action-footer">
                <span className="card-action-text">
                  {lang === 'ar' ? 'استكشف التحليلات المتقدمة' : 'Explore Capability'}
                </span>
                <ArrowRightIcon size={16} className="card-arrow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
