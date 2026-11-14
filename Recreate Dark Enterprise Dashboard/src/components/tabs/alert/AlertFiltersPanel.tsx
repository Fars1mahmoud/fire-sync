import React from 'react';
import { Check, ShieldAlert, Filter } from 'lucide-react';
import { SeverityLevel, AlertStatus } from './alertTypes';

interface AlertFiltersPanelProps {
  selectedSeverities: SeverityLevel[];
  onToggleSeverity: (severity: SeverityLevel) => void;
  statusFilter: 'all' | 'custom';
  selectedStatuses: AlertStatus[];
  onSelectAllStatuses: () => void;
  onToggleStatus: (status: AlertStatus) => void;
  severityCounts: Record<SeverityLevel, number>;
  language: 'en' | 'ar';
}

export const AlertFiltersPanel: React.FC<AlertFiltersPanelProps> = ({
  selectedSeverities,
  onToggleSeverity,
  statusFilter,
  selectedStatuses,
  onSelectAllStatuses,
  onToggleStatus,
  severityCounts,
  language,
}) => {
  const isAr = language === 'ar';

  const severities: { label: SeverityLevel; labelAr: string; bgClass: string; hex: string }[] = [
    { label: 'Critical', labelAr: 'حرج للغاية', bgClass: 'bg-[#c52222]', hex: '#c52222' },
    { label: 'High', labelAr: 'مرتفع', bgClass: 'bg-[#e65c00]', hex: '#e65c00' },
    { label: 'Moderate', labelAr: 'متوسط', bgClass: 'bg-[#eab308]', hex: '#eab308' },
    { label: 'Low', labelAr: 'منخفض', bgClass: 'bg-[#22c55e]', hex: '#22c55e' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Top Filter Card: Alert Filters */}
      <div className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-5 shadow-xl shadow-black/40">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-3 flex items-center justify-between">
          <span>{isAr ? 'تصفية التنبيهات' : 'Alert Filters'}</span>
          <Filter className="w-4 h-4 text-cyan-400" />
        </h2>
        
        <div className="text-xs text-[#7d93b2] font-medium tracking-wide mb-3">
          {isAr ? 'مستوى الخطورة والحرج:' : 'Criticality Level:'}
        </div>

        <div className="space-y-3.5">
          {severities.map((item) => {
            const isSelected = selectedSeverities.includes(item.label);
            const count = severityCounts[item.label] || 0;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onToggleSeverity(item.label)}
                className={`w-full flex items-center justify-between group py-1 rounded-lg transition-all text-left cursor-pointer ${
                  isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-[5px] ${item.bgClass} shrink-0 transition-transform group-hover:scale-110 shadow-sm`}
                  />
                  <span className="text-[15px] sm:text-[16px] font-medium text-slate-100 tracking-tight group-hover:text-white">
                    {isAr ? item.labelAr : item.label}
                  </span>
                </div>

                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#0d1d33] border border-[#1a385f] text-slate-400 group-hover:text-cyan-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Filter Card: Status */}
      <div className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-5 shadow-xl shadow-black/40">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4">
          {isAr ? 'حالة التنبيه' : 'Status'}
        </h2>

        <div className="space-y-3">
          {/* "All" button with distinct vibrant blue icon matching the screenshot */}
          <button
            type="button"
            onClick={onSelectAllStatuses}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left group cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#0c1f38] border border-[#16355d] shadow-md'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-[#0084ff] flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="2.5" />
                <circle cx="6" cy="18" r="2.5" />
                <circle cx="18" cy="18" r="2.5" />
                <path d="M12 8.5v4m-3.5 2.5L12 12.5l3.5 2.5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="text-[16px] font-medium text-slate-100 tracking-tight group-hover:text-white">
              {isAr ? 'الكل' : 'All'}
            </span>
          </button>

          {/* Unresolved checkbox */}
          <button
            type="button"
            onClick={() => onToggleStatus('Unresolved')}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all text-left group cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                selectedStatuses.includes('Unresolved')
                  ? 'bg-[#0084ff] text-white shadow-md shadow-blue-500/20'
                  : 'border border-[#23426c] bg-[#0c1c33] text-transparent hover:border-blue-400'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[16px] font-medium text-slate-100 tracking-tight group-hover:text-white">
              {isAr ? 'غير معالج' : 'Unresolved'}
            </span>
          </button>

          {/* Acknowledged checkbox */}
          <button
            type="button"
            onClick={() => onToggleStatus('Acknowledged')}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all text-left group cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                selectedStatuses.includes('Acknowledged')
                  ? 'bg-[#0084ff] text-white shadow-md shadow-blue-500/20'
                  : 'border border-[#23426c] bg-[#0c1c33] text-transparent hover:border-blue-400'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[16px] font-medium text-slate-100 tracking-tight group-hover:text-white">
              {isAr ? 'تم استلامه' : 'Acknowledged'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

