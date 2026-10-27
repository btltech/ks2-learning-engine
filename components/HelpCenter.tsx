import React from 'react';
import InfoPage from './InfoPage';
import { RADIUS } from '../constants';

const HelpCenter: React.FC = () => {
  return (
    <InfoPage 
      title="Help Center" 
      emoji="💬"
      lastUpdated="August 10, 2026"
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
              A parent creates the child profile from the Parent Dashboard and chooses a private 4–6 digit PIN.
              The child then signs in with the same first name and age, the parent's six-character code, and that PIN.
              Children do not need an email address.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">Where do I find my parent code and child PIN?</summary>
            <p className="text-gray-700 mt-2">
              Your parent code appears in the Parent Dashboard. The PIN is shown once when you create it, so save it
              privately. If it is lost, select the child in the dashboard and set a new PIN. Never post either code publicly.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">Can multiple children use one account?</summary>
            <p className="text-gray-700 mt-2">
              One parent account can manage several child profiles. Give each child their own profile and PIN so their
              progress, rewards and recommendations remain separate.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How does a child join a teacher's class?</summary>
            <p className="text-gray-700 mt-2">
              The teacher shares a six-character class code. After the child signs in through their parent-managed
              profile, they can enter that class code in My Class. A class code does not replace the parent code and PIN.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How does a teacher get access?</summary>
            <p className="text-gray-700 mt-2">
              Teacher access is issued by a DemiWura administrator after the account and role have been checked.
              Public registration creates parent accounts only. Contact support if your school needs teacher access.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">Is the content aligned with the National Curriculum?</summary>
            <p className="text-gray-700 mt-2">
              Core and foundation subject sequences are designed around KS2 curriculum expectations. Language and
              enrichment material follows age-appropriate learning sequences. Coverage and individual questions are
              reviewed continuously, so please report anything unclear or inaccurate.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How does MiRa the AI tutor work?</summary>
            <p className="text-gray-700 mt-2">
              MiRa sends the child's question and relevant learning context to Google Gemini to provide short hints and
              explanations. Automated safety checks are applied, but AI can still make mistakes. Children should not enter
              personal information and should ask a trusted adult if an answer seems wrong or worrying.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">Can I use this offline?</summary>
            <p className="text-gray-700 mt-2">
              Previously cached pages and some device-only activities may remain available offline. Signing in, syncing
              progress, loading uncached content, classroom features and MiRa require an internet connection.
            </p>
          </details>

          <details className={`${RADIUS.card} bg-white p-4 shadow-sm`}>
            <summary className="font-bold text-gray-900 cursor-pointer">How do I remove a child profile or request account deletion?</summary>
            <p className="text-gray-700 mt-2">
              Parents can delete a child profile from Parent Monitoring. To close an adult account or make a wider data
              request, use the Contact page or email privacy@demiwuraks2.co.uk. We may need to verify your identity first.
            </p>
          </details>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Contact Support</h3>
        <div className={`bg-green-50 border-l-4 border-green-500 ${RADIUS.card} p-4`}>
          <p className="font-bold text-green-900">Need More Help?</p>
          <p className="text-gray-700 mt-2">Email us at: <a href="mailto:support@demiwuraks2.co.uk" className="text-blue-600 hover:underline">support@demiwuraks2.co.uk</a></p>
          <p className="text-gray-700 text-sm mt-1">We aim to reply within two working days. Complex requests may take longer.</p>
        </div>
      </div>
    </InfoPage>
  );
};

export default HelpCenter;
