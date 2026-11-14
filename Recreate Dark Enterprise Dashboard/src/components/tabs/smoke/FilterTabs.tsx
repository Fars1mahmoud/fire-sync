import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  airQualityMetric: string;
  setAirQualityMetric: (metric: string) => void;
  fireSourceFilter: string;
  setFireSourceFilter: (source: string) => void;
  language: 'en' | 'ar';
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeTab,
  setActiveTab,
  airQualityMetric,
  setAirQualityMetric,
  fireSourceFilter,
  setFireSourceFilter,
  language,
}) => {
  const isAr = language === 'ar';
  const [aqDropdownOpen, setAqDropdownOpen] = useState(false);
  const [fireDropdownOpen, setFireDropdownOpen] = useState(false);

  const aqMetrics = [
    { id: 'all', label: 'Overall AQI (PM2.5/PM10)', labelAr: 'مؤشر AQI الكلي (PM2.5/PM10)' },
    { id: 'pm25', label: 'PM2.5 (Smoke Particles)', labelAr: 'جسيمات الدخان الدقيقة (PM2.5)' },
    { id: 'no2', label: 'NO₂ (Nitrogen Dioxide)', labelAr: 'ثاني أكسيد النيتروجين (NO₂)' },
    { id: 'co', label: 'CO (Carbon Monoxide)', labelAr: 'أول أكسيد الكربون (CO)' },
  ];

  const fireSources = [
    { id: 'all', label: 'All Sensors (MODIS & VIIRS)', labelAr: 'كافة الأقمار (MODIS و VIIRS)' },
    { id: 'modis', label: 'MODIS (Aqua/Terra 1km)', labelAr: 'قمر موديس (Aqua/Terra)' },
    { id: 'viirs', label: 'VIIRS (375m High-Res)', labelAr: 'فايرز فائق الدقة (VIIRS 375m)' },
    { id: 'sentinel', label: 'Sentinel-3 SLSTR', labelAr: 'سنتينل-3 (SLSTR)' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-[#0b1528]/95 p-1 rounded-xl border border-[#1b2b45] shadow-lg select-none">
      {/* 1. Layer */}
      <button
        type="button"
        onClick={() => setActiveTab('layer')}
        className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
          activeTab === 'layer'
            ? 'bg-[#1e2e4a] text-white shadow'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }`}
      >
        {isAr ? 'الطبقات' : 'Layer'}
      </button>

      {/* 2. Smoke */}
      <button
        type="button"
        onClick={() => setActiveTab('smoke')}
        className={`px-3.5 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
          activeTab === 'smoke'
            ? 'bg-[#0080ff] text-white shadow-[0_0_12px_rgba(0,128,255,0.6)]'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }`}
      >
        {isAr ? 'الدخان' : 'Smoke'}
      </button>

      {/* 3. AQI */}
      <button
        type="button"
        onClick={() => setActiveTab('aqi')}
        className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
          activeTab === 'aqi'
            ? 'bg-[#1e2e4a] text-white shadow'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }`}
      >
        {isAr ? 'جودة الهواء' : 'AQI'}
      </button>

      {/* 4. Dropdown for AQ Metrics */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setAqDropdownOpen(!aqDropdownOpen);
            setFireDropdownOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-[#0f1d36]/70 hover:bg-[#152747] rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
        >
          <span>
            {isAr
              ? aqMetrics.find((m) => m.id === airQualityMetric)?.labelAr
              : aqMetrics.find((m) => m.id === airQualityMetric)?.label.split(' ')[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {aqDropdownOpen && (
          <div className="absolute left-0 mt-1.5 w-60 bg-[#0d1a30] border border-[#1e3252] rounded-xl shadow-2xl py-1 z-50">
            {aqMetrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => {
                  setAirQualityMetric(metric.id);
                  setAqDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                  airQualityMetric === metric.id
                    ? 'bg-blue-600/30 text-cyan-300'
                    : 'text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <span>{isAr ? metric.labelAr : metric.label}</span>
                {airQualityMetric === metric.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Dropdown for Fire Satellite Sources */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setFireDropdownOpen(!fireDropdownOpen);
            setAqDropdownOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-[#0f1d36]/70 hover:bg-[#152747] rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
        >
          <span>
            {isAr
              ? fireSources.find((s) => s.id === fireSourceFilter)?.labelAr
              : fireSources.find((s) => s.id === fireSourceFilter)?.label.split(' ')[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {fireDropdownOpen && (
          <div className="absolute right-0 sm:left-0 mt-1.5 w-56 bg-[#0d1a30] border border-[#1e3252] rounded-xl shadow-2xl py-1 z-50">
            {fireSources.map((source) => (
              <button
                key={source.id}
                onClick={() => {
                  setFireSourceFilter(source.id);
                  setFireDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                  fireSourceFilter === source.id
                    ? 'bg-amber-600/30 text-amber-300'
                    : 'text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <span>{isAr ? source.labelAr : source.label}</span>
                {fireSourceFilter === source.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

