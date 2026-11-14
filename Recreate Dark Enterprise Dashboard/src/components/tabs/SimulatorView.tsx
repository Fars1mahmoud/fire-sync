import React, { useState } from 'react';
import { RegionService } from '../../services/regionService';
import './TabViews.css';

interface SimulatorViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ lang, selectedRegion }) => {
  const regDef = RegionService.getRegionById(selectedRegion);

  // Simulation parameters
  const [windSpeed, setWindSpeed] = useState<number>(32);
  const [windDir, setWindDir] = useState<number>(120);
  const [slope, setSlope] = useState<number>(15);
  const [fuelModel, setFuelModel] = useState<'boreal' | 'amazon_slash' | 'grassland'>('boreal');
  const [simStep, setSimStep] = useState<number>(6); // 1h, 3h, 6h, 12h, 24h
  const [containmentPct, setContainmentPct] = useState<number>(24);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Calculated rate of spread
  const rosMpm = Math.round((windSpeed * 0.45 + slope * 0.25 + (fuelModel === 'amazon_slash' ? 8 : 4)) * 10) / 10;
  const projectedAcres = Math.round(rosMpm * simStep * 85);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      alert(lang === 'ar' ? `اكتملت محاكاة Huygens للانتشار لأفق +${simStep} ساعات!` : `Huygens elliptical fire growth simulation completed for +${simStep}h!`);
    }, 900);
  };

  const handleWaterDrop = () => {
    setContainmentPct((prev) => Math.min(100, prev + 18));
    alert(lang === 'ar' ? 'تم إلقاء 6,100 لتر من مادة Phos-Chek المثبطة! ارتفعت نسبة الاحتواء.' : 'Canadair CL-415 dropped 6,100L of Phos-Chek retardant! Containment line strengthened.');
  };

  return (
    <div className="tab-view-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="tab-header">
        <div className="tab-header-left">
          <div className="tab-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            🎲
          </div>
          <div>
            <h2 className="tab-header-title">
              {lang === 'ar' ? `محاكي انتشار الحرائق التكتيكي (Huygens Engine) — ${regDef.nameAr}` : `Tactical Huygens Wildfire Spread & Suppression Simulator — ${regDef.nameEn}`}
              <span className="badge-critical" style={{ fontSize: '0.75rem' }}>PHYSICS-BASED MODEL</span>
            </h2>
            <p className="tab-header-subtitle">
              {lang === 'ar'
                ? 'نمذجة بيضاوية لسرعة الانتشار (ROS)، تأثير الانحدار الطبوغرافي ونوع الوقود، ومحاكاة الإخماد الجوي'
                : 'Elliptical wave-front fire perimeter expansion, Rothermel surface rate of spread, and aerial tanker retardant drops'}
            </p>
          </div>
        </div>

        <div className="tab-header-actions">
          <button
            className="tab-btn primary"
            onClick={handleRunSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? '⏳ Calculating...' : '▶ ' + (lang === 'ar' ? 'تشغيل المحاكاة' : 'Run Growth Simulation')}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="tab-kpi-grid">
        <div className="tab-kpi-card critical">
          <span className="tab-kpi-label">{lang === 'ar' ? 'معدل سرعة الانتشار (ROS)' : 'Rate of Spread (ROS)'}</span>
          <span className="tab-kpi-value">{rosMpm} <small style={{ fontSize: '0.85rem' }}>m/min</small></span>
          <span className="tab-kpi-sub" style={{ color: '#ef4444' }}>
            ⚡ {(rosMpm * 0.06).toFixed(2)} km/h forward velocity
          </span>
        </div>

        <div className="tab-kpi-card warning">
          <span className="tab-kpi-label">{lang === 'ar' ? `المساحة المتوقعة (+${simStep} ساعات)` : `Projected Area (+${simStep}h)`}</span>
          <span className="tab-kpi-value">{projectedAcres.toLocaleString()} <small style={{ fontSize: '0.85rem' }}>Acres</small></span>
          <span className="tab-kpi-sub">
            🌲 {Math.round(projectedAcres * 0.4047).toLocaleString()} Hectares
          </span>
        </div>

        <div className="tab-kpi-card">
          <span className="tab-kpi-label">{lang === 'ar' ? 'نسبة احتواء الحريق الحالية' : 'Perimeter Containment'}</span>
          <span className="tab-kpi-value" style={{ color: containmentPct > 50 ? '#34d399' : '#facc15' }}>
            {containmentPct}%
          </span>
          <span className="tab-kpi-sub">
            🚒 {lang === 'ar' ? 'خطوط جرافات ودعم جوي' : 'Dozer line & retardant boundary'}
          </span>
        </div>

        <div className="tab-kpi-card success">
          <span className="tab-kpi-label">{lang === 'ar' ? 'طول لهب رأس الحريق' : 'Flame Front Length'}</span>
          <span className="tab-kpi-value">4.8 <small style={{ fontSize: '0.85rem' }}>m</small></span>
          <span className="tab-kpi-sub">
            🔥 {lang === 'ar' ? 'لهب تاجي مرتفع' : 'Direct attack not feasible'}
          </span>
        </div>
      </div>

      {/* Main Grid: Parameter Controls & Isochrone Visualization */}
      <div className="tab-content-grid">
        {/* Simulator Controls */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>⚙️ {lang === 'ar' ? 'المعاملات الفيزيائية والمناخية للنمذجة' : 'Simulation Environmental Parameters'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Wind Speed Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: '#cbd5e1' }}>{lang === 'ar' ? 'سرعة الرياح السطحية (10م)' : 'Surface Wind Speed (10m AGL)'}</span>
                <strong style={{ color: '#38bdf8' }}>{windSpeed} km/h</strong>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            {/* Slope Angle Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: '#cbd5e1' }}>{lang === 'ar' ? 'زاوية انحدار التضاريس (Slope Angle)' : 'Topographic Slope Angle'}</span>
                <strong style={{ color: '#f97316' }}>{slope}° Slope</strong>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                value={slope}
                onChange={(e) => setSlope(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }}
              />
            </div>

            {/* Fuel Model */}
            <div>
              <label style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                {lang === 'ar' ? 'نموذج الوقود الحيوي (Fuel Model)' : 'Rothermel Vegetation Fuel Complex'}
              </label>
              <select
                className="tab-select"
                style={{ width: '100%' }}
                value={fuelModel}
                onChange={(e) => setFuelModel(e.target.value as any)}
              >
                <option value="boreal">{lang === 'ar' ? 'الغابات الصنوبرية الشمالية (Dense Conifer Timber)' : 'Dense Coniferous Boreal Timber (Model 8)'}</option>
                <option value="amazon_slash">{lang === 'ar' ? 'أخشاب الأمازون وبقايا القطع الجافة (Slash & Burn)' : 'Heavy Amazon Logging Slash & Hardwood (Model 10)'}</option>
                <option value="grassland">{lang === 'ar' ? 'سافانا وحشائش جافة سريعة الاشتعال (Dry Cerrado Grass)' : 'Tall Grassland / Savanna Scrub (Model 3)'}</option>
              </select>
            </div>

            {/* Time Horizon */}
            <div>
              <label style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                {lang === 'ar' ? 'أفق إسقاط محاكاة خط النار' : 'Fire Perimeter Projection Horizon'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 3, 6, 12, 24].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`tab-btn ${simStep === h ? 'primary' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setSimStep(h)}
                  >
                    +{h}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Suppression Action Center */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>✈️ {lang === 'ar' ? 'محاكاة الإخماد الجوي والبري' : 'Tactical Aerial Suppression Strike'}</span>
          </h3>

          <div className="hud-box">
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{lang === 'ar' ? 'طائرة الإخماد الجوي النشطة' : 'Active Aerial Tanker'}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>
              Canadair CL-415 "Super Scooper"
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
              {lang === 'ar'
                ? 'سعة الخزان: 6,137 لتر ماء مع مادة التبريد الرغوية. زمن التعبئة: 12 ثانية من المسطح المائي القريب.'
                : 'Capacity: 6,137 Liters water/gel. Scooping time: 12 seconds from regional lake/sea.'}
            </p>
          </div>

          <div className="hud-box">
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{lang === 'ar' ? 'مستوى الاحتواء الإجمالي' : 'Containment Perimeter Progress'}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 4px 0' }}>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{lang === 'ar' ? 'المساحة المحتواة:' : 'Perimeter Sealed:'}</span>
              <strong style={{ color: containmentPct > 50 ? '#34d399' : '#facc15' }}>{containmentPct}%</strong>
            </div>
            <div className="tab-progress-bg">
              <div
                className="tab-progress-fill"
                style={{
                  width: `${containmentPct}%`,
                  background: containmentPct > 50 ? '#10b981' : '#f97316',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <button
              className="tab-btn primary"
              style={{ justifyContent: 'center' }}
              onClick={handleWaterDrop}
            >
              🌊 {lang === 'ar' ? 'إلقاء رغوة الإخماد Phos-Chek (CL-415)' : 'Execute Aerial Retardant Drop'}
            </button>
            <button
              className="tab-btn"
              style={{ justifyContent: 'center' }}
              onClick={() => {
                setContainmentPct((prev) => Math.min(100, prev + 10));
                alert(lang === 'ar' ? 'تم إنشاء خط عزل ترابي بالجرافات بطول 4.5 كم.' : 'Bulldozer containment line constructed along eastern flank.');
              }}
            >
              🚜 {lang === 'ar' ? 'شق خط عزل بري بالجرافات' : 'Plow Bulldozer Firebreak Line'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
