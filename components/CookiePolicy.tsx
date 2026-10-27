import React from 'react';
import InfoPage from './InfoPage';

const CookiePolicy: React.FC = () => (
  <InfoPage title="Cookies and Device Storage" emoji="🍪" lastUpdated="August 10, 2026">
    <div className="prose max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">What DemiWura stores in your browser</h2>
      <p className="text-gray-700 mb-4">
        DemiWura uses cookies, IndexedDB, Cache Storage, localStorage and sessionStorage. UK rules apply to all
        of these technologies, not just traditional cookies. They let the app sign users in, remember settings,
        work more reliably and keep selected learning features available on the current device.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-950">
        DemiWura currently does not use advertising cookies, Google Analytics, Facebook Pixel or optional
        session-replay tracking. The first-visit message is an information notice, not a request for consent to tracking.
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Essential account and security storage</h3>
      <div className="overflow-x-auto mb-5">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b">Storage</th>
              <th className="text-left p-3 border-b">Purpose</th>
              <th className="text-left p-3 border-b">Typical duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="p-3">Firebase Authentication</td>
              <td className="p-3">Keeps an adult or child securely signed in and refreshes the session</td>
              <td className="p-3">Until sign-out, expiry, revocation or browser data is cleared</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">ks2_user</td>
              <td className="p-3">Caches the signed-in profile so the interface can recover safely</td>
              <td className="p-3">Until sign-out or browser data is cleared</td>
            </tr>
            <tr>
              <td className="p-3">Cloudflare Turnstile storage</td>
              <td className="p-3">Checks that protected forms and sign-in attempts are not automated abuse</td>
              <td className="p-3">Controlled by the security check and Cloudflare</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">storageNoticeAcknowledged</td>
              <td className="p-3">Remembers that this storage notice has been dismissed</td>
              <td className="p-3">Until browser data is cleared</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Preferences and accessibility</h3>
      <p className="text-gray-700 mb-3">
        Keys including <code>ks2_settings</code>, <code>ks2_ui_settings</code>, <code>ks2_language</code>,
        <code>tts-config</code>, sound settings and avatar settings remember choices such as interface mode,
        language, volume, voice and accessibility preferences. They normally remain until changed or cleared.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Learning, rewards and offline storage</h3>
      <p className="text-gray-700 mb-3">
        DemiWura uses groups of keys beginning with <code>ks2_</code> and browser caches to store recent lessons,
        quiz sessions, question history, daily challenges, streaks, rewards, skill trees, certificates, battle history,
        drawing work and offline actions. Some detailed information remains only on the current device. Core profile,
        quiz and class information may also be synchronised to Firebase when the user is authenticated.
      </p>
      <p className="text-gray-700 mb-4">
        Authenticated question attempts also update shared question-quality totals on our server. Those shared totals
        record performance of the question rather than the learner's user identifier. See the Privacy Policy for details.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Service workers and caches</h3>
      <p className="text-gray-700 mb-4">
        As a progressive web app, DemiWura caches selected application files, public learning assets and fonts so pages
        load faster and some features can survive a temporary connection loss. The service worker is not configured to
        cache private Firestore API responses. Firebase's own SDK may use protected local persistence for signed-in use.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Your choices</h3>
      <p className="text-gray-700 mb-4">
        Current browser storage is used to provide features the user requests or to protect the service. Blocking it may
        prevent sign-in, saved preferences, offline support or progress displays from working. You can clear site data in
        your browser at any time. Signing out clears the cached DemiWura profile, while other device preferences and caches
        may remain until browser data is cleared.
      </p>
      <p className="text-gray-700 mb-4">
        If optional analytics, advertising or another non-essential technology is introduced later, it will remain off
        until the required information and genuine consent controls are available.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Contact</h3>
      <p className="text-gray-700">
        Questions about browser storage can be sent to{' '}
        <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
          privacy@demiwuraks2.co.uk
        </a>.
      </p>
    </div>
  </InfoPage>
);

export default CookiePolicy;
