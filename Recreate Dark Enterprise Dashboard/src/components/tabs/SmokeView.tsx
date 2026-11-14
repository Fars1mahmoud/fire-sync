import React, { useState, useEffect, useCallback } from 'react';
import { FilterTabs } from './smoke/FilterTabs';
import { LayerControls } from './smoke/LayerControls';
import { AirQualityGauge } from './smoke/AirQualityGauge';
import { MainSatelliteMap } from './smoke/MainSatelliteMap';
import { PlumeForecastCard } from './smoke/PlumeForecastCard';
import { AffectedAreasCard } from './smoke/AffectedAreasCard';
import {
  SMOKE_SECTORS,
  LayerState,
  AffectedArea,
  PlumeForecast,
} from './smoke/smokeTypes';
import { SmokeApiService, SmokeLiveTelemetry } from './smoke/smokeApiService';
import { Wind, Radio, RefreshCw, Activity, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import './smoke/SmokeView.css';

interface SmokeViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const SmokeView: React.FC<SmokeViewProps> = ({ lang, selectedRegion }) => {
  const isAr = lang === 'ar';

  // Map selected global region ID to available smoke dispersion sector
  const getMappedSectorKey = (reg: string): string => {
    const r = (reg || '').toLowerCase();
    if (r.includes('brazil') || r.includes('amazon') || r.includes('basin')) return 'basin-central';
    if (r.includes('canada') || r.includes('boreal') || r.includes('alberta')) return 'canada';
    if (r.includes('egypt') || r.includes('nile') || r.includes('cairo')) return 'egypt';
    return 'basin-central';
  };

  const [sectorKey, setSectorKey] = useState<string>(() => getMappedSectorKey(selectedRegion));

  // Sync with main navigation selectedRegion prop
  useEffect(() => {
    const mapped = getMappedSectorKey(selectedRegion);
    setSectorKey(mapped);
  }, [selectedRegion]);

  const currentSector = SMOKE_SECTORS[sectorKey] || SMOKE_SECTORS['basin-central'];

  const [activeTab, setActiveTab] = useState<string>('smoke');
  const [airQualityMetric, setAirQualityMetric] = useState<string>('all');
  const [fireSourceFilter, setFireSourceFilter] = useState<string>('all');

  // Backend Live Telemetry State
  const [backendStatus, setBackendStatus] = useState<boolean>(true);
  const [liveTelemetry, setLiveTelemetry] = useState<SmokeLiveTelemetry | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Layer switches matching design
  const [layers, setLayers] = useState<LayerState>({
    smoke: true,
    aerosol: true,
    aqi: true,
    wind: true,
    fireSources: true,
  });

  const [smokeOpacity, setSmokeOpacity] = useState<number>(0.9);
  const [windSpeed, setWindSpeed] = useState<number>(1.0);

  // Selected forecast (default to 20h)
  const [selectedForecast, setSelectedForecast] = useState<PlumeForecast>(
    () => currentSector.forecasts[1] || currentSector.forecasts[0]
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Selected area (default to first area)
  const [selectedArea, setSelectedArea] = useState<AffectedArea>(
    () => currentSector.affectedAreas[0]
  );

  // Fetch real backend data
  const loadBackendData = useCallback(async (forced: boolean = false) => {
    setIsRefreshing(true);
    try {
      const isHealthy = await SmokeApiService.checkHealth();
      setBackendStatus(isHealthy);

      if (isHealthy) {
        const telemetry = await SmokeApiService.fetchRegionHotspots(
          sectorKey,
          fireSourceFilter
        );
        if (telemetry) {
          setLiveTelemetry(telemetry);
        }
      }
    } catch {
      setBackendStatus(false);
    } finally {
      setTimeout(() => setIsRefreshing(false), 450);
    }
  }, [sectorKey, fireSourceFilter]);

  // Load telemetry whenever sectorKey or fireSourceFilter changes
  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Update selectedArea and selectedForecast when sector changes
  useEffect(() => {
    setSelectedArea(currentSector.affectedAreas[0]);
    setSelectedForecast(currentSector.forecasts[1] || currentSector.forecasts[0]);
  }, [sectorKey]);

  // Merge live backend hotspots with fallback hotspots
  const activeHotspots = liveTelemetry?.sourceHotspots?.length
    ? liveTelemetry.sourceHotspots
    : currentSector.hotspots;

  const totalHotspotsCount = liveTelemetry?.totalDetectionsEvaluated
    ? liveTelemetry.totalDetectionsEvaluated
    : currentSector.activeHotspotsCount;

  // Current AQI value driven by selected city & active forecast
  const currentAqi =
    selectedForecast.aqiValues[selectedArea?.id] || selectedArea?.aqi || 165;
  const currentPm25 = selectedArea?.pm25 || 82.5;

  // Auto-play forecast cycle timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedForecast((current) => {
        const forecasts = currentSector.forecasts;
        const currentIndex = forecasts.findIndex((f) => f.id === current.id);
        const nextIndex = (currentIndex + 1) % forecasts.length;
        return forecasts[nextIndex];
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying, currentSector]);

  // Respond to Tab changes (Layer / Smoke / AQI)
  const handleTabModeChange = (mode: string) => {
    setActiveTab(mode);
    if (mode === 'smoke') {
      setLayers((prev) => ({ ...prev, smoke: true }));
    } else if (mode === 'aqi') {
      setLayers((prev) => ({ ...prev, aqi: true }));
    } else if (mode === 'layer') {
      setLayers((prev) => ({ ...prev, aerosol: true, wind: true }));
    }
  };

  return (
    <div
      className="smoke-operations-container selection:bg-cyan-500 selection:text-white"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Header Control & Status Bar */}
      <div className="smoke-header">
        <div className="smoke-header-left">
          <div className="smoke-icon-badge">
            <Wind className="w-5 h-5 text-sky-400 animate-pulse" />
          </div>
          <div>
            <h2 className="smoke-header-title">
              {isAr
                ? 'رصد تشتت الدخان وجودة الهواء (Sentinel-5P & Copernicus)'
                : 'Smoke Dispersion & Atmospheric Air Quality Operations'}
              
              {/* Live Backend Connection Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                  backendStatus
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                    : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                }`}
                title={backendStatus ? 'Connected to FastAPI Backend (port 8000)' : 'Running in Offline Resilient Mode'}
              >
                <span className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <Database className="w-3 h-3" />
                <span>
                  {backendStatus
                    ? (isAr ? 'متصل بقاعدة البيانات (FastAPI)' : 'FastAPI Backend Online')
                    : (isAr ? 'الوضع المحلي المتصل' : 'Offline Baseline')}
                </span>
              </span>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/40 hidden sm:inline">
                Copernicus Atmosphere Service (CAMS)
              </span>
            </h2>
            <p className="smoke-header-subtitle">
              <span>{isAr ? currentSector.nameAr : currentSector.name}</span>
              <span>·</span>
              <span className="text-cyan-400 font-mono">
                {isAr
                  ? `بؤر حرائق نشطة: ${totalHotspotsCount.toLocaleString()}`
                  : `Active Thermal Sources: ${totalHotspotsCount.toLocaleString()}`}
              </span>
              <span>·</span>
              <span>
                {isAr
                  ? 'نمذجة تشتت جزيئات PM2.5 / PM10 واتجاه الرياح السائد'
                  : 'Gaussian Plume Transport & PM2.5 Particulate Tracking'}
              </span>
            </p>
          </div>
        </div>

        <div className="smoke-header-actions">
          {/* Refresh / Sync Button */}
          <button
            type="button"
            onClick={() => loadBackendData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1e36] hover:bg-[#152e54] text-cyan-300 border border-cyan-800/50 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title={isAr ? 'تحديث البيانات الفورية من الـ Backend' : 'Sync live satellite detections from backend'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? (isAr ? 'جار التحديث...' : 'Syncing...') : (isAr ? 'مزامنة حية' : 'Sync Live')}</span>
          </button>

          {/* Sector Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {isAr ? 'القطاع الإقليمي:' : 'Geographic Sector:'}
            </span>
            <select
              value={sectorKey}
              onChange={(e) => setSectorKey(e.target.value)}
              className="smoke-sector-select"
            >
              {Object.entries(SMOKE_SECTORS).map(([key, sector]) => (
                <option key={key} value={key}>
                  {isAr ? sector.nameAr : sector.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Dashboard Canvas matching the exact screenshot layout */}
      <main className="w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* LEFT COLUMN: Layer Controls (top) & Air Quality Index (bottom) */}
          <div className="lg:col-span-3 flex flex-col gap-3.5">
            <LayerControls
              layers={layers}
              setLayers={setLayers}
              smokeOpacity={smokeOpacity}
              setSmokeOpacity={setSmokeOpacity}
              windSpeed={windSpeed}
              setWindSpeed={setWindSpeed}
              language={lang}
              hotspotsCount={totalHotspotsCount}
            />

            <AirQualityGauge
              aqi={currentAqi}
              pm25={currentPm25}
              city={isAr ? selectedArea?.nameAr : selectedArea?.name}
              language={lang}
              metric={airQualityMetric}
            />
          </div>

          {/* CENTER COLUMN: Top filter pills + Main Satellite Map */}
          <div className="lg:col-span-6 flex flex-col gap-2.5">
            {/* Filter pills directly above the map */}
            <div className="flex items-center justify-start sm:justify-center">
              <FilterTabs
                activeTab={activeTab}
                setActiveTab={handleTabModeChange}
                airQualityMetric={airQualityMetric}
                setAirQualityMetric={setAirQualityMetric}
                fireSourceFilter={fireSourceFilter}
                setFireSourceFilter={setFireSourceFilter}
                language={lang}
              />
            </div>

            {/* Satellite Map */}
            <MainSatelliteMap
              layers={layers}
              selectedForecast={selectedForecast}
              selectedArea={selectedArea}
              onSelectArea={setSelectedArea}
              affectedAreas={currentSector.affectedAreas}
              windSpeedMultiplier={windSpeed}
              language={lang}
              satelliteImage={currentSector.satelliteImage}
              hotspots={activeHotspots}
              cityPositions={currentSector.cityPositions}
              smokeOpacity={smokeOpacity}
              fireSourceFilter={fireSourceFilter}
              activeTabMode={activeTab}
            />
          </div>

          {/* RIGHT COLUMN: Plume Forecast (Hours) & Affected Areas */}
          <div className="lg:col-span-3 flex flex-col gap-3.5">
            <PlumeForecastCard
              forecasts={currentSector.forecasts}
              selectedForecast={selectedForecast}
              onSelectForecast={setSelectedForecast}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              language={lang}
            />

            <AffectedAreasCard
              areas={currentSector.affectedAreas}
              selectedArea={selectedArea}
              onSelectArea={setSelectedArea}
              language={lang}
              sectorName={isAr ? currentSector.nameAr : currentSector.name}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
