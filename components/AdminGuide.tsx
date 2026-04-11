import React from 'react';
import InfoPage from './InfoPage';
import { RADIUS } from '../constants';

const AdminGuide: React.FC = () => {
  return (
    <InfoPage 
      title="Admin Guide" 
      emoji="⚙️"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Administration & Management</h2>
        <p className="text-gray-700 mb-6">
          This guide helps administrators manage the KS2 Learning Engine platform, monitor quality, 
          and ensure optimal performance for all users.
        </p>

        <div className={`bg-purple-50 ${RADIUS.card} p-6 mb-6`}>
          <h3 className="text-xl font-bold text-purple-900 mb-2">Admin Dashboard Overview</h3>
          <p className="text-gray-700 mb-3">Access comprehensive platform management tools:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Content Quality Dashboard</li>
            <li>User Management & Analytics</li>
            <li>Curriculum Coverage Analysis</li>
            <li>Question Performance Review</li>
            <li>System Settings & Configuration</li>
          </ul>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Key Admin Responsibilities</h3>
        
        <div className="space-y-4 mb-6">
          <div className={`${RADIUS.card} p-4 border-l-4 border-orange-500 bg-orange-50`}>
            <h4 className="font-bold text-orange-900">1. Content Quality Review</h4>
            <p className="text-gray-700 mt-2">
              <strong>Why it matters:</strong> Low-quality questions frustrate learners and reduce educational value.
            </p>
            <p className="text-gray-700 mt-2">
              <strong>How to use:</strong> Navigate to <span className="font-mono bg-white px-2 py-1 rounded">Question Quality Dashboard</span>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
              <li>Review questions with low success rates (&lt;30%)</li>
              <li>Check for ambiguous wording or formatting issues</li>
              <li>Flag questions that are too difficult for target year group</li>
              <li>Edit or remove problematic content</li>
            </ul>
          </div>

          <div className={`${RADIUS.card} p-4 border-l-4 border-blue-500 bg-blue-50`}>
            <h4 className="font-bold text-blue-900">2. User Analytics & Monitoring</h4>
            <p className="text-gray-700 mt-2">Track platform usage and engagement:</p>
            <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
              <li>Active users (students, teachers, parents)</li>
              <li>Daily/weekly quiz completion rates</li>
              <li>Subject popularity and engagement trends</li>
              <li>Device and browser distribution</li>
            </ul>
          </div>

          <div className={`${RADIUS.card} p-4 border-l-4 border-green-500 bg-green-50`}>
            <h4 className="font-bold text-green-900">3. Curriculum Coverage</h4>
            <p className="text-gray-700 mt-2">
              Ensure all National Curriculum objectives are adequately covered:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
              <li>Identify gaps in topic coverage</li>
              <li>Review question distribution by year group</li>
              <li>Verify alignment with curriculum standards</li>
              <li>Commission new content for underrepresented topics</li>
            </ul>
          </div>

          <div className={`${RADIUS.card} p-4 border-l-4 border-red-500 bg-red-50`}>
            <h4 className="font-bold text-red-900">4. Safeguarding & Safety</h4>
            <p className="text-gray-700 mt-2">
              <strong>Critical:</strong> Monitor for inappropriate content or behavior
            </p>
            <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
              <li>Review flagged content immediately</li>
              <li>Investigate user reports</li>
              <li>Ensure AI-generated content is age-appropriate</li>
              <li>Respond to safeguarding concerns within 24 hours</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Settings & Configuration</h3>
        <div className={`bg-gray-50 ${RADIUS.card} p-4 mb-6`}>
          <p className="text-gray-700 mb-3">
            <strong>⚠️ Important:</strong> Changes to platform settings affect all users. Always test changes 
            in a staging environment first.
          </p>
          <div className="space-y-2">
            <div>
              <p className="font-bold text-gray-900">Rewards & Gamification</p>
              <p className="text-sm text-gray-600">XP rates, badge criteria, mini-game unlock thresholds</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">AI Generation Settings</p>
              <p className="text-sm text-gray-600">Content moderation, difficulty thresholds, age-appropriate filters</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Access Controls</p>
              <p className="text-sm text-gray-600">Feature flags, role permissions, parental controls</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Safety Settings</p>
              <p className="text-sm text-gray-600">Content filters, allowed domains, data retention policies</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Best Practices</h3>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-6">
          <li>
            <strong>Start with Question Quality:</strong> It's the most actionable admin area. 
            Surface unclear, too-hard, or low-performing questions before they affect more learners.
          </li>
          <li>
            <strong>Save One Group at a Time:</strong> When changing settings, save one group/section 
            at a time so the effect is easy to verify.
          </li>
          <li>
            <strong>Review Analytics Weekly:</strong> Set aside time each week to review usage trends 
            and identify emerging issues.
          </li>
          <li>
            <strong>Document Changes:</strong> Keep a log of configuration changes for troubleshooting.
          </li>
          <li>
            <strong>Prioritize Safeguarding:</strong> Any safety concerns take precedence over all other tasks.
          </li>
        </ol>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Common Admin Tasks</h3>
        <div className="space-y-3 mb-6">
          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How do I add new content/questions?</summary>
            <p className="text-gray-700 mt-2">
              Navigate to Admin Console → Content Management. Select subject and topic, then use the 
              "Add Question" interface. All new content is automatically reviewed by the AI moderation system.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How do I handle a safeguarding report?</summary>
            <p className="text-gray-700 mt-2">
              1. Read the full report immediately<br />
              2. Disable any flagged content<br />
              3. Investigate the context<br />
              4. Contact parents/teachers if needed<br />
              5. Document all actions taken<br />
              6. Respond to reporter within 24 hours
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How do I manage teacher/parent accounts?</summary>
            <p className="text-gray-700 mt-2">
              Admin Console → User Management. You can view all accounts, reset passwords, 
              link/unlink child accounts, and assign roles. Always verify identity before making changes.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">What if the platform is running slowly?</summary>
            <p className="text-gray-700 mt-2">
              Check Admin Console → System Health. Review Firebase usage, API quotas, and error logs. 
              Contact technical support at <a href="mailto:support@demiwuraks2.co.uk" className="text-blue-600 hover:underline">support@demiwuraks2.co.uk</a> 
              {' '}if issues persist.
            </p>
          </details>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Support & Escalation</h3>
        <div className={`bg-blue-50 border-l-4 border-blue-500 ${RADIUS.card} p-4 mb-6`}>
          <p className="font-bold text-blue-900">Admin Support</p>
          <p className="text-gray-700 mt-2">
            For platform administration questions or technical issues:
          </p>
          <p className="text-gray-700 mt-1">
            Email: <a href="mailto:support@demiwuraks2.co.uk" className="text-blue-600 hover:underline">support@demiwuraks2.co.uk</a>
          </p>
          <p className="text-gray-700 mt-1">
            Safeguarding Concerns: <a href="mailto:support@demiwuraks2.co.uk" className="text-blue-600 hover:underline">support@demiwuraks2.co.uk</a> (24hr response)
          </p>
        </div>

        <div className={`bg-yellow-50 border-l-4 border-yellow-500 ${RADIUS.card} p-4`}>
          <p className="font-bold text-yellow-900">⚠️ Remember</p>
          <p className="text-gray-700 mt-2">
            With great power comes great responsibility. Admin actions affect every user on the platform. 
            When in doubt, consult the documentation or reach out to support before making major changes.
          </p>
        </div>
      </div>
    </InfoPage>
  );
};

export default AdminGuide;
