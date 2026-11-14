import React from 'react';
import { INFRASTRUCTURE_LAYERS } from './infrastructureData';
import { LayerId } from './infrastructureTypes';
import { LayerGlyph } from './LayerGlyph';
import { Layers, CheckSquare, Square } from 'lucide-react';

interface InfrastructureLayersPanelProps {
  activeLayers: Record<LayerId, boolean>;
  onToggleLayer: (layerId: LayerId) => void;
  facilityCounts?: Record<LayerId, number>;
  onToggleAll?: (selectAll: boolean) => void;
  lang?: 'en' | 'ar';
}

export const InfrastructureLayersPanel: React.FC<InfrastructureLayersPanelProps> = ({
  activeLayers,
  onToggleLayer,
  facilityCounts,
  onToggleAll,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';
  const allActive = Object.values(activeLayers).every(Boolean);

  return (
    <section
      aria-labelledby="layers-heading"
      className="bg-[#091526]/95 border border-[#142d4f] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/40 flex flex-col justify-between select-none"
    >
      <div>
        {/* Header with Title & Quick Select All */}
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#142d4f]">
          <h2
            id="layers-heading"
            className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'طبقات البنية التحتية' : 'Infrastructure Layers'}</span>
          </h2>

          {onToggleAll && (
            <button
              type="button"
              onClick={() => onToggleAll(!allActive)}
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              {allActive ? (
                <>
                  <Square className="w-3 h-3" />
                  <span>{isAr ? 'إلغاء الكل' : 'Clear'}</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3 h-3" />
                  <span>{isAr ? 'تحديد الكل' : 'All'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 7 Layer Checkbox List */}
        <ul className="space-y-3">
          {INFRASTRUCTURE_LAYERS.map((layer) => {
            const isChecked = activeLayers[layer.id];
            const inputId = `layer-checkbox-${layer.id}`;
            const count = facilityCounts?.[layer.id];

            return (
              <li key={layer.id}>
                <label
                  htmlFor={inputId}
                  className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-[#0e223d]/80 border border-[#1b3e6b] text-white shadow-sm'
                      : 'hover:bg-white/5 border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="relative flex items-center justify-center shrink-0 w-[18px] h-[18px]">
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleLayer(layer.id)}
                        className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none w-[18px] h-[18px] rounded-md flex items-center justify-center border transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 ${
                          isChecked
                            ? 'bg-[#0070f3] border-[#0070f3] shadow-[0_0_8px_rgba(0,112,243,0.5)]'
                            : 'bg-[#081423] border-[#223d5e] group-hover:border-[#38bdf8]'
                        }`}
                      >
                        {isChecked && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.2 6.2L4.8 8.8L9.8 3.4"
                              stroke="#FFFFFF"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </span>

                    <LayerGlyph layerId={layer.id} size={18} />

                    <span
                      className={`text-xs sm:text-[13px] font-medium leading-tight truncate transition-colors ${
                        isChecked ? 'text-slate-100 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {isAr ? layer.labelAr : layer.label}
                    </span>
                  </div>

                  {count !== undefined && count > 0 && (
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isChecked
                          ? 'bg-[#153457] text-cyan-300 border border-[#1d4674]'
                          : 'bg-[#0d1f35] text-slate-500 border border-transparent'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Info Box */}
      <div className="mt-4 pt-3 border-t border-[#142d4f] text-[11px] text-slate-400 flex items-center justify-between">
        <span>{isAr ? 'الطبقات النشطة:' : 'Active Layers:'}</span>
        <span className="font-mono font-bold text-cyan-400">
          {Object.values(activeLayers).filter(Boolean).length} / {INFRASTRUCTURE_LAYERS.length}
        </span>
      </div>
    </section>
  );
};
