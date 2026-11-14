import React, { useState } from 'react';
import { HeatmapRow } from './types';

interface HeatmapChartProps {
  rows?: HeatmapRow[];
  years?: string[];
  months?: string[];
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  rows = [],
  years = ['2020', '2021', '2022', '2023', '2024'],
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    rowLabel: string;
    month: string;
    incidents: number;
    severity: string;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="relative w-full h-full bg-[#0d162a] border border-[#172540] rounded-lg p-3.5 flex flex-col justify-between select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-200 font-semibold text-sm tracking-wide flex items-center gap-2">
          <span>Fire Activity Heatmap</span>
          {years.length > 0 && (
            <span className="text-[11px] text-sky-400 font-normal">
              ({years[0]} - {years[years.length - 1]})
            </span>
          )}
        </h3>

        {/* Severity Legend */}
        <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
          <span>Low</span>
          <div className="flex items-center gap-0.5">
            <span className="w-2 h-2 rounded-[1px] bg-[#2a441e]" title="Low" />
            <span className="w-2 h-2 rounded-[1px] bg-[#446628]" title="Moderate" />
            <span className="w-2 h-2 rounded-[1px] bg-[#e89420]" title="High" />
            <span className="w-2 h-2 rounded-[1px] bg-[#e0601e]" title="Very High" />
            <span className="w-2 h-2 rounded-[1px] bg-[#9e2222]" title="Severe" />
            <span className="w-2 h-2 rounded-[1px] bg-[#6b1c1c]" title="Extreme" />
          </div>
          <span>Extreme</span>
        </div>
      </div>

      {/* Heatmap Area */}
      <div className="relative flex-1 flex flex-col justify-center py-2">
        {/* Matrix Grid: Left labels + 12 columns of tiles */}
        <div className="flex flex-col gap-[3px]">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              {/* Row Label (Year) */}
              <div className="w-8 sm:w-10 text-right text-[10px] text-slate-400 font-mono shrink-0">
                {row.label}
              </div>

              {/* Row Cells (12 Months) */}
              <div className="flex-1 grid grid-cols-12 gap-[2px]">
                {row.cells.map((cell, cIdx) => {
                  const monthName = months[cIdx] || `M${cIdx + 1}`;
                  return (
                    <div
                      key={cIdx}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          rowLabel: row.label,
                          month: monthName,
                          incidents: cell.incidents,
                          severity: cell.severity,
                          color: cell.color,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="h-4 sm:h-5 rounded-[2px] cursor-pointer transition-all hover:scale-110 hover:z-10 hover:shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      style={{
                        backgroundColor: cell.color,
                        border: '1px solid rgba(0,0,0,0.3)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Month Labels */}
        <div className="flex items-center ml-10 sm:ml-12 mt-2 px-1">
          <div className="w-full grid grid-cols-12 text-center text-[10px] text-slate-400 font-sans">
            {months.map((m, i) => (
              <span key={i} className="truncate">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 bg-[#080e1c] border border-[#2b3e66] text-white text-[11px] py-1.5 px-2.5 rounded shadow-xl backdrop-blur-sm"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-white border-b border-slate-700/60 pb-1 mb-1">
            <span>
              {hoveredCell.month} {hoveredCell.rowLabel}
            </span>
            <span
              className="text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider"
              style={{
                backgroundColor: hoveredCell.color,
                color: '#fff',
              }}
            >
              {hoveredCell.severity}
            </span>
          </div>
          <div className="text-slate-300">
            Detections:{' '}
            <span className="font-mono font-medium text-white">
              {hoveredCell.incidents.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
