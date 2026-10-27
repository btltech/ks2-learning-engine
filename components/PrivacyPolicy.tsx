import React from 'react';
import InfoPage from './InfoPage';

const PrivacyPolicy: React.FC = () => {
  return (
    <InfoPage title="Privacy Policy" emoji="🔒" lastUpdated="August 10, 2026">
      <div className="prose max-w-none">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-950">
          <p className="font-bold mb-1">A shorter explanation for children is available.</p>
          <a href="/privacy-for-children" className="text-blue-700 font-semibold hover:underline">
            Read Privacy for Children →
          </a>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-700">
          <strong>Data controller:</strong> BTLTECH LTD (Company No. 13311691)<br />
          <strong>Registered office:</strong> 161 The Vale, London, England, W3 7RD<br />
          <strong>Privacy contact:</strong>{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">About this notice</h2>
        <p className="text-gray-700 mb-4">
          DemiWura is a free learning service designed mainly for children aged 7–11. This notice explains
          what information we use, why we use it, who receives it and the choices available to adults and
          children. We apply child privacy and safety settings by default.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Who is responsible for the data?</h3>
        <p className="text-gray-700 mb-4">
          BTLTECH LTD is the controller for family accounts and for operating DemiWura. Where a school
          independently decides how its learners must use DemiWura, the school may also be a controller and
          BTLTECH LTD may process some information for the school. Schools should give families their own
          privacy information where this applies.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Information we use</h3>
        <h4 className="font-bold text-gray-800 mb-2">Adult accounts</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>Name, email address, account identifier and verified role</li>
          <li>Parent code, linked child identifiers and teacher class information where applicable</li>
          <li>Firebase Authentication handles passwords; DemiWura does not receive or store the plain-text password</li>
          <li>Support enquiries and account or privacy requests</li>
        </ul>

        <h4 className="font-bold text-gray-800 mb-2">Child profiles</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>First name, age, internal profile identifier and link to the managing parent</li>
          <li>A one-way hash of the private 4–6 digit PIN; the PIN itself is not kept</li>
          <li>Class memberships and the display name or alias needed for a class, battle or leaderboard</li>
          <li>Quiz history, answers, scores, time spent, points, streaks, rewards, difficulty and subject mastery</li>
          <li>MiRa questions and the subject or lesson context needed to answer them</li>
          <li>Avatar, sound, language, accessibility and interface preferences</li>
        </ul>

        <h4 className="font-bold text-gray-800 mb-2">Technical and security information</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>IP address, request time, authentication status and security or rate-limit information</li>
          <li>Browser, device and error information needed to operate, secure and troubleshoot the service</li>
          <li>Essential cookies, IndexedDB, Cache Storage, localStorage and sessionStorage described in our Cookie Policy</li>
        </ul>
        <p className="text-gray-700 mb-4">
          Child profiles do not ask for a surname, email address, telephone number, home address, exact date of
          birth, school name, photograph or geolocation. Please do not enter these details into MiRa or free-text forms.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Why we use information and our legal bases</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li><strong>Provide the requested service and manage adult accounts:</strong> performance of a contract.</li>
          <li><strong>Maintain child profiles and show learning progress:</strong> our legitimate interests in providing a useful educational service, balanced against the child's rights and best interests.</li>
          <li><strong>Adapt difficulty and recommend practice:</strong> the same limited educational legitimate interest. This is educational personalisation, not advertising profiling.</li>
          <li><strong>Protect accounts, prevent abuse and investigate faults:</strong> our legitimate interests in security and service reliability.</li>
          <li><strong>Respond to support, safeguarding and rights requests:</strong> legitimate interests and, where applicable, legal obligations.</li>
          <li><strong>Send optional communications:</strong> consent where consent is requested. A person can withdraw it as easily as they gave it.</li>
        </ul>
        <p className="text-gray-700 mb-4">
          We do not sell personal information, show targeted advertising, or use child data for commercial
          behavioural profiling. We do not make decisions about a child that have legal or similarly significant effects.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. AI-assisted features</h3>
        <p className="text-gray-700 mb-3">
          MiRa and some lesson, hint and report features use Google Gemini. Depending on the feature, Google may
          receive the exact question typed by the user, age, subject, topic, question choices and limited learning
          summaries such as mastery percentages or recent quiz totals. We do not intentionally include a child's name
          in Gemini prompts. AI output is automatically checked where supported but can still be incomplete or wrong.
        </p>
        <p className="text-gray-700 mb-4">
          Do not enter contact details, school details, passwords, codes, health information or other private information
          into MiRa. A child should show a worrying or clearly incorrect response to a trusted adult and report it to us.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. Services that receive or store information</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li><strong>Google Firebase:</strong> authentication, user profiles, learning records, classes and application data.</li>
          <li><strong>Google Gemini API:</strong> AI-assisted lessons, explanations, hints and reports described above.</li>
          <li><strong>Cloudflare:</strong> website delivery, Pages Functions, security, Turnstile checks, short-lived rate-limit data, KV and R2-hosted learning audio.</li>
          <li><strong>Resend:</strong> sends contact-form notifications to our support mailbox.</li>
          <li><strong>Sentry, only when configured:</strong> receives privacy-minimised technical error reports without session replay or account identifiers.</li>
        </ul>
        <p className="text-gray-700 mb-4">
          These providers act under their service and data-protection terms. They may process information in the UK,
          EEA or other countries. Where UK personal data is transferred internationally, the relevant provider terms
          and legally recognised transfer safeguards apply. Contact us if you require more detail about a particular provider.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Learning analytics</h3>
        <p className="text-gray-700 mb-4">
          Detailed progress is kept with the learner profile and on the current device. Authenticated question attempts
          also update shared question-quality totals such as how often a question was shown, how often it was answered
          correctly and total response time. The shared totals do not store the learner's user identifier. We use them
          to find confusing or poorly performing questions, not to advertise to children.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. How long information is kept</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li><strong>Adult account and linked learning data:</strong> while the account is active and then for the period needed to complete a verified deletion request, resolve disputes or meet legal obligations.</li>
          <li><strong>Child profiles:</strong> until the parent deletes the profile or asks us to remove it, subject to short operational backup and security-log cycles.</li>
          <li><strong>Contact messages:</strong> normally no longer than 12 months, unless needed for an ongoing safeguarding, complaint or legal matter.</li>
          <li><strong>Question-quality totals:</strong> while the associated question remains in use or while the aggregate is needed to assess content quality.</li>
          <li><strong>Application rate-limit keys:</strong> normally no more than two minutes. Hosting and security logs follow Cloudflare's applicable retention settings.</li>
          <li><strong>Device storage:</strong> until the user signs out, clears it, resets the app or the app removes an expired cache.</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">8. Your rights</h3>
        <p className="text-gray-700 mb-2">Adults and children may have the right to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Ask for a copy of their personal information</li>
          <li>Correct inaccurate information</li>
          <li>Ask for deletion or restriction in applicable circumstances</li>
          <li>Object to processing based on legitimate interests</li>
          <li>Receive applicable information in a portable format</li>
          <li>Withdraw consent without affecting earlier lawful processing</li>
        </ul>
        <p className="text-gray-700 mb-4">
          Children have these rights themselves. A parent may also act for a child where appropriate. Email{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a>{' '}
          or use the Contact page. We may verify identity and normally respond within one month. Parents can delete an
          individual child profile directly from Parent Monitoring; adult account closure is currently handled by request.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">9. Security</h3>
        <p className="text-gray-700 mb-4">
          We use access controls, Firebase Authentication, one-way PIN hashing, encrypted HTTPS connections, role checks,
          request validation, rate limits and abuse protection. No online service can promise absolute security. Tell us
          promptly if you think an account, parent code or PIN has been exposed.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">10. Complaints</h3>
        <p className="text-gray-700 mb-4">
          Please contact us first so we can try to resolve the issue. You may also complain to the{' '}
          <a href="https://ico.org.uk/make-a-complaint" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Information Commissioner's Office
          </a>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">11. Changes</h3>
        <p className="text-gray-700 mb-4">
          We will update the date on this page and give a prominent notice before a material change takes effect.
          We will seek fresh consent where the law requires it; continued use alone is not treated as consent where
          consent is required.
        </p>
      </div>
    </InfoPage>
  );
};

export default PrivacyPolicy;
