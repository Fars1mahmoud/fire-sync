import React, { useState } from 'react';
import { TrendingUp, Activity, Info } from 'lucide-react';
import { NdviDataPoint } from './recoveryTypes';

interface NdviTimeSeriesChartProps {
  data: NdviDataPoint[];
  sliderPos?: number;
  language: 'en' | 'ar';
}

export const NdviTimeSeriesChart: React.FC<NdviTimeSeriesChartProps> = ({
  data,
  sliderPos = 50,
  language,
}) => {
  const isAr = language === 'ar';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const svgWidth = 400;
  const svgHeight = 160;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxY = 500;
  const minY = 0;

  // Convert data points to SVG coordinates
  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (val / maxY) * chartHeight;

  // Calculate tracking index corresponding to slider position
  const trackingIndex = Math.min(
    data.length - 1,
    Math.max(0, Math.round((sliderPos / 100) * (data.length - 1)))
  );
  const activeIndex = hoveredIndex !== null ? hoveredIndex : trackingIndex;
  const activePoint = data[activeIndex] || data[0];
  const trackingX = getX(trackingIndex);
  const trackingY = getY(activePoint.ndviTarget);

  // Generate SVG path strings
  const generatePath = (key: 'beforeFire' | 'afterFire' | 'ndviTarget') => {
    return data.reduce((acc, point, i) => {
      const x = getX(i);
      const y = getY(point[key]);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const beforeFirePath = generatePath('beforeFire');
  const afterFirePath = generatePath('afterFire');
  const ndviTargetPath = generatePath('ndviTarget');

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40 flex flex-col justify-between select-none">
      <div>
        {/* Header with Title and Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>{isAr ? 'السلاسل الزمنية لمؤشر NDVI' : 'NDVI Time Series'}</span>
          </h2>

          {/* Legend matching screenshot */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-full bg-[#0084ff]"></span>
              <span>{isAr ? 'قبل الحريق' : 'Before Fire'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-full bg-[#3b82f6]"></span>
              <span>{isAr ? 'بعد الحريق' : 'AfterFire'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-full bg-[#f97316]"></span>
              <span>{isAr ? 'التعافي (NDVI)' : 'NDVI'}</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative w-full h-[150px] sm:h-[165px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid lines matching 0, 150, 300, 500 */}
            {[0, 150, 300, 500].map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#142c4b"
                    strokeWidth="1"
                    strokeDasharray={tick === 0 ? undefined : '2, 3'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#627d9f"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Path 1: Before Fire (Cyan / Light Blue #0084ff) */}
            <path
              d={beforeFirePath}
              fill="none"
              stroke="#0084ff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path 2: After Fire (Deep Blue #3b82f6) */}
            <path
              d={afterFirePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.85"
            />

            {/* Path 3: NDVI Regrowth Trajectory (Orange #f97316) */}
            <path
              d={ndviTargetPath}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tracking vertical cursor synchronized with the real split slider */}
            <line
              x1={trackingX}
              y1={paddingTop}
              x2={trackingX}
              y2={paddingTop + chartHeight}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="3, 3"
              className="transition-all duration-100"
            />

            {/* Pulsating circle tracking the current live NDVI point */}
            <circle
              cx={trackingX}
              cy={trackingY}
              r="5.5"
              fill="#f97316"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-100 shadow-[0_0_10px_#f97316]"
            />

            {/* Interactive Circles / Hover Trigger Columns */}
            {data.map((point, idx) => {
              const x = getX(idx);
              const yNdvi = getY(point.ndviTarget);
              const isHovered = hoveredIndex === idx;

              return (
                <g 
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible wide hover area */}
                  <rect
                    x={x - 12}
                    y={paddingTop}
                    width="24"
                    height={chartHeight}
                    fill="transparent"
                  />

                  {/* Hover vertical dashed line */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + chartHeight}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="2, 2"
                    />
                  )}

                  {/* Marker Dot for NDVI */}
                  <circle
                    cx={x}
                    cy={yNdvi}
                    r={isHovered ? 4.5 : 2.5}
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="transition-all"
                  />

                  {/* Month X-axis Label */}
                  {idx % 2 === 0 && (
                    <text
                      x={x}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      fill="#627d9f"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      {isAr && point.monthAr ? point.monthAr : point.month}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Popup */}
          {hoveredPoint && (
            <div 
              className="absolute top-1 right-2 z-20 px-2.5 py-1 rounded-lg bg-[#0b1b31]/95 border border-[#1b3e6b] text-[10.5px] font-mono text-slate-200 shadow-xl pointer-events-none"
            >
              <div className="font-bold text-white mb-0.5">
                {isAr && hoveredPoint.monthAr ? hoveredPoint.monthAr : hoveredPoint.month}
              </div>
              <div className="text-orange-400 font-semibold">NDVI: {hoveredPoint.ndviTarget}</div>
              <div className="text-cyan-400">Before: {hoveredPoint.beforeFire}</div>
            </div>
          )}
        </div>

        {/* Live synchronized tracking readout */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mt-2.5 pt-2 border-t border-[#142c4b]">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'المرحلة الزمنية:' : 'Timeline:'}</span>
            <strong className="text-white font-bold">{isAr && activePoint.monthAr ? activePoint.monthAr : activePoint.month}</strong>
          </span>
          <span className="text-orange-400 font-bold bg-orange-950/40 border border-orange-800/50 px-2 py-0.5 rounded-md">
            NDVI: +{(activePoint.ndviTarget / 500 * 0.85).toFixed(2)} ({activePoint.ndviTarget})
          </span>
        </div>
      </div>
    </div>
  );
};

