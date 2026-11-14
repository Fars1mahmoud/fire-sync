import React, { useState } from 'react';
import { ChevronDown, Sliders, Wind, Flame, Eye } from 'lucide-react';
import { LayerState } from './smokeTypes';

interface LayerControlsProps {
  layers: LayerState;
  setLayers: React.Dispatch<React.SetStateAction<LayerState>>;
  smokeOpacity: number;
  setSmokeOpacity: (val: number) => void;
  windSpeed: number;
  setWindSpeed: (val: number) => void;
  language: 'en' | 'ar';
  hotspotsCount?: number;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  setLayers,
  smokeOpacity,
  setSmokeOpacity,
  windSpeed,
  setWindSpeed,
  language,
  hotspotsCount = 1428,
}) => {
  const isAr = language === 'ar';
  const [expandedSmoke, setExpandedSmoke] = useState(false);
  const [expandedAerosol, setExpandedAerosol] = useState(false);
  const [expandedAqi, setExpandedAqi] = useState(false);
  const [expandedWind, setExpandedWind] = useState(false);

  const toggleLayer = (key: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#0b1426]/95 border border-[#1b2b45] rounded-2xl p-4 shadow-xl backdrop-blur-md select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <span>{isAr ? 'التحكم في الطبقات' : 'Layer Controls'}</span>
        </h2>
        <span className="text-[10px] font-mono font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50">
          {Object.values(layers).filter(Boolean).length}/5 {isAr ? 'طبقات نشطة' : 'Active'}
        </span>
      </div>

      {/* Layer Items List */}
      <div className="flex flex-col gap-2.5">
        {/* 1. Smoke (Sentinel-5P) */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between py-1 px-1">
            <button
              type="button"
              role="switch"
              aria-checked={layers.smoke}
              aria-label="Toggle Smoke (Sentinel-5P) layer"
              onClick={() => toggleLayer('smoke')}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                layers.smoke ? 'bg-[#0080ff]' : 'bg-[#1e293b]'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 rounded-full transition-transform duration-200 transform ${
                  layers.smoke
                    ? 'translate-x-6 bg-gradient-to-tr from-purple-600 to-indigo-400 shadow-[0_0_8px_rgba(147,51,234,0.9)]'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
              {layers.smoke && (
                <span className="absolute left-1.5 text-[9px] text-white font-bold">✓</span>
              )}
            </button>

            <span
              onClick={() => toggleLayer('smoke')}
              className="flex-1 ml-3 text-sm font-medium text-slate-100 hover:text-white cursor-pointer"
            >
              {isAr ? 'سحب الدخان (سنتينل-5P)' : 'Smoke (Sentinel-5P)'}
            </span>

            <button
              type="button"
              aria-label="Expand Smoke Settings"
              onClick={() => setExpandedSmoke(!expandedSmoke)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedSmoke ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Expanded Smoke Opacity Slider */}
          {expandedSmoke && (
            <div className="mt-2 p-2.5 bg-[#09101d] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between items-center">
                <span>{isAr ? 'شفافية طبقة الدخان' : 'Plume Opacity'}</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(smokeOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={smokeOpacity}
                onChange={(e) => setSmokeOpacity(parseFloat(e.target.value))}
                aria-label="Smoke Opacity"
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* 2. Aerosol Index */}
        <div className="flex flex-col border-t border-slate-800/50 pt-2">
          <div className="flex items-center justify-between py-1 px-1">
            <button
              type="button"
              role="switch"
              aria-checked={layers.aerosol}
              aria-label="Toggle Aerosol Index layer"
              onClick={() => toggleLayer('aerosol')}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                layers.aerosol ? 'bg-[#0080ff]' : 'bg-[#1e293b]'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  layers.aerosol ? 'translate-x-6 shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'translate-x-1 bg-slate-400'
                }`}
              />
              {layers.aerosol && (
                <span className="absolute left-1.5 text-[9px] text-white font-bold">✓</span>
              )}
            </button>

            <span
              onClick={() => toggleLayer('aerosol')}
              className="flex-1 ml-3 text-sm font-medium text-slate-100 hover:text-white cursor-pointer"
            >
              {isAr ? 'مؤشر الهباء الجوي (AOD)' : 'Aerosol Index'}
            </span>

            <button
              type="button"
              aria-label="Expand Aerosol Index settings"
              onClick={() => setExpandedAerosol(!expandedAerosol)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedAerosol ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Expanded Aerosol Settings */}
          {expandedAerosol && (
            <div className="mt-2 p-2.5 bg-[#09101d] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between items-center">
                <span>{isAr ? 'مؤشر امتصاص الأشعة فوق البنفسجية' : 'UV Absorbing Index'}</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {layers.aerosol ? '3.8 UVAI' : 'Off'}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-purple-800" />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0 ({isAr ? 'نقي' : 'Clean'})</span>
                <span>2.5</span>
                <span>5.0+ ({isAr ? 'حرج' : 'Extreme'})</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Air Quality (AQI) */}
        <div className="flex flex-col border-t border-slate-800/50 pt-2">
          <div className="flex items-center justify-between py-1 px-1">
            <button
              type="button"
              role="switch"
              aria-checked={layers.aqi}
              aria-label="Toggle Air Quality (AQI) layer"
              onClick={() => toggleLayer('aqi')}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                layers.aqi ? 'bg-[#0080ff]' : 'bg-[#1e293b]'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  layers.aqi ? 'translate-x-6 shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'translate-x-1 bg-slate-400'
                }`}
              />
              {layers.aqi && (
                <span className="absolute left-1.5 text-[9px] text-white font-bold">✓</span>
              )}
            </button>

            <span
              onClick={() => toggleLayer('aqi')}
              className="flex-1 ml-3 text-sm font-medium text-slate-100 hover:text-white cursor-pointer"
            >
              {isAr ? 'شبكة جودة الهواء السطحية' : 'Air Quality (AQI)'}
            </span>

            <button
              type="button"
              aria-label="Expand Air Quality settings"
              onClick={() => setExpandedAqi(!expandedAqi)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedAqi ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Expanded AQI details */}
          {expandedAqi && (
            <div className="mt-2 p-2.5 bg-[#09101d] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span>{isAr ? 'محطات الرصد النشطة' : 'Monitoring Stations'}</span>
                <span className="text-emerald-400 font-mono font-semibold">14 {isAr ? 'محطة' : 'Active'}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'الملوث السائد' : 'Dominant Pollutant'}</span>
                <span className="text-orange-400 font-medium">PM2.5 Wildfire Smoke</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Wind Overlay */}
        <div className="flex flex-col border-t border-slate-800/50 pt-2">
          <div className="flex items-center justify-between py-1 px-1">
            <button
              type="button"
              role="switch"
              aria-checked={layers.wind}
              aria-label="Toggle Wind Overlay layer"
              onClick={() => toggleLayer('wind')}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                layers.wind ? 'bg-[#0080ff]' : 'bg-[#1e293b]'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  layers.wind ? 'translate-x-6 shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'translate-x-1 bg-slate-400'
                }`}
              />
              {layers.wind && (
                <span className="absolute left-1.5 text-[9px] text-white font-bold">✓</span>
              )}
            </button>

            <span
              onClick={() => toggleLayer('wind')}
              className="flex-1 ml-3 text-sm font-medium text-slate-100 hover:text-white cursor-pointer"
            >
              {isAr ? 'خطوط تيار الرياح الديناميكية' : 'Wind Overlay'}
            </span>

            <button
              type="button"
              aria-label="Expand Wind settings"
              onClick={() => setExpandedWind(!expandedWind)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedWind ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Expanded Wind Speed control */}
          {expandedWind && (
            <div className="mt-2 p-2.5 bg-[#09101d] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between items-center">
                <span>{isAr ? 'سرعة حركة الجزيئات' : 'Vector Particle Speed'}</span>
                <span className="font-mono text-cyan-400 font-bold">{windSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                aria-label="Wind stream speed"
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* 5. Fire Sources */}
        <div className="border-t border-slate-800/50 pt-2">
          <div className="flex items-center justify-between py-1 px-1">
            <button
              type="button"
              role="switch"
              aria-checked={layers.fireSources}
              aria-label="Toggle Fire Sources layer"
              onClick={() => toggleLayer('fireSources')}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                layers.fireSources ? 'bg-[#0080ff]' : 'bg-[#1e293b]'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  layers.fireSources
                    ? 'translate-x-6 shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
            </button>

            <span
              onClick={() => toggleLayer('fireSources')}
              className="flex-1 ml-3 text-sm font-medium text-slate-100 hover:text-white cursor-pointer"
            >
              {isAr ? 'بؤر مصادر الحرائق الحرارية' : 'Fire Sources'}
            </span>

            {layers.fireSources && (
              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded font-mono font-semibold">
                {hotspotsCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
