import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  X,
  SlidersHorizontal,
  Flame,
  Globe2,
} from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;
  selectedInterval: string;
  setSelectedInterval: (i: string) => void;
  selectedParameter: string;
  setSelectedParameter: (p: string) => void;
  filterConfidence: string;
  setFilterConfidence: (c: string) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedRegion,
  setSelectedRegion,
  selectedInterval,
  setSelectedInterval,
  selectedParameter,
  setSelectedParameter,
  filterConfidence,
  setFilterConfidence,
  onResetFilters,
}) => {
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [intervalMenuOpen, setIntervalMenuOpen] = useState(false);
  const [parameterMenuOpen, setParameterMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const regionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<HTMLDivElement>(null);
  const paramRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionMenuOpen(false);
      }
      if (intervalRef.current && !intervalRef.current.contains(e.target as Node)) {
        setIntervalMenuOpen(false);
      }
      if (paramRef.current && !paramRef.current.contains(e.target as Node)) {
        setParameterMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regions = [
    { label: 'All Regions (Global Archive)', code: 'ALL' },
    { label: 'Brazil (Amazon & Cerrado)', code: 'BRA' },
    { label: 'Canada (Boreal & Alberta)', code: 'CAN' },
    { label: 'Egypt (Delta & Coast)', code: 'EGY' },
    { label: 'Mediterranean (Greece)', code: 'GRC' },
    { label: 'United States (California)', code: 'USA' },
  ];

  const intervals = ['Annual', 'Monthly', 'Seasonal'];
  const parameters = [
    'MODIS Thermal Anomaly',
    'VIIRS 375m Active Fire',
    'FRP Fire Radiative Power',
    'High Confidence Cluster',
  ];
  const filterCategories = [
    'All',
    'High Confidence (≥80%)',
    'Vegetation & Forest',
  ];

  return (
    <div className="w-full bg-[#080d1a] px-3 py-2 border-b border-[#131f36] flex flex-wrap items-center justify-between gap-2.5 text-xs select-none">
      {/* Left controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-32 sm:w-44 h-7 pl-2.5 pr-6 bg-[#0b1426] border border-[#1b2b48] rounded text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2 pointer-events-none" />
          )}
        </div>

        {/* Region Selector Dropdown */}
        <div className="relative" ref={regionRef}>
          <button
            type="button"
            onClick={() => setRegionMenuOpen(!regionMenuOpen)}
            className="h-7 px-2.5 flex items-center gap-1.5 bg-[#0b1426] border border-[#1c2c49] hover:border-sky-500/60 rounded text-sky-400 font-semibold transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[170px]">
              {selectedRegion}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {regionMenuOpen && (
            <div className="absolute left-0 top-8 w-56 bg-[#0c162c] border border-[#23385e] rounded shadow-xl z-50 p-1 space-y-0.5">
              {regions.map((reg) => (
                <button
                  key={reg.code}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(reg.label);
                    setRegionMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between ${
                    selectedRegion === reg.label
                      ? 'bg-sky-950 text-sky-400 font-bold'
                      : 'text-slate-300 hover:bg-[#152342]'
                  }`}
                >
                  <span className="truncate">{reg.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {reg.code}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interval Selector */}
        <div className="relative" ref={intervalRef}>
          <button
            type="button"
            onClick={() => setIntervalMenuOpen(!intervalMenuOpen)}
            className="h-7 px-2 flex items-center gap-1 bg-[#0b1426] border border-[#1c2c49] hover:border-slate-500 rounded text-slate-300 transition-colors"
          >
            <span>{selectedInterval}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {intervalMenuOpen && (
            <div className="absolute left-0 top-8 w-32 bg-[#0c162c] border border-[#23385e] rounded shadow-xl z-50 p-1 space-y-0.5">
              {intervals.map((intv) => (
                <button
                  key={intv}
                  type="button"
                  onClick={() => {
                    setSelectedInterval(intv);
                    setIntervalMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-[11px] ${
                    selectedInterval === intv
                      ? 'bg-sky-950 text-sky-400 font-semibold'
                      : 'text-slate-300 hover:bg-[#152342]'
                  }`}
                >
                  {intv}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Parameter Selector */}
        <div className="relative hidden md:block" ref={paramRef}>
          <button
            type="button"
            onClick={() => setParameterMenuOpen(!parameterMenuOpen)}
            className="h-7 px-2.5 flex items-center gap-1.5 bg-[#0b1426] border border-[#1c2c49] hover:border-slate-500 rounded text-slate-300 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate max-w-[140px]">{selectedParameter}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {parameterMenuOpen && (
            <div className="absolute left-0 top-8 w-52 bg-[#0c162c] border border-[#23385e] rounded shadow-xl z-50 p-1 space-y-0.5">
              {parameters.map((param) => (
                <button
                  key={param}
                  type="button"
                  onClick={() => {
                    setSelectedParameter(param);
                    setParameterMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] ${
                    selectedParameter === param
                      ? 'bg-sky-950 text-sky-400 font-semibold'
                      : 'text-slate-300 hover:bg-[#152342]'
                  }`}
                >
                  {param}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Confidence Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className={`h-7 px-2.5 flex items-center gap-1.5 bg-[#0b1426] border rounded transition-colors ${
              filterConfidence !== 'All'
                ? 'border-amber-500/80 text-amber-400'
                : 'border-[#1c2c49] text-slate-300 hover:border-slate-500'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>Filter: {filterConfidence}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {filterMenuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-[#0c162c] border border-[#23385e] rounded shadow-xl z-50 p-1 space-y-0.5">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setFilterConfidence(cat);
                    setFilterMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] ${
                    filterConfidence === cat
                      ? 'bg-amber-950/60 text-amber-400 font-semibold'
                      : 'text-slate-300 hover:bg-[#152342]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onResetFilters}
          className="h-7 px-2 text-slate-400 hover:text-white hover:bg-[#14223d] rounded transition-colors"
          title="Reset All Filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
