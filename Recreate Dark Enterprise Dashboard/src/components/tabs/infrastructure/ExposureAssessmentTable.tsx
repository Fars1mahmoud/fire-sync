import React, { useState, useMemo } from 'react';
import { ExposureStatus, Facility, RiskLevel } from './infrastructureTypes';
import { Search, ShieldCheck, AlertTriangle, AlertOctagon, Filter } from 'lucide-react';

interface ExposureAssessmentTableProps {
  facilities: Facility[];
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string | null) => void;
  onResetAll: () => void;
  lang?: 'en' | 'ar';
}

const RISK_DOT_STYLE: Record<RiskLevel, { dot: string; text: string }> = {
  High: { dot: 'bg-[#DC2626] shadow-[0_0_8px_#dc2626]', text: 'text-[#F87171]' },
  Moderate: { dot: 'bg-[#EA9028] shadow-[0_0_8px_#ea9028]', text: 'text-[#FBBF24]' },
  Low: { dot: 'bg-[#22C55E] shadow-[0_0_8px_#22c55e]', text: 'text-[#4ADE80]' },
};

const STATUS_STYLE: Record<ExposureStatus, string> = {
  'At Risk': 'bg-[#351721] text-[#F87171] border-[#7f1d1d] shadow-[0_0_8px_rgba(220,38,38,0.3)]',
  Monitor: 'bg-[#1D2D42] text-amber-300 border-[#2D4360]',
  Safe: 'bg-[#12312B] text-[#34D399] border-[#1E4F43]',
};

export const ExposureAssessmentTable: React.FC<ExposureAssessmentTableProps> = ({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  onResetAll,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      const matchSearch =
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fac.nameAr && fac.nameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
        fac.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = riskFilter === 'all' || fac.risk.toLowerCase() === riskFilter.toLowerCase();
      return matchSearch && matchRisk;
    });
  }, [facilities, searchQuery, riskFilter]);

  return (
    <section
      aria-labelledby="exposure-assessment-heading"
      className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40 select-none"
    >
      {/* Top Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#142d4f]">
        <div>
          <h2
            id="exposure-assessment-heading"
            className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2"
          >
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <span>{isAr ? 'سجل تقييم التعرض ومخاطر البنية التحتية' : 'Exposure Assessment'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'مراقبة المسافة الفاصلة بين جبهة الحريق والمنشآت الحيوية وشبكات الطاقة والمستشفيات'
              : 'Continuous spatial distance buffer monitoring for hospitals, power grids, and transit arteries'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن منشأة...' : 'Filter facilities...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0d2038] text-white text-xs rounded-xl pl-8 pr-3 py-1.5 border border-[#1b3d66] outline-none focus:border-[#0070f3] w-[160px] sm:w-[200px] transition-colors"
            />
          </div>

          {/* Quick Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#0d2038] text-xs text-slate-200 border border-[#1b3d66] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:border-[#0070f3]"
          >
            <option value="all">{isAr ? 'جميع المستويات' : 'All Risk'}</option>
            <option value="high">{isAr ? 'عالي الخطورة' : 'High'}</option>
            <option value="moderate">{isAr ? 'متوسط' : 'Moderate'}</option>
            <option value="low">{isAr ? 'منخفض' : 'Low'}</option>
          </select>
        </div>
      </div>

      {filteredFacilities.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-300 mb-3">
            {isAr ? 'لا توجد منشآت مطابقة للشروط المحددة.' : 'No exposed facilities match your current filter and layer selection.'}
          </p>
          <button
            type="button"
            onClick={onResetAll}
            className="px-4 py-1.5 rounded-xl bg-[#0070f3] hover:bg-blue-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            {isAr ? 'استعادة كل الطبقات' : 'Restore All Layers'}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#142d4f] text-xs font-semibold text-slate-400">
                <th scope="col" className="py-2.5 pr-4 font-semibold">
                  {isAr ? 'المنشآت' : 'Facility Description'}
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold">
                  {isAr ? 'توجه' : 'Heading'}
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold">
                  {isAr ? 'نوعه' : 'Category'}
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                  {isAr ? 'المسافة' : 'Distance to Fire'}
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold">
                  {isAr ? 'مستوى الخطر' : 'Risk Level'}
                </th>
                <th scope="col" className="py-2.5 pl-4 font-semibold text-center">
                  {isAr ? 'الحالة' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#122845] text-xs sm:text-[13px]">
              {filteredFacilities.map((facility) => {
                const isSelected = selectedFacilityId === facility.id;
                const riskColors = RISK_DOT_STYLE[facility.risk];
                const nameColor =
                  facility.status === 'Safe' ? 'text-emerald-400' : facility.status === 'At Risk' ? 'text-red-300 font-bold' : 'text-amber-300';

                return (
                  <tr
                    key={facility.id}
                    onClick={() => onSelectFacility(isSelected ? null : facility.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#0e2440] shadow-sm' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Facility Name */}
                    <td className={`py-3 pr-4 font-medium whitespace-nowrap ${nameColor}`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFacility(isSelected ? null : facility.id);
                        }}
                        className="text-left hover:underline focus-visible:outline-none cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{isAr && facility.nameAr ? facility.nameAr : facility.name}</span>
                      </button>
                    </td>

                    {/* Heading / Direction */}
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {facility.directionLabel}
                    </td>

                    {/* Category Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-[#0b1b31] px-2 py-0.5 rounded-md text-cyan-300 text-[11px] font-mono border border-[#183659]">
                        {facility.typeLabel}
                      </span>
                    </td>

                    {/* Geodesic Distance */}
                    <td className="py-3 px-4 text-cyan-300 font-bold font-mono text-right tabular-nums whitespace-nowrap">
                      {facility.distanceKm.toFixed(1)} km
                    </td>

                    {/* Risk Level with Colored Glow Dot */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${riskColors.dot}`}
                        />
                        <span className={`font-semibold text-xs ${riskColors.text}`}>{facility.risk}</span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 pl-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[72px] px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${STATUS_STYLE[facility.status]}`}
                      >
                        {facility.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
