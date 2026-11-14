import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Plus,
  Minus,
  Maximize2,
  Crosshair,
  Search,
  Layers,
  Flame,
  Info,
  Globe,
  Satellite,
  Compass,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Hotspot, RiskLevel } from './types';
import { COUNTRY_BOUNDARIES } from './countryBoundaries';

export const COUNTRY_PRESETS: Record<
  string,
  {
    code: string;
    center: [number, number];
    zoom: number;
    nameEn: string;
    nameAr: string;
    flag: string;
    satellites: string;
    descriptionEn: string;
    descriptionAr: string;
    bounds: [[number, number], [number, number]];
  }
> = {
  BRA: {
    code: 'BRA',
    center: [-14.235, -51.925],
    zoom: 4,
    nameEn: 'Brazil',
    nameAr: 'البرازيل',
    flag: '🇧🇷',
    satellites: 'GOES-16 & VIIRS NOAA-20',
    descriptionEn: 'Amazon Basin, Cerrado, Pantanal',
    descriptionAr: 'حوض الأمازون وسيرادو وبانتانال',
    bounds: [[-33.75, -73.99], [5.27, -34.79]],
  },
  CAN: {
    code: 'CAN',
    center: [56.13, -106.346],
    zoom: 4,
    nameEn: 'Canada',
    nameAr: 'كندا',
    flag: '🇨🇦',
    satellites: 'VIIRS-N20 & Terra/Aqua MODIS',
    descriptionEn: 'Peace River Boreal Sector, Alberta, Quebec',
    descriptionAr: 'الغابات الشمالية، نهر بيس، ألبرتا',
    bounds: [[41.68, -141.0], [83.11, -52.62]],
  },
  EGY: {
    code: 'EGY',
    center: [26.82, 30.80],
    zoom: 6,
    nameEn: 'Egypt',
    nameAr: 'مصر',
    flag: '🇪🇬',
    satellites: 'VIIRS JPSS-1 & Sentinel-3 SLSTR',
    descriptionEn: 'North Coast, Nile Delta, Sinai, Oases',
    descriptionAr: 'الساحل الشمالي، دلتا النيل، سيناء، الواحات',
    bounds: [[22.0, 25.0], [31.8, 36.8]],
  },
  ALL: {
    code: 'ALL',
    center: [20.0, 0.0],
    zoom: 2,
    nameEn: 'Global',
    nameAr: 'العالم',
    flag: '🌐',
    satellites: 'Global NASA FIRMS Constellation',
    descriptionEn: 'Global Earth Observation Network',
    descriptionAr: 'شبكة الرصد الفضائي العالمية',
    bounds: [[-60.0, -170.0], [75.0, 170.0]],
  },
};

interface MapCenterProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  activeLevelFilter: RiskLevel | null;
  lang: 'en' | 'ar';
  country?: string;
  onSelectCountry?: (country: string) => void;
}

