import React from 'react';
import InfoPage from './InfoPage';

const PrivacyPolicy: React.FC = () => {
  return (
    <InfoPage 
      title="Privacy Policy" 
      emoji="🔒"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Matters</h2>
        <p className="text-gray-700 mb-4">
          KS2 Learning Engine is committed to protecting the privacy and security of our users, 
          especially children. This Privacy Policy explains how we collect, use, and safeguard your information.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Information We Collect</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Account information (name, age, email for parent/teacher accounts)</li>
          <li>Learning progress and quiz results</li>
          <li>Avatar customization preferences</li>
          <li>Device and browser information for technical support</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">How We Use Your Information</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Personalize learning experiences and track progress</li>
          <li>Provide parent and teacher dashboards</li>
          <li>Improve our educational content and platform</li>
          <li>Ensure platform security and prevent abuse</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Data Protection for Children</h3>
        <p className="text-gray-700 mb-4">
          We comply with COPPA (Children's Online Privacy Protection Act) and GDPR requirements. 
          We do not sell children's data to third parties. Parent consent is required for children under 13.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Contact Us</h3>
        <p className="text-gray-700">
          For privacy questions or to exercise your data rights, contact us at:{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default PrivacyPolicy;
