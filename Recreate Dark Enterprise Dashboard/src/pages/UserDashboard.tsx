import React, { useState } from 'react';
import './UserDashboard.css';
import type { UserProfile } from '../components/AuthModal';
import { RealEarthMap } from '../components/RealEarthMap';

import heroBannerImg from '../assets/user/fireguard_hero_banner.jpg';
import stayAwareImg from '../assets/user/stay_aware_thumb.jpg';
import safeRouteImg from '../assets/user/safe_route_thumb.jpg';
import alertWildfireImg from '../assets/user/alert_wildfire.jpg';
import alertSmokeImg from '../assets/user/alert_smoke.jpg';
import alertRoadImg from '../assets/user/alert_road.jpg';
import videoSrc from '../assets/video1.mp4';

interface UserDashboardProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  currentUser: UserProfile | null;
  onNavigateToAdmin: () => void;
  onNavigateToHome: () => void;
  onLogout: () => void;
  hideNavbar?: boolean;
}

interface AlertItem {
  id: string;
  title: { en: string; ar: string };
  badge: { en: string; ar: string; level: 'high' | 'moderate' | 'low' };
  location: { en: string; ar: string };
  time: { en: string; ar: string };
  distance: string;
  img: string;
  description: { en: string; ar: string };
  coordinates: string;
  frp: string;
}

interface HotspotPin {
  id: string;
  name: { en: string; ar: string };
  top: string;
  left: string;
  risk: 'Extreme' | 'High' | 'Moderate' | 'Low';
  frp: string;
  distance: string;
  sector: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  lang,
  setLang,
  currentUser,
  onNavigateToAdmin,
  onNavigateToHome,
  onLogout,
  hideNavbar = false,
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'home' | 'fires' | 'forecast' | 'routes' | 'alerts'>('home');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Location & Weather state - Brazil Amazon Fire Sector
  const [currentLocation, setCurrentLocation] = useState({
    name: { en: 'Amazon Basin, Brazil', ar: 'حوض الأمازون، البرازيل' },
    coords: '-10.8244° S, -55.4521° W',
    temp: '34°C',
    weather: { en: 'Dry Smoke Haze', ar: 'دخان وضباب حراري جاف' },
    wind: '22 km/h SE',
    humidity: '24%',
    drought: { en: 'Extreme', ar: 'شديد للغاية' },
  });

  // Search input
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Map layer toggles (8 layers from screenshot)
  const [layers, setLayers] = useState({
    activeFires: true,
    riskForecast: true,
    smokeModis: true,
    airQuality: false,
    windDirection: false,
    vegetation: false,
    population: false,
    protectedAreas: false,
  });

  // Map View Mode (Satellite / Terrain / Hybrid)
  const [mapMode, setMapMode] = useState<'satellite' | 'terrain' | 'hybrid'>('satellite');
  const [mapZoom, setMapZoom] = useState(1);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotPin | null>(null);

