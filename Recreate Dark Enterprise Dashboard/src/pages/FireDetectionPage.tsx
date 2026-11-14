import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Sparkles,
  MapPin,
  ExternalLink,
  Layers,
  ArrowLeft,
  Home,
  Shield,
  Activity,
  X,
  Crosshair,
  Wind,
  Cloud,
  TreePine,
  AlertTriangle,
} from 'lucide-react';
import { FireService, type Hotspot } from '../services/fireService';
import { ApiClient } from '../services/apiClient';
import { getRegionalLayersData } from '../services/mapLayersData';
import './FireDetectionPage.css';

interface FireDetectionPageProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  onNavigateToDashboard: () => void;
  onNavigateToHome: () => void;
  initialRegion?: string;
}

// Regional Presets matching the user's screenshot
interface RegionPreset {
  id: string;
  countryCode: string;
  flag: string;
  nameEn: string;
  nameAr: string;
  center: [number, number];
  zoom: number;
  previewImg: string;
}

const REGION_PRESETS: RegionPreset[] = [
  {
    id: 'brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    nameEn: 'Brazil (Amazon)',
    nameAr: 'البرازيل (حوض الأمازون)',
    center: [-6.5, -55.8],
    zoom: 6,
    previewImg: '/assets/extracted/satellite_map.jpg',
  },
  {
    id: 'canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    nameEn: 'Canada (Boreal)',
    nameAr: 'كندا (الحزام الشمالي)',
    center: [56.2, -114.5],
    zoom: 5,
    previewImg: '/assets/crops/forest_2024.png',
  },
  {
    id: 'mediterranean',
    countryCode: 'GR',
    flag: '🗺️',
    nameEn: 'Mediterranean Basin',
    nameAr: 'حوض البحر الأبيض المتوسط',
    center: [38.2, 23.7],
    zoom: 6,
    previewImg: '/assets/crops/med_map.png',
  },
  {
    id: 'california',
    countryCode: 'US',
    flag: '🗺️',
    nameEn: 'California',
    nameAr: 'كاليفورنيا',
    center: [39.2, -121.0],
    zoom: 7,
    previewImg: '/assets/crops/forest_2023.png',
  },
  {
    id: 'egypt',
    countryCode: 'EG',
    flag: '🇪🇬',
    nameEn: 'Egypt (Delta & Coast)',
    nameAr: 'مصر (الدلتا والساحل)',
    center: [30.8, 31.2],
    zoom: 7,
    previewImg: '/assets/extracted/satellite_map.jpg',
  },
  {
    id: 'global',
    countryCode: 'GL',
    flag: '🌐',
    nameEn: 'Global (Beta)',
    nameAr: 'المراقبة العالمية (بيتا)',
    center: [15.0, 0.0],
    zoom: 3,
    previewImg: '/assets/extracted/satellite_map.jpg',
  },
];

