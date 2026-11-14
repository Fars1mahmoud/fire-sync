import React, { useState } from 'react';

interface ARFireLensModalProps {
  lang: 'en' | 'ar';
  onClose: () => void;
}

export const ARFireLensModal: React.FC<ARFireLensModalProps> = ({ lang, onClose }) => {
  const [thermalFilter, setThermalFilter] = useState<'Standard AR' | 'Thermal FLIR' | 'Topographic Wireframe'>('Standard AR');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="ar-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* AR HUD Header */}
        <div className="ar-header">
          <div className="ar-title">
            <span className="ar-rec-dot" />
            <b>AR FIRE LENS — TACTICAL HELMET HUD</b>
            <small>Sensor Fusion: Optical RGB + FLIR LWIR + Satellite FIRMS Overlay</small>
          </div>
          <div className="ar-modes">
            {(['Standard AR', 'Thermal FLIR', 'Topographic Wireframe'] as const).map((m) => (
              <button
                key={m}
                className={thermalFilter === m ? 'active' : ''}
                onClick={() => setThermalFilter(m)}
              >
                {m}
              </button>
            ))}
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Viewport Simulation */}
        <div className={`ar-viewport ${thermalFilter.toLowerCase().replace(' ', '-')}`}>
          {/* Simulated Smoky Ridge Camera Feed */}
          <div className="ar-smoke-layer" />

          {/* Augmented Topographic Terrain Wireframe */}
          <svg className="ar-wireframe-svg" viewBox="0 0 800 500" preserveAspectRatio="none">
            <path
              d="M 0,380 Q 200,220 400,290 T 800,240 L 800,500 L 0,500 Z"
              fill="rgba(6, 78, 59, 0.2)"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <path
              d="M 0,310 Q 250,180 500,220 T 800,160"
              fill="none"
              stroke="#059669"
              strokeWidth="1"
              strokeDasharray="6 4"
            />

            {/* Augmented Hidden Fire Front Behind Smoke */}
            <path
              d="M 280,260 Q 420,240 580,250"
              fill="none"
              stroke="#ef4444"
              strokeWidth="5"
              filter="drop-shadow(0 0 12px #ff1a1a)"
            />
            <text x="360" y="235" fill="#fca5a5" fontSize="13" fontWeight="bold" filter="drop-shadow(0 2px 4px #000)">
              🔥 FLAME FRONT (840°C)
            </text>
          </svg>

          {/* HUD Reticle & Rangefinder */}
          <div className="ar-reticle">
            <div className="crosshair-h" />
            <div className="crosshair-v" />
            <div className="rangefinder-badge">
              <b>DISTANCE: 850 m</b>
              <span>Elevation: +142 m • Heading: 135° SE</span>
            </div>
          </div>

          {/* Environmental Telemetry Overlay */}
          <div className="ar-telemetry-hud">
            <div className="hud-metric">
              <span>WIND SPEED</span>
              <strong>18 km/h NW</strong>
            </div>
            <div className="hud-metric">
              <span>SMOKE DENSITY</span>
              <strong>PM2.5: 184 µg/m³</strong>
            </div>
            <div className="hud-metric danger">
              <span>FLASHOVER RISK</span>
              <strong>CRITICAL (88%)</strong>
            </div>
            <div className="hud-metric green">
              <span>RETREAT ROUTE</span>
              <strong>BEARING 310° (OPEN)</strong>
            </div>
          </div>
        </div>

        {/* AR Footer */}
        <div className="ar-footer">
          <span>📡 Connected to Suomi-NPP VIIRS telemetry downlink. Real-time accuracy: ±1.5m</span>
          <button className="primary" onClick={onClose}>
            {lang === 'ar' ? 'إغلاق العدسة' : 'Exit AR Lens'}
          </button>
        </div>
      </div>
    </div>
  );
};
