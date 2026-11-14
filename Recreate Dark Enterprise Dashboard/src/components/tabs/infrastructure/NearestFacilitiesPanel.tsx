import React from 'react';
import { Facility, RiskLevel } from './infrastructureTypes';
import { LayerGlyph } from './LayerGlyph';
import { ShieldAlert, Compass } from 'lucide-react';

interface NearestFacilitiesPanelProps {
  facilities: Facility[];
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string | null) => void;
  lang?: 'en' | 'ar';
}

const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  High: 'bg-[#DC2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.5)]',
  Moderate: 'bg-[#EA580C] text-white shadow-[0_0_8px_rgba(234,88,12,0.4)]',
  Low: 'bg-[#10B981] text-[#062016] shadow-[0_0_8px_rgba(16,185,129,0.3)]',
};

export const NearestFacilitiesPanel: React.FC<NearestFacilitiesPanelProps> = ({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';

  return (
    <section
      aria-labelledby="nearest-facilities-heading"
      className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40 flex flex-col justify-between select-none"
    >
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#142d4f]">
          <h2
            id="nearest-facilities-heading"
            className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span>{isAr ? 'أقرب المنشآت لخط النار' : 'Nearest Facilities'}</span>
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 bg-[#0e223d] px-2 py-0.5 rounded-md border border-[#1b3d66]">
            {facilities.length} {isAr ? 'منشأة' : 'sites'}
          </span>
        </div>

        {/* Column Headers matching screenshot */}
        <div className="grid grid-cols-[1fr_auto_82px] items-center gap-3 pb-2 border-b border-[#142d4f] text-xs font-semibold text-slate-400">
          <span>{isAr ? 'المنشآت' : 'Facility'}</span>
          <span className="text-right">{isAr ? 'المسافة' : 'Distance'}</span>
          <span className="text-center">{isAr ? 'مستوى الخطر' : 'Risk'}</span>
        </div>

        {facilities.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            {isAr ? 'لا توجد منشآت مطابقة للطبقات النشطة.' : 'No facilities match the active layers.'}
          </div>
        ) : (
          <ul className="divide-y divide-[#142c4b] max-h-[240px] overflow-y-auto pr-1">
            {facilities.map((facility) => {
              const isSelected = selectedFacilityId === facility.id;
              const iconColorOverride = facility.layerId === 'airports' ? '#22C55E' : undefined;

              return (
                <li key={facility.id}>
                  <button
                    type="button"
                    onClick={() => onSelectFacility(isSelected ? null : facility.id)}
                    aria-pressed={isSelected}
                    className={`w-full grid grid-cols-[1fr_auto_82px] items-center gap-3 py-2.5 px-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0e223d] border border-blue-500/80 shadow-[0_0_12px_rgba(0,112,243,0.3)]'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {/* Facility Icon & Title */}
                    <span className="flex items-center gap-2.5 min-w-0">
                      <LayerGlyph layerId={facility.layerId} colorOverride={iconColorOverride} size={18} />
                      <span className="min-w-0">
                        <span className="block text-xs sm:text-[13px] font-semibold text-slate-100 leading-tight truncate">
                          {isAr && facility.nameAr ? facility.nameAr : facility.nearestLabel}
                        </span>
                        {facility.nearestSubLabel && (
                          <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5 truncate">
                            {facility.nearestSubLabel}
                          </span>
                        )}
                      </span>
                    </span>

                    {/* Geodesic Distance */}
                    <span className="text-xs sm:text-[13px] font-bold font-mono text-cyan-300 tabular-nums whitespace-nowrap text-right">
                      {facility.distanceKm.toFixed(1)} km
                    </span>

                    {/* Risk Badge */}
                    <span
                      className={`inline-flex items-center justify-center h-[22px] w-[80px] rounded-md text-[11px] font-bold whitespace-nowrap uppercase tracking-wider ${RISK_BADGE_CLASSES[facility.risk]}`}
                    >
                      {facility.risk}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer Proximity Note */}
      <div className="mt-3 pt-2.5 border-t border-[#142d4f] text-[11px] text-slate-400 flex items-center justify-between">
        <span>{isAr ? 'حساب المسافة:' : 'Distance Engine:'}</span>
        <span className="font-mono text-emerald-400">{isAr ? 'جغرافي حي (Haversine)' : 'Live Geodesic'}</span>
      </div>
    </section>
  );
};
