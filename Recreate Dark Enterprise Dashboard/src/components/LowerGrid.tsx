import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/wildfireData';
import {
  SmokeService,
  InfrastructureService,
  RoutingService,
  RegionService,
  type SmokeDispersionModel,
  type EvacuationPlan,
} from '../services';
import { RealMiniMap } from './RealMiniMap';
import report0Img from '../assets/crops/report_0.png';
import report1Img from '../assets/crops/report_1.png';
import report2Img from '../assets/crops/report_2.png';
import recoveryMapImg from '../assets/crops/recovery_map.png';

interface LowerGridProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  onOpenReportModal: () => void;
  onOpenEvacRouteDetails: () => void;
  onNavigateToTab?: (tab: string) => void;
  customReports: Array<{
    id: string;
    type: 'Confirmed Fire' | 'Possible Fire' | 'False Detection';
    time: string;
    lat: number;
    lon: number;
    notes?: string;
  }>;
}

export const LowerGrid: React.FC<LowerGridProps> = ({
  lang,
  selectedRegion,
  onOpenReportModal,
  onOpenEvacRouteDetails,
  onNavigateToTab,
  customReports,
}) => {
  const t = TRANSLATIONS[lang];

  // Smoke timeline state
  const [smokePlaying, setSmokePlaying] = useState(false);
  const [smokeHour, setSmokeHour] = useState(14);
  const [smokeMinute, setSmokeMinute] = useState(0);

  // Recovery split slider position (0-100%)
  const [splitPos, setSplitPos] = useState(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Regional services data
  const [smokeModel, setSmokeModel] = useState<SmokeDispersionModel | null>(null);
  const [infraThreats, setInfraThreats] = useState<{
    nearestCity: { name: string; distanceKm: number };
    nearestHospital: { name: string; distanceKm: number };
    nearestPowerStation: { name: string; distanceKm: number };
    threatenedPopulation5km: number;
  } | null>(null);
  const [evacPlan, setEvacPlan] = useState<EvacuationPlan | null>(null);

  useEffect(() => {
    const regDef = RegionService.getRegionById(selectedRegion);
    const centerCoords = regDef.center;

    const plume = SmokeService.getPlumeModel(
      selectedRegion,
      regDef.id === 'brazil' ? 485 : regDef.id === 'canada' ? 520 : 340,
      28,
      45
    );
    setSmokeModel(plume);

    const threats = InfrastructureService.calculateThreats(centerCoords, selectedRegion);
    setInfraThreats(threats);

    const plan = RoutingService.getEvacuationPlan(selectedRegion);
    setEvacPlan(plan);
  }, [selectedRegion]);

  // Smoke playback ticker
  useEffect(() => {
    if (!smokePlaying) return;
    const interval = setInterval(() => {
      setSmokeMinute((m) => {
        if (m + 15 >= 60) {
          setSmokeHour((h) => (h >= 22 ? 8 : h + 1));
          return 0;
        }
        return m + 15;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [smokePlaying]);

  return (
    <div className="lower-grid">
      {/* 1. Smoke & Air Quality */}
      <div className="panel media-panel">
        <div
          className="panel-head"
          style={{ cursor: onNavigateToTab ? 'pointer' : 'default' }}
          onClick={() => onNavigateToTab?.('Smoke & Air Quality')}
          title={lang === 'ar' ? 'انقر لفتح شاشة رصد الدخان التكتيكية' : 'Click to open Smoke & Air Quality Tactical View'}
        >
          <strong>{t.smokeAirQuality}</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <small className="source-tag">
              {smokeModel ? `AQI ${smokeModel.aqi} (${smokeModel.category})` : 'SENTINEL-5P'}
            </small>
            {onNavigateToTab && (
              <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600 }}>
                {lang === 'ar' ? 'عرض تفصيلي ↗' : 'Detailed ↗'}
              </span>
            )}
          </div>
        </div>
        <div className="media-preview-wrap" style={{ height: '110px', position: 'relative' }}>
          <RealMiniMap
            lat={selectedRegion === 'California' ? 39.85 : 38.3}
            lng={selectedRegion === 'California' ? -121.5 : 23.9}
            zoom={9}
            type="smoke"
            lang={lang}
          />
          {smokeModel && (
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '4px',
                right: '4px',
                background: 'rgba(10, 27, 42, 0.9)',
                border: '1px solid #1f3d59',
                borderRadius: '3px',
                padding: '3px 6px',
                fontSize: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#dce8f2',
                zIndex: 10,
              }}
            >
              <span>PM2.5: <b style={{ color: '#ef4444' }}>{smokeModel.pm25UgM3} µg/m³</b></span>
              <span>NO2: <b>{smokeModel.no2ColumnMolCm2}</b></span>
              <span>Drift: <b style={{ color: '#38bdf8' }}>{smokeModel.plumeCompass}</b></span>
            </div>
          )}
        </div>
        <div className="media-control">
          <button
            className={`round ${smokePlaying ? 'playing' : ''}`}
            onClick={() => setSmokePlaying((p) => !p)}
            title={smokePlaying ? 'Pause Smoke Time' : 'Play Smoke Time'}
          >
            {smokePlaying ? '⏸' : '▶'}
          </button>
          <div className="smoke-time-slider">
            <div className="time-display">
              <b>
                2024-08-12 {String(smokeHour).padStart(2, '0')}:{String(smokeMinute).padStart(2, '0')} UTC
              </b>
            </div>
            <input
              type="range"
              min="8"
              max="22"
              value={smokeHour}
              onChange={(e) => setSmokeHour(parseInt(e.target.value, 10))}
            />
          </div>
        </div>
      </div>

      {/* 2. Ground Truth / Citizen Reports */}
      <div className="panel reports-panel">
        <div 
          className="panel-head"
          style={{ cursor: onNavigateToTab ? 'pointer' : 'default' }}
          onClick={() => onNavigateToTab?.('Ground Truth')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong>{t.groundTruth}</strong>
            {onNavigateToTab && (
              <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600 }}>
                {lang === 'ar' ? 'عرض تفصيلي ↗' : 'Detailed ↗'}
              </span>
            )}
          </div>
          <small className="source-tag">{selectedRegion}</small>
        </div>
        <div className="reports-list">
          {customReports.map((r) => (
            <div key={r.id} className="report-row user-report">
              <div className="report-thumb user-thumb">📍</div>
              <div className="report-info">
                <div className="tag-line">
                  <span className={`tag tag-${r.type === 'Confirmed Fire' ? 'confirmed' : r.type === 'Possible Fire' ? 'possible' : 'false'}`}>
                    {r.type}
                  </span>
                  <small>{r.time}</small>
                </div>
                <em>Lat: {r.lat.toFixed(2)}, Lon: {r.lon.toFixed(2)}</em>
                {r.notes && <p className="report-notes">{r.notes}</p>}
              </div>
            </div>
          ))}

          {/* Regional verified reports */}
          <div className="report-row">
            <img src={report0Img} alt="Confirmed Fire" className="report-thumb" />
            <div className="report-info">
              <div className="tag-line">
                <span className="tag tag-confirmed">{t.confirmedFire}</span>
                <small>{lang === 'ar' ? 'منذ 15 دقيقة' : '15 mins ago'}</small>
              </div>
              <em>{selectedRegion === 'California' ? 'Lat: 40.02, Lon: -121.28' : 'Lat: 36.19, Lon: 27.94'}</em>
            </div>
          </div>

          <div className="report-row">
            <img src={report1Img} alt="Possible Fire" className="report-thumb" />
            <div className="report-info">
              <div className="tag-line">
                <span className="tag tag-possible">{t.possibleFire}</span>
                <small>{lang === 'ar' ? 'منذ ساعتين' : '2 hours ago'}</small>
              </div>
              <em>{selectedRegion === 'California' ? 'Lat: 39.75, Lon: -121.65' : 'Lat: 38.12, Lon: 23.70'}</em>
            </div>
          </div>

          <div className="report-row">
            <img src={report2Img} alt="False Detection" className="report-thumb" />
            <div className="report-info">
              <div className="tag-line">
                <span className="tag tag-false">{t.falseDetection}</span>
                <small>{lang === 'ar' ? 'منذ 6 ساعات' : '6 hours ago'}</small>
              </div>
              <em>{selectedRegion === 'California' ? 'Lat: 39.40, Lon: -121.50' : 'Lat: 38.50, Lon: 21.90'}</em>
            </div>
          </div>
        </div>

        <button className="primary submit-report-btn" onClick={onOpenReportModal}>
          ＋ {t.submitReport}
        </button>
      </div>

      {/* 3. Infrastructure & Proximity */}
      <div className="panel media-panel infra-panel">
        <div className="panel-head">
          <strong>{t.infraProximity}</strong>
          <small className="source-tag">{selectedRegion}</small>
        </div>
        <div className="media-preview-wrap relative" style={{ height: '110px' }}>
          <RealMiniMap
            lat={RegionService.getRegionById(selectedRegion).center.lat}
            lng={RegionService.getRegionById(selectedRegion).center.lng}
            zoom={8}
            type="infra"
            lang={lang}
          />
          <div className="radar-sweep" />
        </div>
        <div className="proximity-metrics">
          <div className="prox-row">
            <span>
              🏙 {infraThreats ? `${infraThreats.nearestCity.name}: ${infraThreats.nearestCity.distanceKm} km` : t.nearestCity}
            </span>
            <span className="divider-dot">|</span>
            <span>
              🏥 {infraThreats ? `${infraThreats.nearestHospital.name}: ${infraThreats.nearestHospital.distanceKm} km` : t.nearestHospital}
            </span>
          </div>
          <div className="pop-badge">
            <span className="pop-icon">👥</span>
            <span>
              Population within 5 km: <b>{infraThreats ? infraThreats.threatenedPopulation5km.toLocaleString() : '42,000'}</b>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Evacuation Routing */}
      <div className="panel media-panel route-panel">
        <div className="panel-head">
          <strong>{t.evacuationRouting}</strong>
          <small className="source-tag">{evacPlan ? `${evacPlan.totalDistanceKm} km` : '12 km'}</small>
        </div>
        <div className="media-preview-wrap relative" style={{ height: '110px' }}>
          <RealMiniMap
            lat={RegionService.getRegionById(selectedRegion).center.lat}
            lng={RegionService.getRegionById(selectedRegion).center.lng}
            zoom={8}
            type="route"
            lang={lang}
          />
          {/* Evacuation key overlay */}
          <div className="route-key-box">
            <div><span className="line-sample green" /> {t.suggestedRoute}</div>
            <div><span className="line-sample red" /> {t.blockedRoad}</div>
            <div><span className="pin-sample blue">📍</span> {t.evacuationPoint}</div>
          </div>
          {/* Safe Route Pill */}
          <button
            className="safe-route-pill"
            onClick={onOpenEvacRouteDetails}
            title="Inspect Evacuation Waypoints"
          >
            <span className="run-icon">🏃</span>
            <span>{evacPlan ? evacPlan.safeRoutePillLabel : t.safeRoutePill}</span>
          </button>
        </div>
      </div>

      {/* 5. Post-Fire Recovery */}
      <div className="panel recovery-panel">
        <div className="panel-head">
          <strong>{t.postFireRecovery}</strong>
          <small className="source-tag">{selectedRegion}</small>
        </div>
        {/* Split comparison slider */}
        <div
          className="recovery-split-container"
          onMouseMove={(e) => {
            if (!isDraggingSplit) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
            setSplitPos(Math.max(10, Math.min(90, pos)));
          }}
          onMouseDown={() => setIsDraggingSplit(true)}
          onMouseUp={() => setIsDraggingSplit(false)}
        >
          <img src={recoveryMapImg} alt="After Fire" className="recovery-img after" />
          <div className="recovery-over" style={{ width: `${splitPos}%` }}>
            <img src={recoveryMapImg} alt="Before Fire" className="recovery-img before" />
            <span className="split-label left">{t.before2023}</span>
          </div>
          <span className="split-label right">{t.after2024}</span>
          <div className="split-handle" style={{ left: `${splitPos}%` }}>
            <div className="handle-bar" />
          </div>
        </div>

        <div className="recovery-metrics">
          <div className="ndvi-row">
            <span>{t.ndvi}</span>
            <div className="ndvi-scale" />
            <div className="ndvi-nums">
              <span>0.1</span>
              <span>0.4</span>
              <span>0.8</span>
            </div>
          </div>
          <div className="recovery-stats">
            <div>{t.vegRecovery}</div>
            <div>{t.estRecoveryTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
