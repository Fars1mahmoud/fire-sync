import React from 'react';
import { PredictionPeriod } from './types';

interface PredictionPeriodCardProps {
  selectedPeriod: PredictionPeriod;
  onSelectPeriod: (period: PredictionPeriod) => void;
  lang: 'en' | 'ar';
}

const PERIODS: { id: PredictionPeriod; labelEn: string; labelAr: string }[] = [
  { id: 'Next 12 Hours', labelEn: 'Next 12 Hours', labelAr: 'الـ 12 ساعة القادمة' },
  { id: 'Next 24 Hours', labelEn: 'Next 24 Hours', labelAr: 'الـ 24 ساعة القادمة' },
  { id: 'Next 72 Hours', labelEn: 'Next 72 Hours', labelAr: 'الـ 72 ساعة القادمة' },
  { id: 'Next 7 Days', labelEn: 'Next 7 Days', labelAr: 'الـ 7 أيام القادمة' },
];

export const PredictionPeriodCard: React.FC<PredictionPeriodCardProps> = ({
  selectedPeriod,
  onSelectPeriod,
  lang,
}) => {
  return (
    <div className="bg-[#091b2f]/90 backdrop-blur-md rounded-2xl border border-[#1b3a5c] p-4.5 shadow-lg shadow-black/40">
      <h2 className="text-white text-base md:text-[17px] font-medium mb-3.5 tracking-tight">
        {lang === 'ar' ? 'فترة التنبؤ' : 'Prediction Period'}
      </h2>

      <div className="space-y-1.5" role="radiogroup" aria-label="Prediction Period">
        {PERIODS.map((period) => {
          const isSelected = selectedPeriod === period.id;
          return (
            <button
              key={period.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPeriod(period.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#0b74f4] text-white shadow-md shadow-blue-600/40 font-medium'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 font-normal'
              }`}
            >
              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-2 border-white bg-transparent'
                    : 'border-2 border-slate-500 bg-transparent'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
              </div>

              <span className="text-[15px] tracking-tight">
                {lang === 'ar' ? period.labelAr : period.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
