import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RADIUS } from '../constants';

/**
 * Essential storage notice. DemiWura currently has no optional advertising or
 * general-purpose analytics storage to accept or reject.
 */
export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const acknowledged = localStorage.getItem('storageNoticeAcknowledged');
    const legacyChoice = localStorage.getItem('cookieConsent');
    if (!acknowledged && !legacyChoice) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('storageNoticeAcknowledged', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700"
      aria-label="Browser storage notice"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-white text-sm mb-2">
              🍪 <strong>Essential browser storage</strong> keeps you signed in, remembers settings and supports learning features.
            </p>
            <p className="text-gray-300 text-xs">
              We do not use advertising cookies or optional analytics tracking.{' '}
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
              onClick={handleDismiss}
              className={`flex-1 sm:flex-none px-6 py-2 ${RADIUS.button} bg-blue-600 text-white hover:bg-blue-500 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
