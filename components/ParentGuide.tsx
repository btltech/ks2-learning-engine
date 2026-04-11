import React from 'react';
import InfoPage from './InfoPage';
import { GRADIENTS, RADIUS, SHADOWS } from '../constants';

const ParentGuide: React.FC = () => {
  return (
    <InfoPage 
      title="Parent Guide" 
      emoji="👨‍👩‍👧‍👦"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Supporting Your Child's Learning Journey</h2>
        <p className="text-gray-700 mb-6">
          Welcome to KS2 Learning Engine! This guide will help you support your child's education 
          and make the most of our platform.
        </p>

        <div className={`bg-blue-50 ${RADIUS.card} p-6 mb-6`}>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Quick Start</h3>
          <ol className="list-decimal pl-6 text-gray-700 space-y-1">
            <li>Create a parent account</li>
            <li>Link your child's account using their unique code</li>
            <li>Review the monitoring dashboard</li>
            <li>Set learning goals and time limits (optional)</li>
          </ol>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Monitoring Progress</h3>
        <p className="text-gray-700 mb-4">
          Your Parent Dashboard shows:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
          <li>Recent quiz scores and learning streaks</li>
          <li>Subject progress and mastery levels</li>
          <li>Time spent on each subject</li>
          <li>Areas where your child might need extra support</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Tips for Success</h3>
        <div className="space-y-4 mb-6">
          <div className={`${RADIUS.card} p-4 border-l-4 border-green-500 bg-green-50`}>
            <p className="font-bold text-green-900">Encourage Regular Practice</p>
            <p className="text-gray-700">Short daily sessions (15-20 minutes) are more effective than long irregular ones.</p>
          </div>
          <div className={`${RADIUS.card} p-4 border-l-4 border-blue-500 bg-blue-50`}>
            <p className="font-bold text-blue-900">Celebrate Effort, Not Just Scores</p>
            <p className="text-gray-700">Praise persistence and improvement. Learning is a journey!</p>
          </div>
          <div className={`${RADIUS.card} p-4 border-l-4 border-purple-500 bg-purple-50`}>
            <p className="font-bold text-purple-900">Use MiRa for Support</p>
            <p className="text-gray-700">The AI tutor can provide hints and explanations when you're not available.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Safety and Screen Time</h3>
        <p className="text-gray-700 mb-4">
          We recommend balanced screen time. Use the platform alongside offline learning activities 
          like reading books, hands-on experiments, and outdoor play.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Need Help?</h3>
        <p className="text-gray-700">
          Contact us at{' '}
          <a href="mailto:parents@ks2learning.com" className="text-blue-600 hover:underline">
            parents@ks2learning.com
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default ParentGuide;
