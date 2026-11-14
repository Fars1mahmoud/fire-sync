import React from 'react';
import { X, Satellite, Wind, Droplets, Thermometer, Radio, ShieldCheck } from 'lucide-react';

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: string;
  selectedYear: number | null;
}

export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  selectedYear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#0a1224] border-l border-[#1c2c4d] shadow-2xl z-50 flex flex-col p-4 text-xs select-none backdrop-blur-md animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#182744]">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-sky-400" />
          <h2 className="font-bold text-sm text-white">Telemetry & Observation Feed</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#16233d]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Selected Context */}
        <div className="bg-[#0e1933] border border-[#1e2e4e] rounded-lg p-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-300">
            Active Context: <span className="text-sky-400">{selectedRegion}</span>
            {selectedYear && <span className="text-amber-400"> ({selectedYear})</span>}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Consolidated multispectral observations from NOAA-20 VIIRS 375m and Terra/Aqua MODIS with active fire radiative energy analytics.
          </p>
        </div>

        {/* Environmental Indicators */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Atmospheric & Fuel Condition
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0e1933] border border-[#192845] rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                <span>Surface Temp</span>
              </div>
              <div className="text-base font-bold text-white font-mono">36.8 °C</div>
              <div className="text-[10px] text-red-400 font-medium">+3.8° above baseline</div>
            </div>

            <div className="bg-[#0e1933] border border-[#192845] rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>Mean Gusts</span>
              </div>
              <div className="text-base font-bold text-white font-mono">38 km/h</div>
              <div className="text-[10px] text-amber-400 font-medium">Direction: NW 310°</div>
            </div>

            <div className="bg-[#0e1933] border border-[#192845] rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fuel Moisture</span>
              </div>
              <div className="text-base font-bold text-white font-mono">16%</div>
              <div className="text-[10px] text-red-400 font-medium">Critical fuel dryness</div>
            </div>

            <div className="bg-[#0e1933] border border-[#192845] rounded p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sensor Health</span>
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono">100% NOMINAL</div>
              <div className="text-[10px] text-slate-400 font-medium">VIIRS + MODIS Live</div>
            </div>
          </div>
        </div>

        {/* Telemetry Log */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Satellite Sensor Telemetry
          </span>
          <div className="bg-[#080d19] border border-[#182643] rounded p-2.5 font-mono text-[10px] text-slate-300 space-y-1.5">
            <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
              <span>ORBITAL OVERPASS</span>
              <span className="text-emerald-400">SYNCED</span>
            </div>
            <div>[08:14:22 UTC] NOAA-20 VIIRS 375m I-Band Granule #4812 acquired</div>
            <div>[08:14:35 UTC] Radiative power inversion completed (MW threshold 5.0)</div>
            <div>[08:15:01 UTC] Multi-year anomaly baseline deviation calculated: +37.5%</div>
            <div>[08:15:18 UTC] PostGIS spatial geometries committed to local store</div>
          </div>
        </div>
      </div>
    </div>
  );
};
