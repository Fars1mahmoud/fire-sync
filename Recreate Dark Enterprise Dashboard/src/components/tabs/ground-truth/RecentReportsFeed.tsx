import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Flame, AlertCircle, CheckCircle2, Search, Filter, Image as ImageIcon } from 'lucide-react';
import { FireReport } from './groundTruthTypes';

interface RecentReportsFeedProps {
  reports: FireReport[];
  selectedReportId?: string;
  onSelectReport: (report: FireReport) => void;
  onOpenPhotoModal?: (report: FireReport) => void;
  onNavigateBack?: () => void;
  onOptionsClick?: () => void;
  language: 'en' | 'ar';
}

export const RecentReportsFeed: React.FC<RecentReportsFeedProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onOpenPhotoModal,
  onNavigateBack,
  onOptionsClick,
  language,
}) => {
  const isAr = language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = r.title.toLowerCase().includes(term) || (r.titleAr && r.titleAr.includes(term));
    const locMatch = r.locationName.toLowerCase().includes(term) || (r.locationNameAr && r.locationNameAr.includes(term));
    return titleMatch || locMatch;
  });

  return (
    <aside 
      aria-label="Recent Reports" 
      className="w-full lg:w-72 xl:w-80 flex flex-col shrink-0 select-none"
    >
      {/* Header with Title and Control Buttons */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
          <span>{isAr ? 'البلاغات الميدانية الأخيرة' : 'Recent Reports'}</span>
          <span className="text-xs font-mono font-normal text-slate-400 bg-[#0d1c2f] px-2 py-0.5 rounded-full border border-[#1b3554]">
            {filteredReports.length}
          </span>
        </h2>

        <div className="flex items-center gap-1.5">
          {/* Back button */}
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-8 h-8 rounded-full bg-[#0a1829] hover:bg-[#11243d] border border-[#162e4a] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isAr ? 'رجوع' : 'Back'}
            title={isAr ? 'العودة للبلاغ الأول' : 'Focus first report'}
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          {/* More options button */}
          <button
            type="button"
            onClick={onOptionsClick}
            className="w-8 h-8 rounded-full bg-[#0a1829] hover:bg-[#11243d] border border-[#162e4a] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isAr ? 'خيارات إضافية' : 'More options'}
            title={isAr ? 'خيارات العرض' : 'Feed options'}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Search Field */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isAr ? 'بحث في البلاغات والمواقع...' : 'Filter reports...'}
          className="w-full pl-8 pr-3 py-1.5 bg-[#081322] border border-[#152a45] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Vertical list of report cards */}
      <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1.5 scrollbar-thin">
        {filteredReports.length === 0 ? (
          <div className="p-6 text-center text-slate-500 bg-[#091524] rounded-2xl border border-[#14263f]">
            <p className="text-xs">{isAr ? 'لا توجد بلاغات تطابق البحث' : 'No reports found matching query'}</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isSelected = selectedReportId === report.id;

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-[#0e223b] border-blue-500/80 shadow-[0_4px_16px_rgba(0,112,243,0.25)]'
                    : 'bg-[#091524] border-[#14263f] hover:border-[#1e385a] hover:bg-[#0c1a2d]'
                }`}
              >
                {/* Thumbnail Photo matching reference with Click-to-Enlarge */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectReport(report);
                    onOpenPhotoModal?.(report);
                  }}
                  className="w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-[#1a3250] relative group/photo cursor-pointer"
                  title={isAr ? 'انقر لعرض وتكبير الصورة' : 'Click to inspect photo'}
                >
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-300"
                  />
                  {report.type === 'confirmed' && (
                    <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>

                {/* Text Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-white text-xs sm:text-sm font-bold truncate">
                      {isAr && report.titleAr ? report.titleAr : report.title}
                    </h4>
                    {report.confidence && (
                      <span className="text-[10px] text-cyan-400 font-mono shrink-0">
                        {report.confidence}%
                      </span>
                    )}
                  </div>

                  <div className="text-slate-400 text-[11px] truncate mt-0.5 font-normal">
                    {isAr && report.locationNameAr ? report.locationNameAr : report.locationName}
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>{isAr && report.timeAgoAr ? report.timeAgoAr : report.timeAgo}</span>
                    <span className="font-mono text-[9px] text-slate-400 truncate max-w-[90px]">
                      {report.coordsGps.lat.toFixed(2)}°, {report.coordsGps.lng.toFixed(2)}°
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
