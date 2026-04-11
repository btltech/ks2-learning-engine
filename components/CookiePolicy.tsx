import React from 'react';
import InfoPage from './InfoPage';

const CookiePolicy: React.FC = () => {
  return (
    <InfoPage 
      title="Cookie Policy" 
      emoji="🍪"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
        <p className="text-gray-700 mb-4">
          KS2 Learning Engine uses cookies and similar technologies to improve your experience and understand platform usage.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">What Are Cookies?</h3>
        <p className="text-gray-700 mb-4">
          Cookies are small text files stored on your device that help us remember your preferences and provide functionality.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Types of Cookies We Use</h3>
        <div className="space-y-4 mb-4">
          <div>
            <h4 className="font-bold text-gray-900">Essential Cookies</h4>
            <p className="text-gray-700">Required for login, authentication, and core platform functionality.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Preference Cookies</h4>
            <p className="text-gray-700">Remember your settings like language, avatar customization, and UI preferences.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Analytics Cookies</h4>
            <p className="text-gray-700">Help us understand how users interact with the platform to improve it.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Managing Cookies</h3>
        <p className="text-gray-700 mb-4">
          You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Contact</h3>
        <p className="text-gray-700">
          Cookie-related questions? Email{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default CookiePolicy;
