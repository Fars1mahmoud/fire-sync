import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplore: () => void;
  lang?: 'en' | 'ar';
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onExplore,
  lang = 'ar',
}) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal-card about-modal-card" 
        onClick={(e) => e.stopPropagation()}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="about-header">
          <div className="about-tag">NASA FIRMS & SATELLITE SENSING</div>
          <h2 className="about-title">
            {lang === 'ar' 
              ? 'منظومة Fire sync الموحدة: MODIS & VIIRS' 
              : 'Fire sync: Unified Satellite Intelligence'}
          </h2>
          <p className="about-lead">
            {lang === 'ar'
              ? 'تقوم المنصة بتوحيد قراءات الأقمار الصناعية المتعددة (NASA Terra, Aqua, Suomi-NPP, NOAA-20) لتوفير بيانات حرائق آنية وتحليلات تنبؤية فائقة الدقة.'
              : 'Our system harmonizes multi-sensor orbital observations from NASA Terra, Aqua, Suomi-NPP, and NOAA-20 into an actionable real-time early warning system.'}
          </p>
        </div>

        <div className="about-grid">
          <div className="about-item">
            <div className="about-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3>{lang === 'ar' ? 'تنسيق الحساسات المتعددة' : 'Multi-Sensor Harmonization'}</h3>
            <p>
              {lang === 'ar'
                ? 'دمج دقة 375م من مستشعر VIIRS مع سجلات MODIS الممتدة لـ 20 عاماً للتخلص من الإشارات الزائفة وتوحيد دقة الرصد.'
                : 'Fuses 375m VIIRS resolution with 20+ years of MODIS historical baselines to calibrate detections.'}
            </p>
          </div>

          <div className="about-item">
            <div className="about-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3>{lang === 'ar' ? 'التحليل التاريخي والأنماط' : 'Historical Analysis'}</h3>
            <p>
              {lang === 'ar'
                ? 'مقارنة سلوك النيران السنوي ومواسم الجفاف لكشف الشذوذ الحراري والتنبؤ بالبؤر قبل انتشارها.'
                : 'Benchmarking seasonal burn cycles against climatic anomalies to foresee rapid spread scenarios.'}
            </p>
          </div>

          <div className="about-item">
            <div className="about-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3>{lang === 'ar' ? 'كشف الشذوذ والحرارة الإشعاعية (FRP)' : 'Anomaly & FRP Detection'}</h3>
            <p>
              {lang === 'ar'
                ? 'قياس طاقة الحريق الإشعاعية بالميغاوات (MW) وحساب درجة حرارة السطوع اللحظية لتصنيف خطورة الحريق.'
                : 'Continuous measurement of Fire Radiative Power (MW) and brightness temperature for risk triage.'}
            </p>
          </div>

          <div className="about-item">
            <div className="about-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
              </svg>
            </div>
            <h3>{lang === 'ar' ? 'السياق البيئي والحماية' : 'Environmental Context'}</h3>
            <p>
              {lang === 'ar'
                ? 'ربط بؤر الحرائق بمسارات الإخلاء، والمحميات الطبيعية، ومؤشرات الغطاء النباتي (NDVI).'
                : 'Correlating active burn fronts with critical infrastructure, evacuation corridors, and biodiversity.'}
            </p>
          </div>
        </div>

        <div className="about-footer">
          <button 
            type="button" 
            className="explore-now-btn"
            onClick={() => {
              onClose();
              onExplore();
            }}
          >
            {lang === 'ar' ? 'استكشف الخريطة المباشرة الآن' : 'Explore Live Map Now'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
