import React from 'react';
import {
  Flame,
  LayoutGrid,
  MapPin,
  Activity,
  Compass,
  AlertTriangle,
  GitBranch,
  Crosshair,
  BarChart3,
  FileText,
  Camera,
  Settings,
  ArrowLeft,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showDetails: boolean;
  setShowDetails: (v: boolean | ((prev: boolean) => boolean)) => void;
  onOpenReport: () => void;
  onOpenCapture: () => void;
  onOpenSettings: () => void;
  onBack?: () => void;
  lang?: 'en' | 'ar';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  showDetails,
  setShowDetails,
  onOpenReport,
  onOpenCapture,
  onOpenSettings,
  onBack,
  lang = 'en',
}) => {
  const navItems = [
    { id: 'dashboard', label: lang === 'ar' ? 'الرئيسية' : 'Dashboard', icon: LayoutGrid },
    { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: MapPin },
    { id: 'thermal-activity', label: lang === 'ar' ? 'النشاط الحراري' : 'Thermal Activity', icon: Activity },
    { id: 'explore', label: lang === 'ar' ? 'استكشاف' : 'Explore', icon: Compass },
    { id: 'fire-detection', label: lang === 'ar' ? 'رصد الحرائق' : 'Fire Detection', icon: AlertTriangle },
    { id: 'seasonal-pattern', label: lang === 'ar' ? 'النمط الموسمي' : 'Seasonal Pattern', icon: GitBranch },
    { id: 'precision', label: lang === 'ar' ? 'الدقة' : 'Precision', icon: Crosshair },
    { id: 'analysis', label: lang === 'ar' ? 'التحليلات' : 'Analysis', icon: BarChart3 },
    { id: 'report', label: lang === 'ar' ? 'تقرير' : 'Report', icon: FileText, action: onOpenReport },
    { id: 'capture', label: lang === 'ar' ? 'التقاط' : 'Capture', icon: Camera, action: onOpenCapture },
    { id: 'settings', label: lang === 'ar' ? 'إعدادات' : 'Settings', icon: Settings, action: onOpenSettings },
  ];

  return (
    <header className="w-full bg-[#090f1d] border-b border-[#16233d] px-3 py-2 text-xs select-none">
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Brand & Details Toggle Stack */}
        <div className="flex items-center gap-3 shrink-0 pr-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#13203c] hover:bg-[#1a2d52] border border-[#22365e] rounded text-sky-400 font-semibold text-xs transition-colors"
              title={lang === 'ar' ? 'الرجوع إلى خريطة العمليات' : 'Return to Tactical Map'}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'خريطة العمليات' : 'Tactical Map'}</span>
            </button>
          )}

          <div className="flex flex-col gap-0.5">
            <div
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => setActiveTab('thermal-activity')}
            >
              {/* Fiery flame icon */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-950/40">
                <Flame className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white drop-shadow-sm">
                FireBoard
              </span>
              <span className="text-[10px] text-amber-500 font-mono font-semibold ml-1 bg-amber-950/50 px-1 py-0.2 rounded border border-amber-800/40">
                NASA FIRMS
              </span>
            </div>

            {/* Details toggle */}
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className={`flex items-center gap-1.5 px-1 py-0.5 rounded text-[10px] font-medium transition-colors ${
                showDetails
                  ? 'text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${showDetails ? 'bg-sky-400' : 'bg-slate-500'}`} />
                <span className="w-1.5 h-0.5 bg-slate-600" />
                <span className={`w-1.5 h-1.5 rounded-full ${showDetails ? 'bg-sky-400' : 'bg-slate-500'}`} />
              </div>
              <span>{lang === 'ar' ? 'لوحة القياسات' : 'Details Drawer'}</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`relative flex items-center gap-1 px-2 py-1 rounded transition-all text-[11px] whitespace-nowrap ${
                  isActive
                    ? 'text-sky-400 font-semibold bg-sky-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#13203c]/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute bottom-[-9px] left-1 right-1 h-0.5 bg-sky-500 shadow-[0_0_8px_#38bdf8]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
