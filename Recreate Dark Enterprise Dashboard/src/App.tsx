import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MainMap } from './components/MainMap';
import { ActivityCalendar } from './components/ActivityCalendar';
import { WeatherAndRisk } from './components/WeatherAndRisk';
import { AnomalyChart } from './components/AnomalyChart';
import { LowerGrid } from './components/LowerGrid';
import { FooterGrid } from './components/FooterGrid';
import { Modals } from './components/Modals';
import { OverpassTicker } from './components/OverpassTicker';
import { LowBandwidthView } from './components/LowBandwidthView';
import { ARFireLensModal } from './components/ARFireLensModal';
import { Home } from './pages/Home';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AboutPage } from './pages/AboutPage';
import { UserDashboard } from './pages/UserDashboard';
import { FireDetectionPage } from './pages/FireDetectionPage';
import { AnalysisDashboardPage } from './pages/AnalysisDashboardPage';
import { AuthModal, type UserProfile } from './components/AuthModal';
import { TRANSLATIONS } from './data/wildfireData';
import {
  FireService,
  type Hotspot,
  type LatLngPoint,
} from './services';
import {
  FireDetectionView,
  HistoricalView,
  FireRiskView,
  WeatherView,
  SmokeView,
  GroundTruthView,
  AlertsView,
  RecoveryView,
  InfrastructureView,
  EvacuationView,
  WildlifeView,
  SimulatorView,
  ARViewLayout,
  ReportsView,
  SettingsView,
} from './components/tabs';

