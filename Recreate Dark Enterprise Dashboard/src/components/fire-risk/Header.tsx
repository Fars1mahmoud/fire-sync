import React from 'react';
import { Eye, Sliders, Globe, Sparkles, Activity, Database } from 'lucide-react';

interface HeaderProps {
  viewMode: 'interactive' | 'original' | 'split';
  setViewMode: (mode: 'interactive' | 'original' | 'split') => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  onResetView: () => void;
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  isLiveBackend: boolean;
  isLoading?: boolean;
}

const COUNTRIES = [
  { code: 'BRA', flag: '🇧🇷', labelEn: 'Brazil', labelAr: 'البرازيل' },
  { code: 'CAN', flag: '🇨🇦', labelEn: 'Canada', labelAr: 'كندا' },
  { code: 'EGY', flag: '🇪🇬', labelEn: 'Egypt', labelAr: 'مصر' },
  { code: 'ALL', flag: '🌐', labelEn: 'Global', labelAr: 'عالمي' },
];

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  lang,
  setLang,
  selectedCountry,
  onSelectCountry,
  isLiveBackend,
  isLoading,
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-6 pt-5 pb-3 border-b border-[#112844]/60 bg-[#020b16]/70 backdrop-blur-md sticky top-0 z-40">
      {/* Title & Platform Branding */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(239,35,60,0.5)]">
            🔥
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <span className="text-blue-400">4.</span>
            <span>Fire Risk</span>
            <span className="text-slate-400 font-normal text-sm md:text-base hidden sm:inline">
              {lang === 'ar' ? '(مركز المخاطر التنبؤي)' : '(Predictive Risk Center)'}
            </span>
          </h1>
        </div>

        {/* Live Backend / Satellite Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isLiveBackend
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
            }`}
            title={
              isLiveBackend
                ? 'Connected to FastAPI Backend (NASA FIRMS SQLite Archive)'
                : 'Running on Calibrated Physical FWI Engine'
            }
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLiveBackend ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveBackend ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}
              ></span>
            </span>
            <span className="font-mono text-[11px] font-semibold">
              {isLiveBackend
                ? (lang === 'ar' ? 'باك إند مباشر: داتا حقيقية' : 'LIVE BACKEND: REAL DATA')
                : (lang === 'ar' ? 'نموذج فيزيائي مُعاير' : 'CALIBRATED PHYSICS ENGINE')}
            </span>
          </div>

          {isLoading && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400 animate-pulse font-mono">
              <Activity className="w-3 h-3 animate-spin" />
              <span>{lang === 'ar' ? 'مزامنة...' : 'Syncing...'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Country Selectors */}
      <div className="flex items-center bg-[#071626] border border-[#1b3453] rounded-xl p-1 gap-1 text-xs">
        {COUNTRIES.map((c) => {
          const isSelected = selectedCountry === c.code;
          return (
            <button
              key={c.code}
              onClick={() => onSelectCountry(c.code)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{c.flag}</span>
              <span>{lang === 'ar' ? c.labelAr : c.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Right Action Switchers */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#071626] border border-[#1b3453] rounded-xl p-1 text-xs">
          <button
            onClick={() => setViewMode('interactive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'interactive'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Interactive High-Fidelity Dashboard"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'لوحة تفاعلية 100%' : '100% Interactive UI'}</span>
            <span className="sm:hidden">{lang === 'ar' ? 'تفاعلي' : 'Live'}</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Compare Side-by-Side with Reference Image"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'مقارنة الشاشة' : 'Compare Split'}</span>
            <span className="sm:hidden">{lang === 'ar' ? 'مقارنة' : 'Split'}</span>
          </button>

          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'original'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Display reference original asset"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'صورة الأصل' : 'Original Image'}</span>
            <span className="sm:hidden">{lang === 'ar' ? 'أصل' : 'Asset'}</span>
          </button>
        </div>

        {/* Language switch */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071626] border border-[#1b3453] text-slate-300 hover:text-white hover:border-slate-400 text-xs font-semibold cursor-pointer transition-colors"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold">{lang === 'en' ? 'AR' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};
