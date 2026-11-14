import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface HotspotLocation {
  id: string;
  name: { en: string; ar: string };
  lat: number;
  lng: number;
  risk: 'Extreme' | 'High' | 'Moderate' | 'Low';
  frp: string;
  distance: string;
  sector: { en: string; ar: string };
  country: 'Brazil' | 'Canada';
}

export const DATASET_HOTSPOTS: HotspotLocation[] = [
  // ================= BRAZIL DATASET OBSERVATIONS =================
  {
    id: 'h-bra-1',
    name: { en: 'BR-319 Humaitá Rainforest Front', ar: 'بؤرة هومياتا بطريق BR-319 (الأمازون)' },
    lat: -7.5214,
    lng: -63.0245,
    risk: 'Extreme',
    frp: '485 MW',
    distance: '18 km',
    sector: { en: 'Amazon Basin Rainforest Biome', ar: 'غابات الأمازون المطيرة (البرازيل)' },
    country: 'Brazil',
  },
  {
    id: 'h-bra-2',
    name: { en: 'Sinop Cerrado Agricultural Buffer', ar: 'جبهة سينوب - سيرادو الزراعية (ماتو غروسو)' },
    lat: -11.8621,
    lng: -55.5089,
    risk: 'High',
    frp: '395 MW',
    distance: '34 km',
    sector: { en: 'Mato Grosso Cerrado Transition Belt', ar: 'حزام السيرادو الزراعي (ماتو غروسو)' },
    country: 'Brazil',
  },
  {
    id: 'h-bra-3',
    name: { en: 'Pantanal Corumbá Wetland Buffer', ar: 'مستنقعات بانتانال - كورومبا (البرازيل)' },
    lat: -19.0068,
    lng: -57.6534,
    risk: 'Extreme',
    frp: '520 MW',
    distance: '45 km',
    sector: { en: 'Pantanal Ramsar Wetlands Sector', ar: 'أراضي بانتانال الرطبة (البرازيل)' },
    country: 'Brazil',
  },
  {
    id: 'h-bra-4',
    name: { en: 'Pará Altamira Forest Flank', ar: 'جبهة ألتاميرا - بارا (الأمازون الشرقية)' },
    lat: -3.2045,
    lng: -52.2140,
    risk: 'High',
    frp: '340 MW',
    distance: '62 km',
    sector: { en: 'Eastern Amazon Buffer', ar: 'القطاع الشرقي لغابات الأمازون' },
    country: 'Brazil',
  },
  {
    id: 'h-bra-5',
    name: { en: 'Porto Velho Deforestation Perimeter', ar: 'محيط بورتو فيلهو (روندونيا)' },
    lat: -8.7619,
    lng: -63.9039,
    risk: 'Moderate',
    frp: '275 MW',
    distance: '78 km',
    sector: { en: 'Rondônia Frontier Corridor', ar: 'ممر روندونيا الحراجي' },
    country: 'Brazil',
  },

  // ================= CANADA DATASET OBSERVATIONS =================
  {
    id: 'h-can-1',
    name: { en: 'Fort McMurray Athabasca Conifer Front', ar: 'جبهة فورت ماكموراي الصنوبرية (ألبيرتا)' },
    lat: 56.7262,
    lng: -111.3803,
    risk: 'Extreme',
    frp: '620 MW',
    distance: '28 km',
    sector: { en: 'Boreal Taiga Shield Sector', ar: 'درع التايغا الشمالي (كندا)' },
    country: 'Canada',
  },
  {
    id: 'h-can-2',
    name: { en: 'Donnie Creek Peace River Mega-Fire', ar: 'حريق دوني كريك الضخم (كولومبيا البريطانية)' },
    lat: 57.5500,
    lng: -121.9000,
    risk: 'Extreme',
    frp: '810 MW',
    distance: '42 km',
    sector: { en: 'Peace River Boreal Complex', ar: 'مجمع غابات بيس ريفر (كندا)' },
    country: 'Canada',
  },
  {
    id: 'h-can-3',
    name: { en: 'Quebec Lebel-sur-Quévillon Fire Line', ar: 'خط حرائق كيبيك (شمال كيبيك)' },
    lat: 49.0300,
    lng: -76.9800,
    risk: 'High',
    frp: '540 MW',
    distance: '55 km',
    sector: { en: 'Eastern Boreal Conifer Forest', ar: 'غابات التايغا الشرقية (كيبيك)' },
    country: 'Canada',
  },
  {
    id: 'h-can-4',
    name: { en: 'Yellowknife Great Slave Lake Flank', ar: 'جبهة بحيرة غريت سليف - يلونايف' },
    lat: 62.4540,
    lng: -114.3718,
    risk: 'High',
    frp: '460 MW',
    distance: '65 km',
    sector: { en: 'Northwest Territories Taiga', ar: 'المقاطعات الشمالية الغربية (كندا)' },
    country: 'Canada',
  },
];

