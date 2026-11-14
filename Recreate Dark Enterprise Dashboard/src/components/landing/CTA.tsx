import React from 'react';
import { ArrowRightIcon, GlobeIcon, FlameIcon } from '../icons';

interface CTAProps {
  onExplore: () => void;
  onViewMap: () => void;
  onSignUp?: () => void;
  lang: 'en' | 'ar';
}

export const CTA: React.FC<CTAProps> = ({ onExplore, onViewMap, onSignUp, lang }) => {
  return (
    <section className="cta-cinematic-section">
      <div className="cta-ambient-ember-glow" />
      <div className="cta-ambient-cyan-glow" />

      <div className="section-container">
        <div className="cta-card-wrapper">
          <div className="cta-brand-emblem">
            <FlameIcon size={32} className="cta-flame-icon" />
          </div>

          <h2 className="cta-headline">
            {lang === 'ar' ? (
              <>حوّل بيانات الأقمار الصناعية إلى <span className="highlight-cyan">منظومة Fire sync الذكية</span></>
            ) : (
              <>Turn Satellite Data Into <span className="highlight-cyan">Fire sync Intelligence</span></>
            )}
          </h2>

          <p className="cta-subtitle">
            {lang === 'ar'
              ? 'استكشف عقوداً من رصد حرائق الغابات بالأقمار الصناعية واكتشف الأنماط التي تشكل بيئتنا سريعة التغير.'
              : 'Explore decades of wildfire observations and discover the patterns shaping our changing environment.'}
          </p>

          <div className="cta-buttons-row">
            {onSignUp ? (
              <button
                type="button"
                className="btn-primary-explore large"
                onClick={onSignUp}
              >
                <span>{lang === 'ar' ? 'الدخول إلى المنظومة الآن' : 'Get Started with Fire sync'}</span>
                <ArrowRightIcon size={20} className="btn-arrow-icon" />
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary-explore large"
                onClick={onExplore}
              >
                <span>{lang === 'ar' ? 'استكشف منظومة Fire sync' : 'Explore Fire sync'}</span>
                <ArrowRightIcon size={20} className="btn-arrow-icon" />
              </button>
            )}

            <button
              type="button"
              className="btn-secondary-learn large"
              onClick={onViewMap}
            >
              <GlobeIcon size={18} />
              <span>{lang === 'ar' ? 'عرض الخريطة العالمية المباشرة' : 'View Global Map'}</span>
            </button>
          </div>

          <div className="cta-trust-badge">
            <span className="dot-green" />
            <span>OPERATIONAL GIS PLATFORM • NASA FIRMS & COPERNICUS DATA READY</span>
          </div>
        </div>
      </div>
    </section>
  );
};
