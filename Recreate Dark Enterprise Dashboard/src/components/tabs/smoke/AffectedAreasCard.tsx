import React from 'react';
import { AffectedArea } from './smokeTypes';
import { Wind, Users, ShieldAlert, HeartPulse } from 'lucide-react';

interface AffectedAreasCardProps {
  areas: AffectedArea[];
  selectedArea: AffectedArea | null;
  onSelectArea: (area: AffectedArea) => void;
  language: 'en' | 'ar';
  sectorName?: string;
}

export const AffectedAreasCard: React.FC<AffectedAreasCardProps> = ({
  areas,
  selectedArea,
  onSelectArea,
  language,
  sectorName,
}) => {
  const isAr = language === 'ar';

  const getBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-[#7f1d1d]/85 text-[#ef4444] border-red-900/60 shadow-[0_0_8px_rgba(239,68,68,0.25)]';
      case 'Moderate':
        return 'bg-[#78350f]/85 text-[#f59e0b] border-amber-900/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
      case 'Low':
      default:
        return 'bg-[#064e3b]/85 text-[#10b981] border-emerald-900/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
    }
  };

  return (
    <div className="bg-[#0b1426]/95 border border-[#1b2b45] rounded-2xl p-4 shadow-xl backdrop-blur-md select-none flex flex-col justify-between">
      <div>
        {/* Title */}
        <h2 className="text-white font-bold text-base tracking-wide mb-3 flex items-center justify-between">
          <span>{isAr ? 'المناطق والمدن المتأثرة' : 'Affected Areas'}</span>
          {sectorName && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
              {sectorName}
            </span>
          )}
        </h2>

        {/* List of Affected Cities */}
        <div className="flex flex-col gap-2">
          {areas.map((area) => {
            const isSelected = selectedArea?.id === area.id;
            return (
              <button
                key={area.id}
                onClick={() => onSelectArea(area)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/60 border border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : 'hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold tracking-wide ${
                      isSelected ? 'text-cyan-300 font-bold' : 'text-slate-200'
                    }`}
                  >
                    {isAr ? area.nameAr : area.name}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    ({isAr ? area.stateAr : area.state})
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-3 py-0.5 rounded-lg text-xs font-semibold border ${getBadgeStyle(
                    area.risk
                  )}`}
                >
                  {isAr
                    ? area.risk === 'High'
                      ? 'مرتفع'
                      : area.risk === 'Moderate'
                      ? 'متوسط'
                      : 'منخفض'
                    : area.risk}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected City Health Advisory Card */}
      {selectedArea && (
        <div className="mt-3 pt-3 border-t border-slate-800/70 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{isAr ? 'التوجيهات الصحية الرسمية:' : 'Health Advisory:'}</span>
            </span>
            <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{selectedArea.population}</span>
            </span>
          </div>
          <p className="text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
            {isAr ? selectedArea.healthAdvisoryAr : selectedArea.healthAdvisory}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1 font-mono">
            <span>{isAr ? 'الرياح السائدة:' : 'Prevailing Wind:'} <strong className="text-white">{selectedArea.windSpeed} ({selectedArea.windDirection})</strong></span>
            <span>PM2.5: <strong className="text-amber-400">{selectedArea.pm25} µg/m³</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

