import React, { useState } from 'react';
import { YearlyBarGroup } from './types';

interface YearlyBarChartProps {
  data?: YearlyBarGroup[];
  onSelectYear?: (year: number) => void;
  selectedYear?: number | null;
}

export const YearlyBarChart: React.FC<YearlyBarChartProps> = ({
  data = [],
  onSelectYear,
  selectedYear,
}) => {
  const [hoveredBar, setHoveredBar] = useState<{
    year: string;
    subIndex: number;
    value: number;
    burnedHa: string;
    hasGreenCap: boolean;
    x: number;
    y: number;
  } | null>(null);

  // Dynamic Y-axis ticks based on highest value
  const maxVal = data.reduce(
    (max, g) => Math.max(max, ...g.bars.map((b) => b.value)),
    100
  );
  const topRound = Math.ceil(maxVal / 1000) * 1000 || 1000;
  const isLarge = topRound >= 10000;
  const formatTick = (val: number) => (isLarge ? `${Math.round(val / 1000)}K` : `${val}`);

  const yTicks = [
    { label: formatTick(topRound), percent: 100 },
    { label: formatTick(topRound * 0.8), percent: 80 },
    { label: formatTick(topRound * 0.6), percent: 60 },
    { label: formatTick(topRound * 0.4), percent: 40 },
    { label: formatTick(topRound * 0.2), percent: 20 },
    { label: '0', percent: 0 },
  ];

  return (
    <div className="relative w-full h-full bg-[#0d162a] border border-[#172540] rounded-lg p-3.5 flex flex-col justify-between select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-200 font-semibold text-sm tracking-wide flex items-center gap-2">
          <span>Yearly Fire Activity</span>
          {data.length > 0 && (
            <span className="text-[11px] text-sky-400 font-normal">
              ({data[0].yearLabel} - {data[data.length - 1].yearLabel})
            </span>
          )}
        </h3>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 flex min-h-[190px] pt-2 pb-5">
        {/* Y Axis Labels */}
        <div className="w-8 shrink-0 flex flex-col justify-between text-right pr-2 text-[10px] text-slate-400 font-mono">
          {yTicks.map((tick, i) => (
            <span key={i} className="leading-none transform -translate-y-1">
              {tick.label}
            </span>
          ))}
        </div>

        {/* Chart Plot Area with Grid lines */}
        <div className="relative flex-1 h-full border-b border-[#1c2e4f] border-l border-[#1c2e4f]/40 ml-1">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yTicks.map((_, i) => (
              <div
                key={i}
                className="w-full border-b border-[#15223c]/80"
              />
            ))}
          </div>

          {/* Bar Groups */}
          <div className="relative w-full h-full flex items-end justify-between px-1.5 sm:px-3">
            {data.map((group) => {
              const isSelected = selectedYear === group.yearNum;
              return (
                <div
                  key={group.yearLabel}
                  onClick={() => onSelectYear && onSelectYear(group.yearNum)}
                  className={`flex flex-col items-center h-full justify-end cursor-pointer group px-0.5 sm:px-1 rounded transition-colors ${
                    isSelected ? 'bg-sky-950/30 ring-1 ring-sky-500/40' : ''
                  }`}
                >
                  {/* Bars Container for this Year */}
                  <div className="flex items-end gap-[2px] sm:gap-1 h-full pb-0.5">
                    {group.bars.map((bar, bIdx) => {
                      const isHovered =
                        hoveredBar?.year === group.yearLabel &&
                        hoveredBar?.subIndex === bIdx;

                      return (
                        <div
                          key={bIdx}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredBar({
                              year: group.yearLabel,
                              subIndex: bIdx,
                              value: bar.value,
                              burnedHa: bar.burnedHa,
                              hasGreenCap: bar.hasGreenCap,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="relative flex flex-col justify-end items-center transition-transform hover:scale-105"
                          style={{
                            height: `${Math.min(100, Math.max(8, bar.heightPercent))}%`,
                            width: group.bars.length === 2 ? '14px' : '9px',
                          }}
                        >
                          {/* Green containment cap if applicable */}
                          {bar.hasGreenCap && (
                            <div className="w-full h-1 bg-[#136a5c] rounded-t-[1px]" />
                          )}

                          {/* Fiery Gradient Main Bar */}
                          <div
                            className={`w-full flex-1 rounded-t-[1px] transition-all ${
                              isHovered ? 'brightness-125' : ''
                            }`}
                            style={{
                              background:
                                'linear-gradient(180deg, #f97316 0%, #ea580c 35%, #dc2626 70%, #991b1b 100%)',
                              boxShadow: isHovered
                                ? '0 0 8px rgba(249, 115, 22, 0.6)'
                                : 'none',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Year Label */}
                  <div className="absolute -bottom-5 text-[10px] text-slate-400 font-medium group-hover:text-white transition-colors">
                    {group.yearLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredBar && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 bg-[#0a1122] border border-[#2a3e66] text-white text-[11px] py-1.5 px-2.5 rounded shadow-xl backdrop-blur-sm"
          style={{ left: hoveredBar.x, top: hoveredBar.y }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 border-b border-slate-700/60 pb-1 mb-1">
            <span>{hoveredBar.year} Fire Outbreak</span>
            {hoveredBar.hasGreenCap && (
              <span className="text-[9px] px-1 py-0.2 bg-teal-950 text-teal-300 border border-teal-700 rounded">
                Peak Slice
              </span>
            )}
          </div>
          <div className="space-y-0.5 text-slate-300">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Detections:</span>
              <span className="font-mono font-medium text-white">
                {hoveredBar.value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Burned Area:</span>
              <span className="font-mono font-medium text-orange-400">
                {hoveredBar.burnedHa}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
