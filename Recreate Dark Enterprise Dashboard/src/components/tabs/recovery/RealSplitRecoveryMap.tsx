import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Layers, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Flame,
  Sprout,
  Calendar,
  Sliders,
  Maximize2
} from 'lucide-react';

interface RealSplitRecoveryMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  sliderPos: number;
  onSliderChange: (pos: number) => void;
  activeStageCode?: string;
  isPlayingSimulation?: boolean;
  onToggleSimulation?: () => void;
  onResetSlider?: () => void;
  onSelectStageCode?: (code: 'S' | 'E' | 'V' | 'N') => void;
  language: 'en' | 'ar';
}

export const RealSplitRecoveryMap: React.FC<RealSplitRecoveryMapProps> = ({
  center,
  zoom,
  sliderPos = 50,
  onSliderChange,
  activeStageCode = 'E',
  isPlayingSimulation = false,
  onToggleSimulation,
  onResetSlider,
  onSelectStageCode,
  language,
}) => {
  const isAr = language === 'ar';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapBeforeRef = useRef<L.Map | null>(null);
  const mapAfterRef = useRef<L.Map | null>(null);

  const safeSliderPos = Number.isFinite(sliderPos) ? sliderPos : 50;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [tileProvider, setTileProvider] = useState<'google' | 'esri'>('google');
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: center.lat,
    lng: center.lng,
    zoom,
  });

  // Initialize both synchronized Leaflet maps
  useEffect(() => {
    if (!containerRef.current) return;

    const beforeContainer = containerRef.current.querySelector('#leaflet-map-before') as HTMLElement;
    const afterContainer = containerRef.current.querySelector('#leaflet-map-after') as HTMLElement;

    if (!beforeContainer || !afterContainer) return;

    // Clean up existing instances
    if (mapBeforeRef.current) {
      mapBeforeRef.current.remove();
      mapBeforeRef.current = null;
    }
    if (mapAfterRef.current) {
      mapAfterRef.current.remove();
      mapAfterRef.current = null;
    }

    const tileUrl = tileProvider === 'google'
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const subdomains = tileProvider === 'google' ? ['mt0', 'mt1', 'mt2', 'mt3'] : [];

    // Map 1: MASTER MAP - Receives 100% of mouse/touch/wheel interactions
    const mapBefore = L.map(beforeContainer, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
    });

    L.tileLayer(tileUrl, { maxZoom: 19, subdomains }).addTo(mapBefore);

    // Map 2: SLAVE MAP - Has pointer-events: none; perfectly mirrors Map 1
    const mapAfter = L.map(afterContainer, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      keyboard: false,
    });

    L.tileLayer(tileUrl, { maxZoom: 19, subdomains }).addTo(mapAfter);

    // Coordinate offsets relative to center
    const cLat = center.lat;
    const cLng = center.lng;

    // 1. Natural River and Hydrology Arteries (drawn on both maps for realism)
    const riverCoords1: L.LatLngExpression[] = [
      [cLat + 0.07, cLng - 0.09],
      [cLat + 0.05, cLng - 0.05],
      [cLat + 0.055, cLng - 0.02],
      [cLat + 0.025, cLng + 0.01],
      [cLat + 0.015, cLng + 0.045],
      [cLat - 0.02, cLng + 0.07],
      [cLat - 0.05, cLng + 0.09],
    ];
    L.polyline(riverCoords1, { color: '#0084ff', weight: 2.5, opacity: 0.85, lineCap: 'round' }).addTo(mapBefore);
    L.polyline(riverCoords1, { color: '#0084ff', weight: 2.5, opacity: 0.85, lineCap: 'round' }).addTo(mapAfter);

    const riverCoords2: L.LatLngExpression[] = [
      [cLat + 0.03, cLng - 0.07],
      [cLat + 0.015, cLng - 0.03],
      [cLat - 0.01, cLng - 0.01],
      [cLat - 0.035, cLng + 0.03],
    ];
    L.polyline(riverCoords2, { color: '#38bdf8', weight: 2, opacity: 0.8, lineCap: 'round' }).addTo(mapBefore);
    L.polyline(riverCoords2, { color: '#38bdf8', weight: 2, opacity: 0.8, lineCap: 'round' }).addTo(mapAfter);

    // 2. Distinct Yellow Perimeter Boundary matching user screenshot exactly!
    const yellowBoundaryCoords: L.LatLngExpression[] = [
      [cLat + 0.095, cLng - 0.015],
      [cLat + 0.075, cLng + 0.035],
      [cLat + 0.085, cLng + 0.125],
      [cLat + 0.025, cLng + 0.145],
      [cLat - 0.005, cLng + 0.11],
      [cLat - 0.025, cLng + 0.055],
      [cLat - 0.065, cLng + 0.075],
      [cLat - 0.06, cLng + 0.02],
      [cLat - 0.015, cLng + 0.005],
      [cLat + 0.035, cLng - 0.01],
      [cLat + 0.095, cLng - 0.015],
    ];
    L.polyline(yellowBoundaryCoords, {
      color: '#facc15',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapAfter);

    // 3. Upper Charred Burn Scar dNBR Heatmap (Amber/Orange/Brown scorched ground)
    L.polygon([
      [cLat + 0.095, cLng - 0.015],
      [cLat + 0.075, cLng + 0.035],
      [cLat + 0.085, cLng + 0.125],
      [cLat + 0.025, cLng + 0.145],
      [cLat - 0.005, cLng + 0.11],
      [cLat - 0.025, cLng + 0.055],
      [cLat + 0.015, cLng + 0.02],
      [cLat + 0.035, cLng - 0.01],
    ], {
      color: '#ea580c',
      weight: 1.5,
      fillColor: '#c2410c',
      fillOpacity: 0.65,
    }).addTo(mapAfter);

    // 4. Lower-Right Active Vegetation Return Zone (Lime Green patch matching reference)
    L.polygon([
      [cLat - 0.025, cLng + 0.055],
      [cLat - 0.005, cLng + 0.11],
      [cLat - 0.035, cLng + 0.095],
      [cLat - 0.065, cLng + 0.075],
      [cLat - 0.06, cLng + 0.02],
      [cLat - 0.015, cLng + 0.005],
    ], {
      color: '#facc15',
      weight: 2.5,
      fillColor: '#22c55e',
      fillOpacity: 0.72,
    }).addTo(mapAfter);

    // 5. Focal Point Dot Marker in the green patch (matching reference yellow dot)
    const focalPoint = L.circleMarker([cLat - 0.038, cLng + 0.062], {
      radius: 6,
      color: '#ffffff',
      weight: 2,
      fillColor: '#facc15',
      fillOpacity: 1,
    }).addTo(mapAfter);

    focalPoint.bindPopup(
      `<div style="font-family: monospace; font-size: 11px; padding: 4px; color: #022c22;">
        <strong>${isAr ? 'نقطة الرصد والتعافي الفعّال' : 'Active Recovery Field Station'}</strong><br/>
        NDVI: +0.64 (Vegetation Return)<br/>
        Lat: ${(cLat - 0.038).toFixed(4)}, Lng: ${(cLng + 0.062).toFixed(4)}
      </div>`
    );

    // Synchronize Map 1 & Map 2 seamlessly without event collision
    const syncView = () => {
      const c = mapBefore.getCenter();
      const z = mapBefore.getZoom();
      mapAfter.setView(c, z, { animate: false });
      setMapCoords({ lat: c.lat, lng: c.lng, zoom: z });
    };

    mapBefore.on('move', syncView);
    mapBefore.on('zoom', syncView);

    mapBeforeRef.current = mapBefore;
    mapAfterRef.current = mapAfter;

    return () => {
      mapBefore.off('move', syncView);
      mapBefore.off('zoom', syncView);
      mapBefore.remove();
      mapAfter.remove();
      mapBeforeRef.current = null;
      mapAfterRef.current = null;
    };
  }, [center.lat, center.lng, zoom, tileProvider]);

  // Handle Dragging Slider via window listeners
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 3), 97);
    onSliderChange(percent);
  }, [isDragging, onSliderChange]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 3), 97);
    onSliderChange(percent);
  }, [isDragging, onSliderChange]);

  useEffect(() => {
    const onMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  const handleZoomIn = () => {
    mapBeforeRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapBeforeRef.current?.zoomOut();
  };

  const handleReset = () => {
    mapBeforeRef.current?.setView([center.lat, center.lng], zoom);
    if (onResetSlider) onResetSlider();
    else onSliderChange(50);
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 min-h-[480px] sm:min-h-[520px] lg:min-h-[580px] w-full rounded-2xl overflow-hidden border border-[#152a45] shadow-2xl select-none group flex flex-col justify-between"
    >
      {/* ========================================================================= */}
      {/* MAP LAYER 1: BEFORE (Full width background, handles 100% of user gestures) */}
      {/* ========================================================================= */}
      <div 
        id="leaflet-map-before" 
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" 
      />

      {/* ========================================================================= */}
      {/* MAP LAYER 2: AFTER (Clipped horizontally by sliderPos, pointer-events: none) */}
      {/* ========================================================================= */}
      <div 
        id="leaflet-map-after" 
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        style={{
          clipPath: `polygon(${safeSliderPos}% 0, 100% 0, 100% 100%, ${safeSliderPos}% 100%)`,
        }}
      />

      {/* Subtle ambient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060f1b]/70 via-transparent to-[#060f1b]/30 pointer-events-none z-20" />

      {/* ========================================================================= */}
      {/* TOP HUD BADGES: Before (2023) & After (2024) matching user screenshot */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none flex items-center gap-2">
        <div className="px-3.5 py-1.5 rounded-xl bg-[#091524]/90 backdrop-blur-md border border-[#1b385c] text-xs font-bold text-white shadow-xl flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>{isAr ? 'قبل الحريق (2023)' : 'Before (2023)'}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-30 pointer-events-none flex items-center gap-2">
        <div className="px-3.5 py-1.5 rounded-xl bg-[#091524]/90 backdrop-blur-md border border-[#1b385c] text-xs font-bold text-white shadow-xl flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]" />
          <span>{isAr ? 'بعد التعافي (2024)' : 'After (2024)'}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDER VERTICAL LINE & CIRCULAR DRAG HANDLE matching screenshot */}
      {/* ========================================================================= */}
      <div 
        className="absolute top-0 bottom-0 z-30 pointer-events-none"
        style={{ left: `${safeSliderPos}%` }}
      >
        {/* Crisp White/Silver Vertical Divider Line */}
        <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />

        {/* Circular Drag Handle (+) with Blue Background matching reference */}
        <div 
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsDragging(true);
          }}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0084ff] hover:bg-blue-400 active:scale-110 text-white flex items-center justify-center cursor-ew-resize shadow-[0_0_24px_rgba(0,132,255,0.9)] border-2 border-white transition-transform pointer-events-auto"
          title={isAr ? 'اسحب لمقارنة مسار الحريق والتعافي' : 'Drag left or right to compare'}
        >
          <Plus className="w-5 h-5 stroke-[2.8]" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE SIMULATION & TIMELINE SCRUBBER HUD BAR (Bottom Overlay) */}
      {/* ========================================================================= */}
      <div className="absolute bottom-4 left-4 right-16 z-30 flex flex-wrap items-center gap-2.5 bg-[#091524]/90 backdrop-blur-md border border-[#183659] rounded-2xl p-2.5 shadow-2xl">
        {/* Play/Pause Simulation button */}
        {onToggleSimulation && (
          <button
            type="button"
            onClick={onToggleSimulation}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
              isPlayingSimulation
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                : 'bg-[#0084ff] hover:bg-blue-500 text-white shadow-[0_0_14px_rgba(0,132,255,0.4)]'
            }`}
          >
            {isPlayingSimulation ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{isAr ? 'إيقاف مؤقت' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isAr ? 'محاكاة التعافي' : 'Simulate'}</span>
              </>
            )}
          </button>
        )}

        {/* Reset Button (50%) */}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d2038] hover:bg-[#153154] text-slate-300 hover:text-white border border-[#1b3d66] text-xs font-semibold cursor-pointer transition-colors"
          title={isAr ? 'إعادة ضبط إلى الوضع المرجعي (50%)' : 'Reset to baseline (50%)'}
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">{isAr ? 'إعادة ضبط 50%' : '50%'}</span>
        </button>

        {/* Quick Stage Pills (S, E, V, N) */}
        {onSelectStageCode && (
          <div className="hidden md:flex items-center gap-1 bg-[#06111e] p-1 rounded-xl border border-[#163152]">
            {(['S', 'E', 'V', 'N'] as const).map((code) => {
              const isActive = activeStageCode === code;
              const colorMap: Record<string, string> = {
                S: '#dc2626',
                E: '#ea580c',
                V: '#84cc16',
                N: '#10b981',
              };
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onSelectStageCode(code)}
                  className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'text-white ring-2 ring-white/80 shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: isActive ? colorMap[code] : 'transparent',
                  }}
                  title={code}
                >
                  {code}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Timeline Scrubber Slider */}
        <div className="flex-1 min-w-[130px] flex items-center gap-2">
          <input
            type="range"
            min="5"
            max="95"
            value={Math.round(safeSliderPos)}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#122b49] rounded-lg appearance-none cursor-pointer accent-[#0084ff]"
            title={isAr ? 'شريط زمني مباشر' : 'Live Timeline Scrubber'}
          />
          <span className="text-xs font-mono font-bold text-cyan-300 min-w-[36px] text-right">
            {Math.round(safeSliderPos)}%
          </span>
        </div>

        {/* Live Coordinates chip */}
        <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-[#06111e] px-2.5 py-1 rounded-lg border border-[#163152]">
          <span className="text-slate-500">GPS:</span>
          <span>{mapCoords.lat.toFixed(3)}, {mapCoords.lng.toFixed(3)}</span>
          <span className="text-cyan-400 font-bold ml-1">z{mapCoords.zoom}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAP CONTROLS (Bottom-Right overlay buttons) */}
      {/* ========================================================================= */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1.5 bg-[#091524]/90 backdrop-blur-md border border-[#1b3454] rounded-xl p-1 shadow-2xl">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#12243d] transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#12243d] transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#12243d] transition-colors cursor-pointer"
          title={isAr ? 'إعادة ضبط المركز' : 'Recenter Map'}
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setTileProvider(tileProvider === 'google' ? 'esri' : 'google')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400 hover:text-white hover:bg-[#12243d] transition-colors cursor-pointer"
          title={isAr ? 'تبديل طبقات الأقمار الصناعية' : 'Switch Imagery'}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
