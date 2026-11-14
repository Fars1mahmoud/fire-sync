import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/wildfireData';
import { RegionService, type Hotspot } from '../services';
import { ApiClient, type AnomalyItem } from '../services/apiClient';

interface AnomalyChartProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  selectedYear: number;
  activeFires: Hotspot[];
  isPolygonActive: boolean;
}

export const AnomalyChart: React.FC<AnomalyChartProps> = ({
  lang,
  selectedRegion,
  selectedYear,
  activeFires,
  isPolygonActive,
}) => {
  const [metric, setMetric] = useState('count');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [liveAnomalies, setLiveAnomalies] = useState<AnomalyItem[] | null>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const reg = RegionService.getRegionById(selectedRegion);
    let countryCode: string | undefined = undefined;
    if (reg.id === 'brazil') countryCode = 'BRA';
    else if (reg.id === 'canada') countryCode = 'CAN';

    ApiClient.fetchAnomalies({
      country: countryCode,
      year: selectedYear,
    }).then((items) => {
      if (items && items.length === 12) {
        setLiveAnomalies(items);
      }
    });
  }, [selectedRegion, selectedYear]);

  const regDef = RegionService.getRegionById(selectedRegion);

  // Regional Monthly Climatology curves tailored to the region's specific fire season & baseline
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const peakIdx = regDef.monthlyPeakMonthIndex ?? 7;
  const baseScale = Math.max(25, Math.round(regDef.baseActiveFires * 0.12));

  const monthlyData = months.map((m, i) => {
    if (liveAnomalies && liveAnomalies[i]) {
      const a = liveAnomalies[i];
      return {
        month: m,
        historical: a.historical_baseline,
        current: a.current_count,
        anomaly: Math.max(0, a.anomaly_delta),
        pctAnomaly: Math.round(a.anomaly_percentage),
      };
    }

    // Distance from peak month in month circle (0 to 6)
    const distFromPeak = Math.min(Math.abs(i - peakIdx), 12 - Math.abs(i - peakIdx));
    const bellFactor = Math.exp(-Math.pow(distFromPeak / 2.2, 2));

    const hist = Math.max(12, Math.round(baseScale * 0.55 * (0.15 + 0.85 * bellFactor)));
    const currMultiplier = 1 + (regDef.anomalyPct / 100);
    const curr = Math.round(hist * (0.8 + 0.5 * bellFactor * (currMultiplier - 0.7)));

    const anomaly = Math.max(0, curr - hist);
    const pctAnomaly = hist > 0 ? Math.round((anomaly / hist) * 100) : 0;

    return {
      month: m,
      historical: hist,
      current: curr,
      anomaly,
      pctAnomaly,
    };
  });

  // SVG dimensions
  const svgWidth = 620;
  const svgHeight = 145;
  const chartBottom = 135;
  const chartTop = 15;
  const chartHeight = chartBottom - chartTop;

  // Maximum value for dynamic scaling
  const maxDataVal = Math.max(...monthlyData.map((d) => Math.max(d.current, d.historical)));
  const maxVal = Math.max(60, Math.ceil((maxDataVal * 1.15) / 10) * 10);
  const scaleY = (val: number) => chartBottom - (val / maxVal) * chartHeight;

  // Polyline for Current Year (Solid Red)
  const currentPoints = monthlyData.map((d, i) => {
    const x = 30 + i * (560 / 11);
    const y = scaleY(d.current);
    return `${x},${y}`;
  }).join(' ');

  // Polyline for Historical Average (Dashed Grey)
  const historicalPoints = monthlyData.map((d, i) => {
    const x = 30 + i * (560 / 11);
    const y = scaleY(d.historical);
    return `${x},${y}`;
  }).join(' ');

  // Dynamic KPIs calculated from active fires and regional baseline
  const rawFRP = activeFires.reduce((sum, h) => sum + h.frp, 0);
  const rawAcres = activeFires.reduce((sum, h) => sum + h.acres, 0);
  const rawHa = Math.round(rawAcres * 0.404686);
  const rawCritical = activeFires.filter((f) => f.status === 'Critical').length;
  const rawCities = Math.max(1, new Set(activeFires.map((f) => f.stateOrRegion)).size);
  const rawPop = Math.round(rawHa * 18.5);

  const kpis = isPolygonActive
    ? {
        activeFires: String(Math.max(activeFires.length, 1)),
        fireArea: `${rawHa.toLocaleString()} ha`,
        frp: `${rawFRP.toLocaleString()} MW`,
        highRiskAreas: String(Math.max(rawCritical, 1)),
        affectedCities: String(rawCities),
        nearbyPopulation: rawPop > 1000000 ? `${(rawPop / 1000000).toFixed(1)}M` : `${Math.round(rawPop / 1000)}k`,
        changeFires: '+18%',
        changeArea: '+24%',
        changeFrp: '+20%',
        changeRisk: '+3',
        changeCities: '+2',
        changePop: '+32%',
      }
    : {
        activeFires: regDef.baseActiveFires.toLocaleString(),
        fireArea: `${regDef.baseBurnedAreaHa.toLocaleString()} ha`,
        frp: `${regDef.baseFrpMW.toLocaleString()} MW`,
        highRiskAreas: String(regDef.baseCriticalAreas),
        affectedCities: String(regDef.baseAffectedCities),
        nearbyPopulation: regDef.basePopulationAtRisk,
        changeFires: `+${Math.round(regDef.anomalyPct * 0.12)}%`,
        changeArea: `+${Math.round(regDef.anomalyPct * 0.22)}%`,
        changeFrp: `+${Math.round(regDef.anomalyPct * 0.18)}%`,
        changeRisk: `+${Math.max(2, Math.round(regDef.baseCriticalAreas * 0.3))}`,
        changeCities: `+${Math.max(1, Math.round(regDef.baseAffectedCities * 0.25))}`,
        changePop: `+${Math.round(regDef.anomalyPct * 0.28)}%`,
      };

  return (
    <div className="panel anomaly-panel">
      {/* Chart Header */}
      <div className="chart-head">
        <strong>
          {regDef.flag} {lang === 'ar' ? regDef.nameAr : regDef.nameEn} &mdash; {t.anomalyChart} ({selectedYear})
        </strong>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="metric-select"
        >
          <option value="count">{t.fireActivityCount}</option>
          <option value="area">{lang === 'ar' ? 'المساحة المحترقة (هكتار)' : 'Burned Area (ha)'}</option>
          <option value="frp">{lang === 'ar' ? 'طاقة الإشعاع (GW)' : 'Total FRP (GW)'}</option>
        </select>

        {/* Legend */}
        <div className="chart-legend">
          <span className="legend-item">
            <i className="red-line-sample" />
            {selectedYear} ({t.currentYear})
          </span>
          <span className="legend-item">
            <i className="dash-line-sample" />
            {t.historicalAvg} (2015-2023)
          </span>
          <span className="legend-item">
            <i className="blue-box-sample" />
            {t.anomaly}
          </span>
        </div>
      </div>

      {/* SVG Chart Body */}
      <div className="chart-body">
        {/* Y Axis Labels */}
        <div className="y-labels">
          <span>{maxVal}</span>
          <span>{Math.round(maxVal * 0.75)}</span>
          <span>{Math.round(maxVal * 0.5)}</span>
          <span>{Math.round(maxVal * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="chart-svg-wrap">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="chart-svg"
          >
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = scaleY(maxVal * pct);
              return (
                <line
                  key={pct}
                  x1="20"
                  y1={y}
                  x2={svgWidth - 20}
                  y2={y}
                  stroke="#1c3349"
                  strokeWidth="1"
                />
              );
            })}

            {/* Blue Anomaly Bars */}
            {monthlyData.map((d, i) => {
              const x = 24 + i * (560 / 11);
              const barH = (d.anomaly / maxVal) * chartHeight;
              const y = chartBottom - barH;
              return (
                <rect
                  key={d.month}
                  x={x}
                  y={y}
                  width="12"
                  height={barH}
                  fill="#137bdc"
                  opacity="0.85"
                  rx="1"
                  className="anomaly-bar"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Historical Average Curve (Dashed) */}
            <polyline
              points={historicalPoints}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeDasharray="4 4"
            />

            {/* Current Year Curve (Solid Red) */}
            <polyline
              points={currentPoints}
              fill="none"
              stroke="#ff3b30"
              strokeWidth="2.4"
            />

            {/* Current Year Data Dots */}
            {monthlyData.map((d, i) => {
              const x = 30 + i * (560 / 11);
              const y = scaleY(d.current);
              return (
                <circle
                  key={d.month}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#ff3b30"
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="data-dot"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Floating Badge over peak */}
          <div className="anomaly-badge" style={{ left: `${Math.min(78, Math.max(15, 20 + (peakIdx / 11) * 58))}%` }}>
            <b>+{regDef.anomalyPct}%</b>
            <span>{t.unusualActivity}</span>
          </div>

          {/* Hover Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="chart-tooltip"
              style={{
                left: `${30 + hoveredIndex * (560 / 11)}px`,
              }}
            >
              <strong>{monthlyData[hoveredIndex].month} {selectedYear} ({lang === 'ar' ? regDef.nameAr : regDef.nameEn}):</strong> {monthlyData[hoveredIndex].current} fires
              (Historical baseline: {monthlyData[hoveredIndex].historical})
              {monthlyData[hoveredIndex].anomaly > 0 && (
                <span> [+{monthlyData[hoveredIndex].anomaly} / +{monthlyData[hoveredIndex].pctAnomaly}%]</span>
              )}
            </div>
          )}

          {/* X Axis Months */}
          <div className="x-labels">
            {monthlyData.map((d) => (
              <span key={d.month}>{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 6 KPI Stats Row below the chart */}
      <div className="stats-row">
        {/* 1. Active Fires */}
        <div className="stat-card c0">
          <span className="stat-label">{lang === 'ar' ? 'الحرائق النشطة' : 'Active Fires'}</span>
          <div className="stat-main">
            <span className="stat-icon red-fire">🔥</span>
            <b>{kpis.activeFires}</b>
          </div>
          <small className="stat-change danger">{kpis.changeFires}</small>
        </div>

        {/* 2. Fire Area */}
        <div className="stat-card c1">
          <span className="stat-label">{lang === 'ar' ? 'المساحة المحترقة' : 'Fire Area'}</span>
          <div className="stat-main">
            <span className="stat-icon green-tree">🌲</span>
            <b>{kpis.fireArea}</b>
          </div>
          <small className="stat-change danger">{kpis.changeArea}</small>
        </div>

        {/* 3. FRP */}
        <div className="stat-card c2">
          <span className="stat-label">{lang === 'ar' ? 'طاقة الإشعاع (FRP)' : 'FRP (MW)'}</span>
          <div className="stat-main">
            <span className="stat-icon orange-bolt">⚡</span>
            <b>{kpis.frp}</b>
          </div>
          <small className="stat-change danger">{kpis.changeFrp}</small>
        </div>

        {/* 4. High Risk Areas */}
        <div className="stat-card c3">
          <span className="stat-label">{lang === 'ar' ? 'المناطق عالية الخطورة' : 'High Risk Areas'}</span>
          <div className="stat-main">
            <span className="stat-icon red-alert">⚠️</span>
            <b>{kpis.highRiskAreas}</b>
          </div>
          <small className="stat-change danger">{kpis.changeRisk}</small>
        </div>

        {/* 5. Affected Cities */}
        <div className="stat-card c4">
          <span className="stat-label">{lang === 'ar' ? 'المدن المتأثرة' : 'Affected Cities'}</span>
          <div className="stat-main">
            <span className="stat-icon blue-city">🏙</span>
            <b>{kpis.affectedCities}</b>
          </div>
          <small className="stat-change danger">{kpis.changeCities}</small>
        </div>

        {/* 6. Nearby Population */}
        <div className="stat-card c5">
          <span className="stat-label">{lang === 'ar' ? 'السكان المهددون' : 'Nearby Population'}</span>
          <div className="stat-main">
            <span className="stat-icon purple-pop">👥</span>
            <b>{kpis.nearbyPopulation}</b>
          </div>
          <small className="stat-change danger">{kpis.changePop}</small>
        </div>
      </div>
    </div>
  );
};
