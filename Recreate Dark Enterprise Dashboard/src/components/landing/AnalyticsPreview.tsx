import React, { useState } from 'react';
import { ChartLineIcon, LayersIcon, ArrowRightIcon } from '../icons';

interface AnalyticsPreviewProps {
  onOpenAnalytics: () => void;
  lang: 'en' | 'ar';
}

export const AnalyticsPreview: React.FC<AnalyticsPreviewProps> = ({
  onOpenAnalytics,
  lang,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // Realistic monthly fire hotspot count trends
  const monthlyData = [
    { month: 'Jan', count: 320, frpAvg: 65 },
    { month: 'Feb', count: 410, frpAvg: 72 },
    { month: 'Mar', count: 680, frpAvg: 90 },
    { month: 'Apr', count: 950, frpAvg: 110 },
    { month: 'May', count: 1420, frpAvg: 145 },
    { month: 'Jun', count: 2890, frpAvg: 230 },
    { month: 'Jul', count: 4780, frpAvg: 340 },
    { month: 'Aug', count: 5210, frpAvg: 385 },
    { month: 'Sep', count: 3940, frpAvg: 290 },
    { month: 'Oct', count: 1820, frpAvg: 160 },
    { month: 'Nov', count: 740, frpAvg: 95 },
    { month: 'Dec', count: 390, frpAvg: 70 },
  ];

  const maxCount = 5500;

  const regions = [
    { name: 'Brazil (Amazon & Cerrado)', nameAr: 'البرازيل (الأمازون وسيرادو)', pct: 71, fires: '7,692,334', color: '#ff4d00' },
    { name: 'Canada (Boreal & West)', nameAr: 'كندا (الغابات الشمالية وألبرتا)', pct: 29, fires: '3,179,378', color: '#22d3ee' },
    { name: 'Total Audited Observations', nameAr: 'إجمالي السجلات المدققة', pct: 100, fires: '10,871,712', color: '#10bd78' },
  ];

  return (
    <section className="analytics-preview-section" id="analytics">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <div className="section-eyebrow-badge">
              <ChartLineIcon size={12} />
              <span>DECENNIAL TIME-SERIES BENCHMARKS</span>
            </div>
            <h2 className="section-title-large">
              {lang === 'ar' ? (
                <>فهم أنماط الحرائق <span className="highlight-cyan">عبر الزمن والسجلات التاريخية</span></>
              ) : (
                <>Understand Fire Patterns <span className="highlight-cyan">Over Time</span></>
              )}
            </h2>
            <p className="section-subtitle-text">
              {lang === 'ar'
                ? 'تحليل الاتجاهات طويلة الأجل، ومقارنة قمم مواسم الاحتراق السنوية، وقياس طاقة الحريق الإشعاعية (FRP) عبر سجلات تمتد لأكثر من عقدين.'
                : 'Long-term thermal anomaly tracking, peak burn-cycle benchmarking, and Fire Radiative Power (FRP) distributions calibrated across 20+ years of satellite observations.'}
            </p>
          </div>

          <div className="header-action-button-wrapper">
            <button
              type="button"
              className="btn-launch-gis"
              onClick={onOpenAnalytics}
            >
              <ChartLineIcon size={18} />
              <span>{lang === 'ar' ? 'استعراض منصة التحليلات' : 'Open Analytics Dashboard'}</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="analytics-preview-grid">
          {/* Main Chart Card: Seasonal Fire Occurrence */}
          <div className="analytics-card main-chart-card">
            <div className="card-header-bar">
              <div>
                <h3 className="card-title">
                  {lang === 'ar' ? 'دورة نشاط الحرائق الشهرية (FRP ومعدلات الرصد)' : 'Monthly Fire Frequency & Intensity Trend'}
                </h3>
                <span className="card-sub-info">Harmonized VIIRS (375m) & MODIS (1km) Records</span>
              </div>
              <div className="year-selector-pills">
                {[2020, 2021, 2022, 2023, 2024].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    className={`year-pill ${selectedYear === yr ? 'active' : ''}`}
                    onClick={() => setSelectedYear(yr)}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Scientific Bar & Trend Chart */}
            <div className="custom-chart-viewport">
              <div className="chart-bars-row">
                {monthlyData.map((d) => {
                  const heightPct = (d.count / maxCount) * 100;
                  const isPeak = d.month === 'Jul' || d.month === 'Aug';
                  return (
                    <div key={d.month} className="chart-bar-col">
                      <div className="bar-val-tooltip">
                        <span>{d.count} fires</span>
                        <span className="frp-sub">{d.frpAvg} MW avg</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className={`bar-fill ${isPeak ? 'peak-burn' : ''}`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="chart-month-label">{d.month}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="chart-footer-legend">
                <div className="legend-item">
                  <span className="color-dot normal" />
                  <span>Standard Seasonal Baseline</span>
                </div>
                <div className="legend-item">
                  <span className="color-dot peak" />
                  <span>Summer Peak Thermal Front (FRP &gt; 300 MW)</span>
                </div>
                <div className="legend-item">
                  <span className="color-dot line" />
                  <span>Multi-Sensor Calibrated Confidence: 98.7%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Card 1: Regional Distribution */}
          <div className="analytics-card side-card">
            <h3 className="card-title">
              {lang === 'ar' ? 'التوزيع الإقليمي للحرائق' : 'Regional Fire Distribution'}
            </h3>
            <span className="card-sub-info">Share of Annual Burn Surface</span>

            <div className="regional-progress-list">
              {regions.map((reg) => (
                <div key={reg.name} className="regional-row-item">
                  <div className="reg-text-row">
                    <span className="reg-name">{lang === 'ar' ? reg.nameAr : reg.name}</span>
                    <span className="reg-fires">{reg.fires} events ({reg.pct}%)</span>
                  </div>
                  <div className="reg-bar-bg">
                    <div
                      className="reg-bar-active"
                      style={{ width: `${reg.pct}%`, backgroundColor: reg.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Card 2: MODIS vs VIIRS Sensor Benchmark */}
          <div className="analytics-card comparison-card">
            <div className="card-header-bar">
              <h3 className="card-title">
                {lang === 'ar' ? 'مقارنة المستشعرات: MODIS vs VIIRS' : 'Sensor Harmonization Benchmark'}
              </h3>
              <LayersIcon size={18} className="sensor-chip-icon" />
            </div>

            <div className="sensor-benchmark-table">
              <div className="table-header-row">
                <span>Metric</span>
                <span className="th-sensor">NASA MODIS</span>
                <span className="th-sensor viirs">VIIRS (375m)</span>
              </div>
              <div className="table-data-row">
                <span className="t-label">Nadir Pixel Size</span>
                <span className="t-val">1.0 km</span>
                <span className="t-val viirs-val">375 m (3x sharper)</span>
              </div>
              <div className="table-data-row">
                <span className="t-label">Small Fire Sensitivity</span>
                <span className="t-val">~50 MW FRP</span>
                <span className="t-val viirs-val">&lt; 5 MW FRP</span>
              </div>
              <div className="table-data-row">
                <span className="t-label">Historical Depth</span>
                <span className="t-val viirs-val">2000–Present (24y)</span>
                <span className="t-val">2012–Present (12y)</span>
              </div>
              <div className="table-data-row">
                <span className="t-label">Harmonized Role</span>
                <span className="t-val">Climatic Baseline</span>
                <span className="t-val viirs-val">High-Res Active Front</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
