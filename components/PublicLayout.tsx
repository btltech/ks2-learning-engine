import React, { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GRADIENTS, SHADOWS } from '../constants';
import { OwlLogo } from './sunny/OwlLogo';
import { KidButton } from './sunny/KidButton';
import './LandingPage.css';
import './PublicPhoneHeader.css';
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
  const isPublicEntry = isLanding || pathname === '/login';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const openAccountPage = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const headerAppearance = isLanding ? 'sunny-landing-header' : `bg-gradient-to-r ${GRADIENTS.primary} ${SHADOWS.large} sticky top-0 z-50`;

  return (
    <div className={isLanding ? 'sunny-landing-shell min-h-screen flex flex-col' : 'min-h-screen flex flex-col bg-white'}>
      <SkipToMainContent />
      {/* Simple Header */}
      <header className={`${isPublicEntry ? 'sunny-public-entry-header sunny-ui ' : ''}${headerAppearance}`}>
        <div className={`${isPublicEntry ? 'public-entry-header-inner ' : ''}${isLanding ? 'landing-header-inner' : 'max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'}`}>
          <button
            onClick={() => navigate('/')}
            className={isLanding ? 'sunny-brand-target landing-home' : 'sunny-brand-target flex min-w-0 items-center rounded-lg p-2'}
          >
            <OwlLogo height={isLanding ? 56 : 48} sticker={!isLanding} className={isLanding ? 'landing-header-logo' : 'sunny-public-logo'} />
          </button>

          {isPublicEntry && <>
            <button
              ref={menuButtonRef}
              type="button"
              className="public-entry-menu-toggle"
              aria-label="Navigation menu"
              aria-expanded={menuOpen}
              aria-controls={navigationId}
              onClick={() => setMenuOpen(open => !open)}
            >
              <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span> Menu
            </button>
            <nav id={navigationId} aria-label="Main" data-open={menuOpen} className={`landing-header-nav public-entry-menu${isLanding ? '' : ' public-entry-phone-only'}`}>
              {[
                ['How it works', 'how-it-works-heading'],
                ['Subjects', 'subjects-heading'],
                ['Accessibility', 'features-heading'],
                ['Grown-ups', 'audience-heading'],
              ].map(([label, anchor]) => <a key={anchor} href={`${isLanding ? '' : '/'}#${anchor}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
            </nav>
            <div className={`landing-header-actions${isLanding ? '' : ' public-entry-phone-only'}`}>
              <KidButton size="sm" variant="white" onClick={() => openAccountPage('/login')}>Sign in</KidButton>
              <KidButton size="sm" onClick={() => openAccountPage('/login?mode=register')}>Create a family account</KidButton>
            </div>
          </>}
          {!isLanding && <button
            onClick={() => navigate('/login')}
            className={`${isPublicEntry ? 'public-entry-desktop-login ' : ''}bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg border-2 border-blue-100`}
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
