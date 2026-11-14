import React, { useState } from 'react';
import {
  Wind,
  Navigation2,
  Droplets,
  Flame,
  Gauge,
  Sun,
  Eye,
  Activity,
  AlertTriangle,
  Compass,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';
import { MetricMode, Language, RegionData } from './weatherTypes';

interface CurrentWeatherCardProps {
  currentRegion: RegionData;
  activeMode: MetricMode;
  onSelectMode: (mode: MetricMode) => void;
  language: Language;
  onOpenAlertDetails?: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  currentRegion,
  activeMode,
  onSelectMode,
  language,
  onOpenAlertDetails,
}) => {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const isAr = language === 'ar';
  const { current, alertCounts } = currentRegion;

  // Temperature conversion
  const displayTemp =
    unit === 'C' ? current.temp.toFixed(1) : ((current.temp * 9) / 5 + 32).toFixed(1);

  // Derived meteorological & fire weather indices
  const feelsLike =
    unit === 'C'
      ? (current.temp + (current.humidity > 40 ? 1.8 : 0.8)).toFixed(1)
      : (((current.temp + (current.humidity > 40 ? 1.8 : 0.8)) * 9) / 5 + 32).toFixed(1);

  const dewPoint = Math.max(
    current.temp - (100 - current.humidity) / 5,
    4.0
  ).toFixed(1);

  // Fire Danger Rating (0-100 scale derived from temp, wind, humidity, and drought)
  const fireDangerScore = Math.min(
    Math.round(
      (current.temp / 45) * 35 +
        (current.windSpeed / 50) * 30 +
        ((100 - current.humidity) / 100) * 25 +
        (current.droughtIndex / 800) * 10
    ),
    98
  );

  const getDangerLevel = (score: number) => {
    if (score >= 85) return { label: 'Extreme Fire Danger', labelAr: 'خطر حرائق فائق', color: '#ef4444', badgeBg: 'bg-red-500/25 text-red-200 border-red-500/50' };
    if (score >= 70) return { label: 'Severe Fire Danger', labelAr: 'خطر حرائق شديد', color: '#f97316', badgeBg: 'bg-orange-500/25 text-orange-200 border-orange-500/50' };
    if (score >= 50) return { label: 'High Fire Danger', labelAr: 'خطر حرائق مرتفع', color: '#eab308', badgeBg: 'bg-yellow-500/25 text-yellow-200 border-yellow-500/50' };
    return { label: 'Moderate Fire Risk', labelAr: 'خطر حرائق معتدل', color: '#10b981', badgeBg: 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50' };
  };

  const dangerMeta = getDangerLevel(fireDangerScore);

  return (
    <div className="weather-card-shell h-full flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-[#1c354a] bg-[#0a1b2a]/95 backdrop-blur-md shadow-2xl text-slate-100 hover:border-[#2a4b68] transition-all duration-200 gap-4 overflow-y-auto max-h-[840px] custom-scrollbar">
      {/* 1. Header & Live Feed Status */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1c354a]/80">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">☀️</span>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                {isAr ? 'الطقس والرصد اللحظي' : 'Current Weather'}
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/60">
                  GOES-16
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            className="text-xs font-bold font-mono px-3 py-1.5 rounded-lg bg-[#06121e] border border-[#1c354a] text-sky-300 hover:text-white hover:border-[#38bdf8] hover:bg-sky-950/60 transition-all cursor-pointer shadow-sm"
            title="Toggle °C / °F"
          >
            °{unit}
          </button>
        </div>

        {/* 2. Primary Solar Hub & Temperature Display */}
        <div className="flex items-center justify-between gap-3 my-3 p-3.5 rounded-xl bg-[#06121e]/80 border border-[#1c354a]/80 shadow-inner">
          <div className="flex items-center gap-3.5">
            {/* Animated Golden Sun Icon */}
            <div className="relative shrink-0 flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-md animate-pulse" />
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16 animate-[spin_40s_linear_infinite]"
              >
                {[...Array(12)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="12"
                    x2="50"
                    y2="2"
                    stroke="#fbbf24"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    transform={`rotate(${i * 30} 50 50)`}
                  />
                ))}
                <circle cx="50" cy="50" r="24" fill="#f59e0b" />
                <circle cx="50" cy="50" r="21" fill="#fbbf24" />
              </svg>
            </div>

            {/* Temperature & Condition Text */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono tabular-nums drop-shadow-md">
                  {displayTemp}
                </span>
                <span className="text-2xl font-bold text-[#38bdf8]">°{unit}</span>
              </div>
              <p
                className="text-sm font-bold text-slate-100 line-clamp-1 mt-0.5"
                title={isAr ? current.conditionAr : current.condition}
              >
                {isAr ? current.conditionAr : current.condition}
              </p>
            </div>
          </div>

          {/* High / Low & Feels Like Pill */}
          <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-xs font-mono text-slate-300 bg-[#0d2235] px-2.5 py-1 rounded-lg border border-[#1c354a] shadow-sm">
              {isAr ? 'المحسوسة:' : 'Feels:'} <strong className="text-amber-300 font-bold ml-1">{feelsLike}°{unit}</strong>
            </span>
            <span className="text-xs font-mono text-slate-300">
              {isAr ? 'نقطة الندى:' : 'Dew Point:'} <strong className="text-slate-100">{dewPoint}°{unit}</strong>
            </span>
          </div>
        </div>

        {/* 3. Fire Danger Index Rating Bar */}
        <div className="mb-3 p-3 rounded-xl bg-[#06121e]/85 border border-[#1c354a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              {isAr ? 'مؤشر خطر اشتعال الحرائق (FDI)' : 'Fire Danger Index (FDI)'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${dangerMeta.badgeBg}`}>
              {isAr ? dangerMeta.labelAr : dangerMeta.label}
            </span>
          </div>

          {/* Progress Meter */}
          <div className="relative w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-700/60 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 via-yellow-500 via-orange-500 to-red-500"
              style={{ width: `${fireDangerScore}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-300 mt-1.5 font-mono font-medium">
            <span>{isAr ? 'منخفض' : 'Low'}</span>
            <span className="text-amber-300 font-bold text-xs">{fireDangerScore} / 100 Pts</span>
            <span>{isAr ? 'فائق الخطورة' : 'Catastrophic'}</span>
          </div>
        </div>
      </div>

      {/* 4. Four Core Interactive Weather Vectors (Synced with Radar Map Mode) */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider px-1">
          {isAr ? 'المتجهات الحركية والحرارية' : 'Atmospheric Vector Controls'}
        </div>

        {/* Metric 1: Wind Speed & Gusts */}
        <div
          onClick={() => onSelectMode('wind')}
          className={`flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
            activeMode === 'wind'
              ? 'bg-[#0d2235] border border-[#38bdf8] shadow-lg shadow-sky-950/60 ring-1 ring-sky-400/40'
              : 'bg-[#06121e]/70 hover:bg-[#0d2235]/70 border border-[#1c354a]'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <Wind className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {isAr ? 'سرعة وهبات الرياح' : 'Speed Read & Gusts'}
              </span>
              <span className="text-sm font-extrabold text-white font-mono tabular-nums">
                {current.windSpeed} km/h
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono mt-0.5">
              <span>{isAr ? 'هبات متوقعة:' : 'Max Gust:'} <strong className="text-slate-100">{(current.windSpeed * 1.5).toFixed(0)} km/h</strong></span>
              <span className="text-cyan-300 font-semibold">{isAr ? 'بوفورت 5' : 'Beaufort 5'}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Wind Direction & Bearing */}
        <div
          onClick={() => onSelectMode('wind')}
          className="flex items-center gap-3.5 p-3 rounded-xl bg-[#06121e]/70 hover:bg-[#0d2235]/70 transition-all duration-200 cursor-pointer border border-[#1c354a]"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-950/90 border border-blue-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <Navigation2
              className="w-5 h-5 text-blue-400 transition-transform duration-500"
              style={{ transform: `rotate(${current.windDegrees - 45}deg)` }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {isAr ? 'اتجاه الرياح والبوصلة' : 'Weather Direction'}
              </span>
              <span className="text-sm font-extrabold text-white font-mono truncate">
                {isAr ? current.windDirectionAr : current.windDirection}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono mt-0.5">
              <span>{isAr ? 'زاوية الانحراف:' : 'Azimuth:'} <strong className="text-slate-100">{current.windDegrees}°</strong></span>
              <span className="text-blue-300 font-semibold">{isAr ? 'نقل حراري' : 'Thermal Advection'}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Relative Humidity */}
        <div
          onClick={() => onSelectMode('humidity')}
          className={`flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
            activeMode === 'humidity'
              ? 'bg-[#0d2235] border border-[#38bdf8] shadow-lg shadow-sky-950/60 ring-1 ring-sky-400/40'
              : 'bg-[#06121e]/70 hover:bg-[#0d2235]/70 border border-[#1c354a]'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-sky-950/90 border border-sky-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <Droplets className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {isAr ? 'الرطوبة النسبية (2m RH)' : 'Relative Humidity'}
              </span>
              <span className="text-sm font-extrabold text-white font-mono tabular-nums">
                {current.humidity}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono mt-0.5">
              <span className="text-amber-300 font-semibold">{isAr ? 'عجز رطوبة حاد' : 'Critical Fuel Dryness'}</span>
              <span>{isAr ? 'رطوبة الوقود: 6%' : 'Fine Fuel: 6.8%'}</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Drought KBDI Index */}
        <div
          onClick={() => onSelectMode('drought')}
          className={`flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
            activeMode === 'drought'
              ? 'bg-[#0d2235] border border-orange-500 shadow-lg shadow-orange-950/60 ring-1 ring-orange-400/40'
              : 'bg-[#06121e]/70 hover:bg-[#0d2235]/70 border border-[#1c354a]'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-950/90 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {isAr ? 'مؤشر الجفاف الإقليمي' : 'Drought Index (KBDI)'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white font-mono tabular-nums">
                  {current.droughtIndex}
                </span>
                <span className="text-xs font-bold text-orange-300">
                  ({isAr ? current.droughtSeverityAr : current.droughtSeverity})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono mt-0.5">
              <span className="text-orange-300 font-medium">{isAr ? 'استنزاف رطوبة التربة' : 'Subsurface Moisture Depleted'}</span>
              <span>{isAr ? 'مقياس 0-800' : '0-800 Scale'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Micro-Sensor Environmental Telemetry Grid (4 Tiles) */}
      <div className="pt-2.5 border-t border-[#1c354a]/80">
        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider px-1 mb-2.5">
          {isAr ? 'مجسات الغلاف الجوي والإشعاع' : 'Micro-Sensor Telemetry'}
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Tile 1: UV Index */}
          <div className="p-2.5 rounded-xl bg-[#06121e]/85 border border-[#1c354a] flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'مؤشر الأشعة UV' : 'UV Radiation'}
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="font-mono font-extrabold text-base text-white">{current.uvIndex}</span>
              <span className="text-xs font-bold text-red-300">{isAr ? 'فائق' : 'Extreme'}</span>
            </div>
          </div>

          {/* Tile 2: Barometer */}
          <div className="p-2.5 rounded-xl bg-[#06121e]/85 border border-[#1c354a] flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              {isAr ? 'الضغط الجوي' : 'Barometer'}
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="font-mono font-extrabold text-base text-white">{current.pressure}</span>
              <span className="text-xs font-medium text-slate-300">hPa</span>
            </div>
          </div>

          {/* Tile 3: Air Quality / Smoke PM2.5 */}
          <div className="p-2.5 rounded-xl bg-[#06121e]/85 border border-[#1c354a] flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? 'جودة الهواء' : 'Air Quality'}
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="font-mono font-extrabold text-base text-white">AQI 64</span>
              <span className="text-xs font-bold text-yellow-300">{isAr ? 'معتدل' : 'Moderate'}</span>
            </div>
          </div>

          {/* Tile 4: Visibility */}
          <div className="p-2.5 rounded-xl bg-[#06121e]/85 border border-[#1c354a] flex flex-col justify-between shadow-sm">
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              {isAr ? 'مدى الرؤية' : 'Visibility'}
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="font-mono font-extrabold text-base text-white">18.5</span>
              <span className="text-xs font-medium text-slate-300">km Clear</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Tactical Red Flag Warning Banner */}
      <div
        onClick={onOpenAlertDetails}
        className="p-3 rounded-xl bg-gradient-to-r from-red-950/80 via-red-900/50 to-[#0a1b2a] border border-red-500/60 hover:border-red-400 hover:shadow-lg hover:shadow-red-950/40 transition-all cursor-pointer flex items-center gap-3 group"
      >
        <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-500/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-red-200">
              {isAr ? 'تحذير الراية الحمراء (Red Flag)' : 'Red Flag Warning Active'}
            </span>
            <span className="text-xs font-bold font-mono text-red-300 group-hover:text-white transition-colors">
              {isAr ? 'عرض التفاصيل ←' : 'Details →'}
            </span>
          </div>
          <p className="text-xs text-slate-200 truncate mt-1 font-medium">
            {isAr
              ? 'رياح نشطة ورطوبة دون 25% تزيد من انتشار بؤر النيران'
              : 'Critical gusty winds & sub-25% RH accelerate fire propagation.'}
          </p>
        </div>
      </div>
    </div>
  );
};
