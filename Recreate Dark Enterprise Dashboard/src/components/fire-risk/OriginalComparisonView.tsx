import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Sparkles, Sliders } from 'lucide-react';

interface OriginalComparisonViewProps {
  mode: 'original' | 'split';
  lang: 'en' | 'ar';
  children?: React.ReactNode;
}

export const OriginalComparisonView: React.FC<OriginalComparisonViewProps> = ({
  mode,
  lang,
  children,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage
  const [zoom, setZoom] = useState<number>(1);
  const imageSrc = '/assets/aistudio/4_b330b7c1.jpg';

  if (mode === 'original') {
    return (
      <div className="relative w-full rounded-3xl overflow-hidden border border-[#1b3a5c] bg-[#05101d] p-3 shadow-2xl flex flex-col items-center">
        {/* Controls Bar */}
        <div className="w-full flex items-center justify-between px-4 py-2 mb-2 bg-[#0a1c32]/80 rounded-2xl border border-[#1b3a5c]">
          <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <span>
              {lang === 'ar'
                ? 'الصورة الأصلية المرفقة (100% دقة عالية)'
                : 'User Provided Reference Asset (100% Fidelity)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <a
              href={imageSrc}
              download="fire_risk_predictive_center.jpg"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تحميل' : 'Download'}</span>
            </a>
          </div>
        </div>

        {/* Display Container */}
        <div className="relative w-full overflow-auto max-h-[82vh] rounded-2xl flex items-center justify-center p-2 bg-[#020912]">
          <img
            src={imageSrc}
            alt="Fire Risk Center Reference 100%"
            className="w-full max-w-6xl h-auto rounded-xl shadow-2xl transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          />
        </div>
      </div>
    );
  }

  // Split comparison mode: Slider over interactive UI vs original image
  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#1b3a5c] bg-[#030d1a] shadow-2xl">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-[#091b2f] border-b border-[#1b3a5c] text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">
            {lang === 'ar' ? 'مقارنة الشاشة المباشرة مع الأصل' : 'Live Interactive UI vs Original Reference'}
          </span>
          <span className="text-slate-500">|</span>
          <span>{lang === 'ar' ? 'اسحب الشريط للمقارنة' : 'Drag slider to compare fidelity'}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-slate-400">
          <span className="text-blue-400 font-bold">Interactive: {sliderPosition}%</span>
          <span>•</span>
          <span className="text-amber-400 font-bold">Original: {100 - sliderPosition}%</span>
        </div>
      </div>

      {/* Comparison Container */}
      <div className="relative w-full min-h-[680px] overflow-hidden select-none">
        {/* Under layer: Original Image */}
        <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center bg-[#051120]">
          <img
            src={imageSrc}
            alt="Reference Original"
            className="w-full h-full object-contain rounded-2xl"
          />
        </div>

        {/* Over layer: Live Interactive Children (clipped at sliderPosition) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <div className="w-full h-full bg-[#030e1c]">{children}</div>
        </div>

        {/* Vertical Divider Line with handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-cyan-300 to-blue-500 shadow-[0_0_15px_#38bdf8] cursor-ew-resize z-40"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white cursor-ew-resize">
            <Sliders className="w-4 h-4 rotate-90" />
          </div>
        </div>

        {/* Invisible Range Input for smooth sliding */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-50"
          aria-label="Comparison slider"
        />
      </div>
    </div>
  );
};
