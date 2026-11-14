import React, { useState } from 'react';
import {
  type Hotspot,
  type TacticalAircraft,
  TRANSLATIONS,
} from '../data/wildfireData';
import {
  ExportService,
  ReportService,
  AlertService,
  WeatherService,
  RiskService,
  RoutingService,
  type LatLngPoint,
} from '../services';

interface ModalsProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  activeFires: Hotspot[];
  activePolygon: LatLngPoint[] | null;

  showReportModal: boolean;
  setShowReportModal: (v: boolean) => void;
  onSubmitCitizenReport: (report: {
    type: 'Confirmed Fire' | 'Possible Fire' | 'False Detection';
    lat: number;
    lon: number;
    notes: string;
  }) => void;

  showSituationModal: boolean;
  setShowSituationModal: (v: boolean) => void;
  reportConfig: { type: string; isBilingual: boolean };

  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;

  showEvacModal: boolean;
  setShowEvacModal: (v: boolean) => void;

  showBioModal: boolean;
  setShowBioModal: (v: boolean) => void;

  showBroadcastModal: boolean;
  setShowBroadcastModal: (v: boolean) => void;

  showExportModal: boolean;
  setShowExportModal: (v: boolean) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  lang,
  selectedRegion,
  activeFires,
  activePolygon,
  showReportModal,
  setShowReportModal,
  onSubmitCitizenReport,
  showSituationModal,
  setShowSituationModal,
  reportConfig,
  showNotifications,
  setShowNotifications,
  showEvacModal,
  setShowEvacModal,
  showBioModal,
  setShowBioModal,
  showBroadcastModal,
  setShowBroadcastModal,
  showExportModal,
  setShowExportModal,
}) => {
  const t = TRANSLATIONS[lang];
  const isCal = selectedRegion === 'California';

  // Citizen report form state
  const [repType, setRepType] = useState<'Confirmed Fire' | 'Possible Fire' | 'False Detection'>('Confirmed Fire');
  const [repLat, setRepLat] = useState(isCal ? '40.05' : '37.95');
  const [repLon, setRepLon] = useState(isCal ? '-121.25' : '23.82');
  const [repNotes, setRepNotes] = useState('Active crown fire front observed approaching ridge with heavy smoke.');

  // Emergency broadcast simulator states
  const [broadcastChannel, setBroadcastChannel] = useState<'Cell Broadcast' | 'SMS' | 'WhatsApp / Telegram'>('Cell Broadcast');
  const [broadcastTargetZone, setBroadcastTargetZone] = useState(
    isCal ? 'Plumas & Butte County Corridor (Zone 1) — 48,000 residents' : 'Rhodes Southern Municipalities (Zone 4) — 18,500 residents'
  );
  const [broadcastMsg, setBroadcastMsg] = useState(
    isCal
      ? 'EMERGENCY EVACUATION ORDER: Wildfire spreading westward. Immediate evacuation ordered via Skyway toward Chico. Avoid Feather River Canyon.'
      : 'EMERGENCY EVACUATION ORDER: Wildfire front approaching. Evacuate immediately via Coastal Highway 8A towards Corinth. Do not use Mountain Route 3.'
  );
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(repLat) || (isCal ? 40.0 : 37.8);
    const lon = parseFloat(repLon) || (isCal ? -121.0 : 23.7);

    AlertService.submitCitizenReport({
      location: `${selectedRegion} Ground Unit`,
      coords: { lat, lng: lon },
      type: repType,
      reporterId: 'CivicWatch-Field',
      notes: repNotes,
    });

    onSubmitCitizenReport({
      type: repType,
      lat,
      lon,
      notes: repNotes,
    });
    setShowReportModal(false);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setShowBroadcastModal(false);
    }, 2000);
  };

  // Suppression engineering model
  const totalFRP = activeFires.reduce((sum, h) => sum + h.frp, 0);
  const totalAcres = activeFires.reduce((sum, h) => sum + h.acres, 0);
  const totalHa = Math.round(totalAcres * 0.404686);

  const suppression = {
    firelineKm: Math.round(0.08 * Math.sqrt(totalHa * 10000) * 10) / 10,
    waterTonsRequired: Math.round((totalFRP * 12.5) / 100),
    retardantFoamTons: Math.round(((totalFRP * 12.5) / 100) * 0.08),
    aerialDropsNeeded: Math.ceil(((totalFRP * 12.5) / 100 * 1000) / 6140),
    estimatedContainmentHours: Math.round(Math.max(12, 0.08 * Math.sqrt(totalHa * 10000) * 1.8)),
  };

  // Trigger professional SITREP export
  const handlePrintSitrep = async () => {
    const weather = await WeatherService.getRegionalWeather(selectedRegion);
    const risk = RiskService.computeRisk({
      region: selectedRegion,
      temperatureC: weather.temperatureC,
      relativeHumidityPct: weather.relativeHumidityPct,
      windSpeedKmh: weather.windSpeedKmh,
      droughtIndexKBDI: weather.droughtIndexKBDI,
      activeHotspotCount: activeFires.length,
      historicalMonthAverage: isCal ? 185 : 142,
    });
    const evac = RoutingService.getEvacuationPlan(selectedRegion);

    ReportService.printOrSaveReport({
      region: selectedRegion,
      timestampUTC: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
      hotspots: activeFires,
      weather,
      risk,
      evac,
      isBilingual: reportConfig.isBilingual,
    });
  };

  return (
    <>
      {/* 1. Citizen Report Form Modal */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📍 {lang === 'ar' ? 'إرسال بلاغ ميداني (Ground Truth)' : 'Submit Ground Truth / Field Report'}</h3>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitReport} className="modal-form">
              <label>
                {lang === 'ar' ? 'تصنيف البلاغ:' : 'Report Category:'}
                <select value={repType} onChange={(e) => setRepType(e.target.value as typeof repType)}>
                  <option value="Confirmed Fire">🔥 {t.confirmedFire}</option>
                  <option value="Possible Fire">⚠️ {t.possibleFire}</option>
                  <option value="False Detection">✕ {t.falseDetection}</option>
                </select>
              </label>

              <div className="coords-inputs">
                <label>
                  {lang === 'ar' ? 'خط العرض (Latitude):' : 'Latitude:'}
                  <input type="text" value={repLat} onChange={(e) => setRepLat(e.target.value)} required />
                </label>
                <label>
                  {lang === 'ar' ? 'خط الطول (Longitude):' : 'Longitude:'}
                  <input type="text" value={repLon} onChange={(e) => setRepLon(e.target.value)} required />
                </label>
              </div>

              <label>
                {lang === 'ar' ? 'ملاحظات المعاينة الميدانية:' : 'Field Observations & Description:'}
                <textarea
                  rows={3}
                  value={repNotes}
                  onChange={(e) => setRepNotes(e.target.value)}
                  placeholder="Describe flame height, smoke color, prevailing wind, nearby structures..."
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowReportModal(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="primary btn-submit">
                  {lang === 'ar' ? 'إرسال البلاغ الفوري' : 'Submit Ground Truth Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Situation Report Modal (Executive SITREP) */}
      {showSituationModal && (
        <div className="modal-backdrop" onClick={() => setShowSituationModal(false)}>
          <div className="modal-card wide-report-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>📄 NASA FIRE SYNC &mdash; EXECUTIVE SITUATION REPORT (SITREP)</h3>
                <small>Operational Scope: {selectedRegion} • Active Fires Filtered: {activeFires.length} • Doc: SITREP-{Date.now()}</small>
              </div>
              <button className="close-btn" onClick={() => setShowSituationModal(false)}>✕</button>
            </div>

            <div className="report-doc-body">
              <div className="report-doc-badge">
                <b>OFFICIAL DISASTER RESPONSE DOCUMENT &mdash; {selectedRegion.toUpperCase()}</b>
                <span>Authorized by Copernicus Emergency Management & NASA FIRMS Program</span>
              </div>

              <h4>1. Incident Overview & Operational Context ({reportConfig.type})</h4>
              <p>
                Severe wildfire escalation detected across <strong>{selectedRegion}</strong>. Total thermal radiative output
                measured across active perimeters is <strong>{totalFRP.toLocaleString()} MW</strong> spanning approximately{' '}
                <strong>{totalHa.toLocaleString()} hectares</strong> ({totalAcres.toLocaleString()} acres).
                Civil defense and aerial coordination are mobilized under Emergency Protocol.
              </p>

              <div className="report-kpi-grid">
                <div className="report-kpi">
                  <span>Active Hotspots</span>
                  <b>{activeFires.length}</b>
                </div>
                <div className="report-kpi">
                  <span>Cumulative Burn Area</span>
                  <b>{totalHa.toLocaleString()} ha</b>
                </div>
                <div className="report-kpi">
                  <span>Peak Radiative Power</span>
                  <b style={{ color: '#dc2626' }}>{totalFRP.toLocaleString()} MW</b>
                </div>
                <div className="report-kpi">
                  <span>Critical Fronts</span>
                  <b>{activeFires.filter((f) => f.status === 'Critical').length}</b>
                </div>
              </div>

              <h4>2. Fire Suppression Resource Demands (Engineering Model)</h4>
              <div className="suppression-stats-grid">
                <div><span>Total Fireline Required:</span> <strong>{suppression.firelineKm} km</strong></div>
                <div><span>Water Suppression Volume:</span> <strong>{suppression.waterTonsRequired.toLocaleString()} Tons</strong></div>
                <div><span>Chemical Retardant Foam:</span> <strong>{suppression.retardantFoamTons} Tons</strong></div>
                <div><span>Canadair Aerial Drops Needed:</span> <strong>{suppression.aerialDropsNeeded} drops</strong></div>
                <div><span>Estimated Containment Time:</span> <strong>~{suppression.estimatedContainmentHours} Hours</strong></div>
              </div>

              <h4>3. Priority Thermal Hotspots (NASA FIRMS VIIRS & MODIS)</h4>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Sector / Front</th>
                    <th>Coordinates</th>
                    <th>FRP (MW)</th>
                    <th>Temp (K)</th>
                    <th>Sensor Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeFires.map((h) => (
                    <tr key={h.id}>
                      <td><strong>{h.name}</strong> ({h.country})</td>
                      <td>{h.lat.toFixed(3)}, {h.lon.toFixed(3)}</td>
                      <td style={{ color: '#dc2626', fontWeight: 'bold' }}>{h.frp} MW</td>
                      <td>{h.tempK} K</td>
                      <td>{h.satellite} ({h.confidence}%)</td>
                      <td><span className="critical-tag">{h.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button className="primary" onClick={handlePrintSitrep}>
                🖨 {lang === 'ar' ? 'طباعة / تصدير PDF رسمي' : 'Print / Export Official PDF'}
              </button>
              <button className="btn-cancel" onClick={() => setShowSituationModal(false)}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Emergency Broadcast Simulator Modal */}
      {showBroadcastModal && (
        <div className="modal-backdrop" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📡 {lang === 'ar' ? 'محاكي بث رسائل الطوارئ للسكان' : 'Emergency Public Broadcast Simulator'}</h3>
              <button className="close-btn" onClick={() => setShowBroadcastModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSendBroadcast} className="modal-form">
              <label>
                {lang === 'ar' ? 'قناة البث اللاسلكي:' : 'Transmission Channel:'}
                <select value={broadcastChannel} onChange={(e) => setBroadcastChannel(e.target.value as typeof broadcastChannel)}>
                  <option value="Cell Broadcast">📶 Cell Broadcast (National Wireless Emergency Alert - WEA)</option>
                  <option value="SMS">📱 Emergency SMS (Geofenced Carrier Dispatch)</option>
                  <option value="WhatsApp / Telegram">💬 Civil Defense Alert Push</option>
                </select>
              </label>

              <label>
                {lang === 'ar' ? 'النطاق الجغرافي المستهدف:' : 'Target Geofenced Perimeter:'}
                <select value={broadcastTargetZone} onChange={(e) => setBroadcastTargetZone(e.target.value)}>
                  {isCal ? (
                    <>
                      <option>Plumas & Butte County Corridor (Zone 1) &mdash; 48,000 residents</option>
                      <option>Paradise Skyway Evacuation Sector (Zone 2) &mdash; 26,500 residents</option>
                      <option>Angeles Forest Foothills (Zone 3) &mdash; 75,000 residents</option>
                    </>
                  ) : (
                    <>
                      <option>Rhodes Southern Municipalities (Zone 4) &mdash; 18,500 residents</option>
                      <option>Attica / Mount Parnitha Foothills (Zone 1) &mdash; 42,000 residents</option>
                      <option>Sicily Palermo Coastal Perimeter (Zone 2) &mdash; 26,000 residents</option>
                    </>
                  )}
                </select>
              </label>

              <label>
                {lang === 'ar' ? 'نص رسالة الطوارئ العاجلة:' : 'Broadcast Alert Message:'}
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  required
                />
              </label>

              {broadcastSent && (
                <div className="broadcast-success-notice">
                  ✅ <strong>Alert Transmitted!</strong> Successfully dispatched to cellular towers and mobile emergency receivers in target geofence.
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowBroadcastModal(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="emergency btn-submit">
                  📡 {lang === 'ar' ? 'بث الإنذار الفوري' : 'Transmit Emergency Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. GIS Data Export Modal */}
      {showExportModal && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💾 {lang === 'ar' ? 'تصدير بيانات نظم المعلومات الجغرافية (GIS)' : 'Export Filtered GIS Data'}</h3>
              <button className="close-btn" onClick={() => setShowExportModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <p style={{ color: '#a3b9cc', fontSize: '11px', margin: 0 }}>
                {lang === 'ar'
                  ? `تصدير بيانات ${activeFires.length} نقطة حريق نشطة مطابقة للفلاتر الحالية لـ (${selectedRegion}) لاستخدامها في برامج مثل ArcGIS و QGIS و Google Earth.`
                  : `Exporting ${activeFires.length} active thermal anomaly features matching current filters for (${selectedRegion}${activePolygon ? ' + Custom Polygon' : ''}) into standard geospatial GIS formats.`}
              </p>

              <div className="export-options-grid">
                <div className="export-option-card">
                  <b>GeoJSON (.geojson)</b>
                  <small>OGC standard geospatial vector format with WGS84 coordinates & attributes</small>
                  <button
                    className="primary"
                    onClick={() => {
                      const content = ExportService.exportToGeoJSON(activeFires);
                      ExportService.downloadFile(content, `NASA_FireSync_${selectedRegion.replace(/\s+/g, '_')}_Hotspots.geojson`, 'application/geo+json');
                    }}
                  >
                    ⬇ Download GeoJSON
                  </button>
                </div>

                <div className="export-option-card">
                  <b>Google Earth KML (.kml)</b>
                  <small>3D placemarks with FRP ratings and satellite confidence values</small>
                  <button
                    className="primary"
                    onClick={() => {
                      const content = ExportService.exportToKML(activeFires);
                      ExportService.downloadFile(content, `NASA_FireSync_${selectedRegion.replace(/\s+/g, '_')}_Hotspots.kml`, 'application/vnd.google-earth.kml+xml');
                    }}
                  >
                    ⬇ Download KML
                  </button>
                </div>

                <div className="export-option-card">
                  <b>CSV / Excel (.csv)</b>
                  <small>Tabular spreadsheet with Latitude, Longitude, FRP (MW), and sensors</small>
                  <button
                    className="primary"
                    onClick={() => {
                      const content = ExportService.exportToCSV(activeFires);
                      ExportService.downloadFile(content, `NASA_FireSync_${selectedRegion.replace(/\s+/g, '_')}_Hotspots.csv`, 'text/csv');
                    }}
                  >
                    ⬇ Download CSV
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowExportModal(false)}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Notifications Popover */}
      {showNotifications && (
        <div className="notif-popover">
          <div className="notif-head">
            <strong>🔔 Live Wildfire Alerts &mdash; {selectedRegion}</strong>
            <button className="close-btn-sm" onClick={() => setShowNotifications(false)}>✕</button>
          </div>
          <div className="notif-item critical">
            <span className="notif-badge">🔥 CRITICAL FIRE</span>
            <p>
              {isCal
                ? 'High FRP thermal core (485 MW) detected in Plumas / Dixie Fire Complex. Rapid eastward crowning.'
                : 'Extreme FRP surge (340 MW) detected near Rhodes Forest Front. Rapid southeastern spread.'}
            </p>
            <small>8 mins ago • VIIRS 375m sensor</small>
          </div>
          <div className="notif-item high">
            <span className="notif-badge">💨 WIND ADVISORY</span>
            <p>
              {isCal
                ? 'Diablo/Santa Ana offshore gusts up to 52 km/h driving flame front toward populated canyons.'
                : 'NNE Meltemi gusts up to 42 km/h accelerating fire spread across Mount Parnitha & Attica corridor.'}
            </p>
            <small>24 mins ago • NASA POWER Agrometeorology</small>
          </div>
          <div className="notif-item alert">
            <span className="notif-badge">🛡 BIODIVERSITY</span>
            <p>
              {isCal
                ? 'Perimeter within 4.2 km of Yosemite National Park ancient Giant Sequoia groves.'
                : 'Fire perimeter within 4.1 km of Mount Parnitha protected European Red Deer sanctuary.'}
            </p>
            <small>1 hour ago • IUCN Red List Reserve Watch</small>
          </div>
        </div>
      )}

      {/* 6. Evacuation Route Modal */}
      {showEvacModal && (
        <div className="modal-backdrop" onClick={() => setShowEvacModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏃 Tactical Evacuation Route ({isCal ? 'Skyway Corridor 19 km' : 'Coastal Route 12 km'})</h3>
              <button className="close-btn" onClick={() => setShowEvacModal(false)}>✕</button>
            </div>
            <div className="modal-body-content">
              <div className="route-status-banner green">
                <b>STATUS: OPEN & PATROLLED</b>
                <span>Continuous air tanker smoke clearance and police contraflow active</span>
              </div>
              <ul className="route-waypoints">
                {isCal ? (
                  <>
                    <li><strong>Waypoint 1 (km 0.0):</strong> Paradise Skyway Onramp (Contraflow active).</li>
                    <li><strong>Waypoint 2 (km 6.8):</strong> Neal Road Checkpoint (Cal Fire traffic tender).</li>
                    <li><strong>Waypoint 3 (km 12.4):</strong> Highway 99 Interchange (Follow south to Chico).</li>
                    <li><strong>Waypoint 4 (km 18.6):</strong> Silver Dollar Fairgrounds Evacuation Center.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Waypoint 1 (km 0.0):</strong> Assembly Area Alpha (Megara Sports Center).</li>
                    <li><strong>Waypoint 2 (km 4.5):</strong> Coastal Highway 8A Junction (Police checkpoint).</li>
                    <li><strong>Waypoint 3 (km 9.2):</strong> Secondary triage point & medical bus staging.</li>
                    <li><strong>Waypoint 4 (km 12.0):</strong> Safe Refuge Coastal Shelter (Corinth Center).</li>
                  </>
                )}
              </ul>
              <div className="route-warning red">
                ⚠️ <strong>AVOID:</strong> {isCal ? 'Highway 70 Feather River Canyon is CLOSED due to active flame front and rockfall.' : 'Mountain Road 3 is blocked by dense smoke (PM2.5: 380 µg/m³).'}
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary" onClick={() => setShowEvacModal(false)}>Acknowledge Route</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Biodiversity Modal */}
      {showBioModal && (
        <div className="modal-backdrop" onClick={() => setShowBioModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🦌 Biodiversity & Habitat Alert &mdash; {selectedRegion}</h3>
              <button className="close-btn" onClick={() => setShowBioModal(false)}>✕</button>
            </div>
            <div className="modal-body-content">
              <p>
                <strong>Protected Sanctuary:</strong> {isCal ? 'Yosemite Wilderness & Mariposa Grove / UNESCO Biosphere' : 'Mount Parnitha National Park / Natura 2000 Flora-Fauna Reserve'}.
              </p>
              <div className="species-list">
                {isCal ? (
                  <>
                    <div className="species-card">
                      <b>Sequoiadendron giganteum (Giant Sequoia)</b>
                      <span className="status-iucn">Endangered (IUCN Red List)</span>
                      <small>Ancient monarchs requiring ground sprinkler barriers against extreme radiant heat.</small>
                    </div>
                    <div className="species-card">
                      <b>Ovis canadensis sierrae (Sierra Nevada Bighorn Sheep)</b>
                      <span className="status-iucn">Endangered (IUCN / US ESA)</span>
                      <small>Alpine escape ridge corridors restricted by smoke inversion plume.</small>
                    </div>
                    <div className="species-card">
                      <b>Strix occidentalis occidentalis (California Spotted Owl)</b>
                      <span className="status-iucn">Threatened</span>
                      <small>Mature multi-layer canopy nesting habitat directly on active flame front.</small>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="species-card">
                      <b>Cervus elaphus (European Red Deer)</b>
                      <span className="status-iucn">Endangered in Southern Greece</span>
                      <small>Estimated population in threatened sector: 240 individuals.</small>
                    </div>
                    <div className="species-card">
                      <b>Testudo hermanni (Hermann's Tortoise)</b>
                      <span className="status-iucn">Vulnerable (IUCN Red List)</span>
                      <small>Ground dispersal corridors severely threatened by fire flank.</small>
                    </div>
                    <div className="species-card">
                      <b>Abies cephalonica (Greek Fir Endemic)</b>
                      <span className="status-iucn">Near Threatened</span>
                      <small>Old-growth stands requiring emergency aerial flame-retardant drops.</small>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary" onClick={() => setShowBioModal(false)}>Close Advisory</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
