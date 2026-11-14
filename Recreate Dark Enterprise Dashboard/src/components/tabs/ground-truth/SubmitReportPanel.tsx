import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  MapPin, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Image as ImageIcon,
  Crosshair,
  Send
} from 'lucide-react';
import { ReportType, FireReport } from './groundTruthTypes';

interface SubmitReportPanelProps {
  onSubmitReport: (report: Omit<FireReport, 'id' | 'timestamp' | 'timeAgo'>) => void;
  isMapPickingLocation?: boolean;
  onStartMapLocationPick?: () => void;
  selectedLocationCoordinates?: string;
  selectedMapCoords?: { x: number; y: number };
  language: 'en' | 'ar';
  presetLocations?: Array<{ label: string; labelAr: string; coords: string; lat: number; lng: number; x: number; y: number }>;
}

export const SubmitReportPanel: React.FC<SubmitReportPanelProps> = ({
  onSubmitReport,
  isMapPickingLocation = false,
  onStartMapLocationPick,
  selectedLocationCoordinates,
  selectedMapCoords,
  language,
  presetLocations = [],
}) => {
  const isAr = language === 'ar';

  const defaultPresets = [
    { label: 'Wildfire Blaze', image: '/assets/ground-truth/wildfire_blaze_1793981574666.jpg' },
    { label: 'False Prescribed', image: '/assets/ground-truth/false_detection_1793981594833.jpg' },
    { label: 'Smoke Plume', image: '/assets/ground-truth/smoke_plume_1793981610168.jpg' },
    { label: 'Pine Canopy Fire', image: '/assets/ground-truth/pine_forest_fire_1793981623482.jpg' },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(defaultPresets[0].image);
  const [photoPreview, setPhotoPreview] = useState<string | null>(defaultPresets[0].image);
  const [locationText, setLocationText] = useState<string>(
    selectedLocationCoordinates || '280 - 20-15.1 205 - 36.5878'
  );
  const [reportType, setReportType] = useState<ReportType>('confirmed');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [observerNotes, setObserverNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when parent updates selected coordinates via map click
  useEffect(() => {
    if (selectedLocationCoordinates) {
      setLocationText(selectedLocationCoordinates);
    }
  }, [selectedLocationCoordinates]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setSelectedPhoto(url);
    }
  };

  const handleSelectPresetPhoto = (presetUrl: string) => {
    setSelectedPhoto(presetUrl);
    setPhotoPreview(presetUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!locationText) {
      setErrorMessage(isAr ? 'يرجى تحديد موقع البلاغ (GPS) على الخريطة' : 'Please add or select a GPS location.');
      return;
    }

    const typeTitleMap: Record<ReportType, { en: string; ar: string }> = {
      confirmed: { en: 'Confirmed Fire', ar: 'حريق مؤكد' },
      false: { en: 'False Detection', ar: 'إنذار خاطئ' },
      review: { en: 'Needs Review', ar: 'قيد المراجعة' },
    };

    const typeStatusMap: Record<ReportType, 'confirmed' | 'pending' | 'false'> = {
      confirmed: 'confirmed',
      false: 'false',
      review: 'pending',
    };

    onSubmitReport({
      title: typeTitleMap[reportType].en,
      titleAr: typeTitleMap[reportType].ar,
      type: reportType,
      status: typeStatusMap[reportType],
      locationName: isAr ? 'بلاغ ميداني جديد' : 'Field Ground Uplink',
      locationNameAr: 'بلاغ ميداني جديد من فرق المراقبة',
      coordinates: locationText,
      mapPosition: selectedMapCoords || {
        x: 45 + (Math.random() * 20 - 10),
        y: 45 + (Math.random() * 20 - 10),
      },
      imageUrl: photoPreview || selectedPhoto || defaultPresets[0].image,
      description: observerNotes || (isAr ? 'تم رصد وتوثيق البلاغ الميداني وإرساله لغرفة العمليات.' : 'Field incident reported via tactical ground-truth uplink.'),
      descriptionAr: observerNotes || 'تم رصد وتوثيق البلاغ الميداني وإرساله لغرفة العمليات المركزية.',
      confidence: reportType === 'confirmed' ? 98 : reportType === 'false' ? 95 : 78,
      reporterName: isAr ? 'مستكشف ميداني' : 'Field Scout Unit',
      reporterRole: isAr ? 'دورية أرضية' : 'Ground Patrol',
    });

    setSuccessMessage(isAr ? 'تم تسجيل وإرسال البلاغ بنجاح!' : 'Report submitted successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <aside 
      aria-label="Submit Report" 
      className="w-full lg:w-72 xl:w-80 bg-[#091524] border border-[#14263f] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative select-none"
    >
      <div>
        {/* Panel Title */}
        <h2 className="text-white text-base sm:text-lg font-bold tracking-tight mb-4 flex items-center justify-between">
          <span>{isAr ? 'تقديم بلاغ ميداني' : 'Submit Report'}</span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            {isAr ? 'تحقق ميداني' : 'Ground Truth'}
          </span>
        </h2>

        {/* Upload Photo Dropzone Box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-[#1f3756] hover:border-blue-400/60 bg-[#0b1a2d]/80 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {photoPreview || selectedPhoto ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
              <img 
                src={(photoPreview || selectedPhoto) ?? undefined} 
                alt="Selected report snapshot" 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium">
                {isAr ? 'انقر لتغيير الصورة' : 'Click to change photo'}
              </div>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-xl bg-[#11243d] flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-transform group-hover:scale-105 mb-2.5 border border-[#1d385c]">
                <UploadCloud className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-slate-300 text-xs sm:text-sm font-medium group-hover:text-white">
                {isAr ? 'رفع صورة ميدانية' : 'Upload Photo'}
              </span>
            </>
          )}

          {/* Quick Preset Selector */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="mt-2.5 flex items-center gap-2 pt-2 border-t border-[#172b45] w-full justify-center"
          >
            <span className="text-[10.5px] text-slate-400 mr-1 flex items-center gap-1 font-mono">
              <ImageIcon className="w-3 h-3" /> {isAr ? 'أمثلة:' : 'Presets:'}
            </span>
            {defaultPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPresetPhoto(preset.image)}
                className={`w-6 h-6 rounded-md border overflow-hidden cursor-pointer hover:scale-110 transition-transform ${
                  selectedPhoto === preset.image ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-[#1b3454]'
                }`}
                title={preset.label}
              >
                <img src={preset.image} alt={preset.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Add Location (GPS) Selector */}
        <div className="mt-4 relative">
          <label className="text-slate-400 text-xs font-medium block mb-1.5">
            {isAr ? 'موقع البلاغ (إحداثيات GPS)' : 'Incident GPS Coordinates'}
          </label>
          <button
            type="button"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className={`w-full bg-[#0b192c] border rounded-xl px-3.5 py-2.5 flex items-center justify-between text-sm transition-colors cursor-pointer ${
              isMapPickingLocation 
                ? 'border-cyan-400 ring-2 ring-cyan-400/20 text-cyan-300' 
                : 'border-[#1b3454] hover:border-[#2b4c77] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-mono text-xs truncate">
                {locationText || (isAr ? 'حدد الموقع (GPS)' : 'Add Location (GPS)')}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform" />
          </button>

          {/* Location Dropdown Menu */}
          {isLocationDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0b192c] border border-[#1b3454] rounded-xl shadow-2xl py-2 z-30 text-xs">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {isAr ? 'قطاعات البلاغات الجاهزة' : 'Preset Incident Sectors'}
              </div>
              {presetLocations.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLocationText(loc.coords);
                    setIsLocationDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#12243d] text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{isAr ? loc.labelAr : loc.label}</span>
                  <span className="font-mono text-[10px] text-cyan-400 ml-2">{loc.lat.toFixed(2)}°</span>
                </button>
              ))}

              <div className="border-t border-[#172b45] my-1" />

              {/* Click position on map */}
              <button
                type="button"
                onClick={() => {
                  setIsLocationDropdownOpen(false);
                  if (onStartMapLocationPick) onStartMapLocationPick();
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#12243d] text-cyan-400 flex items-center gap-2 font-medium cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>{isAr ? 'انقر على الخريطة لتحديد الموقع بدقة' : 'Click position on Satellite Map'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Report Type Selector matching screenshot badges */}
        <div className="mt-4">
          <label className="text-slate-400 text-xs font-medium block mb-2">
            {isAr ? 'نوع وتصنيف البلاغ' : 'Report Type'}
          </label>

          <div className="space-y-2">
            {/* Option 1: Confirm Fire */}
            <button
              type="button"
              onClick={() => setReportType('confirmed')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer text-left ${
                reportType === 'confirmed'
                  ? 'bg-[#0d223c] border-cyan-500 text-white font-medium shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-[#0a1626] border-[#162a42] text-slate-300 hover:border-[#223f63]'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-semibold">{isAr ? 'تأكيد حريق نشط (Confirm Fire)' : 'Confirm Fire'}</span>
            </button>

            {/* Option 2: False Detection */}
            <button
              type="button"
              onClick={() => setReportType('false')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer text-left ${
                reportType === 'false'
                  ? 'bg-[#0d223c] border-blue-500 text-white font-medium shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                  : 'bg-[#0a1626] border-[#162a42] text-slate-300 hover:border-[#223f63]'
              }`}
            >
              <div className="w-5 h-5 rounded-md bg-[#0070f3] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="font-semibold">{isAr ? 'إنذار خاطئ / حرق زراعي (False Detection)' : 'False Detection'}</span>
            </button>

            {/* Option 3: Needs Review */}
            <button
              type="button"
              onClick={() => setReportType('review')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer text-left ${
                reportType === 'review'
                  ? 'bg-[#291316] border-red-500 text-white font-medium shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                  : 'bg-[#0a1626] border-[#162a42] text-slate-300 hover:border-[#223f63]'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#ef4444] text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-semibold">{isAr ? 'يتطلب مراجعة وفحص (Needs Review)' : 'Needs Review'}</span>
            </button>
          </div>
        </div>

        {/* Optional Notes input */}
        <div className="mt-3.5">
          <input
            type="text"
            value={observerNotes}
            onChange={(e) => setObserverNotes(e.target.value)}
            placeholder={isAr ? 'ملاحظات وتفاصيل إضافية عن الدخان أو سرعة الرياح...' : 'Additional notes or smoke conditions...'}
            className="w-full bg-[#0b192c] border border-[#1b3454] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Error or Success Notice */}
        {errorMessage && (
          <div className="mt-2.5 p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-2.5 p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="mt-5 pt-3 border-t border-slate-800/60">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-[#0070f3] hover:bg-[#0060df] active:bg-[#0050cf] text-white font-bold py-2.5 px-4 rounded-xl shadow-[0_4px_16px_rgba(0,112,243,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Send className="w-4 h-4" />
          <span>{isAr ? 'إرسال البلاغ الميداني' : 'Submit Report'}</span>
        </button>
      </div>
    </aside>
  );
};

