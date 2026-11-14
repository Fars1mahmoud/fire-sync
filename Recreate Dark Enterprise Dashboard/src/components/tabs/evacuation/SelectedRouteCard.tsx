import React, { useState } from 'react';
import { Check, Copy, Shield, Truck, AlertCircle } from 'lucide-react';
import { EvacuationRoute, ConvoyDispatchResponse } from './evacuationTypes';
import { getRiskBadgeClasses } from './RouteOptionsCard';

interface SelectedRouteCardProps {
  route: EvacuationRoute;
  lang: 'en' | 'ar';
  onDispatchConvoy: (route: EvacuationRoute) => Promise<ConvoyDispatchResponse | null>;
}

export const SelectedRouteCard: React.FC<SelectedRouteCardProps> = ({
  route,
  lang,
  onDispatchConvoy,
}) => {
  const isAr = lang === 'ar';
  const [copied, setCopied] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<ConvoyDispatchResponse | null>(null);

  const handleCopyDirections = async () => {
    const text = [
      `${route.name} (${route.riskLevel} Risk)`,
      `Distance: ${route.distanceLabel} | Est. Time: ${route.estTimeLabel}`,
      ...route.steps.map((step, i) => `${i + 1}. ${step}`),
      `Corridor Brief: ${route.corridorSummary}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // restricted context fallback
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      const res = await onDispatchConvoy(route);
      setDispatchResult(res);
      window.setTimeout(() => setDispatchResult(null), 6000);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <aside
      aria-labelledby="selected-route-heading"
      className="rounded-xl border border-[#1d3b66]/80 bg-[#091526]/95 p-5 shadow-[0_8px_28px_rgba(2,8,20,0.45)] flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2
            id="selected-route-heading"
            className="text-[16px] font-semibold text-white tracking-tight"
          >
            {isAr ? 'المسار المحدد حالياً' : 'Selected Route'}
          </h2>
          <div
            data-testid="selected-route-name"
            className="inline-flex items-center rounded-lg bg-[#0d7ff2] px-3.5 py-1 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(13,127,242,0.32)]"
          >
            {route.name}
          </div>
        </div>

        {/* Key Route Metrics */}
        <dl className="space-y-2.5 text-[14px] rounded-lg border border-[#1a345a]/70 bg-[#0c1c32]/85 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-300 font-medium">{isAr ? 'المسافة' : 'Distance'}</dt>
            <dd
              data-testid="selected-route-distance"
              className="text-[16px] font-semibold text-[#22d3ee] font-mono tabular-nums"
            >
              {route.distanceLabel}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-300 font-medium">{isAr ? 'الوقت المقدر' : 'Est. Time'}</dt>
            <dd
              data-testid="selected-route-time"
              className="rounded-md bg-[#0e2d44] border border-cyan-500/25 px-2.5 py-0.5 text-[14px] font-semibold text-[#22d3ee] font-mono tabular-nums"
            >
              {route.estTimeLabel}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-300 font-medium">{isAr ? 'درجة الخطورة' : 'Risk Level'}</dt>
            <dd>
              <span
                data-testid="selected-route-risk"
                className={`inline-flex items-center justify-center rounded-md px-3.5 py-0.5 text-[12px] font-semibold min-w-[80px] ${getRiskBadgeClasses(
                  route.riskLevel
                )}`}
              >
                {route.riskLevel}
              </span>
            </dd>
          </div>

          {route.nearestFireDistanceKm !== undefined && (
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#183052]/70 text-[12px]">
              <dt className="text-slate-400">{isAr ? 'أقرب جبهة نيران' : 'Closest Fire Front'}</dt>
              <dd className="font-mono text-amber-300 font-medium">
                {route.nearestFireDistanceKm} km
              </dd>
            </div>
          )}
        </dl>

        {/* Turn-by-Turn Header */}
        <div className="mt-4 mb-2.5 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-slate-300">
            {isAr ? 'خطوات التوجيه خطوة بخطوة' : 'Turn-by-Turn Directions'}
          </h3>
          <span className="text-[12px] text-slate-400 tabular-nums">
            {route.steps.length} {isAr ? 'محطات' : 'steps'}
          </span>
        </div>

        {/* Turn-by-Turn Navigation Steps */}
        <ol
          aria-label="Turn by turn directions"
          className="relative space-y-3.5 max-h-[175px] overflow-y-auto pr-1"
          data-testid="selected-route-steps"
        >
          {route.steps.map((step, index) => (
            <li
              key={`${route.id}-step-${index}`}
              className="relative flex items-center gap-3"
            >
              {index < route.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[13px] top-6 h-4 w-px bg-[#10b981]/40"
                />
              )}
              <span
                className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#10b981] bg-[#0e392d] text-[11px] font-semibold text-[#34d399] tabular-nums"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="text-[13px] font-medium text-slate-100 leading-snug">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 pt-3.5 border-t border-[#183052]/80 space-y-2.5">
        <p className="text-[12px] text-slate-400 leading-relaxed bg-[#0c1c32]/50 p-2.5 rounded-lg border border-[#183052]">
          {route.corridorSummary}
        </p>

        {dispatchResult && (
          <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 p-2.5 text-[12px] text-emerald-200 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{dispatchResult.message}</p>
              <p className="text-[11px] text-emerald-300 font-mono mt-0.5">
                ID: {dispatchResult.dispatchId} · ETA: {dispatchResult.etaMinutes}m
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyDirections}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#24416b] bg-[#0d1f36] hover:bg-[#132b4a] hover:border-blue-400/50 px-3 py-2 text-[12px] font-medium text-slate-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>{isAr ? 'نسخ الخطة' : 'Copy Brief'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDispatch}
            disabled={isDispatching}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/60 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 px-3 py-2 text-[12px] font-semibold text-white transition-colors cursor-pointer shadow-[0_2px_12px_rgba(16,185,129,0.3)]"
          >
            {isDispatching ? (
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Truck className="w-3.5 h-3.5" />
            )}
            <span>{isAr ? 'إرسال قافلة مرافقة' : 'Dispatch Convoy'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
