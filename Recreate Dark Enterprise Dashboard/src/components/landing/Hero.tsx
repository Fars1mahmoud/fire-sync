import React, { useEffect, useRef } from 'react';
import { ArrowRightIcon } from '../icons';
import { FeatureStrip } from './FeatureStrip';
import heroEarthBg from '../../assets/hero_earth_cinematic.jpg';
import heroVideo from '../../assets/video1.mp4';

interface HeroProps {
  onExplore: () => void;
  onLearnMore: () => void;
  onSelectCountry?: (country: 'Brazil' | 'Canada') => void;
  onSelectFeature?: (featureId: string) => void;
  lang: 'en' | 'ar';
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onLearnMore,
  onSelectCountry,
  onSelectFeature,
  lang,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 1.0;
    video.muted = false;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Playing with sound automatically
        })
        .catch(() => {
          // If browser restricts unmuted autoplay before any user gesture,
          // start playing video immediately, and unmute as soon as user touches/clicks anywhere
          video.muted = true;
          video.play().catch(() => {});

          const unmuteOnInteraction = () => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              videoRef.current.volume = 1.0;
              videoRef.current.play().catch(() => {});
            }
          };

          window.addEventListener('click', unmuteOnInteraction, { once: true });
          window.addEventListener('pointerdown', unmuteOnInteraction, { once: true });
          window.addEventListener('keydown', unmuteOnInteraction, { once: true });
          window.addEventListener('scroll', unmuteOnInteraction, { once: true });

          return () => {
            window.removeEventListener('click', unmuteOnInteraction);
            window.removeEventListener('pointerdown', unmuteOnInteraction);
            window.removeEventListener('keydown', unmuteOnInteraction);
            window.removeEventListener('scroll', unmuteOnInteraction);
          };
        });
    }
  }, []);

  return (
    <section className="cinematic-hero-section full-backdrop-hero">
      {/* Background Video Stream replacing static picture */}
      <div className="hero-video-wrapper" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-video-media"
          autoPlay
          loop
          playsInline
          poster={heroEarthBg}
        >
          <source src={heroVideo} type="video/mp4" />
          <source src="/video1.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay-gradient" />
      </div>

      <div className="hero-main-layout">
        {/* Left Column: All Text, Headline, Buttons, and 4 Features */}
        <div className="hero-content-col">
          {/* Main Headline (64-76px bold typography) */}
          <h1 className="hero-cinematic-title">
            <span className="title-white-segment">
              {lang === 'ar' ? 'منظومة Fire sync الموحدة' : 'Unified Fire sync'}
            </span>
            <br />
            <span className="title-cyan-segment">
              {lang === 'ar' ? 'عبر بيانات MODIS & VIIRS' : 'from MODIS & VIIRS'}
            </span>
          </h1>

          {/* Narrative Subtitle */}
          <p className="hero-cinematic-description">
            {lang === 'ar'
              ? 'نعمل على مواءمة رصد حرائق الغابات بالأقمار الصناعية متعددة المستشعرات، والاستفادة من الأنماط التاريخية، وتوفير رؤى قابلة للتنفيذ من أجل كوكب أكثر أماناً ومرونة.'
              : 'We harmonize multi-sensor satellite fire observations, leverage historical patterns, and provide actionable insights for a safer and more resilient planet.'}
          </p>

          {/* Action Buttons */}
          <div className="hero-button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              className="btn-primary-explore"
              onClick={onExplore}
            >
              <span>{lang === 'ar' ? 'استكشف الخريطة التكتيكية' : 'Explore Tactical Map'}</span>
              <ArrowRightIcon size={18} className="btn-arrow-icon" />
            </button>

            {onSelectCountry && (
              <>
                <button
                  type="button"
                  className="btn-secondary-learn"
                  onClick={() => onSelectCountry('Brazil')}
                  style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)' }}
                >
                  <span>🇧🇷 {lang === 'ar' ? 'ملف البرازيل (7.69M)' : 'Brazil Archive (7.69M)'}</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary-learn"
                  onClick={() => onSelectCountry('Canada')}
                  style={{ borderColor: 'rgba(56, 189, 248, 0.5)', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}
                >
                  <span>🇨🇦 {lang === 'ar' ? 'ملف كندا (3.18M)' : 'Canada Archive (3.18M)'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              className="btn-secondary-learn"
              onClick={onLearnMore}
            >
              <span>{lang === 'ar' ? 'عن المنظومة' : 'Learn More'}</span>
            </button>
          </div>

          {/* Feature Strip (4 Pillars at bottom of hero content) */}
          <FeatureStrip onSelectFeature={onSelectFeature} lang={lang} />
        </div>

        {/* Right Stage: Spacer preserving layout while letting the clear Earth background shine */}
        <div className="hero-earth-overlay-stage" aria-hidden="true" />
      </div>
    </section>
  );
};
