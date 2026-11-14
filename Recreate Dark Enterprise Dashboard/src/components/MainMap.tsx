import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  type Hotspot,
  type TacticalAircraft,
  TRANSLATIONS,
} from '../data/wildfireData';
import {
  FireService,
  FleetService,
  WeatherService,
  InfrastructureService,
  RoutingService,
  SmokeService,
  BiodiversityService,
  RegionService,
  calculateDistanceKm,
  calculatePolygonAreaHa,
  calculateSpreadEllipses,
  type LatLngPoint,
  type CriticalAsset,
  type EvacuationPlan,
  type SmokeDispersionModel,
  type ProtectedSanctuary,
  type RegionalWeatherData,
} from '../services';
import medMapImg from '../assets/crops/med_map.png';
import recoveryMapImg from '../assets/crops/recovery_map.png';

interface MainMapProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  onSelectRegion?: (region: string) => void;
  layers: boolean[]; // 11 layers
  selectedYear: number;
  selectedDate: string | null;
  activePolygon: LatLngPoint[] | null;
  onPolygonChange: (poly: LatLngPoint[] | null) => void;
  selectedHotspot: Hotspot | null;
  setSelectedHotspot: (h: Hotspot | null) => void;
  colorblindMode: boolean;
  lowBandwidth: boolean;
  modis: boolean;
  viirs: boolean;
  resolutionNorm: boolean;
  targetLocation?: { lat: number; lng: number; zoom?: number; name?: string } | null;
}

