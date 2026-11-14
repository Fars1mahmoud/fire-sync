import React, { useState } from 'react';
import { TRANSLATIONS } from '../data/wildfireData';
import { RegionService } from '../services';
import { RealMiniMap } from './RealMiniMap';

interface SidebarProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;
  layers: boolean[];
  setLayers: React.Dispatch<React.SetStateAction<boolean[]>>;
  timeYear: number;
  setTimeYear: (y: number) => void;
  isPlayingTime: boolean;
  setIsPlayingTime: React.Dispatch<React.SetStateAction<boolean>>;
  modis: boolean;
  setModis: React.Dispatch<React.SetStateAction<boolean>>;
  viirs: boolean;
  setViirs: React.Dispatch<React.SetStateAction<boolean>>;
  resolutionNorm: boolean;
  setResolutionNorm: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  selectedRegion,
  setSelectedRegion,
  layers,
  setLayers,
  timeYear,
  setTimeYear,
  isPlayingTime,
  setIsPlayingTime,
  modis,
  setModis,
  viirs,
  setViirs,
  resolutionNorm,
  setResolutionNorm,
}) => {
  const [mode, setMode] = useState<'Predefined' | 'Custom'>('Predefined');
  const t = TRANSLATIONS[lang];

  const layerDefs = [
    { label: t.activeFiresLayer, color: '#ff3b30', icon: '🔥' },
    { label: t.fireRiskLayer, color: '#ff7700', icon: '🔥' },
    { label: t.weatherLayer, color: '#ffaa00', icon: '🌤' },
    { label: t.windOverlayLayer, color: '#00d2ff', icon: '💨' },
    { label: t.smokeLayer, color: '#38bdf8', icon: '☁️' },
    { label: t.infraLayer, color: '#60a5fa', icon: '🏢' },
    { label: t.populationLayer, color: '#c084fc', icon: '👥' },
    { label: t.habitatsLayer, color: '#4ade80', icon: '🛡' },
    { label: t.evacRoutesLayer, color: '#10bd78', icon: '🏃' },
    { label: t.burnScarLayer, color: '#a8a29e', icon: '🌾' },
    { label: t.vegetationLayer, color: '#84cc16', icon: '🌿' },
  ];

  const toggleLayer = (index: number) => {
    setLayers((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <aside className="sidebar">
      {/* Title */}
      <div className="side-title">{t.regionSelection}</div>

      {/* Segmented Mode */}
      <div className="segmented">
        <button
          className={mode === 'Predefined' ? 'active' : ''}
          onClick={() => setMode('Predefined')}
        >
          {t.predefined}
        </button>
        <button
          className={mode === 'Custom' ? 'active' : ''}
          onClick={() => setMode('Custom')}
        >
          {t.custom}
        </button>
      </div>

      {/* Select Dropdown */}
      <select
        aria-label="Selected region"
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        className="region-select"
      >
        {RegionService.getAllRegions().map((r) => (
          <option key={r.nameEn} value={r.nameEn}>
            {r.flag} {lang === 'ar' ? r.nameAr : r.nameEn}
          </option>
        ))}
      </select>

      {/* Mini World Map with bounding box */}
      <div className="mini-world-wrap" style={{ height: '90px', borderRadius: '4px', overflow: 'hidden' }}>
        <RealMiniMap
          lat={RegionService.getRegionById(selectedRegion).center.lat}
          lng={RegionService.getRegionById(selectedRegion).center.lng}
          zoom={3}
          type="world"
          lang={lang}
          interactive={false}
        />
        <div className="map-bounding-box" title={`Active Focus: ${selectedRegion}`} />
      </div>

      {/* Region List Radio Buttons */}
      <div className="region-list">
        <button
          className={selectedRegion === 'Brazil' ? 'selected' : ''}
          onClick={() => setSelectedRegion('Brazil')}
        >
          <span className="dot" />
          <span style={{ fontSize: '13px' }}>🇧🇷</span>
          {lang === 'ar' ? 'البرازيل (الأمازون)' : 'Brazil (Amazon)'}
        </button>
        <button
          className={selectedRegion === 'Canada' ? 'selected' : ''}
          onClick={() => setSelectedRegion('Canada')}
        >
          <span className="dot" />
          <span style={{ fontSize: '13px' }}>🇨🇦</span>
          {lang === 'ar' ? 'كندا (التايغا)' : 'Canada (Boreal)'}
        </button>
        <button
          className={selectedRegion === 'Mediterranean Basin' ? 'selected' : ''}
          onClick={() => setSelectedRegion('Mediterranean Basin')}
        >
          <span className="dot" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          {t.mediterraneanBasin}
        </button>
        <button
          className={selectedRegion === 'California' ? 'selected' : ''}
          onClick={() => setSelectedRegion('California')}
        >
          <span className="dot" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          {t.california}
        </button>
        <button
          className={selectedRegion === 'Global (Beta)' ? 'selected' : ''}
          onClick={() => setSelectedRegion('Global (Beta)')}
        >
          <span className="dot" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {t.globalBeta}
        </button>
      </div>

      <div className="divider" />

      {/* Map Layers */}
      <div className="side-title">{t.mapLayers}</div>
      <div className="layers">
        {layerDefs.map((layer, index) => (
          <label key={layer.label} className="layer-item">
            <input
              type="checkbox"
              checked={layers[index] ?? false}
              onChange={() => toggleLayer(index)}
            />
            <span
              className="layer-symbol"
              style={{ color: layer.color }}
            >
              {layer.icon}
            </span>
            <span className="layer-label">{layer.label}</span>
          </label>
        ))}
      </div>

      <div className="divider" />

      {/* Time Range */}
      <div className="side-title">{t.timeRange}</div>
      <div className="date-row">
        <button type="button" className="date-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
          </svg>
          {timeYear}-01-01
        </button>
        <span className="to-label">to</span>
        <button type="button" className="date-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
          </svg>
          {timeYear}-12-31
        </button>
      </div>

      <div className="range-row">
        <input
          type="range"
          min="2020"
          max="2024"
          value={timeYear}
          onChange={(e) => setTimeYear(parseInt(e.target.value, 10))}
        />
        <button
          className={`round ${isPlayingTime ? 'playing' : ''}`}
          onClick={() => setIsPlayingTime((p) => !p)}
          title={isPlayingTime ? 'Pause Timeline' : 'Play Timeline'}
        >
          {isPlayingTime ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
      </div>

      <div className="years">
        {[2020, 2021, 2022, 2023, 2024].map((y) => (
          <span
            key={y}
            className={timeYear === y ? 'active-year' : ''}
            onClick={() => setTimeYear(y)}
            style={{ cursor: 'pointer' }}
          >
            {y}
          </span>
        ))}
      </div>

      <div className="divider" />

      {/* Satellite Data */}
      <div className="side-title">{t.satelliteData}</div>
      <div className="toggle-row">
        <label className="switch-label">
          <input
            type="checkbox"
            checked={modis}
            onChange={(e) => setModis(e.target.checked)}
          />
          <span className="switch-slider" />
          {t.modis}
        </label>
        <label className="switch-label">
          <input
            type="checkbox"
            checked={viirs}
            onChange={(e) => setViirs(e.target.checked)}
          />
          <span className="switch-slider" />
          {t.viirs}
        </label>
      </div>

      <label className="normalization">
        <input
          type="checkbox"
          checked={resolutionNorm}
          onChange={(e) => setResolutionNorm(e.target.checked)}
        />
        <span>{t.resNorm}</span>
        <b
          title="Multi-sensor resolution normalization harmonizes 1km MODIS and 375m VIIRS spectral footprints using bicubic spatial interpolation."
        >
          i
        </b>
      </label>
    </aside>
  );
};
