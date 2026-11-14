/**
 * Executive Situation Report (SITREP) Service
 * Compiles real-time tactical intelligence into a professional, printable/PDF-exportable document.
 */

import type { Hotspot } from './fireService';
import type { RegionalWeatherData } from './weatherService';
import type { RiskPredictionResult } from './riskService';
import type { EvacuationPlan } from './routingService';

export interface SitrepContext {
  region: string;
  timestampUTC: string;
  hotspots: Hotspot[];
  weather: RegionalWeatherData;
  risk: RiskPredictionResult;
  evac: EvacuationPlan;
  isBilingual: boolean;
}

export class ReportService {
  public static generateHtmlReport(ctx: SitrepContext): string {
    const totalFRP = ctx.hotspots.reduce((sum, h) => sum + h.frp, 0);
    const totalAcres = ctx.hotspots.reduce((sum, h) => sum + h.acres, 0);
    const totalHa = Math.round(totalAcres * 0.404686);

    const hotspotRows = ctx.hotspots
      .map(
        (h) => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; font-weight: bold;">${h.name}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd;">${h.lat.toFixed(2)}, ${h.lon.toFixed(2)}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; color: #b91c1c; font-weight: bold;">${h.frp} MW</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd;">${h.satellite} (${h.confidence}%)</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd;">${h.acres.toLocaleString()} ac</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd;"><span style="background: ${h.status === 'Critical' ? '#fee2e2' : '#fef3c7'}; color: ${h.status === 'Critical' ? '#991b1b' : '#92400e'}; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold;">${h.status}</span></td>
      </tr>
    `
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>NASA FireGuard SITREP - ${ctx.region}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .header h1 { margin: 0; font-size: 24px; color: #0f172a; letter-spacing: -0.5px; }
    .header-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .classification { background: #0f172a; color: #fff; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 3px; letter-spacing: 1px; }
    .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center; }
    .kpi-card b { display: block; font-size: 20px; color: #0f172a; margin-top: 4px; }
    .kpi-card span { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; margin-bottom: 20px; }
    th { background: #f1f5f9; padding: 8px 6px; border-bottom: 2px solid #cbd5e1; font-weight: bold; color: #334155; }
    .box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px; border-radius: 0 4px 4px 0; margin-bottom: 16px; }
    .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; border-radius: 0 4px 4px 0; margin-bottom: 16px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { margin: 15mm; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>NASA FIREGUARD EXECUTIVE SITUATION REPORT (SITREP)</h1>
      <div class="header-sub">Operational Theater: <b>${ctx.region}</b> | Valid As Of: <b>${ctx.timestampUTC}</b></div>
    </div>
    <span class="classification">UNCLASSIFIED / TACTICAL COP</span>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <span>Active Hotspots</span>
      <b>${ctx.hotspots.length}</b>
    </div>
    <div class="kpi-card">
      <span>Total Thermal FRP</span>
      <b style="color: #dc2626;">${totalFRP.toLocaleString()} MW</b>
    </div>
    <div class="kpi-card">
      <span>Estimated Burn Area</span>
      <b>${totalHa.toLocaleString()} ha</b>
    </div>
    <div class="kpi-card">
      <span>Fire Weather Risk</span>
      <b style="color: ${ctx.risk.tierColor};">${ctx.risk.overallRiskPercentage}% (${ctx.risk.tier})</b>
    </div>
  </div>

  <div class="section-title">1. Executive Meteorological Assessment (NASA POWER Reanalysis)</div>
  <div class="box">
    <b>Station:</b> ${ctx.weather.stationName} | <b>Air Temp:</b> ${ctx.weather.temperatureC}°C | <b>Relative Humidity:</b> ${ctx.weather.relativeHumidityPct}% | <b>Wind:</b> ${ctx.weather.windSpeedKmh} km/h (${ctx.weather.windCompass}) with gusts to ${ctx.weather.windGustsKmh} km/h.<br/>
    <b>Fuel Drought Factor:</b> Keetch-Byram Drought Index (KBDI) at <b>${ctx.weather.droughtIndexKBDI} / 800</b> indicating extreme sub-surface organic moisture depletion.
  </div>

  <div class="section-title">2. Active Thermal Anomalies (NASA FIRMS VIIRS & MODIS)</div>
  <table>
    <thead>
      <tr>
        <th>Sector / Name</th>
        <th>Coordinates</th>
        <th>FRP</th>
        <th>Sensor</th>
        <th>Area</th>
        <th>Tactical Status</th>
      </tr>
    </thead>
    <tbody>
      ${hotspotRows}
    </tbody>
  </table>

  <div class="section-title">3. Civil Protection & Evacuation Directives</div>
  <div class="alert-box">
    <strong>EVACUATION STATUS:</strong> ${ctx.evac.statusSummary}<br/>
    <strong>DESIGNATED CORRIDOR:</strong> ${ctx.evac.safeRoutePillLabel} (${ctx.evac.totalDistanceKm} km total length).<br/>
    <strong>BLOCKED PASSAGE:</strong> ${ctx.evac.blockedRoadReason}
  </div>

  ${
    ctx.isBilingual
      ? `
  <div class="section-title" dir="rtl" style="text-align: right;">٤. الملخص التكتيكي التنفيذي (باللغة العربية)</div>
  <div class="box" dir="rtl" style="text-align: right;">
    تم رصد نشاط حراري حرج في نطاق <b>${ctx.region}</b> بطاقة إشعاع إجمالية تبلغ <b>${totalFRP.toLocaleString()} ميجاوات</b> تمتد على مساحة تقديرية <b>${totalHa.toLocaleString()} هكتار</b>. تشير بيانات الأرصاد الجوية (NASA POWER) إلى سرعة رياح تبلغ <b>${ctx.weather.windSpeedKmh} كم/ساعة</b> مع انخفاض الرطوبة النسبية إلى <b>${ctx.weather.relativeHumidityPct}%</b>، مما يرفع مؤشر خطر الحريق إلى درجة <b>${ctx.risk.tier}</b>. تم تفعيل ممرات الإخلاء الآمنة والتنسيق مع فرق الإطفاء الجوي.
  </div>
  `
      : ''
  }

  <div class="footer">
    <span>Generated by NASA FireGuard Tactical GIS Platform</span>
    <span>Document ID: SITREP-${Date.now()}</span>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog for instant PDF saving
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>
    `;
  }

  public static printOrSaveReport(ctx: SitrepContext) {
    const html = this.generateHtmlReport(ctx);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }
}
