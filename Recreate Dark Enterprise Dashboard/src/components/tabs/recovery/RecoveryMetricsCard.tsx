import React from 'react';
import { Flame, Sprout, Activity, Clock, TreePine, Sparkles } from 'lucide-react';
import { RecoveryMetrics } from './recoveryTypes';

interface RecoveryMetricsCardProps {
  metrics: RecoveryMetrics;
  language: 'en' | 'ar';
}

export const RecoveryMetricsCard: React.FC<RecoveryMetricsCardProps> = ({
  metrics,
  language,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-5 shadow-2xl shadow-black/40 flex flex-col justify-between h-full select-none">
      <div>
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4 flex items-center justify-between">
          <span>{isAr ? 'مؤشرات التعافي البيئي' : 'Recovery Metrics'}</span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full">
            {isAr ? 'بيانات الأقمار الصناعية' : 'Sentinel-2 dNBR'}
          </span>
        </h2>

        {/* 4 Metrics Rows matching the exact reference screenshot */}
        <div className="space-y-4">
          {/* 1. Burn Scar Area */}
          <div className="flex items-center gap-3.5 p-2 rounded-xl transition-all hover:bg-white/5">
            {/* Custom Fire Burn Scar Icon in Red Pill */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3d1116] to-[#250a0d] border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
              <Flame className="w-5 h-5 fill-red-500 stroke-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-400 block font-normal tracking-wide">
                {isAr ? 'مساحة بؤرة الحريق والندبة' : 'Burn Scar Area'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {metrics.burnScarFormatted}
              </span>
            </div>
          </div>

          {/* 2. Vegetation Index */}
          <div className="flex items-center gap-3.5 p-2 rounded-xl transition-all hover:bg-white/5">
            {/* Custom Green Leaf / Seedling Icon in Green Pill */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0c2a1a] to-[#06170e] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <Sprout className="w-5 h-5 fill-emerald-500/60 stroke-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-400 block font-normal tracking-wide">
                {isAr ? 'مؤشر نمو الغطاء النباتي' : 'Vegetation Index'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tracking-tight">
                +{metrics.vegetationIndexPct}%
              </span>
            </div>
          </div>

          {/* 3. Recovery Progress */}
          <div className="flex items-center gap-3.5 p-2 rounded-xl transition-all hover:bg-white/5">
            {/* Custom Progress Flame/Leaf Icon in Amber Pill */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3b1710] to-[#210c08] border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.25)]">
              <Activity className="w-5 h-5 stroke-orange-400" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-400 block font-normal tracking-wide">
                {isAr ? 'نسبة التقدم في التعافي' : 'Recovery Progress'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {metrics.recoveryProgressPct}%
              </span>
            </div>
          </div>

          {/* 4. Est. Recovery Time */}
          <div className="flex items-center gap-3.5 p-2 rounded-xl transition-all hover:bg-white/5">
            {/* Custom Tree Canopy Icon in Green Pill */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0c2a1a] to-[#06170e] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <TreePine className="w-5 h-5 fill-emerald-500/60 stroke-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-400 block font-normal tracking-wide">
                {isAr ? 'المدة التقديرية للتعافي الكامل' : 'Est. Recovery Time'}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {isAr && metrics.estRecoveryTimeAr ? metrics.estRecoveryTimeAr : metrics.estRecoveryTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seedlings & Conservation Footer */}
      {metrics.seedlingsPlanted && (
        <div className="mt-4 pt-3 border-t border-[#142d4f] flex items-center justify-between text-xs text-slate-400">
          <span>{isAr ? 'الشتلات المزروعة:' : 'Native Seedlings:'}</span>
          <span className="font-mono font-bold text-emerald-300">{metrics.seedlingsPlanted}</span>
        </div>
      )}
    </div>
  );
};

