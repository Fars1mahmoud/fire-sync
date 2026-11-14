import React, { useState, useEffect, useRef } from 'react';
import { LocateFixed, X, Layers, Globe2, Radio, Compass, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FILTER_TABS, MAP_LEGEND_DOTS, REGIONAL_CENTERS } from './infrastructureData';
import { Facility, FilterTabId, LayerId } from './infrastructureTypes';
import satelliteTerrainUrl from '../../../assets/crops/amazon_satellite_terrain.jpg';

interface ExposureMapPanelProps {
  activeTab: FilterTabId;
  onSelectTab: (tabId: FilterTabId) => void;
  markers: Facility[];
  activeLayers: Record<LayerId, boolean>;
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string | null) => void;
  onToggleLayer: (layerId: LayerId) => void;
  onResetAll: () => void;
  region?: string;
  lang?: 'en' | 'ar';
}

export const ExposureMapPanel: React.FC<ExposureMapPanelProps> = ({
  activeTab,
  onSelectTab,
  markers,
  activeLayers,
  selectedFacilityId,
  onSelectFacility,
  onToggleLayer,
  onResetAll,
  region = 'brazil',
  lang = 'en',
}) => {
  const isAr = lang === 'ar';
  const [mapMode, setMapMode] = useState<'leaflet' | 'vector'>('leaflet');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);

  // Leaflet map refs
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  const selectedFacility = markers.find((m) => m.id === selectedFacilityId) ?? null;
  const regCenter = REGIONAL_CENTERS[region] || REGIONAL_CENTERS['brazil'];

  // Initialize and synchronize Leaflet real satellite map
  useEffect(() => {
    if (mapMode !== 'leaflet' || !leafletContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: [regCenter.lat, regCenter.lng],
        zoom: regCenter.defaultZoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Google Satellite Hybrid layer
      L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 19,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      // Active Fire Front buffer zone rings (5 km high threat, 15 km amber, 30 km yellow)
      L.circle([regCenter.lat, regCenter.lng], {
        radius: 5000,
        color: '#dc2626',
        weight: 1.5,
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        dashArray: '4, 4',
      }).addTo(map);

      L.circle([regCenter.lat, regCenter.lng], {
        radius: 15000,
        color: '#f59e0b',
        weight: 1.2,
        fillColor: '#f59e0b',
        fillOpacity: 0.08,
        dashArray: '6, 6',
      }).addTo(map);

      L.circle([regCenter.lat, regCenter.lng], {
        radius: 30000,
        color: '#38bdf8',
        weight: 1,
        fillColor: '#38bdf8',
        fillOpacity: 0.04,
        dashArray: '8, 8',
      }).addTo(map);

      // Active Fire Front center marker
      const fireIcon = L.divIcon({
        className: 'custom-fire-pulse-pin',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background: #dc2626; border: 2px solid #ffffff; box-shadow: 0 0 10px #ef4444;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([regCenter.lat, regCenter.lng], { icon: fireIcon })
        .bindPopup(`<strong>${isAr ? 'جبهة الحريق النشطة' : 'Active Flame Front'}</strong>`)
        .addTo(map);

      markerGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    if (map) {
      map.setView([regCenter.lat, regCenter.lng], regCenter.defaultZoom);
    }
  }, [mapMode, regCenter.lat, regCenter.lng, regCenter.defaultZoom, isAr]);

  // Update Leaflet markers when markers list or selection changes
  useEffect(() => {
    if (mapMode !== 'leaflet' || !leafletMapRef.current || !markerGroupRef.current) return;

    markerGroupRef.current.clearLayers();

    markers.forEach((fac) => {
      const isSelected = selectedFacilityId === fac.id;
      const isHighRisk = fac.risk === 'High';
      const color = fac.risk === 'High' ? '#dc2626' : fac.risk === 'Moderate' ? '#ea580c' : '#22c55e';

      const customIcon = L.divIcon({
        className: `custom-infra-pin-${fac.id}`,
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isHighRisk ? '<div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(220, 38, 38, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="width: ${isSelected ? '22px' : '18px'}; height: ${isSelected ? '22px' : '18px'}; border-radius: 9999px; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 12px ${color}; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 9999px; background: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon });
      marker.on('click', () => {
        onSelectFacility(selectedFacilityId === fac.id ? null : fac.id);
      });
      markerGroupRef.current?.addLayer(marker);

      if (isSelected) {
        leafletMapRef.current?.flyTo([fac.lat, fac.lng], 13, { duration: 0.8 });
      }
    });
  }, [mapMode, markers, selectedFacilityId, onSelectFacility]);

  // Vector pan & zoom handlers
  const handleResetView = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    onSelectFacility(null);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([regCenter.lat, regCenter.lng], regCenter.defaultZoom);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setDragOrigin({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin) return;
    const nextX = Math.max(-90, Math.min(90, e.clientX - dragOrigin.x));
    const nextY = Math.max(-60, Math.min(60, e.clientY - dragOrigin.y));
    setPanOffset({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => setDragOrigin(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (mapMode === 'leaflet') return; // Leaflet handles its own wheel
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoomScale((prev) => Math.max(1, Math.min(1.6, Number((prev + delta).toFixed(2)))));
  };

  const renderMarkerGlyph = (facility: Facility, isSelected: boolean) => {
    const selectionRing = isSelected
      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B1F16] scale-110 shadow-[0_0_15px_#ffffff]'
      : 'group-hover:scale-110';

    switch (facility.markerVisual) {
      case 'red-large':
        return (
          <span className={`relative flex items-center justify-center w-11 h-11 rounded-full bg-[#DC2626]/40 border border-[#F87171]/65 transition-transform duration-150 ${selectionRing}`}>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D9383A] shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7F1D1D]" />
            </span>
          </span>
        );
      case 'red-small':
        return (
          <span className={`relative flex items-center justify-center w-7 h-7 rounded-full bg-[#DC2626]/35 border border-[#F87171]/55 transition-transform duration-150 ${selectionRing}`}>
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#D9383A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7F1D1D]" />
            </span>
          </span>
        );
      case 'orange':
        return (
          <span className={`relative flex items-center justify-center w-7 h-7 rounded-full bg-[#F59E0B]/40 border border-[#FBBF24]/75 transition-transform duration-150 ${selectionRing}`}>
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#EA881B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FDE047]" />
            </span>
          </span>
        );
      case 'blue-yellow':
      default:
        return (
          <span className={`relative flex items-center justify-center w-7 h-7 rounded-full bg-[#1D63D8]/90 border border-[#60A5FA]/70 shadow-sm transition-transform duration-150 ${selectionRing}`}>
            <span className="w-3 h-3 rounded-full bg-[#FACC15]" />
          </span>
        );
    }
  };

  return (
    <section aria-label="Interactive Exposure Map" className="flex flex-col min-w-0">
      {/* Filter Tabs Row */}
      <div
        role="tablist"
        aria-label="Infrastructure category filter"
        className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3 select-none"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold text-center whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-md ${
                isActive
                  ? 'bg-[#0070f3] text-white border border-[#2D82F5] shadow-[0_0_12px_rgba(0,112,243,0.4)]'
                  : 'bg-[#0e223d] text-slate-300 border border-[#1b3d66] hover:bg-[#153457] hover:text-white'
              }`}
            >
              {isAr ? tab.labelAr : tab.label}
            </button>
          );
        })}
      </div>

      {/* Map Viewport Container */}
      <div
        data-testid="exposure-map-viewport"
        onPointerDown={mapMode === 'vector' ? handlePointerDown : undefined}
        onPointerMove={mapMode === 'vector' ? handlePointerMove : undefined}
        onPointerUp={mapMode === 'vector' ? handlePointerUp : undefined}
        onPointerLeave={mapMode === 'vector' ? handlePointerUp : undefined}
        onWheel={handleWheel}
        className="relative w-full h-[280px] sm:h-[310px] lg:h-[320px] rounded-2xl overflow-hidden border border-[#152a45] bg-[#071322] select-none shadow-2xl"
      >
        {/* MODE 1: LEAFLET REAL SATELLITE TILES */}
        <div
          ref={leafletContainerRef}
          className={`absolute inset-0 w-full h-full z-0 transition-opacity duration-300 ${
            mapMode === 'leaflet' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* MODE 2: TACTICAL VECTOR MAP */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            mapMode === 'vector' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Satellite Background Image */}
            <img
              src={satelliteTerrainUrl}
              alt="Satellite terrain map of infrastructure corridor"
              draggable={false}
              className="w-full h-full object-cover brightness-95 contrast-105"
            />

            {/* Vector Roads & Boundaries Overlay */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
              <path d="M 28 0 L 28 38 L 41 44 L 62 32 L 78 36 L 94 28" fill="none" stroke="rgba(226, 232, 240, 0.32)" strokeWidth="0.35" />
              <path d="M 62 0 L 62 32 L 58 64 L 44 100" fill="none" stroke="rgba(226, 232, 240, 0.25)" strokeWidth="0.3" />
              <path d="M 88 0 L 76 48 L 69 100" fill="none" stroke="rgba(226, 232, 240, 0.22)" strokeWidth="0.3" />

              {(activeLayers.roads || activeTab === 'roads') && (
                <>
                  <path d="M 18 33 Q 24 47 31 52 T 40 74 Q 47 64 52 53 T 64 46" fill="none" stroke="#E06D1B" strokeWidth="0.55" strokeOpacity="0.88" />
                  <path d="M 32 52 Q 44 48 53 51 T 64 44 L 86 58 L 95 84" fill="none" stroke="#EAB308" strokeWidth="0.5" strokeOpacity="0.85" />
                  <path d="M 59 31 Q 56 41 51 52 Q 46 63 40 74" fill="none" stroke="#FACC15" strokeWidth="0.48" strokeOpacity="0.82" />
                </>
              )}
            </svg>

            {/* Tactical Vector Markers */}
            {markers.map((facility) => {
              const isSelected = selectedFacilityId === facility.id;
              return (
                <button
                  key={facility.id}
                  type="button"
                  aria-label={`${facility.name} (${facility.risk} risk, ${facility.distanceKm.toFixed(1)} km)`}
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFacility(isSelected ? null : facility.id);
                  }}
                  style={{
                    left: `${facility.coords.x}%`,
                    top: `${facility.coords.y}%`,
                  }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer focus-visible:outline-none"
                >
                  {renderMarkerGlyph(facility, isSelected)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top-Right Map Controls Bar */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[#091524]/90 backdrop-blur-md border border-[#1b385c] rounded-xl p-1 shadow-xl">
          {/* Map Mode Switcher (Leaflet vs Vector) */}
          <button
            type="button"
            onClick={() => setMapMode(mapMode === 'leaflet' ? 'vector' : 'leaflet')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e223d] hover:bg-[#153457] text-cyan-300 text-xs font-semibold cursor-pointer transition-colors border border-[#1b3d66]"
            title={isAr ? 'التبديل بين قمر صناعي حقيقي وخريطة تكتيكية' : 'Switch between Real Satellite and Tactical Vector'}
          >
            {mapMode === 'leaflet' ? <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> : <Layers className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{mapMode === 'leaflet' ? (isAr ? 'قمر صناعي حقيقي' : 'Live Satellite') : (isAr ? 'خريطة المتجهات' : 'Tactical Vector')}</span>
          </button>

          {/* Recenter Button */}
          <button
            type="button"
            onClick={handleResetView}
            aria-label="Center map view"
            title={isAr ? 'إعادة ضبط المركز' : 'Center map view'}
            className="w-7 h-7 rounded-lg bg-[#0e223d] hover:bg-[#153457] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1b3d66]"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected Facility Inspector Card Popover */}
        {selectedFacility && (
          <div
            role="status"
            aria-live="polite"
            className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-[320px] z-20 bg-[#091524]/95 backdrop-blur-md border border-[#1b3d66] rounded-xl p-3 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold text-white leading-tight">
                  {isAr && selectedFacility.nameAr ? selectedFacility.nameAr : selectedFacility.name}
                </p>
                <p className="text-[11px] font-mono text-cyan-300 mt-0.5 tabular-nums flex items-center gap-2">
                  <span>{selectedFacility.latLng}</span>
                  <span className="font-bold text-orange-400">⚡ {selectedFacility.distanceKm.toFixed(1)} km {isAr ? 'لخط النار' : 'to Fire'}</span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close facility details"
                onClick={() => onSelectFacility(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11.5px] text-slate-300 mt-2 leading-relaxed">
              {isAr && selectedFacility.detailsAr ? selectedFacility.detailsAr : selectedFacility.details}
            </p>
            {selectedFacility.action && (
              <div className="mt-2 pt-2 border-t border-[#142d4f] flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-semibold">{isAr ? 'الإجراء الوقائي:' : 'Action:'}</span>
                <span className="text-slate-200 text-right truncate max-w-[180px]">{selectedFacility.action}</span>
              </div>
            )}
          </div>
        )}

        {/* Empty Map State Overlay */}
        {markers.length === 0 && (
          <div className="absolute inset-0 bg-[#091322]/85 flex flex-col items-center justify-center p-4 text-center z-10">
            <p className="text-sm font-semibold text-slate-200 mb-2">
              {isAr ? 'لا توجد منشآت مطابقة للطبقات المحددة.' : 'No infrastructure layers visible for this selection.'}
            </p>
            <button
              type="button"
              onClick={onResetAll}
              className="px-3.5 py-1.5 rounded-xl bg-[#0070f3] hover:bg-blue-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              {isAr ? 'استعادة كل الطبقات' : 'Restore All Layers'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Legend Dots matching screenshot */}
      <div className="flex items-center gap-2.5 mt-2.5 px-1 select-none" aria-label="Map layer legend">
        {MAP_LEGEND_DOTS.map((dot) => {
          const isLayerEnabled = activeLayers[dot.layerId];
          return (
            <button
              key={dot.id}
              type="button"
              onClick={() => onToggleLayer(dot.layerId)}
              aria-label={`Toggle ${dot.label}`}
              aria-pressed={isLayerEnabled}
              title={`${isAr ? dot.labelAr : dot.label} (${isLayerEnabled ? (isAr ? 'مفعّل' : 'visible') : (isAr ? 'مخفي' : 'hidden')})`}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isLayerEnabled ? 'opacity-100 scale-100 ring-2 ring-white/20' : 'opacity-30 scale-75'
              }`}
              style={{ backgroundColor: dot.color }}
            />
          );
        })}
      </div>
    </section>
  );
};
