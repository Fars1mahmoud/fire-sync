import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Target, ZoomIn, ZoomOut, Flame, Info, Check } from 'lucide-react';
import { LayerState, AffectedArea, PlumeForecast } from './smokeTypes';

interface MainSatelliteMapProps {
  layers: LayerState;
  selectedForecast: PlumeForecast;
  selectedArea: AffectedArea | null;
  onSelectArea: (area: AffectedArea) => void;
  affectedAreas: AffectedArea[];
  windSpeedMultiplier: number;
  language: 'en' | 'ar';
  satelliteImage?: string;
  hotspots?: Array<{
    id: number;
    x: number;
    y: number;
    temp: string;
    conf: string;
    source: string;
    frp?: number;
    lat?: number;
    lon?: number;
  }>;
  cityPositions?: Record<string, { x: number; y: number }>;
  smokeOpacity?: number;
  fireSourceFilter?: string;
  activeTabMode?: string;
}

interface InspectionPoint {
  x: number;
  y: number;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  aod: number;
}

export const MainSatelliteMap: React.FC<MainSatelliteMapProps> = ({
  layers,
  selectedForecast,
  selectedArea,
  onSelectArea,
  affectedAreas,
  windSpeedMultiplier,
  language,
  satelliteImage = '/satellite_map_crop.png',
  hotspots = [],
  cityPositions = {},
  smokeOpacity = 0.9,
  fireSourceFilter = 'all',
  activeTabMode = 'smoke',
}) => {
  const isAr = language === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [inspection, setInspection] = useState<InspectionPoint | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);

  // Filter hotspots according to satellite dropdown
  const filteredHotspots = useMemo(() => {
    if (!hotspots || hotspots.length === 0) return [];
    if (fireSourceFilter === 'all') return hotspots;
    const filter = fireSourceFilter.toLowerCase();
    return hotspots.filter((h) => {
      const src = (h.source || '').toLowerCase();
      if (filter === 'modis') return src.includes('modis') || src.includes('aqua') || src.includes('terra');
      if (filter === 'viirs') return src.includes('viirs') || src.includes('noaa') || src.includes('npp');
      if (filter === 'sentinel') return src.includes('sentinel') || src.includes('slstr');
      return true;
    });
  }, [hotspots, fireSourceFilter]);

  // Animated wind streamlines on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 80;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: (0.9 + Math.random() * 1.6) * windSpeedMultiplier,
      length: 14 + Math.random() * 20,
      opacity: 0.25 + Math.random() * 0.65,
      angle: -0.38 + (Math.random() - 0.5) * 0.2, // ~WNW direction
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (layers.wind) {
        particles.forEach((p) => {
          p.x += Math.cos(p.angle) * p.speed * windSpeedMultiplier;
          p.y += Math.sin(p.angle) * p.speed * windSpeedMultiplier;

          if (p.x > width + 40) p.x = -40;
          if (p.x < -40) p.x = width + 40;
          if (p.y > height + 40) p.y = -40;
          if (p.y < -40) p.y = height + 40;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.75})`;
          ctx.lineWidth = 1.25;
          ctx.lineCap = 'round';
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(
            p.x - Math.cos(p.angle) * p.length,
            p.y - Math.sin(p.angle) * p.length
          );
          ctx.stroke();

          // Arrowhead
          const headLen = 3.5;
          const a1 = p.angle + Math.PI - 0.45;
          const a2 = p.angle + Math.PI + 0.45;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.9})`;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(a1) * headLen, p.y + Math.sin(a1) * headLen);
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.cos(a2) * headLen, p.y + Math.sin(a2) * headLen);
          ctx.stroke();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [layers.wind, windSpeedMultiplier]);

  const handleRecenter = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setInspection(null);
    setSelectedHotspot(null);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.85));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: pan.x + (e.clientX - dragStart.x),
      y: pan.y + (e.clientY - dragStart.y),
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Approximate geographical coordinates
    const lat = -2.0 - (clickY / 100) * 11.0;
    const lng = -68.0 + (clickX / 100) * 16.0;

    // Plume distance attenuation calculation
    const distToCenter = Math.hypot(clickX - 45, clickY - 55);
    const simulatedAqi = Math.max(
      25,
      Math.min(285, Math.round(240 - distToCenter * 3.6 + (Math.random() * 16 - 8)))
    );
    const pm25 = parseFloat((simulatedAqi * 0.49).toFixed(1));
    const aod = parseFloat((simulatedAqi * 0.022).toFixed(2));

    setInspection({
      x: clickX,
      y: clickY,
      lat: parseFloat(lat.toFixed(3)),
      lng: parseFloat(lng.toFixed(3)),
      aqi: simulatedAqi,
      pm25,
      aod,
    });
    setSelectedHotspot(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleMapClick}
      className="relative w-full flex-1 min-h-[460px] md:min-h-[510px] rounded-2xl overflow-hidden border border-[#1b2b45] shadow-2xl bg-[#070e1c] select-none cursor-grab active:cursor-grabbing group"
    >
      {/* Zoomable & Pannable Layer Container */}
      <div
        className="w-full h-full transition-transform duration-150 ease-out origin-center"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
        }}
      >
        {/* Base Cropped Satellite Map */}
        <img
          src={satelliteImage}
          alt="Satellite Wildfire & Smoke Plume Map"
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />

        {/* Dynamic Forecast Overlay (blends when user selects 16h, 45h, or 72h) */}
        {selectedForecast.id !== '20h' && layers.smoke && (
          <div
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none mix-blend-screen"
            style={{
              backgroundImage: `url(${selectedForecast.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: smokeOpacity * 0.9,
            }}
          />
        )}

        {/* Smoke Layer Fade / Opacity adjustment */}
        {layers.smoke && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-screen"
            style={{
              background: 'radial-gradient(circle at 45% 55%, rgba(147, 51, 234, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 75%)',
              opacity: smokeOpacity,
            }}
          />
        )}

        {!layers.smoke && (
          <div className="absolute inset-0 bg-[#071322]/85 backdrop-blur-[2px] transition-all duration-300 pointer-events-none flex items-center justify-center">
            <span className="text-xs font-mono text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700">
              {isAr ? 'طبقة الدخان معطلة (سنتينل-5P في وضع عدم الاتصال)' : 'Smoke Layer Hidden (Sentinel-5P Offline)'}
            </span>
          </div>
        )}

        {/* Aerosol Optical Depth Heatmap Overlay */}
        {layers.aerosol && (
          <div className="absolute inset-0 pointer-events-none opacity-35 mix-blend-color-dodge bg-gradient-to-tr from-amber-500/25 via-rose-600/35 to-purple-800/35 transition-opacity duration-300" />
        )}

        {/* Interactive Wind Streamlines Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* Fire Sources Hotspots */}
        {layers.fireSources && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {filteredHotspots.map((spot) => (
              <div
                key={spot.id}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(spot);
                  setInspection(null);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
              >
                <div className="relative group/spot flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping opacity-75 absolute" />
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-600 to-amber-400 flex items-center justify-center shadow-[0_0_12px_#ef4444] border border-amber-200/80 hover:scale-125 transition-transform">
                    <Flame className="w-3 h-3 text-white fill-white" />
                  </div>

                  {/* Hotspot tooltip on hover */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/spot:flex flex-col items-center z-50 pointer-events-none">
                    <div className="bg-[#0b1426]/95 border border-red-500/60 rounded-lg p-2 text-[10px] text-white shadow-2xl whitespace-nowrap backdrop-blur-md">
                      <div className="font-bold text-amber-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>FRP Active Source #{spot.id}</span>
                      </div>
                      <div className="text-slate-300 mt-0.5">Brightness: {spot.temp}</div>
                      {spot.frp && (
                        <div className="text-cyan-300 font-mono">FRP: {spot.frp} MW</div>
                      )}
                      <div className="text-slate-400">
                        Conf: {spot.conf} · {spot.source}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* City Markers with AQI Status Badges */}
        {layers.aqi && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {affectedAreas.map((area) => {
              const pos = cityPositions[area.id] || { x: 50, y: 50 };
              const isSelected = selectedArea?.id === area.id;
              const aqiVal = selectedForecast.aqiValues[area.id] || area.aqi;

              const badgeColor =
                aqiVal > 150
                  ? 'bg-red-950/85 text-red-300 border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : aqiVal > 100
                  ? 'bg-amber-950/85 text-amber-300 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-emerald-950/85 text-emerald-300 border-emerald-500/70';

              return (
                <div
                  key={area.id}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectArea(area);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-transform duration-200 ${
                    isSelected ? 'scale-115 z-40' : 'hover:scale-105'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border backdrop-blur-md flex items-center gap-1.5 shadow-lg ${badgeColor}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      <span>{isAr ? area.nameAr : area.name}</span>
                      <span className="opacity-95 font-mono">({aqiVal})</span>
                    </div>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rotate-45 bg-cyan-400 shadow-[0_0_8px_#22d3ee] -mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* User Clicked Inspection Pin */}
        {inspection && (
          <div
            style={{ left: `${inspection.x}%`, top: `${inspection.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40"
          >
            <div className="relative flex flex-col items-center animate-bounce">
              <div className="w-5 h-5 rounded-full border-2 border-cyan-400 bg-cyan-500/40 shadow-[0_0_14px_#06b6d4] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Control Buttons (Zoom, Recenter) */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-40">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-8 h-8 rounded-lg bg-[#0b1426]/90 hover:bg-[#13223f] border border-[#1e3252] text-slate-200 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-8 h-8 rounded-lg bg-[#0b1426]/90 hover:bg-[#13223f] border border-[#1e3252] text-slate-200 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Recenter map"
          className="w-8 h-8 rounded-lg bg-[#0b1426]/90 hover:bg-[#13223f] border border-[#1e3252] text-slate-200 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <Target className="w-4 h-4" />
        </button>
      </div>

      {/* Floating telemetry HUD pill on top-left of the map */}
      <div className="absolute top-3 left-3 bg-[#071120]/90 border border-[#1c2c46] rounded-xl px-3 py-1.5 backdrop-blur-md shadow-xl z-40 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="font-semibold text-white tracking-wide">
            {isAr ? selectedForecast.titleAr : selectedForecast.title}
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 font-mono text-[11px]">
          {isAr ? 'مساحة السحابة:' : 'Plume Area:'} <strong className="text-cyan-300 font-mono">{selectedForecast.plumeAreaKm2.toLocaleString()} km²</strong>
        </span>
      </div>

      {/* Selected Hotspot Modal/Card if user clicks a hotspot */}
      {selectedHotspot && (
        <div
          className="absolute bottom-3 left-3 bg-[#091325]/95 border border-amber-500/60 rounded-xl p-3 backdrop-blur-md shadow-2xl z-40 text-xs text-white max-w-[270px] animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-1.5 border-b border-slate-700/60 pb-1">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>{isAr ? 'بيانات البؤرة الحرارية' : 'Thermal Hotspot'}</span>
            </span>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
            <span className="text-slate-400">Sensor: <strong className="text-white">{selectedHotspot.source}</strong></span>
            <span className="text-slate-400">Temp: <strong className="text-amber-400">{selectedHotspot.temp}</strong></span>
            {selectedHotspot.frp && (
              <span className="text-slate-400">FRP: <strong className="text-red-400">{selectedHotspot.frp} MW</strong></span>
            )}
            <span className="text-slate-400">Confidence: <strong className="text-emerald-400">{selectedHotspot.conf}</strong></span>
            {selectedHotspot.lat && (
              <span className="col-span-2 text-slate-400">Coords: {selectedHotspot.lat.toFixed(3)}°, {selectedHotspot.lon?.toFixed(3)}°</span>
            )}
          </div>
        </div>
      )}

      {/* Floating Inspection Tooltip when user clicks any pixel */}
      {inspection && (
        <div
          className="absolute bottom-3 left-3 bg-[#091325]/95 border border-cyan-500/50 rounded-xl p-3 backdrop-blur-md shadow-2xl z-40 text-xs text-white max-w-[260px] animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-1.5 border-b border-slate-700/60 pb-1">
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>{isAr ? 'نقطة الفحص المختارة' : 'Probe Coordinates'}</span>
            </span>
            <button
              onClick={() => setInspection(null)}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
            <span className="text-slate-400">{isAr ? 'خط العرض:' : 'Lat:'} {inspection.lat}°</span>
            <span className="text-slate-400">{isAr ? 'خط الطول:' : 'Lng:'} {inspection.lng}°</span>
            <span className="text-slate-400">{isAr ? 'جودة الهواء:' : 'AQI:'} <strong className="text-orange-400">{inspection.aqi}</strong></span>
            <span className="text-slate-400">PM2.5: <strong className="text-white">{inspection.pm25} µg</strong></span>
            <span className="col-span-2 text-slate-400">
              Aerosol Depth (AOD): <strong className="text-cyan-400">{inspection.aod}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
