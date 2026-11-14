import React from 'react';
import { RiskLevel } from './types';

interface RiskLevelsCardProps {
  activeLevelFilter: RiskLevel | null;
  onToggleLevelFilter: (level: RiskLevel) => void;
  lang: 'en' | 'ar';
}

interface LevelRow {
  id: RiskLevel;
  labelEn: string;
  labelAr: string;
  range: string;
  dotColor: string;
}

const RISK_LEVELS: LevelRow[] = [
  { id: 'critical', labelEn: 'Critical', labelAr: 'حرج جداً', range: '75-100%', dotColor: '#ef233c' },
  { id: 'high', labelEn: 'High', labelAr: 'مرتفع', range: '50-75%', dotColor: '#f77f00' },
  { id: 'moderate', labelEn: 'Moderate', labelAr: 'متوسط', range: '20-50%', dotColor: '#ffd166' },
  { id: 'low', labelEn: 'Low', labelAr: 'منخفض', range: '0-20%', dotColor: '#06d6a0' },
];

export const RiskLevelsCard: React.FC<RiskLevelsCardProps> = ({
  activeLevelFilter,
  onToggleLevelFilter,
  lang,
}) => {
  return (
    <div className="bg-[#091b2f]/90 backdrop-blur-md rounded-2xl border border-[#1b3a5c] p-4.5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-white text-base md:text-[17px] font-medium tracking-tight">
          {lang === 'ar' ? 'مستويات الخطورة' : 'Risk Levels'}
        </h2>
        {activeLevelFilter && (
          <button
            onClick={() => onToggleLevelFilter(activeLevelFilter)}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            {lang === 'ar' ? 'إعادة ضبط' : 'Reset Filter'}
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {RISK_LEVELS.map((level) => {
          const isFiltered = activeLevelFilter === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onToggleLevelFilter(level.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                isFiltered
                  ? 'bg-white/10 ring-1 ring-white/30 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
              title={`Click to filter ${level.labelEn} risk areas`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm shrink-0"
                  style={{
                    backgroundColor: level.dotColor,
                    boxShadow: `0 0 10px ${level.dotColor}88`,
                  }}
                />
                <span className="text-[15px] font-medium">
                  {lang === 'ar' ? level.labelAr : level.labelEn}
                </span>
              </div>

              <span className="text-slate-400 text-sm font-medium tracking-tight">
                {level.range}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
