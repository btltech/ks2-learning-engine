import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GRADIENTS, SHADOWS } from '../constants';
import { OwlLogo } from './sunny/OwlLogo';
import { KidButton } from './sunny/KidButton';
import './LandingPage.css';
import { CookieBanner } from './CookieBanner';
import Footer from './Footer';
import { SkipToMainContent } from './SkipToMainContent';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * PublicLayout - Minimal layout for public pages (privacy, terms, contact, etc.)
 * Shown when users are not authenticated
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const isLanding = pathname === '/' && new URLSearchParams(search).get('verified') !== 'true';

  return (
    <div className={isLanding ? 'sunny-landing-shell min-h-screen flex flex-col' : 'min-h-screen flex flex-col bg-white'}>
      <SkipToMainContent />
      {/* Simple Header */}
      <header className={isLanding ? 'sunny-ui sunny-landing-header' : `bg-gradient-to-r ${GRADIENTS.primary} ${SHADOWS.large} sticky top-0 z-50`}>
        <div className={isLanding ? 'landing-header-inner' : 'max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'}>
          <button
            onClick={() => navigate('/')}
            className={isLanding ? 'sunny-brand-target landing-home' : 'sunny-brand-target flex min-w-0 items-center rounded-lg p-2'}
          >
            <OwlLogo height={isLanding ? 56 : 48} sticker={!isLanding} className={isLanding ? 'landing-header-logo' : 'sunny-public-logo'} />
          </button>

          {isLanding ? <>
            <nav aria-label="Main" className="landing-header-nav">
              <a href="#how-it-works-heading">How it works</a><a href="#subjects-heading">Subjects</a><a href="#features-heading">Accessibility</a><a href="#audience-heading">Grown-ups</a>
            </nav>
            <div className="landing-header-actions"><KidButton size="sm" variant="white" onClick={() => navigate('/login')}>Sign in</KidButton><KidButton size="sm" onClick={() => navigate('/login?mode=register')}>Create a family account</KidButton></div>
          </> : <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg border-2 border-blue-100"
          >
            Login
          </button>}
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow w-full">
        {children}
      </main>

      <Footer variant={isLanding ? 'sunny' : 'default'} />

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
};
