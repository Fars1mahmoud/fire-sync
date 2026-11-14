import React from 'react';
import { Navigation, Sparkles } from 'lucide-react';
import { RouteSearchInput } from './evacuationTypes';

interface RoutePlanningCardProps {
  searchInput: RouteSearchInput;
  validationError: string | null;
  isRecalculating: boolean;
  selectedRegion: string;
  lang: 'en' | 'ar';
  onChange: (field: keyof RouteSearchInput, value: string) => void;
  onSelectPreset: (preset: RouteSearchInput) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const REGION_PRESETS: Record<string, Array<{ label: string; labelAr: string; values: RouteSearchInput }>> = {
  brazil: [
    {
      label: 'Manaus',
      labelAr: 'ماناوس',
      values: {
        originCity: 'Manaus',
        originCoords: '-3.1190, -60.0217',
        destinationZone: 'Safe Zone North',
        destinationMode: 'North Hub',
      },
    },
    {
      label: 'Iranduba',
      labelAr: 'إيراندوبا',
      values: {
        originCity: 'Iranduba',
        originCoords: '-3.2847, -60.1861',
        destinationZone: 'Shelter Alpha',
        destinationMode: 'Onsite',
      },
    },
    {
      label: 'Itacoatiara',
      labelAr: 'إيتاكواتيارا',
      values: {
        originCity: 'Itacoatiara',
        originCoords: '-3.1431, -58.4442',
        destinationZone: 'River Port Hub',
        destinationMode: 'Staging',
      },
    },
  ],
  canada: [
    {
      label: 'Fort McMurray',
      labelAr: 'فورت ماكموري',
      values: {
        originCity: 'Fort McMurray',
        originCoords: '56.7264, -111.3803',
        destinationZone: 'Lac La Biche Hub',
        destinationMode: 'Highway 63 S',
      },
    },
    {
      label: 'Anzac Outpost',
      labelAr: 'أنزاك',
      values: {
        originCity: 'Anzac',
        originCoords: '56.4500, -111.0333',
        destinationZone: 'Edmonton North Relief',
        destinationMode: 'Conducted Evac',
      },
    },
    {
      label: 'Lac La Biche',
      labelAr: 'لاك لا بيش',
      values: {
        originCity: 'Lac La Biche',
        originCoords: '54.7670, -111.9700',
        destinationZone: 'Grassland Shelter',
        destinationMode: 'Secondary',
      },
    },
  ],
  egypt: [
    {
      label: 'Cairo East',
      labelAr: 'شرق القاهرة',
      values: {
        originCity: 'Cairo Outskirts',
        originCoords: '30.0444, 31.2357',
        destinationZone: 'Ismailia Logistics Hub',
        destinationMode: 'Desert Rd Corridor',
      },
    },
    {
      label: '10th of Ramadan',
      labelAr: 'العاشر من رمضان',
      values: {
        originCity: '10th of Ramadan',
        originCoords: '30.3000, 31.7500',
        destinationZone: 'Civil Defense Shelter 2',
        destinationMode: 'Regional Expressway',
      },
    },
    {
      label: 'Suez Sector',
      labelAr: 'قطاع السويس',
      values: {
        originCity: 'Suez Highway',
        originCoords: '29.9700, 32.5500',
        destinationZone: 'Red Sea Safety Zone',
        destinationMode: 'Escort Required',
      },
    },
  ],
};

export const RoutePlanningCard: React.FC<RoutePlanningCardProps> = ({
  searchInput,
  validationError,
  isRecalculating,
  selectedRegion,
  lang,
  onChange,
  onSelectPreset,
  onSubmit,
}) => {
  const isAr = lang === 'ar';
  const presets = REGION_PRESETS[selectedRegion.toLowerCase()] || REGION_PRESETS.brazil;

  return (
    <section
      aria-labelledby="route-planning-heading"
      className="rounded-xl border border-[#1d3b66]/80 bg-[#091526]/95 p-4.5 shadow-[0_8px_28px_rgba(2,8,20,0.45)]"
    >
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <h2
          id="route-planning-heading"
          className="text-[16px] font-semibold text-white tracking-tight flex items-center gap-2"
        >
          <Navigation className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <span>{isAr ? 'تخطيط مسارات الإخلاء' : 'Route Planning'}</span>
        </h2>
        <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          <Sparkles className="w-3 h-3" />
          <span>AI Assisted</span>
        </span>
      </div>

      {/* Quick Sector Presets */}
      <div className="mb-3.5">
        <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
          {isAr ? 'قطاعات الإخلاء السريعة:' : 'Quick Sectors:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isActive =
              searchInput.originCity.trim().toLowerCase() ===
              preset.values.originCity.toLowerCase();
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSelectPreset(preset.values)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-500/25 text-blue-200 border border-blue-400/60 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'bg-[#0d1f36] text-slate-300 border border-[#24416b]/80 hover:border-blue-400/40 hover:text-white'
                }`}
              >
                {isAr ? preset.labelAr : preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-3">
        {/* Origin Split Field */}
        <div>
          <label
            htmlFor="origin-city-input"
            className="block text-[12px] font-medium text-slate-300 mb-1.5"
          >
            {isAr ? 'نقطة الانطلاق (المدينة / الإحداثيات)' : 'Origin (City / Coords)'}
          </label>
          <div className="flex items-center rounded-lg border border-[#24416b] bg-[#0d1f36] focus-within:border-blue-400 transition-colors overflow-hidden">
            <input
              id="origin-city-input"
              type="text"
              aria-label="Origin city"
              value={searchInput.originCity}
              onChange={(e) => onChange('originCity', e.target.value)}
              placeholder={isAr ? 'المدينة' : 'City'}
              className="w-[45%] min-w-0 bg-transparent px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
            <span
              className="h-5 w-px bg-[#24416b] shrink-0"
              aria-hidden="true"
            />
            <input
              id="origin-coords-input"
              type="text"
              aria-label="Origin coordinates"
              value={searchInput.originCoords}
              onChange={(e) => onChange('originCoords', e.target.value)}
              placeholder="~ Lat, Lon"
              className="flex-1 min-w-0 bg-transparent px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-400 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Destination Split Field */}
        <div>
          <label
            htmlFor="destination-zone-input"
            className="block text-[12px] font-medium text-slate-300 mb-1.5"
          >
            {isAr ? 'الوجهة الآمنة (المأوى / النمط)' : 'Destination (Safe Zone / Mode)'}
          </label>
          <div className="flex items-center rounded-lg border border-[#24416b] bg-[#0d1f36] focus-within:border-blue-400 transition-colors overflow-hidden">
            <input
              id="destination-zone-input"
              type="text"
              aria-label="Destination safe zone"
              value={searchInput.destinationZone}
              onChange={(e) => onChange('destinationZone', e.target.value)}
              placeholder={isAr ? 'المنطقة الآمنة' : 'Safe Zone'}
              className="w-[52%] min-w-0 bg-transparent px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
            <span
              className="h-5 w-px bg-[#24416b] shrink-0"
              aria-hidden="true"
            />
            <input
              id="destination-mode-input"
              type="text"
              aria-label="Destination mode"
              value={searchInput.destinationMode}
              onChange={(e) => onChange('destinationMode', e.target.value)}
              placeholder="~ Mode / Hub"
              className="flex-1 min-w-0 bg-transparent px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {validationError && (
          <p
            role="alert"
            className="text-[12px] text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded-md px-2.5 py-1.5"
          >
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={isRecalculating}
          className="w-full rounded-lg bg-[#0d7ff2] hover:bg-[#1a8cff] active:bg-[#0a6cd1] disabled:opacity-70 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors shadow-[0_4px_18px_rgba(13,127,242,0.32)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 flex items-center justify-center gap-2"
        >
          {isRecalculating ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isAr ? 'جاري حساب الممرات...' : 'Calculating Routes...'}</span>
            </>
          ) : (
            <span>{isAr ? 'حساب المسارات الآمنة' : 'Find Safe Routes'}</span>
          )}
        </button>
      </form>
    </section>
  );
};
