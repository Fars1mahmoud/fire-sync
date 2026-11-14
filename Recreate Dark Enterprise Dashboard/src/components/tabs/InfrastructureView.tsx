import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  Zap, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Compass, 
  Activity, 
  AlertTriangle,
  Hospital,
  Radio,
  Truck
} from 'lucide-react';
import { InfrastructureLayersPanel } from './infrastructure/InfrastructureLayersPanel';
import { ExposureMapPanel } from './infrastructure/ExposureMapPanel';
import { NearestFacilitiesPanel } from './infrastructure/NearestFacilitiesPanel';
import { ExposureAssessmentTable } from './infrastructure/ExposureAssessmentTable';
import { 
  DEFAULT_ACTIVE_LAYERS, 
  FALLBACK_FACILITIES 
} from './infrastructure/infrastructureData';
import { 
  Facility, 
  FilterTabId, 
  InfrastructureSummary, 
  LayerId 
} from './infrastructure/infrastructureTypes';
import { InfrastructureApiService } from './infrastructure/infrastructureApiService';
import { RegionService } from '../../services/regionService';
import './TabViews.css';

interface InfrastructureViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  lang,
  selectedRegion,
}) => {
  const isAr = lang === 'ar';

  // Region normalization
  const currentRegionKey = useMemo(() => {
    const r = (selectedRegion || '').toLowerCase();
    if (r.includes('can') || r.includes('boreal') || r.includes('alberta')) return 'canada';
    if (r.includes('egy') || r.includes('delta') || r.includes('med')) return 'egypt';
    return 'brazil';
  }, [selectedRegion]);

  const [activeRegion, setActiveRegion] = useState<string>(currentRegionKey);

  // Layer and Filter states
  const [activeLayers, setActiveLayers] = useState<Record<LayerId, boolean>>(DEFAULT_ACTIVE_LAYERS);
  const [activeTab, setActiveTab] = useState<FilterTabId>('all');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Backend data states
  const [facilities, setFacilities] = useState<Facility[]>(FALLBACK_FACILITIES);
  const [summary, setSummary] = useState<InfrastructureSummary>({
    region: activeRegion,
    databaseConnected: true,
    totalMonitored: 8,
    atRiskCount: 6,
    monitorCount: 2,
    safeCount: 0,
    closestDistanceKm: 3.9,
    closestFacilityName: 'Manaus Eduardo Gomes Int. Airport & Logistics',
    threatenedPowerCapacity: '500 kV / 1,820 MW',
    hospitalBedsAtRisk: '350 beds',
    primaryEvacuationCorridor: 'AM-010 Highway',
    activeFireFrontCount: 151,
  });
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  // Load facilities & summary from backend on mount and on region change
  const loadInfrastructureData = useCallback(async (reg: string) => {
    setIsLoading(true);

    const isAlive = await InfrastructureApiService.checkHealth();
    setBackendOnline(isAlive);

    const [facs, sum] = await Promise.all([
      InfrastructureApiService.fetchFacilities(reg),
      InfrastructureApiService.fetchSummary(reg),
    ]);

    setFacilities(facs);
    setSummary(sum);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInfrastructureData(activeRegion);
  }, [activeRegion, loadInfrastructureData]);

  // Keep in sync with parent selectedRegion prop
  useEffect(() => {
    if (currentRegionKey !== activeRegion) {
      setActiveRegion(currentRegionKey);
    }
  }, [currentRegionKey, activeRegion]);

  // Toggle single layer
  const handleToggleLayer = (layerId: LayerId) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  // Toggle all layers
  const handleToggleAll = (selectAll: boolean) => {
    const updated: Record<LayerId, boolean> = {
      cities: selectAll,
      hospitals: selectAll,
      airports: selectAll,
      power: selectAll,
      roads: selectAll,
      industrial: selectAll,
      other: selectAll,
    };
    setActiveLayers(updated);
  };

  const handleSelectTab = (tabId: FilterTabId) => {
    setActiveTab(tabId);
    setSelectedFacilityId(null);
  };

  const handleResetAll = () => {
    setActiveLayers(DEFAULT_ACTIVE_LAYERS);
    setActiveTab('all');
    setSelectedFacilityId(null);
  };

  // Filter facilities based on active layers and active category tab
  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      // Layer toggle check
      const layerActive = activeLayers[fac.layerId] ?? true;
      if (!layerActive) return false;

      // Category Tab filter check
      if (activeTab === 'all') return true;
      if (activeTab === 'hospitals') return fac.layerId === 'hospitals';
      if (activeTab === 'power') return fac.layerId === 'power';
      if (activeTab === 'roads') return fac.layerId === 'roads';
      if (activeTab === 'cities') return fac.layerId === 'cities';
      if (activeTab === 'other') return fac.layerId === 'other' || fac.layerId === 'industrial' || fac.layerId === 'airports';
      return true;
    });
  }, [facilities, activeLayers, activeTab]);

  // Counts per layer for the left panel badges
  const facilityCountsByLayer = useMemo(() => {
    const counts: Record<LayerId, number> = {
      cities: 0,
      hospitals: 0,
      airports: 0,
      power: 0,
      roads: 0,
      industrial: 0,
      other: 0,
    };
    facilities.forEach((f) => {
      if (counts[f.layerId] !== undefined) {
        counts[f.layerId] += 1;
      }
    });
    return counts;
  }, [facilities]);

  // Emergency protective action trigger
  const handleDispatchAction = async (fac: Facility) => {
    const actionName = fac.action || (isAr ? 'عزل حراري وتبريد المنشأة' : 'Thermal Foam Insulation');
    const res = await InfrastructureApiService.dispatchProtectionAction(fac.id, actionName);
    setDispatchToast(isAr ? `🚨 تم إرسال أمر الحماية الفورية لـ ${fac.nameAr || fac.name}: ${actionName}` : `🚨 Emergency protection order dispatched to ${fac.name}: ${actionName}`);
    setTimeout(() => setDispatchToast(null), 5000);
  };

  return (
    <div className="tab-view-container select-none" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ========================================================================= */}
      {/* TOP TACTICAL HUD BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#091526]/90 backdrop-blur-md border border-[#142d4f] mb-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-white text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
              <span>{isAr ? 'حماية البنية التحتية الحيوية وشبكات الطاقة' : 'Infrastructure Exposure Intelligence'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                PROXIMITY BUFFER
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'رصد المسافة الفاصلة بين جبهة الحريق وأبراج الكهرباء ومحطات المياه والمستشفيات وشرايين الإخلاء'
                : 'Real-time geodesic distance buffer tracking for power grids, hospitals, reservoirs, and highways'}
            </p>
          </div>
        </div>

        {/* Live Controls & Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Region Selector */}
          <div className="relative">
            <select
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="appearance-none bg-[#081423] text-white border border-[#1a3352] rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer outline-none hover:border-[#0070f3] transition-all pr-8 shadow-md"
            >
              <option value="brazil" className="bg-[#091524]">
                🇧🇷 {isAr ? 'حوض الأمازون وسيرادو (البرازيل)' : 'Amazon & Cerrado (Brazil)'}
              </option>
              <option value="canada" className="bg-[#091524]">
                🇨🇦 {isAr ? 'ممر الغابات الشمالية (كندا)' : 'Boreal Forest Belt (Canada)'}
              </option>
              <option value="egypt" className="bg-[#091524]">
                🇪🇬 {isAr ? 'الساحل الشمالي ودلتا النيل (مصر)' : 'Mediterranean Coastal Belt (Egypt)'}
              </option>
            </select>
          </div>

          {/* Backend Live Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081423] border border-[#1a3352] text-xs font-mono">
            <div
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : backendOnline === false
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-blue-400 animate-pulse'
              }`}
            />
            <span className="text-slate-300">
              {backendOnline === true
                ? isAr ? 'الباك إند متصل' : 'FastAPI Connected'
                : backendOnline === false
                ? isAr ? 'وضع محلي مستقل' : 'Local Edge Cache'
                : isAr ? 'جارِ التحقق...' : 'Connecting...'}
            </span>
            {isLoading && <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin ml-1" />}
          </div>

          {/* Database Fire Clusters Count */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold">{summary.activeFireFrontCount}</span>
            <span className="text-slate-400 text-[11px]">{isAr ? 'بؤرة نار نشطة' : 'Active Hotspots'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 TOP KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* KPI 1: Closest Flame Front Distance */}
        <div className="p-3.5 rounded-2xl bg-[#091526]/95 border border-[#142d4f] shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.25)]">
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-slate-400 block truncate">
              {isAr ? 'أقرب مسافة لخط النار' : 'Closest Flame Front'}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-red-400 tracking-tight">
              {summary.closestDistanceKm.toFixed(1)} <small className="text-xs font-normal text-slate-400">km</small>
            </span>
          </div>
        </div>

        {/* KPI 2: Power Transmission Grid */}
        <div className="p-3.5 rounded-2xl bg-[#091526]/95 border border-[#142d4f] shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-slate-400 block truncate">
              {isAr ? 'شبكة نقل الطاقة المعرضة' : 'Power Grid Capacity'}
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-amber-400 tracking-tight truncate block">
              {summary.threatenedPowerCapacity}
            </span>
          </div>
        </div>

        {/* KPI 3: Hospital Beds Under Watch */}
        <div className="p-3.5 rounded-2xl bg-[#091526]/95 border border-[#142d4f] shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.25)]">
            <Hospital className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-slate-400 block truncate">
              {isAr ? 'أسرّة الطوارئ بالمستشفيات' : 'Emergency Hospital Beds'}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 tracking-tight">
              {summary.hospitalBedsAtRisk}
            </span>
          </div>
        </div>

        {/* KPI 4: Evacuation Artery */}
        <div className="p-3.5 rounded-2xl bg-[#091526]/95 border border-[#142d4f] shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-slate-400 block truncate">
              {isAr ? 'شريان الإخلاء السريع' : 'Primary Evacuation Route'}
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 tracking-tight truncate block">
              {summary.primaryEvacuationCorridor}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DISPATCH TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {dispatchToast && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-950/90 to-slate-900 border border-red-500/60 text-white text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xl animate-in slide-in-from-top">
          <span>{dispatchToast}</span>
          <button
            type="button"
            onClick={() => setDispatchToast(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPPER 3-COLUMN COCKPIT GRID matching screenshot exactly */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[265px_minmax(0,1fr)_315px] xl:grid-cols-[290px_minmax(0,1fr)_345px] gap-4 items-stretch mb-4">
        {/* Column 1: Infrastructure Layers Panel */}
        <InfrastructureLayersPanel
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
          facilityCounts={facilityCountsByLayer}
          onToggleAll={handleToggleAll}
          lang={lang}
        />

        {/* Column 2: Exposure Map Panel (Real Satellite Leaflet + Tactical Vector) */}
        <ExposureMapPanel
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          markers={filteredFacilities}
          activeLayers={activeLayers}
          selectedFacilityId={selectedFacilityId}
          onSelectFacility={setSelectedFacilityId}
          onToggleLayer={handleToggleLayer}
          onResetAll={handleResetAll}
          region={activeRegion}
          lang={lang}
        />

        {/* Column 3: Nearest Facilities Panel with bilingual headers */}
        <NearestFacilitiesPanel
          facilities={filteredFacilities}
          selectedFacilityId={selectedFacilityId}
          onSelectFacility={setSelectedFacilityId}
          lang={lang}
        />
      </div>

      {/* ========================================================================= */}
      {/* LOWER FULL-WIDTH EXPOSURE ASSESSMENT TABLE matching screenshot */}
      {/* ========================================================================= */}
      <ExposureAssessmentTable
        facilities={filteredFacilities}
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={setSelectedFacilityId}
        onResetAll={handleResetAll}
        lang={lang}
      />
    </div>
  );
};
