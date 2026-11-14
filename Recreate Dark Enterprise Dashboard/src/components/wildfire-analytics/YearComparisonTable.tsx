import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { YearComparisonRow } from './types';

interface YearComparisonTableProps {
  data?: YearComparisonRow[];
  onSelectYear?: (year: number) => void;
  selectedYear?: number | null;
}

export const YearComparisonTable: React.FC<YearComparisonTableProps> = ({
  data = [],
  onSelectYear,
  selectedYear,
}) => {
  const [tableData, setTableData] = useState<YearComparisonRow[]>(data);
  const [sortField, setSortField] = useState<keyof YearComparisonRow | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleSort = (field: keyof YearComparisonRow) => {
    const newAsc = sortField === field ? !sortAsc : false;
    setSortField(field);
    setSortAsc(newAsc);

    const sorted = [...tableData].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (field === 'year') {
        return newAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
      }

      const aNum = parseFloat(String(aVal).replace(/,/g, '').replace('K', '000').replace('M', '000000'));
      const bNum = parseFloat(String(bVal).replace(/,/g, '').replace('K', '000').replace('M', '000000'));

      return newAsc ? aNum - bNum : bNum - aNum;
    });

    setTableData(sorted);
  };

  const applyTableFilter = (filter: string) => {
    setActiveFilter(filter);
    setFilterMenuOpen(false);
    if (filter === 'All') {
      setTableData(data);
    } else if (filter === 'High Detection (>500)') {
      setTableData(
        data.filter(
          (r) => parseFloat(r.detection.replace(/,/g, '')) > 500
        )
      );
    } else if (filter === 'Recent (2022-2024)') {
      setTableData(data.filter((r) => r.year >= 2022));
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0d162a] border border-[#172540] rounded-lg p-3.5 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-200 font-semibold text-sm tracking-wide">
          Year Comparison
        </h3>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0b1426] border border-[#1b2b48] hover:border-slate-500 rounded text-slate-300 text-[11px] transition-colors"
          >
            <span>Filter: {activeFilter}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {filterMenuOpen && (
            <div className="absolute right-0 top-7 w-44 bg-[#0e1933] border border-[#223558] rounded shadow-xl z-30 p-1.5 text-xs">
              {['All', 'High Detection (>500)', 'Recent (2022-2024)'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => applyTableFilter(opt)}
                  className={`w-full text-left px-2 py-1 rounded text-[11px] ${
                    activeFilter === opt
                      ? 'bg-sky-950 text-sky-400 font-medium'
                      : 'text-slate-300 hover:bg-[#152342]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1b2d4f] text-[11px] text-slate-400 font-medium">
              <th
                onClick={() => handleSort('year')}
                className="py-1.5 px-2 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Year</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('detection')}
                className="py-1.5 px-2 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Detections</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('peakArea')}
                className="py-1.5 px-2 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Burn Area</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('change')}
                className="py-1.5 px-2 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>YoY Change</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#152442]">
            {tableData.map((row) => {
              const isSelected = selectedYear === row.year;
              return (
                <tr
                  key={row.year}
                  onClick={() => onSelectYear && onSelectYear(row.year)}
                  className={`hover:bg-[#121f3b] transition-colors cursor-pointer ${
                    isSelected ? 'bg-sky-950/40 text-sky-200' : 'text-slate-300'
                  }`}
                >
                  <td className="py-2 px-2 font-semibold text-slate-200">
                    {row.year}
                  </td>
                  <td className="py-2 px-2 font-mono text-right text-white">
                    {row.detection}
                  </td>
                  <td className="py-2 px-2 font-mono text-right text-orange-400">
                    {row.peakArea}
                  </td>
                  <td className="py-2 px-2 font-mono text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        row.trend === 'up'
                          ? 'text-red-400'
                          : row.trend === 'down'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                      {row.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                      {row.trend === 'neutral' && <Minus className="w-3 h-3" />}
                      {row.change}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
