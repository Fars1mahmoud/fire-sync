import React, { useState } from 'react';
import { TrendDataPoint } from './types';

interface TrendChartCardProps {
  data: TrendDataPoint[];
  lang: 'en' | 'ar';
}

export const TrendChartCard: React.FC<TrendChartCardProps> = ({ data, lang }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 460;
  const height = 150;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxVal = Math.max(...data.map((d) => Math.max(d.high, d.moderate, d.low, 0)), 80);
  const maxY = Math.max(120, Math.ceil((maxVal * 1.15) / 20) * 20);

  // Convert points to SVG coordinates
  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxY) * chartHeight;

  // Generate smooth cubic Bézier curve
  const createSmoothPath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((val, i) => ({ x: getX(i), y: getY(val) }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const highValues = data.map((d) => d.high);
  const modValues = data.map((d) => d.moderate);
  const lowValues = data.map((d) => d.low);

  const highPath = createSmoothPath(highValues);
  const modPath = createSmoothPath(modValues);
  const lowPath = createSmoothPath(lowValues);

  // Closed area under High curve for glowing gradient fill
  const highAreaPath = `${highPath} L ${getX(data.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`;

  return (
    <div className="bg-[#091b2f]/95 backdrop-blur-md rounded-2xl border border-[#1b3a5c] p-4 shadow-xl shadow-black/50">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white text-base md:text-[17px] font-medium tracking-tight">
          {lang === 'ar' ? 'الاتجاه التنبؤي (الـ 7 أيام القادمة)' : 'Trend (Next 7 Days)'}
        </h2>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded-full bg-[#f77f00] shadow-[0_0_6px_#f77f00]" />
            <span className="text-slate-200">{lang === 'ar' ? 'مرتفع' : 'High'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded-full bg-[#ffd166] shadow-[0_0_6px_#ffd166]" />
            <span className="text-slate-200">{lang === 'ar' ? 'متوسط' : 'Moderate'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded-full bg-[#06d6a0] shadow-[0_0_6px_#06d6a0]" />
            <span className="text-slate-200">{lang === 'ar' ? 'منخفض' : 'Low'}</span>
          </div>
        </div>
      </div>

      {/* Main Chart Body with Inset Satellite Thumbnail */}
      <div className="relative flex items-center justify-between">
        {/* Inset Satellite Thumbnail exactly matching reference */}
        <div className="hidden lg:block absolute left-2 top-0 z-10 w-18 h-18 rounded-lg overflow-hidden border border-cyan-500/40 shadow-lg bg-slate-900 group">
          <div className="w-full h-full relative">
            <img
              src="/assets/aistudio/4_b330b7c1.jpg"
              alt="Satellite Inset"
              className="w-full h-full object-cover object-[75%_65%] contrast-125"
            />
            {/* Overlay Grid & Target Pin */}
            <div className="absolute inset-0 bg-blue-950/30 flex items-center justify-center">
              <div className="relative">
                <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-red-500/40 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-white block shadow-md" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-cyan-300 text-center font-mono py-0.5">
              RND-04
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[320px] select-none"
          >
            <defs>
              <linearGradient id="highGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef233c" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#f77f00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f77f00" stopOpacity="0.0" />
              </linearGradient>

              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Lines & Y-Axis Labels */}
            {[0, 50, 100, 150].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#163251"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? 'none' : '2,2'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fill="#627d98"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Glowing Area Fill under High curve */}
            <path d={highAreaPath} fill="url(#highGlowGrad)" />

            {/* Low Line */}
            <path
              d={lowPath}
              fill="none"
              stroke="#06d6a0"
              strokeWidth="2.2"
              filter="url(#neonGlow)"
            />

            {/* Moderate Line */}
            <path
              d={modPath}
              fill="none"
              stroke="#ffd166"
              strokeWidth="2.2"
              filter="url(#neonGlow)"
            />

            {/* High Line */}
            <path
              d={highPath}
              fill="none"
              stroke="#f77f00"
              strokeWidth="2.5"
              filter="url(#neonGlow)"
            />

            {/* Active Data Points & Hover Targets */}
            {data.map((pt, idx) => {
              const cx = getX(idx);
              const cyHigh = getY(pt.high);
              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={pt.timeLabel}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Vertical Guide Line on Hover */}
                  {isHovered && (
                    <line
                      x1={cx}
                      y1={paddingTop}
                      x2={cx}
                      y2={paddingTop + chartHeight}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}

                  {/* Dot on High curve */}
                  <circle
                    cx={cx}
                    cy={cyHigh}
                    r={isHovered ? 4.5 : 2.5}
                    fill="#ffffff"
                    stroke="#f77f00"
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* X-Axis Label */}
                  <text
                    x={cx}
                    y={height - 6}
                    textAnchor="middle"
                    fill={isHovered ? '#ffffff' : '#829ab1'}
                    fontSize="11"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fontFamily="monospace"
                  >
                    {pt.timeLabel}
                  </text>

                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={Math.max(cx - 45, 10)}
                        y={Math.max(cyHigh - 46, 5)}
                        width="90"
                        height="36"
                        rx="6"
                        fill="#061325"
                        stroke="#0ea5e9"
                        strokeWidth="1"
                        className="shadow-xl"
                      />
                      <text
                        x={Math.max(cx, 55)}
                        y={Math.max(cyHigh - 32, 19)}
                        textAnchor="middle"
                        fill="#f77f00"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        High: {pt.high}
                      </text>
                      <text
                        x={Math.max(cx, 55)}
                        y={Math.max(cyHigh - 18, 33)}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="9"
                      >
                        Mod: {pt.moderate} | Low: {pt.low}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
