import React, { useState } from 'react';
import { SeasonalPoint } from './types';

interface SeasonalPatternChartProps {
  data?: SeasonalPoint[];
  highlightYear?: number | null;
}

export const SeasonalPatternChart: React.FC<SeasonalPatternChartProps> = ({
  data = [],
  highlightYear,
}) => {
  const [activeYears, setActiveYears] = useState<Record<string, boolean>>({
    '2021': true,
    '2022': true,
    '2023': true,
    '2024': true,
  });

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const toggleYear = (yr: string) => {
    setActiveYears((prev) => ({
      ...prev,
      [yr]: !prev[yr],
    }));
  };

  // Find dynamic max across points
  const maxVal = data.reduce((max, d) => {
    return Math.max(
      max,
      Number(d.v2021 || 0),
      Number(d.v2022 || 0),
      Number(d.v2023 || 0),
      Number(d.v2024 || 0)
    );
  }, 50);

  const topTick = Math.ceil((maxVal * 1.15) / 50) * 50 || 100;
  const yTicks = [
    { label: String(topTick), value: topTick },
    { label: String(Math.round(topTick * 0.75)), value: topTick * 0.75 },
    { label: String(Math.round(topTick * 0.5)), value: topTick * 0.5 },
    { label: String(Math.round(topTick * 0.25)), value: topTick * 0.25 },
    { label: '0', value: 0 },
  ];

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return paddingTop + plotHeight - (val / topTick) * plotHeight;
  };

  const createSmoothPath = (key: 'v2021' | 'v2022' | 'v2023' | 'v2024') => {
    const points = data.map((d, i) => ({
      x: getX(i),
      y: getY(Number(d[key] || 0)),
    }));

    if (points.length === 0) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const series = [
    {
      year: '2021',
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.4)',
      key: 'v2021' as const,
    },
    {
      year: '2022',
      color: '#eab308',
      glow: 'rgba(234, 179, 8, 0.4)',
      key: 'v2022' as const,
    },
    {
      year: '2023',
      color: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.4)',
      key: 'v2023' as const,
    },
    {
      year: '2024',
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.5)',
      key: 'v2024' as const,
    },
  ];

  return (
    <div className="relative w-full h-full bg-[#0d162a] border border-[#172540] rounded-lg p-3.5 flex flex-col justify-between select-none">
      {/* Header with Title and Year Toggles */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-200 font-semibold text-sm tracking-wide">
          Seasonal Pattern (Monthly Average)
        </h3>

        {/* Legend / Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px]">
          {series.map((s) => {
            const isHighlighted = highlightYear === Number(s.year);
            const isVisible = activeYears[s.year];
            return (
              <button
                key={s.year}
                type="button"
                onClick={() => toggleYear(s.year)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
                  isVisible ? 'opacity-100 font-semibold' : 'opacity-40 line-through'
                } ${isHighlighted ? 'ring-1 ring-white/50 bg-white/10' : ''}`}
                style={{ color: s.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.year}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Chart Area */}
      <div className="relative flex-1 min-h-[190px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          {/* Background Grid Lines */}
          {yTicks.map((tick, i) => {
            const yPos = getY(tick.value);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={svgWidth - paddingRight}
                  y2={yPos}
                  stroke="#17243e"
                  strokeWidth="1"
                  strokeDasharray={i === yTicks.length - 1 ? 'none' : '2,2'}
                />
                <text
                  x={paddingLeft - 6}
                  y={yPos + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748b"
                  fontFamily="monospace"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Month X Labels */}
          {data.map((d, i) => {
            const xPos = getX(i);
            return (
              <text
                key={i}
                x={xPos}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                className="select-none"
              >
                {d.month}
              </text>
            );
          })}

          {/* Line Series */}
          {series.map((s) => {
            if (!activeYears[s.year]) return null;
            const isHighlighted = highlightYear === Number(s.year);
            const pathData = createSmoothPath(s.key);

            return (
              <g key={s.year}>
                {/* Glow Filter Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={s.glow}
                  strokeWidth={isHighlighted ? 6 : 4}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                {/* Main Sharp Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isHighlighted ? 2.5 : 1.8}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Point Dots */}
                {data.map((d, i) => (
                  <circle
                    key={i}
                    cx={getX(i)}
                    cy={getY(Number(d[s.key] || 0))}
                    r={hoverIndex === i ? 4 : isHighlighted ? 3 : 2}
                    fill={s.color}
                    className="transition-all cursor-pointer"
                  />
                ))}
              </g>
            );
          })}

          {/* Hover Crosshair line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={paddingTop + plotHeight}
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="pointer-events-none"
            />
          )}

          {/* Invisible Overlay Rectangles for easy hover detection */}
          {data.map((_, i) => {
            const x = getX(i) - plotWidth / (data.length * 2);
            const w = plotWidth / data.length;
            return (
              <rect
                key={i}
                x={x}
                y={paddingTop}
                width={w}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-crosshair"
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute top-2 z-40 bg-[#070e1c] border border-[#2b3e66] text-white text-[11px] py-1.5 px-2.5 rounded shadow-xl backdrop-blur-md pointer-events-none"
            style={{
              left: `${Math.min(75, Math.max(15, (hoverIndex / (data.length - 1)) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1 mb-1">
              Month: {data[hoverIndex].month}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
              {series.map((s) => (
                <div key={s.year} className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-slate-400">{s.year}:</span>
                  <span className="font-mono font-medium text-white">
                    {data[hoverIndex][s.key] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
