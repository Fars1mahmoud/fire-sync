import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCw, 
  Flame, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Thermometer,
  Radio,
  Clock,
  Compass
} from 'lucide-react';
import { FireReport, GalleryPhoto } from './groundTruthTypes';

interface GroundTruthPhotoModalProps {
  report: FireReport | null;
  isOpen: boolean;
  onClose: () => void;
  onFlyToMapLocation?: (lat: number, lng: number) => void;
  language: 'en' | 'ar';
}

export const GroundTruthPhotoModal: React.FC<GroundTruthPhotoModalProps> = ({
  report,
  isOpen,
  onClose,
  onFlyToMapLocation,
  language,
}) => {
  if (!isOpen || !report) return null;

  const isAr = language === 'ar';
  const gallery: GalleryPhoto[] = report.galleryImages && report.galleryImages.length > 0
    ? report.galleryImages
    : [
        {
          url: report.imageUrl,
          label: 'Primary Observation Capture',
          labelAr: 'صورة الرصد الميداني الأساسية',
          type: 'optical',
        },
      ];

  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const currentPhoto = gallery[activePhotoIdx] || gallery[0];

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomScale(1);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#081322] border border-[#1b385c] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col text-slate-100"
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#142944] bg-[#0a182b]/80">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              report.type === 'confirmed' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              report.type === 'false' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white text-base sm:text-lg font-bold">
                  {isAr && report.titleAr ? report.titleAr : report.title}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  report.type === 'confirmed' ? 'bg-[#108966] text-white shadow-sm' :
                  report.type === 'false' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {isAr && report.titleAr ? report.titleAr : report.title}
                </span>
                {report.confidence && (
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    {report.confidence}% {isAr ? 'ثقة' : 'Conf'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {isAr && report.locationNameAr ? report.locationNameAr : report.locationName} • {report.coordinates}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onFlyToMapLocation && (
              <button
                type="button"
                onClick={() => {
                  onFlyToMapLocation(report.coordsGps.lat, report.coordsGps.lng);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isAr ? 'الانتقال للموقع على الخريطة الحقيقية' : 'Fly to location on map'}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{isAr ? 'انتقال للموقع' : 'Fly to Map'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#12243d] hover:bg-[#1a3356] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#204068]"
              aria-label="Close photo viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: 2 Columns (Viewer + Telemetry Sidebar) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left / Center: Interactive Photo Stage */}
          <div className="flex-1 flex flex-col bg-[#050c17] relative overflow-hidden min-h-[320px] sm:min-h-[420px]">
            {/* Viewport Stage */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2 sm:p-4">
              <div 
                className="transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing max-h-full max-w-full flex items-center justify-center"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.label}
                  className="max-h-[50vh] sm:max-h-[58vh] max-w-full object-contain rounded-2xl shadow-2xl border border-[#1b3352]"
                />
              </div>

              {/* Badges on Viewport */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <div className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr && currentPhoto.labelAr ? currentPhoto.labelAr : currentPhoto.label}</span>
                </div>

                {report.frpMw && (
                  <div className="px-3 py-1 rounded-xl bg-orange-950/80 backdrop-blur-md border border-orange-500/50 text-xs font-mono font-bold text-orange-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{report.frpMw} MW FRP</span>
                  </div>
                )}
              </div>

              {/* Zoom Controls Overlay */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#0a1829]/90 backdrop-blur-md border border-[#1d3a5e] rounded-xl p-1 shadow-lg z-10">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#132842] transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#132842] transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 h-8 rounded-lg flex items-center justify-center text-xs font-mono text-cyan-400 hover:bg-[#132842] transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoomScale * 100)}%
                </button>
              </div>
            </div>

            {/* Bottom Gallery Strip */}
            {gallery.length > 1 && (
              <div className="px-4 py-2.5 border-t border-[#142944] bg-[#071322] flex items-center gap-3 overflow-x-auto scrollbar-thin">
                <span className="text-xs text-slate-400 font-mono shrink-0">
                  {isAr ? 'الصور المتاحة:' : 'Channels:'}
                </span>
                {gallery.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActivePhotoIdx(idx);
                      setZoomScale(1);
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      activePhotoIdx === idx
                        ? 'border-cyan-400 bg-[#0e2440] shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'border-[#172c47] bg-[#0a182b] hover:border-slate-500'
                    }`}
                  >
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-black/50 shrink-0">
                      <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-slate-200 pr-1 max-w-[140px] truncate text-left">
                      {isAr && photo.labelAr ? photo.labelAr : photo.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Detailed Telemetry & Investigation Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-[#142944] bg-[#081527] overflow-y-auto space-y-4">
            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>{isAr ? 'بيانات البلاغ والتحقق الميداني' : 'Telemetry & Field Ground Truth'}</span>
            </h4>

            {/* Coordinates Grid */}
            <div className="p-3.5 rounded-2xl bg-[#0b1a2d] border border-[#162e4a] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  {isAr ? 'إحداثيات GPS الحقيقية' : 'Real GPS Coords'}
                </span>
                <span className="font-mono text-white font-bold">
                  {report.coordsGps.lat.toFixed(4)}°, {report.coordsGps.lng.toFixed(4)}°
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#152a45]">
                <span className="text-slate-400">{isAr ? 'الرمز العسكري/التكتيكي' : 'Sensor Code'}</span>
                <span className="font-mono text-cyan-300 text-[11px]">{report.coordinates}</span>
              </div>
            </div>

            {/* Sensor & Satellite Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#0b1a2d] border border-[#162e4a]">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isAr ? 'شدة الإشعاع (FRP)' : 'Fire Radiative Power'}
                </span>
                <span className="text-base font-bold font-mono text-orange-400 flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {report.frpMw ? `${report.frpMw} MW` : 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#0b1a2d] border border-[#162e4a]">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isAr ? 'حرارة السطوع' : 'Brightness Temp'}
                </span>
                <span className="text-base font-bold font-mono text-amber-300 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" />
                  {report.tempK ? `${report.tempK} K` : '367 K'}
                </span>
              </div>
            </div>

            {/* Source & Reporter */}
            <div className="p-3.5 rounded-2xl bg-[#0b1a2d] border border-[#162e4a] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  {isAr ? 'المصدر الفضائي / المستشعر' : 'Platform / Sensor'}
                </span>
                <span className="font-semibold text-slate-200">{report.satelliteSource || 'VIIRS NOAA-20'}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#152a45]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {isAr ? 'توقيت الرصد' : 'Report Time'}
                </span>
                <span className="font-mono text-slate-300">
                  {isAr && report.timeAgoAr ? report.timeAgoAr : report.timeAgo}
                </span>
              </div>

              {report.reporterName && (
                <div className="flex items-center justify-between pt-1 border-t border-[#152a45]">
                  <span className="text-slate-400">{isAr ? 'الراصد / الجهة' : 'Observer Unit'}</span>
                  <span className="font-semibold text-emerald-400">{report.reporterName}</span>
                </div>
              )}
            </div>

            {/* Narrative Description */}
            <div className="p-3.5 rounded-2xl bg-[#0b1a2d] border border-[#162e4a]">
              <span className="text-xs text-slate-400 block mb-1 font-semibold">
                {isAr ? 'تقرير الحالة الميدانية والتحليل' : 'Incident Assessment Notes'}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {isAr && report.descriptionAr ? report.descriptionAr : report.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

