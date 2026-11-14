import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Wind, 
  Droplets, 
  Radio, 
  Shield, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Copy,
  Flame,
  Send,
  Compass
} from 'lucide-react';
import { AlertItem, AlertStatus } from './alertTypes';

interface AlertDetailModalProps {
  alert: AlertItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: AlertStatus) => void;
  onNavigateToMap?: (lat: number, lng: number) => void;
  language: 'en' | 'ar';
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onUpdateStatus,
  onNavigateToMap,
  language,
}) => {
  const isAr = language === 'ar';
  const [copied, setCopied] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  if (!alert) return null;

  const copyCoords = () => {
    navigator.clipboard.writeText(`${alert.coordinates.lat.toFixed(4)}, ${alert.coordinates.lng.toFixed(4)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 3000);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#091629] border border-[#1b3e6b] rounded-3xl w-full max-w-xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#142d4f] flex items-center justify-between bg-[#0b1b33]/90">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${
                alert.severity === 'Critical'
                  ? 'bg-red-600 text-white'
                  : alert.severity === 'High'
                  ? 'bg-orange-600 text-white'
                  : alert.severity === 'Moderate'
                  ? 'bg-yellow-500 text-slate-950 font-bold'
                  : 'bg-green-600 text-white'
              }`}
            >
              {alert.severity}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isAr && alert.titleAr ? alert.titleAr : alert.title}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                ID: {alert.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#12243d] hover:bg-[#1a3356] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1f3c64]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-200 overflow-y-auto max-h-[70vh]">
          {/* Incident Overview */}
          <div className="p-4 rounded-2xl bg-[#0c1e38] border border-[#183a66]">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              {isAr ? 'تفاصيل البلاغ والإنذار' : 'Incident Assessment Overview'}
            </div>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              {isAr && alert.subtitleAr ? alert.subtitleAr : alert.subtitle}
            </p>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              {isAr ? 'المنطقة:' : 'Region:'}{' '}
              <strong className="text-slate-100">{isAr && alert.regionAr ? alert.regionAr : alert.region}</strong> •{' '}
              {isAr ? alert.timeArabic : alert.timeEnglish}
            </p>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-[#0c1e38] border border-[#183a66] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{isAr ? 'شدة الإشعاع (FRP)' : 'Fire Radiative Power'}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
                {alert.frpMw} <span className="text-xs font-normal text-slate-400">MW</span>
              </div>
            </div>

            <div className="bg-[#0c1e38] border border-[#183a66] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'نسبة الثقة' : 'Confidence'}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono tabular-nums">
                {alert.confidence}%
              </div>
            </div>

            <div className="bg-[#0c1e38] border border-[#183a66] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'متجه الرياح' : 'Wind Vector'}</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white truncate">
                {isAr && alert.windSpeedAr ? alert.windSpeedAr : alert.windSpeed}
              </div>
            </div>

            <div className="bg-[#0c1e38] border border-[#183a66] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAr ? 'الرطوبة النسبية' : 'Humidity'}</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white font-mono">
                {alert.humidity}
              </div>
            </div>

            <div className="bg-[#0c1e38] border border-[#183a66] rounded-xl p-3 col-span-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'إحداثيات الرصد الفضائي' : 'Satellite Coordinates'}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>{alert.coordinates.lat.toFixed(4)}°, {alert.coordinates.lng.toFixed(4)}°</span>
                <button
                  type="button"
                  onClick={copyCoords}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sensor Instrument Feed */}
          <div className="bg-[#071324] border border-[#132d4e] rounded-xl p-3.5 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-slate-400">{isAr ? 'المستشعر والقمر الصناعي:' : 'Sensor Swath:'}</span>{' '}
              <span className="font-semibold text-white">{alert.satellite}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isAr ? 'تزامن فضائي مباشر' : 'Live Sync'}</span>
            </div>
          </div>

          {/* Emergency Alert Broadcast Trigger */}
          <div className="p-3.5 rounded-2xl bg-[#112338] border border-[#1b3d68] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">
                {isAr ? 'إرسال تعميم فوري لفرق الميدان' : 'Emergency Tactical Dispatch'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isAr
                  ? 'بث تحذير فوري عبر رسائل SMS وإشعارات التطبيق لكافة الحراس'
                  : 'Broadcast alert via Cell/SMS to field rangers in proximity'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBroadcast}
              disabled={isBroadcasting || broadcastSent}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                broadcastSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {broadcastSent
                  ? isAr ? 'تم الإرسال!' : 'Dispatched!'
                  : isBroadcasting
                  ? isAr ? 'جارِ البث...' : 'Broadcasting...'
                  : isAr ? 'تعميم طارئ' : 'Dispatch'}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#071222] border-t border-[#142d4f] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isAr ? 'الحالة الحالية:' : 'Status:'}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              {alert.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {alert.status !== 'Acknowledged' && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(alert.id, 'Acknowledged');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
              >
                {isAr ? 'تأكيد الاستلام (Acknowledge)' : 'Mark Acknowledged'}
              </button>
            )}

            {alert.status !== 'Resolved' && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(alert.id, 'Resolved');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                {isAr ? 'معالجة الإنذار (Resolve)' : 'Mark Resolved'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#0f2138] hover:bg-[#162e4e] text-slate-300 transition-colors cursor-pointer border border-[#1b3d68]"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

