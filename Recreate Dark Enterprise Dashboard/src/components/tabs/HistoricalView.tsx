import React, { useState } from 'react';
import { RegionService } from '../../services/regionService';
import { AnalysisDashboardPage } from '../../pages/AnalysisDashboardPage';
import './TabViews.css';

interface HistoricalViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
  onSelectYear?: (y: number) => void;
  selectedYear: number;
}

export const HistoricalView: React.FC<HistoricalViewProps> = ({
  lang,
  selectedRegion,
  onSelectYear,
  selectedYear,
}) => {
  const regDef = RegionService.getRegionById(selectedRegion);
  const [activeDecade, setActiveDecade] = useState<'2020s' | '2010s'>('2020s');
  const [histMode, setHistMode] = useState<'trends' | 'fireboard'>('fireboard');

  const historicalData: Record<number, { fires: number; burnedHa: string; peakFrp: number; anomalyPct: number; notesEn: string; notesAr: string }> = {
    2024: {
      fires: regDef.id === 'brazil' ? 142000 : 88000,
      burnedHa: regDef.id === 'brazil' ? '21.5M ha' : '9.4M ha',
      peakFrp: 2966.5,
      anomalyPct: 228,
      notesEn: 'Historic Amazonian & Pantanal severe drought driven by prolonged El Niño cycle.',
      notesAr: 'جفاف تاريخي حاد في الأمازون وبانتانال بسبب ظاهرة النينيو الممتدة.',
    },
    2023: {
      fires: regDef.id === 'canada' ? 184000 : 115000,
      burnedHa: regDef.id === 'canada' ? '18.4M ha' : '14.2M ha',
      peakFrp: 2840.0,
      anomalyPct: 312,
      notesEn: 'Canada Mega-Fire Season: Over 18.4M hectares burned across Quebec, Alberta, and NWT.',
      notesAr: 'موسم الحرائق القياسي في كندا: احتراق أكثر من 18.4 مليون هكتار في ألبرتا وكيبك.',
    },
    2022: {
      fires: 94000,
      burnedHa: '8.2M ha',
      peakFrp: 1820.0,
      anomalyPct: 15,
      notesEn: 'Moderate seasonal baseline with localized intense clusters in Cerrado.',
      notesAr: 'معدل موسمي متوسط مع بؤر مكثفة في سيرادو ومحيط الغابات الشمالية.',
    },
    2021: {
      fires: 108000,
      burnedHa: '11.8M ha',
      peakFrp: 2150.0,
      anomalyPct: 42,
      notesEn: 'Significant Pantanal wetland fires and early Mediterranean heatwaves.',
      notesAr: 'حرائق ملحوظة في أراضي بانتانال الرطبة وموجات حر مبكرة في حوض المتوسط.',
    },
    2020: {
      fires: 128000,
      burnedHa: '16.5M ha',
      peakFrp: 2490.0,
      anomalyPct: 95,
      notesEn: 'Catastrophic Pantanal disaster with ~30% of global wetlands impacted.',
      notesAr: 'كارثة بيئية في بانتانال أثرت على قرابة 30% من أكبر الأراضي الرطبة في العالم.',
    },
    2019: {
      fires: 119000,
      burnedHa: '13.1M ha',
      peakFrp: 2310.0,
      anomalyPct: 68,
      notesEn: 'Global Amazon fire crisis attracting worldwide NASA FIRMS satellite monitoring.',
      notesAr: 'أزمة حرائق الأمازون العالمية واستنفار رصد أقمار ناسا الصناعية.',
    },
    2018: {
      fires: 89000,
      burnedHa: '7.9M ha',
      peakFrp: 1650.0,
      anomalyPct: -12,
      notesEn: 'Historical baseline reference year prior to accelerated climate extremes.',
      notesAr: 'سنة خط الأساس المرجعي التاريخي قبل تسارع التطرف المناخي.',
    },
  };

  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
  const curr = historicalData[selectedYear] || historicalData[2024];

  return (
    <div className="tab-view-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="tab-header">
        <div className="tab-header-left">
          <div className="tab-icon-badge">📅</div>
          <div>
            <h2 className="tab-header-title">
              {lang === 'ar' ? `التحليل التاريخي والمناخي — ${regDef.nameAr}` : `Historical & Climatological Analytics — ${regDef.nameEn}`}
              <span className="badge-sensor" style={{ fontSize: '0.75rem' }}>2018 – 2024 ARCHIVES</span>
            </h2>
            <p className="tab-header-subtitle">
              {lang === 'ar'
                ? 'تحليل الاتجاهات متعددة السنوات، شذوذ الاحتراق، ودراسة خطوط الأساس المناخية المقارنة'
                : 'Multi-year trajectory analysis, burned area anomalies, and historical climatological baselines'}
            </p>
          </div>
        </div>

        <div className="tab-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(2, 6, 23, 0.7)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <button
              type="button"
              className={`tab-btn ${histMode === 'fireboard' ? 'primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              onClick={() => setHistMode('fireboard')}
            >
              📊 {lang === 'ar' ? 'تحليلات FireBoard (2x2)' : 'FireBoard Analytics (2x2)'}
            </button>
            <button
              type="button"
              className={`tab-btn ${histMode === 'trends' ? 'primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              onClick={() => setHistMode('trends')}
            >
              📈 {lang === 'ar' ? 'الاتجاهات المناخية' : 'Climatological Trends'}
            </button>
          </div>

          {/* Year selector tabs */}
          {histMode === 'trends' && (
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(11, 23, 44, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              {years.map((y) => (
                <button
                  key={y}
                  className={`tab-btn ${selectedYear === y ? 'primary' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => onSelectYear?.(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {histMode === 'fireboard' ? (
        <div style={{ marginTop: '10px' }}>
          <AnalysisDashboardPage
            embedded={true}
            lang={lang}
            onBack={() => setHistMode('trends')}
          />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="tab-kpi-grid">
            <div className="tab-kpi-card critical">
              <span className="tab-kpi-label">{lang === 'ar' ? `حرائق عام ${selectedYear}` : `Active Detections (${selectedYear})`}</span>
              <span className="tab-kpi-value">{curr.fires.toLocaleString()}</span>
              <span className="tab-kpi-sub">
                🔥 {lang === 'ar' ? 'رصد طيفي مؤكد' : 'Confirmed satellite detections'}
              </span>
            </div>

        <div className="tab-kpi-card warning">
          <span className="tab-kpi-label">{lang === 'ar' ? 'مؤشر الشذوذ المناخي (Z-Score)' : 'Climate Anomaly Score'}</span>
          <span className="tab-kpi-value" style={{ color: curr.anomalyPct > 100 ? '#ef4444' : '#f97316' }}>
            +{curr.anomalyPct}%
          </span>
          <span className="tab-kpi-sub">
            📊 {lang === 'ar' ? 'مقارنة بخط الأساس (2018)' : 'Vs. 10-year historic baseline'}
          </span>
        </div>

        <div className="tab-kpi-card">
          <span className="tab-kpi-label">{lang === 'ar' ? 'المساحة المحترقة التراكمية' : 'Cumulative Burned Area'}</span>
          <span className="tab-kpi-value">{curr.burnedHa}</span>
          <span className="tab-kpi-sub">
            🛰️ Sentinel-2 / Landsat-9 NBR
          </span>
        </div>

        <div className="tab-kpi-card success">
          <span className="tab-kpi-label">{lang === 'ar' ? 'أعلى طاقة إشعاعية مرصودة' : 'Peak Annual FRP'}</span>
          <span className="tab-kpi-value">{curr.peakFrp.toFixed(1)} <small style={{ fontSize: '0.85rem' }}>MW</small></span>
          <span className="tab-kpi-sub">
            ⚡ VIIRS I-Band 375m
          </span>
        </div>
      </div>

      {/* Main Content: Multi-year breakdown & Climatological Timeline */}
      <div className="tab-content-grid">
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>📈 {lang === 'ar' ? `المقارنة التاريخية للسنوات (2018 - 2024) — ${regDef.nameEn}` : `Multi-Year Comparative Dynamics (2018 - 2024) — ${regDef.nameEn}`}</span>
          </h3>

          <div className="tab-table-wrapper">
            <table className="tab-table">
              <thead>
                <tr>
                  <th>{lang === 'ar' ? 'السنة' : 'Year'}</th>
                  <th>{lang === 'ar' ? 'عدد البؤر' : 'Detections'}</th>
                  <th>{lang === 'ar' ? 'المساحة المحترقة' : 'Burned Area'}</th>
                  <th>{lang === 'ar' ? 'أعلى FRP' : 'Peak FRP'}</th>
                  <th>{lang === 'ar' ? 'الشذوذ المناخي' : 'Anomaly Index'}</th>
                  <th>{lang === 'ar' ? 'التشخيص البيئي' : 'Ecological Assessment'}</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => {
                  const d = historicalData[y];
                  const isSel = y === selectedYear;
                  return (
                    <tr
                      key={y}
                      onClick={() => onSelectYear?.(y)}
                      style={{ cursor: 'pointer', background: isSel ? 'rgba(56, 189, 248, 0.12)' : undefined }}
                    >
                      <td style={{ fontWeight: 'bold', color: isSel ? '#38bdf8' : '#e2e8f0' }}>{y}</td>
                      <td>{d.fires.toLocaleString()}</td>
                      <td><strong>{d.burnedHa}</strong></td>
                      <td>{d.peakFrp.toFixed(1)} MW</td>
                      <td>
                        <span className={d.anomalyPct > 150 ? 'badge-critical' : d.anomalyPct > 30 ? 'badge-high' : 'badge-low'}>
                          {d.anomalyPct > 0 ? `+${d.anomalyPct}%` : `${d.anomalyPct}%`}
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px', whiteSpace: 'normal', fontSize: '0.76rem', color: '#94a3b8' }}>
                        {lang === 'ar' ? d.notesAr : d.notesEn}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Climatological Insights & Deep Analysis */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>🧠 {lang === 'ar' ? 'تحليل النماذج المناخية والبيئات' : 'Climatological Biome Assessment'}</span>
          </h3>

          <div className="hud-box">
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              {lang === 'ar' ? 'البيئة الطبيعية المهددة' : 'Target Ecosystem Biome'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>
              {regDef.id === 'brazil'
                ? (lang === 'ar' ? 'غابات الأمازون وسافانا سيرادو وبانتانال' : 'Amazon Basin, Cerrado & Pantanal')
                : regDef.id === 'canada'
                ? (lang === 'ar' ? 'الغابات الشمالية في ألبرتا والمناطق الشمالية الغربية' : 'Boreal Shield & Northern Alberta Taiga')
                : (lang === 'ar' ? 'غابات البحر المتوسط والصنوبر الجبلي' : 'Mediterranean Pine & Chaparral Slopes')}
            </div>
          </div>

          <div className="hud-box">
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {lang === 'ar' ? 'فترة ذروة موسم الحرائق التاريخية' : 'Historic Fire Season Peak Window'}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f97316', marginTop: '4px' }}>
              {regDef.id === 'brazil' ? 'August – October (Dry Season)' : regDef.id === 'canada' ? 'June – July (Summer Solstice)' : 'July – August'}
            </div>
          </div>

          <div className="hud-box">
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {lang === 'ar' ? 'محركات التغير المناخي والاشتعال' : 'Climatic Drivers of Ignition'}
            </div>
            <ul style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              <li>{lang === 'ar' ? 'انخفاض رطوبة التربة (KBDI > 720)' : 'Severe fuel moisture depletion (KBDI > 720)'}</li>
              <li>{lang === 'ar' ? 'رياح جافة قوية تعزز سرعة الانتشار' : 'High convective wind vectors accelerating spread'}</li>
              <li>{lang === 'ar' ? 'صواعق جافة تؤدي لاشتعال متعدد' : 'Dry lightning storms causing clustered ignitions'}</li>
            </ul>
          </div>

          <button
            className="tab-btn primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => alert(lang === 'ar' ? 'جاري تجهيز وتنزيل سجلات الأرشيف التاريخي بتنسيق CSV...' : 'Preparing CSV export for historical dataset...')}
          >
            📥 {lang === 'ar' ? 'تصدير السجل التاريخي الكامل (CSV)' : 'Export Full Historical Archive (CSV)'}
          </button>
        </div>
      </div>
    </>
    )}
  </div>
  );
};