export const MapCenter: React.FC<MapCenterProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  activeLevelFilter,
  lang,
  country = 'BRA',
  onSelectCountry,
}) => {
  // Default map layer mode: 'thermal' (displays full thermal heat surface with glowing golden borders)
  const [mapMode, setMapMode] = useState<'thermal' | 'optical' | 'tactical'>('thermal');
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // Normalized active country
  const activeCountryCode = (country || 'BRA').toUpperCase();
  const currentPreset = COUNTRY_PRESETS[activeCountryCode] || COUNTRY_PRESETS['BRA'];

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const borderLayerRef = useRef<L.GeoJSON | null>(null);
  const thermalLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter hotspots if a risk level is actively selected
  const filteredHotspots = activeLevelFilter
    ? hotspots.filter((h) => h.level === activeLevelFilter)
    : hotspots;

  // Active or top hotspot for tooltip
  const activeSpot = selectedHotspot || filteredHotspots[0] || hotspots[0];

  // 1. Initialize 100% Interactive Leaflet GIS Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Create Leaflet Map with full panning, scrolling, and dragging enabled
      const map = L.map(mapContainerRef.current, {
        center: currentPreset.center,
        zoom: currentPreset.zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      });

      // Custom Panes for Layers separation
      // Pane for Thermal Heat Surface (blurred and blended like continuous thermal imagery)
      if (!map.getPane('thermalPane')) {
        const thermalPane = map.createPane('thermalPane');
        thermalPane.style.zIndex = '350';
        thermalPane.style.filter = 'blur(18px)';
        thermalPane.style.mixBlendMode = 'screen';
        thermalPane.style.pointerEvents = 'none';
      }

      // Pane for Glowing Country Border
      if (!map.getPane('borderPane')) {
        const borderPane = map.createPane('borderPane');
        borderPane.style.zIndex = '400';
        borderPane.style.pointerEvents = 'none';
      }

      // Pane for Target Pins
      if (!map.getPane('markersPane')) {
        const markersPane = map.createPane('markersPane');
        markersPane.style.zIndex = '500';
      }

      // High-resolution Google Satellite Hybrid Basemap (roads, terrain, natural features)
      const satelliteUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      const tile = L.tileLayer(satelliteUrl, {
        maxZoom: 19,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      tileLayerRef.current = tile;

      const thermalLayer = L.layerGroup([], { pane: 'thermalPane' }).addTo(map);
      thermalLayerRef.current = thermalLayer;

      const markersLayer = L.layerGroup([], { pane: 'markersPane' }).addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
      setIsMapLoaded(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        thermalLayerRef.current = null;
        borderLayerRef.current = null;
        tileLayerRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []);

  // 2. FlyTo when active country changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const targetPreset = COUNTRY_PRESETS[activeCountryCode] || COUNTRY_PRESETS['BRA'];
    mapInstanceRef.current.flyTo(targetPreset.center, targetPreset.zoom, {
      duration: 1.4,
      easeLinearity: 0.25,
    });
  }, [activeCountryCode]);

  // 3. Render Glowing Golden Country Border (GeoJSON)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old border
    if (borderLayerRef.current) {
      map.removeLayer(borderLayerRef.current);
      borderLayerRef.current = null;
    }

    const boundaryGeoJson = COUNTRY_BOUNDARIES[activeCountryCode];
    if (boundaryGeoJson) {
      const border = L.geoJSON(boundaryGeoJson, {
        pane: 'borderPane',
        style: {
          color: '#facc15', // Bright golden yellow
          weight: 3.5,
          opacity: 0.95,
          fillColor: mapMode === 'thermal' ? '#f59e0b' : '#38bdf8',
          fillOpacity: mapMode === 'thermal' ? 0.08 : 0.02,
          className: 'glowing-golden-border',
        },
      });

      border.addTo(map);
      borderLayerRef.current = border;
    }
  }, [activeCountryCode, mapMode, isMapLoaded]);

  // 4. Render Organic Thermal Heat Risk Surface (Continuous Gradient)
  useEffect(() => {
    if (!mapInstanceRef.current || !thermalLayerRef.current) return;
    const thermalLayer = thermalLayerRef.current;
    thermalLayer.clearLayers();

    if (mapMode === 'optical') return; // Optical mode shows natural satellite only

    // Render multi-level thermal heat gradient fields around active detections
    filteredHotspots.forEach((spot) => {
      let lat = spot.latitude;
      let lng = spot.longitude;
      if (lat === undefined || lng === undefined) {
        const [[swLat, swLng], [neLat, neLng]] = currentPreset.bounds;
        lat = neLat - (spot.yPercent / 100) * (neLat - swLat);
        lng = swLng + (spot.xPercent / 100) * (neLng - swLng);
      }

      const isCritical = spot.level === 'critical';
      const isHigh = spot.level === 'high';
      const isModerate = spot.level === 'moderate';

      // Base radius scaled to country size
      const isCanada = activeCountryCode === 'CAN';
      const isEgypt = activeCountryCode === 'EGY';
      const multiplier = isCanada ? 1.6 : isEgypt ? 0.75 : 1.0;

      const rCore = (isCritical ? 75000 : isHigh ? 52000 : 35000) * multiplier;
      const rOrange = (isCritical ? 150000 : isHigh ? 105000 : 70000) * multiplier;
      const rYellow = (isCritical ? 240000 : isHigh ? 170000 : 115000) * multiplier;
      const rGreen = (isCritical ? 340000 : isHigh ? 240000 : 160000) * multiplier;

      // Tier 1: Outer Vegetative Buffer (Lime Green)
      L.circle([lat, lng], {
        pane: 'thermalPane',
        radius: rGreen,
        color: 'transparent',
        fillColor: '#10b981',
        fillOpacity: mapMode === 'thermal' ? 0.35 : 0.18,
      }).addTo(thermalLayer);

      // Tier 2: Moderate Danger Aura (Golden Yellow)
      L.circle([lat, lng], {
        pane: 'thermalPane',
        radius: rYellow,
        color: 'transparent',
        fillColor: '#facc15',
        fillOpacity: mapMode === 'thermal' ? 0.5 : 0.25,
      }).addTo(thermalLayer);

      // Tier 3: High Risk Radiation (Fiery Orange)
      L.circle([lat, lng], {
        pane: 'thermalPane',
        radius: rOrange,
        color: 'transparent',
        fillColor: '#f97316',
        fillOpacity: mapMode === 'thermal' ? 0.65 : 0.35,
      }).addTo(thermalLayer);

      // Tier 4: Extreme Danger Core (Crimson Red)
      L.circle([lat, lng], {
        pane: 'thermalPane',
        radius: rCore,
        color: 'transparent',
        fillColor: '#ef233c',
        fillOpacity: mapMode === 'thermal' ? 0.85 : 0.55,
      }).addTo(thermalLayer);

      // White-Hot Intense Epicenter for Critical Hotspots
      if (isCritical) {
        L.circle([lat, lng], {
          pane: 'thermalPane',
          radius: rCore * 0.35,
          color: 'transparent',
          fillColor: '#ffffff',
          fillOpacity: 0.9,
        }).addTo(thermalLayer);
      }
    });
  }, [filteredHotspots, activeCountryCode, mapMode, isMapLoaded, currentPreset]);

  // 5. Render Interactive Pulsing Target Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    filteredHotspots.forEach((spot) => {
      let lat = spot.latitude;
      let lng = spot.longitude;
      if (lat === undefined || lng === undefined) {
        const [[swLat, swLng], [neLat, neLng]] = currentPreset.bounds;
        lat = neLat - (spot.yPercent / 100) * (neLat - swLat);
        lng = swLng + (spot.xPercent / 100) * (neLng - swLng);
      }

      const isSelected = selectedHotspot?.id === spot.id;
      const isCritical = spot.level === 'critical';
      const isHigh = spot.level === 'high';

      const pulseColor = isCritical ? '#ef233c' : isHigh ? '#f77f00' : '#ffd166';
      const ringShadow = isCritical
        ? '0 0 16px #ef233c, 0 0 30px rgba(239,35,60,0.6)'
        : isHigh
        ? '0 0 12px #f77f00, 0 0 20px rgba(247,127,0,0.5)'
        : '0 0 8px #ffd166';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
          <!-- Outer Pulsing Ping Ring -->
          <span class="absolute inset-1.5 rounded-full animate-ping opacity-80" style="background-color: ${pulseColor};"></span>
          
          <!-- Outer Soft Glow Halo -->
          <span class="absolute inset-0 rounded-full opacity-35" style="background-color: ${pulseColor}; filter: blur(3px);"></span>
          
          <!-- Concentric Pin Head matching reference screenshot -->
          <div class="relative rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-125" style="
            width: ${isSelected ? '32px' : '22px'};
            height: ${isSelected ? '32px' : '22px'};
            background: #ffffff;
            border: ${isSelected ? '3px' : '2px'} solid ${pulseColor};
            box-shadow: ${ringShadow};
          ">
            ${
              isSelected
                ? `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${pulseColor}; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
                   </div>`
                : `<div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${pulseColor};"></div>`
            }
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-fire-marker-container',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        pane: 'markersPane',
      });

      marker.on('click', () => {
        onSelectHotspot(spot);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.6 });
        }
      });

      // Interactive hover tooltip
      marker.bindTooltip(
        `
        <div style="background: rgba(3,13,26,0.95); border: 1px solid #1e3a5f; border-radius: 8px; padding: 6px 10px; color: #fff; font-family: sans-serif; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
          <div style="font-weight: bold; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${pulseColor};"></span>
            <span>${spot.name}</span>
          </div>
          <div style="color: #94a3b8; font-size: 10px; font-family: monospace;">
            <span style="color: #f87171; font-weight: bold;">${spot.riskScore}% Risk</span> • 
            <span style="color: #38bdf8;">${spot.temperature}</span>
            ${spot.frp ? ` • <span style="color: #fbbf24;">${spot.frp} MW</span>` : ''}
          </div>
        </div>
        `,
        { direction: 'top', offset: [0, -18], opacity: 1 }
      );

      marker.addTo(markersLayer);
    });
  }, [filteredHotspots, selectedHotspot, currentPreset, isMapLoaded]);

  // Zoom and Pan Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(currentPreset.center, currentPreset.zoom, { duration: 1.2 });
    }
  };

  const handleCountrySwitch = (countryCode: string) => {
    if (onSelectCountry) {
      onSelectCountry(countryCode);
    }
    if (mapInstanceRef.current) {
      const targetPreset = COUNTRY_PRESETS[countryCode] || COUNTRY_PRESETS['BRA'];
      mapInstanceRef.current.flyTo(targetPreset.center, targetPreset.zoom, { duration: 1.4 });
    }
  };

  const handleNextHotspot = () => {
    if (filteredHotspots.length === 0) return;
    const currentIndex = filteredHotspots.indexOf(selectedHotspot || filteredHotspots[0]);
    const nextIndex = (currentIndex + 1) % filteredHotspots.length;
    const nextSpot = filteredHotspots[nextIndex];
    onSelectHotspot(nextSpot);

    if (mapInstanceRef.current && nextSpot.latitude && nextSpot.longitude) {
      mapInstanceRef.current.flyTo([nextSpot.latitude, nextSpot.longitude], Math.max(mapInstanceRef.current.getZoom(), 6), {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[540px] lg:min-h-[640px] rounded-3xl overflow-hidden border border-[#1b3a5c] bg-[#020b16] shadow-2xl flex items-center justify-center select-none group">
      {/* Inline Embedded Styles for Glowing Borders and Thermal Panes */}
      <style>{`
        .glowing-golden-border {
          stroke: #facc15 !important;
          stroke-width: 3.5px !important;
          stroke-linejoin: round !important;
          stroke-linecap: round !important;
          filter: drop-shadow(0 0 6px #facc15) drop-shadow(0 0 16px rgba(250, 204, 21, 0.75)) !important;
          animation: borderGlowPulse 3s ease-in-out infinite alternate;
        }
        @keyframes borderGlowPulse {
          0% {
            filter: drop-shadow(0 0 4px #facc15) drop-shadow(0 0 10px rgba(250, 204, 21, 0.55));
          }
          100% {
            filter: drop-shadow(0 0 8px #facc15) drop-shadow(0 0 22px rgba(250, 204, 21, 0.9));
          }
        }
        .custom-fire-marker-container {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #020b16 !important;
          cursor: grab;
        }
        .leaflet-container:active {
          cursor: grabbing;
        }
      `}</style>

      {/* 100% Interactive Leaflet GIS Map Container */}
      <div
        ref={mapContainerRef}
        className={`absolute inset-0 w-full h-full z-10 transition-all duration-500 ${
          mapMode === 'tactical'
            ? 'brightness-85 contrast-125'
            : mapMode === 'thermal'
            ? 'brightness-100 saturate-125'
            : 'brightness-100'
        }`}
        style={{ background: '#020b16' }}
      />

      {/* Tactical Coordinate Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-15 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:36px_36px]" />

      {/* Top Left: Zoom In / Zoom Out / Recenter Controls */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-[#091b2f]/90 hover:bg-blue-600 border border-[#1b3a5c] text-slate-200 hover:text-white flex items-center justify-center transition-all shadow-xl shadow-black/60 cursor-pointer backdrop-blur-md"
          title={lang === 'ar' ? 'تكبير (+)' : 'Zoom In (+)'}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-[#091b2f]/90 hover:bg-blue-600 border border-[#1b3a5c] text-slate-200 hover:text-white flex items-center justify-center transition-all shadow-xl shadow-black/60 cursor-pointer backdrop-blur-md"
          title={lang === 'ar' ? 'تصغير (−)' : 'Zoom Out (−)'}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="w-9 h-9 rounded-xl bg-[#091b2f]/90 hover:bg-blue-600 border border-[#1b3a5c] text-slate-200 hover:text-white flex items-center justify-center transition-all shadow-xl shadow-black/60 cursor-pointer backdrop-blur-md"
          title={lang === 'ar' ? 'إعادة التمركز للدولة' : 'Recenter to Country'}
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Top Center: Country Quick Switcher (Egypt, Canada, Brazil, Global) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#071626]/90 backdrop-blur-md border border-[#1b3a5c] rounded-2xl p-1 gap-1 shadow-2xl">
        {Object.values(COUNTRY_PRESETS).map((p) => {
          const isSelected = activeCountryCode === p.code;
          return (
            <button
              key={p.code}
              onClick={() => handleCountrySwitch(p.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={p.descriptionEn}
            >
              <span>{p.flag}</span>
              <span>{lang === 'ar' ? p.nameAr : p.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Top Right: Layer Mode Switcher (Optical / Thermal / Tactical) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className="flex items-center bg-[#091b2f]/90 backdrop-blur-md border border-[#1b3a5c] rounded-xl p-0.5 text-[11px] shadow-xl">
          <button
            onClick={() => setMapMode('optical')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mapMode === 'optical' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'قمر صناعي' : 'Optical'}
          </button>
          <button
            onClick={() => setMapMode('thermal')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mapMode === 'thermal' ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.6)]' : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'حراري (Thermal)' : 'Thermal'}
          </button>
          <button
            onClick={() => setMapMode('tactical')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mapMode === 'tactical' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'تكتيكي' : 'Tactical'}
          </button>
        </div>
      </div>

      {/* Floating Tactical Tooltip Card (Cleanly placed, NO inset/cutout in bottom right!) */}
      {showTooltip && activeSpot && (
        <div
          className="absolute bottom-16 left-4 z-30 max-w-[340px] cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          onClick={() => onSelectHotspot(activeSpot)}
        >
          <div className="bg-[#0b1c2e]/95 backdrop-blur-md border border-[#234b75] rounded-2xl p-3.5 shadow-2xl shadow-black/90 hover:border-cyan-400 transition-all text-left">
            <div className="text-[12px] font-bold text-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef233c]" />
                <span className="truncate max-w-[210px] text-white font-semibold">{activeSpot.name}</span>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider ${
                  activeSpot.level === 'critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : activeSpot.level === 'high'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                }`}
              >
                {activeSpot.level.toUpperCase()}
              </span>
            </div>

            <div className="text-[11px] font-mono flex items-center gap-2 mt-1.5">
              <span className="text-red-400 font-bold">{activeSpot.riskScore}% Risk</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300 font-semibold">{activeSpot.temperature}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300 font-semibold">KBDI: {activeSpot.droughtIndex}</span>
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between gap-1 text-[10px]">
              <span className="text-emerald-400 font-mono flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{activeSpot.activeHotspots} Clusters Active</span>
              </span>
              {activeSpot.frp && (
                <span className="text-amber-400 font-mono font-bold">
                  {activeSpot.frp} MW
                </span>
              )}
            </div>

            {activeSpot.latitude !== undefined && (
              <div className="text-[9.5px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                <span>LAT {activeSpot.latitude.toFixed(4)}° LON {activeSpot.longitude?.toFixed(4)}°</span>
                <span className="text-[9px] text-cyan-400/80">Click to Inspect →</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Left Toolbar: Toggle Tooltip & Cycle Next Hotspot */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs cursor-pointer shadow-lg backdrop-blur-md ${
            showTooltip
              ? 'bg-blue-600/90 border-blue-400 text-white font-medium'
              : 'bg-[#091b2f]/90 border-[#1b3a5c] text-slate-300 hover:text-white'
          }`}
          title="Toggle Hotspot Details HUD"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'بطاقة البؤرة' : 'Hotspot HUD'}</span>
        </button>

        <button
          onClick={handleNextHotspot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091b2f]/90 border border-[#1b3a5c] text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs cursor-pointer shadow-lg backdrop-blur-md"
          title="Focus next detected hotspot"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'ar' ? 'البؤرة التالية' : 'Next Hotspot'}</span>
        </button>
      </div>

      {/* Bottom Right: Clean Satellite Constellation Badge (No cutout or intrusive graph!) */}
      <div className="absolute bottom-4 right-4 z-30 hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#081729]/95 backdrop-blur-md border border-[#1a385a] text-xs text-slate-300 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-mono text-cyan-300 font-bold">
          {currentPreset.satellites}
        </span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-slate-300">
          {filteredHotspots.length} {lang === 'ar' ? 'بؤرة نشطة' : 'Active Hotspots'}
        </span>
      </div>
    </div>
  );
};
