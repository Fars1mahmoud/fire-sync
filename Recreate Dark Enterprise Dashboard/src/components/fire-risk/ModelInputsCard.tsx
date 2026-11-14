import React from 'react';
import { Thermometer, Droplets, Wind, Flame, Check } from 'lucide-react';

interface ModelInputsCardProps {
  activeInputs: {
    temperature: boolean;
    drought: boolean;
    weather: boolean;
    history: boolean;
  };
  onToggleInput: (key: 'temperature' | 'drought' | 'weather' | 'history') => void;
  lang: 'en' | 'ar';
}

export const ModelInputsCard: React.FC<ModelInputsCardProps> = ({
  activeInputs,
  onToggleInput,
  lang,
}) => {
  const inputs = [
    {
      key: 'temperature' as const,
      icon: Thermometer,
      labelEn: 'Temperature',
      labelAr: 'درجة الحرارة',
      detail: '34.2°C Avg',
    },
    {
      key: 'drought' as const,
      icon: Droplets,
      labelEn: 'Drought Index',
      labelAr: 'مؤشر الجفاف (KBDI)',
      detail: '680 / 800',
    },
    {
      key: 'weather' as const,
      icon: Wind,
      labelEn: 'Weather Forecast',
      labelAr: 'توقعات الرياح والطقس',
      detail: '24 km/h ENE',
    },
    {
      key: 'history' as const,
      icon: Flame,
      labelEn: 'Fire History',
      labelAr: 'سجل الحرائق التاريخي',
      detail: '10 Yrs Multi-sat',
    },
  ];

  return (
    <div className="bg-[#091b2f]/90 backdrop-blur-md rounded-2xl border border-[#1b3a5c] p-4.5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-white text-base md:text-[17px] font-medium tracking-tight">
          {lang === 'ar' ? 'مدخلات النموذج' : 'Model Inputs'}
        </h2>
        <span className="text-[11px] text-slate-400 font-normal">
          {Object.values(activeInputs).filter(Boolean).length}/4 Active
        </span>
      </div>

      <div className="space-y-2">
        {inputs.map((item) => {
          const Icon = item.icon;
          const isActive = activeInputs[item.key];

          return (
            <button
              key={item.key}
              onClick={() => onToggleInput(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                isActive
                  ? 'text-slate-200 hover:text-white hover:bg-white/5'
                  : 'text-slate-500 opacity-60 hover:opacity-80'
              }`}
              title={`Toggle ${item.labelEn} in risk model calculation`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}
                />
                <span className="text-[15px] font-normal tracking-tight">
                  {lang === 'ar' ? item.labelAr : item.labelEn}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  {item.detail}
                </span>
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    isActive
                      ? 'bg-blue-600/80 border-blue-400 text-white'
                      : 'border-slate-600 bg-transparent'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
