import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  X, 
  Flame, 
  Crosshair,
  ExternalLink,
  ShieldCheck,
  Radio,
  Compass,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import { FireReport, NetworkNode, NetworkEdge, ReportFilter } from './groundTruthTypes';

interface GroundTruthMapViewProps {
  reports: FireReport[];
  selectedReport: FireReport | null;
  onSelectReport: (report: FireReport | null) => void;
  onOpenPhotoModal?: (report: FireReport) => void;
  activeFilter: ReportFilter;
  onFilterChange: (filter: ReportFilter) => void;
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  isPickingLocation?: boolean;
  onLocationPicked?: (coordsText: string, mapCoords: { x: number; y: number }, gps: { lat: number; lng: number }) => void;
  language: 'en' | 'ar';
  counts: { all: number; pending: number; confirmed: number; false: number };
  centerCoords?: { lat: number; lng: number };
  defaultZoom?: number;
}

type TileProvider = 'google' | 'esri' | 'dark';

export const GroundTruthMapView: React.FC<GroundTruthMapViewProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  onOpenPhotoModal,
  activeFilter,
  onFilterChange,
  networkNodes,
  networkEdges,
  isPickingLocation = false,
  onLocationPicked,
  language,
  counts,
  centerCoords = { lat: -6.5000, lng: -58.5000 },
  defaultZoom = 7,
}) => {
  const isAr = language === 'ar';
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);

  const [tileProvider, setTileProvider] = useState<TileProvider>('google');
  const [showNetworkLines, setShowNetworkLines] = useState<boolean>(true);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [centerCoords.lat, centerCoords.lng],
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    mapInstanceRef.current = map;

    // Create Layers
    markersLayerRef.current = L.layerGroup().addTo(map);
    polylinesLayerRef.current = L.layerGroup().addTo(map);

    // Initial Tile Layer
    updateTileLayer(map, tileProvider);

    // Handle Map Clicks (for location picking or unselecting)
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isPickingLocation && onLocationPicked) {
        const { lat, lng } = e.latlng;
        const latDeg = Math.floor(Math.abs(lat));
        const latMin = ((Math.abs(lat) - latDeg) * 60).toFixed(1);
        const lngDeg = Math.floor(Math.abs(lng));
        const lngMin = Math.abs(lng).toFixed(4);
        const formatted = `${latDeg * 10} - ${lat.toFixed(4)} ${lngDeg * 5} - ${lng.toFixed(4)}`;

        // Add or update temporary crosshair marker on map
        if (pickedMarkerRef.current) {
          pickedMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const crosshairIcon = L.divIcon({
            className: 'custom-crosshair-icon',
            html: `
              <div style="position: relative; width: 32px; height: 32px; transform: translate(-50%, -50%);">
                <div style="position: absolute; inset: 0; border: 2px solid #06b6d4; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; inset: 4px; border: 2px solid #38bdf8; border-radius: 50%; background: rgba(6,182,212,0.3);"></div>
                <div style="position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: #38bdf8;"></div>
                <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: #38bdf8;"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          pickedMarkerRef.current = L.marker([lat, lng], { icon: crosshairIcon }).addTo(map);
        }

        onLocationPicked(formatted, { x: 50, y: 50 }, { lat, lng });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when sector changes
  useEffect(() => {
    if (mapInstanceRef.current && centerCoords) {
      mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], defaultZoom, {
        duration: 1.2,
      });
    }
  }, [centerCoords.lat, centerCoords.lng, defaultZoom]);

  // Update Tile Layer helper
  const updateTileLayer = (map: L.Map, provider: TileProvider) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    let options: L.TileLayerOptions = {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    };

    if (provider === 'esri') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      options = { maxZoom: 19 };
    } else if (provider === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      options = { maxZoom: 19, subdomains: 'abcd' };
    }

    const newLayer = L.tileLayer(url, options).addTo(map);
    tileLayerRef.current = newLayer;
  };

  // Change Tile Provider
  const handleChangeTileProvider = (provider: TileProvider) => {
    setTileProvider(provider);
    setIsLayerMenuOpen(false);
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, provider);
    }
  };

  // Color styles generator
  const getPinColorStyles = (color: string) => {
    switch (color) {
      case 'red':
        return { fill: '#ef4444', stroke: '#991b1b', dot: '#fee2e2' };
      case 'orange':
        return { fill: '#f97316', stroke: '#c2410c', dot: '#ffedd5' };
      case 'yellow':
        return { fill: '#eab308', stroke: '#a16207', dot: '#fef9c3' };
      case 'blue':
        return { fill: '#3b82f6', stroke: '#1d4ed8', dot: '#ef4444' };
      case 'green':
      default:
        return { fill: '#10b981', stroke: '#047857', dot: '#ecfdf5' };
    }
  };

  // Render Markers and Network Lines on the Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !polylinesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    polylinesLayerRef.current.clearLayers();

    // Filter reports according to activeFilter
    const filteredReports = reports.filter((r) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'confirmed') return r.type === 'confirmed' || r.status === 'confirmed';
      if (activeFilter === 'false') return r.type === 'false' || r.status === 'false';
      if (activeFilter === 'pending') return r.status === 'pending' || r.type === 'review';
      return true;
    });

    // Render Markers for each report
    filteredReports.forEach((rep) => {
      const isSelected = selectedReport?.id === rep.id;
      const color = rep.type === 'confirmed' ? 'red' : rep.type === 'false' ? 'yellow' : 'orange';
      const styles = getPinColorStyles(color);

      const html = `
        <div style="position: relative; cursor: pointer; transform: translate(-50%, -100%); transition: transform 0.2s;" class="tactical-marker-pin ${isSelected ? 'scale-125' : ''}">
          ${(color === 'red' || isSelected) ? `
            <div style="position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 34px; height: 34px; border-radius: 50%; border: 2px solid ${isSelected ? '#38bdf8' : '#ef4444'}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
          ` : ''}
          <svg width="30" height="38" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.85));">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.5 12 32 12 32C12 32 24 20.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="${styles.fill}" stroke="${isSelected ? '#38bdf8' : styles.stroke}" stroke-width="${isSelected ? '2' : '1.3'}" />
            <circle cx="12" cy="11" r="4.5" fill="${styles.dot}" />
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-report-pin',
        html,
        iconSize: [30, 38],
        iconAnchor: [15, 38],
      });

      const marker = L.marker([rep.coordsGps.lat, rep.coordsGps.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', () => {
        onSelectReport(rep);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Render Network Sensor Nodes
    networkNodes.forEach((node) => {
      // If node already has a report, it's rendered above
      if (node.reportId && reports.some((r) => r.id === node.reportId)) return;

      const styles = getPinColorStyles(node.color);
      const isSelected = selectedReport?.mapPosition.x === node.x && selectedReport?.mapPosition.y === node.y;

      const html = `
        <div style="position: relative; cursor: pointer; transform: translate(-50%, -100%);">
          ${node.color === 'blue' ? `
            <div style="position: absolute; top: -2px; left: 50%; transform: translateX(-50%); width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #38bdf8; animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
          ` : ''}
          <svg width="26" height="34" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.8));">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.5 12 32 12 32C12 32 24 20.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="${styles.fill}" stroke="${styles.stroke}" stroke-width="1.3" />
            <circle cx="12" cy="11" r="4.5" fill="${styles.dot}" />
          </svg>
        </div>
      `;

      const nodeIcon = L.divIcon({
        className: 'custom-node-pin',
        html,
        iconSize: [26, 34],
        iconAnchor: [13, 34],
      });

      const marker = L.marker([node.lat, node.lng], { icon: nodeIcon });
      markersLayerRef.current?.addLayer(marker);
    });

    // Render Sensor Network Polylines
    if (showNetworkLines) {
      networkEdges.forEach((edge) => {
        const fromNode = networkNodes.find((n) => n.id === edge.from);
        const toNode = networkNodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return;

        const line = L.polyline(
          [
            [fromNode.lat, fromNode.lng],
            [toNode.lat, toNode.lng],
          ],
          {
            color: edge.color,
            weight: edge.width || 1.6,
            opacity: 0.85,
            dashArray: edge.dashed ? '6, 6' : undefined,
            lineCap: 'round',
          }
        );

        polylinesLayerRef.current?.addLayer(line);
      });
    }
  }, [reports, activeFilter, networkNodes, networkEdges, selectedReport, showNetworkLines]);

  // When selectedReport changes, fly map smoothly to its GPS coordinates!
  useEffect(() => {
    if (mapInstanceRef.current && selectedReport && selectedReport.coordsGps) {
      mapInstanceRef.current.flyTo(
        [selectedReport.coordsGps.lat, selectedReport.coordsGps.lng],
        13,
        {
          duration: 1.2,
          easeLinearity: 0.25,
        }
      );
    }
  }, [selectedReport?.id]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCenter = () => {
    if (mapInstanceRef.current && centerCoords) {
      mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], defaultZoom, {
        duration: 1.0,
      });
    }
  };

  return (
    <section aria-label="Satellite Map View" className="flex-1 flex flex-col min-w-0 select-none">
      {/* Filter Tabs Bar (All Reports, Pending, Confirmed, False) */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-[#0070f3] text-white shadow-[0_2px_12px_rgba(0,112,243,0.35)]'
              : 'bg-[#0b1828] text-slate-300 hover:text-white border border-[#172c47]'
          }`}
        >
          {isAr ? 'جميع البلاغات' : 'All Reports'} ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'pending'
              ? 'bg-[#0070f3] text-white shadow-[0_2px_12px_rgba(0,112,243,0.35)]'
              : 'bg-[#0b1828] text-slate-300 hover:text-white border border-[#172c47]'
          }`}
        >
          {isAr ? 'قيد المراجعة' : 'Pending'} ({counts.pending})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('confirmed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'confirmed'
              ? 'bg-[#0070f3] text-white shadow-[0_2px_12px_rgba(0,112,243,0.35)]'
              : 'bg-[#0b1828] text-slate-300 hover:text-white border border-[#172c47]'
          }`}
        >
          {isAr ? 'مؤكدة' : 'Confirmed'} ({counts.confirmed})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('false')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'false'
              ? 'bg-[#0070f3] text-white shadow-[0_2px_12px_rgba(0,112,243,0.35)]'
              : 'bg-[#0b1828] text-slate-300 hover:text-white border border-[#172c47]'
          }`}
        >
          {isAr ? 'إنذارات خاطئة' : 'False'} ({counts.false})
        </button>

        {isPickingLocation && (
          <div className="ml-auto px-3 py-1.5 bg-cyan-950/80 border border-cyan-500 rounded-lg text-cyan-300 text-xs font-mono flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.35)]">
            <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{isAr ? 'انقر فوق الخريطة لتثبيت دبوس الإحداثيات' : 'Click on map to drop GPS pin'}</span>
          </div>
        )}
      </div>

      {/* Main Real Satellite Map Viewport Container */}
      <div 
        className={`relative flex-1 min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] w-full rounded-2xl overflow-hidden border border-[#152a45] shadow-2xl group ${
          isPickingLocation ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Real Leaflet Map DOM Element */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Ambient Dark Cockpit Vignette Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060f1b]/70 via-transparent to-[#060f1b]/40 pointer-events-none z-10" />

        {/* Active Satellite Provider Badge */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="px-2.5 py-1 rounded-xl bg-[#081524]/85 backdrop-blur-md border border-[#1a3556] text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-md">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>
              {tileProvider === 'google' ? 'Google Satellite Hybrid' : tileProvider === 'esri' ? 'Esri World Imagery' : 'CartoDB Dark Matter'}
            </span>
          </div>
        </div>

        {/* Floating Detail Card on Map (Replicating exact popup card from reference!) */}
        {selectedReport && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-72 sm:w-80 bg-[#0d1a2d]/95 backdrop-blur-xl border border-[#1f385c] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 select-none"
          >
            {/* Top Thumbnail Image with FRP badge and Click to Enlarge */}
            <div 
              onClick={() => onOpenPhotoModal?.(selectedReport)}
              className="relative h-44 w-full overflow-hidden bg-black/50 cursor-pointer group/thumb"
              title={isAr ? 'انقر لتكبير الصورة وعرض التحليلات' : 'Click to enlarge photo & telemetry'}
            >
              <img
                src={selectedReport.imageUrl || '/assets/ground-truth/wildfire_blaze_1793981574666.jpg'}
                alt={selectedReport.title}
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
              />

              {/* Close Card Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectReport(null);
                }}
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 z-10"
                aria-label="Close detail card"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-medium">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? 'تكبير وعرض الصور ↗' : 'View Full Photos ↗'}</span>
              </div>

              {/* FRP Overlay Badge matching reference */}
              {selectedReport.frpMw && (
                <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/80 border border-orange-500/50 text-[11px] font-mono font-bold text-orange-400 flex items-center gap-1 shadow-md">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{selectedReport.frpMw} MW FRP</span>
                </div>
              )}
            </div>

            {/* Card Content Body */}
            <div className="p-4 sm:p-5">
              <h3 className="text-white text-base sm:text-lg font-bold tracking-tight">
                {isAr && selectedReport.titleAr ? selectedReport.titleAr : selectedReport.title}
              </h3>

              {/* Coordinates display matching screenshot: 30 - 3.0216 327 - 65.4595 */}
              <div className="mt-1 font-mono text-xs sm:text-sm text-slate-300 tracking-wide font-normal">
                {selectedReport.coordinates}
              </div>

              {/* Status Badge: Emerald green button/pill with MapPin icon and "Confirmed Fire" text */}
              <div className="mt-3.5 flex items-center justify-between">
                <div 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                    selectedReport.type === 'confirmed'
                      ? 'bg-[#108966] text-white shadow-[0_2px_8px_rgba(16,137,102,0.4)]'
                      : selectedReport.type === 'false'
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 fill-current" />
                  <span>{isAr && selectedReport.titleAr ? selectedReport.titleAr : selectedReport.title}</span>
                </div>

                {selectedReport.confidence && (
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                    {selectedReport.confidence}% {isAr ? 'ثقة' : 'Conf'}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedReport.description && (
                <p className="mt-2.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {isAr && selectedReport.descriptionAr ? selectedReport.descriptionAr : selectedReport.description}
                </p>
              )}

              {/* Card Footer Actions */}
              <div className="mt-3.5 pt-3 border-t border-[#1a3352] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPhotoModal?.(selectedReport)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr ? 'عرض الصور' : 'View Photos'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (mapInstanceRef.current && selectedReport.coordsGps) {
                      mapInstanceRef.current.flyTo(
                        [selectedReport.coordsGps.lat, selectedReport.coordsGps.lng],
                        15,
                        { duration: 1.0 }
                      );
                    }
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-[#11243d] hover:bg-[#1a365c] border border-[#21426c] text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title={isAr ? 'تكبير موقع الحريق' : 'Zoom into hotspot'}
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr ? 'تركيز' : 'Focus'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real Map Controls (Bottom-Right overlay) */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-[#091524]/90 backdrop-blur-md border border-[#1b3454] rounded-xl p-1 shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#12243d] transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#12243d] transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetCenter}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#12243d] transition-colors cursor-pointer"
            title={isAr ? 'إعادة ضبط المركز' : 'Recenter map'}
            aria-label="Recenter map"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowNetworkLines(!showNetworkLines)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showNetworkLines ? 'text-cyan-400 bg-[#0e223b]' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Sensor Grid Lines"
            aria-label="Toggle Sensor Grid Lines"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isLayerMenuOpen ? 'text-blue-400 bg-[#0e223b]' : 'text-slate-400 hover:text-white'
            }`}
            title="Switch Satellite Imagery"
            aria-label="Switch Satellite Imagery"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>

        {/* Satellite Layer Switcher Dropdown */}
        {isLayerMenuOpen && (
          <div className="absolute bottom-16 right-16 z-30 bg-[#091524] border border-[#1b3454] rounded-2xl p-2 shadow-2xl space-y-1 w-48 text-xs animate-in fade-in">
            <span className="text-[10px] text-slate-400 px-2 py-1 block font-mono">
              {isAr ? 'مزود صور الأقمار الصناعية:' : 'Satellite Basemap:'}
            </span>
            <button
              type="button"
              onClick={() => handleChangeTileProvider('google')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                tileProvider === 'google' ? 'bg-[#0070f3] text-white font-semibold' : 'text-slate-300 hover:bg-[#12243d]'
              }`}
            >
              <span>Google Satellite Hybrid</span>
              {tileProvider === 'google' && <span>✓</span>}
            </button>
            <button
              type="button"
              onClick={() => handleChangeTileProvider('esri')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                tileProvider === 'esri' ? 'bg-[#0070f3] text-white font-semibold' : 'text-slate-300 hover:bg-[#12243d]'
              }`}
            >
              <span>Esri World Imagery</span>
              {tileProvider === 'esri' && <span>✓</span>}
            </button>
            <button
              type="button"
              onClick={() => handleChangeTileProvider('dark')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                tileProvider === 'dark' ? 'bg-[#0070f3] text-white font-semibold' : 'text-slate-300 hover:bg-[#12243d]'
              }`}
            >
              <span>CartoDB Dark Tactical</span>
              {tileProvider === 'dark' && <span>✓</span>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
