import React, { useEffect, useRef, useState } from 'react';
import {
  Flame,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  X,
  Truck,
  AlertTriangle,
  Building2,
  Layers,
  MapPin,
} from 'lucide-react';
import {
  EvacuationRoute,
  MapLayerKey,
  MapMarker,
  RouteId,
} from './evacuationTypes';

interface SatelliteEvacuationMapProps {
  routes: EvacuationRoute[];
  markers: MapMarker[];
  selectedRouteId: RouteId;
  lang: 'en' | 'ar';
  onSelectRoute: (routeId: RouteId) => void;
}

interface LegendItem {
  key: MapLayerKey;
  label: string;
  labelAr: string;
  swatchClass: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { key: 'fire', label: 'Fire Front', labelAr: 'بؤر النيران', swatchClass: 'bg-[#ef4444]' },
  { key: 'roads', label: 'Road Network', labelAr: 'شبكة الطرق', swatchClass: 'bg-[#eab308]' },
  { key: 'safeRoute', label: 'Safe Route (A)', labelAr: 'المسار الآمن (A)', swatchClass: 'bg-[#a3e635]' },
  { key: 'alternative', label: 'Alternative (B)', labelAr: 'المسار البديل (B)', swatchClass: 'bg-[#38bdf8]' },
  { key: 'detour', label: 'Detour Connector', labelAr: 'تحويلة التفافية', swatchClass: 'bg-[#f97316]' },
  { key: 'blocked', label: 'Road Closures', labelAr: 'طرق مغلقة', swatchClass: 'bg-[#3b82f6]' },
];

// Deterministic noise for procedural satellite terrain
function hash2D(ix: number, iy: number): number {
  let n = ix * 374761393 + iy * 668265263;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i += 1) {
    value += amp * smoothNoise(x * freq, y * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return value;
}

function paintSatelliteTerrain(canvas: HTMLCanvasElement): void {
  const width = 1000;
  const height = 640;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Render Amazonia/Wildfire canopy satellite terrain
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / 135;
      const ny = y / 135;
      const macro = fbm(nx + 3.1, ny + 7.4);
      const clearing = fbm(nx * 1.6 + 14.2, ny * 1.6 + 2.8);
      const canopy = smoothNoise(x / 10, y / 10);
      const grain = hash2D(x, y) * 14 - 7;

      let r = 20 + macro * 30 + canopy * 18 + grain;
      let g = 42 + macro * 42 + canopy * 24 + grain;
      let b = 22 + macro * 18 + canopy * 10 + grain * 0.6;

      if (clearing > 0.51) {
        const blend = Math.min(1, (clearing - 0.51) * 3.1);
        const ochreR = 118 + canopy * 44 + grain;
        const ochreG = 98 + canopy * 34 + grain;
        const ochreB = 64 + canopy * 20 + grain * 0.7;
        r = r * (1 - blend) + ochreR * blend;
        g = g * (1 - blend) + ochreG * blend;
        b = b * (1 - blend) + ochreB * blend;
      }

      if (macro < 0.44) {
        r *= 0.72;
        g *= 0.84;
        b *= 0.76;
      }

      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Settlement parcels
  const drawSettlementCluster = (cx: number, cy: number, count: number, seedOffset: number) => {
    ctx.save();
    for (let i = 0; i < count; i += 1) {
      const rx = cx + (hash2D(i + seedOffset, 11) - 0.5) * 90;
      const ry = cy + (hash2D(i + seedOffset, 29) - 0.5) * 65;
      const rw = 5 + hash2D(i + seedOffset, 47) * 11;
      const rh = 4 + hash2D(i + seedOffset, 63) * 8;
      ctx.fillStyle =
        hash2D(i + seedOffset, 81) > 0.45
          ? 'rgba(154, 134, 102, 0.38)'
          : 'rgba(196, 178, 142, 0.26)';
      ctx.fillRect(rx, ry, rw, rh);
    }
    ctx.restore();
  };

  drawSettlementCluster(230, 170, 38, 100);
  drawSettlementCluster(495, 250, 26, 200);
  drawSettlementCluster(790, 445, 52, 300);
  drawSettlementCluster(155, 340, 24, 400);

  // Rivers & Water bodies
  const drawRiver = (
    points: Array<[number, number]>,
    baseWidth: number,
    sandBankColor: string,
    waterColor: string
  ) => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const mx = (prev[0] + curr[0]) / 2;
      const my = (prev[1] + curr[1]) / 2;
      ctx.quadraticCurveTo(prev[0], prev[1], mx, my);
    }
    ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
    ctx.strokeStyle = sandBankColor;
    ctx.lineWidth = baseWidth + 4.5;
    ctx.stroke();

    ctx.strokeStyle = waterColor;
    ctx.lineWidth = baseWidth;
    ctx.stroke();
    ctx.restore();
  };

  drawRiver([[430, -10], [460, 48], [438, 112], [472, 168], [490, 214]], 6.5, 'rgba(128, 146, 132, 0.42)', '#346b82');
  drawRiver([[-10, 445], [82, 412], [158, 376], [256, 360], [338, 396], [438, 452], [536, 492], [648, 524], [742, 650]], 9.5, 'rgba(136, 152, 138, 0.48)', '#285c75');
  drawRiver([[660, 428], [748, 362], [838, 394], [912, 466], [1015, 492]], 8.5, 'rgba(132, 148, 135, 0.42)', '#2c6680');
  drawRiver([[784, -10], [742, 86], [680, 152], [632, 232]], 4.5, 'rgba(122, 142, 130, 0.35)', '#36728a');
}

