import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Flame,
  Search,
  RotateCw,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Check,
  Zap,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  Video,
  Compass,
  Hand,
  Crosshair,
  Sparkles,
  Activity,
  Layers,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  Info,
  X,
  ShieldAlert,
  Wind,
  Cloud,
  Brain,
} from 'lucide-react';
import { FireService, type Hotspot } from '../../services/fireService';
import { ApiClient } from '../../services/apiClient';
import { RegionService } from '../../services/regionService';
import { getRegionalLayersData } from '../../services/mapLayersData';
import './FireDetectionView.css';

interface FireDetectionViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  onSelectHotspot?: (h: Hotspot) => void;
  onOpenMapWithHotspot?: (lat: number, lon: number) => void;
}

interface RegionPreset {
  id: string;
  labelEn: string;
  labelAr: string;
  center: [number, number];
  zoom: number;
}

const REGION_PRESETS: RegionPreset[] = [
  { id: 'Brazil', labelEn: 'Brazil (Amazon Basin)', labelAr: 'البرازيل (حوض الأمازون)', center: [-6.5, -55.8], zoom: 6 },
  { id: 'Canada', labelEn: 'Canada (Boreal Belt)', labelAr: 'كندا (الحزام الشمالي)', center: [56.2, -114.5], zoom: 5 },
  { id: 'California', labelEn: 'California (Sierra / Butte)', labelAr: 'كاليفورنيا (سييرا / بوت)', center: [39.2, -121.0], zoom: 7 },
  { id: 'Egypt', labelEn: 'Egypt (Nile Delta & Coast)', labelAr: 'مصر (الدلتا والساحل)', center: [30.8, 31.2], zoom: 7 },
  { id: 'Mediterranean', labelEn: 'Mediterranean Basin (Greece / Italy)', labelAr: 'حوض البحر الأبيض المتوسط (اليونان / إيطاليا)', center: [38.2, 23.7], zoom: 6 },
  { id: 'Cerrado', labelEn: 'Cerrado Biome', labelAr: 'إقليم السيرادو', center: [-14.2, -47.8], zoom: 6 },
  { id: 'Pantanal', labelEn: 'Pantanal Wetlands', labelAr: 'أراضي بانتانال الرطبة', center: [-19.5, -56.5], zoom: 7 },
  { id: 'Bolivia', labelEn: 'Bolivia (Chiquitania)', labelAr: 'بوليفيا (تشيكيتانيا)', center: [-16.5, -61.0], zoom: 6 },
  { id: 'Global', labelEn: 'Global (Beta)', labelAr: 'المراقبة العالمية (بيتا)', center: [15.0, 0.0], zoom: 3 },
];

