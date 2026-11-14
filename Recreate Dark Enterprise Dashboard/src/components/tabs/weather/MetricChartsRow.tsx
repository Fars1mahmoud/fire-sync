import React, { useState } from 'react';
import { MoreHorizontal, Download, Eye } from 'lucide-react';
import { ChartDataPoint, Language, MetricMode, RegionData } from './weatherTypes';

interface MetricChartsRowProps {
  currentRegion: RegionData;
  language: Language;
  activeMode: MetricMode;
  onSelectMode: (mode: MetricMode) => void;
}

export const MetricChartsRow: React.FC<MetricChartsRowProps> = ({
  currentRegion,
  language,
  activeMode,
  onSelectMode,
}) => {
  const isAr = language === 'ar';
  const { charts } = currentRegion;

  const [activeMenuCard, setActiveMenuCard] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    card: string;
    index: number;
    label: string;
    value: number;
    unit: string;
  } | null>(null);

  // SVG Helper dimensions
  const svgWidth = 280;
  const svgHeight = 110;
  const paddingLeft = 32;
  const paddingRight = 12;
  const paddingTop = 12;
  const paddingBottom = 22;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Render SVG Smooth Spline path with safe clamping
  const createSmoothPath = (
    data: ChartDataPoint[],
    minY: number,
    maxY: number
  ) => {
    if (data.length === 0) return '';
    const safeMax = maxY > minY ? maxY : minY + 1;
    const points = data.map((d, i) => {
      const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartW;
      const normalizedY = Math.min(Math.max((d.value - minY) / (safeMax - minY), 0), 1);
      const y = paddingTop + chartH - normalizedY * chartH;
      return { x, y };
    });

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

  const createAreaPath = (
    data: ChartDataPoint[],
    minY: number,
    maxY: number
  ) => {
    const linePath = createSmoothPath(data, minY, maxY);
    if (!linePath) return '';
    const firstX = paddingLeft;
    const lastX = paddingLeft + chartW;
    const bottomY = paddingTop + chartH;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Safe dynamic max calculations
  const maxTemp = Math.max(...charts.temperature.map((p) => p.value), 38) + 2;
  const maxWind = Math.max(...charts.wind.map((p) => p.value), 25) + 5;
  const isKbdi = charts.drought.some((p) => p.value > 100);
  const maxDrought = isKbdi ? 800 : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* ----------------- CHART 1: Temperature Trend ----------------- */}
      <div
        className={`relative rounded-2xl border p-4 bg-[#0a1b2a]/95 backdrop-blur-md shadow-xl flex flex-col justify-between transition-all duration-200 overflow-hidden ${
          activeMode === 'temperature'
            ? 'border-[#38bdf8] ring-1 ring-[#38bdf8]/40'
            : 'border-[#1c354a] hover:border-[#2a4b68]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onSelectMode('temperature')}
            className="text-sm font-bold text-white hover:text-sky-300 transition-colors text-left cursor-pointer"
          >
            {isAr ? 'اتجاه درجة الحرارة' : 'Temperature Trend'}
          </button>
          <div className="relative">
            <button
              onClick={() =>
                setActiveMenuCard(activeMenuCard === 'temp' ? null : 'temp')
              }
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {activeMenuCard === 'temp' && (
              <div className="absolute right-0 top-7 z-30 w-36 py-1 bg-[#0b1d38] border border-sky-500/30 rounded-lg shadow-xl text-xs text-slate-200">
                <button
                  onClick={() => {
                    onSelectMode('temperature');
                    setActiveMenuCard(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-600/30 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? 'عرض في الخريطة' : 'View on Radar'}</span>
                </button>
                <button
                  onClick={() => setActiveMenuCard(null)}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-600/30 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصدير البيانات' : 'Export CSV'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full h-[120px] overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full block">
            <defs>
              <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y Axis Grid & Labels */}
            {[
              { val: 35, y: paddingTop },
              { val: 30, y: paddingTop + chartH * 0.25 },
              { val: 25, y: paddingTop + chartH * 0.5 },
              { val: 20, y: paddingTop + chartH * 0.75 },
              { val: 0, y: paddingTop + chartH },
            ].map((g) => (
              <g key={g.val}>
                <text
                  x={paddingLeft - 6}
                  y={g.y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {g.val}
                </text>
                <line
                  x1={paddingLeft}
                  y1={g.y}
                  x2={svgWidth - paddingRight}
                  y2={g.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Area fill */}
            <path
              d={createAreaPath(charts.temperature, 0, maxTemp)}
              fill="url(#tempAreaGrad)"
            />

            {/* Vertical Accent Bars under the peaks */}
            {charts.temperature.map((pt, i) => {
              const x = paddingLeft + (i / Math.max(charts.temperature.length - 1, 1)) * chartW;
              const normalizedY = Math.min(Math.max(pt.value / maxTemp, 0), 1);
              const barH = Math.max(normalizedY * chartH, 2);
              const y = paddingTop + chartH - barH;

              if (i >= 2 && i <= 5) {
                return (
                  <rect
                    key={`bar-${i}`}
                    x={x - 4}
                    y={y}
                    width={8}
                    height={barH}
                    fill="rgba(14, 165, 233, 0.35)"
                    rx="2"
                  />
                );
              }
              return null;
            })}

            {/* Smooth Spline Curve */}
            <path
              d={createSmoothPath(charts.temperature, 0, maxTemp)}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data Points with interactive hover */}
            {charts.temperature.map((pt, i) => {
              const x = paddingLeft + (i / Math.max(charts.temperature.length - 1, 1)) * chartW;
              const normalizedY = Math.min(Math.max(pt.value / maxTemp, 0), 1);
              const y = paddingTop + chartH - normalizedY * chartH;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={3}
                    fill="#38bdf8"
                    stroke="#071224"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-transform hover:scale-150"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        card: 'temp',
                        index: i,
                        label: pt.label,
                        value: pt.value,
                        unit: '°C',
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint?.card === 'temp' && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-sky-950/90 border border-sky-400 text-sky-200 text-[10px] font-mono shadow-lg pointer-events-none">
              {hoveredPoint.label}:00 — {hoveredPoint.value}
              {hoveredPoint.unit}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- CHART 2: Wind Speed & Direction ----------------- */}
      <div
        className={`relative rounded-2xl border p-4 bg-[#0a1b2a]/95 backdrop-blur-md shadow-xl flex flex-col justify-between transition-all duration-200 overflow-hidden ${
          activeMode === 'wind'
            ? 'border-[#10bd78] ring-1 ring-[#10bd78]/40'
            : 'border-[#1c354a] hover:border-[#2a4b68]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onSelectMode('wind')}
            className="text-sm font-bold text-white hover:text-emerald-300 transition-colors text-left cursor-pointer"
          >
            {isAr ? 'سرعة واتجاه الرياح' : 'Wind Speed & Direction'}
          </button>
          <div className="relative">
            <button
              onClick={() =>
                setActiveMenuCard(activeMenuCard === 'wind' ? null : 'wind')
              }
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {activeMenuCard === 'wind' && (
              <div className="absolute right-0 top-7 z-30 w-36 py-1 bg-[#0b1d38] border border-sky-500/30 rounded-lg shadow-xl text-xs text-slate-200">
                <button
                  onClick={() => {
                    onSelectMode('wind');
                    setActiveMenuCard(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-600/30 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? 'عرض في الخريطة' : 'View on Radar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SVG Chart with Emerald Green Vertical Bars + Spline */}
        <div className="relative w-full h-[120px] overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full block">
            {[
              { val: 20, y: paddingTop },
              { val: 15, y: paddingTop + chartH * 0.25 },
              { val: 10, y: paddingTop + chartH * 0.5 },
              { val: 5, y: paddingTop + chartH * 0.75 },
              { val: 0, y: paddingTop + chartH },
            ].map((g) => (
              <g key={g.val}>
                <text
                  x={paddingLeft - 6}
                  y={g.y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {g.val}
                </text>
                <line
                  x1={paddingLeft}
                  y1={g.y}
                  x2={svgWidth - paddingRight}
                  y2={g.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Stepped Emerald Bars */}
            {charts.wind.map((pt, i) => {
              const x = paddingLeft + (i / Math.max(charts.wind.length - 1, 1)) * chartW;
              const normalizedY = Math.min(Math.max(pt.value / maxWind, 0), 1);
              const barH = Math.max(normalizedY * chartH, 2);
              const y = paddingTop + chartH - barH;
              return (
                <rect
                  key={`wbar-${i}`}
                  x={x - 5}
                  y={y}
                  width={10}
                  height={barH}
                  fill="rgba(16, 185, 129, 0.45)"
                  stroke="#10b981"
                  strokeWidth="1"
                  rx="1.5"
                  className="hover:fill-emerald-400 transition-colors cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      card: 'wind',
                      index: i,
                      label: pt.label,
                      value: pt.value,
                      unit: 'km/h',
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

            {/* Overlaid Green Spline Line */}
            <path
              d={createSmoothPath(charts.wind, 0, maxWind)}
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* X Axis Labels */}
            {charts.wind.map((pt, i) => {
              const x = paddingLeft + (i / Math.max(charts.wind.length - 1, 1)) * chartW;
              return (
                <text
                  key={`wx-${i}`}
                  x={x}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {pt.label}
                </text>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint?.card === 'wind' && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-[10px] font-mono shadow-lg pointer-events-none">
              {hoveredPoint.label}h — {hoveredPoint.value} {hoveredPoint.unit}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- CHART 3: Humidity ----------------- */}
      <div
        className={`relative rounded-2xl border p-4 bg-[#0a1b2a]/95 backdrop-blur-md shadow-xl flex flex-col justify-between transition-all duration-200 overflow-hidden ${
          activeMode === 'humidity'
            ? 'border-[#38bdf8] ring-1 ring-[#38bdf8]/40'
            : 'border-[#1c354a] hover:border-[#2a4b68]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onSelectMode('humidity')}
            className="text-sm font-bold text-white hover:text-sky-300 transition-colors text-left cursor-pointer"
          >
            {isAr ? 'الرطوبة النسبية' : 'Humidity'}
          </button>
          <div className="relative">
            <button
              onClick={() =>
                setActiveMenuCard(activeMenuCard === 'hum' ? null : 'hum')
              }
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {activeMenuCard === 'hum' && (
              <div className="absolute right-0 top-7 z-30 w-36 py-1 bg-[#0b1d38] border border-sky-500/30 rounded-lg shadow-xl text-xs text-slate-200">
                <button
                  onClick={() => {
                    onSelectMode('humidity');
                    setActiveMenuCard(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-600/30 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? 'عرض في الخريطة' : 'View on Radar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SVG Chart with Sine-Wave Undulating Curve */}
        <div className="relative w-full h-[120px] overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full block">
            <defs>
              <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {[
              { val: 100, y: paddingTop },
              { val: 75, y: paddingTop + chartH * 0.25 },
              { val: 50, y: paddingTop + chartH * 0.5 },
              { val: 25, y: paddingTop + chartH * 0.75 },
              { val: 0, y: paddingTop + chartH },
            ].map((g) => (
              <g key={g.val}>
                <text
                  x={paddingLeft - 6}
                  y={g.y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {g.val}
                </text>
                <line
                  x1={paddingLeft}
                  y1={g.y}
                  x2={svgWidth - paddingRight}
                  y2={g.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              </g>
            ))}

            <path
              d={createAreaPath(charts.humidity, 0, 100)}
              fill="url(#humGrad)"
            />

            <path
              d={createSmoothPath(charts.humidity, 0, 100)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {charts.humidity.map((pt, i) => {
              const x = paddingLeft + (i / Math.max(charts.humidity.length - 1, 1)) * chartW;
              const normalizedY = Math.min(Math.max(pt.value / 100, 0), 1);
              const y = paddingTop + chartH - normalizedY * chartH;
              return (
                <g key={`hum-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={3}
                    fill="#38bdf8"
                    stroke="#071224"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:scale-150 transition-transform"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        card: 'hum',
                        index: i,
                        label: pt.label,
                        value: pt.value,
                        unit: '%',
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint?.card === 'hum' && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-sky-950/90 border border-sky-400 text-sky-200 text-[10px] font-mono shadow-lg pointer-events-none">
              {hoveredPoint.label}:00 — {hoveredPoint.value}
              {hoveredPoint.unit}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- CHART 4: Drought Index (With Safe Clamped Orange Bars) ----------------- */}
      <div
        className={`relative rounded-2xl border p-4 bg-[#0a1b2a]/95 backdrop-blur-md shadow-xl flex flex-col justify-between transition-all duration-200 overflow-hidden ${
          activeMode === 'drought'
            ? 'border-[#ff7700] ring-1 ring-[#ff7700]/40'
            : 'border-[#1c354a] hover:border-[#2a4b68]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onSelectMode('drought')}
            className="text-sm font-bold text-white hover:text-orange-300 transition-colors text-left cursor-pointer"
          >
            {isAr ? 'مؤشر الجفاف' : 'Drought Index'}
          </button>
          <div className="relative">
            <button
              onClick={() =>
                setActiveMenuCard(activeMenuCard === 'drought' ? null : 'drought')
              }
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {activeMenuCard === 'drought' && (
              <div className="absolute right-0 top-7 z-30 w-36 py-1 bg-[#0b1d38] border border-sky-500/30 rounded-lg shadow-xl text-xs text-slate-200">
                <button
                  onClick={() => {
                    onSelectMode('drought');
                    setActiveMenuCard(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-600/30 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? 'عرض في الخريطة' : 'View on Radar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SVG Chart with Safe Orange Glowing Vertical Bars strictly constrained to container */}
        <div className="relative w-full h-[120px] overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full block">
            {/* Y Axis Grid & Labels: [100, 75, 50, 25, 0] or [800, 600, 400, 200, 0] */}
            {(isKbdi
              ? [
                  { val: 800, y: paddingTop },
                  { val: 600, y: paddingTop + chartH * 0.25 },
                  { val: 400, y: paddingTop + chartH * 0.5 },
                  { val: 200, y: paddingTop + chartH * 0.75 },
                  { val: 0, y: paddingTop + chartH },
                ]
              : [
                  { val: 100, y: paddingTop },
                  { val: 75, y: paddingTop + chartH * 0.25 },
                  { val: 50, y: paddingTop + chartH * 0.5 },
                  { val: 25, y: paddingTop + chartH * 0.75 },
                  { val: 0, y: paddingTop + chartH },
                ]
            ).map((g) => (
              <g key={g.val}>
                <text
                  x={paddingLeft - 6}
                  y={g.y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {g.val}
                </text>
                <line
                  x1={paddingLeft}
                  y1={g.y}
                  x2={svgWidth - paddingRight}
                  y2={g.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Glowing Orange Vertical Bars Strictly Clamped Inside the Chart */}
            {charts.drought.map((pt, i) => {
              const x = paddingLeft + (i / Math.max(charts.drought.length - 1, 1)) * chartW;
              const normalizedY = Math.min(Math.max(pt.value / maxDrought, 0), 1);
              const barH = Math.max(normalizedY * chartH, 2);
              const y = paddingTop + chartH - barH;

              return (
                <rect
                  key={`dr-bar-${i}`}
                  x={x - 4}
                  y={y}
                  width={8}
                  height={barH}
                  fill={normalizedY > 0.75 ? '#ff7700' : '#f97316'}
                  rx="1.5"
                  className="hover:fill-amber-400 transition-colors cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      card: 'drought',
                      index: i,
                      label: pt.label,
                      value: pt.value,
                      unit: isKbdi ? 'KBDI' : 'Pts',
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

            {/* X-Axis Labels */}
            {charts.drought.map((pt, i) => {
              const x = paddingLeft + (i / Math.max(charts.drought.length - 1, 1)) * chartW;
              return (
                <text
                  key={`dr-x-${i}`}
                  x={x}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {pt.label}
                </text>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint?.card === 'drought' && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-orange-950/90 border border-orange-400 text-orange-200 text-[10px] font-mono shadow-lg pointer-events-none">
              Hour {hoveredPoint.label} — {hoveredPoint.value} {hoveredPoint.unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
