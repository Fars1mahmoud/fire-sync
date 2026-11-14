import React, { useState } from 'react';
import { GlobeIcon, ArrowRightIcon, RadioIcon } from '../icons';

interface GlobalFireMapProps {
  onOpenFullMap: () => void;
  lang: 'en' | 'ar';
}

interface MapHotspot {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  frp: number; // Fire Radiative Power (MW)
  sensor: 'VIIRS' | 'MODIS';
  top: string;
  left: string;
  level: 'extreme' | 'high' | 'moderate';
  confidence: number;
}

export const GlobalFireMap: React.FC<GlobalFireMapProps> = ({
  onOpenFullMap,
  lang,
}) => {
  const [selectedSensor, setSelectedSensor] = useState<'all' | 'viirs' | 'modis'>('all');
  const [activeHotspot, setActiveHotspot] = useState<MapHotspot | null>(null);

  const stats = [
    {
      labelEn: 'Total Satellite Detections',
      labelAr: 'إجمالي رصد الأقمار الصناعية',
      val: '10.87M',
      change: 'Brazil (7.69M) & Canada (3.18M)',
      accent: '#ff4d00',
    },
    {
      labelEn: 'Primary Geographic Focus',
      labelAr: 'النطاق الجغرافي النشط',
      val: 'BR & CA',
      change: '10 CSVs Audited (2020–2024)',
      accent: '#22d3ee',
    },
    {
      labelEn: 'Operational Database Records',
      labelAr: 'سجلات قاعدة بيانات PostGIS',
      val: '9,998 Live',
      change: 'Sample loaded from 10.87M archive',
      accent: '#10bd78',
    },
    {
      labelEn: 'Sensors Harmonized',
      labelAr: 'المستشعرات الفضائية',
      val: 'VIIRS & MODIS',
      change: 'NOAA-20 (375m) & Terra/Aqua',
      accent: '#0ea5ff',
    },
  ];

  const hotspots: MapHotspot[] = [
    {
      id: 'h1',
      name: 'Amazonas & Humaitá Rainforest Front',
      nameAr: 'غابات هومياتا في الأمازون (البرازيل)',
      country: 'Brazil',
      frp: 485,
      sensor: 'VIIRS',
      top: '62%',
      left: '32%',
      level: 'extreme',
      confidence: 99,
    },
    {
      id: 'h2',
      name: 'Mato Grosso & Sinop Cerrado Flank',
      nameAr: 'حزام سينوب وسيرادو الزراعي (البرازيل)',
      country: 'Brazil',
      frp: 395,
      sensor: 'VIIRS',
      top: '68%',
      left: '35%',
      level: 'extreme',
      confidence: 97,
    },
    {
      id: 'h3',
      name: 'Pantanal Corumbá Wetland Perimeter',
      nameAr: 'مستنقعات بانتانال وكورومبا (البرازيل)',
      country: 'Brazil',
      frp: 520,
      sensor: 'VIIRS',
      top: '76%',
      left: '34%',
      level: 'extreme',
      confidence: 99,
    },
    {
      id: 'h4',
      name: 'Fort McMurray Boreal Mega-Complex',
      nameAr: 'مجمع غابات فورت ماكموري (ألبرتا، كندا)',
      country: 'Canada',
      frp: 620,
      sensor: 'VIIRS',
      top: '24%',
      left: '20%',
      level: 'extreme',
      confidence: 99,
    },
    {
      id: 'h5',
      name: 'Donnie Creek Mega-Fire Complex',
      nameAr: 'حرائق دوني كريك الكبرى (بريتيش كولومبيا، كندا)',
      country: 'Canada',
      frp: 810,
      sensor: 'VIIRS',
      top: '22%',
      left: '17%',
      level: 'extreme',
      confidence: 99,
    },
    {
      id: 'h6',
      name: 'Quebec Lebel-sur-Quévillon Conifer Front',
      nameAr: 'غابات كيبك الصنوبرية (كندا)',
      country: 'Canada',
      frp: 540,
      sensor: 'VIIRS',
      top: '28%',
      left: '26%',
      level: 'extreme',
      confidence: 98,
    },
    {
      id: 'h7',
      name: 'Pará & Xingu Transamazonian Sector',
      nameAr: 'حوض شينغو وترانس أمازونيا (البرازيل)',
      country: 'Brazil',
      frp: 340,
      sensor: 'VIIRS',
      top: '58%',
      left: '36%',
      level: 'high',
      confidence: 95,
    },
    {
      id: 'h8',
      name: 'Northern Territory Bushfire',
      nameAr: 'حرائب الأراضي الشمالية (أستراليا)',
      country: 'Australia',
      frp: 275,
      sensor: 'VIIRS',
      top: '72%',
      left: '84%',
      level: 'high',
      confidence: 93,
    },
  ];

  const filteredHotspots = hotspots.filter((h) => {
    if (selectedSensor === 'all') return true;
    return h.sensor.toLowerCase() === selectedSensor;
  });

  return (
    <section className="global-map-section" id="global-map">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <div className="section-eyebrow-badge">
              <RadioIcon size={12} />
              <span>ORBITAL SURVEILLANCE FEED</span>
            </div>
            <h2 className="section-title-large">
              {lang === 'ar' ? (
                <>نشاط الحرائق <span className="highlight-cyan">العالمي المباشر</span></>
              ) : (
                <>Global Fire <span className="highlight-cyan">Activity</span></>
              )}
            </h2>
            <p className="section-subtitle-text">
              {lang === 'ar'
                ? 'خريطة تفاعلية تعرض البؤر الحرارية الملتقطة بواسطة أسطول أقمار NASA وNOAA مع مؤشرات الطاقة الإشعاعية FRP.'
                : 'Worldwide thermal anomaly detections synchronized across NASA Terra, Aqua, Suomi-NPP, and NOAA-20 orbit tracks.'}
            </p>
          </div>

          <div className="header-action-button-wrapper">
            <button
              type="button"
              className="btn-launch-gis"
              onClick={onOpenFullMap}
            >
              <GlobeIcon size={18} />
              <span>{lang === 'ar' ? 'فتح لوحة الـ GIS الكاملة' : 'Launch Full GIS Workspace'}</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="map-stats-strip">
          {stats.map((s, idx) => (
            <div key={idx} className="map-stat-card">
              <span className="stat-card-label">{lang === 'ar' ? s.labelAr : s.labelEn}</span>
              <div className="stat-card-value-row">
                <span className="stat-card-val" style={{ color: s.accent }}>{s.val}</span>
              </div>
              <span className="stat-card-sub">{s.change}</span>
            </div>
          ))}
        </div>

        {/* Dark Enterprise Map Preview Container */}
        <div className="enterprise-map-wrapper">
          {/* Map Top Bar Controls */}
          <div className="map-overlay-controls">
            <div className="sensor-filter-group">
              <span className="filter-label">{lang === 'ar' ? 'المستشعر:' : 'Sensor:'}</span>
              <button
                type="button"
                className={`filter-chip ${selectedSensor === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSensor('all')}
              >
                All (Harmonized)
              </button>
              <button
                type="button"
                className={`filter-chip ${selectedSensor === 'viirs' ? 'active' : ''}`}
                onClick={() => setSelectedSensor('viirs')}
              >
                VIIRS (375m)
              </button>
              <button
                type="button"
                className={`filter-chip ${selectedSensor === 'modis' ? 'active' : ''}`}
                onClick={() => setSelectedSensor('modis')}
              >
                MODIS (1km)
              </button>
            </div>

            <div className="map-status-pill">
              <span className="pulse-dot-green" />
              <span>ACTIVE DATA FEED • 60s REFRESH</span>
            </div>
          </div>

          {/* Visual Dark World GIS Map Canvas */}
          <div className="dark-map-viewport">
            {/* World Grid Lines Overlay */}
            <div className="gis-latlon-grid" />

            {/* Simulated Dark World Map SVG */}
            <svg className="world-vector-backdrop" viewBox="0 0 1000 500" preserveAspectRatio="none">
              <defs>
                <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.8" fill="rgba(56, 189, 248, 0.15)" />
                </pattern>
              </defs>
              <rect width="1000" height="500" fill="url(#dotGrid)" />
              {/* Stylized continent vectors in deep dark navy with cyan borders */}
              {/* North America */}
              <path d="M120 70 Q160 50 250 80 Q290 120 270 190 Q220 220 180 260 Q150 200 130 140 Z" fill="#081b33" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
              {/* South America */}
              <path d="M250 270 Q310 280 340 340 Q310 440 260 460 Q240 370 250 270 Z" fill="#081b33" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
              {/* Europe */}
              <path d="M460 70 Q540 60 560 110 Q520 150 480 160 Q450 120 460 70 Z" fill="#081b33" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
              {/* Mediterranean Sea outline accent */}
              <path d="M470 165 Q510 170 540 165 Q550 180 500 185 Z" fill="#040d1a" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1.2" />
              {/* Africa */}
              <path d="M460 190 Q560 190 560 280 Q520 400 480 410 Q430 310 460 190 Z" fill="#081b33" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
              {/* Asia */}
              <path d="M570 70 Q750 60 840 140 Q800 240 680 240 Q600 200 570 110 Z" fill="#081b33" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
              {/* Australia */}
              <path d="M780 320 Q860 310 880 380 Q820 420 760 380 Z" fill="#081b33" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
            </svg>

            {/* Glowing Hotspots Rendered on Map */}
            {filteredHotspots.map((h) => (
              <div
                key={h.id}
                className={`map-hotspot-pin ${h.level}`}
                style={{ top: h.top, left: h.left }}
                onClick={() => setActiveHotspot(h)}
              >
                <div className="hotspot-pulse-ring" />
                <div className="hotspot-core-dot" />
              </div>
            ))}

            {/* Selected Hotspot Detail Popup */}
            {activeHotspot && (
              <div 
                className="map-active-popup" 
                style={{ top: activeHotspot.top, left: activeHotspot.left }}
              >
                <button 
                  className="popup-close-x" 
                  onClick={() => setActiveHotspot(null)}
                >
                  ✕
                </button>
                <div className="popup-header">
                  <span className="popup-sensor-badge">{activeHotspot.sensor} 375m</span>
                  <span className="popup-frp-badge">{activeHotspot.frp} MW</span>
                </div>
                <h4 className="popup-location-name">
                  {lang === 'ar' ? activeHotspot.nameAr : activeHotspot.name}
                </h4>
                <p className="popup-country">{activeHotspot.country}</p>
                <div className="popup-metrics-grid">
                  <div>
                    <span className="m-label">Confidence:</span>
                    <span className="m-val">{activeHotspot.confidence}%</span>
                  </div>
                  <div>
                    <span className="m-label">Severity:</span>
                    <span className="m-val critical">CRITICAL FRONT</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="popup-cta-btn"
                  onClick={onOpenFullMap}
                >
                  {lang === 'ar' ? 'عرض على الخريطة التفاعلية' : 'Open in Full GIS Map →'}
                </button>
              </div>
            )}

            {/* Map Legend Overlay */}
            <div className="map-legend-box">
              <span className="legend-title">FIRE RADIATIVE POWER (FRP)</span>
              <div className="legend-gradient-bar" />
              <div className="legend-labels">
                <span>&lt;30 MW</span>
                <span>100 MW</span>
                <span>300 MW</span>
                <span>&gt;500 MW (Extreme)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
