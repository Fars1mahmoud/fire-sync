import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  RefreshCw,
  Flame,
  Shield,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { RegionService } from '../../services/regionService';
import {
  EvacuationRoute,
  RouteId,
  RouteSearchInput,
  MapMarker,
  EvacuationSummaryData,
  ConvoyDispatchResponse,
} from './evacuation/evacuationTypes';
import {
  EvacuationApiService,
  FALLBACK_ROUTES,
  FALLBACK_MARKERS,
  FALLBACK_SUMMARY,
} from './evacuation/evacuationApiService';
import { RoutePlanningCard } from './evacuation/RoutePlanningCard';
import { RouteOptionsCard } from './evacuation/RouteOptionsCard';
import { SatelliteEvacuationMap } from './evacuation/SatelliteEvacuationMap';
import { SelectedRouteCard } from './evacuation/SelectedRouteCard';
import { EvacuationSummaryHUD } from './evacuation/EvacuationSummaryHUD';
import './TabViews.css';

interface EvacuationViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const EvacuationView: React.FC<EvacuationViewProps> = ({
  lang,
  selectedRegion,
}) => {
  const isAr = lang === 'ar';
  const regDef = RegionService.getRegionById(selectedRegion);

  const [routes, setRoutes] = useState<EvacuationRoute[]>(FALLBACK_ROUTES);
  const [markers, setMarkers] = useState<MapMarker[]>(FALLBACK_MARKERS);
  const [summary, setSummary] = useState<EvacuationSummaryData>(FALLBACK_SUMMARY);
  const [selectedRouteId, setSelectedRouteId] = useState<RouteId>('route-a');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState<RouteSearchInput>({
    originCity: '',
    originCoords: '',
    destinationZone: '',
    destinationMode: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch live evacuation intelligence from backend FastAPI
  const loadIntelligence = useCallback(
    async (region: string, searchParams?: RouteSearchInput) => {
      setLoading(true);
      try {
        const [sumData, markData, routeData] = await Promise.all([
          EvacuationApiService.fetchSummary(region),
          EvacuationApiService.fetchMarkers(region),
          EvacuationApiService.fetchRoutes(region, searchParams),
        ]);
        setSummary(sumData);
        setMarkers(markData);
        setRoutes(routeData);
      } catch (err) {
        console.warn('Error loading evacuation data:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Reset search inputs on region change and reload
    const defaultCity =
      selectedRegion === 'canada'
        ? 'Fort McMurray'
        : selectedRegion === 'egypt'
          ? 'Cairo Outskirts'
          : 'Manaus';
    const defaultZone =
      selectedRegion === 'canada'
        ? 'Lac La Biche Hub'
        : selectedRegion === 'egypt'
          ? 'Ismailia Logistics Hub'
          : 'Safe Zone North';

    setSearchInput({
      originCity: defaultCity,
      originCoords: '',
      destinationZone: defaultZone,
      destinationMode: 'Escort Safe Corridor',
    });
    setSelectedRouteId('route-a');
    setValidationError(null);

    loadIntelligence(selectedRegion);
  }, [selectedRegion, loadIntelligence]);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) ?? routes[0],
    [routes, selectedRouteId]
  );

  const handleSearchFieldChange = (
    field: keyof RouteSearchInput,
    value: string
  ) => {
    setSearchInput((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSelectPreset = async (preset: RouteSearchInput) => {
    setSearchInput(preset);
    setValidationError(null);
    setIsRecalculating(true);
    const updatedRoutes = await EvacuationApiService.fetchRoutes(
      selectedRegion,
      preset
    );
    setRoutes(updatedRoutes);
    setSelectedRouteId('route-a');
    setIsRecalculating(false);
  };

  const handleFindRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.originCity.trim()) {
      setValidationError(
        isAr
          ? 'يرجى إدخال اسم مدينة الانطلاق لحساب الممرات.'
          : 'Origin city is required to compute corridors.'
      );
      return;
    }
    if (!searchInput.destinationZone.trim()) {
      setValidationError(
        isAr
          ? 'يرجى إدخال المنطقة الآمنة المستهدفة.'
          : 'Destination safe zone is required.'
      );
      return;
    }

    setValidationError(null);
    setIsRecalculating(true);
    const updated = await EvacuationApiService.fetchRoutes(
      selectedRegion,
      searchInput
    );
    setRoutes(updated);
    setSelectedRouteId('route-a');
    setIsRecalculating(false);
  };

  const handleResetAll = () => {
    loadIntelligence(selectedRegion);
    setSelectedRouteId('route-a');
    setToastMessage(
      isAr
        ? 'تمت إعادة ضبط ممرات الإخلاء والتحديث بالأقمار الصناعية'
        : 'Evacuation corridors reset and refreshed with satellite telemetry'
    );
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDispatchConvoy = async (
    route: EvacuationRoute
  ): Promise<ConvoyDispatchResponse | null> => {
    const payload = {
      routeId: route.id,
      sector: searchInput.originCity || 'Alpha Sector',
      unitType: 'Escort Alpha Lead',
      destination: route.name,
    };
    const response = await EvacuationApiService.dispatchConvoy(payload);
    setToastMessage(
      isAr
        ? `تم إرسال قافلة التأمين بنجاح (${response.assignedUnit}) - الوقت المقدر ${response.etaMinutes} دقيقة`
        : `Escort convoy dispatched (${response.assignedUnit}) - ETA: ${response.etaMinutes} min`
    );
    window.setTimeout(() => setToastMessage(null), 4000);
    return response;
  };

  return (
    <div
      className="tab-view-container min-h-screen pb-10"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Banner & Header */}
      <div className="tab-header flex-wrap gap-4 justify-between items-center bg-[#071322]/90 border border-[#1b365d]/80 rounded-2xl p-4 sm:p-5 mb-4 shadow-[0_4px_24px_rgba(4,18,36,0.6)]">
        <div className="tab-header-left flex items-center gap-3">
          <div className="tab-icon-badge flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-400/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
                {isAr
                  ? `مركز قيادة وتأمين ممرات الإخلاء — ${regDef.nameAr}`
                  : `Evacuation Command Center — ${regDef.nameEn}`}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isAr ? 'مباشر (Live)' : 'LIVE TELEMETRY'}</span>
              </span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-slate-400 mt-0.5">
              {isAr
                ? 'تحليل الممرات الإنسانية، رصد جبهات النيران الميدانية، وتأمين قوافل الإغاثة بالاعتماد على بيانات NASA FIRMS'
                : 'Satellite corridor routing, FIRMS thermal firefront avoidance, and real-time emergency escort convoy logistics'}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadIntelligence(selectedRegion, searchInput)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#24416b] bg-[#0d1f36] hover:bg-[#132b4a] hover:border-blue-400/50 px-3 py-1.5 text-[13px] font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-400 ${
                loading ? 'animate-spin' : ''
              }`}
            />
            <span>{isAr ? 'تحديث البيانات' : 'Refresh Data'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#24416b] bg-[#0d1f36] hover:bg-[#132b4a] hover:border-blue-400/50 px-3 py-1.5 text-[13px] font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'إعادة ضبط الممرات' : 'Reset Corridors'}</span>
          </button>
        </div>
      </div>

      {/* Toast Dispatch Alert */}
      {toastMessage && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-500/50 bg-emerald-950/90 p-3.5 text-[13px] text-emerald-200 shadow-xl flex items-center gap-3 backdrop-blur-md animate-fade-in"
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top 5 KPI Telemetry HUD */}
      <EvacuationSummaryHUD summary={summary} lang={lang} />

      {/* Main 3-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column (col-span-3): Route Planning + Route Options */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <RoutePlanningCard
            searchInput={searchInput}
            validationError={validationError}
            isRecalculating={isRecalculating}
            selectedRegion={selectedRegion}
            lang={lang}
            onChange={handleSearchFieldChange}
            onSelectPreset={handleSelectPreset}
            onSubmit={handleFindRoutes}
          />
          <RouteOptionsCard
            routes={routes}
            selectedRouteId={selectedRouteId}
            lang={lang}
            onSelectRoute={setSelectedRouteId}
          />
        </div>

        {/* Center Column (col-span-6): Interactive Satellite Map */}
        <div className="lg:col-span-6 flex flex-col min-h-[500px]">
          <SatelliteEvacuationMap
            routes={routes}
            markers={markers}
            selectedRouteId={selectedRouteId}
            lang={lang}
            onSelectRoute={setSelectedRouteId}
          />
        </div>

        {/* Right Column (col-span-3): Selected Route Details & Directions */}
        <div className="lg:col-span-3 flex flex-col">
          <SelectedRouteCard
            route={selectedRoute}
            lang={lang}
            onDispatchConvoy={handleDispatchConvoy}
          />
        </div>
      </div>
    </div>
  );
};
