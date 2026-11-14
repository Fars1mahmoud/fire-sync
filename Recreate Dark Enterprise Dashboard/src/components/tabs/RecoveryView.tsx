import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sprout, 
  Flame, 
  Layers, 
  Radio, 
  RefreshCw, 
  Globe2, 
  TreePine,
  Activity,
  SlidersHorizontal,
  Compass,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { RecoveryMetricsCard } from './recovery/RecoveryMetricsCard';
import { RealSplitRecoveryMap } from './recovery/RealSplitRecoveryMap';
import { NdviTimeSeriesChart } from './recovery/NdviTimeSeriesChart';
import { RecoveryStagesCard } from './recovery/RecoveryStagesCard';
import { 
  RECOVERY_SECTORS, 
  RECOVERY_STAGES, 
  RecoveryStage, 
  RecoveryMetrics,
  calculateDynamicMetrics,
  getStageFromSlider,
  getSliderTargetFromStage
} from './recovery/recoveryTypes';
import { RecoveryApiService } from './recovery/recoveryApiService';
import './recovery/RecoveryView.css';

interface RecoveryViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const RecoveryView: React.FC<RecoveryViewProps> = ({ lang, selectedRegion }) => {
  const isAr = lang === 'ar';

  // Sector selection mapping
  const defaultSectorId = useMemo(() => {
    const r = (selectedRegion || '').toLowerCase();
    if (r.includes('canada') || r.includes('boreal') || r.includes('alberta')) return 'canada';
    if (r.includes('egypt') || r.includes('delta')) return 'egypt';
    return 'basin-central';
  }, [selectedRegion]);

  const [activeSectorId, setActiveSectorId] = useState<string>(defaultSectorId);
  const activeSector = RECOVERY_SECTORS[activeSectorId] || RECOVERY_SECTORS['basin-central'];

  // Master slider position (0-100%). Baseline 50% produces exact values from reference screenshot!
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Simulation play state
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const [simDirection, setSimDirection] = useState<'forward' | 'backward'>('forward');

  // Backend status
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(false);

  // Sync health check
  useEffect(() => {
    let isMounted = true;
    setIsLoadingBackend(true);

    RecoveryApiService.checkHealth().then((isAlive) => {
      if (!isMounted) return;
      setBackendOnline(isAlive);
      setIsLoadingBackend(false);
    });

    return () => {
      isMounted = false;
    };
  }, [activeSectorId]);

  // Dynamic live metrics derived directly from sliderPos and sector base area
  const metrics: RecoveryMetrics = useMemo(() => {
    return calculateDynamicMetrics(sliderPos, activeSector.baseHa);
  }, [sliderPos, activeSector.baseHa]);

  // Dynamic active stage derived from sliderPos
  const activeStageCode = useMemo(() => {
    return getStageFromSlider(sliderPos);
  }, [sliderPos]);

  // Simulation tick animation
  useEffect(() => {
    if (!isPlayingSimulation) return;

    const interval = setInterval(() => {
      setSliderPos((prev) => {
        if (simDirection === 'forward') {
          const next = prev + 0.6;
          if (next >= 95) {
            setSimDirection('backward');
            return 95;
          }
          return next;
        } else {
          const next = prev - 0.6;
          if (next <= 5) {
            setSimDirection('forward');
            return 5;
          }
          return next;
        }
      });
    }, 35);

    return () => clearInterval(interval);
  }, [isPlayingSimulation, simDirection]);

