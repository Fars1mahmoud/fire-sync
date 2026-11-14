import React, { useState, useEffect, useRef } from 'react';
import { TRANSLATIONS } from '../data/wildfireData';
import {
  WeatherService,
  NasaPowerService,
  BiodiversityService,
  type ProtectedSanctuary,
} from '../services';
import f2018 from '../assets/crops/forest_2018.png';
import f2019 from '../assets/crops/forest_2019.png';
import f2020 from '../assets/crops/forest_2020.png';
import f2021 from '../assets/crops/forest_2021.png';
import f2022 from '../assets/crops/forest_2022.png';
import f2023 from '../assets/crops/forest_2023.png';
import f2024 from '../assets/crops/forest_2024.png';
import simMapImg from '../assets/crops/sim_map.png';
import deerImg from '../assets/crops/biodiversity_deer.png';

interface FooterGridProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  onGenerateReport: (type: string, isBilingual: boolean) => void;
  onOpenBiodiversityModal: () => void;
}

export const FooterGrid: React.FC<FooterGridProps> = ({
  lang,
  selectedRegion,
  onGenerateReport,
  onOpenBiodiversityModal,
}) => {
  const t = TRANSLATIONS[lang];

  // Forest Time Machine states
  const [activeForestYear, setActiveForestYear] = useState(2024);
  const [isForestPlaying, setIsForestPlaying] = useState(false);

  // What-If Simulator inputs
  const isCal = selectedRegion === 'California';
  const [simWindSpeed, setSimWindSpeed] = useState(isCal ? 52 : 42);
  const [simWindDir, setSimWindDir] = useState(isCal ? 'NE' : 'NE');
  const [simTemp, setSimTemp] = useState(isCal ? 39 : 36);
  const [simMoisture, setSimMoisture] = useState(isCal ? 11 : 18);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sonification states & Web Audio
  const [isSonifying, setIsSonifying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Situation report selection
  const [reportType, setReportType] = useState('Full Analysis');
  const [reportLang, setReportLang] = useState('en');

  // Sanctuary data
  const [sanctuary, setSanctuary] = useState<ProtectedSanctuary | null>(null);

  useEffect(() => {
    setSanctuary(BiodiversityService.getRegionalSanctuary(selectedRegion));
  }, [selectedRegion]);

  // Forest Time Machine ticker
  useEffect(() => {
    if (!isForestPlaying) return;
    const interval = setInterval(() => {
      setActiveForestYear((y) => (y >= 2024 ? 2018 : y + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isForestPlaying]);

  // Audio Sonification Synth (Web Audio API)
  const toggleSonification = () => {
    if (isSonifying) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsSonifying(false);
    } else {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioContextClass();
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        // Base frequency tied to regional fire intensity (California 540Hz vs Med 420Hz)
        const baseFreq = isCal ? 540 : 420;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, ctx.currentTime + 1.2);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, ctx.currentTime + 2.5);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        oscRef.current = osc;
        setIsSonifying(true);

        // Auto-stop after 8 seconds
        setTimeout(() => {
          if (oscRef.current) {
            try {
              oscRef.current.stop();
              oscRef.current.disconnect();
              oscRef.current = null;
            } catch {
              // ignore
            }
            setIsSonifying(false);
          }
        }, 8000);
      } catch (e) {
        console.warn('Audio context init note:', e);
        setIsSonifying(true);
      }
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 700);
  };

  const forestImages = [
    { year: 2018, src: f2018 },
    { year: 2019, src: f2019 },
    { year: 2020, src: f2020 },
    { year: 2021, src: f2021 },
    { year: 2022, src: f2022 },
    { year: 2023, src: f2023 },
    { year: 2024, src: f2024 },
  ];

  return (
    <div className="footer-grid">
      {/* 1. Forest Time Machine */}
      <div className="panel timeline-panel">
        <div className="panel-head">
          <strong>{t.forestTimeMachine}</strong>
          <small className="source-tag">{selectedRegion}</small>
        </div>
        <div className="forest-years-grid">
          {forestImages.map((item) => (
            <div
              key={item.year}
              className={`forest-item ${activeForestYear === item.year ? 'active-year-crop' : ''}`}
              onClick={() => setActiveForestYear(item.year)}
            >
              <img src={item.src} alt={`Forest satellite ${item.year}`} className="forest-thumb" />
              <span>{item.year}</span>
            </div>
          ))}
        </div>
        <div className="timeline-control">
          <button
            className={`round ${isForestPlaying ? 'playing' : ''}`}
            onClick={() => setIsForestPlaying((p) => !p)}
            title={isForestPlaying ? 'Pause Time Machine' : 'Play Time Machine'}
          >
            {isForestPlaying ? '⏸' : '▶'}
          </button>
          <input
            type="range"
            min="2018"
            max="2024"
            value={activeForestYear}
            onChange={(e) => setActiveForestYear(parseInt(e.target.value, 10))}
          />
        </div>
      </div>

      {/* 2. What-If Fire Simulator */}
      <div className="panel sim-panel">
        <div className="panel-head">
          <strong>{t.whatIfSimulator}</strong>
          <small className="source-tag">ROTHERMEL MODEL</small>
        </div>
        <div className="sim-layout">
          <div className="sim-controls">
            <div className="sim-field">
              <label>{t.windSpeed} ({simWindSpeed} km/h)</label>
              <input
                type="range"
                min="5"
                max="85"
                value={simWindSpeed}
                onChange={(e) => setSimWindSpeed(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="sim-field">
              <label>{t.windDir}</label>
              <select value={simWindDir} onChange={(e) => setSimWindDir(e.target.value)}>
                <option value="N">N (North)</option>
                <option value="NE">NE (Northeast - Diablo/Meltemi)</option>
                <option value="E">E (East)</option>
                <option value="SE">SE (Southeast)</option>
                <option value="S">S (South)</option>
                <option value="SW">SW (Southwest)</option>
                <option value="W">W (West)</option>
                <option value="NW">NW (Northwest)</option>
              </select>
            </div>

            <div className="sim-field">
              <label>{t.temp} ({simTemp}°C)</label>
              <input
                type="range"
                min="20"
                max="48"
                value={simTemp}
                onChange={(e) => setSimTemp(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="sim-field">
              <label>{t.soilMoisture} ({simMoisture}%)</label>
              <input
                type="range"
                min="5"
                max="45"
                value={simMoisture}
                onChange={(e) => setSimMoisture(parseInt(e.target.value, 10))}
              />
            </div>

            <button
              className={`primary run-sim-btn ${isSimulating ? 'simulating' : ''}`}
              onClick={handleRunSimulation}
            >
              {isSimulating ? (lang === 'ar' ? 'جاري الحساب...' : 'Calculating...') : t.runSimulation}
            </button>

            {/* Dynamic Physics Simulation Metrics */}
            {(() => {
              const metrics = NasaPowerService.simulateWhatIf({
                windSpeedKmh: simWindSpeed,
                windDirectionDeg: 35,
                temperatureC: simTemp,
                soilMoisturePct: simMoisture,
              });
              return (
                <div style={{ background: '#0a1d2e', border: '1px solid #1c3d5e', borderRadius: '4px', padding: '6px', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8da4b8' }}>FWI Score:</span>
                    <strong style={{ color: metrics.riskLevel === 'Extreme' ? '#ef4444' : '#eab308' }}>{metrics.fwi} ({metrics.riskLevel})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8da4b8' }}>Spread Rate:</span>
                    <strong style={{ color: '#38bdf8' }}>{metrics.spreadRateMetersPerMin} m/min</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8da4b8' }}>Projected 72h:</span>
                    <strong style={{ color: '#fff' }}>~{metrics.projectedAcresIn3Days.toLocaleString()} ac</strong>
                  </div>
                </div>
              );
            })()}

            <div className="sim-extra-field">
              <label>{lang === 'ar' ? 'الأنواع المهددة:' : 'Species at risk:'}</label>
              <span className="risk-count-badge">{sanctuary ? sanctuary.species.length : 3}</span>
            </div>
          </div>

          <div className="sim-map-wrap">
            <img src={simMapImg} alt="Predicted spread simulation" className="sim-map-img" />
            <div className="sim-legend-bar">
              <span className="legend-label">{t.predictedSpread}</span>
              <div className="spread-bar" />
              <div className="spread-ticks">
                <span>{t.low}</span>
                <span>{t.high}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fire Data Sonification */}
      <div className="panel audio-panel">
        <div className="panel-head">
          <strong>{t.fireDataSonification}</strong>
          <small className="source-tag">WEB AUDIO SYNTH</small>
        </div>
        <div className="audio-body">
          <button
            className={`round ${isSonifying ? 'sonifying-pulse' : ''}`}
            onClick={toggleSonification}
            title={isSonifying ? 'Stop Sonification Audio' : 'Play Sonification Audio'}
          >
            {isSonifying ? '⏹' : '▶'}
          </button>
          <div className="audio-visualizer">
            <div className={`audio-bar ${isSonifying ? 'active' : ''}`} style={{ height: '35%' }} />
            <div className={`audio-bar ${isSonifying ? 'active' : ''}`} style={{ height: '70%' }} />
            <div className={`audio-bar ${isSonifying ? 'active' : ''}`} style={{ height: '100%' }} />
            <div className={`audio-bar ${isSonifying ? 'active' : ''}`} style={{ height: '60%' }} />
            <div className={`audio-bar ${isSonifying ? 'active' : ''}`} style={{ height: '40%' }} />
            <div className={`audio-bar ${isSonifying ? 'active' : ''}`} style={{ height: '85%' }} />
            <div className={`audio-bar ${isSonifying ? 'active' : ''}`} style={{ height: '50%' }} />
          </div>
        </div>
      </div>

      {/* 4. Biodiversity Alert */}
      <div className="panel bio-panel">
        <div className="panel-head">
          <strong>{t.biodiversityAlert}</strong>
          <small className="source-tag">IUCN RED LIST</small>
        </div>
        <div className="bio-card" onClick={onOpenBiodiversityModal} style={{ cursor: 'pointer' }}>
          <img src={deerImg} alt="Endangered Wildlife Sanctuary" className="bio-img" />
          <div className="bio-info">
            <div className="bio-title">
              <span className="bio-badge">⚠️ {sanctuary ? sanctuary.name.split('/')[0] : 'Protected Reserve'}</span>
            </div>
            <div className="bio-detail">
              <span>{selectedRegion === 'California' ? 'Yosemite & Sierra Crest' : t.distance4km}</span>
              <span className="dot-sep">•</span>
              <span>Species at risk: <b>{sanctuary ? sanctuary.species.length : 3}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Generate Situation Report (SITREP) */}
      <div className="panel sitrep-panel">
        <div className="panel-head">
          <strong>{t.generateSituationReport}</strong>
          <small className="source-tag">{selectedRegion}</small>
        </div>
        <div className="sitrep-form">
          <label className="sitrep-field">
            <span>{t.reportType}</span>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="Full Analysis">{t.fullAnalysis}</option>
              <option value="Executive Summary">{lang === 'ar' ? 'ملخص تنفيذي' : 'Executive Summary'}</option>
              <option value="Tactical Operations">{lang === 'ar' ? 'العمليات التكتيكية' : 'Tactical Operations'}</option>
            </select>
          </label>

          <label className="sitrep-field">
            <span>{t.language}</span>
            <select value={reportLang} onChange={(e) => setReportLang(e.target.value)}>
              <option value="en">English (US Official)</option>
              <option value="bilingual">{t.bilingualReport}</option>
            </select>
          </label>

          <button
            className="primary sitrep-btn"
            onClick={() => onGenerateReport(reportType, reportLang === 'bilingual')}
          >
            📄 {t.generatePdf}
          </button>
        </div>
      </div>
    </div>
  );
};
