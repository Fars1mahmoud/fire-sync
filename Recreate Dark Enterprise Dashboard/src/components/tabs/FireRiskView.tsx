import React, { useState, useEffect, useMemo } from 'react';
import { RegionService } from '../../services/regionService';
import { PredictionPeriodCard } from '../fire-risk/PredictionPeriodCard';
import { RiskLevelsCard } from '../fire-risk/RiskLevelsCard';
import { ModelInputsCard } from '../fire-risk/ModelInputsCard';
import { RiskStatisticsCard } from '../fire-risk/RiskStatisticsCard';
import { TrendChartCard } from '../fire-risk/TrendChartCard';
import { MapCenter } from '../fire-risk/MapCenter';
import { OriginalComparisonView } from '../fire-risk/OriginalComparisonView';
import { HotspotDetailModal } from '../fire-risk/HotspotDetailModal';
import { PredictionPeriod, RiskLevel, Hotspot, FireRiskOverviewResponse } from '../fire-risk/types';
import { FireRiskApiService } from '../../services/fireRiskApi';
import { calculateRiskStats, getTrendDataPoints, getSampleHotspotsByCountry } from '../fire-risk/fireRiskLogic';
import { Sparkles, Sliders, Eye, Activity, Flame, ShieldAlert, Layers, Globe } from 'lucide-react';
import './TabViews.css';

interface FireRiskViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const FireRiskView: React.FC<FireRiskViewProps> = ({ lang, selectedRegion }) => {
  const regDef = RegionService.getRegionById(selectedRegion);

