import React from 'react';
import InfoPage from './InfoPage';

const SafeguardingPolicy: React.FC = () => {
  return (
    <InfoPage 
      title="Safeguarding & Child Protection" 
      emoji="🛡️"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Keeping Children Safe Online</h2>
        <p className="text-gray-700 mb-4">
          The safety and wellbeing of children is our highest priority. This policy outlines our commitment 
          to safeguarding and the measures we take to protect young learners.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Our Safeguarding Commitments</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Age-appropriate content with strict content moderation</li>
          <li>No public chat or direct messaging between children</li>
          <li>Secure authentication and data protection measures</li>
          <li>Parent and teacher oversight through monitoring dashboards</li>
          <li>Regular security audits and compliance reviews</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Content Safety</h3>
        <p className="text-gray-700 mb-4">
          All educational content is reviewed to ensure it is:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Age-appropriate and curriculum-aligned</li>
          <li>Free from inappropriate language or imagery</li>
          <li>Inclusive and respectful of all backgrounds</li>
          <li>Educationally sound and fact-checked</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Reporting Concerns</h3>
        <p className="text-gray-700 mb-4">
          If you have any safeguarding concerns, please contact us immediately:
        </p>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="font-bold text-red-900">Safeguarding Contact</p>
          <p className="text-red-800">Email: <a href="mailto:safeguarding@ks2learning.com" className="underline">safeguarding@ks2learning.com</a></p>
          <p className="text-red-800">We respond to safeguarding reports within 24 hours.</p>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">For Parents and Teachers</h3>
        <p className="text-gray-700 mb-4">
          We encourage active supervision of children's online learning. Use the monitoring dashboards 
          to track activity and set appropriate usage limits.
        </p>
      </div>
    </InfoPage>
  );
};

export default SafeguardingPolicy;
