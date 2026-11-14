import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { Language, RegionData } from './weatherTypes';

interface AlertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion: RegionData;
  language: Language;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  isOpen,
  onClose,
  currentRegion,
  language,
}) => {
  if (!isOpen) return null;
  const isAr = language === 'ar';
  const { alertCounts, exposureList } = currentRegion;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#091830] border border-sky-500/40 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isAr ? 'مركز تقييم المخاطر المناخية والإشعارات' : 'Climate Risk & Hazard Assessment'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? currentRegion.nameAr : currentRegion.name} · {currentRegion.current.updatedAt}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Key Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30">
            <div className="text-[11px] text-slate-400">{isAr ? 'منشآت متأثرة' : 'Affected Infra'}</div>
            <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">
              {alertCounts.affectedInfra}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
            <div className="text-[11px] text-slate-400">{isAr ? 'درجة التهديد' : 'Threat Score'}</div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {alertCounts.threatScore}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <div className="text-[11px] text-slate-400">{isAr ? 'مناطق أولوية' : 'Priority Areas'}</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {alertCounts.priorityAreas}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30">
            <div className="text-[11px] text-slate-400">{isAr ? 'قطاعات الإنذار' : 'Alert Sectors'}</div>
            <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
              {alertCounts.alertSectors}
            </div>
          </div>
        </div>

        {/* Detailed Exposure Breakdown */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2">
            {isAr ? 'تفاصيل تعرض المقاطعات والقطاعات' : 'Regional Exposure Breakdown'}
          </h4>
          <div className="space-y-2">
            {exposureList.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-sky-950 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-sm text-white">
                    {isAr ? item.districtAr : item.district}
                  </div>
                  <div className="text-xs text-slate-400">
                    {isAr ? item.statusAr : item.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-amber-300">{item.maxExp}</div>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      backgroundColor: `${item.riskColor}25`,
                      color: item.riskColor,
                    }}
                  >
                    {item.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protective Measures */}
        <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
          <div className="font-semibold flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'إرشادات السلامة والتحذير' : 'Hazard Mitigation Protocols'}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {isAr
              ? 'مؤشر الجفاف بلغ 680 (حالة قصوى). يُرجى تفعيل تبريد المحطات، ومراقبة خطوط الطاقة والحد من الأنشطة الخارجية عالية التعرض الحراري.'
              : 'Drought index currently recorded at 680 (Extreme tier). Maintain mandatory hydration protocols, monitor grid thermal thresholds, and restrict heavy outdoor operations.'}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {isAr ? 'تم الاستيعاب' : 'Acknowledge & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
