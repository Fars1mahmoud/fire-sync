import React, { useState } from 'react';
import { RegionService } from '../../services/regionService';
import './TabViews.css';

interface SpeciesRisk {
  commonNameEn: string;
  commonNameAr: string;
  scientificName: string;
  status: 'CRITICALLY_ENDANGERED' | 'VULNERABLE' | 'NEAR_THREATENED';
  habitatThreatenedHa: string;
  rescueStatus: string;
}

interface SanctuaryItem {
  id: string;
  name: string;
  totalHa: string;
  firePerimeterDistanceKm: number;
  threatLevel: 'HIGH' | 'MODERATE' | 'LOW';
  faunaSpeciesCount: number;
}

interface WildlifeViewProps {
  lang: 'en' | 'ar';
  selectedRegion: string;
}

export const WildlifeView: React.FC<WildlifeViewProps> = ({ lang, selectedRegion }) => {
  const regDef = RegionService.getRegionById(selectedRegion);

  const [sanctuaries] = useState<SanctuaryItem[]>([
    {
      id: 'SNC-01',
      name: regDef.id === 'brazil' ? 'Pantanal Matogrossense National Park' : 'Wood Buffalo Boreal National Park',
      totalHa: regDef.id === 'brazil' ? '135,000 ha' : '4,480,000 ha',
      firePerimeterDistanceKm: 4.2,
      threatLevel: 'HIGH',
      faunaSpeciesCount: 650,
    },
    {
      id: 'SNC-02',
      name: regDef.id === 'brazil' ? 'Taiamã Ecological Reserve' : 'Jasper & Banff Ecological Sanctuary',
      totalHa: '11,555 ha',
      firePerimeterDistanceKm: 12.8,
      threatLevel: 'MODERATE',
      faunaSpeciesCount: 420,
    },
    {
      id: 'SNC-03',
      name: regDef.id === 'brazil' ? 'Serra das Araras Biological Reserve' : 'Elk Island Biosphere Reserve',
      totalHa: '28,700 ha',
      firePerimeterDistanceKm: 24.5,
      threatLevel: 'LOW',
      faunaSpeciesCount: 310,
    },
  ]);

  const [speciesList] = useState<SpeciesRisk[]>([
    {
      commonNameEn: regDef.id === 'brazil' ? 'Jaguar (Panthera onca)' : 'Boreal Woodland Caribou',
      commonNameAr: regDef.id === 'brazil' ? 'النمر المرقط (الجاغوار)' : 'وعل الغابات الشمالية (الكاريبو)',
      scientificName: regDef.id === 'brazil' ? 'Panthera onca' : 'Rangifer tarandus caribou',
      status: 'CRITICALLY_ENDANGERED',
      habitatThreatenedHa: '42,000 ha',
      rescueStatus: lang === 'ar' ? 'نشر 4 فرق بيطرية ميدانية لإنقاذ الحيوانات المصابة' : '4 specialized field veterinary rescue units dispatched',
    },
    {
      commonNameEn: regDef.id === 'brazil' ? 'Giant Anteater' : 'Whooping Crane',
      commonNameAr: regDef.id === 'brazil' ? 'آكل النمل العملاق' : 'الكركي الأمريكي الناعق',
      scientificName: regDef.id === 'brazil' ? 'Myrmecophaga tridactyla' : 'Grus americana',
      status: 'VULNERABLE',
      habitatThreatenedHa: '28,500 ha',
      rescueStatus: lang === 'ar' ? 'تأمين ممرات هجرة آمنة عبر الأراضي الرطبة' : 'Securing emergency wetland migration corridors',
    },
    {
      commonNameEn: regDef.id === 'brazil' ? 'Hyacinth Macaw' : 'Grizzly Bear',
      commonNameAr: regDef.id === 'brazil' ? 'ببغاء المكاو الياقوتي' : 'الدب البني الشيب (الغريزلي)',
      scientificName: regDef.id === 'brazil' ? 'Anodorhynchus hyacinthinus' : 'Ursus arctos horribilis',
      status: 'VULNERABLE',
      habitatThreatenedHa: '15,200 ha',
      rescueStatus: lang === 'ar' ? 'مراقبة أعشاش الأشجار المعمرة والتبريد الرذاذي' : 'Aerial telemetry tracking of collared individuals',
    },
  ]);

  return (
    <div className="tab-view-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="tab-header">
        <div className="tab-header-left">
          <div className="tab-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            🐾
          </div>
          <div>
            <h2 className="tab-header-title">
              {lang === 'ar' ? `حماية التنوع الحيوي والحياة البرية — ${regDef.nameAr}` : `Biodiversity & Wildlife Habitat Conservation — ${regDef.nameEn}`}
              <span className="badge-low" style={{ fontSize: '0.75rem' }}>IUCN RED LIST CORRIDORS</span>
            </h2>
            <p className="tab-header-subtitle">
              {lang === 'ar'
                ? 'رصد المحميات الطبيعية المهددة، تتبع مسارات هجرة الكائنات المهددة بالانقراض، وفرق الإنقاذ البيطري'
                : 'Sanctuary encroachment alerts, habitat corridor preservation, and wildlife emergency veterinary rescue operations'}
            </p>
          </div>
        </div>

        <div className="tab-header-actions">
          <button
            className="tab-btn primary"
            onClick={() => alert(lang === 'ar' ? 'تم استدعاء فرق الإغاثة البيطرية الميدانية للمحمية الرئيسية.' : 'Field veterinary wildlife rescue units mobilized.')}
          >
            🩺 {lang === 'ar' ? 'استدعاء فرق الإنقاذ البيطري' : 'Deploy Veterinary Rescue Units'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="tab-kpi-grid">
        <div className="tab-kpi-card critical">
          <span className="tab-kpi-label">{lang === 'ar' ? 'المحمية الطبيعية الأقرب للنار' : 'Most Threatened Sanctuary'}</span>
          <span className="tab-kpi-value" style={{ fontSize: '1.2rem', color: '#ef4444' }}>
            {sanctuaries[0].firePerimeterDistanceKm} <small style={{ fontSize: '0.85rem' }}>km away</small>
          </span>
          <span className="tab-kpi-sub" style={{ color: '#f87171' }}>
            ⚠️ {sanctuaries[0].name.split(' ')[0]} {sanctuaries[0].name.split(' ')[1]}
          </span>
        </div>

        <div className="tab-kpi-card warning">
          <span className="tab-kpi-label">{lang === 'ar' ? 'الكائنات المهددة بالانقراض' : 'Threatened Fauna Species'}</span>
          <span className="tab-kpi-value">38 Species</span>
          <span className="tab-kpi-sub">
            🐆 {lang === 'ar' ? 'تشمل النمر المرقط وآكل النمل' : 'Including apex predators & avifauna'}
          </span>
        </div>

        <div className="tab-kpi-card">
          <span className="tab-kpi-label">{lang === 'ar' ? 'المساحة المحمية المعرضة' : 'Sanctuary Habitat At Risk'}</span>
          <span className="tab-kpi-value">85,700 <small style={{ fontSize: '0.85rem' }}>ha</small></span>
          <span className="tab-kpi-sub">
            🌲 {lang === 'ar' ? 'محيط الغابات العذراء' : 'Virgin canopy & wetland margins'}
          </span>
        </div>

        <div className="tab-kpi-card success">
          <span className="tab-kpi-label">{lang === 'ar' ? 'ممرات الهجرة الآمنة المفتوحة' : 'Open Migration Corridors'}</span>
          <span className="tab-kpi-value">2 / 3</span>
          <span className="tab-kpi-sub">
            🦌 {lang === 'ar' ? 'طرق خالية من النيران' : 'Unobstructed escape pathways'}
          </span>
        </div>
      </div>

      {/* Main Grid: Sanctuaries & Species */}
      <div className="tab-content-grid">
        {/* Protected Sanctuaries */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>🏞️ {lang === 'ar' ? 'المحميات الطبيعية والمتنزهات القومية' : 'Monitored National Parks & Reserves'}</span>
          </h3>

          <div className="tab-table-wrapper">
            <table className="tab-table">
              <thead>
                <tr>
                  <th>{lang === 'ar' ? 'المعرف' : 'ID'}</th>
                  <th>{lang === 'ar' ? 'المحمية' : 'Sanctuary Name'}</th>
                  <th>{lang === 'ar' ? 'المساحة' : 'Area (ha)'}</th>
                  <th>{lang === 'ar' ? 'المسافة للنار' : 'Distance'}</th>
                  <th>{lang === 'ar' ? 'مستوى التهديد' : 'Threat Level'}</th>
                </tr>
              </thead>
              <tbody>
                {sanctuaries.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 'bold' }}>{s.id}</td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.totalHa}</td>
                    <td>
                      <strong style={{ color: s.firePerimeterDistanceKm < 5 ? '#ef4444' : '#facc15' }}>
                        {s.firePerimeterDistanceKm.toFixed(1)} km
                      </strong>
                    </td>
                    <td>
                      <span className={s.threatLevel === 'HIGH' ? 'badge-critical' : s.threatLevel === 'MODERATE' ? 'badge-high' : 'badge-low'}>
                        {s.threatLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Endangered Species Dossier */}
        <div className="tab-panel">
          <h3 className="tab-panel-title">
            <span>🐆 {lang === 'ar' ? 'سجل الأنواع المهددة بالانقراض' : 'Endangered Species Risk Register'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {speciesList.map((sp, idx) => (
              <div key={idx} className="hud-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#f1f5f9' }}>
                    {lang === 'ar' ? sp.commonNameAr : sp.commonNameEn}
                  </strong>
                  <span className={sp.status === 'CRITICALLY_ENDANGERED' ? 'badge-critical' : 'badge-high'}>
                    {sp.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', margin: '2px 0 6px 0' }}>
                  {sp.scientificName}
                </div>

                <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {sp.rescueStatus}
                </p>

                <div style={{ fontSize: '0.74rem', color: '#f97316', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '4px' }}>
                  ⚠️ {lang === 'ar' ? 'الموطن المهدد:' : 'Threatened Habitat:'} {sp.habitatThreatenedHa}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
