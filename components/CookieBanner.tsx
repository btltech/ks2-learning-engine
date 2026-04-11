import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RADIUS, SHADOWS } from '../constants';

/**
 * Cookie Consent Banner
 * Shows on first visit, allows users to accept/decline cookies
 * Stores preference in localStorage
 */
export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-white text-sm mb-2">
              🍪 <strong>We use cookies</strong> to improve your experience and analyze site usage.
            </p>
            <p className="text-gray-300 text-xs">
              By clicking "Accept", you consent to our use of cookies.{' '}
              <button
                onClick={() => navigate('/cookie-policy')}
                className="text-blue-400 hover:text-blue-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              >
                Learn more
              </button>
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className={`flex-1 sm:flex-none px-4 py-2 ${RADIUS.button} bg-gray-700 text-white hover:bg-gray-600 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400`}
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className={`flex-1 sm:flex-none px-6 py-2 ${RADIUS.button} bg-blue-600 text-white hover:bg-blue-500 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${SHADOWS.secondary}`}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
