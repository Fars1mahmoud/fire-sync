import React from 'react';
import { RiskStat, RiskLevel } from './types';

interface RiskStatisticsCardProps {
  stats: RiskStat[];
  selectedLevel: RiskLevel | null;
  onSelectLevel: (level: RiskLevel) => void;
  lang: 'en' | 'ar';
}

export const RiskStatisticsCard: React.FC<RiskStatisticsCardProps> = ({
  stats,
  selectedLevel,
  onSelectLevel,
  lang,
}) => {
  const getArabicLabel = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return 'المناطق الحرجة';
      case 'high':
        return 'مناطق عالية الخطورة';
      case 'moderate':
        return 'مناطق متوسطة الخطورة';
      case 'low':
        return 'مناطق منخفضة الخطورة';
    }
  };

  const totalZones = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-[#091b2f]/90 backdrop-blur-md rounded-2xl border border-[#1b3a5c] p-4.5 shadow-lg shadow-black/40">
      <h2 className="text-white text-base md:text-[17px] font-medium mb-3.5 tracking-tight">
        {lang === 'ar' ? 'إحصاءات المخاطر' : 'Risk Statistics'}
      </h2>

      {/* Inner Nested Panel matching the reference UI */}
      <div className="bg-[#0c2037]/80 rounded-xl border border-[#183654] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#1b3b5f]/50">
          <span className="text-slate-300 text-sm font-medium">
            {lang === 'ar' ? 'تصنيف المناطق' : 'Risk Statistics'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {lang === 'ar' ? `المجموع: ${totalZones} منطقة` : `Total: ${totalZones} Zones`}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {stats.map((stat) => {
            const isSelected = selectedLevel === stat.level;
            return (
              <button
                key={stat.level}
                onClick={() => onSelectLevel(stat.level)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-white/10 ring-1 ring-white/30'
                    : 'hover:bg-white/5'
                }`}
                title={`Filter ${stat.label}`}
              >
                <div className="flex items-center gap-3">
                  {/* Exact Solid Rounded Rect Badge from reference */}
                  <div
                    className="w-5.5 h-4.5 rounded-md shrink-0 shadow-sm transition-transform hover:scale-110"
                    style={{
                      backgroundColor: stat.color,
                      boxShadow: `0 0 12px ${stat.color}66`,
                    }}
                  />
                  <span className="text-slate-200 text-[15px] font-medium tracking-tight">
                    {lang === 'ar' ? getArabicLabel(stat.level) : stat.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-lg tracking-tight font-mono">
                    {stat.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