  // Modals state
  const [showSafeRouteModal, setShowSafeRouteModal] = useState(false);
  const [showAlertDetailsModal, setShowAlertDetailsModal] = useState<AlertItem | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showEmergencyPlanModal, setShowEmergencyPlanModal] = useState(false);
  const [showAllAlertsModal, setShowAllAlertsModal] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState<string | null>(null);
  const [selectedForecastDay, setSelectedForecastDay] = useState<number>(0);

  // Trigger brief toast message
  const triggerToast = (msg: string) => {
    setShowNotificationToast(msg);
    setTimeout(() => setShowNotificationToast(null), 3500);
  };

  // Nearby Hotspots on Map - Real Brazil & Canada Dataset Observations
  const hotspots: HotspotPin[] = [
    {
      id: 'h-1',
      name: { en: 'BR-319 Humaitá Rainforest Front', ar: 'بؤرة هومياتا في غابات الأمازون (البرازيل)' },
      top: '38%',
      left: '42%',
      risk: 'Extreme',
      frp: '485 MW',
      distance: '14 km',
      sector: 'Amazon Rainforest Biome',
    },
    {
      id: 'h-2',
      name: { en: 'Sinop Cerrado Flank', ar: 'جبهة سينوب - سيرادو الزراعية (ماتو غروسو)' },
      top: '48%',
      left: '52%',
      risk: 'High',
      frp: '395 MW',
      distance: '32 km',
      sector: 'Cerrado Agricultural Belt',
    },
    {
      id: 'h-3',
      name: { en: 'Pantanal Corumbá Wetland Buffer', ar: 'مستنقعات بانتانال - كورومبا (البرازيل)' },
      top: '64%',
      left: '46%',
      risk: 'Extreme',
      frp: '520 MW',
      distance: '48 km',
      sector: 'Pantanal Wetlands Sector',
    },
    {
      id: 'h-4',
      name: { en: 'Fort McMurray Boreal Mega-Fire', ar: 'مجمع غابات فورت ماكموري (ألبرتا، كندا)' },
      top: '22%',
      left: '26%',
      risk: 'Extreme',
      frp: '620 MW',
      distance: '85 km',
      sector: 'Boreal Coniferous Forest',
    },
    {
      id: 'h-5',
      name: { en: 'Donnie Creek Mega-Complex', ar: 'حرائق دوني كريك الكبرى (بريتيش كولومبيا، كندا)' },
      top: '18%',
      left: '20%',
      risk: 'Extreme',
      frp: '810 MW',
      distance: '110 km',
      sector: 'Peace River Wildfire Zone',
    },
  ];

  // 4 Nearby Alerts - Based on NASA FIRMS Brazil & Canada Archives
  const alertsData: AlertItem[] = [
    {
      id: 'alt-1',
      title: { en: 'Major Amazon Forest Fire Detected', ar: 'رصد حريق واسع النطاق في الأمازون' },
      badge: { en: 'Critical Risk', ar: 'خطر فادح', level: 'high' },
      location: { en: 'Humaitá, Amazonas, Brazil', ar: 'هومياتا، الأمازون، البرازيل' },
      time: { en: 'NASA VIIRS Overpass 17:15 UTC', ar: 'رصد قمر VIIRS الساعة 17:15 UTC' },
      distance: '14 km',
      img: alertWildfireImg,
      description: {
        en: 'NOAA-20 VIIRS 375m sensor detected extreme biomass combustion with 485 MW radiative power along BR-319 corridor.',
        ar: 'رصد مستشعر NOAA-20 VIIRS بدقة 375 متراً نشاطاً حرارياً هائلاً بقوة 485 ميجاوات على امتداد قطاع BR-319 في الأمازون.',
      },
      coordinates: '-7.5211° S, -63.0245° W',
      frp: '485 MW',
    },
    {
      id: 'alt-2',
      title: { en: 'Canadian Boreal Mega-Fire Activity', ar: 'نشاط حرائق الغابات الشمالية في كندا' },
      badge: { en: 'Extreme', ar: 'شديد جداً', level: 'high' },
      location: { en: 'Fort McMurray, Alberta, Canada', ar: 'فورت ماكموري، ألبرتا، كندا' },
      time: { en: 'NASA Satellite Archive Sync', ar: 'تزامن أرشيف الأقمار الصناعية' },
      distance: '85 km',
      img: stayAwareImg,
      description: {
        en: 'Historic Canadian wildfire season record: over 1.68M detections in 2023 with peak FRP reaching 810 MW in coniferous canopy.',
        ar: 'سجل حرائق كندا القياسي: أكثر من 1.68 مليون رصد في موسم 2023 مع وصول طاقة الإشعاع إلى 810 ميجاوات.',
      },
      coordinates: '56.7320° N, -111.3810° W',
      frp: '620 MW',
    },
    {
      id: 'alt-3',
      title: { en: 'Pantanal Wetland Smoke Plume', ar: 'سحب دخانية في مستنقعات بانتانال' },
      badge: { en: 'Moderate', ar: 'متوسط', level: 'moderate' },
      location: { en: 'Corumbá, Mato Grosso do Sul, Brazil', ar: 'كورومبا، بانتانال، البرازيل' },
      time: { en: 'Detected 4 hours ago', ar: 'تم الرصد منذ 4 ساعات' },
      distance: '48 km',
      img: alertSmokeImg,
      description: {
        en: 'MODIS and VIIRS satellite sensors track widespread particulate matter PM2.5 drifting south-east over wetland reserves.',
        ar: 'ترصد مستشعرات الأقمار الصناعية جزيئات دخانية PM2.5 تنجرف نحو الجنوب الشرقي فوق محميات الأراضي الرطبة.',
      },
      coordinates: '-19.0125° S, -57.6520° W',
      frp: '520 MW',
    },
    {
      id: 'alt-4',
      title: { en: 'Transamazonian Highway Evacuation Detour', ar: 'إغلاق وقائي لطريق الترانس أمازون' },
      badge: { en: 'High', ar: 'مرتفع', level: 'high' },
      location: { en: 'BR-230 Highway (Altamira - Itaituba)', ar: 'طريق BR-230 (ألتاميرا - إيتايتوبا)' },
      time: { en: 'Due to severe fire perimeter expansion', ar: 'بسبب اقتراب حافة النيران النشطة' },
      distance: '62 km',
      img: alertRoadImg,
      description: {
        en: 'Federal Highway Police (PRF) have closed km 184 of BR-230 due to zero visibility and intense heat radiation.',
        ar: 'أغلقت شرطة الطرق الفيدرالية الكيلو 184 من طريق الترانس أمازون بسبب انعدام الرؤية والإشعاع الحراري الكثيف.',
      },
      coordinates: '-3.2045° S, -52.2140° W',
      frp: '340 MW',
    },
  ];

  // 7 Days Forecast matching screenshot
  const forecastDays = [
    { day: { en: 'Today', ar: 'اليوم' }, date: 'Oct 4', icon: '🔥', risk: { en: 'High', ar: 'مرتفع' }, percent: 75, level: 'high' },
    { day: { en: 'Mon', ar: 'الإثنين' }, date: 'Oct 5', icon: '🔥', risk: { en: 'High', ar: 'مرتفع' }, percent: 70, level: 'high' },
    { day: { en: 'Tue', ar: 'الثلاثاء' }, date: 'Oct 6', icon: '🔥', risk: { en: 'Moderate', ar: 'متوسط' }, percent: 55, level: 'moderate' },
    { day: { en: 'Wed', ar: 'الأربعاء' }, date: 'Oct 7', icon: '⛅', risk: { en: 'Moderate', ar: 'متوسط' }, percent: 40, level: 'moderate' },
    { day: { en: 'Thu', ar: 'الخميس' }, date: 'Oct 8', icon: '☁️', risk: { en: 'Low', ar: 'منخفض' }, percent: 20, level: 'low' },
    { day: { en: 'Fri', ar: 'الجمعة' }, date: 'Oct 9', icon: '☁️', risk: { en: 'Low', ar: 'منخفض' }, percent: 15, level: 'low' },
    { day: { en: 'Sat', ar: 'السبت' }, date: 'Oct 10', icon: '⛅', risk: { en: 'Low', ar: 'منخفض' }, percent: 10, level: 'low' },
  ];

  // Preset location switch options (Brazil & Canada Dataset Observatories)
  const locationsList = [
    { name: { en: 'Amazon Basin, Brazil', ar: 'حوض الأمازون، البرازيل' }, coords: '-10.8244° S, -55.4521° W', temp: '34°C', weather: { en: 'Dry Smoke Haze', ar: 'دخان وضباب حراري جاف' }, wind: '22 km/h SE', humidity: '24%', drought: { en: 'Extreme', ar: 'شديد للغاية' } },
    { name: { en: 'Mato Grosso (Cerrado), Brazil', ar: 'ماتو غروسو (سيرادو)، البرازيل' }, coords: '-12.5562° S, -55.7198° W', temp: '36°C', weather: { en: 'Extreme Fire Hazard', ar: 'خطر حرائق حرج' }, wind: '26 km/h E', humidity: '18%', drought: { en: 'Extreme', ar: 'شديد للغاية' } },
    { name: { en: 'Pantanal Wetlands, Brazil', ar: 'مستنقعات بانتانال، البرازيل' }, coords: '-19.0068° S, -57.6534° W', temp: '35°C', weather: { en: 'Heavy Biomass Smoke', ar: 'دخان كثيف وحرائق أعشاب' }, wind: '18 km/h S', humidity: '22%', drought: { en: 'Critical', ar: 'حرج' } },
    { name: { en: 'Fort McMurray (Athabasca), Canada', ar: 'فورت ماكموراي (التايغا)، كندا' }, coords: '56.7262° N, -111.3803° W', temp: '27°C', weather: { en: 'Boreal Wildfire Activity', ar: 'نشاط حرائق غابات تايغا' }, wind: '28 km/h WNW', humidity: '32%', drought: { en: 'High', ar: 'مرتفع' } },
    { name: { en: 'Donnie Creek (B.C.), Canada', ar: 'دوني كريك (كولومبيا البريطانية)، كندا' }, coords: '57.5500° N, -121.9000° W', temp: '25°C', weather: { en: 'Mega-fire Smoke Cloud', ar: 'سحب دخانية لحرائق ضخمة' }, wind: '30 km/h NW', humidity: '35%', drought: { en: 'Extreme', ar: 'شديد للغاية' } },
  ];

  const handleSelectLocation = (loc: typeof locationsList[0]) => {
    setCurrentLocation(loc);
    setShowLocationModal(false);
    triggerToast(lang === 'ar' ? `تم تحديث الموقع إلى ${loc.name.ar}` : `Location updated to ${loc.name.en}`);
  };

  const handleGpsLocate = () => {
    triggerToast(lang === 'ar' ? 'جاري تحديد موقعك الفعلي عبر الأقمار الصناعية...' : 'Locating your GPS coordinates via satellite...');
    setTimeout(() => {
      setMapZoom(1.2);
      triggerToast(lang === 'ar' ? 'تم ضبط المركز على محطة الرصد: حوض الأمازون، البرازيل' : 'Centered on observatory station: Amazon Basin, Brazil');
    }, 600);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = locationsList.find(l => 
      l.name.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.name.ar.includes(searchQuery)
    );
    if (match) {
      handleSelectLocation(match);
    } else {
      triggerToast(lang === 'ar' ? `تم البحث عن "${searchQuery}" وتحديث نطاق الرصد` : `Searched for "${searchQuery}"`);
    }
    setShowSearchSuggestions(false);
  };

  return (
    <div className={`fireguard-user-app ${lang === 'ar' ? 'rtl-mode' : 'ltr-mode'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {showNotificationToast && (
        <div className="fireguard-toast-banner" role="status" aria-live="polite">
          <span className="toast-dot"></span>
          <span>{showNotificationToast}</span>
          <button className="toast-close" onClick={() => setShowNotificationToast(null)}>✕</button>
        </div>
      )}

      {/* =========================================================================
          1. TOP FIREGUARD NAVIGATION BAR (or sleek sub-bar when embedded under persistent topbar)
          ========================================================================= */}
      {!hideNavbar ? (
        <header className="fireguard-navbar">
          {/* Brand */}
          <div className="fireguard-brand" onClick={() => setActiveTab('home')}>
            <div className="fireguard-flame-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 17 7.5 17 13.5C17 16.5376 14.5376 19 11.5 19C8.46243 19 6 16.5376 6 13.5C6 10.5 8.5 6 12 2Z" fill="url(#fgFlameGrad)" />
                <path d="M12 8C12 8 14.5 11 14.5 14C14.5 15.3807 13.3807 16.5 12 16.5C10.6193 16.5 9.5 15.3807 9.5 14C9.5 12 10.5 9.5 12 8Z" fill="#ffdf70" />
                <defs>
                  <linearGradient id="fgFlameGrad" x1="6" y1="2" x2="17" y2="19" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff4d2d" />
                    <stop offset="0.7" stopColor="#ff8400" />
                    <stop offset="1" stopColor="#ffa600" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="fireguard-brand-text">
              <span className="brand-title">Fire sync</span>
              <span className="brand-sub">Powered by NASA Earth Data</span>
            </div>
          </div>

          {/* Center Nav Tabs */}
          <nav className="fireguard-nav-links" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <span className="nav-icon">🏠</span>
              <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>

            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'fires' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('fires');
                const el = document.getElementById('map-stage-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
                triggerToast(lang === 'ar' ? 'تم إبراز الحرائق القريبة على الخريطة' : 'Nearby active fires highlighted');
              }}
            >
              <span className="nav-icon">🔥</span>
              <span>{lang === 'ar' ? 'الحرائق القريبة' : 'Nearby Fires'}</span>
            </button>

            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'forecast' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('forecast');
                const el = document.getElementById('forecast-stage-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="nav-icon">📊</span>
              <span>{lang === 'ar' ? 'التوقعات' : 'Forecast'}</span>
            </button>

            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('routes');
                setShowSafeRouteModal(true);
              }}
            >
              <span className="nav-icon">🚸</span>
              <span>{lang === 'ar' ? 'المسارات الآمنة' : 'Safe Routes'}</span>
            </button>

            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('alerts');
                setShowAllAlertsModal(true);
              }}
            >
              <span className="nav-icon">🔔</span>
              <span>{lang === 'ar' ? 'التنبيهات' : 'Alerts'}</span>
              <span className="alerts-badge-count">4</span>
            </button>
          </nav>

          {/* Right Section: Language, Role Switcher & User Profile */}
          <div className="fireguard-nav-actions">
            {/* Quick Switcher: Go to Admin Dashboard */}
            <button
              type="button"
              className="btn-switch-admin-view"
              onClick={onNavigateToAdmin}
              title={lang === 'ar' ? 'الانتقال إلى لوحة تحكم الإدارة الشاملة (Admin)' : 'Switch to Enterprise Admin Dashboard'}
            >
              <span className="admin-badge-icon">🛡️</span>
              <span className="admin-badge-text">
                {lang === 'ar' ? 'واجهة الإدارة (Admin)' : 'Admin Dashboard'}
              </span>
            </button>

            {/* Language Toggle */}
            <div className="lang-switcher-dropdown">
              <button
                type="button"
                className="lang-btn"
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              >
                <span className="lang-globe-icon">🌐</span>
                <span className="lang-code">{lang === 'en' ? 'EN' : 'العربية'}</span>
                <span className="lang-arrow">▾</span>
              </button>
            </div>

            {/* User Profile Pill */}
            <div className="user-profile-menu-container">
              <button
                type="button"
                className="user-profile-pill"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
              >
                <div className="user-avatar-circle">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'Y'}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{currentUser?.name || (lang === 'ar' ? 'يوسف' : 'Youssef')}</span>
                  <span className="user-email">{currentUser?.email || 'youssef@example.com'}</span>
                </div>
                <span className="user-chevron">▾</span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{currentUser?.name || 'Youssef'}</strong>
                    <span className="role-tag civilian">
                      {lang === 'ar' ? '👤 حساب مستخدم عادي' : '👤 Civilian User'}
                    </span>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigateToAdmin();
                    }}
                  >
                    🛡️ {lang === 'ar' ? 'التبديل إلى لوحة الأدمن' : 'Switch to Admin View'}
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigateToHome();
                    }}
                  >
                    🏠 {lang === 'ar' ? 'الواجهة الخارجية (Landing)' : 'Landing Page'}
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowEmergencyPlanModal(true);
                    }}
                  >
                    🎒 {lang === 'ar' ? 'خطة الطوارئ الشخصية' : 'Emergency Plan'}
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item logout"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    🚪 {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(14, 34, 61, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '12px',
          padding: '10px 18px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🛡️</span>
            <div>
              <strong style={{ color: '#86efac', fontSize: '15px' }}>
                {lang === 'ar' ? 'واجهة المستكشف المدني (Fire sync)' : 'Civilian Safety Explorer (Fire sync)'}
              </strong>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                {lang === 'ar' ? 'معلومات الإنذار المبكر، خريطة الأمان، ومسارات الإخلاء للمواطنين' : 'Early warning alerts, safety radar & evacuation routing for citizens'}
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <nav className="fireguard-nav-links" style={{ margin: 0 }}>
            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <span className="nav-icon">🏠</span>
              <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>
            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'fires' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('fires');
                const el = document.getElementById('map-stage-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="nav-icon">🔥</span>
              <span>{lang === 'ar' ? 'الحرائق القريبة' : 'Nearby Fires'}</span>
            </button>
            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'forecast' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('forecast');
                const el = document.getElementById('forecast-stage-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="nav-icon">📊</span>
              <span>{lang === 'ar' ? 'التوقعات' : 'Forecast'}</span>
            </button>
            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('routes');
                setShowSafeRouteModal(true);
              }}
            >
              <span className="nav-icon">🚸</span>
              <span>{lang === 'ar' ? 'المسارات الآمنة' : 'Safe Routes'}</span>
            </button>
            <button
              type="button"
              className={`nav-pill-item ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('alerts');
                setShowAllAlertsModal(true);
              }}
            >
              <span className="nav-icon">🔔</span>
              <span>{lang === 'ar' ? 'التنبيهات' : 'Alerts'}</span>
              <span className="alerts-badge-count">4</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Container */}
      <main className="fireguard-content-canvas">
        {/* =========================================================================
            2. PANORAMIC HERO BANNER WITH WEATHER & SEARCH
            ========================================================================= */}
        <section
          className="fireguard-hero-card"
          style={{ backgroundImage: `url(${heroBannerImg})` }}
        >
          <div className="hero-dark-vignette" />

          <div className="hero-grid-layout">
            {/* Left Col: Main Headline + Search */}
            <div className="hero-text-block">
              <h1 className="hero-main-title">
                {lang === 'ar' ? 'معاً من أجل مجتمعات أكثر أماناً' : 'Together for Safer Communities'}
              </h1>
              <p className="hero-main-subtitle">
                {lang === 'ar'
                  ? 'رؤى وتحليلات فورية من الأقمار الصناعية لحماية الأرواح، الغابات، وكوكب الأرض.'
                  : 'Real-time satellite insights to protect people, forests and our planet.'}
              </p>

              {/* Location Search Input */}
              <form className="hero-search-wrapper" onSubmit={handleSearchSubmit}>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder={
                    lang === 'ar'
                      ? 'ابحث عن موقع (مدينة، محافظة، إحداثيات)...'
                      : 'Search location (city, region, coordinates)...'
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                />
                <button
                  type="button"
                  className="gps-target-btn"
                  onClick={handleGpsLocate}
                  title={lang === 'ar' ? 'تحديد موقعي الآن عبر GPS' : 'Locate my position'}
                >
                  🎯
                </button>

                {/* Autocomplete Suggestions */}
                {showSearchSuggestions && (
                  <div className="search-suggestions-box">
                    {locationsList.map((loc, idx) => (
                      <div
                        key={idx}
                        className="suggestion-row"
                        onClick={() => {
                          handleSelectLocation(loc);
                          setSearchQuery('');
                          setShowSearchSuggestions(false);
                        }}
                      >
                        <span className="sugg-pin">📍</span>
                        <div className="sugg-details">
                          <strong>{lang === 'ar' ? loc.name.ar : loc.name.en}</strong>
                          <small>{loc.coords}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Right Col: Live Weather Box */}
            <div className="hero-weather-card">
              <div className="weather-header-row">
                <div className="location-pin-title">
                  <span className="pin-icon">📍</span>
                  <div>
                    <strong>{lang === 'ar' ? currentLocation.name.ar : currentLocation.name.en}</strong>
                    <span className="coords-text">{currentLocation.coords}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-change-location"
                  onClick={() => setShowLocationModal(true)}
                >
                  {lang === 'ar' ? 'تغيير' : 'Change'}
                </button>
              </div>

              <div className="weather-middle-row">
                <div className="temp-big-display">
                  <span className="sun-icon">☀️</span>
                  <span className="temp-digits">{currentLocation.temp}</span>
                  <span className="weather-desc">
                    {lang === 'ar' ? currentLocation.weather.ar : currentLocation.weather.en}
                  </span>
                </div>
              </div>

              <div className="weather-stats-row">
                <div className="stat-unit">
                  <span className="stat-icon">💨</span>
                  <span className="stat-label">{lang === 'ar' ? 'الرياح:' : 'Wind:'}</span>
                  <strong>{currentLocation.wind}</strong>
                </div>
                <div className="stat-unit">
                  <span className="stat-icon">💧</span>
                  <span className="stat-label">{lang === 'ar' ? 'الرطوبة:' : 'Humidity:'}</span>
                  <strong>{currentLocation.humidity}</strong>
                </div>
                <div className="stat-unit">
                  <span className="stat-icon">🔥</span>
                  <span className="stat-label">{lang === 'ar' ? 'مؤشر الجفاف:' : 'Drought Index:'}</span>
                  <span className="drought-badge high">
                    {lang === 'ar' ? currentLocation.drought.ar : currentLocation.drought.en}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. TOP 5 KPI CARDS ROW
            ========================================================================= */}
        <section className="fireguard-kpi-grid">
          {/* 1. Fire Risk Today */}
          <div
            className="kpi-card risk-card"
            onClick={() => triggerToast(lang === 'ar' ? 'مؤشر الخطر 75% بناء على جفاف التربة وسرعة الرياح' : 'Fire risk 75% calculated from soil moisture & wind')}
          >
            <div className="kpi-card-header">
              <div className="kpi-icon-circle red-glow">🔥</div>
              <div className="kpi-title-meta">
                <span className="kpi-label">{lang === 'ar' ? 'خطر الحرائق اليوم' : 'Fire Risk Today'}</span>
                <span className="kpi-value-bold red-text">{lang === 'ar' ? 'مرتفع' : 'High'}</span>
              </div>
              {/* Circular 75% Progress Ring */}
              <div className="circular-progress-wrapper">
                <svg width="56" height="56" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="#ff4d2d"
                    strokeWidth="4"
                    strokeDasharray="113.1"
                    strokeDashoffset="28.2"
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                  />
                  <text x="22" y="26" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">75%</text>
                </svg>
              </div>
            </div>
            <p className="kpi-subtext">
              {lang === 'ar' ? 'احتمالية نشاط حرائق أعلى في منطقتك.' : 'Higher chance of fire activity in your area.'}
            </p>
          </div>

          {/* 2. Air Quality */}
          <div
            className="kpi-card air-card"
            onClick={() => triggerToast(lang === 'ar' ? 'مؤشر جودة الهواء AQI 68: مقبول ولكن يفضل تقليل الأنشطة الشاقة' : 'Air Quality AQI 68: Acceptable for most civilians')}
          >
            <div className="kpi-card-header">
              <div className="kpi-icon-circle cyan-glow">💨</div>
              <div className="kpi-title-meta">
                <span className="kpi-label">{lang === 'ar' ? 'جودة الهواء' : 'Air Quality'}</span>
                <div className="kpi-val-badge-row">
                  <span className="kpi-value-bold">{lang === 'ar' ? 'معتدل' : 'Moderate'}</span>
                  <span className="kpi-mini-pill yellow">AQI 68</span>
                </div>
              </div>
            </div>
            <p className="kpi-subtext">
              {lang === 'ar'
                ? 'جودة الهواء مقبولة ولكن يُنصح أصحاب الحساسية بتجنب الإجهاد في الهواء الطلق.'
                : 'Air quality is acceptable but sensitive people should limit outdoor activities.'}
            </p>
          </div>

          {/* 3. Current Status */}
          <div
            className="kpi-card status-card"
            onClick={() => triggerToast(lang === 'ar' ? 'حالتك آمنة: لا توجد أوامر إخلاء حالياً في محيط 15 كم' : 'Status Safe: No evacuation orders in 15 km')}
          >
            <div className="kpi-card-header">
              <div className="kpi-icon-circle green-glow">🛡️</div>
              <div className="kpi-title-meta">
                <span className="kpi-label">{lang === 'ar' ? 'الوضع الحالي' : 'Current Status'}</span>
                <span className="kpi-value-bold green-text">
                  {lang === 'ar' ? 'لا يوجد إخلاء فوري' : 'No Immediate Evacuation'}
                </span>
              </div>
            </div>
            <p className="kpi-subtext">
              {lang === 'ar' ? 'منطقتك آمنة حالياً ومسارات الطوارئ سالكة.' : 'Your area is currently safe.'}
            </p>
          </div>

          {/* 4. Nearby Active Fires */}
          <div
            className="kpi-card fires-kpi-card"
            onClick={() => {
              const el = document.getElementById('map-stage-anchor');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="kpi-card-header">
              <div className="kpi-icon-circle red-bars-glow">📊</div>
              <div className="kpi-title-meta">
                <span className="kpi-label">{lang === 'ar' ? 'حرائق نشطة قريبة' : 'Nearby Active Fires'}</span>
                <span className="kpi-value-huge">
                  12 <span className="sub-unit">{lang === 'ar' ? 'خلال 100 كم' : 'Within 100 km'}</span>
                </span>
              </div>
              {/* Mini Sparkline Bar Chart */}
              <div className="kpi-mini-bars">
                <span style={{ height: '30%' }} />
                <span style={{ height: '55%' }} />
                <span style={{ height: '40%' }} />
                <span style={{ height: '80%' }} />
                <span style={{ height: '65%' }} />
                <span style={{ height: '95%' }} />
                <span style={{ height: '70%' }} />
              </div>
            </div>
          </div>

          {/* 5. Stay Aware Stay Prepared Video Card */}
          <div
            className="kpi-card stay-prepared-card"
            style={{ backgroundImage: `url(${stayAwareImg})` }}
            onClick={() => setShowVideoModal(true)}
          >
            <div className="prepared-overlay" />
            <div className="prepared-content">
              <div className="prepared-text">
                <span className="p-title-1">{lang === 'ar' ? 'ابقَ يقظاً' : 'Stay Aware'}</span>
                <span className="p-title-2">{lang === 'ar' ? 'كن مستعداً' : 'Stay Prepared'}</span>
              </div>
              <button
                type="button"
                className="prepared-play-btn"
                aria-label="Play safety briefing video"
              >
                ▶
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. MIDDLE SECTION: MAP LAYERS (LEFT) | MAP (CENTER) | NEARBY ALERTS (RIGHT)
            ========================================================================= */}
        <section id="map-stage-anchor" className="fireguard-middle-grid">
          {/* LEFT: Map Layers Panel */}
          <aside className="panel-card map-layers-sidebar">
            <div className="panel-header">
              <span className="panel-header-icon">🗺️</span>
              <h2 className="panel-title">{lang === 'ar' ? 'طبقات الخريطة' : 'Map Layers'}</h2>
            </div>

            <div className="layers-list">
              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.activeFires}
                  onChange={(e) => setLayers({ ...layers, activeFires: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">🔥</span>
                <span className="layer-name">{lang === 'ar' ? 'الحرائق النشطة (NASA)' : 'Active Fires (NASA)'}</span>
              </label>

              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.riskForecast}
                  onChange={(e) => setLayers({ ...layers, riskForecast: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">🔥</span>
                <span className="layer-name">{lang === 'ar' ? 'توقعات مخاطر الحريق' : 'Fire Risk Forecast'}</span>
              </label>

              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.smokeModis}
                  onChange={(e) => setLayers({ ...layers, smokeModis: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">💨</span>
                <span className="layer-name">{lang === 'ar' ? 'انبعاثات الدخان (MODIS)' : 'Smoke (MODIS)'}</span>
              </label>

              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.airQuality}
                  onChange={(e) => setLayers({ ...layers, airQuality: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">🫧</span>
                <span className="layer-name">{lang === 'ar' ? 'مؤشر جودة الهواء (AQI)' : 'Air Quality (AQI)'}</span>
              </label>

              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.windDirection}
                  onChange={(e) => setLayers({ ...layers, windDirection: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">🧭</span>
                <span className="layer-name">{lang === 'ar' ? 'اتجاه الرياح' : 'Wind Direction'}</span>
              </label>

              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.vegetation}
                  onChange={(e) => setLayers({ ...layers, vegetation: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">🌲</span>
                <span className="layer-name">{lang === 'ar' ? 'الغطاء النباتي' : 'Vegetation'}</span>
              </label>

              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.population}
                  onChange={(e) => setLayers({ ...layers, population: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">👥</span>
                <span className="layer-name">{lang === 'ar' ? 'الكثافة السكانية' : 'Population'}</span>
              </label>

              <label className="layer-checkbox-item">
                <input
                  type="checkbox"
                  checked={layers.protectedAreas}
                  onChange={(e) => setLayers({ ...layers, protectedAreas: e.target.checked })}
                />
                <span className="layer-custom-box" />
                <span className="layer-emoji">🏛️</span>
                <span className="layer-name">{lang === 'ar' ? 'المحميات الطبيعية' : 'Protected Areas'}</span>
              </label>
            </div>
          </aside>

          {/* CENTER: Interactive Real Satellite Earth Map */}
          <div className="panel-card interactive-map-center">
            <RealEarthMap
              lang={lang}
              mapMode={mapMode}
              setMapMode={setMapMode}
              layers={layers}
              onSelectHotspot={(h) => {
                const found = hotspots.find(item => item.id === h.id);
                if (found) setSelectedHotspot(found);
              }}
              onOpenSafeRoute={() => setShowSafeRouteModal(true)}
            />
          </div>

          {/* RIGHT: Nearby Alerts Panel */}
          <aside className="panel-card nearby-alerts-panel">
            <div className="panel-header">
              <h2 className="panel-title">{lang === 'ar' ? 'التنبيهات القريبة' : 'Nearby Alerts'}</h2>
              <button
                type="button"
                className="btn-view-all"
                onClick={() => setShowAllAlertsModal(true)}
              >
                {lang === 'ar' ? 'عرض الكل ←' : 'View All →'}
              </button>
            </div>

            <div className="alerts-card-list">
              {alertsData.map((alert) => (
                <div
                  key={alert.id}
                  className="alert-item-card"
                  onClick={() => setShowAlertDetailsModal(alert)}
                >
                  <div className="alert-thumb-wrap">
                    <img src={alert.img} alt={alert.title.en} className="alert-thumb-img" />
                  </div>

                  <div className="alert-info-col">
                    <div className="alert-title-row">
                      <strong className="alert-title-text">{lang === 'ar' ? alert.title.ar : alert.title.en}</strong>
                      <span className={`alert-risk-badge ${alert.badge.level}`}>
                        {lang === 'ar' ? alert.badge.ar : alert.badge.en}
                      </span>
                    </div>

                    <div className="alert-location-time">
                      <span>{lang === 'ar' ? alert.location.ar : alert.location.en}</span>
                      <span className="bullet-sep">•</span>
                      <span>{lang === 'ar' ? alert.time.ar : alert.time.en}</span>
                    </div>
                  </div>

                  <div className="alert-dist-chevron">
                    <span className="dist-num">{alert.distance}</span>
                    <span className="chevron-arrow">›</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* =========================================================================
            5. BOTTOM SECTION: 3 PANELS (FORECAST | RECOMMENDED ACTIONS | SAFE ROUTE)
            ========================================================================= */}
        <section id="forecast-stage-anchor" className="fireguard-bottom-grid">
          {/* Panel 1: Fire Risk Forecast */}
          <div className="panel-card forecast-panel">
            <div className="panel-header">
              <h3 className="panel-title">{lang === 'ar' ? 'توقعات مخاطر الحرائق' : 'Fire Risk Forecast'}</h3>
              <button
                type="button"
                className="btn-view-all"
                onClick={() => triggerToast(lang === 'ar' ? 'توقعات الأسبوع القادم: انخفاض تدريجي لمؤشر الحرائق' : 'Forecast shows declining fire risk next week')}
              >
                {lang === 'ar' ? 'الـ 7 أيام القادمة ›' : 'Next 7 Days ›'}
              </button>
            </div>

            <div className="forecast-days-strip">
              {forecastDays.map((d, index) => (
                <div
                  key={index}
                  className={`forecast-day-card ${selectedForecastDay === index ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedForecastDay(index);
                    triggerToast(
                      lang === 'ar'
                        ? `توقعات ${d.day.ar} (${d.date}): خطر ${d.risk.ar} بنسبة ${d.percent}%`
                        : `${d.day.en} (${d.date}): ${d.risk.en} Risk (${d.percent}%)`
                    );
                  }}
                >
                  <span className="f-day-name">{lang === 'ar' ? d.day.ar : d.day.en}</span>
                  <span className="f-date">{d.date}</span>
                  <span className="f-icon">{d.icon}</span>
                  <span className={`f-risk-text ${d.level}`}>{lang === 'ar' ? d.risk.ar : d.risk.en}</span>
                  <span className="f-percent">{d.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Recommended Actions */}
          <div className="panel-card actions-panel">
            <div className="panel-header">
              <h3 className="panel-title">{lang === 'ar' ? 'الإجراءات الموصى بها' : 'Recommended Actions'}</h3>
            </div>

            <div className="actions-list">
              <button
                type="button"
                className="action-list-item"
                onClick={() => setShowAllAlertsModal(true)}
              >
                <div className="action-icon-circle green">👥</div>
                <span className="action-text">
                  {lang === 'ar' ? 'ابقَ على اطلاع بأحدث التنبيهات المباشرة' : 'Stay informed about the latest alerts'}
                </span>
                <span className="action-chevron">›</span>
              </button>

              <button
                type="button"
                className="action-list-item"
                onClick={() => {
                  const el = document.getElementById('map-stage-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  triggerToast(lang === 'ar' ? 'تم تحديد المناطق المعرضة للخطر بالأحمر' : 'High-risk danger zones marked on map');
                }}
              >
                <div className="action-icon-circle red">🚫</div>
                <span className="action-text">
                  {lang === 'ar' ? 'تجنب المناطق المعرضة لخطر نشاط النيران' : 'Avoid high-risk areas'}
                </span>
                <span className="action-chevron">›</span>
              </button>

              <button
                type="button"
                className="action-list-item"
                onClick={() => setShowSafeRouteModal(true)}
              >
                <div className="action-icon-circle blue">🚸</div>
                <span className="action-text">
                  {lang === 'ar' ? 'استخدم المسارات الآمنة عند السفر أو التنقل' : 'Use safe routes if traveling'}
                </span>
                <span className="action-chevron">›</span>
              </button>

              <button
                type="button"
                className="action-list-item"
                onClick={() => setShowEmergencyPlanModal(true)}
              >
                <div className="action-icon-circle yellow">🎒</div>
                <span className="action-text">
                  {lang === 'ar' ? 'جهّز خطة طوارئ وحقيبة الإخلاء للعائلة' : 'Prepare an emergency plan'}
                </span>
                <span className="action-chevron">›</span>
              </button>

              <button
                type="button"
                className="action-list-item"
                onClick={() => triggerToast(lang === 'ar' ? 'خط طوارئ الحماية المدنية في مصر: 180 (متاح 24 ساعة)' : 'Civil Defense Emergency Hotline: 180 (24/7)')}
              >
                <div className="action-icon-circle cyan">🛡️</div>
                <span className="action-text">
                  {lang === 'ar' ? 'اتبع تعليمات وتحديثات الدفاع المدني والجهات الرسمية' : 'Follow official authorities updates'}
                </span>
                <span className="action-chevron">›</span>
              </button>
            </div>
          </div>

          {/* Panel 3: Safe Route to Safety */}
          <div className="panel-card safe-route-panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">{lang === 'ar' ? 'المسار الآمن للسلامة' : 'Safe Route to Safety'}</h3>
                <span className="panel-sub-label">
                  {lang === 'ar' ? 'اعثر على أضمن طريق للإخلاء من موقعك الحالي' : 'Find the safest route from your location'}
                </span>
              </div>
            </div>

            {/* Map Preview Thumbnail */}
            <div className="route-map-thumbnail-box" onClick={() => setShowSafeRouteModal(true)}>
              <img src={safeRouteImg} alt="Safe Evacuation Route Preview" className="route-bg-img" />
              <div className="route-floating-hud">
                <span className="live-route-tag">
                  {lang === 'ar' ? '🟢 مسار إخلاء سالك (خالٍ من الدخان)' : '🟢 Safe Corridor Clear'}
                </span>
              </div>
            </div>

            {/* Big Green CTA Button */}
            <button
              type="button"
              className="btn-view-safe-route-cta"
              onClick={() => setShowSafeRouteModal(true)}
            >
              <span className="cta-icon">↗</span>
              <span>{lang === 'ar' ? 'عرض تفاصيل المسار الآمن' : 'View Safe Route'}</span>
            </button>
          </div>
        </section>
      </main>

      {/* =========================================================================
          MODALS & DIALOGS
          ========================================================================= */}

      {/* 1. SAFE ROUTE MODAL */}
      {showSafeRouteModal && (
        <div className="user-modal-backdrop" onClick={() => setShowSafeRouteModal(false)}>
          <div className="user-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <button className="user-modal-close" onClick={() => setShowSafeRouteModal(false)}>✕</button>
            <div className="user-modal-header">
              <div className="modal-icon-badge green">🚸</div>
              <div>
                <h3 className="user-modal-title">
                  {lang === 'ar' ? 'مسار الإخلاء الآمن للطوارئ' : 'Emergency Evacuation Route'}
                </h3>
                <p className="user-modal-desc">
                  {lang === 'ar'
                    ? 'مسار تم حسابه بالذكاء الاصطناعي لتفادي بؤر النيران والرياح المحملة بالدخان.'
                    : 'AI-calculated evacuation path avoiding thermal anomalies and downwind smoke plumes.'}
                </p>
              </div>
            </div>

            <div className="modal-route-layout">
              {/* Route Map */}
              <div className="modal-route-map">
                <img src={safeRouteImg} alt="Satellite Safe Route" />
                <div className="route-stat-overlay">
                  <div className="r-stat">
                    <span>{lang === 'ar' ? 'المسافة إلى بر الأمان:' : 'Distance to Safety:'}</span>
                    <strong>14.8 km</strong>
                  </div>
                  <div className="r-stat">
                    <span>{lang === 'ar' ? 'الوقت المقدر:' : 'Estimated Time:'}</span>
                    <strong>19 min</strong>
                  </div>
                  <div className="r-stat">
                    <span>{lang === 'ar' ? 'حالة الطريق:' : 'Corridor Status:'}</span>
                    <strong className="green-text">{lang === 'ar' ? 'آمن وسالك' : 'Clear & Safe'}</strong>
                  </div>
                </div>
              </div>

              {/* Turn by Turn Directions */}
              <div className="modal-route-directions">
                <h4>{lang === 'ar' ? 'خطوات التحرك خطوة بخطوة:' : 'Turn-by-turn Navigation:'}</h4>
                <ol className="directions-list">
                  <li>
                    <strong>{lang === 'ar' ? 'التحرك شرقاً عبر الطريق الدائري' : 'Head east on Ring Road'}</strong>
                    <p>{lang === 'ar' ? 'الابتعاد عن الرياح الشمالية الغربية لمسافة 4.5 كم.' : 'Drive 4.5 km away from NW wind drift.'}</p>
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'سلك محور التسعين الجنوبي' : 'Merge onto South 90th Corridor'}</strong>
                    <p>{lang === 'ar' ? 'ممر آمن مراقب بواسطة دوريات الحماية المدنية.' : 'Designated Civil Defense monitored safe corridor.'}</p>
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'الوصول إلى مركز الإيواء والسلامة #4' : 'Arrive at Emergency Center #4'}</strong>
                    <p>{lang === 'ar' ? 'نقطة تجمع مجهزة بفرق طبية وإسعافات ومياه.' : 'Equipped evacuation shelter with medical triage.'}</p>
                  </li>
                </ol>

                <div className="modal-buttons-row">
                  <button
                    type="button"
                    className="modal-btn-action call"
                    onClick={() => triggerToast(lang === 'ar' ? 'جاري الاتصال بالطوارئ 180...' : 'Dialing Emergency Hotline 180...')}
                  >
                    📞 {lang === 'ar' ? 'اتصال بالطوارئ (180)' : 'Emergency Call (180)'}
                  </button>
                  <button
                    type="button"
                    className="modal-btn-action share"
                    onClick={() => triggerToast(lang === 'ar' ? 'تم نسخ رابط المسار الآمن وإحداثياتك للمشاركة مع العائلة' : 'Safe route link & coordinates copied!')}
                  >
                    🔗 {lang === 'ar' ? 'مشاركة موقعي مع العائلة' : 'Share Location with Family'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ALERT DETAILS MODAL */}
      {showAlertDetailsModal && (
        <div className="user-modal-backdrop" onClick={() => setShowAlertDetailsModal(null)}>
          <div className="user-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="user-modal-close" onClick={() => setShowAlertDetailsModal(null)}>✕</button>
            <div className="user-modal-header">
              <span className={`modal-icon-badge ${showAlertDetailsModal.badge.level}`}>🔥</span>
              <div>
                <div className="modal-title-badge-row">
                  <h3 className="user-modal-title">
                    {lang === 'ar' ? showAlertDetailsModal.title.ar : showAlertDetailsModal.title.en}
                  </h3>
                  <span className={`alert-risk-badge ${showAlertDetailsModal.badge.level}`}>
                    {lang === 'ar' ? showAlertDetailsModal.badge.ar : showAlertDetailsModal.badge.en}
                  </span>
                </div>
                <p className="user-modal-desc">
                  {lang === 'ar' ? showAlertDetailsModal.location.ar : showAlertDetailsModal.location.en} • {lang === 'ar' ? showAlertDetailsModal.time.ar : showAlertDetailsModal.time.en}
                </p>
              </div>
            </div>

            <div className="alert-modal-photo">
              <img src={showAlertDetailsModal.img} alt={showAlertDetailsModal.title.en} />
            </div>

            <p className="alert-modal-body-text">
              {lang === 'ar' ? showAlertDetailsModal.description.ar : showAlertDetailsModal.description.en}
            </p>

            <div className="alert-modal-meta-grid">
              <div className="meta-box">
                <span>{lang === 'ar' ? 'الإحداثيات:' : 'Coordinates:'}</span>
                <strong>{showAlertDetailsModal.coordinates}</strong>
              </div>
              <div className="meta-box">
                <span>{lang === 'ar' ? 'المسافة من موقعك:' : 'Distance:'}</span>
                <strong>{showAlertDetailsModal.distance}</strong>
              </div>
              <div className="meta-box">
                <span>{lang === 'ar' ? 'شدة الطاقة الحرارية:' : 'Radiative Power:'}</span>
                <strong>{showAlertDetailsModal.frp}</strong>
              </div>
            </div>

            <div className="modal-buttons-row">
              <button
                type="button"
                className="modal-btn-action primary"
                onClick={() => {
                  setShowAlertDetailsModal(null);
                  setShowSafeRouteModal(true);
                }}
              >
                🚸 {lang === 'ar' ? 'تخطيط مسار آمن للابتعاد' : 'Plan Safe Detour'}
              </button>
              <button
                type="button"
                className="modal-btn-action secondary"
                onClick={() => setShowAlertDetailsModal(null)}
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STAY AWARE STAY PREPARED VIDEO MODAL */}
      {showVideoModal && (
        <div className="user-modal-backdrop" onClick={() => setShowVideoModal(false)}>
          <div className="user-modal-card video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="user-modal-close" onClick={() => setShowVideoModal(false)}>✕</button>
            <div className="user-modal-header">
              <div className="modal-icon-badge red">🎥</div>
              <div>
                <h3 className="user-modal-title">
                  {lang === 'ar' ? 'دليل الحماية والسلامة من حرائق الغابات' : 'Wildfire Preparedness Video Briefing'}
                </h3>
                <p className="user-modal-desc">
                  {lang === 'ar' ? 'إرشادات الدفاع المدني وناسا للتعامل مع حالات الطوارئ والدخان' : 'NASA & Civil Protection community safety guidelines'}
                </p>
              </div>
            </div>

            {/* Video Player */}
            <div className="modal-video-wrapper">
              <video
                controls
                autoPlay
                playsInline
                className="modal-video-element"
              >
                <source src={videoSrc} type="video/mp4" />
                <source src="/video1.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Guidelines Checklist */}
            <div className="video-modal-tips">
              <h4>{lang === 'ar' ? 'قواعد السلامة الأساسية:' : 'Essential Safety Rules:'}</h4>
              <ul className="safety-bullets">
                <li>{lang === 'ar' ? 'إغلاق جميع النوافذ ومصادر التهوية لمنع تسرب الدخان والرماد.' : 'Close all windows and vents to prevent smoke infiltration.'}</li>
                <li>{lang === 'ar' ? 'ارتداء كمامات N95 عند الخروج لحماية الجهاز التنفسي من الجسيمات الدقيقة.' : 'Wear N95 masks when outside to filter micro-particles.'}</li>
                <li>{lang === 'ar' ? 'الاحتفاظ بمصدر إضاءة يدوي وهاتف مشحون بكامل طاقته.' : 'Keep flashlights ready and phones fully charged.'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. LOCATION PICKER MODAL */}
      {showLocationModal && (
        <div className="user-modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="user-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="user-modal-close" onClick={() => setShowLocationModal(false)}>✕</button>
            <div className="user-modal-header">
              <div className="modal-icon-badge blue">📍</div>
              <div>
                <h3 className="user-modal-title">{lang === 'ar' ? 'تحديد وتغيير الموقع' : 'Change Location'}</h3>
                <p className="user-modal-desc">
                  {lang === 'ar' ? 'اختر المدينة أو المنطقة لمتابعة بيانات الحرخريطة والطقس' : 'Select a region to monitor local fire risk and weather'}
                </p>
              </div>
            </div>

            <div className="locations-picker-list">
              {locationsList.map((loc, idx) => (
                <div
                  key={idx}
                  className={`location-pick-row ${currentLocation.name.en === loc.name.en ? 'active' : ''}`}
                  onClick={() => handleSelectLocation(loc)}
                >
                  <div className="loc-pick-info">
                    <strong>{lang === 'ar' ? loc.name.ar : loc.name.en}</strong>
                    <small>{loc.coords} • {loc.temp} • {lang === 'ar' ? loc.weather.ar : loc.weather.en}</small>
                  </div>
                  <div className="loc-pick-drought">
                    <span className={`drought-badge ${loc.drought.en.toLowerCase()}`}>
                      {lang === 'ar' ? loc.drought.ar : loc.drought.en}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. EMERGENCY PLAN MODAL */}
      {showEmergencyPlanModal && (
        <div className="user-modal-backdrop" onClick={() => setShowEmergencyPlanModal(false)}>
          <div className="user-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="user-modal-close" onClick={() => setShowEmergencyPlanModal(false)}>✕</button>
            <div className="user-modal-header">
              <div className="modal-icon-badge yellow">🎒</div>
              <div>
                <h3 className="user-modal-title">{lang === 'ar' ? 'حقيبة وخطة طوارئ الأسرة' : 'Family Emergency Go-Bag Checklist'}</h3>
                <p className="user-modal-desc">
                  {lang === 'ar' ? 'قائمة تفقدية لضمان جاهزيتك خلال 15 دقيقة عند صدور إنذار إخلاء' : '15-minute rapid evacuation checklist for your household'}
                </p>
              </div>
            </div>

            <div className="emergency-checklist">
              <label className="check-item">
                <input type="checkbox" defaultChecked />
                <span>{lang === 'ar' ? 'أوراق الهوية والمستندات الثبوتية في حقيبة مقاومة للماء' : 'ID cards, birth certificates & passports in waterproof bag'}</span>
              </label>
              <label className="check-item">
                <input type="checkbox" defaultChecked />
                <span>{lang === 'ar' ? 'مياه صالحة للشرب تكفي لـ 3 أيام (3 لتر لكل فرد يومياً)' : 'Drinking water supply for 3 days (3L per person/day)'}</span>
              </label>
              <label className="check-item">
                <input type="checkbox" defaultChecked />
                <span>{lang === 'ar' ? 'أدوية دورية ضرورية وإسعافات أولية' : 'Prescription medications & basic first aid kit'}</span>
              </label>
              <label className="check-item">
                <input type="checkbox" />
                <span>{lang === 'ar' ? 'شواحن وبطاريات متنقلة (Powerbanks)' : 'Portable powerbanks and charging cables'}</span>
              </label>
              <label className="check-item">
                <input type="checkbox" />
                <span>{lang === 'ar' ? 'كمامات N95 ونظارات واقية من الدخان' : 'N95 respirator masks and protective goggles'}</span>
              </label>
            </div>

            <button
              type="button"
              className="modal-btn-action primary"
              style={{ marginTop: '20px' }}
              onClick={() => {
                setShowEmergencyPlanModal(false);
                triggerToast(lang === 'ar' ? 'تم حفظ ومزامنة خطة الطوارئ بنجاح!' : 'Emergency checklist saved successfully!');
              }}
            >
              ✓ {lang === 'ar' ? 'تم التأكيد والحفظ' : 'Confirm & Save Plan'}
            </button>
          </div>
        </div>
      )}

      {/* 6. ALL ALERTS MODAL */}
      {showAllAlertsModal && (
        <div className="user-modal-backdrop" onClick={() => setShowAllAlertsModal(false)}>
          <div className="user-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <button className="user-modal-close" onClick={() => setShowAllAlertsModal(false)}>✕</button>
            <div className="user-modal-header">
              <div className="modal-icon-badge red">🔔</div>
              <div>
                <h3 className="user-modal-title">{lang === 'ar' ? 'مركز التنبيهات والأخطار' : 'Wildfire Alerts Dispatch'}</h3>
                <p className="user-modal-desc">
                  {lang === 'ar' ? 'سجل البلاغات والإنذارات الصادرة من الأقمار الصناعية والحماية المدنية' : 'Complete feed of satellite-derived thermal warnings'}
                </p>
              </div>
            </div>

            <div className="all-alerts-scrollable">
              {alertsData.map((alert) => (
                <div
                  key={alert.id}
                  className="all-alert-row"
                  onClick={() => {
                    setShowAllAlertsModal(false);
                    setShowAlertDetailsModal(alert);
                  }}
                >
                  <img src={alert.img} alt={alert.title.en} className="row-thumb" />
                  <div className="row-info">
                    <div className="row-title">
                      <strong>{lang === 'ar' ? alert.title.ar : alert.title.en}</strong>
                      <span className={`alert-risk-badge ${alert.badge.level}`}>
                        {lang === 'ar' ? alert.badge.ar : alert.badge.en}
                      </span>
                    </div>
                    <p>{lang === 'ar' ? alert.description.ar : alert.description.en}</p>
                    <small>{lang === 'ar' ? alert.location.ar : alert.location.en} • {alert.distance}</small>
                  </div>
                  <button type="button" className="row-view-btn">
                    {lang === 'ar' ? 'تفاصيل' : 'Details'} ›
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
