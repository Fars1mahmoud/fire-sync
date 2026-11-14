import React, { useState } from 'react';
import { RegionService } from '../../services/regionService';
import './TabViews.css';

interface SettingsViewProps {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  selectedRegion: string;
  lowBandwidth: boolean;
  setLowBandwidth: (v: boolean | ((prev: boolean) => boolean)) => void;
  colorblindMode: boolean;
  setColorblindMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  modis: boolean;
  setModis: (v: boolean | ((prev: boolean) => boolean)) => void;
  viirs: boolean;
  setViirs: (v: boolean | ((prev: boolean) => boolean)) => void;
  resolutionNorm: boolean;
  setResolutionNorm: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  setLang,
  selectedRegion,
  lowBandwidth,
  setLowBandwidth,
  colorblindMode,
  setColorblindMode,
  modis,
  setModis,
  viirs,
  setViirs,
  resolutionNorm,
  setResolutionNorm,
}) => {
  const regDef = RegionService.getRegionById(selectedRegion);
  const [minConfidence, setMinConfidence] = useState<number>(50);
  const [backendUrl, setBackendUrl] = useState<string>('http://127.0.0.1:8000');
  const [cacheStatus, setCacheStatus] = useState<string>('2,900 Records Cached (nasa_firms_hotspots.json)');

  const handleTestBackend = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/v1/health`);
      if (resp.ok) {
        alert(lang === 'ar' ? 'الاتصال بالخادم الخلفي FastAPI يعمل بنجاح 100%!' : 'FastAPI Backend Connection Verified Healthy (200 OK)!');
      } else {
        alert(`Backend returned HTTP status: ${resp.status}`);
      }
    } catch (e: any) {
      alert(`Backend connection test failed: ${e.message}`);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('fire_intel_cache');
    setCacheStatus('Cache cleared. Ready for fresh satellite feed.');
    alert(lang === 'ar' ? 'تم تنظيف ذاكرة التخزين المؤقت المحلية بنجاح.' : 'Local tile and hotspot cache cleared successfully.');
  };

  return (
    <div className="tab-view-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="tab-header">
        <div className="tab-header-left">
          <div className="tab-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            ⚙️
          </div>
          <div>
            <h2 className="tab-header-title">
              {lang === 'ar' ? 'إعدادات المنظومة ومعايرة المستشعرات' : 'System Configuration & Sensor Calibration'}
              <span className="badge-sensor" style={{ fontSize: '0.75rem' }}>SOC OPERATIONAL CONTROLS</span>
            </h2>
            <p className="tab-header-subtitle">
              {lang === 'ar'
                ? 'إدارة خوادم PostGIS و FastAPI، معايرة دقة الأقمار الصناعية (VIIRS / MODIS)، وتفضيلات العرض التكتيكي'
                : 'Manage backend database endpoints, radiometer sensitivity calibration, and SOC accessibility settings'}
            </p>
          </div>
        </div>

        <div className="tab-header-actions">
          <button className="tab-btn primary" onClick={handleTestBackend}>
            🔌 {lang === 'ar' ? 'اختبار اتصال FastAPI' : 'Test Backend Connection'}
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="tab-content-grid">
        {/* Radiometer Calibration */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>🛰️ {lang === 'ar' ? 'معايرة مستشعرات الأقمار الصناعية' : 'Satellite Radiometer Sensor Ingestion'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#f1f5f9' }}>VIIRS 375m Active Sensor (Suomi-NPP & NOAA-20)</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {lang === 'ar' ? 'استشعار عالي الدقة للبؤر النارية الصغيرة وخطوط النار الميدانية.' : 'High-spatial resolution I-Band radiometer for perimeter delineation.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={viirs}
                onChange={(e) => setViirs(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#f1f5f9' }}>MODIS 1km Active Sensor (Terra & Aqua)</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {lang === 'ar' ? 'مسح حراري واسع النطاق يمتد لسجلات تاريخية لأكثر من عقدين.' : 'Broad-swath multi-decadal historical climate anomaly baseline.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={modis}
                onChange={(e) => setModis(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#f1f5f9' }}>{lang === 'ar' ? 'مطابقة ومواءمة الدقة المكانية (Harmonization)' : 'Resolution Harmonization'}</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {lang === 'ar' ? 'توحيد مقياس البكسل بين 375م و 1كم لمنع التكرار المزدوج للبؤر.' : 'Multi-sensor grid harmonization preventing over-counting of clustered pixels.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={resolutionNorm}
                onChange={(e) => setResolutionNorm(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                <span style={{ color: '#cbd5e1' }}>{lang === 'ar' ? 'الحد الأدنى لدرجة الثقة الطيفية' : 'Minimum Radiometric Confidence Threshold'}</span>
                <strong style={{ color: '#38bdf8' }}>{minConfidence}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>
          </div>
        </div>

        {/* Backend & UI Preferences */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>💻 {lang === 'ar' ? 'تفضيلات الخادم والواجهة التكتيكية' : 'Backend & Tactical Display Preferences'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                {lang === 'ar' ? 'عنوان خادم FastAPI الخلفي' : 'FastAPI REST Endpoint URL'}
              </label>
              <input
                type="text"
                className="tab-input"
                style={{ width: '100%', fontFamily: 'monospace' }}
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#f1f5f9' }}>{lang === 'ar' ? 'وضع النطاق الترددي المنخفض (Low-Bandwidth)' : 'Low-Bandwidth Field Terminal'}</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {lang === 'ar' ? 'مخصص لرجال الإطفاء في الميدان لتقليل استهلاك البيانات.' : 'Optimized text-first mode for low-connectivity cellular environments.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={lowBandwidth}
                onChange={(e) => setLowBandwidth(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#f1f5f9' }}>{lang === 'ar' ? 'نمط عمى الألوان وسهولة الوصول' : 'Colorblind Accessibility Palette'}</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {lang === 'ar' ? 'ألوان زرقاء وصفراء متباينة لتسهيل القراءة.' : 'High-contrast blue/yellow/slate palette for deuteranopia.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={colorblindMode}
                onChange={(e) => setColorblindMode(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#f1f5f9' }}>{lang === 'ar' ? 'لغة الواجهة' : 'Display Language'}</strong>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`tab-btn ${lang === 'en' ? 'primary' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setLang('en')}
                >
                  🇬🇧 English
                </button>
                <button
                  type="button"
                  className={`tab-btn ${lang === 'ar' ? 'primary' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setLang('ar')}
                >
                  🇸🇦 العربية
                </button>
              </div>
            </div>

            <div className="hud-box">
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{lang === 'ar' ? 'حالة الذاكرة المؤقتة' : 'Local Storage Cache'}</div>
              <div style={{ fontSize: '0.82rem', color: '#38bdf8', margin: '4px 0 8px 0' }}>{cacheStatus}</div>
              <button className="tab-btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={handleClearCache}>
                🧹 {lang === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Flush Local Cache'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
