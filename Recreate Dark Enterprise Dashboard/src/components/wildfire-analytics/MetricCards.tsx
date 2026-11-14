import React from 'react';
import { Flame, TreePine, Calendar, TrendingUp } from 'lucide-react';
import { MetricCardData } from './types';

interface MetricCardsProps {
  metrics: MetricCardData[];
  onSelectMetric?: (metric: MetricCardData) => void;
  isLoading?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  onSelectMetric,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full">
      {metrics.map((m, idx) => {
        return (
          <div
            key={idx}
            onClick={() => onSelectMetric && onSelectMetric(m)}
            className="group relative bg-[#0d172e] border border-[#192744] hover:border-[#283e6b] rounded-lg p-3 px-4 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-black/40"
          >
            {/* Left Content */}
            <div className="space-y-0.5 min-w-0">
              <div
                className={`text-[12px] font-medium tracking-wide truncate ${
                  m.titleColor || 'text-slate-300'
                }`}
              >
                {m.title}
              </div>
              <div
                className={`text-2xl font-bold tracking-tight font-mono ${
                  m.valueColor || 'text-white'
                } ${isLoading ? 'animate-pulse opacity-75' : ''}`}
              >
                {m.value}
              </div>
              {m.subtext && (
                <div className="text-[10px] text-slate-500 truncate">
                  {m.subtext}
                </div>
              )}
            </div>

            {/* Right Icon */}
            <div className="shrink-0 pl-2">
              {m.icon === 'flame' && (
                <Flame className="w-5 h-5 text-red-500 fill-red-500/80 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.5)] transition-transform group-hover:scale-110" />
              )}
              {m.icon === 'tree' && (
                <TreePine className="w-5 h-5 text-amber-600 fill-amber-600/80 filter drop-shadow-[0_0_6px_rgba(217,119,6,0.5)] transition-transform group-hover:scale-110" />
              )}
              {m.icon === 'calendar' && (
                <div className="relative">
                  <div className="w-6 h-6 bg-sky-500/10 border border-sky-400/40 rounded flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                    <Calendar className="w-4 h-4 text-sky-400" />
                  </div>
                </div>
              )}
              {m.icon === 'flame-orange' && (
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/80 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-110" />
              )}
              {m.icon === 'trending-up' && (
                <div className="w-6 h-6 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-500 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              )}
            </div>

            {/* Subtle bottom edge gradient bar */}
            <div className="absolute bottom-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-[#23385e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      })}
    </div>
  );
};
