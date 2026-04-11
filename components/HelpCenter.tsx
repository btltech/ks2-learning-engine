import React from 'react';
import InfoPage from './InfoPage';
import { RADIUS } from '../constants';

const HelpCenter: React.FC = () => {
  return (
    <InfoPage 
      title="Help Center" 
      emoji="💬"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">We're Here to Help</h2>
        <p className="text-gray-700 mb-6">
          Find answers to common questions or contact our support team.
        </p>

        <div className={`bg-blue-50 ${RADIUS.card} p-6 mb-6`}>
          <h3 className="text-xl font-bold text-blue-900 mb-3">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a href="/getting-started" className="text-blue-600 hover:underline">→ Getting Started Guide</a>
            <a href="/parent-guide" className="text-blue-600 hover:underline">→ Parent Guide</a>
            <a href="/teacher-guide" className="text-blue-600 hover:underline">→ Teacher Guide</a>
            <a href="/how-it-works" className="text-blue-600 hover:underline">→ How It Works</a>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How do I create a student account?</summary>
            <p className="text-gray-700 mt-2">
              Parents or teachers need to create an account first, then generate a unique code for each child. 
              Students use this code to create their profile.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How do I link my child to my parent account?</summary>
            <p className="text-gray-700 mt-2">
              In your Parent Dashboard, click "Link Child" and enter the unique code shown in your child's account 
              (found in their Settings page).
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">Can multiple children use one account?</summary>
            <p className="text-gray-700 mt-2">
              No. Each child should have their own account to track individual progress accurately. 
              Parents can link multiple children to one parent account.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">Is the content aligned with the National Curriculum?</summary>
            <p className="text-gray-700 mt-2">
              Yes! All content is mapped to UK National Curriculum objectives for Key Stage 2 (ages 7-11).
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How does MiRa the AI tutor work?</summary>
            <p className="text-gray-700 mt-2">
              MiRa uses AI to provide age-appropriate hints, explanations, and encouragement. 
              All interactions are monitored for safety and appropriateness.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">Can I use this offline?</summary>
            <p className="text-gray-700 mt-2">
              Some features work offline, but quizzes and AI assistance require an internet connection.
            </p>
          </details>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Contact Support</h3>
        <div className={`bg-green-50 border-l-4 border-green-500 ${RADIUS.card} p-4`}>
          <p className="font-bold text-green-900">Need More Help?</p>
          <p className="text-gray-700 mt-2">Email us at: <a href="mailto:support@ks2learning.com" className="text-blue-600 hover:underline">support@ks2learning.com</a></p>
          <p className="text-gray-700 text-sm mt-1">We typically respond within 24 hours (Monday-Friday).</p>
        </div>
      </div>
    </InfoPage>
  );
};

export default HelpCenter;
