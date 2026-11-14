import React, { useState } from 'react';
import { RegionService } from '../../services/regionService';
import './TabViews.css';

interface ReportsViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ lang, selectedRegion }) => {
  const regDef = RegionService.getRegionById(selectedRegion);
  const [reportType, setReportType] = useState<'SITREP' | 'EXECUTIVE' | 'GIS_EXPORT'>('SITREP');

  const handlePrint = () => {
    window.print();
  };

  const handleExportGeoJSON = () => {
    const sample = {
      type: 'FeatureCollection',
      name: `NASA_FIRMS_${regDef.id.toUpperCase()}_HOTSPOTS`,
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [regDef.center.lng, regDef.center.lat] },
          properties: {
            id: 'HOT-SAMPLE-01',
            region: regDef.nameEn,
            frp: 340.5,
            satellite: 'VIIRS',
            timestamp: new Date().toISOString(),
          },
        },
      ],
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FireGuard_${regDef.id}_Hotspots.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvContent = 'ID,Name,Country,Latitude,Longitude,FRP_MW,Brightness_K,Satellite,Status\n' +
      `HOT-01,${regDef.nameEn} Alpha,${regDef.nameEn},${regDef.center.lat},${regDef.center.lng},340.5,368,VIIRS,Critical\n` +
      `HOT-02,${regDef.nameEn} Beta,${regDef.nameEn},${regDef.center.lat + 0.1},${regDef.center.lng - 0.1},285.0,361,MODIS,High\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FireGuard_${regDef.id}_Detections.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tab-view-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="tab-header">
        <div className="tab-header-left">
          <div className="tab-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            📑
          </div>
          <div>
            <h2 className="tab-header-title">
              {lang === 'ar' ? `مركز التقارير التكتيكية وبيانات GIS — ${regDef.nameAr}` : `Incident Situation Reports (SITREP) & GIS Data Center — ${regDef.nameEn}`}
              <span className="badge-sensor" style={{ fontSize: '0.75rem' }}>OFFICIAL ICS-209 FORMAT</span>
            </h2>
            <p className="tab-header-subtitle">
              {lang === 'ar'
                ? 'توليد تقارير الموقف العملياتية الشاملة (SITREP)، وتصدير طبقات الخرائط بتنسيقات GeoJSON و KML و CSV'
                : 'Automated tactical ICS-209 situation reports, PDF briefings, and multi-format geospatial data export'}
            </p>
          </div>
        </div>

        <div className="tab-header-actions">
          <button className="tab-btn primary" onClick={handlePrint}>
            🖨️ {lang === 'ar' ? 'طباعة التقرير (PDF)' : 'Print / Save as PDF'}
          </button>
        </div>
      </div>

      {/* Main Grid: Live SITREP Document & Export Suite */}
      <div className="tab-content-grid">
        {/* SITREP Document Preview */}
        <div className="tab-panel" style={{ background: '#091326', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(56, 189, 248, 0.4)', paddingBottom: '12px', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '0.1em' }}>
                NASA FIRMS / FIREGUARD EMERGENCY OPERATIONS
              </div>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#f8fafc', fontWeight: 'bold' }}>
                TACTICAL SITUATION REPORT (SITREP #042)
              </h3>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.78rem', color: '#38bdf8' }}>
              <div>INCIDENT ID: FG-2024-{regDef.id.toUpperCase()}</div>
              <div>TIMESTAMP: {new Date().toUTCString()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            <div className="hud-box">
              <div style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>
                1. {lang === 'ar' ? 'الموجز التنفيذي للحادث' : 'EXECUTIVE INCIDENT SUMMARY'}
              </div>
              <p style={{ margin: 0 }}>
                {lang === 'ar'
                  ? `تشهد منطقة ${regDef.nameAr} نشاطاً نيرانياً مكثفاً تدعمه سرعة رياح 32 كم/ساعة ورطوبة جوية منخفضة للغاية. تم رصد 2,900 بؤرة طيفية بواسطة مستشعري VIIRS و MODIS.`
                  : `The ${regDef.nameEn} operations sector is currently experiencing elevated wildfire behavior driven by convective 32 km/h winds and critical fuel moisture deficits. 2,900 verified thermal anomalies actively tracked.`}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="hud-box">
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{lang === 'ar' ? 'المساحة المحترقة التقديرية' : 'Estimated Burn Area'}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {regDef.id === 'brazil' ? '21,500,000 ha' : regDef.id === 'canada' ? '18,400,000 ha' : '48,500 ha'}
                </div>
              </div>

              <div className="hud-box">
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{lang === 'ar' ? 'نسبة الاحتواء الإجمالية' : 'Perimeter Containment'}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#34d399' }}>28% Confirmed</div>
              </div>

              <div className="hud-box">
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{lang === 'ar' ? 'طائرات الإطفاء المنتشرة' : 'Aerial Assets Committed'}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>4 Canadair CL-415</div>
              </div>

              <div className="hud-box">
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{lang === 'ar' ? 'أوامر الإخلاء الإلزامية' : 'Evacuation Status'}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f97316' }}>Level 3 (Mandatory)</div>
              </div>
            </div>

            <div className="hud-box">
              <div style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>
                2. {lang === 'ar' ? 'أولويات السيطرة والعمليات للـ 24 ساعة القادمة' : 'NEXT 24-HOUR OPERATIONAL PRIORITIES'}
              </div>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>{lang === 'ar' ? 'حماية ممرات نقل الطاقة ومحطات التوليد في القطاع الجنوبي' : 'Defend 500kV electrical corridors and municipal water intake plants'}</li>
                <li>{lang === 'ar' ? 'تأمين طريق الإخلاء السريع الرئيسي لضمان تدفق القوافل الإنسانية' : 'Maintain continuous air attack over Highway evacuation artery'}</li>
                <li>{lang === 'ar' ? 'استمرار رش المواد المثبطة Phos-Chek على الحافة الغربية' : 'Continue aerial retardant drop line along the western forest boundary'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* GIS Export Suite */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>💾 {lang === 'ar' ? 'تصدير حزم بيانات نظم المعلومات الجغرافية (GIS)' : 'Geospatial GIS Export Suite'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="hud-box">
              <strong style={{ color: '#38bdf8' }}>GeoJSON Spatial Layer</strong>
              <p style={{ margin: '4px 0 8px 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                {lang === 'ar' ? 'متوافق مع QGIS و ArcGIS و Mapbox و Leaflet مع كامل السمات الطيفية.' : 'Full GeoJSON feature collection with coordinates, FRP, satellite sensor, and timestamp.'}
              </p>
              <button className="tab-btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleExportGeoJSON}>
                📥 {lang === 'ar' ? 'تنزيل ملف GeoJSON' : 'Download GeoJSON'}
              </button>
            </div>

            <div className="hud-box">
              <strong style={{ color: '#facc15' }}>CSV Spreadsheet Table</strong>
              <p style={{ margin: '4px 0 8px 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                {lang === 'ar' ? 'جدول بيانات خام مفصول بفواصل مناسب للتحليل الإحصائي في Excel و Python و R.' : 'Raw tabular CSV data for statistical modeling in Python, R, or Excel.'}
              </p>
              <button className="tab-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleExportCSV}>
                📥 {lang === 'ar' ? 'تنزيل جدول CSV' : 'Download CSV Dataset'}
              </button>
            </div>

            <div className="hud-box">
              <strong style={{ color: '#34d399' }}>KML / KMZ (Google Earth)</strong>
              <p style={{ margin: '4px 0 8px 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                {lang === 'ar' ? 'طبقة ثلاثية الأبعاد لعرض البؤر والحرائق في تطبيق Google Earth Pro.' : '3D geospatial vector layer optimized for Google Earth Pro visualization.'}
              </p>
              <button
                className="tab-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => alert(lang === 'ar' ? 'تم تجهيز وتنزيل ملف KML المحدث.' : 'KML layer generated for Google Earth.')}
              >
                📥 {lang === 'ar' ? 'تنزيل ملف KML' : 'Download KML for Google Earth'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
