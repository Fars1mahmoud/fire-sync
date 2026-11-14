import React, { useState } from 'react';
import { LandingNavbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { AuthModal, type UserProfile } from '../components/AuthModal';
import { SatelliteIcon, LayersIcon, CpuIcon, FlameIcon, ArrowRightIcon, GlobeIcon } from '../components/icons';
import '../components/landing/LandingSystem.css';

interface AboutPageProps {
  onNavigate: (page: any, region?: string) => void;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  currentUser: UserProfile | null;
  setCurrentUser: (u: UserProfile | null) => void;
  hideNavbar?: boolean;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  lang,
  setLang,
  currentUser,
  setCurrentUser,
  hideNavbar = false,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="about-page-root" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {!hideNavbar && (
        <LandingNavbar
          activePage="about"
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

      <main className="about-page-content">
        <div className="section-container">
          {/* Header */}
          <div className="page-hero-header">
            <div className="section-eyebrow-badge">
              <SatelliteIcon size={14} />
              <span>NASA EARTH OBSERVING SYSTEM (EOS) • JOINT POLAR SATELLITE SYSTEM (JPSS)</span>
            </div>
            <h1 className="page-hero-title">
              {lang === 'ar' ? (
                <>المعمارية العلمية <span className="highlight-cyan">ومستشعرات MODIS & VIIRS</span></>
              ) : (
                <>Scientific Framework & <span className="highlight-cyan">Satellite Constellations</span></>
              )}
            </h1>
            <p className="page-hero-subtitle">
              {lang === 'ar'
                ? 'توحيد القياسات الإشعاعية للأقمار الصناعية وتحويل إشارات الأشعة تحت الحمراء إلى بيانات دقيقة لطاقة الحريق الإشعاعية (FRP) والإنذار المبكر.'
                : 'How Fire sync fuses radiometric observations across NASA Terra, Aqua, Suomi-NPP, and NOAA-20 platforms to generate unified wildfire intelligence.'}
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="about-pillars-grid">
            {/* Pillar 1: NASA MODIS */}
            <div className="about-pillar-card">
              <div className="pillar-icon-box">
                <SatelliteIcon size={26} />
              </div>
              <span className="pillar-badge">NASA EOS CORE</span>
              <h2 className="pillar-title">NASA MODIS (Moderate Resolution Imaging Spectroradiometer)</h2>
              <p className="pillar-lead">
                Operating on NASA's Terra (10:30 AM/PM equatorial crossing) and Aqua (1:30 PM/AM crossing) satellites since 2000 and 2002.
              </p>
              <ul className="pillar-specs-list">
                <li><strong>Resolution:</strong> 1 km nadir thermal anomaly channels (Bands 21, 22, and 31).</li>
                <li><strong>Historical Archive:</strong> 24+ consecutive years of continuous global fire climatology.</li>
                <li><strong>Key Role:</strong> Establishes seasonal baselines, burn return intervals, and regional threshold limits.</li>
              </ul>
            </div>

            {/* Pillar 2: VIIRS */}
            <div className="about-pillar-card">
              <div className="pillar-icon-box">
                <LayersIcon size={26} />
              </div>
              <span className="pillar-badge">HIGH RESOLUTION SENSING</span>
              <h2 className="pillar-title">VIIRS (Visible Infrared Imaging Radiometer Suite)</h2>
              <p className="pillar-lead">
                Flown on the Suomi-NPP and NOAA-20 polar-orbiting satellites, offering state-of-the-art 375m spatial resolution.
              </p>
              <ul className="pillar-specs-list">
                <li><strong>Resolution:</strong> 375 m nadir spatial resolution (I-Band 4 at 3.74 µm & I-Band 5 at 11.45 µm).</li>
                <li><strong>Small Fire Capability:</strong> Detects small ignitions as small as 5 MW FRP, 3x smaller than MODIS.</li>
                <li><strong>Key Role:</strong> High-precision fire front delineation, rate of spread, and urban interface defense.</li>
              </ul>
            </div>

            {/* Pillar 3: Cross-Sensor Harmonization Engine */}
            <div className="about-pillar-card">
              <div className="pillar-icon-box">
                <CpuIcon size={26} />
              </div>
              <span className="pillar-badge">CALIBRATION ENGINE</span>
              <h2 className="pillar-title">Harmonization & False Alarm Suppression</h2>
              <p className="pillar-lead">
                Cross-calibrates varying pixel footprints, atmospheric absorption windows, and orbital view geometry into unified thermal metrics.
              </p>
              <ul className="pillar-specs-list">
                <li><strong>Point-Spread Normalization:</strong> Corrects pixel growth at scan edges (bowtie effect correction).</li>
                <li><strong>Solar Glint & Industrial Filtering:</strong> Eliminates gas flares, solar reflection on water bodies, and cloud artifacts.</li>
                <li><strong>Confidence Triage:</strong> Multi-tiered verification combining thermal radiance with historic land-cover flags.</li>
              </ul>
            </div>

            {/* Pillar 4: Fire Radiative Power (FRP) Science */}
            <div className="about-pillar-card">
              <div className="pillar-icon-box">
                <FlameIcon size={26} />
              </div>
              <span className="pillar-badge">PHYSICAL RADIOMETRY</span>
              <h2 className="pillar-title">Fire Radiative Power (FRP) & Fuel Combustion</h2>
              <p className="pillar-lead">
                Measures the instantaneous radiative energy emitted by actively combusting biomass in MegaWatts (MW).
              </p>
              <ul className="pillar-specs-list">
                <li><strong>Energy Equation:</strong> Calculated using Wooster's formulation linking 3.9µm radiance directly to heat release.</li>
                <li><strong>Fuel Consumption:</strong> Directly correlates with biomass consumed per second (kg/s) and smoke aerosol volume.</li>
                <li><strong>Tactical Severity:</strong> Provides emergency responders with quantifiable intensity rather than binary detection.</li>
              </ul>
            </div>
          </div>

          {/* Bottom CTA Bar */}
          <div className="analytics-cta-bar">
            <div>
              <h3>Ready to explore live satellite observations?</h3>
              <p>Experience the operational GIS workspace with full interactive layer controls, time machine, and real-time overpass tracking.</p>
            </div>
            <button
              type="button"
              className="btn-primary-explore"
              onClick={() => onNavigate('map')}
            >
              <GlobeIcon size={18} />
              <span>Launch Live GIS Map</span>
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
