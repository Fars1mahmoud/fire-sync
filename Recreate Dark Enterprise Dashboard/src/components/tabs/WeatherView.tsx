import React, { useState, useEffect } from 'react';
import { CurrentWeatherCard } from './weather/CurrentWeatherCard';
import { MapRadarViewer } from './weather/MapRadarViewer';
import { ForecastPanel } from './weather/ForecastPanel';
import { MetricChartsRow } from './weather/MetricChartsRow';
import { AlertDetailModal } from './weather/AlertDetailModal';
import { REGIONS } from './weather/weatherData';
import { MetricMode, ForecastDayItem } from './weather/weatherTypes';
import { Radio, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import './weather/WeatherView.css';

interface WeatherViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ lang, selectedRegion }) => {
  // Map selected global region ID to available meteorological sector
  const getMappedRegionKey = (reg: string): string => {
    const r = (reg || '').toLowerCase();
    if (r.includes('brazil') || r.includes('amazon') || r.includes('basin')) return 'basin-central';
    if (r.includes('egypt') || r.includes('nile')) return 'egypt';
    if (r.includes('canada') || r.includes('boreal')) return 'canada';
    if (r.includes('california') || r.includes('sierra')) return 'california';
    if (r.includes('mediterranean') || r.includes('greece') || r.includes('europe')) return 'mediterranean';
    return 'basin-central';
  };

  const [regionKey, setRegionKey] = useState<string>(() => getMappedRegionKey(selectedRegion));
  const [activeMode, setActiveMode] = useState<MetricMode>('temperature');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [activeForecastDay, setActiveForecastDay] = useState<ForecastDayItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync with main navigation selectedRegion prop
  useEffect(() => {
    setRegionKey(getMappedRegionKey(selectedRegion));
  }, [selectedRegion]);

  const currentRegion = REGIONS[regionKey] || REGIONS['basin-central'];
  const isAr = lang === 'ar';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  return (
    <div
      className="weather-operations-container"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Header Control & Status Bar */}
      <div className="weather-header">
        <div className="weather-header-left">
          <div className="weather-icon-badge">
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
          </div>
          <div>
            <h2 className="weather-header-title">
              {isAr ? 'المركز الفلكي ورادار الأرصاد الجوية التكتيكية' : 'Meteorological & Atmospheric Radar Operations'}
              <span className="weather-badge-live">
                <span className="ping-dot" />
                {isAr ? 'رادار مباشر' : 'RADAR LIVE'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40">
                ECMWF & MERRA-2
              </span>
            </h2>
            <p className="weather-header-subtitle">
              <span>{isAr ? currentRegion.nameAr : currentRegion.name}</span>
              <span>·</span>
              <span>{isAr ? `آخر رصد: ${currentRegion.current.updatedAt}` : `Telemetry Feed: ${currentRegion.current.updatedAt}`}</span>
              <span>·</span>
              <span className="text-sky-400 font-mono">10m AGL Winds & 2m Relative Humidity</span>
            </p>
          </div>
        </div>

        <div className="weather-header-actions">
          {/* Sector Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {isAr ? 'القطاع المناخي:' : 'Weather Sector:'}
            </span>
            <select
              value={regionKey}
              onChange={(e) => setRegionKey(e.target.value)}
              className="weather-sector-select"
            >
              {(Object.entries(REGIONS) as [string, typeof REGIONS[string]][]).map(([key, reg]) => (
                <option key={key} value={key}>
                  {isAr ? reg.nameAr : reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Trigger Button */}
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="weather-alert-btn"
            title={isAr ? 'فتح مركز التحذيرات' : 'Open Hazard Center'}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="font-mono tabular-nums">{currentRegion.alertCounts.affectedInfra}</span>
            <span>{isAr ? 'إنذارات' : 'Alerts'}</span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            className="weather-refresh-btn"
            title={isAr ? 'تحديث القياسات' : 'Refresh Telemetry'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: 3 Columns Layout (Current Weather | Radar Map & Particles | 5-Day Forecast) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Column 1: Current Weather Card (Left ~25%) */}
        <div className="lg:col-span-3 h-full min-h-[460px]">
          <CurrentWeatherCard
            currentRegion={currentRegion}
            activeMode={activeMode}
            onSelectMode={setActiveMode}
            language={lang}
            onOpenAlertDetails={() => setIsAlertModalOpen(true)}
          />
        </div>

        {/* Column 2: Center Interactive Radar Map & HUD (~50%) */}
        <div className="lg:col-span-6 h-full min-h-[460px]">
          <MapRadarViewer
            currentRegion={currentRegion}
            activeMode={activeMode}
            onSelectMode={setActiveMode}
            language={lang}
          />
        </div>

        {/* Column 3: Forecast Panel (Right ~25%) */}
        <div className="lg:col-span-3 h-full min-h-[460px]">
          <ForecastPanel
            currentRegion={currentRegion}
            language={lang}
            onSelectDay={(day) => setActiveForecastDay(day)}
            onOpenAlertDetails={() => setIsAlertModalOpen(true)}
          />
        </div>
      </div>

      {/* BOTTOM SECTION: 4 Interactive SVG Spline Metric Charts */}
      <div className="w-full">
        <MetricChartsRow
          currentRegion={currentRegion}
          language={lang}
          activeMode={activeMode}
          onSelectMode={setActiveMode}
        />
      </div>

      {/* Alert Details Modal */}
      <AlertDetailModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        currentRegion={currentRegion}
        language={lang}
      />
    </div>
  );
};
