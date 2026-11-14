import React from 'react';
import { FlameIcon, SatelliteIcon } from '../icons';

interface FooterProps {
  onNavigate: (page: 'home' | 'map' | 'analytics' | 'about') => void;
  lang: 'en' | 'ar';
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lang }) => {
  return (
    <footer className="landing-footer-wrapper">
      <div className="section-container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div 
              className="footer-brand"
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              role="button"
              tabIndex={0}
            >
              <FlameIcon size={24} className="footer-flame" />
              <span className="footer-brand-name">Fire sync</span>
            </div>
            <p className="footer-tagline">
              {lang === 'ar' ? 'من البيانات إلى غدٍ أكثر أماناً' : 'From Data to a Safer Tomorrow'}
            </p>
            <p className="footer-mission-text">
              {lang === 'ar'
                ? 'منصة استخبارات جغرافية مكانية متخصصة في توحيد بيانات رصد الحرائق الفضائية من أسطول أقمار NASA وNOAA لدعم صناع القرار وفرق الطوارئ.'
                : 'Advanced geospatial Earth observation platform harmonizing NASA and NOAA satellite constellations for actionable wildfire risk mitigation and disaster response.'}
            </p>
            <div className="footer-status-pill">
              <span className="status-live-dot" />
              <span>ORBITAL CONSTELLATIONS ONLINE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">
              {lang === 'ar' ? 'التنقل في المنظومة' : 'Platform Navigation'}
            </h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onNavigate('home')}>
                  {lang === 'ar' ? 'الرئيسية (Home)' : 'Home'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('map')}>
                  {lang === 'ar' ? 'خريطة الرصد الحي (GIS Map)' : 'Global Map'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('analytics')}>
                  {lang === 'ar' ? 'التحليلات التاريخية (Analytics)' : 'Analytics & Patterns'}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('about')}>
                  {lang === 'ar' ? 'عن المستشعرات والمنظومة (About)' : 'About MODIS & VIIRS'}
                </button>
              </li>
            </ul>
          </div>

          {/* Data Sources */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">
              {lang === 'ar' ? 'مصادر البيانات الفضائية' : 'Satellite Data Sources'}
            </h4>
            <ul className="footer-links-list">
              <li>
                <span className="source-item">
                  <SatelliteIcon size={14} />
                  <span>NASA Earthdata & FIRMS</span>
                </span>
              </li>
              <li>
                <span className="source-item">
                  <SatelliteIcon size={14} />
                  <span>MODIS (Terra & Aqua - 1km)</span>
                </span>
              </li>
              <li>
                <span className="source-item">
                  <SatelliteIcon size={14} />
                  <span>VIIRS (Suomi-NPP & NOAA-20 - 375m)</span>
                </span>
              </li>
              <li>
                <span className="source-item">
                  <SatelliteIcon size={14} />
                  <span>Copernicus Emergency Management (EMS)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Operational Metrics */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">
              {lang === 'ar' ? 'جاهزية المنظومة' : 'Constellation Status'}
            </h4>
            <div className="telemetry-box">
              <div className="telemetry-line">
                <span className="t-key">NASA Terra (EOS AM-1):</span>
                <span className="t-val green">NOMINAL</span>
              </div>
              <div className="telemetry-line">
                <span className="t-key">NASA Aqua (EOS PM-1):</span>
                <span className="t-val green">NOMINAL</span>
              </div>
              <div className="telemetry-line">
                <span className="t-key">Suomi-NPP (VIIRS 375m):</span>
                <span className="t-val green">ACTIVE ORBIT</span>
              </div>
              <div className="telemetry-line">
                <span className="t-key">NOAA-20 (JPSS-1):</span>
                <span className="t-val green">ACTIVE ORBIT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <span className="footer-copyright">
            © 2026 Fire sync. All rights reserved.
          </span>
          <div className="footer-legal-links">
            <span>NASA Open Data Policy</span>
            <span>•</span>
            <span>Geospatial Intelligence Standards</span>
            <span>•</span>
            <span>FGDC / OGC Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
