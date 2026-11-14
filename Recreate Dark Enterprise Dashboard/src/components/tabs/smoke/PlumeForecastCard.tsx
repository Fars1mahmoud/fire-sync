import React from 'react';
import { Play, Pause } from 'lucide-react';
import { PlumeForecast } from './smokeTypes';

interface PlumeForecastCardProps {
  forecasts: PlumeForecast[];
  selectedForecast: PlumeForecast;
  onSelectForecast: (forecast: PlumeForecast) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  language: 'en' | 'ar';
}

export const PlumeForecastCard: React.FC<PlumeForecastCardProps> = ({
  forecasts,
  selectedForecast,
  onSelectForecast,
  isPlaying,
  onTogglePlay,
  language,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="bg-[#0b1426]/95 border border-[#1b2b45] rounded-2xl p-4 shadow-xl backdrop-blur-md select-none">
      {/* Title & Play control */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-base tracking-wide">
          {isAr ? 'توقعات انتشار الدخان (بالساعات)' : 'Plume Forecast (Hours)'}
        </h2>
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause forecast timeline' : 'Play forecast timeline'}
          className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isPlaying ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل المحاكاة' : 'Animate')}</span>
        </button>
      </div>

      {/* 2x2 Grid of thumbnails */}
      <div className="grid grid-cols-2 gap-3">
        {forecasts.map((forecast) => {
          const isSelected = selectedForecast.id === forecast.id;
          return (
            <div
              key={forecast.id}
              onClick={() => onSelectForecast(forecast)}
              className="flex flex-col items-center group cursor-pointer"
            >
              {/* Thumbnail image container */}
              <div
                className={`relative w-full aspect-[1.15] rounded-xl overflow-hidden border-2 transition-all duration-200 bg-[#070d18] ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-[1.02]'
                    : 'border-[#172740] hover:border-slate-500 opacity-80 hover:opacity-100'
                }`}
              >
                <img
                  src={forecast.image}
                  alt={`${forecast.label} plume forecast`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="eager"
                />
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-1.5 text-xs font-semibold tracking-wider transition-colors ${
                  isSelected ? 'text-cyan-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {isAr ? forecast.labelAr : forecast.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

