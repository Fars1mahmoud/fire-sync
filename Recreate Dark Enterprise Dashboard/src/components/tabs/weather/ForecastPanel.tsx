import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  Flame,
  Radio,
  Clock,
  Wind,
  Droplets,
  Activity,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { ForecastDayItem, Language, RegionData, StationData } from './weatherTypes';

interface ForecastPanelProps {
  currentRegion: RegionData;
  language: Language;
  onSelectDay?: (day: ForecastDayItem) => void;
  onOpenAlertDetails?: () => void;
  onSelectStation?: (station: StationData) => void;
}

export const ForecastPanel: React.FC<ForecastPanelProps> = ({
  currentRegion,
  language,
  onSelectDay,
  onOpenAlertDetails,
  onSelectStation,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('f-1');
  const isAr = language === 'ar';
  const { forecast, alertCounts, stations } = currentRegion;

  return (
    <div className="weather-forecast-shell h-full flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-[#1c354a] bg-[#0a1b2a]/95 backdrop-blur-md shadow-2xl text-slate-100 hover:border-[#2a4b68] transition-all duration-200 gap-4 overflow-y-auto max-h-[840px] custom-scrollbar">
      {/* 1. Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#1c354a]/80">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📅</span>
            <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              {isAr ? 'توقعات الطقس ومخاطر النيران' : 'Forecast (Next 5 Days)'}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#06121e] text-[#38bdf8] border border-[#1c354a] flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isAr ? 'نموذج ECMWF' : 'Live ECMWF'}
          </span>
        </div>

        {/* 2. 5-Day Tactical List with Detailed Meteorological Micro-Badges */}
        <div className="mt-3.5 space-y-2.5">
          {forecast.map((day) => {
            const isSelected = selectedDayId === day.id;

            // Render special thumbnail radar card for Saturday ("Frontal Wind Shift & Heat Corridor")
            if (day.isRadarThumbnail) {
              return (
                <div
                  key={day.id}
                  onClick={() => {
                    setSelectedDayId(day.id);
                    onSelectDay?.(day);
                  }}
                  className={`group relative rounded-xl overflow-hidden p-3 transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#0d2235] ring-1 ring-[#38bdf8]/50 shadow-lg'
                      : 'border-[#1c354a] bg-[#06121e]/85 hover:border-[#2a4b68]'
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block">
                        {isAr ? day.dayNameAr : day.dayName}
                      </span>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {day.dateStr}
                      </span>
                    </div>

                    {/* Mini radar card thumbnail */}
                    <div className="relative flex-1 flex items-center justify-between gap-2.5 p-1.5 px-3 rounded-lg bg-[#0a1b2a] border border-[#1c354a]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded bg-[#071322] border border-sky-400/50 relative overflow-hidden flex items-center justify-center shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/50 via-amber-500/50 to-red-600/50" />
                          <CloudSun className="w-4 h-4 text-white relative z-10 drop-shadow" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-extrabold text-white font-mono tabular-nums block leading-tight">
                            {day.temp}°C
                          </span>
                          <span className="text-xs text-[#38bdf8] font-bold truncate block">
                            {isAr ? day.radarLabelAr : day.radarLabel}
                          </span>
                        </div>
                      </div>

                      {/* Saturday Frontal Warning Pill */}
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/25 text-amber-200 border border-amber-500/50 shrink-0">
                        {isAr ? 'جبهة هوائية' : 'Frontal'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // Standard Day Rows: Day | Icon | Micro Metrics | Temp Range
            const isHighHeat = day.temp >= 36;
            return (
              <div
                key={day.id}
                onClick={() => {
                  setSelectedDayId(day.id);
                  onSelectDay?.(day);
                }}
                className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0d2235] border-[#38bdf8] shadow-md ring-1 ring-sky-400/30'
                    : 'bg-[#06121e]/70 border-[#1c354a]/80 hover:bg-[#0d2235]/60 hover:border-[#1c354a]'
                }`}
              >
                {/* Day Name & Date */}
                <div className="w-20 min-w-0">
                  <span className="text-sm font-bold text-white block truncate">
                    {isAr ? day.dayNameAr : day.dayName}
                  </span>
                  <span className="text-xs text-slate-300 font-mono font-medium">
                    {day.dateStr}
                  </span>
                </div>

                {/* Weather Icon with radiant glow */}
                <div className="flex items-center justify-center px-1">
                  {day.iconType === 'sun' ? (
                    <Sun className="w-5 h-5 text-amber-400 drop-shadow" />
                  ) : (
                    <CloudSun className="w-5 h-5 text-amber-300 drop-shadow" />
                  )}
                </div>

                {/* Micro indicators: Wind & Humidity */}
                <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    {day.windSpeed}k
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    {day.humidity}%
                  </span>
                </div>

                {/* Temperature Range & Risk Tag */}
                <div className="text-right flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white font-mono tabular-nums">
                    {day.tempHigh}°
                    <span className="text-xs text-slate-300 font-semibold"> / {day.tempLow}°</span>
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isHighHeat ? 'bg-red-500 ring-2 ring-red-500/40' : 'bg-amber-400'
                    }`}
                    title={isHighHeat ? 'High Fire Weather' : 'Moderate'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Diurnal Fire Spread Window (Crucial Tactical Operational Metric) */}
      <div className="p-3.5 rounded-xl bg-[#06121e]/85 border border-[#1c354a]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            {isAr ? 'نافذة ذروة انتشار النيران اليومية' : 'Diurnal Peak Burning Window'}
          </span>
          <span className="text-xs font-mono font-bold text-red-300 px-2 py-0.5 rounded-md bg-red-950/80 border border-red-500/40">
            {isAr ? 'نشط الآن' : 'Active Phase'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-amber-300 py-1.5 px-3 rounded-lg bg-[#0a1b2a] border border-[#1c354a] mb-2.5 shadow-sm">
          <span>12:00 - 18:00 Local</span>
          <span className="text-xs text-slate-200 font-medium">
            {isAr ? 'أدنى رطوبة + أقصى حرارة' : 'Peak Solar + Sub-20% RH'}
          </span>
        </div>

        {/* Diurnal Timeline Visualization */}
        <div className="relative w-full h-2 rounded-full bg-slate-900 overflow-hidden flex border border-slate-700/50">
          <div className="w-[30%] bg-emerald-500/60" title="Morning (Moderate)" />
          <div className="w-[45%] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" title="Afternoon (Critical Peak)" />
          <div className="w-[25%] bg-sky-600/60" title="Evening (Recovery)" />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-300 font-mono font-medium mt-1.5">
          <span>06:00</span>
          <span className="text-amber-300 font-bold">{isAr ? 'الذروة الحرارية 14:00' : 'Peak 14:00'}</span>
          <span>22:00</span>
        </div>
      </div>

      {/* 4. Automated Weather Stations (RAWS) Live Telemetry Feeds */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            {isAr ? 'محطات الرصد السطحي (RAWS)' : 'Regional Telemetry Nodes'}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {stations.length} {isAr ? 'متصلة' : 'Online'}
          </span>
        </div>

        <div className="space-y-2">
          {stations.slice(0, 3).map((station) => (
            <div
              key={station.id}
              onClick={() => onSelectStation?.(station)}
              className="p-2.5 rounded-xl bg-[#06121e]/80 border border-[#1c354a] hover:border-sky-500/60 hover:bg-[#0d2235]/70 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                    {isAr ? station.nameAr || station.name : station.name}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-0.5 ml-5">
                  <span className="font-semibold text-slate-200">{station.code}</span>
                  <span>·</span>
                  <span>{station.windSpeed} km/h {station.windDir}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold font-mono text-white block">
                  {station.temp}°C
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    station.status === 'Extreme'
                      ? 'bg-red-500/25 text-red-200'
                      : station.status === 'High'
                      ? 'bg-orange-500/25 text-orange-200'
                      : 'bg-emerald-500/25 text-emerald-200'
                  }`}
                >
                  {station.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Risk KPI Badges (Interactive 4-Card Trigger for Hazard Center) */}
      <div className="pt-2.5 border-t border-[#1c354a]/80">
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* Item 1: Aff. Infra */}
          <div
            onClick={onOpenAlertDetails}
            className="p-2 rounded-xl bg-[#06121e] border border-red-500/40 hover:border-red-500 hover:bg-red-950/30 transition-all cursor-pointer group shadow-sm"
          >
            <div className="text-[11px] font-bold text-slate-200 truncate mb-1">
              {isAr ? 'منشآت متأثرة' : 'Aff. Infra'}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-red-400 text-sm">🚨</span>
              <span className="font-mono font-extrabold text-sm text-red-200 tabular-nums">
                {alertCounts.affectedInfra}
              </span>
            </div>
          </div>

          {/* Item 2: Threat Lvl */}
          <div
            onClick={onOpenAlertDetails}
            className="p-2 rounded-xl bg-[#06121e] border border-amber-500/40 hover:border-amber-500 hover:bg-amber-950/30 transition-all cursor-pointer group shadow-sm"
          >
            <div className="text-[11px] font-bold text-slate-200 truncate mb-1">
              {isAr ? 'درجة التهديد' : 'Threat Lvl'}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-amber-400 text-sm">⚠️</span>
              <span className="font-mono font-extrabold text-sm text-amber-200 tabular-nums">
                {alertCounts.threatScore}
              </span>
            </div>
          </div>

          {/* Item 3: Priority */}
          <div
            onClick={onOpenAlertDetails}
            className="p-2 rounded-xl bg-[#06121e] border border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-950/30 transition-all cursor-pointer group shadow-sm"
          >
            <div className="text-[11px] font-bold text-slate-200 truncate mb-1">
              {isAr ? 'مناطق أولوية' : 'Priority'}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-emerald-400 text-sm">▲</span>
              <span className="font-mono font-extrabold text-sm text-emerald-200 tabular-nums">
                {alertCounts.priorityAreas}
              </span>
            </div>
          </div>

          {/* Item 4: Alert Sec. */}
          <div
            onClick={onOpenAlertDetails}
            className="p-2 rounded-xl bg-[#06121e] border border-sky-500/40 hover:border-sky-500 hover:bg-sky-950/30 transition-all cursor-pointer group shadow-sm"
          >
            <div className="text-[11px] font-bold text-slate-200 truncate mb-1">
              {isAr ? 'قطاعات الإنذار' : 'Alert Sec.'}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sky-400 text-sm">🔔</span>
              <span className="font-mono font-extrabold text-sm text-sky-200 tabular-nums">
                {alertCounts.alertSectors}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