export const FireDetectionPage: React.FC<FireDetectionPageProps> = ({
  lang,
  setLang,
  onNavigateToDashboard,
  onNavigateToHome,
  initialRegion = 'brazil',
}) => {
  // Region Selection Mode: Predefined vs Custom
  const [selectionMode, setSelectionMode] = useState<'predefined' | 'custom'>('predefined');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(() => {
    const found = REGION_PRESETS.find(
      (r) => r.id.toLowerCase() === initialRegion.toLowerCase() || r.nameEn.toLowerCase().includes(initialRegion.toLowerCase())
    );
    return found ? found.id : 'brazil';
  });

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // 11 Map Layers matching screenshot - all active by default
  const [mapLayers, setMapLayers] = useState({
    activeFires: true, // 1. Active Fires (VIIRS / MODIS)
    fireRisk: true, // 2. Fire Risk (Prediction)
    weather: true, // 3. Weather (Wind, Temp, Humidity)
    windOverlay: true, // 4. Wind Overlay
    smoke: true, // 5. Smoke (Sentinel-5P)
    infrastructure: true, // 6. Infrastructure (OSM)
    population: true, // 7. Population
    habitats: true, // 8. Protected Habitats (IUCN)
    evacuation: true, // 9. Evacuation Routes
    burnScar: true, // 10. Burn Scar (Post-Fire)
    vegetation: true, // 11. Vegetation (NDVI)
  });

  const toggleLayer = (layerKey: keyof typeof mapLayers) => {
    setMapLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  // Backend & Data State
  const [isBackendLive, setIsBackendLive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isInspectCardDismissed, setIsInspectCardDismissed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Top Tabs
  const [activeTab, setActiveTab] = useState<'Mirap' | 'Measurements' | 'Fire y-lines' | 'Intelligence'>('Mirap');
  const [showMeasurementsMenu, setShowMeasurementsMenu] = useState(false);

  // Map Basemap
  const [basemapStyle, setBasemapStyle] = useState<'satellite' | 'dark' | 'terrain'>('satellite');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Drone Stream
  const [droneMode, setDroneMode] = useState<'video' | 'still'>('video');
  const [dronePlaying, setDronePlaying] = useState(true);
  const [droneMuted, setDroneMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Bottom Math Selectors
  const [algorithmModel, setAlgorithmModel] = useState<'VNP14IMG' | 'MOD14' | 'GOES16'>('VNP14IMG');
  const [metricUnit, setMetricUnit] = useState<'MW' | 'GJ' | 'biomass' | 'co2'>('MW');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showMetricMenu, setShowMetricMenu] = useState(false);

  // Leaflet Map References
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlaysLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Current active preset
  const currentPreset = useMemo(() => {
    return REGION_PRESETS.find((r) => r.id === selectedRegionId) || REGION_PRESETS[0];
  }, [selectedRegionId]);

  // Load Hotspots for Current Region
  const loadHotspots = async () => {
    setIsRefreshing(true);
    try {
      const live = await ApiClient.checkHealth();
      setIsBackendLive(live);

      const fires = await FireService.getActiveFires({
        region: currentPreset.nameEn,
        year: 2024,
        sensors: ['VIIRS', 'MODIS'],
        applyResolutionNormalization: true,
      });

      setHotspots(fires);
      if (fires.length > 0) {
        setSelectedHotspot(fires[0]);
      }
      const now = new Date();
      setLastSyncTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC`
      );
    } catch {
      setIsBackendLive(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsInspectCardDismissed(false);
    setSelectedHotspot(null);
    loadHotspots();
  }, [selectedRegionId]);

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

  // Initialize Real Leaflet Map
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

    return () => {
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

  // Filtered Hotspots based on search query
  const filteredHotspots = useMemo(() => {
    if (!searchQuery.trim()) return hotspots;
    const q = searchQuery.toLowerCase().trim();
    return hotspots.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q) ||
        (h.stateOrRegion && h.stateOrRegion.toLowerCase().includes(q)) ||
        h.country.toLowerCase().includes(q) ||
        h.frp.toString().includes(q)
    );
  }, [hotspots, searchQuery]);

  // Render all 11 Interactive Layers on the Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !overlaysLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    overlaysLayerRef.current.clearLayers();

    // 1. ACTIVE FIRES LAYER (VIIRS / MODIS Real Hotspots)
    if (mapLayers.activeFires) {
      filteredHotspots.slice(0, 80).forEach((h) => {
        if (!h.lat || !h.lon) return;

        const isSelected = selectedHotspot?.id === h.id;
        const isCritical = h.frp >= 150;

        // Color mapping by FRP
        let markerColor = '#0084ff';
        if (h.frp > 180) markerColor = '#ff2a2a';
        else if (h.frp > 120) markerColor = '#ff7700';
        else if (h.frp > 60) markerColor = '#ffb703';
        else if (h.frp > 30) markerColor = '#52b788';

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
        });

        marker.bindTooltip(
          `<b>${h.name}</b><br/>FRP: <span style="color:#f87171;font-weight:bold;">${h.frp} MW</span> | ${h.satellite}`,
          { direction: 'top', offset: [0, -14], className: 'real-fire-tooltip' }
        );

        markersLayerRef.current?.addLayer(marker);

        // Render FRP Thermal Glow Radius
        if (h.frp > 80) {
          const radius = Math.min(18000, h.frp * 85);
          const circle = L.circle([h.lat, h.lon], {
            radius,
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: 0.15,
            weight: 1,
          });
          overlaysLayerRef.current?.addLayer(circle);
        }
      });
    }

    // Retrieve regional data bundle for the other 10 thematic layers
    const layerData = getRegionalLayersData(currentPreset.id, currentPreset.center[0], currentPreset.center[1]);

    // 2. FIRE RISK PREDICTION LAYER
    if (mapLayers.fireRisk) {
      // Risk perimeters for top active fires
      const topFires = filteredHotspots.slice(0, 5);
      topFires.forEach((f) => {
        if (!f.lat || !f.lon) return;
        const ring = L.circle([f.lat, f.lon], {
          radius: 35000,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '6, 6',
        });
        ring.bindTooltip(
          `<b>Predictive Fire Spread Risk</b><br/>Flame Front Velocity: <b style="color:#ef4444;">3.8 km/h</b><br/>Confidence: <b>92%</b>`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(ring);
      });

      // Regional Risk Zones from layerData
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
    }

    // 3. WEATHER LAYER (Wind, Temp, Humidity, KBDI Drought)
    if (mapLayers.weather) {
      layerData.weatherStations.forEach((ws) => {
        const weatherIcon = L.divIcon({
          className: 'weather-station-marker',
          html: `
            <span>⛅</span>
            <span>${ws.tempC}°C</span>
            <span style="opacity:0.4;">|</span>
            <span style="color:#7dd3fc;">${ws.humidityPct}% RH</span>
            <span style="opacity:0.4;">|</span>
            <span style="color:#fde047;">${ws.windSpeedKmh}k ${ws.windCompass}</span>
          `,
          iconSize: [160, 26],
          iconAnchor: [80, 13],
        });

        const marker = L.marker([ws.coords.lat, ws.coords.lng], { icon: weatherIcon });
        marker.bindPopup(`
          <div style="font-family:sans-serif;color:#0f172a;min-width:190px;">
            <b style="font-size:13px;color:#0284c7;">${ws.name}</b><br/>
            <div style="margin-top:6px;font-size:12px;line-height:1.5;">
              🌡️ <b>Temperature:</b> ${ws.tempC}°C<br/>
              💧 <b>Relative Humidity:</b> ${ws.humidityPct}%<br/>
              💨 <b>Surface Wind:</b> ${ws.windSpeedKmh} km/h (${ws.windCompass})<br/>
              ⏱️ <b>Barometer:</b> ${ws.pressureHPa} hPa<br/>
              🌵 <b>KBDI Drought Index:</b> <b style="color:#b91c1c;">${ws.kbdi} / 800</b><br/>
              🔥 <b>Fire Weather Index:</b> <b style="color:#c2410c;">${ws.fwi} (${ws.status})</b>
            </div>
          </div>
        `);
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 4. WIND OVERLAY (Dynamic Directional Vector Arrows)
    if (mapLayers.windOverlay) {
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

        const marker = L.marker([wv.coords.lat, wv.coords.lng], { icon: windIcon, interactive: true });
        marker.bindTooltip(
          `💨 <b>Wind Vector:</b> ${wv.speedKmh} km/h ${wv.compass}<br/>Direction Bearing: <b>${wv.bearingDeg}°</b> | Gusts: <b>${wv.gustsKmh} km/h</b>`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(marker);
      });
    }

    // 5. SMOKE (Sentinel-5P TROPOMI Dispersion)
    if (mapLayers.smoke) {
      // Sentinel-5P plumes from dataset
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

      // Also render plumes from active fires
      filteredHotspots.slice(0, 8).forEach((h) => {
        if (h.frp > 100 && h.lat && h.lon) {
          const plume = L.polygon(
            [
              [h.lat, h.lon],
              [h.lat + 0.12, h.lon + 0.25],
              [h.lat + 0.08, h.lon + 0.42],
              [h.lat - 0.05, h.lon + 0.35],
              [h.lat - 0.04, h.lon + 0.15],
            ],
            {
              color: 'rgba(200, 215, 230, 0.45)',
              fillColor: 'rgba(160, 185, 210, 0.25)',
              fillOpacity: 0.3,
              weight: 1,
              dashArray: '4, 4',
            }
          );
          overlaysLayerRef.current?.addLayer(plume);
        }
      });
    }

    // 6. INFRASTRUCTURE LAYER (OSM Hospitals, Fire Stations, Power Grids, Water Reservoirs)
    if (mapLayers.infrastructure) {
      layerData.infrastructureAssets.forEach((inf) => {
        const infraIcon = L.divIcon({
          className: 'infra-node-marker',
          html: `<div style="border-color:${inf.color};">${inf.icon}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([inf.coords.lat, inf.coords.lng], { icon: infraIcon });
        marker.bindPopup(`
          <div style="font-family:sans-serif;color:#0f172a;min-width:180px;">
            <b style="font-size:13px;color:${inf.color};">${inf.icon} ${inf.name}</b><br/>
            <div style="margin-top:5px;font-size:12px;line-height:1.4;">
              <b>Type:</b> ${inf.type}<br/>
              <b>Capacity / Spec:</b> ${inf.capacityOrPower}<br/>
              <b>Defense Status:</b> <span style="color:#0284c7;font-weight:bold;">${inf.threatLevel}</span><br/>
              <b>Distance to Fire Front:</b> <b style="color:#b91c1c;">${inf.distanceToFireKm} km</b>
            </div>
          </div>
        `);
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 7. POPULATION LAYER (Municipal Density & Evacuation Exposure)
    if (mapLayers.population) {
      layerData.populationCenters.forEach((pop) => {
        // Advisory Warning Buffer (15-28km)
        const warningRing = L.circle([pop.coords.lat, pop.coords.lng], {
          radius: pop.warningRadiusMeters,
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: '6, 6',
        });
        overlaysLayerRef.current?.addLayer(warningRing);

        // Immediate Evacuation Zone (5-14km)
        const alertRing = L.circle([pop.coords.lat, pop.coords.lng], {
          radius: pop.bufferRadiusMeters,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.12,
          weight: 2,
        });
        overlaysLayerRef.current?.addLayer(alertRing);

        const popIcon = L.divIcon({
          className: 'population-hub-marker',
          html: `<div>👥</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([pop.coords.lat, pop.coords.lng], { icon: popIcon });
        marker.bindTooltip(
          `👥 <b>${pop.name}</b><br/>Population at Risk: <b style="color:#38bdf8;">${pop.population}</b><br/>Evacuation Status: <b style="color:#ef4444;">${pop.evacuationStatus}</b>`,
          { className: 'real-layer-tooltip' }
        );
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 8. PROTECTED HABITATS LAYER (IUCN Red List Biospheres & National Parks)
    if (mapLayers.habitats) {
      layerData.protectedHabitats.forEach((hab) => {
        const poly = L.polygon(hab.boundaryPolygon, {
          color: '#10b981',
          fillColor: '#059669',
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '4, 4',
        });

        const speciesListHtml = hab.endangeredSpecies
          .map((s) => `• <b>${s.name}</b> (${s.status}) - ${s.threat}`)
          .join('<br/>');

        poly.bindPopup(`
          <div style="font-family:sans-serif;color:#0f172a;min-width:220px;">
            <b style="font-size:13px;color:#059669;">🛡️ ${hab.name}</b><br/>
            <div style="margin-top:5px;font-size:12px;line-height:1.4;">
              <b>IUCN Designation:</b> ${hab.iucnCategory}<br/>
              <b>Area:</b> ${hab.areaHa}<br/><br/>
              <b style="color:#b91c1c;">Endangered Species in Fire Corridor:</b><br/>
              ${speciesListHtml}
            </div>
          </div>
        `);
        overlaysLayerRef.current?.addLayer(poly);

        const habitatCenterIcon = L.divIcon({
          className: 'habitat-center-marker',
          html: `<div>🛡️</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const centerMarker = L.marker([hab.center.lat, hab.center.lng], { icon: habitatCenterIcon });
        centerMarker.bindTooltip(`🛡️ <b>${hab.name}</b><br/>IUCN Protected Zone (${hab.areaHa})`, {
          className: 'real-layer-tooltip',
        });
        markersLayerRef.current?.addLayer(centerMarker);
      });
    }

    // 9. EVACUATION ROUTES LAYER (Tactical Road Corridors & Assembly Centers)
    if (mapLayers.evacuation && layerData.evacuationRoute) {
      const evac = layerData.evacuationRoute;

      // Safe Route Polyline
      const safeLine = L.polyline(evac.safeRouteCoords, {
        color: '#06b6d4',
        weight: 5,
        opacity: 0.95,
        dashArray: '10, 10',
      });
      safeLine.bindTooltip(`🏃 <b>${evac.corridorName}</b><br/><span style="color:#34d399;font-weight:bold;">OPEN & PATROLLED SAFE ROUTE</span>`, {
        className: 'real-layer-tooltip',
      });
      overlaysLayerRef.current?.addLayer(safeLine);

      // Blocked Route Polyline
      if (evac.blockedRouteCoords) {
        const blockedLine = L.polyline(evac.blockedRouteCoords, {
          color: '#ef4444',
          weight: 4,
          opacity: 0.95,
          dashArray: '6, 6',
        });
        blockedLine.bindTooltip(`⛔ <b>ROAD CLOSED:</b> ${evac.blockedReason || 'Dense smoke breach'}`, {
          className: 'real-layer-tooltip',
        });
        overlaysLayerRef.current?.addLayer(blockedLine);
      }

      // Safe Shelters
      evac.shelters.forEach((sh) => {
        const shelterIcon = L.divIcon({
          className: 'shelter-point-marker',
          html: `<span>🏁</span><span>${sh.name.split(' ')[0]} Shelter</span>`,
          iconSize: [140, 26],
          iconAnchor: [70, 13],
        });
        const marker = L.marker([sh.coords.lat, sh.coords.lng], { icon: shelterIcon });
        marker.bindPopup(`
          <div style="font-family:sans-serif;color:#0f172a;min-width:180px;">
            <b style="font-size:13px;color:#059669;">🏁 ${sh.name}</b><br/>
            <div style="margin-top:5px;font-size:12px;line-height:1.4;">
              <b>Designated Shelter Capacity:</b> <b style="color:#059669;">${sh.capacity}</b><br/>
              <b>Emergency VHF Radio:</b> ${sh.vhfFreq}<br/>
              <b>Supplies:</b> Potable Water, Triage Bedding & Filter Masks
            </div>
          </div>
        `);
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 10. BURN SCAR LAYER (Sentinel-2 / Landsat-9 NBR Post-Fire Extent)
    if (mapLayers.burnScar) {
      layerData.burnScars.forEach((bs) => {
        const poly = L.polygon(bs.polygon, {
          color: '#78350f',
          fillColor: '#451a03',
          fillOpacity: 0.45,
          weight: 2,
          dashArray: '4, 4',
        });
        poly.bindTooltip(
          `🌾 <b>${bs.name}</b><br/>Burned Extent: <b style="color:#f59e0b;">${bs.burnedHectares}</b><br/>Severity: <b>${bs.severity}</b><br/>Sentinel-2 dNBR: <b>${bs.dnbrScore}</b> (${bs.daysAgo} days ago)`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(poly);
      });
    }

    // 11. VEGETATION LAYER (Sentinel-2 NDVI Fuel Moisture Index)
    if (mapLayers.vegetation) {
      layerData.vegetationZones.forEach((veg) => {
        const isMoist = veg.type === 'dense_canopy_moisture';
        const poly = L.polygon(veg.polygon, {
          color: isMoist ? '#22c55e' : '#f59e0b',
          fillColor: isMoist ? '#15803d' : '#92400e',
          fillOpacity: isMoist ? 0.25 : 0.3,
          weight: 1.5,
          dashArray: '3, 3',
        });
        poly.bindTooltip(
          `${isMoist ? '🌿' : '🍂'} <b>${veg.name}</b><br/>NDVI Index: <b style="color:${isMoist ? '#4ade80' : '#f87171'};">${veg.ndviScore}</b> (${isMoist ? 'High Moisture Canopy' : 'Desiccated Fuel'})<br/>${veg.description}`,
          { className: 'real-layer-tooltip' }
        );
        overlaysLayerRef.current?.addLayer(poly);
      });
    }
  }, [filteredHotspots, selectedHotspot, mapLayers, currentPreset]);

  // Center Map on Selected Hotspot
  const handleSelectHotspotFromTable = (h: Hotspot) => {
    setIsInspectCardDismissed(false);
    setSelectedHotspot(h);
    if (mapInstanceRef.current && h.lat && h.lon) {
      mapInstanceRef.current.flyTo([h.lat, h.lon], 9, { duration: 1.0 });
    }
  };

  const activeFocus = !isInspectCardDismissed ? (selectedHotspot || filteredHotspots[0] || null) : null;
  const currentFRP = activeFocus ? activeFocus.frp : (filteredHotspots[0]?.frp || 185);

  // Power Math Calculations
  const biomassCombustionRate = (currentFRP * 0.41).toFixed(2);
  const carbonEmissionRate = (currentFRP * 0.82).toFixed(2);
  const energyOutputGJ = (currentFRP * 3.6).toFixed(1);
  const flameTempKelvin = Math.round(300 + currentFRP * 1.6);

  return (
    <div className={`standalone-fd-root ${lang === 'ar' ? 'rtl-dir' : 'ltr-dir'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* =========================================================================
          TOP DEDICATED NAVIGATION BAR (NO DASHBOARD CLUTTER)
          ========================================================================= */}
      <header className="sfd-top-navbar">
        <div className="sfd-brand-group">
          {/* Back to Dashboard Button */}
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="sfd-back-btn"
            title={lang === 'ar' ? 'الرجوع إلى لوحة التحكم الرئيسية' : 'Return to Master Dashboard'}
          >
            <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            <span>{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
          </button>

          {/* Home Button */}
          <button
            type="button"
            onClick={onNavigateToHome}
            className="sfd-nav-icon-btn"
            title={lang === 'ar' ? 'الصفحة الرئيسية' : 'Home Page'}
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Brand Fire Logo */}
          <div className="sfd-brand-logo">
            <span className="sfd-fire-icon">🔥</span>
            <div>
              <span className="sfd-brand-title">Fire sync</span>
              <span className="sfd-brand-sub">NASA FIRMS Active Detection</span>
            </div>
          </div>
        </div>

        {/* Center Title Badge */}
        <div className="sfd-header-title-box">
          <h1 className="sfd-main-title">
            <span className="text-[#ff4d15]">2.</span>
            {lang === 'ar' ? 'رصد وتحري الحرائق الفضائي' : 'Fire Detection'}
            <span className="sfd-title-sub">
              {lang === 'ar' ? '(منظومة Fire sync للبؤر النشطة)' : '(Active Fire sync)'}
            </span>
          </h1>
        </div>

        {/* Right Badges & Language Switcher */}
        <div className="sfd-header-actions">
          {/* Backend Status Badge */}
          {isBackendLive ? (
            <span className="sfd-badge-live" title="FastAPI Backend Live: /api/v1/fires/map">
              <span className="sfd-live-dot" />
              {lang === 'ar' ? 'الباك إند متصل (FastAPI Live)' : 'Backend API Live'}
            </span>
          ) : (
            <span className="sfd-badge-offline" title="Operating with local NASA FIRMS satellite archive">
              <span className="sfd-live-dot" />
              {lang === 'ar' ? 'أرشيف ناسا الفضائي (FIRMS Archive)' : 'NASA FIRMS Archive'}
            </span>
          )}

          {/* Sync Refresh Button */}
          <button
            type="button"
            onClick={loadHotspots}
            title={lang === 'ar' ? 'تحديث وتزامن البيانات' : 'Sync Active Feed'}
            className={`sfd-nav-icon-btn ${isRefreshing ? 'animate-spin text-sky-400' : ''}`}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <div className="sfd-lang-switch">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`sfd-lang-btn ${lang === 'en' ? 'active' : ''}`}
            >
              EN
            </button>
            <span className="sfd-lang-sep">|</span>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`sfd-lang-btn ${lang === 'ar' ? 'active' : ''}`}
            >
              العربية
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          TOP CONTROL FILTER BAR (Search, Mirap, Measurements, y-lines, Intelligence)
          ========================================================================= */}
      <div className="sfd-toolbar">
        <div className="sfd-toolbar-left">
          {/* Real-time Search Box */}
          <div className="sfd-search-box">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث عن بؤرة بالاسم أو المعرف...' : 'Search fire by name, ID, FRP...'}
              className="sfd-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tab 1: Mirap (Real Satellite Map) */}
          <button
            type="button"
            onClick={() => setActiveTab('Mirap')}
            className={`sfd-tab-btn ${activeTab === 'Mirap' ? 'active' : 'inactive'}`}
          >
            {lang === 'ar' ? 'الخريطة الفضائية (Mirap)' : 'Mirap'}
          </button>

          {/* Tab 2: Measurements Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMeasurementsMenu(!showMeasurementsMenu)}
              className={`sfd-tab-btn flex items-center gap-1.5 ${activeTab === 'Measurements' ? 'active' : 'inactive'}`}
            >
              <span>{lang === 'ar' ? 'القياسات' : 'Measurements'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showMeasurementsMenu && (
              <div className="sfd-dropdown-popup">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Measurements');
                    setShowMeasurementsMenu(false);
                  }}
                  className="sfd-dropdown-item"
                >
                  Fire Radiative Power (MW)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Measurements');
                    setShowMeasurementsMenu(false);
                  }}
                  className="sfd-dropdown-item"
                >
                  Thermal Brightness (Kelvin)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Measurements');
                    setShowMeasurementsMenu(false);
                  }}
                  className="sfd-dropdown-item"
                >
                  Acreage Spread (Acres)
                </button>
              </div>
            )}
          </div>

          {/* Tab 3: Fire y-lines */}
          <button
            type="button"
            onClick={() => setActiveTab('Fire y-lines')}
            className={`sfd-tab-btn ${activeTab === 'Fire y-lines' ? 'active' : 'inactive'}`}
          >
            {lang === 'ar' ? 'خطوط الانتشار (y-lines)' : 'Fire y-lines'}
          </button>

          {/* Tab 4: Intelligence */}
          <button
            type="button"
            onClick={() => setActiveTab('Intelligence')}
            className={`sfd-tab-btn ${activeTab === 'Intelligence' ? 'active' : 'inactive'}`}
          >
            {lang === 'ar' ? 'الذكاء التحليلي' : 'Intelligence'}
          </button>
        </div>

        {/* Right Telemetry Window */}
        <div className="sfd-toolbar-right">
          <div className="sfd-telemetry-chip">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Pass: 23.05 UTC</span>
          </div>

          <div className="sfd-telemetry-chip">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Solar: 1020 W/m²</span>
          </div>

          <div className="sfd-telemetry-chip font-mono">
            <span>20.04.2024</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN 3-COLUMN WORKSPACE
          Column 1 (Left): Region Selection & 11 Map Layers (MATCHING USER SCREENSHOT)
          Column 2 (Center): REAL LEAFLET SATELLITE MAP
          Column 3 (Right): Dilga Status Table & Aerial Drone Stream
          ========================================================================= */}
      <main className="sfd-main-grid">
        {/* -----------------------------------------------------------------------
            COLUMN 1 (LEFT): REGION SELECTION & MAP LAYERS (SCREENSHOT ACCURATE)
            ----------------------------------------------------------------------- */}
        <aside className="sfd-sidebar-card">
          {/* Header */}
          <h2 className="sfd-sidebar-title">
            {lang === 'ar' ? 'تحديد المنطقة' : 'Region Selection'}
          </h2>

          {/* Predefined / Custom Segmented Control */}
          <div className="sfd-segmented-control">
            <button
              type="button"
              onClick={() => setSelectionMode('predefined')}
              className={`sfd-seg-btn ${selectionMode === 'predefined' ? 'active' : ''}`}
            >
              {lang === 'ar' ? 'محدد مسبقاً' : 'Predefined'}
            </button>
            <button
              type="button"
              onClick={() => setSelectionMode('custom')}
              className={`sfd-seg-btn ${selectionMode === 'custom' ? 'active' : ''}`}
            >
              {lang === 'ar' ? 'مخصص' : 'Custom'}
            </button>
          </div>

          {/* Country Selector Dropdown */}
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              className="sfd-country-dropdown-btn"
            >
              <div className="flex items-center gap-2">
                <span>{currentPreset.flag}</span>
                <span className="font-bold text-xs">{currentPreset.countryCode}</span>
                <span className="font-semibold text-sm text-slate-100">
                  {lang === 'ar' ? currentPreset.nameAr : currentPreset.nameEn}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {countryDropdownOpen && (
              <div className="sfd-country-dropdown-menu">
                {REGION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegionId(p.id);
                      setCountryDropdownOpen(false);
                    }}
                    className={`sfd-country-option ${p.id === selectedRegionId ? 'active' : ''}`}
                  >
                    <span>{p.flag}</span>
                    <span className="font-bold text-xs text-sky-400">{p.countryCode}</span>
                    <span className="flex-1 text-start">{lang === 'ar' ? p.nameAr : p.nameEn}</span>
                    {p.id === selectedRegionId && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Real Satellite Thumbnail Preview Box with Badge */}
          <div className="sfd-satellite-preview-box">
            <div className="sfd-satellite-preview-badge">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>REAL SATELLITE</span>
            </div>
            <img
              src={currentPreset.previewImg}
              alt="Real Satellite Earth Preview"
              className="sfd-satellite-preview-img"
            />
          </div>

          {/* Radio Selection List */}
          <div className="sfd-radio-list">
            {REGION_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedRegionId;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedRegionId(preset.id)}
                  className={`sfd-radio-item ${isSelected ? 'selected' : ''}`}
                >
                  <div className={`sfd-radio-dot ${isSelected ? 'active' : ''}`} />
                  <span className="sfd-radio-code font-bold text-xs">{preset.countryCode}</span>
                  <span className="sfd-radio-label font-medium text-xs flex-1">
                    {lang === 'ar' ? preset.nameAr : preset.nameEn}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="sfd-sidebar-divider" />

          {/* Map Layers Section Header */}
          <h3 className="sfd-layers-title">
            {lang === 'ar' ? 'طبقات الخريطة' : 'Map Layers'}
          </h3>

          {/* 11 Checkbox Map Layers matching the screenshot exactly */}
          <div className="sfd-checkbox-layers-list">
            {/* 1. Active Fires */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.activeFires}
                onChange={() => toggleLayer('activeFires')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">🔥</span>
              <span className="sfd-layer-name">Active Fires (VIIRS / MODIS)</span>
              <span className="sfd-layer-count-chip">{filteredHotspots.length}</span>
            </label>

            {/* 2. Fire Risk (Prediction) */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.fireRisk}
                onChange={() => toggleLayer('fireRisk')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">🔥</span>
              <span className="sfd-layer-name">Fire Risk (Prediction)</span>
            </label>

            {/* 3. Weather (Wind, Temp, Humidity) */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.weather}
                onChange={() => toggleLayer('weather')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">⛅</span>
              <span className="sfd-layer-name">Weather (Wind, Temp, Humidity)</span>
            </label>

            {/* 4. Wind Overlay */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.windOverlay}
                onChange={() => toggleLayer('windOverlay')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">💨</span>
              <span className="sfd-layer-name">Wind Overlay</span>
            </label>

            {/* 5. Smoke (Sentinel-5P) */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.smoke}
                onChange={() => toggleLayer('smoke')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">☁️</span>
              <span className="sfd-layer-name">Smoke (Sentinel-5P)</span>
            </label>

            {/* 6. Infrastructure (OSM) */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.infrastructure}
                onChange={() => toggleLayer('infrastructure')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">🏢</span>
              <span className="sfd-layer-name">Infrastructure (OSM)</span>
            </label>

            {/* 7. Population */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.population}
                onChange={() => toggleLayer('population')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">👥</span>
              <span className="sfd-layer-name">Population</span>
            </label>

            {/* 8. Protected Habitats (IUCN) */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.habitats}
                onChange={() => toggleLayer('habitats')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">🛡️</span>
              <span className="sfd-layer-name">Protected Habitats (IUCN)</span>
            </label>

            {/* 9. Evacuation Routes */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.evacuation}
                onChange={() => toggleLayer('evacuation')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">🏃</span>
              <span className="sfd-layer-name">Evacuation Routes</span>
            </label>

            {/* 10. Burn Scar (Post-Fire) */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.burnScar}
                onChange={() => toggleLayer('burnScar')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">🌾</span>
              <span className="sfd-layer-name">Burn Scar (Post-Fire)</span>
            </label>

            {/* 11. Vegetation (NDVI) */}
            <label className="sfd-checkbox-layer">
              <input
                type="checkbox"
                checked={mapLayers.vegetation}
                onChange={() => toggleLayer('vegetation')}
                className="sfd-checkbox-input"
              />
              <span className="sfd-layer-emoji">🌿</span>
              <span className="sfd-layer-name">Vegetation (NDVI)</span>
            </label>
          </div>
        </aside>

        {/* -----------------------------------------------------------------------
            COLUMN 2 (CENTER): REAL INTERACTIVE LEAFLET SATELLITE MAP
            ----------------------------------------------------------------------- */}
        <section className={`sfd-map-wrapper ${isMapFullscreen ? 'fullscreen-mode' : ''}`}>
          {/* Leaflet Map DOM Container */}
          <div ref={mapContainerRef} className="sfd-leaflet-map-container" />

          {/* Floating Top-Left HUD Controls */}
          <div className="sfd-map-hud-controls">
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
              }}
              title="Zoom In"
              className="sfd-hud-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
              }}
              title="Zoom Out"
              className="sfd-hud-btn"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo(currentPreset.center, currentPreset.zoom);
                }
              }}
              title="Reset View to Region Center"
              className="sfd-hud-btn"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Top-Right Basemap Switcher & Fullscreen */}
          <div className="sfd-map-hud-top-right">
            <div className="sfd-basemap-pill-bar">
              <button
                type="button"
                onClick={() => setBasemapStyle('satellite')}
                className={`sfd-basemap-btn ${basemapStyle === 'satellite' ? 'active' : ''}`}
              >
                🛰️ Sat
              </button>
              <button
                type="button"
                onClick={() => setBasemapStyle('dark')}
                className={`sfd-basemap-btn ${basemapStyle === 'dark' ? 'active' : ''}`}
              >
                🌑 Dark
              </button>
              <button
                type="button"
                onClick={() => setBasemapStyle('terrain')}
                className={`sfd-basemap-btn ${basemapStyle === 'terrain' ? 'active' : ''}`}
              >
                🗺️ Terr
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              title="Toggle Map Fullscreen"
              className="sfd-hud-btn"
            >
              {isMapFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Hotspot Inspection Popup Card */}
          {activeFocus && (
            <div className="sfd-inspect-floating-card">
              <div className="sfd-inspect-card-header">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="font-bold text-xs text-white truncate max-w-[210px]">
                    {activeFocus.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsInspectCardDismissed(true);
                    setSelectedHotspot(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                  title={lang === 'ar' ? 'إغلاق المربع' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="sfd-stat-tile">
                  <span className="sfd-stat-tile-label">FRP</span>
                  <span className="sfd-stat-tile-val text-red-400 font-bold">{activeFocus.frp} MW</span>
                </div>
                <div className="sfd-stat-tile">
                  <span className="sfd-stat-tile-label">Brightness Temp</span>
                  <span className="sfd-stat-tile-val text-amber-300 font-bold">
                    {activeFocus.tempK || Math.round(300 + activeFocus.frp * 1.5)} K
                  </span>
                </div>
                <div className="sfd-stat-tile">
                  <span className="sfd-stat-tile-label">Confidence</span>
                  <span className="sfd-stat-tile-val text-emerald-400 font-bold">{activeFocus.confidence}%</span>
                </div>
                <div className="sfd-stat-tile">
                  <span className="sfd-stat-tile-label">Radiometer</span>
                  <span className="sfd-stat-tile-val text-sky-400 font-bold">{activeFocus.satellite}</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/50 pt-1.5">
                <span>Lat: {activeFocus.lat.toFixed(4)}, Lon: {activeFocus.lon.toFixed(4)}</span>
                <span className="text-sky-400 font-mono">{activeFocus.timeDetected}</span>
              </div>
            </div>
          )}
        </section>

        {/* -----------------------------------------------------------------------
            COLUMN 3 (RIGHT): DILGA STATUS TABLE & DRONE STREAM
            ----------------------------------------------------------------------- */}
        <aside className="sfd-right-sidebar">
          {/* Card 1: Dilga Status Table */}
          <div className="sfd-dilga-card">
            <div className="sfd-dilga-header">
              <div className="flex items-center gap-2">
                <span className="text-base">🔥</span>
                <h3 className="font-bold text-white text-sm">Dilga Status</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{filteredHotspots.length} Records</span>
            </div>

            <div className="sfd-table-scroll">
              <table className="sfd-dilga-table">
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
                    const dateFmt = r.dateDetected ? r.dateDetected.replace(/-/g, '.') : '20.04.2024';
                    const isCrit = r.frp >= 150;

                    return (
                      <tr
                        key={r.id || i}
                        onClick={() => handleSelectHotspotFromTable(r)}
                        className={isSelected ? 'selected' : ''}
                      >
                        <td className="font-mono text-slate-300">{dateFmt}</td>
                        <td className="font-mono text-slate-300">{r.timeDetected ? r.timeDetected.slice(0, 5) : '13:49'}</td>
                        <td className="font-mono text-slate-300">{r.satellite === 'VIIRS' ? '375m' : '1000m'}</td>
                        <td className="font-mono text-amber-400 font-bold">{r.frp} MW</td>
                        <td style={{ textAlign: 'end' }}>
                          <span className={`sfd-status-pill ${isCrit ? 'critical' : 'high'}`}>
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
          <div className="sfd-drone-card">
            {droneMode === 'video' ? (
              <video
                ref={videoRef}
                src="/video1.mp4"
                autoPlay
                loop
                muted={droneMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/assets/extracted/drone_live.jpg"
                alt="Live Drone Thermal Capture"
                className="w-full h-full object-cover"
              />
            )}

            {/* Military Drone HUD Overlay */}
            <div className="sfd-drone-hud">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>● LIVE REC</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[10px]">
                  <span>ALT: 1,240m</span>
                  <span>BAT: 84%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-amber-400 font-bold text-[11px]">
                  FLIR IR: {Math.round(currentFRP * 2.1)}°C PEAK
                </div>

                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm p-1 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setDronePlaying(!dronePlaying)}
                    className="p-1 hover:text-sky-400 transition-colors"
                  >
                    {dronePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDroneMuted(!droneMuted)}
                    className="p-1 hover:text-sky-400 transition-colors"
                  >
                    {droneMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDroneMode(droneMode === 'video' ? 'still' : 'video')}
                    className="px-1.5 py-0.5 text-[9px] rounded bg-white/10 hover:bg-white/20"
                  >
                    {droneMode === 'video' ? 'IR Still' : 'Live Stream'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* =========================================================================
          BOTTOM CARDS: FIRE RADIATIVE POWER SCALE & INTENSE POWER MATH
          ========================================================================= */}
      <footer className="sfd-bottom-grid">
        {/* Bottom Left Card: Fire Radiative Power (MW) */}
        <div className="sfd-bottom-card sfd-frp-card">
          <h3 className="sfd-card-heading">
            {lang === 'ar' ? 'الطاقة الإشعاعية للنار (FRP MW)' : 'Fire Radiative Power (MW)'}
          </h3>

          <div className="mt-2">
            {/* Multi-stop Gradient Track */}
            <div className="sfd-gradient-track">
              {/* Dynamic pointer needle for current FRP */}
              <div
                className="sfd-pointer-needle"
                style={{
                  left: `${Math.min(100, Math.max(0, (currentFRP / 200) * 100))}%`,
                }}
              />
            </div>

            {/* Scale markings: 00 - 100 - 200+ */}
            <div className="sfd-scale-labels">
              <span>00</span>
              <span className="text-center">100</span>
              <span>200+ MW</span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50 text-xs">
              <span className="text-slate-300">
                {lang === 'ar' ? 'القوة الإشعاعية الحالية:' : 'Current Hotspot Intensity:'}
              </span>
              <span className="text-amber-400 font-mono font-extrabold text-base">
                {currentFRP.toFixed(1)} MW
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Right Card: Fire Intense Power Math */}
        <div className="sfd-bottom-card sfd-math-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="sfd-card-heading">
              {lang === 'ar' ? 'الحسابات الطيفية والانبعاث الحراري' : 'Fire Intense Power Math'}
            </h3>
            <span className="text-xs text-sky-400 font-mono">$FRE = \int FRP(t) dt$</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Model Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="sfd-selector-pill"
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
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showModelMenu && (
                <div className="sfd-dropdown-popup bottom-full mb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAlgorithmModel('VNP14IMG');
                      setShowModelMenu(false);
                    }}
                    className="sfd-dropdown-item"
                  >
                    VNP14IMG 375m High-Res Active
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAlgorithmModel('MOD14');
                      setShowModelMenu(false);
                    }}
                    className="sfd-dropdown-item"
                  >
                    MOD14 / MYD14 Thermal Anomaly
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAlgorithmModel('GOES16');
                      setShowModelMenu(false);
                    }}
                    className="sfd-dropdown-item"
                  >
                    GOES-16 ABI Instantaneous FRP
                  </button>
                </div>
              )}
            </div>

            {/* Metric Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMetricMenu(!showMetricMenu)}
                className="sfd-selector-pill"
              >
                <span className="font-semibold text-xs">
                  {metricUnit === 'MW'
                    ? 'Megawatts (MW)'
                    : metricUnit === 'GJ'
                    ? 'Gigajoules (GJ/hr)'
                    : metricUnit === 'biomass'
                    ? 'Biomass Rate (kg/s)'
                    : 'CO2 Emission (kg/s)'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showMetricMenu && (
                <div className="sfd-dropdown-popup bottom-full mb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('MW');
                      setShowMetricMenu(false);
                    }}
                    className="sfd-dropdown-item"
                  >
                    Megawatts (MW) - Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('GJ');
                      setShowMetricMenu(false);
                    }}
                    className="sfd-dropdown-item"
                  >
                    Gigajoules (GJ) - Cumulative
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('biomass');
                      setShowMetricMenu(false);
                    }}
                    className="sfd-dropdown-item"
                  >
                    Biomass Combustion Rate (kg/s)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetricUnit('co2');
                      setShowMetricMenu(false);
                    }}
                    className="sfd-dropdown-item"
                  >
                    Carbon Dioxide Release (kg/s)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Math Output Grid */}
          <div className="sfd-math-stats-grid">
            <div className="sfd-math-stat-box">
              <span className="sfd-math-stat-label">{lang === 'ar' ? 'حرق الكتلة الحيوية' : 'Biomass Rate'}</span>
              <span className="sfd-math-stat-val text-sky-400">{biomassCombustionRate} kg/s</span>
            </div>
            <div className="sfd-math-stat-box">
              <span className="sfd-math-stat-label">{lang === 'ar' ? 'انبعاث CO₂' : 'CO₂ Emission'}</span>
              <span className="sfd-math-stat-val text-amber-400">{carbonEmissionRate} kg/s</span>
            </div>
            <div className="sfd-math-stat-box">
              <span className="sfd-math-stat-label">{lang === 'ar' ? 'الطاقة الحرارية' : 'Thermal Output'}</span>
              <span className="sfd-math-stat-val text-emerald-400">{energyOutputGJ} GJ/h</span>
            </div>
            <div className="sfd-math-stat-box">
              <span className="sfd-math-stat-label">{lang === 'ar' ? 'حرارة اللهب' : 'Flame Temp'}</span>
              <span className="sfd-math-stat-val text-red-400">{flameTempKelvin} K</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
