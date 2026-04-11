import React from 'react';
import InfoPage from './InfoPage';

const TermsOfService: React.FC = () => {
  return (
    <InfoPage 
      title="Terms of Service" 
      emoji="📜"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
        <p className="text-gray-700 mb-4">
          By using KS2 Learning Engine, you agree to these terms. Please read them carefully.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Acceptable Use</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Use the platform for educational purposes only</li>
          <li>Respect other users and maintain a safe learning environment</li>
          <li>Do not attempt to access unauthorized areas or data</li>
          <li>Do not share account credentials</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">User Accounts</h3>
        <p className="text-gray-700 mb-4">
          Parents and teachers are responsible for managing child accounts and monitoring usage. 
          You must provide accurate information when creating accounts.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Intellectual Property</h3>
        <p className="text-gray-700 mb-4">
          All educational content, quizzes, and platform features are owned by KS2 Learning Engine. 
          Users may not redistribute or repurpose content without permission.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Limitation of Liability</h3>
        <p className="text-gray-700 mb-4">
          We strive to provide accurate educational content but make no guarantees about specific learning outcomes. 
          Use of this platform is at your own discretion.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Contact</h3>
        <p className="text-gray-700">
          Questions about these terms? Email{' '}
          <a href="mailto:legal@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            legal@demiwuraks2.co.uk
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default TermsOfService;