// Fallback compatibility alias
export const EGYPT_HOTSPOTS = DATASET_HOTSPOTS;

interface RealEarthMapProps {
  lang: 'en' | 'ar';
  mapMode: 'satellite' | 'terrain' | 'hybrid';
  setMapMode: (mode: 'satellite' | 'terrain' | 'hybrid') => void;
  layers: {
    activeFires: boolean;
    riskForecast: boolean;
    smokeModis: boolean;
    airQuality: boolean;
    windDirection: boolean;
    vegetation: boolean;
    population: boolean;
    protectedAreas: boolean;
  };
  onSelectHotspot?: (hotspot: HotspotLocation) => void;
  onOpenSafeRoute?: () => void;
}

export const RealEarthMap: React.FC<RealEarthMapProps> = ({
  lang,
  mapMode,
  setMapMode,
  layers,
  onSelectHotspot,
  onOpenSafeRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  const [selectedPin, setSelectedPin] = useState<HotspotLocation | null>(null);
  const [activeRegionView, setActiveRegionView] = useState<'brazil' | 'canada'>('brazil');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center: [-10.8244, -55.4521], // Centered over Brazil Amazon & Cerrado Basin
        zoom: 4.8,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        dragging: true,
      });
    } catch (e) {
      console.warn('RealEarthMap init caught:', e);
      return;
    }

    mapInstanceRef.current = map;
    featureGroupRef.current = L.featureGroup().addTo(map);

    // Initial tile layer: Esri World Imagery (Real High-Res Satellite Photography of Earth)
    const baseTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      }
    ).addTo(map);
    tileLayerRef.current = baseTile;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Mode (Satellite / Terrain / Hybrid)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    if (mapMode === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else if (mapMode === 'terrain') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else if (mapMode === 'hybrid') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
      // Carto boundary & place labels overlay
      labelLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);
    }
  }, [mapMode]);

  // Render Overlays & Geospatial Entities based on toggled layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = featureGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Regional Command Center Pulse & 250km / 100km Radar Range Rings
    const centerCoords: [number, number] = activeRegionView === 'brazil'
      ? [-10.8244, -55.4521]
      : [56.7262, -111.3803];

    const centerLabel = activeRegionView === 'brazil'
      ? (lang === 'ar' ? 'مرصد الأمازون وسيرادو (البرازيل)' : 'Amazon & Cerrado Hub (Brazil)')
      : (lang === 'ar' ? 'مرصد غابات التايغا (كندا)' : 'Boreal Shield Taiga Hub (Canada)');

    // 250 km Radius Area Circle
    const circle250km = L.circle(centerCoords, {
      radius: 250000,
      color: '#0284c7',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#38bdf8',
      fillOpacity: 0.05,
    });
    group.addLayer(circle250km);

    // 100 km Inner Alert Zone
    const circle100km = L.circle(centerCoords, {
      radius: 100000,
      color: '#38bdf8',
      weight: 1,
      dashArray: '3, 4',
      fillColor: '#0284c7',
      fillOpacity: 0.04,
    });
    group.addLayer(circle100km);

    // Central Pulse Marker
    const radarIcon = L.divIcon({
      className: 'leaflet-cairo-radar-marker',
      html: `
        <div class="cairo-radar-pulse-ring"></div>
        <div class="cairo-center-dot"></div>
        <div class="cairo-tag-pill" style="min-width: 140px; text-align: center;">
          <span class="cairo-live-dot"></span>
          <span>${centerLabel}</span>
        </div>
      `,
      iconSize: [140, 40],
      iconAnchor: [70, 20],
    });

    const radarMarker = L.marker(centerCoords, { icon: radarIcon, zIndexOffset: 1000 });
    group.addLayer(radarMarker);

    // 2. Active Fires (NASA Hotspots from Brazil & Canada Datasets)
    if (layers.activeFires) {
      DATASET_HOTSPOTS.forEach((h) => {
        const fireIcon = L.divIcon({
          className: 'leaflet-fire-hotspot-pin',
          html: `
            <div class="fire-beacon-pulse ${h.risk.toLowerCase()}"></div>
            <div class="fire-ember-icon ${h.risk.toLowerCase()}">🔥</div>
            <div class="fire-pin-label">${lang === 'ar' ? h.name.ar : h.name.en}</div>
          `,
          iconSize: [60, 60],
          iconAnchor: [30, 30],
        });

        const marker = L.marker([h.lat, h.lng], { icon: fireIcon });
        marker.on('click', () => {
          setSelectedPin(h);
          if (onSelectHotspot) onSelectHotspot(h);
        });

        group.addLayer(marker);
      });
    }

    // 3. Fire Risk Forecast (Thermal Zones & Risk Gradient Halos)
    if (layers.riskForecast) {
      DATASET_HOTSPOTS.forEach((h) => {
        const riskCircle = L.circle([h.lat, h.lng], {
          radius: h.risk === 'Extreme' ? 45000 : h.risk === 'High' ? 30000 : 18000,
          color: h.risk === 'Extreme' ? '#dc2626' : h.risk === 'High' ? '#ea580c' : '#f59e0b',
          weight: 1.5,
          fillColor: h.risk === 'Extreme' ? '#ef4444' : h.risk === 'High' ? '#f97316' : '#fbbf24',
          fillOpacity: 0.22,
        });
        group.addLayer(riskCircle);
      });
    }

    // 4. MODIS / VIIRS Smoke Plumes (Downwind Atmospheric Plumes)
    if (layers.smokeModis) {
      // Brazil Amazon Plume
      const smokeCoordsBrazil1: [number, number][] = [
        [-7.5, -63.0],
        [-8.4, -61.2],
        [-10.2, -59.5],
        [-11.5, -61.0],
      ];
      group.addLayer(
        L.polygon(smokeCoordsBrazil1, {
          color: 'transparent',
          fillColor: '#94a3b8',
          fillOpacity: 0.35,
          className: 'animated-smoke-polygon',
        })
      );

      // Brazil Pantanal Plume
      const smokeCoordsBrazil2: [number, number][] = [
        [-19.0, -57.6],
        [-19.6, -56.0],
        [-20.8, -54.8],
        [-21.2, -56.5],
      ];
      group.addLayer(
        L.polygon(smokeCoordsBrazil2, {
          color: 'transparent',
          fillColor: '#94a3b8',
          fillOpacity: 0.32,
          className: 'animated-smoke-polygon',
        })
      );

      // Canada Donnie Creek Plume
      const smokeCoordsCanada: [number, number][] = [
        [57.5, -121.9],
        [56.8, -119.5],
        [55.4, -117.8],
        [55.9, -120.2],
      ];
      group.addLayer(
        L.polygon(smokeCoordsCanada, {
          color: 'transparent',
          fillColor: '#94a3b8',
          fillOpacity: 0.34,
          className: 'animated-smoke-polygon',
        })
      );
    }

    // 5. Wind Direction Vectors
    if (layers.windDirection) {
      const windArrows: { coords: [number, number]; speed: string; deg: string }[] = [
        // Brazil
        { coords: [-10.8, -55.4], speed: '22 km/h SE', deg: '45deg' },
        { coords: [-7.5, -63.0], speed: '18 km/h ESE', deg: '30deg' },
        { coords: [-19.0, -57.6], speed: '20 km/h S', deg: '0deg' },
        // Canada
        { coords: [56.7, -111.4], speed: '28 km/h NW', deg: '315deg' },
        { coords: [57.5, -121.9], speed: '32 km/h WNW', deg: '290deg' },
      ];
      windArrows.forEach(({ coords, speed }) => {
        const windIcon = L.divIcon({
          className: 'leaflet-wind-vector',
          html: `<div class="wind-arrow-indicator" title="Wind ${speed}">➔ <span>${speed}</span></div>`,
          iconSize: [75, 20],
          iconAnchor: [37, 10],
        });
        group.addLayer(L.marker(coords, { icon: windIcon }));
      });
    }

    // 6. Air Quality Stations
    if (layers.airQuality) {
      const aqiPoints = [
        { lat: -3.119, lng: -60.021, aqi: 138, label: 'Manaus (Amazonas)' },
        { lat: -15.601, lng: -56.097, aqi: 145, label: 'Cuiabá (Mato Grosso)' },
        { lat: -19.006, lng: -57.653, aqi: 168, label: 'Corumbá (Pantanal)' },
        { lat: 56.726, lng: -111.380, aqi: 122, label: 'Fort McMurray (AB)' },
        { lat: 53.546, lng: -113.493, aqi: 88, label: 'Edmonton (Boreal Haze)' },
      ];
      aqiPoints.forEach((p) => {
        const aqiIcon = L.divIcon({
          className: 'leaflet-aqi-pill',
          html: `<div class="aqi-badge-dot ${p.aqi > 100 ? 'unhealthy' : 'moderate'}">AQI ${p.aqi}</div>`,
          iconSize: [60, 22],
          iconAnchor: [30, 11],
        });
        group.addLayer(L.marker([p.lat, p.lng], { icon: aqiIcon }));
      });
    }

    // 7. Vegetation / Ecological Biome Corridors
    if (layers.vegetation) {
      // Amazon Rainforest Core Boundary
      const amazonPolygon = L.polygon(
        [
          [-1.5, -65.0],
          [-1.5, -50.0],
          [-10.0, -50.0],
          [-10.0, -65.0],
        ],
        {
          color: '#10b981',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#10b981',
          fillOpacity: 0.12,
        }
      );
      group.addLayer(amazonPolygon);
    }

    // 8. Protected Nature Reserves & Indigenous Territories
    if (layers.protectedAreas) {
      const reserves = [
        { lat: -11.5, lng: -53.5, name: { en: 'Xingu Indigenous Reserve', ar: 'محمية شينغو للشعوب الأصلية (البرازيل)' }, rad: 80000 },
        { lat: -17.8, lng: -57.4, name: { en: 'Pantanal Matogrossense National Park', ar: 'حديقة بانتانال ماتوغورسينسي الوطنية' }, rad: 60000 },
        { lat: 59.2, lng: -112.5, name: { en: 'Wood Buffalo National Park', ar: 'حديقة وود بافالو الوطنية (كندا)' }, rad: 90000 },
      ];
      reserves.forEach((r) => {
        const resCircle = L.circle([r.lat, r.lng], {
          radius: r.rad,
          color: '#8b5cf6',
          weight: 1.5,
          dashArray: '5, 5',
          fillColor: '#8b5cf6',
          fillOpacity: 0.12,
        });
        group.addLayer(resCircle);
      });
    }
  }, [layers, lang, onSelectHotspot, activeRegionView]);

  // Map control functions
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleFocusBrazil = () => {
    setActiveRegionView('brazil');
    mapInstanceRef.current?.flyTo([-10.8244, -55.4521], 5, { duration: 1.2 });
  };

  const handleFocusCanada = () => {
    setActiveRegionView('canada');
    mapInstanceRef.current?.flyTo([56.7262, -111.3803], 4.8, { duration: 1.2 });
  };

  return (
    <div className="real-earth-map-wrapper">
      {/* Top Map Mode Switcher & Controls */}
      <div className="map-top-bar">
        {/* Region Toggle (Brazil / Canada Dataset Switcher) */}
        <div className="map-region-pills" style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`view-pill ${activeRegionView === 'brazil' ? 'active' : ''}`}
            onClick={handleFocusBrazil}
            style={{ fontWeight: 600 }}
          >
            🇧🇷 {lang === 'ar' ? 'البرازيل (7.69M رصد)' : 'Brazil (7.69M)'}
          </button>
          <button
            type="button"
            className={`view-pill ${activeRegionView === 'canada' ? 'active' : ''}`}
            onClick={handleFocusCanada}
            style={{ fontWeight: 600 }}
          >
            🇨🇦 {lang === 'ar' ? 'كندا (3.18M رصد)' : 'Canada (3.18M)'}
          </button>
        </div>

        {/* View Style Switcher */}
        <div className="map-view-pills" role="tablist">
          <button
            type="button"
            className={`view-pill ${mapMode === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapMode('satellite')}
          >
            {lang === 'ar' ? 'قمر صناعي' : 'Satellite'}
          </button>
          <button
            type="button"
            className={`view-pill ${mapMode === 'terrain' ? 'active' : ''}`}
            onClick={() => setMapMode('terrain')}
          >
            {lang === 'ar' ? 'تضاريس' : 'Terrain'}
          </button>
          <button
            type="button"
            className={`view-pill ${mapMode === 'hybrid' ? 'active' : ''}`}
            onClick={() => setMapMode('hybrid')}
          >
            {lang === 'ar' ? 'هجين' : 'Hybrid'}
          </button>
        </div>

        <div className="map-action-buttons">
          <button
            type="button"
            className="map-tool-btn"
            onClick={handleZoomIn}
            title={lang === 'ar' ? 'تكبير' : 'Zoom In'}
            aria-label="Zoom In"
          >
            ＋
          </button>
          <button
            type="button"
            className="map-tool-btn"
            onClick={handleZoomOut}
            title={lang === 'ar' ? 'تصغير' : 'Zoom Out'}
            aria-label="Zoom Out"
          >
            －
          </button>
          <button
            type="button"
            className="map-tool-btn"
            onClick={activeRegionView === 'brazil' ? handleFocusBrazil : handleFocusCanada}
            title={lang === 'ar' ? 'إعادة ضبط المركز على المرصد' : 'Center Observatory'}
            aria-label="Center on Observatory"
          >
            🎯
          </button>
        </div>
      </div>

      {/* Real Leaflet Map Container */}
      <div className="leaflet-map-host-container">
        <div ref={mapContainerRef} className="real-leaflet-map-element" />

        {/* Selected Hotspot Popup Card */}
        {selectedPin && (
          <div className="map-hotspot-callout-overlay">
            <button
              type="button"
              className="callout-close"
              onClick={() => setSelectedPin(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="callout-header">
              <span className="callout-icon">🔥</span>
              <div>
                <h4>{lang === 'ar' ? selectedPin.name.ar : selectedPin.name.en}</h4>
                <span className="callout-sub">{lang === 'ar' ? selectedPin.sector.ar : selectedPin.sector.en}</span>
              </div>
            </div>
            <div className="callout-grid">
              <div>
                <span>{lang === 'ar' ? 'المسافة:' : 'Distance:'}</span>
                <strong>{selectedPin.distance}</strong>
              </div>
              <div>
                <span>FRP:</span>
                <strong className="frp-highlight">{selectedPin.frp}</strong>
              </div>
              <div>
                <span>{lang === 'ar' ? 'مستوى الخطر:' : 'Risk:'}</span>
                <span className={`risk-badge-pill ${selectedPin.risk.toLowerCase()}`}>
                  {selectedPin.risk}
                </span>
              </div>
              <div>
                <span>{lang === 'ar' ? 'الدولة والمستشعر:' : 'Country & Sensor:'}</span>
                <strong>{selectedPin.country} (VIIRS)</strong>
              </div>
            </div>
            <button
              type="button"
              className="callout-safe-route-btn"
              onClick={() => {
                setSelectedPin(null);
                if (onOpenSafeRoute) onOpenSafeRoute();
              }}
            >
              ↗ {lang === 'ar' ? 'عرض مسار الإخلاء الآمن' : 'View Evacuation Route'}
            </button>
          </div>
        )}

        {/* Bottom Left Legend: Fire Intensity (Last 24h) */}
        <div className="map-bottom-legend-panel">
          <div className="intensity-legend-box">
            <span className="legend-title">
              {lang === 'ar' ? 'شدة الحرائق الحرارية (بيانات VIIRS)' : 'Thermal Fire Intensity (VIIRS)'}
            </span>
            <div className="intensity-gradient-strip">
              <span className="strip-label">{lang === 'ar' ? 'منخفض' : 'Low'}</span>
              <span className="strip-label">{lang === 'ar' ? 'متوسط' : 'Moderate'}</span>
              <span className="strip-label">{lang === 'ar' ? 'مرتفع' : 'High'}</span>
              <span className="strip-label">{lang === 'ar' ? 'حرج' : 'Extreme'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Right Scale Indicator */}
        <div className="map-scale-box">
          <div className="scale-line-bar" />
          <span className="scale-text">250 km</span>
        </div>
      </div>
    </div>
  );
};