  // Smoothly glide slider to target position (for stage selection or resets)
  const animateSliderTo = useCallback((target: number) => {
    setIsPlayingSimulation(false);
    const start = sliderPos;
    const startTime = performance.now();
    const duration = 350;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * ease;
      setSliderPos(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [sliderPos]);

  // Stage click handler
  const handleSelectStage = useCallback((stage: RecoveryStage) => {
    const target = stage.sliderTarget || getSliderTargetFromStage(stage.code);
    animateSliderTo(target);
  }, [animateSliderTo]);

  // Stage code click handler
  const handleSelectStageCode = useCallback((code: 'S' | 'E' | 'V' | 'N') => {
    const target = getSliderTargetFromStage(code);
    animateSliderTo(target);
  }, [animateSliderTo]);

  // Reset to screenshot default (50%)
  const handleResetSlider = useCallback(() => {
    animateSliderTo(50);
  }, [animateSliderTo]);

  const handleSliderChange = useCallback((newPos: number) => {
    setIsPlayingSimulation(false);
    setSliderPos(newPos);
  }, []);

  return (
    <div className="recovery-tab-container select-none">
      {/* Top Tactical HUD Bar */}
      <div className="recovery-top-hud">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-white text-base sm:text-lg font-bold tracking-tight">
                {isAr ? 'التعافي البيئي وإعادة تأهيل الغابات' : 'Post-Fire Ecological Recovery & Burn Scar Rehabilitation'}
              </h1>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'مقارنة تضاريس الأقمار الصناعية ومسار الحريق، ومتابعة تغير البيانات ومؤشر NDVI في الوقت الفعلي'
                  : 'Real-time satellite terrain comparison, dynamic burn scar simulation & NDVI regrowth tracking'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls & Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Quick Simulation Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsPlayingSimulation(!isPlayingSimulation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
              isPlayingSimulation
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                : 'bg-[#0084ff] hover:bg-blue-500 text-white shadow-[0_0_14px_rgba(0,132,255,0.4)]'
            }`}
          >
            {isPlayingSimulation ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{isAr ? 'إيقاف المحاكاة' : 'Pause Sim'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isAr ? 'محاكاة الحريق والتعافي' : 'Simulate'}</span>
              </>
            )}
          </button>

          {/* Sector Selector */}
          <div className="relative">
            <select
              value={activeSectorId}
              onChange={(e) => {
                setActiveSectorId(e.target.value);
                setSliderPos(50);
              }}
              className="appearance-none bg-[#081423] text-white border border-[#1a3352] rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer outline-none hover:border-[#0070f3] transition-all pr-8 shadow-md"
            >
              {Object.values(RECOVERY_SECTORS).map((sector) => (
                <option key={sector.id} value={sector.id} className="bg-[#091524] text-white">
                  {isAr ? sector.nameAr : sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Backend Status Badge */}
          <div className="recovery-stat-badge">
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
                ? isAr ? 'الباك إند متصل' : 'Backend Live'
                : backendOnline === false
                ? isAr ? 'وضع محلي مستقل' : 'Edge Local'
                : isAr ? 'جارِ الاتصال...' : 'Connecting...'}
            </span>
            {isLoadingBackend && <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin ml-1" />}
          </div>

          {/* Monitored Scar Chip */}
          <div className="recovery-stat-badge hidden sm:flex border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{metrics.burnScarFormatted}</span>
            <span className="text-slate-400 text-[11px]">{isAr ? 'مساحة مراقبة' : 'Monitored'}</span>
          </div>
        </div>
      </div>

      {/* 3-Column Cockpit Layout matching user image exactly */}
      <main className="recovery-layout-grid">
        {/* Left Column: Dynamic Recovery Metrics (~240px - 280px) */}
        <aside className="w-full lg:w-[260px] xl:w-[280px] shrink-0">
          <RecoveryMetricsCard 
            metrics={metrics}
            language={lang}
          />
        </aside>

        {/* Center Column: 100% Real Interactive Split Comparison Map (Flex-1) */}
        <section className="flex-1 min-w-0 flex flex-col">
          <RealSplitRecoveryMap
            center={activeSector.center}
            zoom={activeSector.defaultZoom}
            sliderPos={sliderPos}
            onSliderChange={handleSliderChange}
            activeStageCode={activeStageCode}
            isPlayingSimulation={isPlayingSimulation}
            onToggleSimulation={() => setIsPlayingSimulation(!isPlayingSimulation)}
            onResetSlider={handleResetSlider}
            onSelectStageCode={handleSelectStageCode}
            language={lang}
          />
        </section>

        {/* Right Column: NDVI Time Series Chart + Recovery Stages (~280px - 320px) */}
        <aside className="w-full lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col gap-4">
          {/* Top-Right: NDVI Time Series Chart with dynamic tracking cursor */}
          <NdviTimeSeriesChart
            data={activeSector.ndviSeries}
            sliderPos={sliderPos}
            language={lang}
          />

          {/* Bottom-Right: Recovery Stages with active selection */}
          <RecoveryStagesCard
            stages={activeSector.stages}
            activeStageCode={activeStageCode}
            onSelectStage={handleSelectStage}
            language={lang}
          />
        </aside>
      </main>
    </div>
  );
};
