import React, { useState, useEffect } from 'react';
import { FlameIcon, GlobeIcon, MenuIcon, XIcon } from '../icons';
import type { UserProfile } from '../AuthModal';

interface LandingNavbarProps {
  activePage: 'home' | 'map' | 'analytics' | 'about' | 'fire-detection';
  onNavigate: (page: 'home' | 'map' | 'analytics' | 'about' | 'user-dashboard' | 'fire-detection', region?: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  activePage,
  onNavigate,
  onOpenAuth,
  currentUser,
  onLogout,
  lang,
  setLang,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية' },
    { id: 'fire-detection', labelEn: 'Fire Detection', labelAr: 'رصد الحرائق' },
    { id: 'map', labelEn: 'Tactical Map', labelAr: 'الخريطة التكتيكية' },
    { id: 'analytics', labelEn: 'Analytics', labelAr: 'التحليلات' },
    { id: 'about', labelEn: 'About', labelAr: 'عن المنظومة' },
  ] as const;

  return (
    <header className={`landing-navbar-container ${isScrolled ? 'scrolled-glass' : ''}`}>
      <div className="landing-navbar-inner">
        {/* Brand Logo & Tagline */}
        <div 
          className="landing-navbar-brand" 
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          aria-label="Fire sync Home"
        >
          <div className="brand-flame-wrapper">
            <FlameIcon size={24} className="brand-flame-svg" />
            <div className="flame-glow-halo" />
          </div>
          <div className="brand-title-group">
            <span className="brand-name">Fire sync</span>
            <span className="brand-tagline">
              {lang === 'ar' ? 'من البيانات إلى غدٍ أكثر أماناً' : 'From Data to a Safer Tomorrow'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="landing-navbar-links" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`nav-link-btn ${activePage === link.id ? 'active' : ''}`}
              onClick={() => onNavigate(link.id)}
            >
              <span>{lang === 'ar' ? link.labelAr : link.labelEn}</span>
              {activePage === link.id && <span className="nav-link-indicator" />}
            </button>
          ))}

          {/* Quick Country Datasets Direct Navigation */}
          <button
            type="button"
            className="nav-link-btn country-quick-btn"
            onClick={() => onNavigate('map', 'Brazil')}
            style={{
              color: '#34d399',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.08)',
            }}
            title="Open NASA FIRMS Brazil Dataset"
          >
            <span>🇧🇷</span>
            <span>{lang === 'ar' ? 'البرازيل' : 'Brazil'}</span>
          </button>

          <button
            type="button"
            className="nav-link-btn country-quick-btn"
            onClick={() => onNavigate('map', 'Canada')}
            style={{
              color: '#38bdf8',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.08)',
            }}
            title="Open NASA FIRMS Canada Dataset"
          >
            <span>🇨🇦</span>
            <span>{lang === 'ar' ? 'كندا' : 'Canada'}</span>
          </button>
        </nav>

        {/* Right Controls: Language & Sign In */}
        <div className="landing-navbar-actions">
          {/* Language Selector Dropdown / Toggle */}
          <button
            type="button"
            className="lang-selector-btn"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            title={lang === 'en' ? 'Switch to Arabic' : 'التحويل للإنجليزية'}
          >
            <GlobeIcon size={14} />
            <span>{lang === 'en' ? 'EN ▼' : 'العربية ▼'}</span>
          </button>

          {currentUser ? (
            <div className="user-logged-chip">
              <span className="user-avatar-circle">
                {currentUser.role === 'admin' ? '🛡️' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '👤')}
              </span>
              <span className="user-logged-name">
                {currentUser.name || currentUser.email.split('@')[0]}
              </span>
              {currentUser.role === 'admin' ? (
                <button
                  type="button"
                  className="btn-signin-outlined"
                  style={{ padding: '3px 8px', fontSize: '11px', marginInline: '4px' }}
                  onClick={() => onNavigate('map')}
                >
                  🛡️ {lang === 'ar' ? 'لوحة القيادة' : 'Admin Hub'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-signin-outlined"
                  style={{ padding: '3px 8px', fontSize: '11px', marginInline: '4px' }}
                  onClick={() => onNavigate('user-dashboard')}
                >
                  👤 {lang === 'ar' ? 'لوحة المستخدم' : 'My Dashboard'}
                </button>
              )}
              <button 
                type="button" 
                className="user-logout-link" 
                onClick={onLogout}
                title="Log Out"
              >
                {lang === 'ar' ? 'خروج' : 'Log Out'}
              </button>
            </div>
          ) : (
            <div className="auth-btn-cluster">
              <button
                type="button"
                className="btn-signin-outlined"
                onClick={() => onOpenAuth('login')}
              >
                {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                type="button"
                className="btn-signup-pill"
                onClick={() => onOpenAuth('signup')}
              >
                {lang === 'ar' ? 'الاشتراك' : 'Sign Up'}
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`mobile-nav-link ${activePage === link.id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
            >
              {lang === 'ar' ? link.labelAr : link.labelEn}
            </button>
          ))}
          <div className="mobile-drawer-auth">
            {!currentUser && (
              <div className="mobile-auth-row">
                <button
                  type="button"
                  className="btn-signin-outlined"
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                >
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </button>
                <button
                  type="button"
                  className="btn-signup-pill"
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                >
                  {lang === 'ar' ? 'الاشتراك' : 'Sign Up'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
