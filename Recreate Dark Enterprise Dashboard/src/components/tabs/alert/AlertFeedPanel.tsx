import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  MapPin,
  Radio
} from 'lucide-react';
import { AlertItem, SeverityLevel } from './alertTypes';

interface AlertFeedPanelProps {
  alerts: AlertItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOrder: 'desc' | 'asc';
  onToggleSort: () => void;
  onSelectAlert: (alert: AlertItem) => void;
  selectedAlertIds: string[];
  onToggleSelectAlert: (id: string) => void;
  onSelectAllAlerts: () => void;
  isAllSelected: boolean;
  timeFormat: 'arabic' | 'english';
  onToggleTimeFormat: () => void;
  language: 'en' | 'ar';
}

export const AlertFeedPanel: React.FC<AlertFeedPanelProps> = ({
  alerts,
  searchQuery,
  onSearchChange,
  sortOrder,
  onToggleSort,
  onSelectAlert,
  selectedAlertIds,
  onToggleSelectAlert,
  onSelectAllAlerts,
  isAllSelected,
  timeFormat,
  onToggleTimeFormat,
  language,
}) => {
  const isAr = language === 'ar';

  // Styles for each severity card matching user design
  const getCardStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Critical':
        return {
          container:
            'bg-gradient-to-r from-[#2a0e14] via-[#1f0d16] to-[#0e172a] border-[#5a1b24] hover:border-red-500/70 hover:shadow-[0_4px_20px_rgba(239,68,68,0.2)]',
          iconColor: '#ef4444',
          subColor: 'text-[#df7373]',
          badgeBg: 'bg-[#dc2626]',
          badgeText: 'text-white',
        };
      case 'High':
        return {
          container:
            'bg-gradient-to-r from-[#2c170d] via-[#21130e] to-[#0e172a] border-[#5d2d14] hover:border-orange-500/70 hover:shadow-[0_4px_20px_rgba(249,115,22,0.2)]',
          iconColor: '#f97316',
          subColor: 'text-[#d88755]',
          badgeBg: 'bg-[#ea580c]',
          badgeText: 'text-white',
        };
      case 'Moderate':
        return {
          container:
            'bg-gradient-to-r from-[#292209] via-[#1f1b0e] to-[#0e172a] border-[#524413] hover:border-yellow-500/70 hover:shadow-[0_4px_20px_rgba(234,179,8,0.2)]',
          iconColor: '#eab308',
          subColor: 'text-[#cfad49]',
          badgeBg: 'bg-[#eab308]',
          badgeText: 'text-slate-950 font-bold',
        };
      case 'Low':
      default:
        return {
          container:
            'bg-gradient-to-r from-[#0d2216] via-[#0d1c1a] to-[#0e172a] border-[#1e4e35] hover:border-green-500/70 hover:shadow-[0_4px_20px_rgba(34,197,94,0.2)]',
          iconColor: '#22c55e',
          subColor: 'text-[#6ee7b7]',
          badgeBg: 'bg-[#16a34a]',
          badgeText: 'text-white',
        };
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full flex-1 min-w-0 select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isAr ? 'شريط التنبيهات الحية' : 'Alert Feed'}
          </h1>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#0d1f35] border border-[#1b3d68] text-cyan-400">
            {alerts.length} {isAr ? 'تنبيه نشط' : 'Active'}
          </span>
        </div>

        {/* Search & Actions Bar matching image */}
        <div className="flex items-center gap-2">
          {/* Search Input Box */}
          <div className="relative w-44 sm:w-60 md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isAr ? 'بحث في التنبيهات والمناطق...' : 'Search alerts...'}
              className="w-full bg-[#0a172a] border border-[#152f54] focus:border-blue-500 rounded-xl pl-9 pr-7 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick filter/sort icon button matching image */}
          <button
            type="button"
            onClick={onToggleSort}
            title={isAr ? 'ترتيب بحسب التوقيت' : 'Sort / Filter Feed'}
            className="p-2.5 bg-[#0a172a] border border-[#152f54] hover:border-blue-500/60 hover:bg-[#10233f] text-slate-300 hover:text-white rounded-xl transition-all shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subheader Column Bar matching the image */}
      <div className="bg-[#081528] border border-[#142e50] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#7d93b2] font-semibold tracking-wide shadow-sm">
        <div className="flex items-center gap-6">
          {/* Select All Header */}
          <button
            type="button"
            onClick={onSelectAllAlerts}
            className="flex items-center gap-2 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                isAllSelected
                  ? 'bg-blue-600 text-white'
                  : selectedAlertIds.length > 0
                  ? 'bg-blue-900 text-blue-200 border border-blue-500'
                  : 'border border-slate-600'
              }`}
            >
              {isAllSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>{isAr ? 'تحديد الكل' : 'Select All'}</span>
          </button>

          {/* Date sort button */}
          <button
            type="button"
            onClick={onToggleSort}
            className="flex items-center gap-1.5 hover:text-slate-100 transition-colors group cursor-pointer"
          >
            <span>{isAr ? 'التاريخ' : 'Date'}</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </button>

          {/* Status Label */}
          <span>{isAr ? 'الحالة' : 'Status'}</span>
        </div>

        {/* Right column header: Sent At */}
        <div className="text-right">
          <span>{isAr ? 'توقيت الإرسال' : 'Sent at'}</span>
        </div>
      </div>

      {/* Alert Feed Items List */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 scrollbar-thin">
        {alerts.length === 0 ? (
          <div className="bg-[#091526]/80 border border-[#142d4f] rounded-2xl p-12 text-center text-slate-400">
            <AlertTriangle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              {isAr ? 'لا توجد تنبيهات تطابق معايير التصفية' : 'No alerts match your filter'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'جرّب تعديل مستوى الحرج أو إعادة ضبط فلاتر الحالة.'
                : 'Try adjusting your severity, status, or search keywords.'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const style = getCardStyle(alert.severity);
            const isSelected = selectedAlertIds.includes(alert.id);

            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className={`relative group rounded-2xl border px-4 py-3.5 transition-all duration-200 cursor-pointer shadow-lg shadow-black/25 ${
                  style.container
                } ${isSelected ? 'ring-2 ring-blue-500/80 shadow-[0_0_15px_rgba(0,112,243,0.3)]' : ''}`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left Section: Icon + Title + Subtitle */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Triangle Warning Icon matching image */}
                    <div className="shrink-0 p-0.5">
                      <svg
                        className="w-7 h-7 shrink-0 transition-transform group-hover:scale-105"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                          fill={style.iconColor}
                        />
                        <path
                          d="M12 9v4m0 4h.01"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Text block */}
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-[17px] font-semibold text-slate-100 tracking-tight truncate group-hover:text-white">
                        {isAr && alert.titleAr ? alert.titleAr : alert.title}
                      </h3>
                      <p className={`text-xs font-normal tracking-wide truncate ${style.subColor}`}>
                        {isAr && alert.subtitleAr ? alert.subtitleAr : alert.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Middle/Right Section: Severity Badge & Timestamp */}
                  <div className="flex items-center gap-4 sm:gap-7 shrink-0">
                    {/* Severity Badge matching the screenshot solid pill */}
                    <div
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-md ${style.badgeBg} ${style.badgeText} shrink-0`}
                    >
                      {alert.severity}
                    </div>

                    {/* Arabic / English Sent-At Timestamp matching the image */}
                    <div
                      className="text-xs sm:text-sm font-medium text-slate-200 whitespace-nowrap min-w-[85px] text-right font-mono"
                    >
                      {isAr ? alert.timeArabic : alert.timeEnglish}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

