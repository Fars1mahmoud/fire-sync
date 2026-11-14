import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/wildfireData';
import type { UserProfile } from './AuthModal';
import { ApiClient } from '../services/apiClient';

interface NavbarProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  selectedRegion?: string;
  onSelectRegion?: (r: string) => void;
  emergencyMode: boolean;
  setEmergencyMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  lowBandwidth: boolean;
  setLowBandwidth: (v: boolean | ((prev: boolean) => boolean)) => void;
  colorblindMode: boolean;
  setColorblindMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSelect: (locationName: string, lat?: number, lng?: number, zoom?: number) => void;
  unreadAlerts: number;
  setShowNotifications: (v: boolean | ((prev: boolean) => boolean)) => void;
  setShowReportModal: (v: boolean) => void;
  setShowExportModal: (v: boolean) => void;
  setShowBroadcastModal: (v: boolean) => void;
  setShowARModal: (v: boolean) => void;
  setShowSituationModal: (v: boolean) => void;
  onGoToLanding?: () => void;
  onNavigateToUser?: () => void;
  onNavigateToFireDetection?: () => void;
  onNavigateToAnalysisDashboard?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onLogout?: () => void;
}

const navItems = [
  { id: 'dashboard', labelEn: 'Dashboard', labelAr: 'لوحة التحكم', icon: 'home' },
  { id: 'fire-detection', labelEn: 'Fire Detection', labelAr: 'رصد الحرائق', icon: 'fire' },
  { id: 'historical', labelEn: 'Historical Analysis', labelAr: 'التحليل التاريخي', icon: 'calendar' },
  { id: 'fire-risk', labelEn: 'Fire Risk', labelAr: 'مخاطر الحريق', icon: 'fire' },
  { id: 'weather', labelEn: 'Weather', labelAr: 'الطقس', icon: 'weather' },
  { id: 'smoke-air', labelEn: 'Smoke & Air Quality', labelAr: 'جودة الهواء', icon: 'wind' },
  { id: 'ground-truth', labelEn: 'Ground Truth', labelAr: 'البلاغات الميدانية', icon: 'pin' },
  { id: 'alerts', labelEn: 'Alerts', labelAr: 'التنبيهات', icon: 'alert' },
  { id: 'recovery', labelEn: 'Recovery', labelAr: 'التعافي البيئي', icon: 'layers' },
  { id: 'infrastructure', labelEn: 'Infrastructure', labelAr: 'البنية التحتية', icon: 'infra' },
  { id: 'evacuation', labelEn: 'Evacuation', labelAr: 'خطط الإخلاء', icon: 'route' },
];

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  selectedRegion,
  onSelectRegion,
  emergencyMode,
  setEmergencyMode,
  lowBandwidth,
  setLowBandwidth,
  colorblindMode,
  setColorblindMode,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSearchSelect,
  unreadAlerts,
  setShowNotifications,
  setShowReportModal,
  setShowExportModal,
  setShowBroadcastModal,
  setShowARModal,
  setShowSituationModal,
  onGoToLanding,
  onNavigateToUser,
  onNavigateToFireDetection,
  onNavigateToAnalysisDashboard,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isApiLive, setIsApiLive] = useState<boolean>(true);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    ApiClient.checkHealth().then(setIsApiLive);
    const interval = setInterval(() => {
      ApiClient.checkHealth().then(setIsApiLive);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const searchableLocations = [
    { name: 'Athens, Attica (Greece)', nameAr: 'أثينا، أتيكا (اليونان)', lat: 37.9838, lng: 23.7275, zoom: 11, type: 'Active Hotspot - FRP 285 MW' },
    { name: 'Rhodes (South Aegean, Greece)', nameAr: 'جزيرة رودس (اليونان)', lat: 36.4341, lng: 28.2176, zoom: 11, type: 'Active Fire - FRP 340 MW' },
    { name: 'Chico & Butte County (California, USA)', nameAr: 'بوت كاونتي / تشيكو (كاليفورنيا)', lat: 39.7285, lng: -121.8375, zoom: 11, type: 'Park Fire Complex - FRP 485 MW' },
    { name: 'Lake Tahoe & Sierra Nevada (California)', nameAr: 'بحيرة تاهو وسييرا (كاليفورنيا)', lat: 39.0968, lng: -120.0324, zoom: 11, type: 'Sierra Front Wildfire' },
    { name: 'Valencia & Alicante (Spain)', nameAr: 'فالنسيا وأليكانتي (إسبانيا)', lat: 39.4699, lng: -0.3763, zoom: 10, type: 'Active Fire - FRP 195 MW' },
    { name: 'Palermo & Catania (Sicily, Italy)', nameAr: 'باليرمو وكاتانيا (صقلية، إيطاليا)', lat: 37.5079, lng: 15.0830, zoom: 10, type: 'Thermal Anomaly - FRP 220 MW' },
    { name: 'Antalya & Manavgat (Turkey)', nameAr: 'أنطاليا ومنافغات (تركيا)', lat: 36.8969, lng: 30.7133, zoom: 10, type: 'High Intensity Fire - FRP 310 MW' },
    { name: 'Kabylie & Tizi Ouzou (Algeria)', nameAr: 'منطقة القبائل وتيزي وزو (الجزائر)', lat: 36.7118, lng: 4.0459, zoom: 10, type: 'Forest Wildfire - FRP 245 MW' },
    { name: 'Cairo & Nile Delta (Egypt)', nameAr: 'القاهرة والدلتا (مصر)', lat: 30.0444, lng: 31.2357, zoom: 11, type: 'NASA Regional Air Quality' },
    { name: 'Alexandria & Coast (Egypt)', nameAr: 'الإسكندرية والساحل الشمالي (مصر)', lat: 31.2001, lng: 29.9187, zoom: 11, type: 'Mediterranean Coastal Sector' },
  ];

  const filteredLocations = searchableLocations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.nameAr.includes(searchQuery)
  );

  const handleTabClick = (tabLabel: string) => {
    setActiveTab(tabLabel);
  };

  return (
    <>
      <header className={`topbar ${emergencyMode ? 'emergency-glow' : ''}`}>
        {/* Brand */}
        <div
          className="brand"
          onClick={() => setActiveTab('Dashboard')}
          style={{ cursor: 'pointer' }}
          title={lang === 'ar' ? 'لوحة التحكم الرئيسية' : 'Return to Master Dashboard'}
        >
          <span className="brand-fire">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="url(#fireGradient)" stroke="#ff4500" strokeWidth="1">
              <defs>
                <linearGradient id="fireGradient" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#ff1a1a" />
                  <stop offset="50%" stopColor="#ff7700" />
                  <stop offset="100%" stopColor="#ffee55" />
                </linearGradient>
              </defs>
              <path d="M12 2C8.5 7.5 5 10.5 5 15a7 7 0 0 0 14 0c0-3.5-2.5-6.5-4-9-1 3-3 4-3 4s-.5-4.5 0-8z" />
            </svg>
          </span>
          <div>
            <b>{t.appTitle}</b>
            <small>{t.appSubtitle}</small>
          </div>
        </div>

        {/* Country Quick Switcher (Brazil & Canada Archives) */}
        {onSelectRegion && (
          <div
            className="country-quick-switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 10px',
            }}
          >
            <button
              type="button"
              className={`country-pill-btn ${selectedRegion === 'Brazil' && (activeTab === 'Dashboard' || !activeTab) ? 'active' : ''}`}
              onClick={() => {
                onSelectRegion('Brazil');
                if (activeTab === 'Home' || activeTab === 'User View') {
                  setActiveTab('Dashboard');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '16px',
                border: selectedRegion === 'Brazil' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                background: selectedRegion === 'Brazil' ? 'rgba(16,185,129,0.22)' : 'rgba(15,23,42,0.65)',
                color: selectedRegion === 'Brazil' ? '#34d399' : '#94a3b8',
                fontWeight: selectedRegion === 'Brazil' ? 700 : 500,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="NASA FIRMS Brazil Archive (7.69M satellite records: Amazonas, Cerrado, Pantanal)"
            >
              <span style={{ fontSize: '14px' }}>🇧🇷</span>
              <span>{lang === 'ar' ? 'البرازيل (7.69M)' : 'Brazil (7.69M)'}</span>
            </button>

            <button
              type="button"
              className={`country-pill-btn ${selectedRegion === 'Canada' && (activeTab === 'Dashboard' || !activeTab) ? 'active' : ''}`}
              onClick={() => {
                onSelectRegion('Canada');
                if (activeTab === 'Home' || activeTab === 'User View') {
                  setActiveTab('Dashboard');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '16px',
                border: selectedRegion === 'Canada' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                background: selectedRegion === 'Canada' ? 'rgba(56,189,248,0.22)' : 'rgba(15,23,42,0.65)',
                color: selectedRegion === 'Canada' ? '#38bdf8' : '#94a3b8',
                fontWeight: selectedRegion === 'Canada' ? 700 : 500,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="NASA FIRMS Canada Archive (3.18M satellite records: Alberta, NWT, Quebec)"
            >
              <span style={{ fontSize: '14px' }}>🇨🇦</span>
              <span>{lang === 'ar' ? 'كندا (3.18M)' : 'Canada (3.18M)'}</span>
            </button>

            <button
              type="button"
              className={`country-pill-btn ${activeTab === 'Historical Analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('Historical Analysis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '16px',
                border: activeTab === 'Historical Analysis' ? '1px solid #38bdf8' : '1px solid #0284c7',
                background: activeTab === 'Historical Analysis' ? 'rgba(56, 189, 248, 0.28)' : 'rgba(2, 132, 199, 0.2)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="3. Historical Analysis (FireBoard Enterprise Analytics)"
            >
              <span style={{ fontSize: '13px' }}>📊</span>
              <span>{lang === 'ar' ? 'التحليل التاريخي (FireBoard)' : 'Historical Analysis'}</span>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="search relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (filteredLocations.length > 0) {
                  const loc = filteredLocations[0];
                  onSearchSelect(loc.name, loc.lat, loc.lng, loc.zoom);
                  setSearchQuery(loc.name);
                } else {
                  onSearchSelect(searchQuery);
                }
                setShowSearchDropdown(false);
              }
            }}
            placeholder={t.searchPlaceholder}
          />
          {showSearchDropdown && searchQuery.trim() && (
            <div className="search-dropdown">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <div
                    key={loc.name}
                    className="search-item"
                    onClick={() => {
                      onSearchSelect(loc.name, loc.lat, loc.lng, loc.zoom);
                      setSearchQuery(lang === 'ar' ? loc.nameAr : loc.name);
                      setShowSearchDropdown(false);
                    }}
                  >
                    <strong>📍 {lang === 'ar' ? loc.nameAr : loc.name}</strong>
                    <span>{loc.type}</span>
                  </div>
                ))
              ) : (
                <div className="search-item muted">{lang === 'ar' ? 'اضغط Enter للبحث الجغرافي المباشر' : 'Press Enter to geocode location'}</div>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="topbar-right">
          {/* Live PostGIS Database Status Badge */}
          <div
            className="tool-pill-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isApiLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              borderColor: isApiLive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              color: isApiLive ? '#34d399' : '#f87171',
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '20px',
            }}
            title={isApiLive ? 'Live Connection: PostgreSQL 16 + PostGIS 3.4 (10.87M Satellite Records)' : 'API Offline: Using Cached Archive'}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isApiLive ? '#10b981' : '#ef4444',
                boxShadow: isApiLive ? '0 0 6px #10b981' : '0 0 6px #ef4444',
                display: 'inline-block',
              }}
            />
            <span>{isApiLive ? 'POSTGIS LIVE' : 'API OFFLINE'}</span>
          </div>

          {/* Low-Bandwidth Mode Button */}
          <button
            className={`tool-pill-btn ${lowBandwidth ? 'active' : ''}`}
            onClick={() => setLowBandwidth((b) => !b)}
            title="Toggle Low-Bandwidth Terminal for Field Firefighters"
          >
            <span>⚡</span>
            <span>{t.lowBandwidth}</span>
          </button>

          {/* Colorblind / Accessibility Mode Button */}
          <button
            className={`tool-pill-btn ${colorblindMode ? 'active' : ''}`}
            onClick={() => setColorblindMode((c) => !c)}
            title="Toggle Colorblind Friendly Palette (Blue / Yellow / Gray)"
          >
            <span>👁</span>
            <span>{t.colorblindMode}</span>
          </button>

          {/* Home Landing Page Button */}
          <button
            className={`tool-pill-btn ${activeTab === 'Home' ? 'active' : ''}`}
            onClick={() => setActiveTab('Home')}
            title={lang === 'ar' ? 'الصفحة الرئيسية' : 'Home / Landing Page'}
            style={{
              borderColor: activeTab === 'Home' ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)',
              background: activeTab === 'Home' ? 'rgba(56, 189, 248, 0.25)' : undefined,
              color: '#38bdf8',
              fontWeight: activeTab === 'Home' ? 700 : 500,
            }}
          >
            <span>🏠</span>
            <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>

          {/* Switch to Civilian User View Button */}
          <button
            className={`tool-pill-btn ${activeTab === 'User View' ? 'active' : ''}`}
            onClick={() => setActiveTab('User View')}
            title={lang === 'ar' ? 'واجهة المستخدم العادي (Fire sync)' : 'Civilian User View'}
            style={{
              borderColor: activeTab === 'User View' ? '#86efac' : 'rgba(16, 185, 129, 0.4)',
              background: activeTab === 'User View' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
              color: '#86efac',
              fontWeight: activeTab === 'User View' ? 700 : 600,
            }}
          >
            <span>👤</span>
            <span>{lang === 'ar' ? 'واجهة اليوزر' : 'User View'}</span>
          </button>

          {/* User Auth Section (Admin / User Role Switcher) */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(14, 34, 61, 0.85)', border: currentUser.role === 'admin' ? '1px solid rgba(0, 229, 255, 0.45)' : '1px solid rgba(255, 119, 0, 0.45)', borderRadius: '20px', padding: '3px 10px 3px 6px', fontSize: '11.5px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: currentUser.role === 'admin' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 119, 0, 0.2)', color: currentUser.role === 'admin' ? '#00e5ff' : '#ff7700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                {currentUser.role === 'admin' ? '🛡️' : '👤'}
              </span>
              <span style={{ color: currentUser.role === 'admin' ? '#38bdf8' : '#fb923c', fontWeight: '700' }}>
                {currentUser.role === 'admin' ? (lang === 'ar' ? 'أدمن (Admin)' : 'Admin') : (lang === 'ar' ? 'مستخدم (User)' : 'User')}
              </span>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#e2e8f0', borderRadius: '12px', padding: '2px 7px', cursor: 'pointer', fontSize: '10.5px' }}
                  title={lang === 'ar' ? 'تبديل الدور (أدمن أو يوزر)' : 'Switch Role (Admin or User)'}
                >
                  {lang === 'ar' ? 'تبديل' : 'Switch'}
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '10.5px', padding: '0 2px' }}
                  title={lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
                >
                  {lang === 'ar' ? 'خروج' : 'Exit'}
                </button>
              )}
            </div>
          ) : onOpenAuth ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="tool-pill-btn active"
                onClick={() => onOpenAuth('login')}
                style={{ background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(2, 132, 199, 0.3))', borderColor: '#00e5ff', color: '#38bdf8', fontWeight: 'bold' }}
              >
                <span>🛡️ / 👤</span>
                <span>{lang === 'ar' ? 'أدمن أم مستخدم؟' : 'Admin or User?'}</span>
              </button>
            </div>
          ) : null}

          {/* GIS Data Export Button */}
          <button
            className="tool-pill-btn"
            onClick={() => setShowExportModal(true)}
            title="Export GIS Data (GeoJSON, KML, CSV)"
          >
            <span>💾</span>
            <span>{t.exportData}</span>
          </button>

          {/* Broadcast Alert Simulator Button */}
          <button
            className="tool-pill-btn"
            onClick={() => setShowBroadcastModal(true)}
            title="Emergency Broadcast Simulator (SMS / Cell Broadcast)"
          >
            <span>📡</span>
          </button>

          {/* Language Switcher */}
          <div className="language">
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
              title="English"
            >
              <span className="flag">🇬🇧</span> EN
            </button>
            <i className="lang-sep" />
            <button
              className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
              onClick={() => setLang('ar')}
              title="العربية"
            >
              <span className="flag">🇸🇦</span> العربية
            </button>
          </div>

          {/* Notifications */}
          <button
            className="notification"
            onClick={() => setShowNotifications((prev) => !prev)}
            title="Active Emergency Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadAlerts > 0 && <b>{unreadAlerts}</b>}
          </button>

          {/* Emergency Mode Button */}
          <button
            className={`emergency ${emergencyMode ? 'active' : ''}`}
            onClick={() => setEmergencyMode((prev) => !prev)}
            title="Toggle Crisis Response Mode"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.5 7.5 5 10.5 5 15a7 7 0 0 0 14 0c0-3.5-2.5-6.5-4-9-1 3-3 4-3 4s-.5-4.5 0-8z" />
            </svg>
            <span>{t.emergencyMode}</span>
          </button>

          {/* Profile */}
          <button
            className="profile"
            onClick={() => setShowSituationModal(true)}
            title="NASA Space Operations & User Profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="7" r="4" />
              <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main 16 Navigation Tabs */}
      <nav className="main-nav">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.labelEn ||
            activeTab === item.id ||
            (item.id === 'dashboard' && (activeTab === 'Dashboard' || activeTab === 'dashboard' || activeTab === 'map' || !activeTab)) ||
            (item.id === 'fire-detection' && (activeTab === 'Fire Detection' || activeTab === 'fire-detection')) ||
            (item.id === 'historical' && (activeTab === 'Historical Analysis' || activeTab === 'historical' || activeTab === 'analysis-dashboard'));
          return (
            <button
              key={item.id}
              className={isActive ? 'active' : ''}
              onClick={() => handleTabClick(item.labelEn)}
            >
              <NavIcon name={item.icon} isActive={isActive} />
              <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

function NavIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const color = isActive ? '#4c9cff' : 'currentColor';
  switch (name) {
    case 'home':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'fire':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive ? '#ff4500' : 'none'} stroke={isActive ? '#ff4500' : color} strokeWidth="1.8">
          <path d="M12 2C8.5 7.5 5 10.5 5 15a7 7 0 0 0 14 0c0-3.5-2.5-6.5-4-9-1 3-3 4-3 4s-.5-4.5 0-8z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'weather':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case 'wind':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      );
    case 'pin':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
      );
    case 'alert':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'layers':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'infra':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
        </svg>
      );
    case 'route':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <circle cx="12" cy="5" r="3" />
          <path d="m9 20 3-6 4 2 3-5M6 13l3-2 3 3" />
        </svg>
      );
    case 'wildlife':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <path d="M12 5c-3 0-5 2-5 5 0 4 5 9 5 9s5-5 5-9c0-3-2-5-5-5Z" />
          <path d="M6 3c1.5 2 2 4 1 6M18 3c-1.5 2-2 4-1 6" />
        </svg>
      );
    case 'cube':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <path d="m21 16-9 5-9-5V8l9-5 9 5v8z" />
          <path d="M12 21V11M21 8l-9 5M3 8l9 5" />
        </svg>
      );
    case 'ar':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
          <rect x="7" y="7" width="10" height="10" rx="1" />
        </svg>
      );
    case 'report':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'settings':
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
  }
}
