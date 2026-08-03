import React from 'react';
import InfoPage from './InfoPage';

const CookiePolicy: React.FC = () => {
  return (
    <InfoPage
      title="Cookie Policy"
      emoji="🍪"
      lastUpdated="April 17, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          How DemiWura Uses Cookies and Local Storage
        </h2>
        <p className="text-gray-700 mb-4">
          This policy explains how DemiWura uses cookies and browser storage in compliance with the{' '}
          <strong>UK Privacy and Electronic Communications Regulations (PECR)</strong> and UK GDPR.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">What Are Cookies?</h3>
        <p className="text-gray-700 mb-4">
          Cookies are small text files placed on your device by a website. DemiWura also uses{' '}
          <strong>localStorage</strong> and <strong>sessionStorage</strong> — similar browser-based
          storage that keeps data on your device and does not send it to external servers.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
          Strictly Necessary Storage
        </h3>
        <p className="text-gray-700 mb-3">
          These are required for the platform to function and do not require your consent under PECR.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700 border-b">Name / Key</th>
                <th className="text-left p-3 font-semibold text-gray-700 border-b">Type</th>
                <th className="text-left p-3 font-semibold text-gray-700 border-b">Purpose</th>
                <th className="text-left p-3 font-semibold text-gray-700 border-b">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3 text-gray-700 font-mono text-xs">Firebase Auth token</td>
                <td className="p-3 text-gray-700">IndexedDB / Cookie</td>
                <td className="p-3 text-gray-700">Keeps you logged in</td>
                <td className="p-3 text-gray-700">Session / 1 hour</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-700 font-mono text-xs">ks2_user_preferences</td>
                <td className="p-3 text-gray-700">localStorage</td>
                <td className="p-3 text-gray-700">Saves UI settings (theme, font, language)</td>
                <td className="p-3 text-gray-700">Until cleared</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-700 font-mono text-xs">ks2_progress_*</td>
                <td className="p-3 text-gray-700">localStorage</td>
                <td className="p-3 text-gray-700">Caches learning progress locally</td>
                <td className="p-3 text-gray-700">Until cleared</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-700 font-mono text-xs">email_verify_banner_dismissed</td>
                <td className="p-3 text-gray-700">sessionStorage</td>
                <td className="p-3 text-gray-700">Remembers you dismissed the verification banner</td>
                <td className="p-3 text-gray-700">Browser session</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-700 font-mono text-xs">cookie_consent</td>
                <td className="p-3 text-gray-700">localStorage</td>
                <td className="p-3 text-gray-700">Records your cookie consent choice</td>
                <td className="p-3 text-gray-700">Until cleared</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Analytics Storage</h3>
        <p className="text-gray-700 mb-4">
          DemiWura includes a learning analytics feature that tracks your progress and quiz performance.
          <strong> This data is stored entirely on your own device</strong> using localStorage — it is
          never sent to our servers or any third party. It is used solely to show you and your
          parent or teacher your progress over time.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700 border-b">Key</th>
                <th className="text-left p-3 font-semibold text-gray-700 border-b">Purpose</th>
                <th className="text-left p-3 font-semibold text-gray-700 border-b">Sent externally?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3 text-gray-700 font-mono text-xs">ks2_analytics_*</td>
                <td className="p-3 text-gray-700">Local learning progress analytics</td>
                <td className="p-3 text-gray-700 font-semibold text-green-700">No — device only</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-700 font-mono text-xs">ks2_sessions_*</td>
                <td className="p-3 text-gray-700">Learning session history</td>
                <td className="p-3 text-gray-700 font-semibold text-green-700">No — device only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Third-Party Cookies</h3>
        <p className="text-gray-700 mb-4">
          DemiWura does <strong>not</strong> use Google Analytics, Facebook Pixel, advertising
          networks, or any third-party tracking cookies. Firebase Authentication may set its own
          cookies for session management — see{' '}
          <a
            href="https://firebase.google.com/support/privacy"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firebase's privacy documentation
          </a>{' '}
          for details.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Managing Cookies</h3>
        <p className="text-gray-700 mb-3">
          You can clear cookies and localStorage at any time through your browser settings. Clearing
          essential storage will log you out and reset your preferences. Your learning progress stored
          in our database will not be affected.
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/guide/safari/manage-cookies-sfri11471"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>

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
