import React, { useState } from 'react';
import { AuthModal, type UserProfile } from './AuthModal';
import { AboutModal } from './AboutModal';
import earthBg from '../assets/earth_fire_orbit.jpg';
import './LandingPage.css';

interface LandingPageProps {
  onNavigateToDashboard: (tab?: string) => void;
  lang?: 'en' | 'ar';
  setLang?: (l: 'en' | 'ar') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToDashboard,
  lang = 'en',
  setLang,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'map' | 'analytics' | 'about'>('home');

  // Load existing authenticated user if any
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('fire_intel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('fire_intel_user');
    setCurrentUser(null);
  };

  const toggleLanguage = () => {
    if (setLang) {
      setLang(lang === 'en' ? 'ar' : 'en');
    }
  };

  return (
    <div className="landing-page-root" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* =========================================================
          Top Navigation Bar (Matching Screenshot + Sign Up / Sign In)
          ========================================================= */}
      <header className="landing-nav">
        {/* Brand Logo & Tagline */}
        <div 
          className="landing-brand" 
          onClick={() => {
            setActiveNav('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="landing-brand-icon">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
              <path 
                d="M16 2C16 2 24 9.5 24 18C24 22.4183 20.4183 26 16 26C11.5817 26 8 22.4183 8 18C8 13.5 12 7.5 16 2Z" 
                fill="url(#navFlameGrad)" 
              />
              <path 
                d="M16 11C16 11 20 15.5 20 20C20 22.2091 18.2091 24 16 24C13.7909 24 12 22.2091 12 20C12 17 14 13.5 16 11Z" 
                fill="#ffd166" 
              />
              <defs>
                <linearGradient id="navFlameGrad" x1="8" y1="2" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff3838" />
                  <stop offset="0.55" stopColor="#ff7700" />
                  <stop offset="1" stopColor="#ffa600" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="landing-brand-text">
            <span className="landing-brand-title">Fire sync</span>
            <span className="landing-brand-subtitle">
              {lang === 'ar' ? 'من البيانات إلى غدٍ أكثر أماناً' : 'From Data to Safer Tomorrow'}
            </span>
          </div>
        </div>

        {/* Center / Right Navigation Links */}
        <nav>
          <ul className="landing-nav-links">
            <li>
              <button 
                type="button"
                className={`landing-nav-item ${activeNav === 'home' ? 'active' : ''}`}
                onClick={() => setActiveNav('home')}
              >
                {lang === 'ar' ? 'الرئيسية' : 'Home'}
              </button>
            </li>
            <li>
              <button 
                type="button"
                className="landing-nav-item"
                onClick={() => {
                  setActiveNav('map');
                  onNavigateToDashboard('fire-detection');
                }}
              >
                {lang === 'ar' ? 'الخريطة' : 'Map'}
              </button>
            </li>
            <li>
              <button 
                type="button"
                className="landing-nav-item"
                onClick={() => {
                  setActiveNav('analytics');
                  onNavigateToDashboard('historical');
                }}
              >
                {lang === 'ar' ? 'التحليلات' : 'Analytics'}
              </button>
            </li>
            <li>
              <button 
                type="button"
                className="landing-nav-item"
                onClick={() => setAboutModalOpen(true)}
              >
                {lang === 'ar' ? 'عن المنظومة' : 'About'}
              </button>
            </li>
          </ul>
        </nav>

        {/* Action Buttons: Sign In, Sign Up, or Logged In User Badge */}
        <div className="landing-nav-actions">
          {/* Language Toggle */}
          <button 
            type="button" 
            className="lang-toggle-btn"
            onClick={toggleLanguage}
            title={lang === 'en' ? 'التحويل للغة العربية' : 'Switch to English'}
          >
            {lang === 'en' ? 'العربية' : 'EN'}
          </button>

          {currentUser ? (
            <div className="user-profile-badge" style={{ border: currentUser.role === 'admin' ? '1px solid rgba(0, 229, 255, 0.45)' : '1px solid rgba(255, 119, 0, 0.45)' }}>
              <div className="user-avatar-circle" style={{ background: currentUser.role === 'admin' ? '#00e5ff' : '#ff7700', color: currentUser.role === 'admin' ? '#04101e' : '#fff' }}>
                {currentUser.role === 'admin' ? '🛡️' : '👤'}
              </div>
              <span className="user-name-text">
                {currentUser.role === 'admin' ? (lang === 'ar' ? 'أدمن (Admin)' : 'Admin') : (lang === 'ar' ? 'مستخدم (User)' : 'User')}
              </span>
              <button 
                type="button" 
                className="user-logout-btn" 
                onClick={() => setAuthModalOpen(true)}
                title={lang === 'ar' ? 'تبديل الدور' : 'Switch Role'}
                style={{ color: '#38bdf8' }}
              >
                {lang === 'ar' ? 'تبديل' : 'Switch'}
              </button>
              <button 
                type="button" 
                className="user-logout-btn" 
                onClick={handleLogout}
                title={lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
              >
                {lang === 'ar' ? 'خروج' : 'Exit'}
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              className="btn-pill-signin"
              onClick={() => handleOpenAuth('login')}
              style={{ background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(2, 132, 199, 0.35))', borderColor: '#00e5ff', color: '#38bdf8', fontWeight: 'bold' }}
            >
              <span>🛡️ / 👤</span>
              <span>{lang === 'ar' ? 'أدمن أم مستخدم؟' : 'Admin or User?'}</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================
          Hero Section (Unified Fire Intelligence from MODIS & VIIRS)
          ========================================================= */}
      <main className="landing-hero">
        {/* Left Column: Headlines, Paragraph, Action Buttons, and 4 Features */}
        <div className="landing-hero-content">
          <h1 className="hero-main-heading">
            {lang === 'ar' ? (
              <>
                منظومة رصد الحرائق الموحدة
                <br />
                عبر <span className="cyan-highlight">MODIS & VIIRS</span>
              </>
            ) : (
              <>
                Unified Fire sync
                <br />
                from <span className="cyan-highlight">MODIS & VIIRS</span>
              </>
            )}
          </h1>

          <p className="hero-description">
            {lang === 'ar'
              ? 'نعمل على مواءمة رصد حرائق الغابات بالأقمار الصناعية متعددة المستشعرات، والاستفادة من الأنماط التاريخية، وتوفير رؤى قابلة للتنفيذ من أجل كوكب أكثر أماناً ومرونة.'
              : 'We harmonize multi-sensor satellite fire observations, leverage historical patterns, and provide actionable insights for a safer and more resilient planet.'}
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group">
            <button 
              type="button" 
              className="btn-explore-now"
              onClick={() => onNavigateToDashboard('dashboard')}
            >
              {lang === 'ar' ? 'استكشف الآن' : 'Explore Now'}
            </button>

            <button 
              type="button" 
              className="btn-learn-more"
              onClick={() => setAboutModalOpen(true)}
            >
              {lang === 'ar' ? 'اعرف المزيد' : 'Learn More'}
            </button>
          </div>

          {/* Bottom 4 Feature Icons Matching Screenshot Exactly */}
          <div className="hero-features-row">
            {/* Feature 1: Multi-Sensor Harmonization */}
            <div 
              className="feature-pill-item" 
              onClick={() => onNavigateToDashboard('fire-detection')}
              title={lang === 'ar' ? 'تنسيق حساسات الأقمار الصناعية' : 'Multi-Sensor Harmonization'}
            >
              <div className="feature-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <span className="feature-pill-title">
                {lang === 'ar' ? 'مواءمة المستشعرات المتعددة' : 'Multi-Sensor Harmonization'}
              </span>
            </div>

            {/* Feature 2: Historical Analysis */}
            <div 
              className="feature-pill-item" 
              onClick={() => onNavigateToDashboard('historical')}
              title={lang === 'ar' ? 'تحليل السجلات التاريخية' : 'Historical Analysis'}
            >
              <div className="feature-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"></path>
                  <path d="M7 16l4-5 4 2 5-6"></path>
                  <circle cx="7" cy="16" r="1.5" fill="currentColor"></circle>
                  <circle cx="11" cy="11" r="1.5" fill="currentColor"></circle>
                  <circle cx="15" cy="13" r="1.5" fill="currentColor"></circle>
                  <circle cx="20" cy="7" r="1.5" fill="currentColor"></circle>
                </svg>
              </div>
              <span className="feature-pill-title">
                {lang === 'ar' ? 'التحليل التاريخي والأنماط' : 'Historical Analysis'}
              </span>
            </div>

            {/* Feature 3: Anomaly Detection */}
            <div 
              className="feature-pill-item" 
              onClick={() => onNavigateToDashboard('fire-risk')}
              title={lang === 'ar' ? 'كشف الشذوذ الحراري' : 'Anomaly Detection'}
            >
              <div className="feature-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <circle cx="12" cy="14" r="1.8" fill="currentColor"></circle>
                </svg>
              </div>
              <span className="feature-pill-title">
                {lang === 'ar' ? 'كشف الشذوذ الحراري' : 'Anomaly Detection'}
              </span>
            </div>

            {/* Feature 4: Environmental Context */}
            <div 
              className="feature-pill-item" 
              onClick={() => onNavigateToDashboard('recovery')}
              title={lang === 'ar' ? 'التعافي البيئي والغطاء النباتي' : 'Environmental Recovery'}
            >
              <div className="feature-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
              </div>
              <span className="feature-pill-title">
                {lang === 'ar' ? 'السياق البيئي والحماية' : 'Environmental Context'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Fidelity Earth Viewed from Orbit at Night */}
        <div className="landing-hero-visual">
          <div className="earth-globe-wrapper">
            {/* Atmospheric Blue Halo */}
            <div className="earth-glow-atmosphere"></div>

            {/* Orbit Track Arc */}
            <div className="satellite-orbit-line"></div>

            {/* Live Orbit Status Tag */}
            <div className="satellite-orbit-tag">
              <span className="satellite-orbit-dot"></span>
              <span>NASA VIIRS/MODIS ORBIT</span>
            </div>

            {/* Earth Sphere with Night Lights & Active Wildfire Hotspots */}
            <img 
              src={earthBg} 
              alt="Earth from Orbit at Night showing Wildfire Hotspots" 
              className="earth-sphere-img"
            />

            {/* Glowing Hotspot Beacons placed on the Globe */}
            <div className="earth-hotspot-beacon" style={{ top: '38%', left: '46%' }} title="Attica & Rhodes Active Fire Cluster (FRP 340 MW)">
              <div className="beacon-ring"></div>
              <div className="beacon-core"></div>
            </div>

            <div className="earth-hotspot-beacon" style={{ top: '44%', left: '39%' }} title="Valencia Spain Hotspot (FRP 210 MW)">
              <div className="beacon-ring" style={{ animationDelay: '0.6s' }}></div>
              <div className="beacon-core"></div>
            </div>

            <div className="earth-hotspot-beacon" style={{ top: '48%', left: '43%' }} title="Sicily & Mediterranean Thermal Front">
              <div className="beacon-ring" style={{ animationDelay: '1.2s' }}></div>
              <div className="beacon-core"></div>
            </div>

            <div className="earth-hotspot-beacon" style={{ top: '65%', left: '50%' }} title="Sub-Saharan Seasonal Active Front">
              <div className="beacon-ring" style={{ animationDelay: '0.9s' }}></div>
              <div className="beacon-core"></div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          Sign Up & Sign In Modal
          ========================================================= */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
        lang={lang}
      />

      {/* =========================================================
          About Platform Modal
          ========================================================= */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        onExplore={() => {
          setAboutModalOpen(false);
          onNavigateToDashboard('dashboard');
        }}
        lang={lang}
      />
    </div>
  );
};
