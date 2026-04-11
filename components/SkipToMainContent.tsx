/**
 * Skip to Main Content Component
 * 
 * Accessibility link to skip navigation
 */

import React from 'react';

export const SkipToMainContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-4"
    >
      Skip to main content
    </a>
  );
};