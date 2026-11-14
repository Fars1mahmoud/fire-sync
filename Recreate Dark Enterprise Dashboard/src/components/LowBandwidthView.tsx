import React from 'react';
import { TACTICAL_FLEET, SATELLITE_OVERPASS_SCHEDULE, TRANSLATIONS } from '../data/wildfireData';
import { REGIONAL_HOTSPOTS_DATABASE, SatelliteService } from '../services';

interface LowBandwidthViewProps {
  lang: 'en' | 'ar';
  selectedRegion?: string;
  onExit: () => void;
  emergencyMode: boolean;
}

export const LowBandwidthView: React.FC<LowBandwidthViewProps> = ({ lang, selectedRegion = 'Mediterranean Basin', onExit, emergencyMode }) => {
  const t = TRANSLATIONS[lang];
  const isCal = selectedRegion === 'California';

  const hotspots = REGIONAL_HOTSPOTS_DATABASE.filter(
    (h) => selectedRegion === 'Global (Beta)' || h.region === selectedRegion
  );

  const overpasses = SatelliteService.getOverpassesForRegion(selectedRegion);

  return (
    <div className="low-bandwidth-container">
      {/* Top Banner */}
      <div className="lb-header">
        <div>
          <h2>⚡ NASA FIRE SYNC — LOW-BANDWIDTH FIELD TERMINAL</h2>
          <small>Bandwidth Usage: &lt; 12 KB • Offline-Optimized for Remote Forest Crews • Region: {selectedRegion}</small>
        </div>
        <button className="lb-exit-btn" onClick={onExit}>
          🖥 {lang === 'ar' ? 'العودة للوضع الرسومي الكامل' : 'Exit to Full Satellite Mode'}
        </button>
      </div>

      {/* Critical Status Grid */}
      <div className="lb-grid">
        {/* Box 1: Urgent Emergency Warnings */}
        <div className="lb-card alert-card">
          <h3>🚨 {emergencyMode ? 'EMERGENCY CRISIS ACTIVE' : 'ACTIVE THREAT ADVISORY'}</h3>
          <ul>
            {isCal ? (
              <>
                <li><strong>SECTOR SIERRA / BUTTE:</strong> Extreme FRP (385 MW). Sustained 52 km/h Diablo gusts pushing flame SW.</li>
                <li><strong>SECTOR OROVILLE:</strong> Wildfire perimeter 3.8 km from Thermalito Diversion Pool. Evac corridor Hwy 70 active.</li>
                <li><strong>WIND VECTOR:</strong> NE (45°) @ 52 km/h. Critical ignitability (KBDI 742, RH 11%).</li>
              </>
            ) : (
              <>
                <li><strong>SECTOR RHODES:</strong> Extreme FRP (340 MW). Sustained 42 km/h gusts pushing flame SE.</li>
                <li><strong>SECTOR ATTICA:</strong> Forest perimeter 4.1 km from Mount Parnitha reserve. Evac corridor 8A open.</li>
                <li><strong>WIND VECTOR:</strong> NE (45°) @ 42 km/h. High ignitability (KBDI 680, RH 18%).</li>
              </>
            )}
          </ul>
        </div>

        {/* Box 2: Live Hotspot Table */}
        <div className="lb-card">
          <h3>🔥 ACTIVE FIRE HOTSPOTS ({selectedRegion})</h3>
          <table className="lb-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th>Location</th>
                <th>GPS (Lat, Lon)</th>
                <th>FRP</th>
                <th>Status</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((h) => (
                <tr key={h.id}>
                  <td><strong>{h.name}</strong></td>
                  <td>{h.stateOrRegion}, {h.country}</td>
                  <td>{h.lat}°N, {h.lon}°E</td>
                  <td><strong>{h.frp} MW</strong></td>
                  <td>
                    <span className={`lb-badge ${h.status.toLowerCase()}`}>{h.status}</span>
                  </td>
                  <td>{h.confidence}% ({h.satellite})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Box 3: Aircraft & Water Dropping Fleet */}
        <div className="lb-card">
          <h3>✈️ TACTICAL AIRCRAFT COMMITMENTS</h3>
          <table className="lb-table">
            <thead>
              <tr>
                <th>Callsign</th>
                <th>Aircraft</th>
                <th>Mission Status</th>
                <th>Water Payload</th>
                <th>Target Hotspot</th>
              </tr>
            </thead>
            <tbody>
              {TACTICAL_FLEET.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.callsign}</strong></td>
                  <td>{a.type}</td>
                  <td>{a.status}</td>
                  <td>{a.waterCapacityLiters.toLocaleString()} L</td>
                  <td>{a.targetHotspot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Box 4: Upcoming Satellite Overpasses */}
        <div className="lb-card">
          <h3>🛰 SATELLITE OVERPASS SCHEDULE ({selectedRegion})</h3>
          <div className="lb-overpass-list">
            {overpasses.map((s) => (
              <div key={s.satellite} className="lb-overpass-row">
                <span>🛰 <strong>{s.satellite}</strong> ({s.sensor})</span>
                <span>{s.overpassTimeUTC}</span>
                <span className="lb-countdown">In {s.countdownMinutes} min</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
