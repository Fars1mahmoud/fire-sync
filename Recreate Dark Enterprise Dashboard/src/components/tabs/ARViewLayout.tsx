import React, { useState, useEffect } from 'react';
import { RegionService } from '../../services/regionService';
import './TabViews.css';

interface ARViewLayoutProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const ARViewLayout: React.FC<ARViewLayoutProps> = ({ lang, selectedRegion }) => {
  const regDef = RegionService.getRegionById(selectedRegion);
  const [visionMode, setVisionMode] = useState<'THERMAL_IRONBOW' | 'WHITE_HOT' | 'OPTICAL' | 'NIGHT_VISION'>('THERMAL_IRONBOW');
  const [heading, setHeading] = useState<number>(142);
  const [pitch, setPitch] = useState<number>(-4);

  // Micro-telemetry fluctuations to simulate handheld tactical HUD
  useEffect(() => {
    const interval = setInterval(() => {
      setHeading((h) => (h + (Math.random() - 0.5) * 1.5 + 360) % 360);
      setPitch((p) => Math.max(-15, Math.min(15, p + (Math.random() - 0.5) * 0.8)));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tab-view-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="tab-header">
        <div className="tab-header-left">
          <div className="tab-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            👓
          </div>
          <div>
            <h2 className="tab-header-title">
              {lang === 'ar' ? `عدسة الواقع المعزز التكتيكية (AR Fire Lens) — ${regDef.nameAr}` : `Tactical Augmented Reality HUD (AR Fire Lens) — ${regDef.nameEn}`}
              <span className="badge-critical" style={{ fontSize: '0.75rem' }}>FLIR THERMAL HUD</span>
            </h2>
            <p className="tab-header-subtitle">
              {lang === 'ar'
                ? 'رؤية حرارية بالأشعة تحت الحمراء، قياس المسافة بالليزر (LiDAR)، ورصد جبهة اللهب من منظور الميدان'
                : 'FLIR synthetic thermal overlay, LiDAR rangefinder telemetry, and real-time firefighter situational HUD'}
            </p>
          </div>
        </div>

        <div className="tab-header-actions">
          {(['THERMAL_IRONBOW', 'WHITE_HOT', 'OPTICAL', 'NIGHT_VISION'] as const).map((mode) => (
            <button
              key={mode}
              className={`tab-btn ${visionMode === mode ? 'primary' : ''}`}
              style={{ fontSize: '0.78rem', padding: '5px 10px' }}
              onClick={() => setVisionMode(mode)}
            >
              {mode === 'THERMAL_IRONBOW'
                ? '🔥 FLIR Ironbow'
                : mode === 'WHITE_HOT'
                ? '⚪ White Hot'
                : mode === 'OPTICAL'
                ? '📷 RGB Optical'
                : '🟢 NVG Tactical'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tactical AR HUD Screen */}
      <div
        style={{
          width: '100%',
          height: '560px',
          borderRadius: '14px',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          background: visionMode === 'THERMAL_IRONBOW'
            ? 'radial-gradient(ellipse at 65% 55%, rgba(255, 69, 0, 0.75) 0%, rgba(138, 43, 226, 0.6) 40%, #060b19 100%)'
            : visionMode === 'WHITE_HOT'
            ? 'radial-gradient(ellipse at 65% 55%, #ffffff 0%, #888888 35%, #050505 100%)'
            : visionMode === 'NIGHT_VISION'
            ? 'radial-gradient(ellipse at 65% 55%, #22c55e 0%, #14532d 40%, #022c22 100%)'
            : 'radial-gradient(ellipse at 65% 55%, #ea580c 0%, #78350f 40%, #0f172a 100%)',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.15) inset, 0 8px 30px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* HUD Crosshairs & Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Center Target Box */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '180px',
            height: '180px',
            border: '2px dashed rgba(56, 189, 248, 0.7)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }} />
          <div style={{ position: 'absolute', top: '-24px', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>
            TARGET ACQUIRED: 340 MW
          </div>
          <div style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: '#f87171', fontWeight: 'bold' }}>
            LiDAR: 1,420 METERS
          </div>
        </div>

        {/* Top HUD Telemetry Bar */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#38bdf8',
            background: 'rgba(11, 23, 44, 0.75)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          <span>HDG: {heading.toFixed(1)}° ({regDef.center.lat.toFixed(2)}N, {regDef.center.lng.toFixed(2)}E)</span>
          <span>PITCH: {pitch.toFixed(1)}° | ROLL: 0.2°</span>
          <span>FLIR RESOLUTION: 640×512 NETD &lt;40mK</span>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>● REC [00:14:28]</span>
        </div>

        {/* Bottom Left Flame Telemetry */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(11, 23, 44, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            padding: '12px 18px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>🎯 {lang === 'ar' ? 'البيانات الحرارية المباشرة' : 'ACTIVE TARGET TELEMETRY'}</div>
          <div>FLAME TEMP: <span style={{ color: '#f97316', fontWeight: 'bold' }}>740°C (1,013 K)</span></div>
          <div>FLAME HEIGHT: <span style={{ color: '#facc15' }}>6.8 m (Canopy Torch)</span></div>
          <div>WIND DRIFT: <span style={{ color: '#38bdf8' }}>SE 28 km/h</span></div>
          <div>SUPPRESSION WATER DROP ETA: <span style={{ color: '#34d399', fontWeight: 'bold' }}>02:15 MIN</span></div>
        </div>

        {/* Bottom Right Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            className="tab-btn primary"
            onClick={() => alert(lang === 'ar' ? 'تم التقاط وحفظ لقطة حرارية عالية الدقة مع إحداثيات GPS.' : 'Tactical thermal snapshot captured with embedded GPS coordinates.')}
          >
            📸 {lang === 'ar' ? 'التقاط صورة حرارية' : 'Thermal Snapshot'}
          </button>
          <button
            className="tab-btn"
            onClick={() => alert(lang === 'ar' ? 'تم إرسال قياسات LiDAR إلى طاقم الإطفاء الميداني.' : 'LiDAR target telemetry synced to engine crew tablets.')}
          >
            📡 {lang === 'ar' ? 'مزامنة مع الطواقم الميدانية' : 'Sync to Engine Tablets'}
          </button>
        </div>
      </div>
    </div>
  );
};
