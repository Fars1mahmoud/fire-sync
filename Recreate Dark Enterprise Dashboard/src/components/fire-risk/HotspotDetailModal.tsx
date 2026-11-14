import React from 'react';
import {
  X,
  Flame,
  AlertTriangle,
  Wind,
  Thermometer,
  Droplets,
  MapPin,
  Activity,
  Satellite,
  Compass,
  ShieldAlert,
} from 'lucide-react';
import { Hotspot } from './types';

interface HotspotDetailModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export const HotspotDetailModal: React.FC<HotspotDetailModalProps> = ({
  hotspot,
  onClose,
  lang,
}) => {
  if (!hotspot) return null;

  const isCritical = hotspot.level === 'critical';
  const isHigh = hotspot.level === 'high';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hotspot-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-[#0b1c2e] border border-[#234b75] rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow accent */}
        <div
          className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-35 ${
            isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-yellow-500'
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10 pb-4 border-b border-[#1b3a5c]">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isCritical
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,35,60,0.3)]'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <h3 id="hotspot-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
                <span>{hotspot.name}</span>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200">{hotspot.state}</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-300">{hotspot.timestamp}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Risk Score Indicator */}
        <div className="mt-5 p-4 rounded-2xl bg-[#071321] border border-[#173352] flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              {lang === 'ar' ? 'مؤشر احتمالية الحريق الإجمالي' : 'Composite Fire Risk Index'}
            </div>
            <div className="text-3xl font-black text-white mt-0.5 flex items-baseline gap-2">
              <span className={isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-yellow-400'}>
                {hotspot.riskScore}%
              </span>
              <span className="text-xs text-slate-400 uppercase font-mono font-medium">
                [{hotspot.level.toUpperCase()} RISK]
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
              🔥 {hotspot.activeHotspots} {lang === 'ar' ? 'بؤرة نشطة مجاورة' : 'Active Hotspots in Cluster'}
            </span>
            {hotspot.frp && (
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                FRP: {hotspot.frp} MW
              </span>
            )}
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-[#081728] border border-[#163351]">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span>{lang === 'ar' ? 'حرارة السطح' : 'Surface Temp'}</span>
            </div>
            <div className="text-base font-bold text-white font-mono">{hotspot.temperature}</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#081728] border border-[#163351]">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? 'مؤشر الجفاف (KBDI)' : 'Drought Index'}</span>
            </div>
            <div className="text-base font-bold text-white font-mono">{hotspot.droughtIndex} / 800</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#081728] border border-[#163351]">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>{lang === 'ar' ? 'سرعة الرياح' : 'Wind Speed'}</span>
            </div>
            <div className="text-base font-bold text-white font-mono">{hotspot.windSpeed}</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#081728] border border-[#163351]">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Satellite className="w-4 h-4 text-purple-400" />
              <span>{lang === 'ar' ? 'المستشعر الفضائي' : 'Satellite Sensor'}</span>
            </div>
            <div className="text-xs font-semibold text-purple-300 font-mono truncate">
              {hotspot.satellite || 'VIIRS 375m / MODIS'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#081728] border border-[#163351]">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'نسبة الثقة' : 'Detection Confidence'}</span>
            </div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {hotspot.confidence ? `${hotspot.confidence}%` : 'High (95%)'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#081728] border border-[#163351]">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'الإحداثيات الجغرافية' : 'Coordinates'}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-200">
              {hotspot.latitude ? `${hotspot.latitude.toFixed(2)}°, ${hotspot.longitude?.toFixed(2)}°` : 'Live Lat/Lon'}
            </div>
          </div>
        </div>

        {/* Tactical Recommendation */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#091b30]/80 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">
              {lang === 'ar' ? 'توصية العمليات الميدانية:' : 'Tactical Operational Recommendation:'}
            </span>
            <span>
              {isCritical
                ? (lang === 'ar'
                    ? 'احتمالية انتشار كارثية. يُوصى بتوجيه طائرات الإطفاء ومراقبة خطوط الدفاع وتفعيل إشعار الإنذار المبكر للسكان.'
                    : 'Extreme fire spread hazard. Aerial suppression recommended; verify firebreak perimeters and alert nearby emergency dispatch.')
                : (lang === 'ar'
                    ? 'نشاط حراري مرتفع يتطلب مراقبة جوية مستمرة والتحقق من رطوبة الوقود النباتي لتجنب الاشتعال المتسارع.'
                    : 'Elevated thermal cluster. Recommend continuous satellite tracking and pre-positioning local containment teams.')}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق الفاحص' : 'Close Inspector'}
          </button>
        </div>
      </div>
    </div>
  );
};
