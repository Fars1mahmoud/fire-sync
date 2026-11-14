import React, { useState } from 'react';
import { LandingNavbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { AuthModal, type UserProfile } from '../components/AuthModal';
import { ChartLineIcon, LayersIcon, ArrowRightIcon, DatabaseIcon, GlobeIcon } from '../components/icons';
import '../components/landing/LandingSystem.css';

interface AnalyticsPageProps {
  onNavigate: (page: any, region?: string) => void;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  currentUser: UserProfile | null;
  setCurrentUser: (u: UserProfile | null) => void;
  hideNavbar?: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  onNavigate,
  lang,
  setLang,
  currentUser,
  setCurrentUser,
  hideNavbar = false,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedDecade, setSelectedDecade] = useState<'2020s' | '2010s' | '2000s'>('2020s');
  const [selectedCountry, setSelectedCountry] = useState<'BRA' | 'CAN'>('BRA');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const countryStats = {
    BRA: {
      totalFires: '7.69M',
      peakFRP: '2,966.5 MW',
      avgDuration: 'Aug–Sep (Peak)',
      burnedArea: '21.5M ha',
      biome: lang === 'ar' ? 'غابات الأمازون وسافانا سيرادو وبانتانال' : 'Amazon Basin, Cerrado & Pantanal',
      anomaly: '+228% (2024 Drought Spike)',
      peakMonth: 'Sep',
      peakHotspots: '5,210 Hotspots / Day',
    },
    CAN: {
      totalFires: '3.18M',
      peakFRP: '2,450.0 MW',
      avgDuration: 'Jun–Jul (Peak)',
      burnedArea: '18.4M ha',
      biome: lang === 'ar' ? 'الغابات الشمالية في ألبرتا وكيبك والمناطق الشمالية' : 'Boreal Shield, Donnie Creek & Alberta',
      anomaly: '+312% (2023 Mega-Season)',
      peakMonth: 'Jul',
      peakHotspots: '6,840 Hotspots / Day',
    },
  };

  const currentStats = countryStats[selectedCountry];

  return (
    <div className="analytics-page-root" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {!hideNavbar && (
        <LandingNavbar
          activePage="analytics"
          onNavigate={onNavigate}
          onOpenAuth={handleOpenAuth}
          currentUser={currentUser}
          onLogout={() => {
            localStorage.removeItem('fire_intel_user');
            setCurrentUser(null);
          }}
          lang={lang}
          setLang={setLang}
        />
      )}

      <main className="analytics-page-content">
        <div className="section-container">
          {/* Page Header */}
          <div className="page-hero-header">
            <div className="section-eyebrow-badge">
              <ChartLineIcon size={14} />
              <span>NASA MODIS & VIIRS TIME-SERIES ARCHIVE (10.87M RECORDS)</span>
            </div>
            <h1 className="page-hero-title">
              {lang === 'ar' ? (
                <>التحليلات المقارنة <span className="highlight-cyan">لملفات البرازيل وكندا</span></>
              ) : (
                <>Comparative Intelligence: <span className="highlight-cyan">Brazil & Canada Archives</span></>
              )}
            </h1>
            <p className="page-hero-subtitle">
              {lang === 'ar'
                ? 'تدقيق وتحليل معمق لـ 10 ملفات أرشيفية (2020–2024) تشمل 7.69 مليون رصد في البرازيل و 3.18 مليون رصد في كندا، مع حساب قمم المواسم السنوية والشذوذ المناخي.'
                : 'Audited spatial-temporal analysis across 10 satellite archives (2020–2024) spanning 7.69M observations in Brazil and 3.18M in Canada with multi-sensor climatological baselines.'}
            </p>

            {/* Country Selector Tabs (Brazil vs Canada) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                className={`epoch-btn ${selectedCountry === 'BRA' ? 'active' : ''}`}
                onClick={() => setSelectedCountry('BRA')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  borderColor: selectedCountry === 'BRA' ? '#10b981' : undefined,
                  background: selectedCountry === 'BRA' ? 'rgba(16, 185, 129, 0.2)' : undefined,
                  color: selectedCountry === 'BRA' ? '#34d399' : undefined,
                  fontWeight: 600,
                }}
              >
                <span>🇧🇷</span>
                <span>{lang === 'ar' ? 'ملف البرازيل (7.69M رصد)' : 'Brazil Dataset (7.69M Rows)'}</span>
              </button>

              <button
                type="button"
                className={`epoch-btn ${selectedCountry === 'CAN' ? 'active' : ''}`}
                onClick={() => setSelectedCountry('CAN')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  borderColor: selectedCountry === 'CAN' ? '#38bdf8' : undefined,
                  background: selectedCountry === 'CAN' ? 'rgba(56, 189, 248, 0.2)' : undefined,
                  color: selectedCountry === 'CAN' ? '#38bdf8' : undefined,
                  fontWeight: 600,
                }}
              >
                <span>🇨🇦</span>
                <span>{lang === 'ar' ? 'ملف كندا (3.18M رصد)' : 'Canada Dataset (3.18M Rows)'}</span>
              </button>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="analytics-kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">{lang === 'ar' ? 'إجمالي رصد الحرائق' : 'Total Fire Detections'}</span>
              <span className="kpi-val cyan">{currentStats.totalFires}</span>
              <span className="kpi-sub">NASA VIIRS JPSS-1 (375m)</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">{lang === 'ar' ? 'أعلى طاقة إشعاعية FRP' : 'Peak FRP Recorded'}</span>
              <span className="kpi-val orange">{currentStats.peakFRP}</span>
              <span className="kpi-sub">Fire Radiative Power (MW)</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">{lang === 'ar' ? 'ذروة موسم الاحتراق' : 'Peak Burn Window'}</span>
              <span className="kpi-val">{currentStats.avgDuration}</span>
              <span className="kpi-sub">{currentStats.biome}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">{lang === 'ar' ? 'الشذوذ المناخي السنوي' : 'Climatic Anomaly'}</span>
              <span className="kpi-val green">{currentStats.anomaly}</span>
              <span className="kpi-sub">{lang === 'ar' ? 'مقارنة بخط الأساس التاريخي' : 'Vs. Climatological Baseline'}</span>
            </div>
          </div>

          {/* Deep Analytics Modules */}
          <div className="analytics-detailed-grid">
            {/* Left Module: Multi-Year Seasonal Trend */}
            <div className="detailed-panel">
              <div className="panel-header">
                <h3>Multi-Sensor Seasonal Fire Trend (Month-by-Month)</h3>
                <span className="panel-tag">Harmonized VIIRS (375m) & MODIS (1km)</span>
              </div>
              <div className="trend-visual-container">
                <div className="trend-curve-svg-wrapper">
                  <svg className="trend-curve-svg" viewBox="0 0 800 280">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0ea5ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 20 230 Q 150 220 220 180 T 380 90 T 500 40 T 620 130 T 780 220 L 780 260 L 20 260 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M 20 230 Q 150 220 220 180 T 380 90 T 500 40 T 620 130 T 780 220"
                      fill="none"
                      stroke="#ff4d00"
                      strokeWidth="3.5"
                    />
                    {/* Peak highlight point */}
                    <circle cx={selectedCountry === 'BRA' ? 560 : 440} cy="40" r="6" fill="#ff7700" stroke="#ffffff" strokeWidth="2" />
                    <text x={selectedCountry === 'BRA' ? 560 : 440} y="24" fill="#ffffff" fontSize="12" fontWeight="600" textAnchor="middle">
                      {selectedCountry === 'BRA'
                        ? (lang === 'ar' ? '🇧🇷 ذروة سبتمبر (الأمازون وسيرادو): 5,210 رصد/يوم' : '🇧🇷 September Amazon/Cerrado Peak: 5,210 Hotspots/Day')
                        : (lang === 'ar' ? '🇨🇦 ذروة يوليو (الغابات الشمالية): 6,840 رصد/يوم' : '🇨🇦 July Boreal Fire Mega-Season: 6,840 Hotspots/Day')}
                    </text>
                  </svg>
                </div>
                <div className="month-axis-labels">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>
            </div>

            {/* Right Module: Climate Drivers & Vulnerability */}
            <div className="detailed-panel">
              <div className="panel-header">
                <h3>{lang === 'ar' ? 'العوامل المناخية ومحركات الجفاف' : 'Environmental Driving Factors (Climatic Coupling)'}</h3>
                <span className="panel-tag">Copernicus ERA5 & NASA POWER</span>
              </div>
              <div className="climate-driver-list">
                <div className="driver-item">
                  <div className="driver-top">
                    <span>{lang === 'ar' ? 'عجز ضغط البخار (VPD)' : 'Vapor Pressure Deficit (VPD)'}</span>
                    <strong className="orange">{selectedCountry === 'BRA' ? '+2.8 kPa (Extreme Amazon Dryness)' : '+2.2 kPa (Boreal Heat Dome)'}</strong>
                  </div>
                  <div className="driver-bar"><div className="driver-fill" style={{ width: selectedCountry === 'BRA' ? '92%' : '84%', backgroundColor: '#ff4d00' }} /></div>
                  <span className="driver-desc">
                    {selectedCountry === 'BRA'
                      ? (lang === 'ar' ? 'مؤشر انخفاض رطوبة الغلاف الجوي وسرعة جفاف مظلة غابات الأمازون وسيرادو.' : 'Severe atmospheric moisture deficit accelerating fuel desiccation across the Amazon-Cerrado frontier.')
                      : (lang === 'ar' ? 'موجة الحر الشمالية المقترنة باشتعال الغابات الصنوبرية في ألبرتا وكيبك.' : 'Heat dome and atmospheric desiccation driving explosive crown fire spread across conifer canopies.')}
                  </span>
                </div>

                <div className="driver-item">
                  <div className="driver-top">
                    <span>{lang === 'ar' ? 'مؤشر الجفاف القياسي (SPI-6)' : 'Standardized Precipitation Index (SPI-6)'}</span>
                    <strong className="orange">{selectedCountry === 'BRA' ? '-2.3 (Historic Drought in Amazonas)' : '-1.9 (Severe Boreal Drought)'}</strong>
                  </div>
                  <div className="driver-bar"><div className="driver-fill" style={{ width: '80%', backgroundColor: '#ff7700' }} /></div>
                  <span className="driver-desc">
                    {selectedCountry === 'BRA'
                      ? (lang === 'ar' ? 'عجز هطول أمطار تراكمي على مدار 6 أشهر في حوض نهري الأمازون وبانتانال.' : 'Six-month cumulative precipitation deficit across the Amazonas and Pantanal wetland basins.')
                      : (lang === 'ar' ? 'انخفاض تاريخي في الغطاء الثلجي الشتوي وأمطار الربيع المبكرة في غرب كندا.' : 'Depleted winter snowpack and record-low spring rainfall across Western Canada.')}
                  </span>
                </div>

                <div className="driver-item">
                  <div className="driver-top">
                    <span>{lang === 'ar' ? 'رطوبة الوقود الحيوي (LFMC)' : 'Live Fuel Moisture Content (LFMC)'}</span>
                    <strong className="cyan">{selectedCountry === 'BRA' ? '48% (Critical Flammability)' : '52% (Extreme Boreal Risk)'}</strong>
                  </div>
                  <div className="driver-bar"><div className="driver-fill" style={{ width: '68%', backgroundColor: '#22d3ee' }} /></div>
                  <span className="driver-desc">
                    {selectedCountry === 'BRA'
                      ? (lang === 'ar' ? 'هبوط رطوبة الأشجار دون عتبة الاشتعال خلال شهري أغسطس وسبتمبر.' : 'Canopy moisture drops below ignition threshold during peak agricultural clearing season.')
                      : (lang === 'ar' ? 'طبقة الخث العميقة وأشجار الصنوبر الجافة تغذي حرائق التاج فائقة القوة.' : 'Dry deep peat layers and black spruce needles enabling high-intensity crown fires.')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA to Map */}
          <div className="analytics-cta-bar">
            <div>
              <h3>
                {lang === 'ar'
                  ? `استكشف خريطة الأقمار الصناعية الميدانية لـ ${selectedCountry === 'BRA' ? 'البرازيل' : 'كندا'}`
                  : `Explore live satellite fire hotspots for ${selectedCountry === 'BRA' ? 'Brazil' : 'Canada'}`}
              </h3>
              <p>
                {lang === 'ar'
                  ? 'انتقل مباشرة إلى خريطة العمليات التكتيكية لمشاهدة بؤر الحرائق النشطة وبيانات الأقمار الصناعية الحقيقية.'
                  : 'Switch to the tactical operations map to observe active hotspots, FRP telemetry, and wind dispersion.'}
              </p>
            </div>
            <button
              type="button"
              className="btn-primary-explore"
              onClick={() => onNavigate('map', selectedCountry === 'BRA' ? 'Brazil' : 'Canada')}
            >
              <GlobeIcon size={18} />
              <span>{lang === 'ar' ? `فتح خريطة ${selectedCountry === 'BRA' ? 'البرازيل' : 'كندا'}` : `Launch ${selectedCountry === 'BRA' ? 'Brazil' : 'Canada'} Map`}</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} lang={lang} />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => setCurrentUser(u)}
        lang={lang}
      />
    </div>
  );
};
