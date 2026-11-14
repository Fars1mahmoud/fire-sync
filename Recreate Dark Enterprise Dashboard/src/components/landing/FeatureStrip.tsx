import React from 'react';
import { LayersIcon, ChartLineIcon, AlertTriangleIcon, LeafIcon } from '../icons';

interface FeatureStripProps {
  onSelectFeature?: (featureId: string) => void;
  lang: 'en' | 'ar';
}

export const FeatureStrip: React.FC<FeatureStripProps> = ({ onSelectFeature, lang }) => {
  const features = [
    {
      id: 'harmonization',
      icon: <LayersIcon size={22} className="feature-strip-icon-svg" />,
      line1En: 'Multi-Sensor',
      line2En: 'Harmonization',
      line1Ar: 'مواءمة المستشعرات',
      line2Ar: 'المتعددة (MODIS/VIIRS)',
      descEn: 'Fuses 375m VIIRS with 20+ year MODIS baselines',
      descAr: 'دمج دقة 375م مع سجلات 20 عاماً',
    },
    {
      id: 'historical',
      icon: <ChartLineIcon size={22} className="feature-strip-icon-svg" />,
      line1En: 'Historical',
      line2En: 'Analysis',
      line1Ar: 'التحليل التاريخي',
      line2Ar: 'والسجلات الزمنية',
      descEn: 'Decadal trends, seasonal cycles & return intervals',
      descAr: 'أنماط المواسم ومؤشرات العودة السنوية',
    },
    {
      id: 'anomaly',
      icon: <AlertTriangleIcon size={22} className="feature-strip-icon-svg" />,
      line1En: 'Anomaly',
      line2En: 'Detection',
      line1Ar: 'كشف الشذوذ',
      line2Ar: 'والطاقة الحرارية FRP',
      descEn: 'Real-time thermal spikes & fire radiative power',
      descAr: 'رصد فوري لقفزات الحرارة الإشعاعية',
    },
    {
      id: 'environmental',
      icon: <LeafIcon size={22} className="feature-strip-icon-svg" />,
      line1En: 'Environmental',
      line2En: 'Context',
      line1Ar: 'السياق البيئي',
      line2Ar: 'والغطاء النباتي NDVI',
      descEn: 'Drought indices, terrain slope & habitat overlap',
      descAr: 'مؤشرات الجفاف، التضاريس، والمحميات',
    },
  ];

  return (
    <div className="feature-strip-wrapper">
      <div className="feature-strip-container">
        {features.map((feat, index) => (
          <React.Fragment key={feat.id}>
            <div 
              className="feature-strip-card"
              onClick={() => onSelectFeature?.(feat.id)}
              role="button"
              tabIndex={0}
              title={lang === 'ar' ? feat.descAr : feat.descEn}
            >
              <div className="feature-strip-icon-box">
                {feat.icon}
                <div className="icon-glow-ring" />
              </div>
              <div className="feature-strip-text">
                <span className="feature-line primary">
                  {lang === 'ar' ? feat.line1Ar : feat.line1En}
                </span>
                <span className="feature-line secondary">
                  {lang === 'ar' ? feat.line2Ar : feat.line2En}
                </span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
