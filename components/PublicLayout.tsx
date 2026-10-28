import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADIENTS, SHADOWS } from '../constants';
import { OwlLogo } from './sunny/OwlLogo';
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SkipToMainContent />
      {/* Simple Header */}
      <header className={`bg-gradient-to-r ${GRADIENTS.primary} ${SHADOWS.large} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="sunny-brand-target flex min-w-0 items-center rounded-lg p-2"
          >
            <OwlLogo height={48} sticker className="sunny-public-logo" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg border-2 border-blue-100"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow w-full">
        {children}
      </main>

      <Footer />

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
};