export const FireDetectionView: React.FC<FireDetectionViewProps> = ({
  lang,
  selectedRegion: propRegion,
  onSelectHotspot,
  onOpenMapWithHotspot,
}) => {
  // Region Selection
  const [currentRegion, setCurrentRegion] = useState<string>(() => {
    return propRegion || 'Brazil';
  });

  useEffect(() => {
    if (propRegion && propRegion !== currentRegion) {
      setCurrentRegion(propRegion);
    }
  }, [propRegion]);

  const currentPreset = useMemo(() => {
    return (
      REGION_PRESETS.find(
        (r) =>
          r.id.toLowerCase() === currentRegion.toLowerCase() ||
          r.labelEn.toLowerCase().includes(currentRegion.toLowerCase())
      ) || REGION_PRESETS[0]
    );
  }, [currentRegion]);

  // Backend Connectivity & Refreshing
  const [isBackendLive, setIsBackendLive] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Hotspots State
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isInspectCardDismissed, setIsInspectCardDismissed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Top Tabs & Controls
  const [activeTab, setActiveTab] = useState<'Mirap' | 'Measurements' | 'Fire y-lines' | 'Intelligence'>('Mirap');
  const [showMeasurementDropdown, setShowMeasurementDropdown] = useState<boolean>(false);
  const [measurementMetric, setMeasurementMetric] = useState<'frp' | 'brightness' | 'burnArea'>('frp');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const [showIntelligencePanel, setShowIntelligencePanel] = useState<boolean>(true);

  // Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    activeFires: true,
    frpIntensity: true,
    confirmationes: true,
    confirmationes3: true,
    firePerimeters: true,
    fireDensity: true,
    // Extra operational layers
    smoke: false,
    weather: false,
    windOverlay: false,
    infrastructure: false,
    evacuationRoutes: false,
  });

  const [showExtraLayers, setShowExtraLayers] = useState<boolean>(false);

  // Basemap & Real Map Controls
  const [basemapStyle, setBasemapStyle] = useState<'satellite' | 'dark' | 'terrain'>('satellite');
  const [activeTool, setActiveTool] = useState<'inspect' | 'pan'>('inspect');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlaysLayerRef = useRef<L.LayerGroup | null>(null);

  // Drone Stream Controls
  const [droneFeedMode, setDroneFeedMode] = useState<'video' | 'still'>('video');
  const [dronePlaying, setDronePlaying] = useState<boolean>(true);
  const [droneMuted, setDroneMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Dropdowns
  const [showRegionDropdown, setShowRegionDropdown] = useState<boolean>(false);
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [showMetricDropdown, setShowMetricDropdown] = useState<boolean>(false);
  const [showTableMenu, setShowTableMenu] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Algorithm Model & Metric Selection
  const [algorithmModel, setAlgorithmModel] = useState<'VNP14IMG' | 'MOD14' | 'GOES16'>('VNP14IMG');
  const [metricUnit, setMetricUnit] = useState<'MW' | 'GJ' | 'biomass' | 'co2'>('MW');

  // Fetch data from backend or local NASA archive
  const loadHotspots = async () => {
    setIsRefreshing(true);
    try {
      // 1. Check Backend Health
      const live = await ApiClient.checkHealth();
      setIsBackendLive(live);

      // 2. Fetch using FireService which harmonizes backend & local FIRMS archive
      const fires = await FireService.getActiveFires({
        region: currentRegion,
        year: 2024,
        sensors: ['VIIRS', 'MODIS'],
        applyResolutionNormalization: true,
      });

      setHotspots(fires);
      if (fires.length > 0 && !selectedHotspot && !isInspectCardDismissed) {
        setSelectedHotspot(fires[0]);
      }
      const now = new Date();
      setLastSyncTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC`
      );
    } catch (err) {
      console.warn('Failed to fetch from backend, loaded local NASA FIRMS archive:', err);
      setIsBackendLive(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsInspectCardDismissed(false);
    loadHotspots();
  }, [currentRegion]);

  // Video play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (dronePlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [dronePlaying]);

  // Toggle Layer
  const handleToggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // Filtered Hotspots based on search and confidence layers
  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q) ||
        (h.stateOrRegion && h.stateOrRegion.toLowerCase().includes(q)) ||
        h.country.toLowerCase().includes(q) ||
        h.frp.toString().includes(q);

      // Confidence layer filter (>80% when checked)
      const matchConf =
        !activeLayers.confirmationes || (activeLayers.confirmationes && h.confidence >= 80);

      // 3-Sigma Anomaly layer filter (extreme peaks only)
      const match3Sigma =
        !activeLayers.confirmationes3 || (activeLayers.confirmationes3 && h.frp >= 75);

      return matchSearch && matchConf && match3Sigma;
    });
  }, [hotspots, searchQuery, activeLayers.confirmationes, activeLayers.confirmationes3]);

  // Active or highlighted hotspot
  const activeFocus = selectedHotspot || filteredHotspots[0] || null;
  const currentFRP = activeFocus ? activeFocus.frp : 185;

  // Live search matches for topbar dropdown
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return hotspots
      .filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.id.toLowerCase().includes(q) ||
          (h.stateOrRegion && h.stateOrRegion.toLowerCase().includes(q)) ||
          h.country.toLowerCase().includes(q) ||
          h.frp.toString().includes(q)
      )
      .slice(0, 8);
  }, [hotspots, searchQuery]);

  // Aggregate measurements for the tactical dock
  const regionalMetrics = useMemo(() => {
    const totalFRP = filteredHotspots.reduce((acc, h) => acc + (h.frp || 0), 0);
    const maxTemp = filteredHotspots.reduce((acc, h) => Math.max(acc, h.tempK || 356.2), 300);
    const totalAcres = filteredHotspots.reduce((acc, h) => acc + (h.acres || 850), 0);
    return {
      totalFRP: Math.round(totalFRP),
      maxTemp: maxTemp.toFixed(1),
      totalAcres: totalAcres.toLocaleString(),
      count: filteredHotspots.length,
    };
  }, [filteredHotspots]);

  // Interactive refresh handler with live feedback toast
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshToast(
      lang === 'ar'
        ? 'جارٍ التزامن المباشر مع أرشيف NASA FIRMS وواجهة API...'
        : 'Synchronizing with live NASA FIRMS feeds & API...'
    );
    try {
      await loadHotspots();
      setRefreshToast(
        lang === 'ar'
          ? `تم تحديث ${hotspots.length || 44} بؤرة حرارية بنجاح`
          : `Updated ${hotspots.length || 44} active fires from NASA FIRMS`
      );
    } catch {
      setRefreshToast(
        lang === 'ar'
          ? 'تم التحديث من الأرشيف الفضائي المحلي'
          : 'Synchronized with local FIRMS archive'
      );
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(null), 3500);
    }
  };

  // Mathematical Calculations
  const biomassCombustionRate = (currentFRP * 0.41).toFixed(2); // kg/s
  const carbonEmissionRate = (currentFRP * 0.82).toFixed(2); // kg CO2/s
  const energyOutputGJ = (currentFRP * 3.6).toFixed(1); // GJ/hr
  const flameTempKelvin = Math.round(300 + currentFRP * 1.6); // Kelvin estimate

  // FRP Color Helper
  const getFRPColor = (frp: number) => {
    if (frp > 180) return '#ff2a2a';
    if (frp > 120) return '#ff7700';
    if (frp > 60) return '#ffb703';
    if (frp > 30) return '#52b788';
    return '#0084ff';
  };

  // -------------------------------------------------------------------------
  // INITIALIZE REAL LEAFLET MAP
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: currentPreset.center,
        zoom: currentPreset.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Satellite Basemap Tiles (Google Hybrid Satellite)
      const tile = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 19,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      tileLayerRef.current = tile;

      // Layer groups for markers & overlays
      const markersLayer = L.layerGroup().addTo(map);
      const overlaysLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      overlaysLayerRef.current = overlaysLayer;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fly to Region when selection changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(currentPreset.center, currentPreset.zoom, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [currentPreset]);

  // Invalidate map size on fullscreen toggle
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Change Basemap Style
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    let subdomains: string[] | undefined = ['mt0', 'mt1', 'mt2', 'mt3'];

    if (basemapStyle === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      subdomains = ['a', 'b', 'c', 'd'];
    } else if (basemapStyle === 'terrain') {
      url = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
    }

    const newTile = L.tileLayer(url, { maxZoom: 19, subdomains }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [basemapStyle]);

  // -------------------------------------------------------------------------
  // RENDER ALL REAL INTERACTIVE LAYERS ON LEAFLET MAP
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !overlaysLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    overlaysLayerRef.current.clearLayers();

    // 1. ACTIVE FIRES LAYER (VIIRS / MODIS Real Hotspots)
    if (activeLayers.activeFires) {
      filteredHotspots.forEach((h) => {
        if (!h.lat || !h.lon) return;

        const isSelected = selectedHotspot?.id === h.id;
        const isCritical = h.frp >= 150 || (activeLayers.confirmationes3 && h.frp >= 90);
        const markerColor = getFRPColor(h.frp);

        // Custom Leaflet DivIcon with Flame SVG
        const customIcon = L.divIcon({
          className: 'real-fire-marker-wrapper',
          html: `
            <div style="
              position: relative;
              width: ${isSelected ? '32px' : '24px'};
              height: ${isSelected ? '32px' : '24px'};
              border-radius: 50%;
              background: ${markerColor};
              border: 2px solid #ffffff;
              box-shadow: 0 0 16px ${markerColor}, 0 0 28px ${markerColor};
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 2C8.5 7.5 5 10.5 5 15a7 7 0 0 0 14 0c0-3.5-2.5-6.5-4-9-1 3-3 4-3 4s-.5-4.5 0-8z"/>
              </svg>
              ${
                isCritical
                  ? `<div style="
                    position: absolute;
                    inset: -8px;
                    border-radius: 50%;
                    border: 2px solid ${markerColor};
                    animation: markerPing 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
                  "></div>`
                  : ''
              }
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([h.lat, h.lon], { icon: customIcon });

        marker.on('click', () => {
          setIsInspectCardDismissed(false);
          setSelectedHotspot(h);
          if (onSelectHotspot) onSelectHotspot(h);
          mapInstanceRef.current?.panTo([h.lat, h.lon]);
        });

        marker.bindTooltip(
          `<b>${h.name}</b><br/>FRP: <span style="color:#f87171;font-weight:bold;">${h.frp} MW</span> | ${h.satellite} (${h.confidence}%)`,
          { direction: 'top', offset: [0, -14], className: 'real-fire-tooltip' }
        );

        markersLayerRef.current?.addLayer(marker);

        // FRP Intensity Radiant Thermal Glow Circles
        if (activeLayers.frpIntensity && h.frp > 20) {
          const radius = Math.min(24000, h.frp * 85);
          const circle = L.circle([h.lat, h.lon], {
            radius,
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: 0.16,
            weight: 1,
          });
          overlaysLayerRef.current?.addLayer(circle);
        }

        // Confirmationes 3: 3-Sigma Anomaly Alert Ring
        if (activeLayers.confirmationes3 && h.frp >= 90) {
          const ring = L.circle([h.lat, h.lon], {
            radius: Math.min(32000, h.frp * 120),
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 6',
          });
          ring.bindTooltip(
            `⚠️ <b>3-Sigma Thermal Anomaly Alert</b><br/>Extreme FRP Peak: <b>${h.frp} MW</b><br/>Radiometer: <b>${h.satellite}</b>`,
            { className: 'real-layer-tooltip' }
          );
          overlaysLayerRef.current?.addLayer(ring);
        }
      });
    }

    // Retrieve regional data bundle for operational thematic layers
    const layerData = getRegionalLayersData(
      currentPreset.id,
      currentPreset.center[0],
      currentPreset.center[1]
    );

    // 2. FIRE PERIMETERS & SPREAD RISK
    if (activeLayers.firePerimeters) {
      // Risk zones from layerData
      layerData.fireRiskZones.forEach((z) => {
        const riskCircle = L.circle([z.center.lat, z.center.lng], {
          radius: z.radiusMeters,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '8, 8',
        });
        riskCircle.bindTooltip(
          `🔥 <b>${z.name}</b><br/>Spread Risk Score: <b style="color:#ef4444;">${z.riskScore}%</b><br/>Direction: <b>${z.spreadDirection}</b> | Velocity: <b>${z.spreadVelocityKmh} km/h</b>`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(riskCircle);
      });

      // Front perimeters around top active fires
      filteredHotspots.slice(0, 4).forEach((f) => {
        if (!f.lat || !f.lon) return;
        const front = L.polygon(
          [
            [f.lat + 0.05, f.lon - 0.04],
            [f.lat + 0.08, f.lon + 0.06],
            [f.lat - 0.03, f.lon + 0.08],
            [f.lat - 0.06, f.lon - 0.02],
          ],
          {
            color: '#f97316',
            fillColor: '#ea580c',
            fillOpacity: 0.22,
            weight: 2,
            dashArray: '4, 4',
          }
        );
        front.bindTooltip(`<b>Active Fire Perimeter Front</b><br/>Flame Front Velocity: <b>3.4 km/h</b>`, {
          className: 'real-layer-tooltip',
        });
        overlaysLayerRef.current?.addLayer(front);
      });
    }

    // 3. FIRE DENSITY
    if (activeLayers.fireDensity && filteredHotspots.length > 0) {
      const centerHotspot = filteredHotspots[0];
      if (centerHotspot.lat && centerHotspot.lon) {
        const d1 = L.circle([centerHotspot.lat, centerHotspot.lon], {
          radius: 45000,
          color: '#dc2626',
          fillColor: '#dc2626',
          fillOpacity: 0.07,
          weight: 1.5,
          dashArray: '4, 4',
        });
        d1.bindTooltip(
          `<b>High-Density Thermal Cluster</b><br/>Concentration: <b>${filteredHotspots.length} detections</b>`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(d1);

        const d2 = L.circle([centerHotspot.lat, centerHotspot.lon], {
          radius: 75000,
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.04,
          weight: 1,
          dashArray: '6, 6',
        });
        overlaysLayerRef.current?.addLayer(d2);
      }
    }

    // 4. SMOKE PLUMES (Sentinel-5P TROPOMI Dispersion)
    if (activeLayers.smoke) {
      layerData.smokePlumes.forEach((plume) => {
        const poly = L.polygon(plume.polygon, {
          color: 'rgba(186, 230, 253, 0.6)',
          fillColor: 'rgba(148, 163, 184, 0.35)',
          fillOpacity: 0.35,
          weight: 1.5,
          dashArray: '5, 5',
        });
        poly.bindTooltip(
          `☁️ <b>${plume.name}</b><br/>Air Quality: <b style="color:#ef4444;">AQI ${plume.aqi} (${plume.category})</b><br/>PM2.5: <b>${plume.pm25} µg/m³</b> | CO: <b>${plume.coColumn}</b>`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(poly);
      });
    }

    // 5. WEATHER & DROUGHT LAYER
    if (activeLayers.weather) {
      layerData.weatherStations.forEach((ws) => {
        const weatherIcon = L.divIcon({
          className: 'weather-station-marker',
          html: `
            <span>⛅</span>
            <span>${ws.tempC}°C</span>
            <span style="opacity:0.4;">|</span>
            <span style="color:#7dd3fc;">${ws.humidityPct}%</span>
            <span style="opacity:0.4;">|</span>
            <span style="color:#fde047;">${ws.windSpeedKmh}k</span>
          `,
          iconSize: [140, 24],
          iconAnchor: [70, 12],
        });

        const marker = L.marker([ws.coords.lat, ws.coords.lng], { icon: weatherIcon });
        marker.bindTooltip(
          `🌡️ <b>${ws.name}</b><br/>Temp: <b>${ws.tempC}°C</b> | Humidity: <b>${ws.humidityPct}%</b><br/>Wind: <b>${ws.windSpeedKmh} km/h (${ws.windCompass})</b><br/>Drought KBDI: <b style="color:#ef4444;">${ws.kbdi}/800</b>`,
          { className: 'real-layer-tooltip' }
        );
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 6. WIND VECTORS
    if (activeLayers.windOverlay) {
      layerData.windVectors.forEach((wv) => {
        const windIcon = L.divIcon({
          className: 'wind-arrow-marker',
          html: `
            <div style="transform: rotate(${wv.bearingDeg}deg); width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#38bdf8">
                <path d="M12 2L4 20l8-4 8 4L12 2z"/>
              </svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([wv.coords.lat, wv.coords.lng], { icon: windIcon });
        marker.bindTooltip(
          `💨 <b>Wind Vector:</b> ${wv.speedKmh} km/h ${wv.compass}<br/>Bearing: <b>${wv.bearingDeg}°</b> | Gusts: <b>${wv.gustsKmh} km/h</b>`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(marker);
      });
    }

    // 7. CRITICAL INFRASTRUCTURE (OSM)
    if (activeLayers.infrastructure) {
      layerData.infrastructureAssets.forEach((inf) => {
        const infraIcon = L.divIcon({
          className: 'infra-node-marker',
          html: `<div style="border-color:${inf.color};">${inf.icon}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([inf.coords.lat, inf.coords.lng], { icon: infraIcon });
        marker.bindTooltip(
          `<b>${inf.icon} ${inf.name}</b><br/>Type: <b>${inf.type}</b> | Threat: <b style="color:#ef4444;">${inf.threatLevel}</b><br/>Distance to Fire Front: <b>${inf.distanceToFireKm} km</b>`,
          { className: 'real-layer-tooltip' }
        );
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 8. EVACUATION ROUTES
    if (activeLayers.evacuationRoutes && layerData.evacuationRoute) {
      const route = L.polyline(layerData.evacuationRoute.safeRouteCoords, {
        color: '#10b981',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      });
      route.bindTooltip(
        `🚶 <b>${layerData.evacuationRoute.corridorName}</b><br/>Status: <b>Designated Safe Evacuation Arterial</b>`,
        { className: 'real-layer-tooltip' }
      );
      overlaysLayerRef.current?.addLayer(route);
    }

    // 9. TAB SPECIFIC TACTICAL OVERLAYS
    if (activeTab === 'Measurements') {
      filteredHotspots.slice(0, 8).forEach((h) => {
        if (!h.lat || !h.lon) return;
        if (measurementMetric === 'frp') {
          // Radiating FRP buffers
          const radiusMeters = Math.min(Math.max((h.frp || 100) * 120, 15000), 55000);
          const circle = L.circle([h.lat, h.lon], {
            radius: radiusMeters,
            color: '#ff7700',
            fillColor: '#ff7700',
            fillOpacity: 0.14,
            weight: 1.5,
            dashArray: '4, 4',
          });
          circle.bindTooltip(
            `⚡ <b>FRP Radiative Flux</b>: ${h.frp} MW<br/>Radiative Intensity Buffer: ${(radiusMeters / 1000).toFixed(1)} km`,
            { className: 'real-layer-tooltip' }
          );
          overlaysLayerRef.current?.addLayer(circle);

          // Measurement badge divIcon
          const hudIcon = L.divIcon({
            className: 'custom-measurement-marker',
            html: `<div class="measurement-hud-label">⚡ ${h.frp} MW</div>`,
            iconSize: [80, 24],
            iconAnchor: [40, -10],
          });
          const marker = L.marker([h.lat, h.lon], { icon: hudIcon, interactive: false });
          overlaysLayerRef.current?.addLayer(marker);
        } else if (measurementMetric === 'brightness') {
          // Thermal infrared isotherms
          const circle = L.circle([h.lat, h.lon], {
            radius: 28000,
            color: '#f59e0b',
            fillColor: '#f59e0b',
            fillOpacity: 0.16,
            weight: 2,
            dashArray: '3, 6',
          });
          circle.bindTooltip(
            `🌡️ <b>Thermal Isotherm</b>: ${h.tempK || 356.2} K<br/>Radiometer Brightness Band`,
            { className: 'real-layer-tooltip' }
          );
          overlaysLayerRef.current?.addLayer(circle);

          const hudIcon = L.divIcon({
            className: 'custom-measurement-marker',
            html: `<div class="measurement-hud-label temp">🌡️ ${h.tempK || 356.2} K</div>`,
            iconSize: [85, 24],
            iconAnchor: [42, -10],
          });
          const marker = L.marker([h.lat, h.lon], { icon: hudIcon, interactive: false });
          overlaysLayerRef.current?.addLayer(marker);
        } else if (measurementMetric === 'burnArea') {
          // Burn Scar Acreage Polygons
          const offset = 0.14;
          const scarPoly = L.polygon(
            [
              [h.lat - offset * 0.8, h.lon - offset * 1.1],
              [h.lat + offset * 0.9, h.lon - offset * 0.6],
              [h.lat + offset * 1.2, h.lon + offset * 0.8],
              [h.lat - offset * 0.5, h.lon + offset * 1.0],
            ],
            {
              color: '#b45309',
              fillColor: '#78350f',
              fillOpacity: 0.35,
              weight: 2,
              dashArray: '5, 5',
            }
          );
          scarPoly.bindTooltip(
            `🌾 <b>Burned Footprint</b>: ${(h.acres || 1420).toLocaleString()} Acres<br/>Severity: High Post-Fire Scar`,
            { className: 'real-layer-tooltip' }
          );
          overlaysLayerRef.current?.addLayer(scarPoly);

          const hudIcon = L.divIcon({
            className: 'custom-measurement-marker',
            html: `<div class="measurement-hud-label" style="border-color:#b45309;color:#fde68a;">🌾 ${(h.acres || 1420).toLocaleString()} Ac</div>`,
            iconSize: [95, 24],
            iconAnchor: [47, -10],
          });
          const marker = L.marker([h.lat, h.lon], { icon: hudIcon, interactive: false });
          overlaysLayerRef.current?.addLayer(marker);
        }
      });
    } else if (activeTab === 'Fire y-lines') {
      filteredHotspots.slice(0, 8).forEach((h, idx) => {
        if (!h.lat || !h.lon) return;
        // 1. Directional forward headfire trajectory
        const driftLat = 0.22;
        const driftLon = 0.32;
        const traj = L.polyline(
          [
            [h.lat, h.lon],
            [h.lat + driftLat * 0.5, h.lon + driftLon * 0.5],
            [h.lat + driftLat, h.lon + driftLon],
          ],
          {
            color: '#f97316',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.95,
          }
        );
        traj.bindTooltip(
          `📈 <b>Fire Front Headfire Vector</b><br/>Wind-driven spread velocity: <b>${(2.8 + (idx % 4) * 0.7).toFixed(1)} km/h</b>`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(traj);

        // 2. Spread isochrones (+2h, +4h, +6h)
        const isochroneColors = ['#eab308', '#f97316', '#ef4444'];
        const isochroneTimes = ['+2h Frontier', '+4h Expansion', '+6h Extreme Perimeter'];
        [18000, 32000, 48000].forEach((rad, rIdx) => {
          const isochrone = L.circle(
            [h.lat + driftLat * (rIdx + 1) * 0.3, h.lon + driftLon * (rIdx + 1) * 0.3],
            {
              radius: rad,
              color: isochroneColors[rIdx],
              fillColor: isochroneColors[rIdx],
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 4',
            }
          );
          isochrone.bindTooltip(
            `⏱️ <b>Isochrone: ${isochroneTimes[rIdx]}</b><br/>Simulated flame perimeter advance`,
            { className: 'real-layer-tooltip' }
          );
          overlaysLayerRef.current?.addLayer(isochrone);
        });
      });
    } else if (activeTab === 'Intelligence') {
      // 1. AI Containment Priority Sectors
      filteredHotspots.slice(0, 4).forEach((h) => {
        if (!h.lat || !h.lon) return;
        const buffer = L.circle([h.lat, h.lon], {
          radius: 42000,
          color: '#8b5cf6',
          fillColor: '#8b5cf6',
          fillOpacity: 0.16,
          weight: 2,
          dashArray: '6, 6',
        });
        buffer.bindTooltip(
          `🧠 <b>AI Priority Containment Sector</b><br/>94% Strategic priority danger envelope`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(buffer);
      });

      // 2. Dynamic Threat Corridor connection lines to infrastructure
      if (layerData.infrastructureAssets && layerData.infrastructureAssets.length > 0) {
        const topFires = filteredHotspots.slice(0, 3);
        layerData.infrastructureAssets.slice(0, 4).forEach((infra, iIdx) => {
          const targetFire = topFires[iIdx % topFires.length];
          if (targetFire && targetFire.lat && targetFire.lon && infra.coords) {
            const threatLine = L.polyline(
              [
                [targetFire.lat, targetFire.lon],
                [infra.coords.lat, infra.coords.lng],
              ],
              {
                color: '#ec4899',
                weight: 2,
                dashArray: '4, 4',
                opacity: 0.85,
              }
            );
            threatLine.bindTooltip(
              `⚠️ <b>Threat Vector to Asset</b><br/>Target: <b>${infra.name}</b> (${infra.type})<br/>Status: <b>At Risk (Immediate Buffer)</b>`,
              { className: 'real-layer-tooltip' }
            );
            overlaysLayerRef.current?.addLayer(threatLine);
          }
        });
      }
    }
  }, [filteredHotspots, activeLayers, selectedHotspot, currentRegion, activeTab, measurementMetric]);

  return (
    <div className="fire-detection-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* =========================================================================
          1. HEADER TITLE & STATUS BADGES
          ========================================================================= */}
      <header className="fd-header">
        <div className="fd-title-wrapper">
          <h1 className="fd-title-primary">
            <span style={{ color: '#ff4d15' }}>2.</span>
            {lang === 'ar' ? 'رصد وتحري الحرائق' : 'Fire Detection'}
          </h1>
          <span className="fd-title-secondary">
            {lang === 'ar' ? '(الاستخبارات الفضائية للبؤر النشطة)' : '(Active Fire Intelligence)'}
          </span>
        </div>

        <div className="fd-header-badges">
          {/* Backend Status Badge */}
          {isBackendLive ? (
            <span className="fd-badge fd-badge-live" title="Connected to FastAPI /api/v1/fires/map">
              <span className="fd-pulse-dot" />
              {lang === 'ar' ? 'الباك إند متصل ومباشر (FastAPI)' : 'Backend API Live (FastAPI)'}
            </span>
          ) : (
            <span className="fd-badge fd-badge-offline" title="Operating with local NASA FIRMS satellite archive">
              <span className="fd-pulse-dot" />
              {lang === 'ar' ? 'أرشيف ناسا المحلي (NASA FIRMS Archive)' : 'NASA FIRMS Local Archive'}
            </span>
          )}

          {/* Sensor Info */}
          <span className="fd-badge fd-badge-firms">
            🛰️ VIIRS (375m) & MODIS (1km)
          </span>
        </div>
      </header>

      {/* =========================================================================
          2. TOPBAR NAVIGATION & FILTER CONTROLS
          ========================================================================= */}
      <div className="fd-topbar">
        {/* Left Side Controls */}
        <div className="fd-topbar-left">
          {/* Search Box with Live Results Dropdown */}
          <div className="relative">
            <div className="fd-search-box">
              <Search className="w-4 h-4 text-[#627d98]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 250)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = searchMatches[0] || filteredHotspots[0];
                    if (target) {
                      setIsInspectCardDismissed(false);
                      setSelectedHotspot(target);
                      setShowSearchResults(false);
                      if (mapInstanceRef.current && target.lat && target.lon) {
                        mapInstanceRef.current.flyTo([target.lat, target.lon], 9, { duration: 1.2 });
                      }
                    }
                  }
                }}
                placeholder={lang === 'ar' ? 'بحث عن بؤرة...' : 'Search fire...'}
                className="fd-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Auto-complete Dropdown */}
            {showSearchResults && searchMatches.length > 0 && (
              <div className="fd-search-results-dropdown" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {searchMatches.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsInspectCardDismissed(false);
                      setSelectedHotspot(h);
                      setSearchQuery(h.name);
                      setShowSearchResults(false);
                      if (mapInstanceRef.current && h.lat && h.lon) {
                        mapInstanceRef.current.flyTo([h.lat, h.lon], 9, { duration: 1.2 });
                      }
                    }}
                    className="fd-search-result-item"
                  >
                    <div className="fd-search-result-info">
                      <span className="fd-search-result-title">{h.name}</span>
                      <span className="fd-search-result-sub">
                        {h.stateOrRegion || h.country} • {h.satellite}
                      </span>
                    </div>
                    <span className="fd-search-result-badge">{h.frp} MW</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            title={lang === 'ar' ? 'تحديث وتزامن البيانات مع الباك إند' : 'Synchronize with Backend'}
            className={`fd-icon-btn ${isRefreshing ? 'spinning' : ''}`}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Active View Tab: Mirap (Tactical Satellite Map) */}
          <button
            type="button"
            onClick={() => setActiveTab('Mirap')}
            className={`fd-tab-btn ${activeTab === 'Mirap' ? 'active' : 'inactive'}`}
            title={lang === 'ar' ? 'الخريطة التكتيكية الفضائية' : 'Tactical Satellite Master Map'}
          >
            {lang === 'ar' ? 'الخريطة (Mirap)' : 'Mirap'}
          </button>

          {/* Dropdown: Measurements */}
          <div className="fd-dropdown-wrapper">
            <button
              type="button"
              onClick={() => {
                setShowMeasurementDropdown(!showMeasurementDropdown);
                setActiveTab('Measurements');
              }}
              className={`fd-dropdown-btn ${activeTab === 'Measurements' ? 'border-[#0084ff] text-white active-tab' : ''}`}
              title={lang === 'ar' ? 'أدوات القياس التكتيكي' : 'Tactical Measurements'}
            >
              <span>
                {lang === 'ar' ? 'القياسات' : 'Measurements'}
                {activeTab === 'Measurements' ? ` (${measurementMetric === 'frp' ? 'FRP' : measurementMetric === 'brightness' ? 'Temp' : 'Scar'})` : ''}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showMeasurementDropdown && (
              <div className="fd-dropdown-menu">
                <button
                  type="button"
                  onClick={() => {
                    setMeasurementMetric('frp');
                    setActiveTab('Measurements');
                    setShowMeasurementDropdown(false);
                  }}
                  className={`fd-dropdown-item ${measurementMetric === 'frp' ? 'selected' : ''}`}
                >
                  <span>{lang === 'ar' ? 'طاقة الإشعاع (FRP MW)' : 'Fire Radiative Power (MW)'}</span>
                  {measurementMetric === 'frp' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMeasurementMetric('brightness');
                    setActiveTab('Measurements');
                    setShowMeasurementDropdown(false);
                  }}
                  className={`fd-dropdown-item ${measurementMetric === 'brightness' ? 'selected' : ''}`}
                >
                  <span>{lang === 'ar' ? 'حرارة السطوع (Kelvin)' : 'Thermal Brightness (K)'}</span>
                  {measurementMetric === 'brightness' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMeasurementMetric('burnArea');
                    setActiveTab('Measurements');
                    setShowMeasurementDropdown(false);
                  }}
                  className={`fd-dropdown-item ${measurementMetric === 'burnArea' ? 'selected' : ''}`}
                >
                  <span>{lang === 'ar' ? 'المساحة المحروقة (Acres)' : 'Burned Area (Acres)'}</span>
                  {measurementMetric === 'burnArea' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Button: Fire y-lines */}
          <button
            type="button"
            onClick={() => setActiveTab('Fire y-lines')}
            className={`fd-tab-btn ${activeTab === 'Fire y-lines' ? 'active' : 'inactive'}`}
            title={lang === 'ar' ? 'خطوط الانتشار الزمني والاتجاهي' : 'Fire Isochrones & Spread Vectors'}
          >
            {lang === 'ar' ? 'خطوط الانتشار' : 'Fire y-lines'}
          </button>

          {/* Button: Intelligence */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('Intelligence');
              setShowIntelligencePanel(true);
            }}
            className={`fd-tab-btn ${activeTab === 'Intelligence' ? 'active' : 'inactive'}`}
            title={lang === 'ar' ? 'الذكاء الاصطناعي التكتيكي وتحليل المخاطر' : 'AI Wildfire Intelligence'}
          >
            {lang === 'ar' ? 'الذكاء التحليلي' : 'Intelligence'}
          </button>
        </div>

        {/* Right Side Telemetry Pills */}
        <div className="fd-topbar-right">
          <div className="fd-metric-pill" title="Sensor Pass Window">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>23.05 UTC</span>
          </div>

          <div className="fd-metric-pill" title="Solar Radiance Intensity">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1020 W/m²</span>
          </div>

          <div className="fd-metric-pill" title="Calendar Day">
            <span>20.04.2024</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsModal(!showSettingsModal)}
            title={lang === 'ar' ? 'إعدادات الاستشعار' : 'Sensor Calibration'}
            className="fd-icon-btn"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN 3-COLUMN TACTICAL WORKSPACE GRID
          ========================================================================= */}
      <main className="fd-main-grid">
        {/* -----------------------------------------------------------------------
            COLUMN 1 (LEFT): REGION SELECTION & LAYER CONTROLS
            ----------------------------------------------------------------------- */}
        <div className="fd-card fd-region-card">
          <div>
            <div className="fd-card-header">
              <h2 className="fd-card-title">
                {lang === 'ar' ? 'اختيار المنطقة' : 'Region Selection'}
              </h2>
              <button
                type="button"
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                className="text-[#6484a8] hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Region Dropdown Button */}
            <div className="fd-dropdown-wrapper" style={{ marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                className="fd-region-select-btn"
              >
                <span>{lang === 'ar' ? currentPreset.labelAr : currentPreset.labelEn}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showRegionDropdown && (
                <div className="fd-dropdown-menu" style={{ width: '100%', top: 'calc(100% + 6px)' }}>
                  {REGION_PRESETS.map((reg) => (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => {
                        setCurrentRegion(reg.id);
                        setShowRegionDropdown(false);
                      }}
                      className={`fd-dropdown-item ${currentRegion.toLowerCase() === reg.id.toLowerCase() ? 'selected' : ''}`}
                    >
                      <span>{lang === 'ar' ? reg.labelAr : reg.labelEn}</span>
                      {currentRegion.toLowerCase() === reg.id.toLowerCase() && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Regio Site & Aid Row */}
            <div className="fd-regio-aid-row">
              <span className="font-semibold text-slate-200">
                {lang === 'ar' ? 'الموقع الجغرافي (Site)' : 'Regio Site'}
              </span>
              <div
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(currentPreset.center, currentPreset.zoom, { duration: 1 });
                  }
                }}
                className="flex items-center gap-1 cursor-pointer text-sky-400 hover:text-sky-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs">{lang === 'ar' ? 'إعادة ضبط' : 'Aid'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Section Label: Firesevation */}
            <div className="fd-section-label">
              {lang === 'ar' ? 'طبقات الرصد والاستشعار (Firesevation)' : 'Firesevation'}
            </div>

            {/* Layer Toggles */}
            <div className="fd-layer-list">
              {/* Layer 1: Active Fires */}
              <div
                onClick={() => handleToggleLayer('activeFires')}
                className="fd-layer-item"
              >
                <div className="fd-layer-left">
                  <div className={`fd-checkbox-box ${activeLayers.activeFires ? 'checked' : 'unchecked'}`}>
                    {activeLayers.activeFires && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span>{lang === 'ar' ? 'الحرائق النشطة (VIIRS/MODIS)' : 'Active Fires (VIIRS/MODIS)'}</span>
                </div>
                <span className="fd-layer-badge-count">{filteredHotspots.length}</span>
              </div>

              {/* Layer 2: FRP Intensity with Lightning Icon */}
              <div
                onClick={() => handleToggleLayer('frpIntensity')}
                className="fd-layer-item"
              >
                <div className="fd-layer-left">
                  <div className={`fd-checkbox-box zap ${activeLayers.frpIntensity ? 'checked' : 'unchecked'}`}>
                    <Zap className="w-3.5 h-3.5 fill-white stroke-none" />
                  </div>
                  <span>{lang === 'ar' ? 'كثافة الطاقة الإشعاعية (FRP)' : 'FRP Intensity'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#5f7d9f]" />
              </div>

              {/* Layer 3: Confirmationes */}
              <div
                onClick={() => handleToggleLayer('confirmationes')}
                className="fd-layer-item"
              >
                <div className="fd-layer-left">
                  <div className={`fd-checkbox-box ${activeLayers.confirmationes ? 'checked' : 'unchecked'}`}>
                    {activeLayers.confirmationes && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span>{lang === 'ar' ? 'التأكيد الفضائي (High Conf)' : 'Confirmationes'}</span>
                </div>
                <span className="fd-layer-badge-count">&gt;80%</span>
              </div>

              {/* Layer 4: Confirmationes 3 */}
              <div
                onClick={() => handleToggleLayer('confirmationes3')}
                className="fd-layer-item"
              >
                <div className="fd-layer-left">
                  <div className={`fd-checkbox-box ${activeLayers.confirmationes3 ? 'checked' : 'unchecked'}`}>
                    {activeLayers.confirmationes3 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span>{lang === 'ar' ? 'شذوذ 3-سيجما (Anomalies 3)' : 'Confirmationes 3'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#5f7d9f]" />
              </div>

              {/* Layer 5: Fire Perimeters */}
              <div
                onClick={() => handleToggleLayer('firePerimeters')}
                className="fd-layer-item"
              >
                <div className="fd-layer-left">
                  <div className={`fd-checkbox-box ${activeLayers.firePerimeters ? 'checked' : 'unchecked'}`}>
                    {activeLayers.firePerimeters && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span>{lang === 'ar' ? 'محيط نطاق الحريق' : 'Fire Perimeters'}</span>
                </div>
              </div>

              {/* Layer 6: Fire Density */}
              <div
                onClick={() => handleToggleLayer('fireDensity')}
                className="fd-layer-item"
              >
                <div className="fd-layer-left">
                  <div className={`fd-checkbox-box ${activeLayers.fireDensity ? 'checked' : 'unchecked'}`}>
                    {activeLayers.fireDensity && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span>{lang === 'ar' ? 'كثافة التجمعات الحرارية' : 'Fire Density'}</span>
                </div>
              </div>

              {/* Expandable Operational Layers Selector */}
              <button
                type="button"
                onClick={() => setShowExtraLayers(!showExtraLayers)}
                className="flex items-center justify-between w-full py-1.5 px-1 text-xs text-sky-400 hover:text-sky-300 font-semibold border-t border-[#14263f] mt-1 pt-2"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'طبقات عملياتية إضافية' : 'Operational Layers'}</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExtraLayers ? 'rotate-180' : ''}`} />
              </button>

              {showExtraLayers && (
                <div className="flex flex-col gap-1.5 mt-1 pt-1 border-t border-[#12233a] max-h-40 overflow-y-auto pr-1">
                  {/* Smoke Plumes */}
                  <div onClick={() => handleToggleLayer('smoke')} className="fd-layer-item">
                    <div className="fd-layer-left">
                      <div className={`fd-checkbox-box ${activeLayers.smoke ? 'checked' : 'unchecked'}`}>
                        {activeLayers.smoke && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{lang === 'ar' ? 'أعمدة الدخان (Sentinel-5P)' : 'Smoke Plumes (Sentinel-5P)'}</span>
                    </div>
                  </div>
                  {/* Weather Stations */}
                  <div onClick={() => handleToggleLayer('weather')} className="fd-layer-item">
                    <div className="fd-layer-left">
                      <div className={`fd-checkbox-box ${activeLayers.weather ? 'checked' : 'unchecked'}`}>
                        {activeLayers.weather && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{lang === 'ar' ? 'محطات الطقس والجفاف' : 'Weather & Drought (KBDI)'}</span>
                    </div>
                  </div>
                  {/* Wind Vectors */}
                  <div onClick={() => handleToggleLayer('windOverlay')} className="fd-layer-item">
                    <div className="fd-layer-left">
                      <div className={`fd-checkbox-box ${activeLayers.windOverlay ? 'checked' : 'unchecked'}`}>
                        {activeLayers.windOverlay && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{lang === 'ar' ? 'متجهات الرياح المباشرة' : 'Live Wind Vectors'}</span>
                    </div>
                  </div>
                  {/* Infrastructure */}
                  <div onClick={() => handleToggleLayer('infrastructure')} className="fd-layer-item">
                    <div className="fd-layer-left">
                      <div className={`fd-checkbox-box ${activeLayers.infrastructure ? 'checked' : 'unchecked'}`}>
                        {activeLayers.infrastructure && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{lang === 'ar' ? 'البنية التحتية الحيوية' : 'Critical Infrastructure'}</span>
                    </div>
                  </div>
                  {/* Evacuation Routes */}
                  <div onClick={() => handleToggleLayer('evacuationRoutes')} className="fd-layer-item">
                    <div className="fd-layer-left">
                      <div className={`fd-checkbox-box ${activeLayers.evacuationRoutes ? 'checked' : 'unchecked'}`}>
                        {activeLayers.evacuationRoutes && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{lang === 'ar' ? 'مسارات الإخلاء الآمنة' : 'Safe Evacuation Routes'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Refresh Status Bottom of Sidebar */}
          <div style={{ borderTop: '1px solid #14263f', paddingTop: '10px', fontSize: '11px', color: '#6484a8', display: 'flex', justifyContent: 'space-between' }}>
            <span>{lang === 'ar' ? 'آخر تزامن:' : 'Synced:'} {lastSyncTime}</span>
            <span style={{ color: isBackendLive ? '#34d399' : '#fbbf24' }}>● {isBackendLive ? 'API' : 'Local'}</span>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            COLUMN 2 (CENTER): REAL SATELLITE ACTIVE FIRE MAP (LEAFLET)
            ----------------------------------------------------------------------- */}
        <div className={`fd-card fd-map-card ${isFullscreen ? 'fixed inset-4 z-50 h-auto' : ''}`}>
          {/* Real Leaflet Map Container */}
          <div ref={mapContainerRef} className="fd-leaflet-container" id="real-fire-detection-map" />

          {/* Top-Left Map Controls */}
          <div className="fd-map-hud-left">
            <button
              type="button"
              onClick={() => {
                const nextTool = activeTool === 'inspect' ? 'pan' : 'inspect';
                setActiveTool(nextTool);
                if (mapInstanceRef.current) {
                  if (nextTool === 'pan') {
                    mapInstanceRef.current.dragging.enable();
                  }
                }
              }}
              title={activeTool === 'inspect' ? 'Inspect pointer' : 'Pan tool'}
              className={`fd-hud-btn ${activeTool === 'inspect' ? 'active' : ''}`}
            >
              <Hand className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              title="Zoom in"
              className="fd-hud-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              title="Zoom out"
              className="fd-hud-btn"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                mapInstanceRef.current?.flyTo(currentPreset.center, currentPreset.zoom, { duration: 1.2 });
              }}
              title="Reset View"
              className="fd-hud-btn"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Top-Right HUD Controls */}
          <div className="fd-map-hud-right">
            {/* Basemap Switcher Pill */}
            <div className="fd-basemap-pill-bar">
              <button
                type="button"
                onClick={() => setBasemapStyle('satellite')}
                className={`fd-basemap-btn ${basemapStyle === 'satellite' ? 'active' : ''}`}
                title="Google Hybrid Satellite"
              >
                🛰️ {lang === 'ar' ? 'أقمار صناعية' : 'Satellite'}
              </button>
              <button
                type="button"
                onClick={() => setBasemapStyle('dark')}
                className={`fd-basemap-btn ${basemapStyle === 'dark' ? 'active' : ''}`}
                title="CartoDB Dark Matter"
              >
                🌙 {lang === 'ar' ? 'داكن' : 'Dark'}
              </button>
              <button
                type="button"
                onClick={() => setBasemapStyle('terrain')}
                className={`fd-basemap-btn ${basemapStyle === 'terrain' ? 'active' : ''}`}
                title="Google Terrain"
              >
                ⛰️ {lang === 'ar' ? 'تضاريس' : 'Terrain'}
              </button>
            </div>

            <div className="fd-map-legend-pill">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b30', display: 'inline-block' }} />
              <span>{filteredHotspots.length} {lang === 'ar' ? 'بؤرة مرصودة' : 'Active Fires'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen"
              className="fd-hud-btn"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Selected Hotspot Detailed Inspection Popup */}
          {(selectedHotspot || activeFocus) && !isInspectCardDismissed && (
            <div className="fd-inspect-popup" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="fd-inspect-header">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="font-bold text-xs text-white truncate max-w-[200px]">
                    {(selectedHotspot || activeFocus)?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotspot(null);
                    setIsInspectCardDismissed(true);
                  }}
                  className="fd-inspect-close-btn"
                  title={lang === 'ar' ? 'إغلاق البطاقة' : 'Dismiss Card'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="fd-inspect-grid">
                <div className="fd-inspect-stat">
                  <span className="fd-inspect-stat-label">{lang === 'ar' ? 'الطاقة الإشعاعية' : 'Fire Radiative Power'}</span>
                  <span className="fd-inspect-stat-val text-red-400">{(selectedHotspot || activeFocus)?.frp} MW</span>
                </div>

                <div className="fd-inspect-stat">
                  <span className="fd-inspect-stat-label">{lang === 'ar' ? 'حرارة السطوع' : 'Brightness Temp'}</span>
                  <span className="fd-inspect-stat-val text-amber-300">{(selectedHotspot || activeFocus)?.tempK || 356.2} K</span>
                </div>

                <div className="fd-inspect-stat">
                  <span className="fd-inspect-stat-label">{lang === 'ar' ? 'دقة الثقة' : 'Confidence'}</span>
                  <span className="fd-inspect-stat-val text-emerald-400">{(selectedHotspot || activeFocus)?.confidence}%</span>
                </div>

                <div className="fd-inspect-stat">
                  <span className="fd-inspect-stat-label">{lang === 'ar' ? 'المستشعر' : 'Sensor Radiometer'}</span>
                  <span className="fd-inspect-stat-val text-sky-400">{(selectedHotspot || activeFocus)?.satellite}</span>
                </div>
              </div>

              {/* Action Button: Jump to Master Map */}
              {onOpenMapWithHotspot && (
                <button
                  type="button"
                  onClick={() => {
                    const focus = selectedHotspot || activeFocus;
                    if (focus) onOpenMapWithHotspot(focus.lat, focus.lon);
                  }}
                  className="fd-inspect-btn"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'فتح في الخريطة الرئيسية للمشروع' : 'Open in Tactical Master Map'}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              )}
            </div>
          )}

          {/* Live Synchronizing Toast Banner */}
          {refreshToast && (
            <div className="fd-toast-banner">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>{refreshToast}</span>
            </div>
          )}

          {/* Tactical Measurements Floating Dock */}
          {activeTab === 'Measurements' && (
            <div className="fd-tactical-dock" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="fd-tactical-dock-title">
                <span>📐</span>
                <span>
                  {measurementMetric === 'frp'
                    ? lang === 'ar'
                      ? 'طاقة الإشعاع (FRP Radiative Flux)'
                      : 'Radiative Power Flux Analysis'
                    : measurementMetric === 'brightness'
                    ? lang === 'ar'
                      ? 'حرارة السطوع (Thermal Isotherms)'
                      : 'Thermal Brightness Isotherms'
                    : lang === 'ar'
                    ? 'مساحة الحرق التقديرية (Burn Footprint)'
                    : 'Burn Footprint Calculations'}
                </span>
              </div>
              <div className="fd-tactical-dock-item">
                <span className="text-slate-400">{lang === 'ar' ? 'إجمالي الطاقة:' : 'Σ Total FRP:'}</span>
                <span className="fd-tactical-dock-val">{regionalMetrics.totalFRP} MW</span>
              </div>
              <div className="fd-tactical-dock-item">
                <span className="text-slate-400">{lang === 'ar' ? 'أعلى حرارة:' : 'Peak Temp:'}</span>
                <span className="fd-tactical-dock-val" style={{ color: '#f59e0b' }}>
                  {regionalMetrics.maxTemp} K
                </span>
              </div>
              <div className="fd-tactical-dock-item">
                <span className="text-slate-400">{lang === 'ar' ? 'المساحة المحروقة:' : 'Burn Scar:'}</span>
                <span className="fd-tactical-dock-val" style={{ color: '#ef4444' }}>
                  {regionalMetrics.totalAcres} Ac
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Mirap')}
                className="text-slate-400 hover:text-white text-xs ml-auto"
                title={lang === 'ar' ? 'إغلاق والعودة للخريطة' : 'Close and return to Mirap'}
              >
                ✕
              </button>
            </div>
          )}

          {/* Fire y-lines Temporal Isochrones Dock */}
          {activeTab === 'Fire y-lines' && (
            <div className="fd-tactical-dock" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="fd-tactical-dock-title">
                <span>📈</span>
                <span>
                  {lang === 'ar'
                    ? 'خطوط الانتشار التوقعي (Fire y-lines)'
                    : 'Temporal Isochrones & Spread Vectors'}
                </span>
              </div>
              <div className="fd-tactical-dock-item">
                <span style={{ color: '#eab308' }}>● +2h {lang === 'ar' ? 'جبهة النار' : 'Frontier'}</span>
                <span className="fd-tactical-dock-val">2.4 km/h</span>
              </div>
              <div className="fd-tactical-dock-item">
                <span style={{ color: '#f97316' }}>● +4h {lang === 'ar' ? 'توسع النطاق' : 'Expansion'}</span>
                <span className="fd-tactical-dock-val">3.8 km/h</span>
              </div>
              <div className="fd-tactical-dock-item">
                <span style={{ color: '#ef4444' }}>● +6h {lang === 'ar' ? 'خطر حرج' : 'Extreme Flank'}</span>
                <span className="fd-tactical-dock-val">5.2 km/h</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Mirap')}
                className="text-slate-400 hover:text-white text-xs ml-auto"
                title={lang === 'ar' ? 'إغلاق والعودة للخريطة' : 'Close and return to Mirap'}
              >
                ✕
              </button>
            </div>
          )}

          {/* AI Wildfire Tactical Intelligence Card */}
          {activeTab === 'Intelligence' && showIntelligencePanel && (
            <div className="fd-intelligence-card" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="fd-intelligence-header">
                <div className="fd-intelligence-title">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>
                    {lang === 'ar'
                      ? 'تحليل الذكاء التكتيكي للحرائق'
                      : 'AI Wildfire Tactical Intelligence'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIntelligencePanel(false)}
                  className="text-slate-400 hover:text-white"
                  title={lang === 'ar' ? 'إغلاق اللوحة' : 'Close Panel'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="fd-intel-stat-grid">
                <div className="fd-intel-stat-box">
                  <span className="fd-intel-stat-label">
                    {lang === 'ar' ? 'مستوى التهديد' : 'Threat Level'}
                  </span>
                  <span className="fd-intel-stat-val text-red-400">
                    94% {lang === 'ar' ? 'حرج جداً' : 'Critical'}
                  </span>
                </div>
                <div className="fd-intel-stat-box">
                  <span className="fd-intel-stat-label">
                    {lang === 'ar' ? 'سرعة الزحف' : 'Spread Velocity'}
                  </span>
                  <span className="fd-intel-stat-val text-amber-300">4.6 km/h</span>
                </div>
                <div className="fd-intel-stat-box">
                  <span className="fd-intel-stat-label">
                    {lang === 'ar' ? 'أقرب منشأة' : 'Nearest Asset'}
                  </span>
                  <span className="fd-intel-stat-val text-sky-300">3.8 km (Substation)</span>
                </div>
                <div className="fd-intel-stat-box">
                  <span className="fd-intel-stat-label">
                    {lang === 'ar' ? 'نافذة الاحتواء' : 'Defense Window'}
                  </span>
                  <span className="fd-intel-stat-val text-emerald-400">
                    ~2.5 {lang === 'ar' ? 'ساعات' : 'Hours'}
                  </span>
                </div>
              </div>

              <div className="fd-intel-recommendation">
                <strong>🛡️ {lang === 'ar' ? 'الإجراء التكتيكي المقترح:' : 'Recommended Action:'}</strong>{' '}
                {lang === 'ar'
                  ? 'نشر خطوط إخماد جوي على المحور الشمالي الشرقي وتفعيل محيط الأمان للمنشآت الحيوية المهددة.'
                  : 'Deploy aerial retardant drops along NE flank to suppress rapid wind-driven corridor expansion towards critical assets.'}
              </div>
            </div>
          )}
        </div>

        {/* -----------------------------------------------------------------------
            COLUMN 3 (RIGHT): DILGA STATUS TABLE & DRONE STREAM
            ----------------------------------------------------------------------- */}
        <div className="fd-right-column">
          {/* Card 1: Dilga Status Table */}
          <div className="fd-card fd-dilga-card">
            <div className="fd-card-header" style={{ marginBottom: '8px' }}>
              <div className="flex items-center gap-2">
                <span className="text-base">🔥</span>
                <h2 className="fd-card-title">
                  {lang === 'ar' ? 'جدول الرصد الحراري (Dilga Status)' : 'Dilga Status'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTableMenu(!showTableMenu)}
                className="text-[#6484a8] hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="fd-table-wrapper">
              <table className="fd-table">
                <thead>
                  <tr>
                    <th>Date #l</th>
                    <th>Start</th>
                    <th>Chan</th>
                    <th>Tiare</th>
                    <th style={{ textAlign: 'end' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHotspots.slice(0, 15).map((r, i) => {
                    const isSelected = selectedHotspot?.id === r.id;
                    const dateFormatted = r.dateDetected ? r.dateDetected.replace(/-/g, '.') : '20.04.2024';
                    const timeRaw = r.timeDetected || '13:49';
                    const isCritical = r.frp >= 150;

                    return (
                      <tr
                        key={r.id || i}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedHotspot(null);
                            setIsInspectCardDismissed(true);
                          } else {
                            setIsInspectCardDismissed(false);
                            setSelectedHotspot(r);
                          }
                          if (onSelectHotspot) onSelectHotspot(r);
                          if (mapInstanceRef.current && r.lat && r.lon) {
                            mapInstanceRef.current.flyTo([r.lat, r.lon], 9, { duration: 1.2 });
                          }
                        }}
                        className={isSelected ? 'selected' : ''}
                      >
                        <td>{dateFormatted}</td>
                        <td>{timeRaw.substring(0, 5)}</td>
                        <td>{r.satellite === 'VIIRS' ? '375m' : '1000m'}</td>
                        <td>{r.frp} MW</td>
                        <td style={{ textAlign: 'end' }}>
                          <span className={`fd-status-badge ${isCritical ? 'fd-status-critical' : 'fd-status-high'}`}>
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Aerial Drone Footage Feed */}
          <div className="fd-card fd-drone-card">
            {droneFeedMode === 'video' ? (
              <video
                ref={videoRef}
                src="/video1.mp4"
                autoPlay
                loop
                muted={droneMuted}
                playsInline
                className="fd-drone-video"
              />
            ) : (
              <img
                src="/assets/extracted/drone_live.jpg"
                alt="Live drone capture"
                className="fd-drone-img"
              />
            )}

            {/* Drone Telemetry HUD Overlay */}
            <div className="fd-drone-hud">
              <div className="fd-drone-hud-top">
                <div className="fd-drone-rec">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>● LIVE REC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>ALT: 1,240m</span>
                  <span>BAT: 84%</span>
                </div>
              </div>

              <div className="fd-drone-hud-bottom">
                <div>
                  <span className="text-amber-400 font-bold">FLIR IR: 412°C</span>
                  <span className="text-slate-300 ml-2">EO/IR DUAL</span>
                </div>

                {/* Drone Controls Bar */}
                <div className="fd-drone-btn-bar">
                  <button
                    type="button"
                    onClick={() => setDronePlaying(!dronePlaying)}
                    className="fd-drone-mini-btn"
                  >
                    {dronePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDroneMuted(!droneMuted)}
                    className="fd-drone-mini-btn"
                  >
                    {droneMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDroneFeedMode(droneFeedMode === 'video' ? 'still' : 'video')}
                    className="fd-drone-mini-btn"
                  >
                    {droneFeedMode === 'video' ? 'IR Still' : 'Live Stream'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          4. BOTTOM CARDS: FRP GRADIENT SCALE & INTENSE POWER MATH
          ========================================================================= */}
      <footer className="fd-bottom-grid">
        {/* Bottom Left: Fire Radiative Power Scale Bar */}
        <div className="fd-card">
          <h3 className="fd-card-title">
            {lang === 'ar' ? 'الطاقة الإشعاعية للنار (FRP MW)' : 'Fire Radiative Power (MW)'}
          </h3>

          <div className="fd-frp-bar-container">
            {/* Multi-stop Gradient Track */}
            <div className="fd-frp-gradient-track">
              {/* Dynamic pointer needle for current FRP */}
              <div
                className="fd-frp-pointer"
                style={{
                  left: `${Math.min(100, Math.max(0, (currentFRP / 200) * 100))}%`,
                }}
              />
            </div>

            {/* Scale markings 00 - 100 - 200 */}
            <div className="fd-frp-scale-labels">
              <span>00</span>
              <span>100</span>
              <span>200+ MW</span>
            </div>

            {/* Numerical Readout */}
            <div className="fd-frp-readout">
              <span className="text-slate-300">
                {lang === 'ar' ? 'القيمة الحالية للبؤرة النشطة:' : 'Current Hotspot FRP:'}
              </span>
              <span className="text-amber-400 font-mono text-base font-extrabold">
                {currentFRP.toFixed(1)} MW
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Right: Fire Intense Power Math */}
        <div className="fd-card">
          <div className="flex items-center justify-between">
            <h3 className="fd-card-title">
              {lang === 'ar' ? 'الحسابات الطيفية والانبعاث الحراري' : 'Fire Intense Power Math'}
            </h3>
            <span className="text-xs text-sky-400 font-mono">
              $FRE = \int FRP(t) dt$
            </span>
          </div>

          <div className="fd-math-controls">
            {/* Dropdown 1: Algorithm Model */}
            <div className="fd-dropdown-wrapper">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="fd-dropdown-btn"
                style={{ background: '#09172a', borderColor: '#183152', color: '#ffffff' }}
              >
                <div className="w-5 h-5 rounded-full bg-[#0084ff] flex items-center justify-center text-white">
                  <Flame className="w-3 h-3 fill-white stroke-none" />
                </div>
                <span className="font-semibold text-xs">
                  {algorithmModel === 'VNP14IMG'
                    ? 'VNP14IMG (VIIRS 375m)'
                    : algorithmModel === 'MOD14'
                    ? 'MOD14 (MODIS 1km)'
                    : 'GOES-16 ABI Instant'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6e90b4]" />
              </button>

              {showModelDropdown && (
                <div className="fd-dropdown-menu" style={{ bottom: 'calc(100% + 6px)', top: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAlgorithmModel('VNP14IMG');
                      setShowModelDropdown(false);
                    }}
                    className="fd-dropdown-item"
                  >
                    VNP14IMG 375m High-Res Active
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAlgorithmModel('MOD14');
                      setShowModelDropdown(false);
                    }}
                    className="fd-dropdown-item"
                  >
                    MOD14 / MYD14 Thermal Anomaly
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAlgorithmModel('GOES16');
                      setShowModelDropdown(false);
                    }}
                    className="fd-dropdown-item"
                  >
                    GOES-16 ABI Instantaneous FRP
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown 2: Metric Unit */}
            <div className="fd-dropdown-wrapper">
              <button
                type="button"
                onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                className="fd-dropdown-btn"
                style={{ background: '#09172a', borderColor: '#183152', color: '#c4d7ec' }}
              >
                <span className="font-semibold text-xs">
                  {metricUnit === 'MW'
                    ? (lang === 'ar' ? 'ميغاوات (MW)' : 'Fire Radiative Power (MW)')
                    : metricUnit === 'GJ'
                    ? (lang === 'ar' ? 'غيغاجول (GJ/hr)' : 'Gigajoules (GJ/hr)')
                    : metricUnit === 'biomass'
                    ? (lang === 'ar' ? 'استهلاك الكتلة الحيوية' : 'Biomass Rate (kg/s)')
                    : (lang === 'ar' ? 'انبعاثات CO₂' : 'CO2 Emissions')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6e90b4]" />
              </button>

              {showMetricDropdown && (
                <div className="fd-dropdown-menu" style={{ bottom: 'calc(100% + 6px)', top: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('MW');
                      setShowMetricDropdown(false);
                    }}
                    className="fd-dropdown-item"
                  >
                    Megawatts (MW) - Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('GJ');
                      setShowMetricDropdown(false);
                    }}
                    className="fd-dropdown-item"
                  >
                    Gigajoules (GJ) - Cumulative
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('biomass');
                      setShowMetricDropdown(false);
                    }}
                    className="fd-dropdown-item"
                  >
                    Biomass Combustion Rate (kg/s)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('co2');
                      setShowMetricDropdown(false);
                    }}
                    className="fd-dropdown-item"
                  >
                    Carbon Dioxide Release (kg/s)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mathematical Calculated Telemetry */}
          <div className="fd-math-stats-row">
            <div className="fd-math-stat-box">
              <div className="fd-math-stat-box-title">{lang === 'ar' ? 'حرق الكتلة الحيوية' : 'Biomass Consumption'}</div>
              <div className="fd-math-stat-box-val">{biomassCombustionRate} <small style={{ fontSize: '10px' }}>kg/s</small></div>
            </div>
            <div className="fd-math-stat-box">
              <div className="fd-math-stat-box-title">{lang === 'ar' ? 'انبعاث ثاني أكسيد الكربون' : 'CO2 Emission Rate'}</div>
              <div className="fd-math-stat-box-val text-amber-400">{carbonEmissionRate} <small style={{ fontSize: '10px' }}>kg/s</small></div>
            </div>
            <div className="fd-math-stat-box">
              <div className="fd-math-stat-box-title">{lang === 'ar' ? 'الطاقة الحرارية المتولدة' : 'Thermal Output'}</div>
              <div className="fd-math-stat-box-val text-emerald-400">{energyOutputGJ} <small style={{ fontSize: '10px' }}>GJ/h</small></div>
            </div>
            <div className="fd-math-stat-box">
              <div className="fd-math-stat-box-title">{lang === 'ar' ? 'حرارة لهب الجبهة' : 'Front Flame Temp'}</div>
              <div className="fd-math-stat-box-val text-red-400">{flameTempKelvin} <small style={{ fontSize: '10px' }}>K</small></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