  const [viewMode, setViewMode] = useState<'interactive' | 'original' | 'split'>('interactive');
  const [fuelType, setFuelType] = useState<'timber' | 'grassland' | 'slash'>('timber');
  const [selectedPeriod, setSelectedPeriod] = useState<PredictionPeriod>('Next 24 Hours');
  const [activeLevelFilter, setActiveLevelFilter] = useState<RiskLevel | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Active selected country state (defaults to selectedRegion mapping, can be switched to BRA, CAN, EGY, ALL)
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    const r = (selectedRegion || '').toLowerCase();
    if (r.includes('canada') || r.includes('boreal') || r.includes('alberta')) return 'CAN';
    if (r.includes('egypt') || r.includes('delta')) return 'EGY';
    return 'BRA';
  });

  // Sync if selectedRegion changes from outside
  useEffect(() => {
    const r = (selectedRegion || '').toLowerCase();
    if (r.includes('canada') || r.includes('boreal') || r.includes('alberta')) {
      setSelectedCountry('CAN');
    } else if (r.includes('egypt') || r.includes('delta')) {
      setSelectedCountry('EGY');
    } else if (r.includes('brazil') || r.includes('amazon') || r.includes('pantanal')) {
      setSelectedCountry('BRA');
    }
  }, [selectedRegion]);

  const [activeModelInputs, setActiveModelInputs] = useState({
    temperature: true,
    drought: true,
    weather: true,
    history: true,
  });

  // Live Backend State
  const [overviewData, setOverviewData] = useState<FireRiskOverviewResponse | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real data on change of country, period, or active model inputs
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    FireRiskApiService.fetchFireRisk({
      country: selectedCountry,
      period: selectedPeriod,
      activeInputs: activeModelInputs,
    }).then((res) => {
      if (!isMounted) return;
      setOverviewData(res.data);
      setIsLiveBackend(res.isLiveBackend);
      setIsLoading(false);

      if (res.data.hotspots && res.data.hotspots.length > 0) {
        setSelectedHotspot((prev) => {
          if (!prev) return res.data.hotspots[0];
          const found = res.data.hotspots.find((h) => h.id === prev.id);
          return found || res.data.hotspots[0];
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCountry, selectedPeriod, activeModelInputs]);

  const handleToggleInput = (key: 'temperature' | 'drought' | 'weather' | 'history') => {
    setActiveModelInputs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleLevelFilter = (level: RiskLevel) => {
    setActiveLevelFilter((prev) => (prev === level ? null : level));
  };

  // Real or calibrated fallback values
  const stats = overviewData?.stats || calculateRiskStats(selectedPeriod, activeModelInputs);
  const hotspots = overviewData?.hotspots || getSampleHotspotsByCountry(selectedCountry);
  const trendData = overviewData?.trend || getTrendDataPoints(selectedPeriod);

  // Meteorological fire risk sub-indices
  const fwiData = {
    ffmc: overviewData?.model_metadata?.ffmc || (selectedCountry === 'BRA' ? 94.2 : selectedCountry === 'CAN' ? 91.8 : 93.5),
    dmc: overviewData?.model_metadata?.dmc || (selectedCountry === 'BRA' ? 88.5 : selectedCountry === 'CAN' ? 72.0 : 84.0),
    dc: overviewData?.model_metadata?.dc || (selectedCountry === 'BRA' ? 780.0 : selectedCountry === 'CAN' ? 620.0 : 740.0),
    isi: overviewData?.model_metadata?.isi || (selectedCountry === 'BRA' ? 18.4 : selectedCountry === 'CAN' ? 22.1 : 19.8),
    bui: overviewData?.model_metadata?.bui || (selectedCountry === 'BRA' ? 142.0 : selectedCountry === 'CAN' ? 118.0 : 135.0),
    fwi: overviewData?.model_metadata?.fwi || (selectedCountry === 'BRA' ? 54 : selectedCountry === 'CAN' ? 48 : 52),
    kbdi: overviewData?.model_metadata?.kbdi || (selectedCountry === 'BRA' ? 780 : selectedCountry === 'CAN' ? 640 : 740),
  };

  const dangerRating = fwiData.fwi >= 50 ? 'Extreme' : fwiData.fwi >= 38 ? 'Critical' : fwiData.fwi >= 25 ? 'High' : 'Moderate';

  // The main high-fidelity dashboard content
  const dashboardContent = (
    <div className="w-full flex flex-col gap-4">
      {/* Country Selection Quick Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#030d1a]/90 border border-[#1b3a5c] backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            {lang === 'ar' ? 'الدولة المستهدفة بالتحليل والرصد الفضائي الحي:' : 'Target Earth Observation & Fire Risk Country:'}
          </span>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            {selectedCountry === 'CAN' ? '🇨🇦 Canada' : selectedCountry === 'EGY' ? '🇪🇬 Egypt' : selectedCountry === 'ALL' ? '🌐 Global' : '🇧🇷 Brazil'}
          </span>
        </div>

        <div className="flex items-center bg-[#071626] border border-[#1b3453] rounded-xl p-1 gap-1 text-xs">
          {[
            { code: 'BRA', flag: '🇧🇷', labelEn: 'Brazil (Amazon)', labelAr: 'البرازيل (الأمازون)' },
            { code: 'CAN', flag: '🇨🇦', labelEn: 'Canada (Peace River)', labelAr: 'كندا (نهر بيس)' },
            { code: 'EGY', flag: '🇪🇬', labelEn: 'Egypt (Delta/Sinai)', labelAr: 'مصر (الدلتا وسيناء)' },
            { code: 'ALL', flag: '🌐', labelEn: 'Global Network', labelAr: 'رصد عالمي كامل' },
          ].map((c) => {
            const isSelected = selectedCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{c.flag}</span>
                <span>{lang === 'ar' ? c.labelAr : c.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Tactical Center Layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Left Column (Prediction Period, Risk Levels, Model Inputs) */}
        <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col gap-3.5">
          <PredictionPeriodCard
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            lang={lang}
          />
          <RiskLevelsCard
            activeLevelFilter={activeLevelFilter}
            onToggleLevelFilter={handleToggleLevelFilter}
            lang={lang}
          />
          <ModelInputsCard
            activeInputs={activeModelInputs}
            onToggleInput={handleToggleInput}
            lang={lang}
          />
        </div>

        {/* Center Real Leaflet Satellite Map */}
        <div className="flex-1 min-w-0 h-[620px] lg:h-auto min-h-[580px] flex">
          <MapCenter
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
            activeLevelFilter={activeLevelFilter}
            lang={lang}
            country={selectedCountry}
            onSelectCountry={setSelectedCountry}
          />
        </div>

        {/* Right Column (Risk Statistics & 7-Day Trend Chart) */}
        <div className="w-full lg:w-[410px] xl:w-[440px] shrink-0 flex flex-col gap-3.5">
          <RiskStatisticsCard
            stats={stats}
            selectedLevel={activeLevelFilter}
            onSelectLevel={handleToggleLevelFilter}
            lang={lang}
          />

          <TrendChartCard data={trendData} lang={lang} />
        </div>
      </div>

      {/* KPI & FWI Meteorological Sub-System Cards */}
      <div className="tab-kpi-grid">
        <div className="tab-kpi-card critical">
          <span className="tab-kpi-label">{lang === 'ar' ? 'مؤشر طقس الحريق (FWI)' : 'Fire Weather Index (FWI)'}</span>
          <span className="tab-kpi-value">{fwiData.fwi} <small style={{ fontSize: '0.85rem' }}>/ 60+</small></span>
          <span className="tab-kpi-sub" style={{ color: '#ef4444' }}>
            🔥 {dangerRating} {lang === 'ar' ? 'خطر اشتعال فائق' : 'Extreme fire danger'}
          </span>
        </div>

        <div className="tab-kpi-card warning">
          <span className="tab-kpi-label">{lang === 'ar' ? 'مؤشر جفاف التربة (KBDI)' : 'Keetch-Byram Drought Index'}</span>
          <span className="tab-kpi-value">{fwiData.kbdi} <small style={{ fontSize: '0.85rem' }}>/ 800</small></span>
          <span className="tab-kpi-sub">
            🏜️ {lang === 'ar' ? 'عجز رطوبة الطبقة العضوية' : 'Deep duff moisture deficit'}
          </span>
        </div>

        <div className="tab-kpi-card">
          <span className="tab-kpi-label">{lang === 'ar' ? 'مؤشر سرعة الانتشار الأولي (ISI)' : 'Initial Spread Index (ISI)'}</span>
          <span className="tab-kpi-value">{fwiData.isi}</span>
          <span className="tab-kpi-sub">
            💨 {lang === 'ar' ? 'مدفوع برياح 10م' : 'Driven by 10m wind vector'}
          </span>
        </div>

        <div className="tab-kpi-card success">
          <span className="tab-kpi-label">{lang === 'ar' ? 'رطوبة المواد الدقيقة (FFMC)' : 'Fine Fuel Moisture (FFMC)'}</span>
          <span className="tab-kpi-value">{fwiData.ffmc}</span>
          <span className="tab-kpi-sub">
            🍂 {lang === 'ar' ? 'سهولة اشتعال فورية' : 'High ease of ignition'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tab-view-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Banner Header with View Mode Switchers */}
      <div className="tab-header">
        <div className="tab-header-left">
          <div
            className="tab-icon-badge"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              background: 'rgba(239, 68, 68, 0.15)',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.25)',
            }}
          >
            🔥
          </div>
          <div>
            <h2 className="tab-header-title">
              <span>
                {lang === 'ar'
                  ? `4. مركز التنبؤ بمخاطر الحرائق — ${regDef.nameAr}`
                  : `4. Predictive Fire Risk Center — ${regDef.nameEn}`}
              </span>
              <span className="badge-critical" style={{ fontSize: '0.75rem' }}>
                {dangerRating.toUpperCase()} RISK
              </span>
            </h2>
            <p className="tab-header-subtitle">
              {lang === 'ar'
                ? 'نمذجة مؤشر FWI الكندي، وتوقعات انتشار اللهب بناءً على رصد الأقمار الصناعية وبيانات FIRMS الحقيقية'
                : 'Canadian FWI system, KBDI drought tracking & tactical fire spread modeling from real NASA FIRMS observations'}
            </p>
          </div>
        </div>

        {/* Live Backend & View Mode Actions */}
        <div className="tab-header-actions flex flex-wrap items-center gap-2">
          {/* Live Backend Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
              isLiveBackend
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLiveBackend ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveBackend ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}
              ></span>
            </span>
            <span>
              {isLiveBackend
                ? (lang === 'ar' ? 'بيانات الباك إند الحقيقية' : 'REAL DATA BACKEND')
                : (lang === 'ar' ? 'النموذج الفيزيائي المُعاير' : 'CALIBRATED PHYSICS')}
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#071626] border border-[#1b3453] rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تفاعلي 100%' : 'Interactive UI'}</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'مقارنة الشاشة' : 'Compare Split'}</span>
            </button>

            <button
              onClick={() => setViewMode('original')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'original'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'صورة الأصل' : 'Reference Asset'}</span>
            </button>
          </div>

          {/* Fuel Type Filter */}
          <select
            className="tab-select"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as any)}
          >
            <option value="timber">
              {lang === 'ar' ? 'أشجار خشبية (Heavy Timber)' : 'Coniferous / Heavy Timber'}
            </option>
            <option value="grassland">
              {lang === 'ar' ? 'سافانا وحشائش (Cerrado Grass)' : 'Cerrado Grassland / Shrub'}
            </option>
            <option value="slash">
              {lang === 'ar' ? 'مخلفات الغابات (Slash & Burn)' : 'Agricultural Clearing Slash'}
            </option>
          </select>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="w-full mt-4">
        {viewMode === 'interactive' && dashboardContent}

        {viewMode === 'original' && (
          <div className="w-full">
            <OriginalComparisonView mode="original" lang={lang} />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="w-full">
            <OriginalComparisonView mode="split" lang={lang}>
              {dashboardContent}
            </OriginalComparisonView>
          </div>
        )}
      </div>

      {/* Hotspot Telemetry Inspection Modal */}
      <HotspotDetailModal
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        lang={lang}
      />
    </div>
  );
};
