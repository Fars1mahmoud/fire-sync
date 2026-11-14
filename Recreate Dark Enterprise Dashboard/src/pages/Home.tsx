import React, { useState } from 'react';
import { LandingNavbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { IntelligenceOverview } from '../components/landing/IntelligenceOverview';
import { GlobalFireMap } from '../components/landing/GlobalFireMap';
import { AnalyticsPreview } from '../components/landing/AnalyticsPreview';
import { DataPipeline } from '../components/landing/DataPipeline';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';
import { AuthModal, type UserProfile } from '../components/AuthModal';
import { AboutModal } from '../components/AboutModal';
import '../components/landing/LandingSystem.css';

interface HomeProps {
  onNavigate: (page: any, region?: string) => void;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  currentUser: UserProfile | null;
  setCurrentUser: (u: UserProfile | null) => void;
  hideNavbar?: boolean;
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  lang,
  setLang,
  currentUser,
  setCurrentUser,
  hideNavbar = false,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('fire_intel_user');
    setCurrentUser(null);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. Global Navigation Bar */}
      {!hideNavbar && (
        <LandingNavbar
          activePage="home"
          onNavigate={onNavigate}
          onOpenAuth={handleOpenAuth}
          currentUser={currentUser}
          onLogout={handleLogout}
          lang={lang}
          setLang={setLang}
        />
      )}

      {/* 2. Cinematic Hero Section + Feature Strip */}
      <Hero
        onExplore={() => onNavigate('map')}
        onSelectCountry={(country) => onNavigate('map', country)}
        onLearnMore={() => setAboutModalOpen(true)}
        onSelectFeature={(featId) => {
          if (featId === 'historical' || featId === 'anomaly') {
            scrollToSection('analytics');
          } else if (featId === 'harmonization') {
            scrollToSection('pipeline');
          } else {
            scrollToSection('overview');
          }
        }}
        lang={lang}
      />

      {/* 3. Section 2: Intelligence Overview (3 Cards) */}
      <IntelligenceOverview
        onLearnMore={(cardId) => {
          if (cardId === 'detection') onNavigate('map');
          else if (cardId === 'patterns') onNavigate('analytics');
          else setAboutModalOpen(true);
        }}
        lang={lang}
      />

      {/* 4. Section 3: Global Fire Map Preview */}
      <GlobalFireMap
        onOpenFullMap={() => onNavigate('map')}
        lang={lang}
      />

      {/* 5. Section 4: Analytics Preview */}
      <AnalyticsPreview
        onOpenAnalytics={() => onNavigate('analytics')}
        lang={lang}
      />

      {/* 6. Section 5: Data Pipeline (7 Steps) */}
      <DataPipeline lang={lang} />

      {/* 7. Section 6: Call To Action */}
      <CTA
        onExplore={() => onNavigate('map')}
        onViewMap={() => onNavigate('map')}
        onSignUp={() => handleOpenAuth('signup')}
        lang={lang}
      />

      {/* 8. Section 7: Footer */}
      <Footer
        onNavigate={onNavigate}
        lang={lang}
      />

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            onNavigate('map');
          } else {
            onNavigate('user-dashboard');
          }
        }}
        lang={lang}
      />

      {/* About System Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        onExplore={() => {
          setAboutModalOpen(false);
          onNavigate('map');
        }}
        lang={lang}
      />
    </div>
  );
};