// High-Resolution Basemap Tile Providers (Real Satellite, Terrain, Streets & Dark)
const BASEMAP_TILES = {
  satellite: {
    id: 'satellite',
    name: 'Google Satellite Hybrid (Real Earth & Labels)',
    nameAr: 'أقمار صناعية حقيقية (Google Hybrid)',
    badge: 'SAT',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite Imagery &copy; Maxar',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
  esri: {
    id: 'esri',
    name: 'Esri World Imagery (NASA Satellite)',
    nameAr: 'تصوير فضائي عالي الدقة (Esri NASA)',
    badge: 'ESRI',
    icon: '🪐',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
    subdomains: ['server', 'services'],
    maxZoom: 19,
  },
  terrain: {
    id: 'terrain',
    name: 'Topographic Relief & Mountain Elevation',
    nameAr: 'تضاريس وطبوغرافيا حقيقية',
    badge: 'TERR',
    icon: '🏔️',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Terrain',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 18,
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap (Streets, Highways & Cities)',
    nameAr: 'خريطة الشوارع والمدن (OpenStreetMap)',
    badge: 'OSM',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  dark: {
    id: 'dark',
    name: 'Tactical SOC Dark (Night Operations)',
    nameAr: 'خريطة ليلية تكتيكية',
    badge: 'DARK',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 19,
  },
};

export type BasemapKey = keyof typeof BASEMAP_TILES;

export const MainMap: React.FC<MainMapProps> = ({
  lang,
  selectedRegion,
  onSelectRegion,
  layers,
  selectedYear,
  selectedDate,
  activePolygon,
  onPolygonChange,
  selectedHotspot,
  setSelectedHotspot,
  colorblindMode,
  lowBandwidth,
  modis,
  viirs,
  resolutionNorm,
  targetLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Dedicated Leaflet Layer Groups for the 11 System Layers + Interactive Sector Boundaries
  const layerGroups = useRef({
    regionSectors: L.layerGroup(),  // Tactical Clickable Sector Zones
    hotspots: L.layerGroup(),       // 0: Active Fires
    fireRisk: L.layerGroup(),       // 1: Fire Risk
    weatherPins: L.layerGroup(),    // 2: Weather Stations
    smokePlume: L.layerGroup(),     // 4: Smoke Plume
    infrastructure: L.layerGroup(), // 5: Infrastructure (Hospitals, Substations, Schools)
    population: L.layerGroup(),     // 6: Population Density
    habitats: L.layerGroup(),       // 7: Protected Habitats (IUCN)
    evacuation: L.layerGroup(),     // 8: Evacuation Routes & Assembly Points
    burnScar: L.layerGroup(),       // 9: Burn Scar
    vegetation: L.layerGroup(),     // 10: Vegetation / NDVI
    fleet: L.layerGroup(),          // Tactical Aircraft Fleet
    spreadVectors: L.layerGroup(),  // Rothermel Isochrones (+3h, +6h, +12h)
    measurement: L.layerGroup(),    // GIS Ruler & Polygon Drawing
  });

  // State - Real Satellite by default
  const [activeBasemap, setActiveBasemap] = useState<BasemapKey>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<TacticalAircraft | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);

  // Data from decoupled services
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [weather, setWeather] = useState<RegionalWeatherData | null>(null);
  const [infraAssets, setInfraAssets] = useState<CriticalAsset[]>([]);
  const [evacPlan, setEvacPlan] = useState<EvacuationPlan | null>(null);
  const [smokePlume, setSmokePlume] = useState<SmokeDispersionModel | null>(null);
  const [sanctuary, setSanctuary] = useState<ProtectedSanctuary | null>(null);
  const [fleet, setFleet] = useState<TacticalAircraft[]>([]);

  // GIS Tool States
  const [activeGISTool, setActiveGISTool] = useState<'none' | 'ruler' | 'polygon' | 'split'>('none');
  const [measurePoints, setMeasurePoints] = useState<LatLngPoint[]>([]);
  const [polygonDraftPoints, setPolygonDraftPoints] = useState<LatLngPoint[]>([]);
  const [measuredDistanceMeters, setMeasuredDistanceMeters] = useState<number | null>(null);
  const [measuredAreaHa, setMeasuredAreaHa] = useState<number | null>(null);
  const [measuredAreaKm2, setMeasuredAreaKm2] = useState<number | null>(null);

  // Polygon Analysis Stats
  const [polygonStats, setPolygonStats] = useState<{
    areaKm2: number;
    areaHa: number;
    firesCount: number;
    highRiskCount: number;
    population: number;
    hospitalsCount: number;
    infraCount: number;
  } | null>(null);

  // Layer Opacities (0-100)
  const [showOpacityControl, setShowOpacityControl] = useState(false);
  const [baseTileOpacity, setBaseTileOpacity] = useState(100);
  const [smokeOpacity, setSmokeOpacity] = useState(75);
  const [riskOpacity, setRiskOpacity] = useState(70);
  const [ndviOpacity, setNdviOpacity] = useState(65);

  // Split View Slider (0-100%)
  const [mainSplitPos, setMainSplitPos] = useState(50);
  const [isDraggingMainSplit, setIsDraggingMainSplit] = useState(false);

  // Calculator Popover
  const [showSuppressionCalc, setShowSuppressionCalc] = useState(false);
  const [waterDropStatus, setWaterDropStatus] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // 1. Fetch data from services whenever Region, Polygon, Year, Sensors, or Resolution Norm changes
  useEffect(() => {
    const sensors: ('VIIRS' | 'MODIS')[] = [];
    if (viirs) sensors.push('VIIRS');
    if (modis) sensors.push('MODIS');

    FireService.getActiveFires({
      region: selectedRegion,
      polygon: activePolygon || undefined,
      year: selectedYear,
      sensors,
      applyResolutionNormalization: resolutionNorm,
    }).then((fires) => {
      // If a specific calendar date is selected, filter to that date
      if (selectedDate) {
        const exact = fires.filter((f) => f.dateDetected === selectedDate);
        if (exact.length > 0) {
          setHotspots(exact);
        } else {
          const ym = selectedDate.slice(0, 7);
          const monthFires = fires.filter((f) => f.dateDetected && f.dateDetected.startsWith(ym));
          setHotspots(monthFires.length > 0 ? monthFires : fires);
        }
      } else {
        setHotspots(fires);
      }
    });

    WeatherService.getRegionalWeather(selectedRegion).then((w) => {
      setWeather(w);
      // Update smoke plume model according to region weather
      const primaryFire = selectedHotspot || { frp: 310 };
      const plume = SmokeService.getPlumeModel(
        selectedRegion,
        primaryFire.frp,
        w.windSpeedKmh,
        w.windDirectionDeg
      );
      setSmokePlume(plume);
    });

    setInfraAssets(InfrastructureService.getRegionalAssets(selectedRegion));
    setEvacPlan(RoutingService.getEvacuationPlan(selectedRegion));
    setSanctuary(BiodiversityService.getRegionalSanctuary(selectedRegion));
    setFleet(FleetService.getActiveFleet());
  }, [selectedRegion, activePolygon, selectedYear, selectedDate, modis, viirs, resolutionNorm, selectedHotspot]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const reg = RegionService.getRegionById(selectedRegion);
    const initCenter: [number, number] = [reg.center.lat, reg.center.lng];
    const initZoom = reg.defaultZoom;

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center: initCenter,
        zoom: initZoom,
        zoomControl: false,
        attributionControl: true,
        minZoom: 3,
        maxZoom: 20,
      });
    } catch (e) {
      console.warn('MainMap init caught:', e);
      return;
    }

    // Add Base Tile Layer
    const currentBase = BASEMAP_TILES[lowBandwidth ? 'dark' : activeBasemap] || BASEMAP_TILES.satellite;
    const tileLayer = L.tileLayer(currentBase.url, {
      attribution: currentBase.attribution,
      maxZoom: currentBase.maxZoom,
      subdomains: currentBase.subdomains,
      opacity: baseTileOpacity / 100,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Track live cursor coordinates for HUD
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Add Metric Scale Bar
    L.control
      .scale({
        imperial: false,
        position: 'bottomright',
        maxWidth: 140,
      })
      .addTo(map);

    // Attach all 11 layer groups
    Object.values(layerGroups.current).forEach((grp) => grp.addTo(map));

    // Guarantee full sizing without grey tile gaps
    const timer1 = setTimeout(() => map.invalidateSize(), 80);
    const timer2 = setTimeout(() => map.invalidateSize(), 300);
    const timer3 = setTimeout(() => map.invalidateSize(), 1000);

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Basemap & Opacity Sync
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const currentBase = BASEMAP_TILES[lowBandwidth ? 'dark' : activeBasemap] || BASEMAP_TILES.satellite;
    tileLayerRef.current.setUrl(currentBase.url);
    tileLayerRef.current.options.maxZoom = currentBase.maxZoom;
    tileLayerRef.current.options.subdomains = currentBase.subdomains;
    tileLayerRef.current.setOpacity(baseTileOpacity / 100);
  }, [activeBasemap, baseTileOpacity, lowBandwidth]);

  // 4. Region Panning / Flying
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const reg = RegionService.getRegionById(selectedRegion);
    mapInstanceRef.current.flyTo([reg.center.lat, reg.center.lng], reg.defaultZoom, { duration: 1.2 });
  }, [selectedRegion]);

  // ================= TACTICAL SECTOR BOUNDARIES LAYER =================
  useEffect(() => {
    const grp = layerGroups.current.regionSectors;
    grp.clearLayers();
    if (!mapInstanceRef.current) return;

    const allRegions = RegionService.getAllRegions().filter((r) => r.id !== 'global');

    allRegions.forEach((reg) => {
      const isCurrent = reg.nameEn === selectedRegion || reg.id === RegionService.getRegionById(selectedRegion).id;
      const [sw, ne] = reg.bounds;

      const bounds: L.LatLngBoundsExpression = [
        [sw.lat, sw.lng],
        [ne.lat, ne.lng],
      ];

      const rect = L.rectangle(bounds, {
        color: isCurrent ? '#00e5ff' : '#38bdf8',
        weight: isCurrent ? 2.5 : 1,
        dashArray: isCurrent ? undefined : '5, 5',
        fillColor: isCurrent ? 'rgba(0, 229, 255, 0.14)' : 'rgba(56, 189, 248, 0.03)',
        fillOpacity: isCurrent ? 0.4 : 0.12,
        interactive: true,
      });

      const tooltipContent = `
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <div style="font-weight: 700; color: #fff; margin-bottom: 2px;">
            ${reg.flag} ${lang === 'ar' ? reg.nameAr : reg.nameEn}
          </div>
          <div style="color: #94a3b8; font-size: 10px;">
            🔥 ${reg.baseActiveFires.toLocaleString()} ${lang === 'ar' ? 'حرائق' : 'active fires'} | 🌲 ${reg.baseBurnedAreaHa.toLocaleString()} ha
          </div>
          <div style="color: #38bdf8; font-size: 9px; margin-top: 3px; font-weight: 600;">
            ${lang === 'ar' ? 'انقر لتحديد القطاع وتحديث الإحصاءيات ⚡' : 'Click to select sector & update statistics ⚡'}
          </div>
        </div>
      `;

      rect.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'sector-zone-tooltip',
      });

      rect.on('click', () => {
        if (onSelectRegion) {
          onSelectRegion(reg.nameEn);
        }
        mapInstanceRef.current?.flyTo([reg.center.lat, reg.center.lng], reg.defaultZoom, { duration: 1.2 });
      });

      grp.addLayer(rect);
    });
  }, [selectedRegion, lang, onSelectRegion]);

  // 5. Target Location Flying (Search Geocoder / Hotspot click)
  useEffect(() => {
    if (!mapInstanceRef.current || !targetLocation) return;
    mapInstanceRef.current.flyTo(
      [targetLocation.lat, targetLocation.lng],
      targetLocation.zoom || 11,
      { duration: 1.6 }
    );
  }, [targetLocation]);

  // 6. Invalidate Size on Fullscreen
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // ================= LAYER 0: ACTIVE FIRES (NASA FIRMS) =================
  useEffect(() => {
    const grp = layerGroups.current.hotspots;
    grp.clearLayers();

    const isVisible = layers[0] ?? true;
    if (!isVisible || !mapInstanceRef.current) return;

    hotspots.forEach((spot) => {
      const isSelected = selectedHotspot?.id === spot.id;
      const isCritical = spot.status === 'Critical';

      const flameIcon = L.divIcon({
        className: 'leaflet-custom-flame',
        html: `
          <div class="hotspot-marker ${isSelected ? 'selected' : ''}" style="pointer-events: auto;">
            <div class="pulse-ring" style="border-color: ${colorblindMode ? '#f59e0b' : isCritical ? '#ef4444' : '#f97316'}; background: ${colorblindMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.2)'};"></div>
            <div class="flame-core" style="filter: drop-shadow(0 0 6px ${colorblindMode ? '#eab308' : '#ff3b30'});">${colorblindMode ? '▲' : '🔥'}</div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([spot.lat, spot.lon], { icon: flameIcon });
      marker.on('click', () => setSelectedHotspot(spot));

      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; color: #dce8f2;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f3d59; padding-bottom: 5px; margin-bottom: 6px;">
            <strong style="color: #fff; font-size: 12px;">${spot.name}</strong>
            <span style="background: ${isCritical ? '#dc2626' : '#ea580c'}; color: #fff; font-size: 9px; padding: 1px 6px; border-radius: 3px; font-weight: bold;">
              ${spot.status}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; margin-bottom: 8px;">
            <div>FRP: <strong style="color: #ff3b30;">${spot.frp} MW</strong></div>
            <div>Temp: <strong style="color: #ffaa00;">${spot.tempK} K</strong></div>
            <div>Sensor: <strong style="color: #38bdf8;">${spot.satellite}</strong></div>
            <div>Conf: <strong style="color: #10bd78;">${spot.confidence}%</strong></div>
          </div>
          <div style="font-size: 9px; color: #8299ad; margin-bottom: 6px;">
            Location: ${spot.lat.toFixed(3)}, ${spot.lon.toFixed(3)} | ${spot.country}<br/>
            Detected: ${spot.timeDetected} (${spot.dateDetected})
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-drop-${spot.id}" style="flex: 1; background: #148cf4; color: #fff; border: 0; padding: 5px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; cursor: pointer;">
              💧 Canadair Drop
            </button>
            <button id="btn-calc-${spot.id}" style="background: #0f2336; border: 1px solid #233e56; color: #38bdf8; padding: 5px 6px; border-radius: 4px; font-size: 9px; cursor: pointer;">
              🧮 Containment
            </button>
          </div>
          <button id="btn-focus-${spot.id}" style="width: 100%; margin-top: 5px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; padding: 4px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; cursor: pointer;">
            📊 ${lang === 'ar' ? `تركيز إحصاءيات ${spot.country}` : `Focus ${spot.country} Statistics`}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'nasa-tactical-popup',
        closeButton: false,
        offset: [0, -10],
      });

      marker.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <div style="font-weight: 700; color: #fff;">${spot.name}</div>
          <div style="color: ${isCritical ? '#ff4d4f' : '#ffaa00'}; font-size: 10px; font-weight: 600;">🔥 FRP: ${spot.frp} MW • ${spot.status} • ${spot.satellite}</div>
          <div style="color: #94a3b8; font-size: 9px;">${spot.stateOrRegion ? `${spot.stateOrRegion}, ` : ''}${spot.country} | ${spot.dateDetected || ''}</div>
        </div>
      `, { sticky: true, className: 'sector-zone-tooltip' });

      marker.on('popupopen', () => {
        const dropBtn = document.getElementById(`btn-drop-${spot.id}`);
        const calcBtn = document.getElementById(`btn-calc-${spot.id}`);
        const focusBtn = document.getElementById(`btn-focus-${spot.id}`);
        if (dropBtn) {
          dropBtn.onclick = () => {
            const plane = fleet[0];
            if (plane) {
              const res = FleetService.executeWaterDrop(plane.id, spot.frp);
              setFleet(FleetService.getActiveFleet());
              setWaterDropStatus(`Sortie dispatched! ${plane.callsign} dropped ${res.waterDeliveredLiters.toLocaleString()} L on ${spot.name}.`);
              setTimeout(() => setWaterDropStatus(null), 5000);
            }
          };
        }
        if (calcBtn) {
          calcBtn.onclick = () => {
            setSelectedHotspot(spot);
            setShowSuppressionCalc(true);
          };
        }
        if (focusBtn) {
          focusBtn.onclick = () => {
            if (onSelectRegion) {
              onSelectRegion(spot.country);
            }
          };
        }
      });

      grp.addLayer(marker);
    });
  }, [hotspots, layers, selectedHotspot, colorblindMode, fleet]);

  // ================= LAYER 1: FIRE RISK HEATMAP ZONES =================
  useEffect(() => {
    const grp = layerGroups.current.fireRisk;
    grp.clearLayers();

    const isVisible = layers[1] ?? true;
    if (!isVisible || !mapInstanceRef.current) return;

    hotspots.forEach((spot) => {
      const radiusMeters = (spot.frp / 10) * 1400;
      const circle = L.circle([spot.lat, spot.lon], {
        radius: radiusMeters,
        color: '#dc2626',
        weight: 1,
        fillColor: '#ef4444',
        fillOpacity: (riskOpacity / 100) * 0.45,
      });

      circle.bindTooltip(`<strong>Fire Risk Zone:</strong> Critical (${spot.frp} MW Thermal Core)`, {
        sticky: true,
        className: 'isochrone-tooltip',
      });

      grp.addLayer(circle);
    });
  }, [hotspots, layers, riskOpacity]);

  // ================= LAYER 2: WEATHER STATIONS =================
  useEffect(() => {
    const grp = layerGroups.current.weatherPins;
    grp.clearLayers();

    const isVisible = layers[2] ?? true;
    if (!isVisible || !weather || !mapInstanceRef.current) return;

    const reg = RegionService.getRegionById(selectedRegion);
    const coords: [number, number] = [reg.center.lat + 0.15, reg.center.lng + 0.15];

    const weatherIcon = L.divIcon({
      className: 'weather-pin-icon',
      html: `
        <div style="background: rgba(10, 27, 42, 0.95); border: 1px solid #ffaa00; border-radius: 4px; padding: 2px 6px; font-size: 9px; font-weight: bold; color: #fff; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
          🌤 ${weather.temperatureC}°C | 💨 ${weather.windSpeedKmh} km/h ${weather.windCompass}
        </div>
      `,
      iconAnchor: [45, 12],
    });

    const marker = L.marker(coords, { icon: weatherIcon });
    marker.bindPopup(`
      <div style="color: #fff; font-size: 11px;">
        <strong>${weather.stationName}</strong><br/>
        Temperature: <b>${weather.temperatureC}°C</b><br/>
        Relative Humidity: <b>${weather.relativeHumidityPct}%</b><br/>
        Wind: <b>${weather.windSpeedKmh} km/h (${weather.windCompass})</b><br/>
        Drought KBDI: <b>${weather.droughtIndexKBDI} / 800</b>
      </div>
    `, { className: 'nasa-tactical-popup' });

    grp.addLayer(marker);
  }, [layers, weather, selectedRegion]);

  // ================= LAYER 4: SENTINEL-5P SMOKE PLUME =================
  useEffect(() => {
    const grp = layerGroups.current.smokePlume;
    grp.clearLayers();

    const isVisible = layers[4] ?? true;
    if (!isVisible || !smokePlume || smokeOpacity <= 0 || !mapInstanceRef.current) return;

    const latLngs = smokePlume.plumePolygonCoordinates.map((p) => [p.lat, p.lng] as [number, number]);
    const plumePolygon = L.polygon(latLngs, {
      color: '#a855f7',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#9333ea',
      fillOpacity: (smokeOpacity / 100) * 0.4,
    });

    plumePolygon.bindTooltip(`
      <strong>Sentinel-5P Smoke Plume</strong><br/>
      AQI: ${smokePlume.aqi} (${smokePlume.category})<br/>
      PM2.5: ${smokePlume.pm25UgM3} µg/m³<br/>
      Dispersing towards: ${smokePlume.plumeCompass}
    `, { sticky: true, className: 'isochrone-tooltip' });

    grp.addLayer(plumePolygon);
  }, [layers, smokePlume, smokeOpacity]);

  // ================= LAYER 5: CRITICAL INFRASTRUCTURE =================
  useEffect(() => {
    const grp = layerGroups.current.infrastructure;
    grp.clearLayers();

    const isVisible = layers[5] ?? true;
    if (!isVisible || !mapInstanceRef.current) return;

    infraAssets.forEach((asset) => {
      const iconSymbol =
        asset.type === 'Hospital' ? '🏥' :
        asset.type === 'Substation' ? '⚡' :
        asset.type === 'School' ? '🏫' :
        asset.type === 'Gas Pipeline' ? '⛽' : '🏙️';

      const assetIcon = L.divIcon({
        className: 'infra-marker-icon',
        html: `
          <div style="background: rgba(13, 34, 53, 0.95); border: 1px solid #38bdf8; border-radius: 50%; width: 24px; height: 24px; display: grid; place-items: center; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
            ${iconSymbol}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([asset.coords.lat, asset.coords.lng], { icon: assetIcon });
      marker.bindPopup(`
        <div style="color: #fff; font-size: 11px;">
          <strong style="color: #38bdf8;">${iconSymbol} ${asset.name}</strong><br/>
          Type: <b>${asset.type}</b><br/>
          Capacity: ${asset.nominalCapacityOrPop}<br/>
          Threat Level: <b style="color: ${asset.threatLevel === 'Immediate' ? '#ef4444' : '#eab308'};">${asset.threatLevel}</b>
        </div>
      `, { className: 'nasa-tactical-popup' });

      grp.addLayer(marker);
    });
  }, [layers, infraAssets]);

  // ================= LAYER 6: POPULATION DENSITY =================
  useEffect(() => {
    const grp = layerGroups.current.population;
    grp.clearLayers();

    const isVisible = layers[6] ?? true;
    if (!isVisible || !mapInstanceRef.current) return;

    const reg = RegionService.getRegionById(selectedRegion);
    const center: [number, number] = [reg.center.lat, reg.center.lng];

    const popCircle = L.circle(center, {
      radius: 18000,
      color: '#c084fc',
      weight: 1,
      dashArray: '3, 3',
      fillColor: 'rgba(192, 132, 252, 0.25)',
      fillOpacity: 0.5,
    });

    popCircle.bindTooltip(`<strong>Dense Population Zone:</strong> ~42,000 residents within buffer`, {
      sticky: true,
      className: 'isochrone-tooltip',
    });

    grp.addLayer(popCircle);
  }, [layers, selectedRegion]);

  // ================= LAYER 7: PROTECTED HABITATS (IUCN) =================
  useEffect(() => {
    const grp = layerGroups.current.habitats;
    grp.clearLayers();

    const isVisible = layers[7] ?? true;
    if (!isVisible || !sanctuary || !mapInstanceRef.current) return;

    const latLngs = sanctuary.boundaryPolygon.map((p) => [p.lat, p.lng] as [number, number]);
    const habitatPolygon = L.polygon(latLngs, {
      color: '#4ade80',
      weight: 2,
      dashArray: '5, 5',
      fillColor: 'rgba(74, 222, 128, 0.2)',
      fillOpacity: 0.5,
    });

    habitatPolygon.bindTooltip(`
      <strong>🛡 Protected Sanctuary:</strong> ${sanctuary.name}<br/>
      Designation: ${sanctuary.designation}<br/>
      Species: ${sanctuary.species.map((s) => s.commonName).join(', ')}
    `, { sticky: true, className: 'isochrone-tooltip' });

    grp.addLayer(habitatPolygon);
  }, [layers, sanctuary]);

  // ================= LAYER 8: EVACUATION ROUTES =================
  useEffect(() => {
    const grp = layerGroups.current.evacuation;
    grp.clearLayers();

    const isVisible = layers[8] ?? true;
    if (!isVisible || !evacPlan || !mapInstanceRef.current) return;

    // Safe route polyline (Green)
    const safeCoords = evacPlan.safeRouteCoordinates.map((p) => [p.lat, p.lng] as [number, number]);
    const safeLine = L.polyline(safeCoords, {
      color: '#10bd78',
      weight: 4,
      opacity: 0.9,
    });
    safeLine.bindTooltip(`<strong>🏃 ${evacPlan.safeRoutePillLabel}</strong><br/>Status: Open & Patrolled`, {
      sticky: true,
      className: 'isochrone-tooltip',
    });
    grp.addLayer(safeLine);

    // Blocked road polyline (Red dashed)
    const blockedCoords = evacPlan.blockedRoadCoordinates.map((p) => [p.lat, p.lng] as [number, number]);
    const blockedLine = L.polyline(blockedCoords, {
      color: '#ef4444',
      weight: 3.5,
      dashArray: '6, 6',
      opacity: 0.9,
    });
    blockedLine.bindTooltip(`<strong>⛔ BLOCKED ROAD</strong><br/>${evacPlan.blockedRoadReason}`, {
      sticky: true,
      className: 'isochrone-tooltip',
    });
    grp.addLayer(blockedLine);

    // Evacuation Points / Shelters
    evacPlan.evacuationPoints.forEach((ep) => {
      const epIcon = L.divIcon({
        className: 'evac-point-icon',
        html: `
          <div style="background: #148cf4; color: #fff; font-size: 11px; font-weight: bold; border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
            📍
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([ep.coords.lat, ep.coords.lng], { icon: epIcon });
      marker.bindPopup(`
        <div style="color: #fff; font-size: 11px;">
          <strong>📍 ${ep.name}</strong><br/>
          Capacity: <b>${ep.capacity}</b><br/>
          VHF Radio: <b>${ep.contactVHF}</b>
        </div>
      `, { className: 'nasa-tactical-popup' });
      grp.addLayer(marker);
    });
  }, [layers, evacPlan]);

  // ================= LAYER 9: BURN SCAR =================
  useEffect(() => {
    const grp = layerGroups.current.burnScar;
    grp.clearLayers();

    const isVisible = layers[9] ?? false;
    if (!isVisible || !mapInstanceRef.current) return;

    const isCal = selectedRegion === 'California';
    const center: [number, number] = isCal ? [40.05, -121.25] : [36.18, 27.95];

    const scar = L.circle(center, {
      radius: 9500,
      color: '#78716c',
      weight: 1.5,
      fillColor: '#44403c',
      fillOpacity: 0.65,
    });
    scar.bindTooltip('<strong>Historical Burn Scar:</strong> High severity dNBR footprint', {
      sticky: true,
      className: 'isochrone-tooltip',
    });
    grp.addLayer(scar);
  }, [layers, selectedRegion]);

  // ================= LAYER 10: VEGETATION / NDVI =================
  useEffect(() => {
    const grp = layerGroups.current.vegetation;
    grp.clearLayers();

    const isVisible = layers[10] ?? false;
    if (!isVisible || !mapInstanceRef.current) return;

    const isCal = selectedRegion === 'California';
    const center: [number, number] = isCal ? [39.8, -121.5] : [36.25, 28.05];

    const ndviCircle = L.circle(center, {
      radius: 22000,
      color: '#84cc16',
      weight: 1,
      fillColor: '#65a30d',
      fillOpacity: (ndviOpacity / 100) * 0.4,
    });
    ndviCircle.bindTooltip('<strong>Sentinel-2 NDVI Canopy Layer:</strong> Mean NDVI = 0.68', {
      sticky: true,
      className: 'isochrone-tooltip',
    });
    grp.addLayer(ndviCircle);
  }, [layers, selectedRegion, ndviOpacity]);

  // ================= TACTICAL FLEET LAYER =================
  useEffect(() => {
    const grp = layerGroups.current.fleet;
    grp.clearLayers();

    if (!mapInstanceRef.current) return;

    fleet.forEach((craft) => {
      const planeIcon = L.divIcon({
        className: 'leaflet-plane-icon',
        html: `
          <div class="aircraft-marker" style="pointer-events: auto;">
            <div class="aircraft-icon">✈️</div>
            <span class="aircraft-callsign">${craft.callsign}</span>
          </div>
        `,
        iconSize: [44, 32],
        iconAnchor: [22, 16],
      });

      const marker = L.marker([craft.lat, craft.lon], { icon: planeIcon });
      marker.on('click', () => setSelectedAircraft(craft));
      grp.addLayer(marker);
    });
  }, [fleet]);

  // ================= ROTHERMEL SPREAD ISOCHRONES =================
  useEffect(() => {
    const grp = layerGroups.current.spreadVectors;
    grp.clearLayers();

    if (!mapInstanceRef.current) return;

    const primaryFire = selectedHotspot || hotspots[0];
    if (!primaryFire) return;

    const centerPoint: LatLngPoint = { lat: primaryFire.lat, lng: primaryFire.lon };
    const windSpeed = weather ? weather.windSpeedKmh : 42;
    const windDir = weather ? weather.windDirectionDeg : 35;
    const ellipses = calculateSpreadEllipses(centerPoint, windSpeed, windDir);

    const colors = [
      { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#ef4444', label: '+3h Model Spread' },
      { fill: 'rgba(234, 88, 12, 0.18)', stroke: '#ea580c', label: '+6h Model Spread' },
      { fill: 'rgba(234, 179, 8, 0.12)', stroke: '#eab308', label: '+12h Model Spread' },
    ];

    ellipses.forEach((ell, idx) => {
      const col = colors[idx] || colors[0];
      const circle = L.circle([centerPoint.lat - idx * 0.04, centerPoint.lng - idx * 0.05], {
        radius: ell.majorRadiusKm * 1000,
        color: col.stroke,
        weight: 1.5,
        dashArray: '5, 4',
        fillColor: col.fill,
        fillOpacity: 0.6,
      });

      circle.bindTooltip(`<strong>SIMULATION ONLY (${col.label}):</strong> ~${ell.majorRadiusKm} km projected`, {
        sticky: true,
        className: 'isochrone-tooltip',
      });

      grp.addLayer(circle);
    });
  }, [selectedHotspot, hotspots, weather]);

  // ================= GIS MEASURING TOOLS & POLYGON CLIPPING =================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const grp = layerGroups.current.measurement;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const pt: LatLngPoint = { lat: e.latlng.lat, lng: e.latlng.lng };

      if (activeGISTool === 'ruler') {
        if (measurePoints.length >= 2) {
          grp.clearLayers();
          setMeasurePoints([pt]);
          setMeasuredDistanceMeters(null);

          const startMarker = L.circleMarker([pt.lat, pt.lng], {
            radius: 5,
            color: '#38bdf8',
            fillColor: '#ffffff',
            fillOpacity: 1,
          });
          grp.addLayer(startMarker);
        } else {
          const next = [...measurePoints, pt];
          setMeasurePoints(next);

          const marker = L.circleMarker([pt.lat, pt.lng], {
            radius: 5,
            color: '#38bdf8',
            fillColor: '#ffffff',
            fillOpacity: 1,
          });
          grp.addLayer(marker);

          if (next.length === 2) {
            const distKm = calculateDistanceKm(next[0], next[1]);
            const distMeters = Math.round(distKm * 1000);
            setMeasuredDistanceMeters(distMeters);

            const polyline = L.polyline([[next[0].lat, next[0].lng], [next[1].lat, next[1].lng]], {
              color: '#38bdf8',
              weight: 3,
              dashArray: '6, 5',
            });
            polyline.bindTooltip(`📏 <b>${distKm} km (${distMeters.toLocaleString()} m)</b>`, {
              permanent: true,
              direction: 'center',
              className: 'gis-measure-tooltip',
            });
            grp.addLayer(polyline);
          }
        }
      } else if (activeGISTool === 'polygon') {
        const next = [...polygonDraftPoints, pt];
        setPolygonDraftPoints(next);

        const vMarker = L.circleMarker([pt.lat, pt.lng], {
          radius: 4,
          color: '#38bdf8',
          fillColor: '#38bdf8',
          fillOpacity: 0.9,
        });
        grp.addLayer(vMarker);

        if (next.length >= 3) {
          const areaHa = calculatePolygonAreaHa(next);
          const areaKm2 = Math.round((areaHa / 100) * 10) / 10;
          setMeasuredAreaHa(areaHa);
          setMeasuredAreaKm2(areaKm2);

          const latLngs = next.map((p) => [p.lat, p.lng] as [number, number]);
          const polygonLayer = L.polygon(latLngs, {
            color: '#38bdf8',
            weight: 2,
            dashArray: '4, 4',
            fillColor: 'rgba(56, 189, 248, 0.25)',
            fillOpacity: 0.5,
          });
          grp.addLayer(polygonLayer);

          // Calculate spatial analysis inside polygon
          const enclosedFires = hotspots.filter((h) =>
            next.length >= 3 && Math.abs(h.lat - next[0].lat) < 1.5 && Math.abs(h.lon - next[0].lng) < 1.5
          );
          const enclosedInfra = infraAssets.filter((a) =>
            next.length >= 3 && Math.abs(a.coords.lat - next[0].lat) < 1.5 && Math.abs(a.coords.lng - next[0].lng) < 1.5
          );

          setPolygonStats({
            areaKm2,
            areaHa,
            firesCount: Math.max(1, enclosedFires.length),
            highRiskCount: enclosedFires.filter((f) => f.status === 'Critical' || f.status === 'High').length,
            population: Math.round(areaKm2 * 185),
            hospitalsCount: enclosedInfra.filter((a) => a.type === 'Hospital').length,
            infraCount: enclosedInfra.length,
          });

          // Propagate polygon to App for global filtering
          onPolygonChange(next);
        }
      } else if (activeGISTool === 'none') {
        const clickedRegion = RegionService.findRegionByPoint(pt);
        if (clickedRegion && onSelectRegion && clickedRegion.nameEn !== selectedRegion) {
          onSelectRegion(clickedRegion.nameEn);
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [activeGISTool, measurePoints, polygonDraftPoints, hotspots, infraAssets, selectedRegion, onSelectRegion]);

  const clearMeasurements = () => {
    layerGroups.current.measurement.clearLayers();
    setMeasurePoints([]);
    setPolygonDraftPoints([]);
    setMeasuredDistanceMeters(null);
    setMeasuredAreaHa(null);
    setMeasuredAreaKm2(null);
    setPolygonStats(null);
    onPolygonChange(null);
  };

  // Water drop and suppression calculations
  const activeFrp = selectedHotspot ? selectedHotspot.frp : 12450;
  const activeArea = selectedHotspot ? Math.round(selectedHotspot.acres * 0.404686) : 58320;
  const suppression = {
    firelineKm: Math.round(0.08 * Math.sqrt(activeArea * 10000) * 10) / 10,
    waterTonsRequired: Math.round((activeFrp * 12.5) / 100),
    retardantFoamTons: Math.round(((activeFrp * 12.5) / 100) * 0.08),
    aerialDropsNeeded: Math.ceil(((activeFrp * 12.5) / 100 * 1000) / 6140),
    estimatedContainmentHours: Math.round(Math.max(12, 0.08 * Math.sqrt(activeArea * 10000) * 1.8)),
  };

  return (
    <div className={`main-map-panel ${isFullscreen ? 'fullscreen-map' : ''} ${colorblindMode ? 'colorblind-theme' : ''}`}>
      {/* Live Water Drop Notification */}
      {waterDropStatus && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(20, 140, 244, 0.95)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            zIndex: 35,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✈️</span>
          <span>{waterDropStatus}</span>
        </div>
      )}

      {/* Real Basemap Quick Selector Pill Bar */}
      <div className="real-basemap-bar" style={{ zIndex: 22 }}>
        {(Object.keys(BASEMAP_TILES) as BasemapKey[]).map((key) => {
          const b = BASEMAP_TILES[key];
          const isActive = activeBasemap === key;
          return (
            <button
              key={key}
              className={`real-basemap-chip ${isActive ? 'active' : ''}`}
              onClick={() => setActiveBasemap(key)}
              title={lang === 'ar' ? b.nameAr : b.name}
            >
              <span className="chip-icon">{b.icon}</span>
              <span className="chip-text">
                {lang === 'ar' ? (key === 'satellite' ? 'أقمار صناعية' : key === 'esri' ? 'فضاء NASA' : key === 'terrain' ? 'تضاريس' : key === 'osm' ? 'شوارع' : 'ليلي') : b.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* On-Map Tactical Regional Sector Quick Switcher */}
      <div className="real-sector-bar" style={{ zIndex: 22 }}>
        <span className="sector-bar-title">
          {lang === 'ar' ? '📍 القطاع:' : '📍 SECTOR:'}
        </span>
        {RegionService.getAllRegions().map((r) => {
          const isCurrent = r.nameEn === selectedRegion || r.id === RegionService.getRegionById(selectedRegion).id;
          return (
            <button
              key={r.nameEn}
              className={`real-sector-chip ${isCurrent ? 'active' : ''}`}
              onClick={() => {
                if (onSelectRegion) onSelectRegion(r.nameEn);
              }}
              title={`${lang === 'ar' ? r.nameAr : r.nameEn} (${r.baseActiveFires.toLocaleString()} fires)`}
            >
              <span className="sector-chip-flag">{r.flag}</span>
              <span className="sector-chip-name">{lang === 'ar' ? r.nameAr.split(' ')[0] : r.nameEn.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        id="leaflet-main-map"
        style={{
          width: '100%',
          height: '100%',
          cursor: activeGISTool !== 'none' ? 'crosshair' : 'grab',
        }}
      />

      {/* Wind Streamlines Layer */}
      {layers[3] && weather && (
        <svg
          className="wind-vectors-svg"
          viewBox="0 0 1000 800"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.85,
            zIndex: 8,
          }}
        >
          <defs>
            <linearGradient id="windGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M 150,150 Q 350,220 500,280 T 800,420" fill="none" stroke="url(#windGrad)" strokeWidth="1.6" strokeDasharray="8 6" className="animated-wind-line" />
          <path d="M 200,280 Q 400,320 600,380 T 900,480" fill="none" stroke="url(#windGrad)" strokeWidth="1.8" strokeDasharray="10 8" className="animated-wind-line reverse" />
          <path d="M 280,360 Q 450,420 650,460 T 850,540" fill="none" stroke="url(#windGrad)" strokeWidth="1.5" strokeDasharray="6 6" className="animated-wind-line" />
        </svg>
      )}

      {/* Split Screen Satellite Comparison Slider */}
      {activeGISTool === 'split' && (
        <div
          className="main-split-view-container"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            cursor: 'ew-resize',
          }}
          onMouseMove={(e) => {
            if (!isDraggingMainSplit) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
            setMainSplitPos(Math.max(5, Math.min(95, pos)));
          }}
          onMouseDown={() => setIsDraggingMainSplit(true)}
          onMouseUp={() => setIsDraggingMainSplit(false)}
        >
          <img
            src={medMapImg}
            alt="Current Burn Severity (2024)"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            className="split-layer-over"
            style={{
              position: 'absolute',
              inset: 0,
              width: `${mainSplitPos}%`,
              overflow: 'hidden',
              borderRight: '2px solid #38bdf8',
            }}
          >
            <img
              src={recoveryMapImg}
              alt="Pre-Fire Baseline (2023)"
              style={{
                width: '1000px',
                height: '100%',
                objectFit: 'cover',
                filter: 'saturate(1.5) contrast(1.1)',
              }}
            />
            <span className="split-badge-tag left">PRE-FIRE BASELINE (2023)</span>
          </div>
          <span className="split-badge-tag right">CURRENT BURN SCAR (2024)</span>
        </div>
      )}

      {/* GIS Measuring Overlay Results Banner */}
      {activeGISTool === 'ruler' && (
        <div className="gis-info-banner">
          <span>📏 {lang === 'ar' ? 'انقر على نقطتين لقياس المسافة:' : 'Click 2 points to measure geodesic distance:'}</span>
          {measuredDistanceMeters !== null ? (
            <strong>{(measuredDistanceMeters / 1000).toFixed(2)} km ({measuredDistanceMeters.toLocaleString()} m)</strong>
          ) : (
            <span>({measurePoints.length}/2 {lang === 'ar' ? 'نقاط' : 'points'})</span>
          )}
          <button onClick={clearMeasurements}>✕ {lang === 'ar' ? 'مسح' : 'Clear'}</button>
        </div>
      )}

      {activeGISTool === 'polygon' && (
        <div className="gis-info-banner" style={{ maxWidth: '650px' }}>
          <span>📐 {lang === 'ar' ? 'انقر لرسم مضلع التحليل المكاني:' : 'Click to draw spatial analysis polygon:'}</span>
          {polygonStats ? (
            <strong>
              {polygonStats.areaKm2} km² ({polygonStats.areaHa.toLocaleString()} ha) | {polygonStats.firesCount} fires | Pop: {polygonStats.population.toLocaleString()}
            </strong>
          ) : (
            <span>({polygonDraftPoints.length} points - click 3+ to close)</span>
          )}
          <button onClick={clearMeasurements}>✕ {lang === 'ar' ? 'إلغاء المضلع' : 'Reset'}</button>
        </div>
      )}

      {/* Tactical Aircraft Modal */}
      {selectedAircraft && (
        <div className="aircraft-card-modal" style={{ zIndex: 30 }}>
          <div className="card-top">
            <b>✈️ {selectedAircraft.callsign}</b>
            <button onClick={() => setSelectedAircraft(null)}>✕</button>
          </div>
          <small>{selectedAircraft.type}</small>
          <div className="card-metrics">
            <div><span>Status:</span> <strong>{selectedAircraft.status}</strong></div>
            <div><span>Fuel Level:</span> <strong>{selectedAircraft.fuelPct}%</strong></div>
            <div><span>Water Payload:</span> <strong>{selectedAircraft.waterCapacityLiters.toLocaleString()} L</strong></div>
            <div><span>Target:</span> <strong>{selectedAircraft.targetHotspot}</strong></div>
            <div><span>Drops Executed:</span> <strong>{selectedAircraft.dropsCompleted}</strong></div>
          </div>
          <button
            onClick={() => {
              const res = FleetService.executeWaterDrop(selectedAircraft.id, activeFrp);
              setFleet(FleetService.getActiveFleet());
              setSelectedAircraft(FleetService.getActiveFleet().find((a) => a.id === selectedAircraft.id) || null);
              setWaterDropStatus(`Direct drop dispatched for ${selectedAircraft.callsign}! Retardant/water coverage applied.`);
              setTimeout(() => setWaterDropStatus(null), 4000);
            }}
            style={{
              marginTop: '8px',
              width: '100%',
              background: '#148cf4',
              color: '#fff',
              border: 0,
              padding: '5px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            💧 Execute Water Drop Now
          </button>
        </div>
      )}

      {/* Professional GIS Toolbar (Left Side) */}
      <div className="map-tools left" style={{ zIndex: 25 }}>
        <button onClick={() => mapInstanceRef.current?.zoomIn()} title="Zoom In">+</button>
        <button onClick={() => mapInstanceRef.current?.zoomOut()} title="Zoom Out">−</button>
        <button
          onClick={() => {
            const reg = RegionService.getRegionById(selectedRegion);
            mapInstanceRef.current?.flyTo([reg.center.lat, reg.center.lng], reg.defaultZoom);
            setActiveGISTool('none');
            clearMeasurements();
          }}
          title="Recenter View"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
          </svg>
        </button>
        <div className="tool-separator" />
        {/* Ruler Tool */}
        <button
          className={activeGISTool === 'ruler' ? 'active-tool' : ''}
          onClick={() => {
            setActiveGISTool((prev) => (prev === 'ruler' ? 'none' : 'ruler'));
            clearMeasurements();
          }}
          title={t.ruler}
        >
          📏
        </button>
        {/* Polygon Draw */}
        <button
          className={activeGISTool === 'polygon' ? 'active-tool' : ''}
          onClick={() => {
            setActiveGISTool((prev) => (prev === 'polygon' ? 'none' : 'polygon'));
            clearMeasurements();
          }}
          title={t.polygon}
        >
          📐
        </button>
        {/* Split Screen Satellite */}
        <button
          className={activeGISTool === 'split' ? 'active-tool' : ''}
          onClick={() => {
            setActiveGISTool((prev) => (prev === 'split' ? 'none' : 'split'));
            clearMeasurements();
          }}
          title={t.splitCompare}
        >
          🌗
        </button>
      </div>

      {/* Right Tools (Basemap Switcher, Opacity, Calculator, Fullscreen) */}
      <div className="map-tools right" style={{ zIndex: 25 }}>
        {/* Basemap Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {(Object.keys(BASEMAP_TILES) as BasemapKey[]).map((key) => {
            const b = BASEMAP_TILES[key];
            const isActive = activeBasemap === key;
            return (
              <button
                key={key}
                className={isActive ? 'active-tool' : ''}
                onClick={() => setActiveBasemap(key)}
                title={lang === 'ar' ? b.nameAr : b.name}
                style={{ fontSize: '9px', fontWeight: 'bold' }}
              >
                {b.badge}
              </button>
            );
          })}
        </div>

        <div className="tool-separator" />

        <button
          onClick={() => setShowOpacityControl((v) => !v)}
          title={t.opacity}
          className={showOpacityControl ? 'active-tool' : ''}
        >
          🎨
        </button>
        <button
          onClick={() => setShowSuppressionCalc((v) => !v)}
          title="Suppression & Water Drops Calculator"
          className={showSuppressionCalc ? 'active-tool' : ''}
        >
          🧮
        </button>
        <button
          onClick={() => setIsFullscreen((f) => !f)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>

      {/* Layer Opacity Flyout */}
      {showOpacityControl && (
        <div className="opacity-flyout-card" style={{ zIndex: 30 }}>
          <b>{t.opacity}</b>
          <label>
            <span>Base Tile Opacity ({baseTileOpacity}%)</span>
            <input
              type="range"
              min="20"
              max="100"
              value={baseTileOpacity}
              onChange={(e) => setBaseTileOpacity(parseInt(e.target.value, 10))}
            />
          </label>
          <label>
            <span>Smoke Dispersion ({smokeOpacity}%)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={smokeOpacity}
              onChange={(e) => setSmokeOpacity(parseInt(e.target.value, 10))}
            />
          </label>
          <label>
            <span>Fire Risk Heatmap ({riskOpacity}%)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={riskOpacity}
              onChange={(e) => setRiskOpacity(parseInt(e.target.value, 10))}
            />
          </label>
          <label>
            <span>NDVI Vegetation ({ndviOpacity}%)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={ndviOpacity}
              onChange={(e) => setNdviOpacity(parseInt(e.target.value, 10))}
            />
          </label>
        </div>
      )}

      {/* Containment & Water Dropping Calculator Popover */}
      {showSuppressionCalc && (
        <div className="suppression-calculator-card" style={{ zIndex: 30 }}>
          <div className="calc-header">
            <b>🧮 {lang === 'ar' ? 'حاسبة خطوط الاحتواء وإسقاط المياه' : 'Containment & Water Drops Calculator'}</b>
            <button onClick={() => setShowSuppressionCalc(false)}>✕</button>
          </div>
          <div className="calc-body">
            <div className="calc-row">
              <span>{lang === 'ar' ? 'النطاق المستهدف:' : 'Target Fire:'}</span>
              <strong>{selectedHotspot ? selectedHotspot.name : 'Regional Sector'}</strong>
            </div>
            <div className="calc-row">
              <span>{lang === 'ar' ? 'خط النار المقدر للسيطرة:' : 'Fireline Needed:'}</span>
              <strong>{suppression.firelineKm} km</strong>
            </div>
            <div className="calc-row">
              <span>{lang === 'ar' ? 'إجمالي المياه المطلوبة:' : 'Water Required:'}</span>
              <strong>{suppression.waterTonsRequired.toLocaleString()} Tons</strong>
            </div>
            <div className="calc-row">
              <span>{lang === 'ar' ? 'رغوة الإخماد الكيميائي:' : 'Retardant Foam:'}</span>
              <strong>{suppression.retardantFoamTons} Tons</strong>
            </div>
            <div className="calc-row">
              <span>{lang === 'ar' ? 'طلعات طائرات الكنادير:' : 'Canadair Drops Needed:'}</span>
              <strong className="badge-highlight">{suppression.aerialDropsNeeded} drops</strong>
            </div>
            <div className="calc-row">
              <span>{lang === 'ar' ? 'الوقت المقدر للاحتواء:' : 'Est. Containment Time:'}</span>
              <strong>~{suppression.estimatedContainmentHours} Hours</strong>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left Legend: Fire Radiative Power (MW) */}
      <div className="map-legend" style={{ zIndex: 25 }}>
        <b>{t.fireRadiativePower}</b>
        <div className={`heatbar ${colorblindMode ? 'colorblind-heatbar' : ''}`} />
        <div className="heatbar-ticks">
          <span>0</span>
          <span>1</span>
          <span>10</span>
          <span>50</span>
          <span>200+</span>
        </div>
      </div>

      {/* Live Geographic Projection & Coordinate HUD */}
      <div className="map-coords-hud" style={{ zIndex: 25 }}>
        <div className="coords-pulse-dot" />
        <span className="hud-title">
          {lang === 'ar' ? '🛰️ قمر صناعي مباشر:' : '🛰️ LIVE SATELLITE:'}
        </span>
        <span className="hud-coords">
          {cursorCoords
            ? `${Math.abs(cursorCoords.lat).toFixed(4)}° ${cursorCoords.lat >= 0 ? 'N' : 'S'}, ${Math.abs(cursorCoords.lng).toFixed(4)}° ${cursorCoords.lng >= 0 ? 'E' : 'W'}`
            : (selectedRegion === 'California' ? '37.2000° N, 119.5000° W' : '38.0000° N, 20.0000° E')
          }
        </span>
        <span className="hud-sep">|</span>
        <span className="hud-zoom">
          {lang === 'ar' ? `تكبير: ${currentZoom}x` : `Zoom: ${currentZoom}x`}
        </span>
        <span className="hud-sep">|</span>
        <span className="hud-provider">
          {BASEMAP_TILES[activeBasemap]?.badge} HD (Maxar & NASA)
        </span>
      </div>
    </div>
  );
};
