import React from 'react';
import { RecoveryStage, RECOVERY_STAGES } from './recoveryTypes';

interface RecoveryStagesCardProps {
  stages: RecoveryStage[];
  activeStageCode: string;
  onSelectStage: (stage: RecoveryStage) => void;
  language: 'en' | 'ar';
}

export const RecoveryStagesCard: React.FC<RecoveryStagesCardProps> = ({
  stages,
  activeStageCode,
  onSelectStage,
  language,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40 flex flex-col justify-between select-none">
      <div>
        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mb-3">
          {isAr ? 'مراحل التعافي البيئي' : 'Recovery Stages'}
        </h2>

        {/* 4 Stages List matching the reference screenshot */}
        <div className="space-y-2.5">
          {stages.map((stage) => {
            const isSelected = activeStageCode === stage.code;

            return (
              <div
                key={stage.code}
                onClick={() => onSelectStage(stage)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0e223d] border border-blue-500/80 shadow-[0_2px_12px_rgba(0,112,243,0.25)]'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Left: Square Badge + Stage Name */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Square Badge with Letter S, E, V, N */}
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
                    style={{
                      backgroundColor: stage.badgeBg,
                      color: stage.badgeTextColor,
                    }}
                  >
                    {stage.code}
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-slate-100 tracking-tight truncate">
                    {isAr ? stage.labelAr : stage.label}
                  </span>
                </div>

                {/* Right: Duration / Timeline */}
                <div className="text-xs font-mono text-slate-400 shrink-0 pl-2">
                  {isAr ? stage.durationAr : stage.duration}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Expanded Insight Note */}
      {(() => {
        const active = stages.find((s) => s.code === activeStageCode) || stages[0];
        return (
          <div className="mt-3 pt-2.5 border-t border-[#142d4f] text-[11px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300 mr-1">
              {isAr ? 'النطاق النباتي:' : 'NDVI Range:'} {active.ndviRange} —
            </span>
            <span>{isAr ? active.descriptionAr : active.description}</span>
          </div>
        );
      })()}
    </div>
  );
};