export default function App() {
  const [lang, setLangState] = useState<'en' | 'ar'>(() => {
    // Default to English as explicitly requested
    const saved = localStorage.getItem('fire_intel_lang');
    if (!saved || saved === 'ar') {
      localStorage.setItem('fire_intel_lang', 'en');
      return 'en';
    }
    return saved as 'en' | 'ar';
  });

  const setLang = (l: 'en' | 'ar') => {
    localStorage.setItem('fire_intel_lang', l);
    setLangState(l);
  };

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      // Use sessionStorage so fresh visits start on the clean landing page
      const sessionSaved = sessionStorage.getItem('fire_intel_user');
      if (sessionSaved) {
        return JSON.parse(sessionSaved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [unauthPage, setUnauthPage] = useState<'home' | 'about' | 'analytics'>('home');

  const handleUserLogin = (user: UserProfile) => {
    sessionStorage.setItem('fire_intel_user', JSON.stringify(user));
    localStorage.setItem('fire_intel_user', JSON.stringify(user));
    setCurrentUser(user);
    setAuthModalOpen(false);
    if (user.role === 'admin') {
      setActiveTab('Dashboard');
    } else {
      setActiveTab('User View');
    }
  };

  const handleUserLogout = () => {
    sessionStorage.removeItem('fire_intel_user');
    localStorage.removeItem('fire_intel_user');
    setCurrentUser(null);
    setUnauthPage('home');
    setActiveTab('Dashboard');
  };

  const handleSetCurrentUser = (u: UserProfile | null) => {
    if (u) {
      handleUserLogin(u);
    } else {
      handleUserLogout();
    }
  };
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [lowBandwidth, setLowBandwidth] = useState<boolean>(false);
  const [colorblindMode, setColorblindMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('tab');
      if (viewParam) {
        if (viewParam === 'historical' || viewParam === 'analysis' || viewParam === 'analysis-dashboard') return 'Historical Analysis';
        if (viewParam === 'fire-detection' || viewParam === 'detection') return 'Fire Detection';
        if (viewParam === 'home') return 'Home';
        if (viewParam === 'user-dashboard' || viewParam === 'user') return 'User View';
        if (viewParam === 'weather') return 'Weather';
        if (viewParam === 'map') return 'Dashboard';
        return viewParam;
      }
    } catch {
      // ignore
    }
    return 'Dashboard';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sidebar controls - Defaults to Brazil with live NASA FIRMS satellite data (or URL param)
  const [selectedRegion, setSelectedRegion] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const regParam = params.get('region');
      if (regParam) {
        if (regParam.toLowerCase() === 'canada' || regParam.toLowerCase() === 'can') return 'Canada';
        if (regParam.toLowerCase() === 'brazil' || regParam.toLowerCase() === 'bra') return 'Brazil';
      }
    } catch {
      // ignore
    }
    return 'Brazil';
  });
  // 11 layers matching original screenshot (first 9 checked by default)
  const [layers, setLayers] = useState<boolean[]>([
    true,  // 0: Active Fires
    true,  // 1: Fire Risk
    true,  // 2: Weather
    true,  // 3: Wind Overlay
    true,  // 4: Smoke
    true,  // 5: Infrastructure
    true,  // 6: Population
    true,  // 7: Protected Habitats
    true,  // 8: Evacuation Routes
    false, // 9: Burn Scar
    false, // 10: Vegetation
  ]);

  const [timeYear, setTimeYear] = useState<number>(2024);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPlayingTime, setIsPlayingTime] = useState<boolean>(false);
  const [modis, setModis] = useState<boolean>(true);
  const [viirs, setViirs] = useState<boolean>(true);
  const [resolutionNorm, setResolutionNorm] = useState<boolean>(true);

  // Spatial polygon filter from Leaflet map drawing
  const [activePolygon, setActivePolygon] = useState<LatLngPoint[] | null>(null);

  // Active fires loaded reactively from FireService
  const [activeFires, setActiveFires] = useState<Hotspot[]>([]);

  // Hotspots
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Target Location for Flying Map directly to real places
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; zoom?: number; name?: string } | null>(null);

  // Modals
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showSituationModal, setShowSituationModal] = useState<boolean>(false);
  const [reportConfig, setReportConfig] = useState({ type: 'Full Analysis', isBilingual: false });
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showEvacModal, setShowEvacModal] = useState<boolean>(false);
  const [showBioModal, setShowBioModal] = useState<boolean>(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showARModal, setShowARModal] = useState<boolean>(false);

  // Citizen Reports
  const [customReports, setCustomReports] = useState<Array<{
    id: string;
    type: 'Confirmed Fire' | 'Possible Fire' | 'False Detection';
    time: string;
    lat: number;
    lon: number;
    notes?: string;
  }>>([]);

  // Time scrubber ticker
  useEffect(() => {
    if (!isPlayingTime) return;
    const interval = setInterval(() => {
      setTimeYear((y) => (y >= 2024 ? 2020 : y + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlayingTime]);

  // Load and filter active fires whenever Region, Spatial Polygon, Year, Sensor, or Date changes
  useEffect(() => {
    const sensors: ('VIIRS' | 'MODIS')[] = [];
    if (viirs) sensors.push('VIIRS');
    if (modis) sensors.push('MODIS');

    FireService.getActiveFires({
      region: selectedRegion,
      polygon: activePolygon || undefined,
      year: timeYear,
      dateDetected: selectedDate || undefined,
      sensors,
      applyResolutionNormalization: resolutionNorm,
    }).then((fires) => {
      setActiveFires(fires);
    });
  }, [selectedRegion, activePolygon, timeYear, selectedDate, viirs, modis, resolutionNorm]);

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    setActivePolygon(null);
    setSelectedDate(null);
    setSelectedHotspot(null);
  };

  const handleAddCitizenReport = (newReport: {
    type: 'Confirmed Fire' | 'Possible Fire' | 'False Detection';
    lat: number;
    lon: number;
    notes: string;
  }) => {
    setCustomReports((prev) => [
      {
        id: `REP-${Date.now()}`,
        type: newReport.type,
        time: lang === 'ar' ? 'الآن' : 'Just now',
        lat: newReport.lat,
        lon: newReport.lon,
        notes: newReport.notes,
      },
      ...prev,
    ]);
  };

  const handleGenerateReport = (type: string, isBilingual: boolean) => {
    setReportConfig({ type, isBilingual });
    setShowSituationModal(true);
  };

  const handleSearchSelect = (locationName: string, lat?: number, lng?: number, zoom?: number) => {
    if (lat !== undefined && lng !== undefined) {
      setTargetLocation({ lat, lng, zoom: zoom || 11, name: locationName });
      const lower = locationName.toLowerCase();
      if (lower.includes('canada') || lower.includes('alberta') || lower.includes('quebec')) {
        handleRegionChange('Canada');
      } else if (lower.includes('california') || lower.includes('chico') || lower.includes('tahoe')) {
        handleRegionChange('California');
      } else {
        handleRegionChange('Brazil');
      }
      return;
    }

    const lower = locationName.toLowerCase();
    if (lower.includes('canada') || lower.includes('كندا')) {
      handleRegionChange('Canada');
    } else if (lower.includes('california')) {
      handleRegionChange('California');
    } else if (lower.includes('global')) {
      handleRegionChange('Global (Beta)');
    } else {
      handleRegionChange('Brazil');
    }
  };

  const t = TRANSLATIONS[lang];

  // -------------------------------------------------------------
  // Public View OR Home / Landing Page:
  // Render clean Home landing page without any enterprise icon bar!
  // The enterprise icon topbar ONLY appears inside dashboard / map views.
  // -------------------------------------------------------------
  if (!currentUser || activeTab === 'Home' || activeTab === 'home' || activeTab === 'About' || activeTab === 'about') {
    if ((!currentUser && unauthPage === 'about') || activeTab === 'About' || activeTab === 'about') {
      return (
        <AboutPage
          hideNavbar={false}
          onNavigate={(page) => {
            if (page === 'home') {
              if (!currentUser) setUnauthPage('home');
              else setActiveTab('Home');
            } else if (page === 'analytics') {
              if (!currentUser) setUnauthPage('analytics');
              else setActiveTab('Historical Analysis');
            } else if (page === 'map') {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab('Dashboard');
              }
            } else if (page === 'fire-detection') {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab('Fire Detection');
              }
            } else if (page === 'user-dashboard') {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab('User View');
              }
            } else {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab(page);
              }
            }
          }}
          lang={lang}
          setLang={setLang}
          currentUser={currentUser}
          setCurrentUser={handleSetCurrentUser}
        />
      );
    }

    if (!currentUser && unauthPage === 'analytics') {
      return (
        <AnalyticsPage
          hideNavbar={false}
          onNavigate={(page) => {
            if (page === 'home') setUnauthPage('home');
            else if (page === 'about') setUnauthPage('about');
            else {
              setAuthMode('login');
              setAuthModalOpen(true);
            }
          }}
          lang={lang}
          setLang={setLang}
          currentUser={null}
          setCurrentUser={handleSetCurrentUser}
        />
      );
    }

    return (
      <div className="home-wrapper" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Home
          hideNavbar={false}
          onNavigate={(page, region) => {
            if (region) handleRegionChange(region);
            if (page === 'home') {
              if (!currentUser) setUnauthPage('home');
              else setActiveTab('Home');
            } else if (page === 'about') {
              if (!currentUser) setUnauthPage('about');
              else setActiveTab('About');
            } else if (page === 'analytics') {
              if (!currentUser) {
                setUnauthPage('analytics');
              } else {
                setActiveTab('Historical Analysis');
              }
            } else if (page === 'map') {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab('Dashboard');
              }
            } else if (page === 'fire-detection') {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab('Fire Detection');
              }
            } else if (page === 'user-dashboard') {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab('User View');
              }
            } else {
              if (!currentUser) {
                setAuthMode('login');
                setAuthModalOpen(true);
              } else {
                setActiveTab(page);
              }
            }
          }}
          lang={lang}
          setLang={setLang}
          currentUser={currentUser}
          setCurrentUser={handleSetCurrentUser}
        />

        {/* Global Auth Modal for landing page */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleUserLogin}
          lang={lang}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // Dedicated Civilian User Experience
  // When logged in as User, DO NOT render the enterprise admin bar or satellite overpass countdown ticker!
  // -------------------------------------------------------------
  if (currentUser?.role === 'user' || activeTab === 'User View' || activeTab === 'user-dashboard') {
    return (
      <div className="w-full min-h-screen bg-slate-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <UserDashboard
          hideNavbar={false}
          lang={lang}
          setLang={setLang}
          currentUser={currentUser}
          onNavigateToAdmin={() => {
            const adminUser: UserProfile = {
              name: lang === 'ar' ? 'مسؤول المنظومة' : 'System Admin',
              phone: 'NASA-ADMIN-01',
              email: 'admin@nasa-firesync.gov',
              workplaceId: 'NASA-HQ-01',
              role: 'admin',
            };
            setCurrentUser(adminUser);
            localStorage.setItem('fire_intel_user', JSON.stringify(adminUser));
            sessionStorage.setItem('fire_intel_user', JSON.stringify(adminUser));
            setActiveTab('Dashboard');
          }}
          onNavigateToHome={() => {
            setActiveTab('Home');
            setUnauthPage('home');
          }}
          onLogout={handleUserLogout}
        />

        {/* Global Auth Modal if opened from User View */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleUserLogin}
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div
      className={`app-shell ${lang === 'ar' ? 'rtl-dir' : 'ltr-dir'} ${emergencyMode ? 'crisis-active' : ''} ${colorblindMode ? 'colorblind-mode' : ''}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Emergency Mode Banner */}
      {emergencyMode && (
        <div className="emergency-alert-banner">
          <div className="banner-pulse">🚨</div>
          <div className="banner-text">
            <strong>{t.emergencyActive}:</strong>{' '}
            {selectedRegion === 'California'
              ? (lang === 'ar' ? 'تم استدعاء وحدات الاستجابة الجوية وإعلان حالة الطوارئ لقطاعات سييرا وبوت في كاليفورنيا' : 'CAL FIRE aerial firefighting coordination mobilized. Extreme wildfire alert issued for California Sierra sectors.')
              : (lang === 'ar' ? 'تم استدعاء وحدات الاستجابة الجوية وإعلان حالة التأهب القصوى للقطاعات 4 و7 في اليونان وصقلية' : 'Aerial firefighting coordination mobilized. Extreme wildfire alert issued for Mediterranean sectors 4 & 7.')
            }
          </div>
          <button className="banner-dismiss" onClick={() => setEmergencyMode(false)}>✕</button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        selectedRegion={selectedRegion}
        onSelectRegion={handleRegionChange}
        emergencyMode={emergencyMode}
        setEmergencyMode={setEmergencyMode}
        lowBandwidth={lowBandwidth}
        setLowBandwidth={setLowBandwidth}
        colorblindMode={colorblindMode}
        setColorblindMode={setColorblindMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSelect={handleSearchSelect}
        unreadAlerts={3}
        setShowNotifications={setShowNotifications}
        setShowReportModal={setShowReportModal}
        setShowExportModal={setShowExportModal}
        setShowBroadcastModal={setShowBroadcastModal}
        setShowARModal={setShowARModal}
        setShowSituationModal={setShowSituationModal}
        onGoToLanding={() => setActiveTab('Home')}
        onNavigateToUser={() => setActiveTab('User View')}
        onNavigateToFireDetection={() => setActiveTab('Fire Detection')}
        onNavigateToAnalysisDashboard={() => setActiveTab('Historical Analysis')}
        currentUser={currentUser}
        onOpenAuth={(m) => {
          setAuthMode(m);
          setAuthModalOpen(true);
        }}
        onLogout={handleUserLogout}
      />

      {/* Satellite Overpass Schedule Bar */}
      <OverpassTicker lang={lang} selectedRegion={selectedRegion} />

      {/* If Low Bandwidth Mode is active, show the specialized field terminal view */}
      {lowBandwidth ? (
        <LowBandwidthView
          lang={lang}
          selectedRegion={selectedRegion}
          onExit={() => setLowBandwidth(false)}
          emergencyMode={emergencyMode}
        />
      ) : (
        /* Standard High-Fidelity Enterprise Workspace */
        <main className={`body ${activeTab !== 'Dashboard' ? 'no-sidebar' : ''}`}>
          {/* Left Sidebar (Only visible on Dashboard tab) */}
          {activeTab === 'Dashboard' && (
            <Sidebar
              lang={lang}
              selectedRegion={selectedRegion}
              setSelectedRegion={handleRegionChange}
              layers={layers}
              setLayers={setLayers}
              timeYear={timeYear}
              setTimeYear={setTimeYear}
              isPlayingTime={isPlayingTime}
              setIsPlayingTime={setIsPlayingTime}
              modis={modis}
              setModis={setModis}
              viirs={viirs}
              setViirs={setViirs}
              resolutionNorm={resolutionNorm}
              setResolutionNorm={setResolutionNorm}
            />
          )}

          {/* Right Workspace Grid */}
          <div className="workspace">
            {(activeTab === 'Dashboard' || !activeTab) && (
              <>
                {/* Top Grid: Main Map, Activity Calendar, Live Weather & Risk, Anomaly Chart & KPIs */}
                <div className="top-grid">
                  <MainMap
                    lang={lang}
                    selectedRegion={selectedRegion}
                    onSelectRegion={handleRegionChange}
                    layers={layers}
                    selectedYear={timeYear}
                    selectedDate={selectedDate}
                    activePolygon={activePolygon}
                    onPolygonChange={setActivePolygon}
                    selectedHotspot={selectedHotspot}
                    setSelectedHotspot={setSelectedHotspot}
                    colorblindMode={colorblindMode}
                    lowBandwidth={lowBandwidth}
                    modis={modis}
                    viirs={viirs}
                    resolutionNorm={resolutionNorm}
                    targetLocation={targetLocation}
                  />

                  <ActivityCalendar
                    lang={lang}
                    selectedRegion={selectedRegion}
                    selectedYear={timeYear}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onPlaySonification={() => {
                      const audioBtn = document.querySelector('.audio-panel .round') as HTMLButtonElement | null;
                      audioBtn?.click();
                    }}
                  />

                  <WeatherAndRisk
                    lang={lang}
                    selectedRegion={selectedRegion}
                    activeFiresCount={activeFires.length}
                  />

                  <AnomalyChart
                    lang={lang}
                    selectedRegion={selectedRegion}
                    selectedYear={timeYear}
                    activeFires={activeFires}
                    isPolygonActive={Boolean(activePolygon && activePolygon.length >= 3)}
                  />
                </div>

                {/* Lower Grid: 5 Panels (Smoke, Ground Truth, Infra, Evacuation, Recovery) */}
                <LowerGrid
                  lang={lang}
                  selectedRegion={selectedRegion}
                  onOpenReportModal={() => setShowReportModal(true)}
                  onOpenEvacRouteDetails={() => setShowEvacModal(true)}
                  onNavigateToTab={setActiveTab}
                  customReports={customReports}
                />

                {/* Footer Grid: 5 Panels (Time Machine, Simulator, Sonification, Biodiversity, Situation Report) */}
                <FooterGrid
                  lang={lang}
                  selectedRegion={selectedRegion}
                  onGenerateReport={handleGenerateReport}
                  onOpenBiodiversityModal={() => setShowBioModal(true)}
                />
              </>
            )}

            {activeTab === 'Fire Detection' && (
              <FireDetectionView
                lang={lang}
                selectedRegion={selectedRegion}
                onSelectHotspot={(h) => setSelectedHotspot(h)}
                onOpenMapWithHotspot={(lat, lon) => {
                  setTargetLocation({ lat, lng: lon, zoom: 12 });
                  setActiveTab('Dashboard');
                }}
              />
            )}

            {activeTab === 'Historical Analysis' && (
              <HistoricalView
                lang={lang}
                selectedRegion={selectedRegion}
                selectedYear={timeYear}
                onSelectYear={(y) => setTimeYear(y)}
              />
            )}

            {activeTab === 'Fire Risk' && (
              <FireRiskView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {(activeTab === 'Weather' || activeTab === 'weather') && (
              <WeatherView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Smoke & Air Quality' && (
              <SmokeView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Ground Truth' && (
              <GroundTruthView
                lang={lang}
                selectedRegion={selectedRegion}
                onOpenReportModal={() => setShowReportModal(true)}
              />
            )}

            {activeTab === 'Alerts' && (
              <AlertsView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Recovery' && (
              <RecoveryView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Infrastructure' && (
              <InfrastructureView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Evacuation' && (
              <EvacuationView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Wildlife' && (
              <WildlifeView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Simulator' && (
              <SimulatorView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'AR View' && (
              <ARViewLayout
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Reports' && (
              <ReportsView
                lang={lang}
                selectedRegion={selectedRegion}
              />
            )}

            {activeTab === 'Settings' && (
              <SettingsView
                lang={lang}
                setLang={setLang}
                selectedRegion={selectedRegion}
                lowBandwidth={lowBandwidth}
                setLowBandwidth={setLowBandwidth}
                colorblindMode={colorblindMode}
                setColorblindMode={setColorblindMode}
                modis={modis}
                setModis={setModis}
                viirs={viirs}
                setViirs={setViirs}
                resolutionNorm={resolutionNorm}
                setResolutionNorm={setResolutionNorm}
              />
            )}


            {(activeTab === 'User View' || activeTab === 'user-dashboard') && (
              <div className="w-full h-full overflow-y-auto bg-slate-950">
                <UserDashboard
                  hideNavbar={true}
                  lang={lang}
                  setLang={setLang}
                  currentUser={currentUser}
                  onNavigateToAdmin={() => setActiveTab('Dashboard')}
                  onNavigateToHome={() => setActiveTab('Home')}
                  onLogout={handleUserLogout}
                />
              </div>
            )}

            {(activeTab === 'Analytics' || activeTab === 'analytics') && (
              <div className="w-full h-full overflow-y-auto bg-slate-950">
                <AnalyticsPage
                  hideNavbar={true}
                  onNavigate={(page) => {
                    if (page === 'map') setActiveTab('Dashboard');
                    else if (page === 'fire-detection') setActiveTab('Fire Detection');
                    else if (page === 'analytics') setActiveTab('Historical Analysis');
                    else if (page === 'user-dashboard') setActiveTab('User View');
                    else setActiveTab(page);
                  }}
                  lang={lang}
                  setLang={setLang}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              </div>
            )}

            {(activeTab === 'About' || activeTab === 'about') && (
              <div className="w-full h-full overflow-y-auto bg-slate-950">
                <AboutPage
                  hideNavbar={true}
                  onNavigate={(page) => {
                    if (page === 'map') setActiveTab('Dashboard');
                    else if (page === 'fire-detection') setActiveTab('Fire Detection');
                    else if (page === 'analytics') setActiveTab('Historical Analysis');
                    else if (page === 'user-dashboard') setActiveTab('User View');
                    else setActiveTab(page);
                  }}
                  lang={lang}
                  setLang={setLang}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* AR Fire Lens Modal */}
      {showARModal && (
        <ARFireLensModal
          lang={lang}
          onClose={() => setShowARModal(false)}
        />
      )}

      {/* All Dialogs & Modals */}
      <Modals
        lang={lang}
        selectedRegion={selectedRegion}
        activeFires={activeFires}
        activePolygon={activePolygon}
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        onSubmitCitizenReport={handleAddCitizenReport}
        showSituationModal={showSituationModal}
        setShowSituationModal={setShowSituationModal}
        reportConfig={reportConfig}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showEvacModal={showEvacModal}
        setShowEvacModal={setShowEvacModal}
        showBioModal={showBioModal}
        setShowBioModal={setShowBioModal}
        showBroadcastModal={showBroadcastModal}
        setShowBroadcastModal={setShowBroadcastModal}
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
      />

      {/* Global Auth Modal for Dashboard/Map view */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleUserLogin}
        lang={lang}
      />
    </div>
  );
}