function pointsToSvgPath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';
  return points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`)
    .join(' ');
}

export const SatelliteEvacuationMap: React.FC<SatelliteEvacuationMapProps> = ({
  routes,
  markers,
  selectedRouteId,
  lang,
  onSelectRoute,
}) => {
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Record<MapLayerKey, boolean>>({
    fire: true,
    roads: true,
    safeRoute: true,
    alternative: true,
    detour: true,
    blocked: true,
  });

  useEffect(() => {
    if (canvasRef.current) {
      paintSatelliteTerrain(canvasRef.current);
    }
  }, []);

  const toggleLayer = (key: MapLayerKey) => {
    setVisibleLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setSelectedMarker(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Map Header Toolbar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[12px] font-semibold text-slate-200">
            {isAr ? 'خريطة الأقمار الصناعية اللحظية للممرات' : 'Real-time Satellite Corridor Radar'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-[#0d1f36] px-2 py-0.5 rounded border border-[#1e3b66]">
            EPSG:3857 · VIIRS/MODIS
          </span>
        </div>
      </div>

      {/* Satellite Map Container */}
      <div
        data-testid="evacuation-map"
        className="relative flex-1 min-h-[380px] lg:min-h-[480px] rounded-xl overflow-hidden border border-[#1d3b66]/80 bg-[#0b1b12] shadow-[0_10px_35px_rgba(2,8,20,0.55)] select-none"
      >
        <div
          className="relative w-full h-full transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Procedural Satellite Terrain Canvas */}
          <canvas
            ref={canvasRef}
            aria-label="Satellite terrain map of evacuation corridors"
            className="w-full h-full object-cover block"
          />

          {/* Vignette overlay */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_58%,rgba(4,12,24,0.42)_100%)]"
            aria-hidden="true"
          />

          {/* Vector Roads, Routes & Interactive Pins */}
          <svg
            viewBox="0 0 1000 640"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <linearGradient id="route-a-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="45%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="route-b-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="55%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="route-c-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="55%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Amber Road Network */}
            {visibleLayers.roads && (
              <g
                stroke="#d97706"
                strokeOpacity="0.82"
                fill="none"
                strokeLinecap="round"
              >
                <path
                  d="M 15 24 Q 140 112 248 168 T 490 250 T 760 405 T 960 630"
                  strokeWidth="3.2"
                />
                <path
                  d="M 190 50 Q 260 130 248 180 T 176 318 T 135 460"
                  strokeWidth="2.4"
                />
                <path
                  d="M 390 220 Q 520 198 638 228 T 838 290 T 985 335"
                  strokeWidth="2.2"
                />
                <path
                  d="M 480 480 Q 620 442 742 478 T 940 538"
                  strokeWidth="2.2"
                />
                <path
                  d="M 278 265 Q 390 302 520 278"
                  strokeWidth="1.8"
                  strokeOpacity="0.65"
                />
              </g>
            )}

            {/* Detour Connector Segment */}
            {visibleLayers.detour && (
              <path
                d="M 598 134 Q 656 172 710 254"
                fill="none"
                stroke="#f97316"
                strokeWidth="4.5"
                strokeDasharray="10 6"
                strokeLinecap="round"
                opacity="0.85"
              />
            )}

            {/* Evacuation Routes */}
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const layerVisible =
                visibleLayers[route.layerKey] ||
                (route.id === 'route-c' && visibleLayers.blocked);

              if (!layerVisible) return null;

              const pathD = pointsToSvgPath(route.polyline);
              const gradientUrl =
                route.id === 'route-a'
                  ? 'url(#route-a-grad)'
                  : route.id === 'route-b'
                    ? 'url(#route-b-grad)'
                    : 'url(#route-c-grad)';

              return (
                <g
                  key={route.id}
                  onClick={() => onSelectRoute(route.id)}
                  className="cursor-pointer focus:outline-none"
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isSelected ? 14 : 7}
                    strokeOpacity={isSelected ? 0.38 : 0.16}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#route-glow)"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={gradientUrl}
                    strokeWidth={isSelected ? 8 : 4.5}
                    strokeOpacity={isSelected ? 0.98 : 0.72}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {isSelected && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeOpacity="0.75"
                      strokeDasharray="12 18"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}

            {/* Interactive Map Markers */}
            {markers
              .filter((marker) => visibleLayers[marker.layerKey])
              .map((marker) => {
                const isActive = selectedMarker?.id === marker.id;

                if (marker.type === 'unit') {
                  return (
                    <g
                      key={marker.id}
                      transform={`translate(${marker.x}, ${marker.y})`}
                      onClick={() => setSelectedMarker(marker)}
                      className="cursor-pointer focus:outline-none"
                    >
                      <circle
                        r={isActive ? 24 : 19}
                        fill="#10b981"
                        fillOpacity="0.35"
                      />
                      <circle
                        r="14"
                        fill="#0d9488"
                        stroke="#ccfbf1"
                        strokeWidth="2"
                      />
                      <path
                        d="M -4 -5 L 6 0 L -4 5 L -1.5 0 Z"
                        fill="#ffffff"
                      />
                    </g>
                  );
                }

                if (marker.type === 'blocked') {
                  return (
                    <g
                      key={marker.id}
                      transform={`translate(${marker.x}, ${marker.y})`}
                      onClick={() => setSelectedMarker(marker)}
                      className="cursor-pointer focus:outline-none"
                    >
                      <polygon
                        points="0,-20 19,14 -19,14"
                        fill="#2563eb"
                        stroke="#dbeafe"
                        strokeWidth="2"
                      />
                      <path
                        d="M 0 -8 L 0 3 M 0 8 L 0 9.5"
                        stroke="#ffffff"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                }

                const pinFill =
                  marker.type === 'fire' || marker.type === 'target'
                    ? '#e11d48'
                    : marker.type === 'safe'
                      ? '#10b981'
                      : '#2563eb';
                const pinRing =
                  marker.type === 'fire' || marker.type === 'target'
                    ? '#fecdd3'
                    : marker.type === 'safe'
                      ? '#a7f3d0'
                      : '#bfdbfe';

                return (
                  <g
                    key={marker.id}
                    transform={`translate(${marker.x}, ${marker.y}) scale(${
                      isActive ? 1.2 : 1
                    })`}
                    onClick={() => setSelectedMarker(marker)}
                    className="cursor-pointer transition-transform focus:outline-none"
                  >
                    <ellipse
                      cx="0"
                      cy="24"
                      rx="10"
                      ry="4"
                      fill="rgba(0,0,0,0.45)"
                    />
                    <path
                      d="M 0 22 C -12 8 -18 -2 -18 -11 A 18 18 0 1 1 18 -11 C 18 -2 12 8 0 22 Z"
                      fill={pinFill}
                      stroke={pinRing}
                      strokeWidth="2"
                    />
                    {marker.type === 'fire' && (
                      <path
                        d="M 1 -21 C 1 -21 8 -15 8 -9 A 7 7 0 1 1 -6 -9 C -6 -13 -3 -16 -1 -18 C -1 -15 1 -13 3 -12 C 2 -16 1 -21 1 -21 Z"
                        fill="#ffffff"
                      />
                    )}
                    {marker.type === 'safe' && (
                      <path
                        d="M 0 -20 C 5 -14 7 -10 7 -6 A 7 7 0 1 1 -7 -6 C -7 -10 -5 -14 0 -20 Z"
                        fill="#ffffff"
                      />
                    )}
                    {marker.type === 'target' && (
                      <g fill="none" stroke="#ffffff" strokeWidth="2.2">
                        <circle cx="0" cy="-11" r="8" />
                        <circle cx="0" cy="-11" r="3" fill="#ffffff" />
                      </g>
                    )}
                    {marker.type === 'command' && (
                      <path
                        d="M -7 -16 L 7 -16 L 7 -9 L 4 -5 L -4 -5 L -7 -9 Z"
                        fill="#ffffff"
                      />
                    )}
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Zoom Controls */}
        <div
          className="absolute top-3 right-3 flex flex-col gap-1 z-10"
          role="group"
          aria-label="Map zoom controls"
        >
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#24416b] bg-[#081526]/90 text-slate-200 hover:bg-[#102642] hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#24416b] bg-[#081526]/90 text-slate-200 hover:bg-[#102642] hover:text-white transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset View"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#24416b] bg-[#081526]/90 text-slate-200 hover:bg-[#102642] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Scale & Compass */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-3 rounded-md border border-[#24416b]/80 bg-[#081526]/90 px-2.5 py-1 text-[11px] font-mono text-slate-300"
        >
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-8 border-b border-x border-slate-300" />
            10 km
          </span>
          <span className="h-3 w-px bg-[#24416b]" />
          <span className="font-semibold text-blue-300">N ↑</span>
        </div>

        {/* Active Marker Popover */}
        {selectedMarker && (
          <div
            role="dialog"
            aria-label={selectedMarker.title}
            className="absolute bottom-3 left-3 z-20 max-w-[310px] rounded-lg border border-[#285085] bg-[#081526]/95 p-3.5 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedMarker.type === 'fire' && <Flame className="w-4 h-4 text-rose-400 shrink-0" />}
                {selectedMarker.type === 'safe' && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                {selectedMarker.type === 'unit' && <Truck className="w-4 h-4 text-cyan-400 shrink-0" />}
                {selectedMarker.type === 'blocked' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                {selectedMarker.type === 'command' && <Building2 className="w-4 h-4 text-blue-400 shrink-0" />}
                <h3 className="text-[13px] font-semibold text-white">
                  {selectedMarker.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMarker(null)}
                aria-label="Close"
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-[12px] text-slate-300">
              {selectedMarker.subtitle}
            </p>
            {selectedMarker.lat && selectedMarker.lon && (
              <p className="mt-2 text-[11px] font-mono text-cyan-400">
                Coords: {selectedMarker.lat.toFixed(4)}, {selectedMarker.lon.toFixed(4)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Map Legend Bar */}
      <div
        aria-label="Map Legend"
        className="mt-3 rounded-xl border border-[#1d3b66]/80 bg-[#091526]/95 px-4 py-3 shadow-[0_6px_22px_rgba(2,8,20,0.4)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {LEGEND_ITEMS.map((item) => {
            const active = visibleLayers[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleLayer(item.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 text-[12px] font-medium transition-opacity cursor-pointer whitespace-nowrap ${
                  active
                    ? 'text-slate-200 opacity-100'
                    : 'text-slate-500 opacity-50 line-through'
                }`}
              >
                <span
                  className={`h-3 w-4 rounded-[3px] ${item.swatchClass}`}
                  aria-hidden="true"
                />
                <span>{isAr ? item.labelAr : item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
