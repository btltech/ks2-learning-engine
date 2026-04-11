import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADIENTS, SHADOWS } from '../constants';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Simple Header */}
      <header className={`${GRADIENTS.primary} ${SHADOWS.large} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 rounded"
          >
            <span className="text-3xl" role="img" aria-label="KS2 Learning">
              📚
            </span>
            <span className="text-xl font-bold text-white">KS2 Learning</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2026 KS2 Learning Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
