import React, { useState } from 'react';
import { SatelliteIcon, LayersIcon, CpuIcon, FlameIcon, ChartLineIcon, AlertTriangleIcon, ShieldAlertIcon } from '../icons';

interface DataPipelineProps {
  lang: 'en' | 'ar';
}

export const DataPipeline: React.FC<DataPipelineProps> = ({ lang }) => {
  const [activeStep, setActiveStep] = useState<number>(2);

  const steps = [
    {
      id: 0,
      titleEn: 'NASA Satellite Data',
      titleAr: 'بيانات أقمار NASA',
      subEn: 'Raw orbital swaths',
      subAr: 'مسارات الأقمار الخام',
      detailEn: 'Direct broadcast downlink from Terra, Aqua, Suomi-NPP & NOAA-20 platforms.',
      detailAr: 'استقبال مباشر من منصات Terra وAqua وSuomi-NPP وNOAA-20.',
      icon: <SatelliteIcon size={20} />,
      badge: 'INPUT',
    },
    {
      id: 1,
      titleEn: 'MODIS + VIIRS',
      titleAr: 'مستشعرات MODIS وVIIRS',
      subEn: 'Multi-band radiometric',
      subAr: 'قياس إشعاعي متعدد النطاقات',
      detailEn: 'Mid-infrared (3.9µm) and thermal (11µm) channel radiance calibration.',
      detailAr: 'معايرة قنوات الأشعة تحت الحمراء المتوسطة والحرارية لكشف الانبعاثات.',
      icon: <LayersIcon size={20} />,
      badge: 'SENSORS',
    },
    {
      id: 2,
      titleEn: 'Data Harmonization',
      titleAr: 'مواءمة وتوحيد البيانات',
      subEn: 'Cross-sensor calibration',
      subAr: 'معايرة المستشعرات المتقاطعة',
      detailEn: 'Spatial resampling, point-spread function normalization, and false-alarm suppression.',
      detailAr: 'إعادة التشكيل المكاني وتوحيد دقة الرصد وحذف الانعكاسات المضللة.',
      icon: <CpuIcon size={20} />,
      badge: 'CORE ENGINE',
    },
    {
      id: 3,
      titleEn: 'Fire Detection',
      titleAr: 'رصد بؤر الحرائق',
      subEn: 'FRP & Brightness Temp',
      subAr: 'طاقة FRP وحرارة السطوع',
      detailEn: 'Automated thermal anomaly identification with pixel-level fire radiative power (MW).',
      detailAr: 'تحديد آلي للشذوذ الحراري مع حساب دقيق لطاقة الحريق الإشعاعية.',
      icon: <FlameIcon size={20} />,
      badge: 'REAL-TIME',
    },
    {
      id: 4,
      titleEn: 'Historical Analysis',
      titleAr: 'التحليل التاريخي',
      subEn: '24-year climatology',
      subAr: 'مناخية 24 عاماً السابقة',
      detailEn: 'Benchmarking against decadal fire return intervals and seasonal peak curves.',
      detailAr: 'مقارنة آنية مع دورات تكرار الحرائق لعقود لتحديد مدى خطورة التوقيت.',
      icon: <ChartLineIcon size={20} />,
      badge: 'ANALYTICS',
    },
    {
      id: 5,
      titleEn: 'Anomaly Detection',
      titleAr: 'كشف الشذوذ الحراري',
      subEn: 'Rapid-spread warnings',
      subAr: 'إنذار الانتشار السريع',
      detailEn: 'Statistical z-score outlier detection identifying explosive fire front escalation.',
      detailAr: 'خوارزميات كشف الشذوذ الإحصائي للتعرف على بؤر الاشتعال الانفجارية.',
      icon: <AlertTriangleIcon size={20} />,
      badge: 'AI INFERENCE',
    },
    {
      id: 6,
      titleEn: 'Actionable Intelligence',
      titleAr: 'معلومات استخباراتية فورية',
      subEn: 'Evacuation & Triage',
      subAr: 'خطط الإخلاء والأولويات',
      detailEn: 'Synthesized GIS layers deployed to fire command centers and first responders.',
      detailAr: 'طبقات GIS جاهزة وموجهة لمراكز قيادة الدفاع المدني وفرق الاستجابة.',
      icon: <ShieldAlertIcon size={20} />,
      badge: 'OUTPUT',
    },
  ];

  return (
    <section className="data-pipeline-section" id="pipeline">
      <div className="section-container">
        <div className="section-header-centered">
          <div className="section-eyebrow-badge">
            <CpuIcon size={12} />
            <span>END-TO-END GEOSPATIAL PIPELINE</span>
          </div>
          <h2 className="section-title-large">
            {lang === 'ar' ? (
              <>معمارية معالجة البيانات: <span className="highlight-cyan">من الأقمار إلى القرارات الميدانية</span></>
            ) : (
              <>Automated Intelligence Pipeline: <span className="highlight-cyan">From Space to Response</span></>
            )}
          </h2>
          <p className="section-subtitle-text">
            {lang === 'ar'
              ? 'رحلة البيانات اللحظية من مستشعرات الأقمار الصناعية وحتى مخرجات التحليل التنبؤي في 7 مراحل متصلة.'
              : 'Our distributed ingestion and calibration stream processes raw radiometer swaths into operational wildfire alerts in under 3 minutes.'}
          </p>
        </div>

        {/* Horizontal Pipeline Interactive Container */}
        <div className="pipeline-track-wrapper">
          <div className="pipeline-track-line" />
          <div className="pipeline-steps-grid">
            {steps.map((step) => {
              const isSelected = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`pipeline-node-card ${isSelected ? 'active-node' : ''}`}
                  onClick={() => setActiveStep(step.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="node-badge-tag">{step.badge}</div>
                  <div className="node-icon-wrapper">
                    {step.icon}
                    <div className="node-glow-halo" />
                  </div>
                  <h4 className="node-step-title">
                    {lang === 'ar' ? step.titleAr : step.titleEn}
                  </h4>
                  <p className="node-step-sub">
                    {lang === 'ar' ? step.subAr : step.subEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Step Detailed Callout Banner */}
          <div className="pipeline-detail-banner">
            <div className="detail-step-chip">
              <span>STEP {activeStep + 1} OF 7</span>
            </div>
            <div className="detail-content-text">
              <strong>{lang === 'ar' ? steps[activeStep].titleAr : steps[activeStep].titleEn}: </strong>
              <span>{lang === 'ar' ? steps[activeStep].detailAr : steps[activeStep].detailEn}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
