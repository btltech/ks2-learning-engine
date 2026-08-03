import React from 'react';
import InfoPage from './InfoPage';

const PrivacyPolicy: React.FC = () => {
  return (
    <InfoPage
      title="Privacy Policy"
      emoji="🔒"
      lastUpdated="April 17, 2026"
    >
      <div className="prose max-w-none">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-700">
          <strong>Data Controller:</strong> BTLTECH LTD (Company No. 13311691)<br />
          <strong>Registered address:</strong> 161 The Vale, London, England, W3 7RD<br />
          <strong>Contact:</strong>{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a><br />
          <strong>ICO Registration Number:</strong> Pending registration
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Matters</h2>
        <p className="text-gray-700 mb-4">
          DemiWura is committed to protecting the privacy and personal data of all our users, especially
          children. This Privacy Policy explains how we collect, use, store, and protect your information
          in compliance with the <strong>UK General Data Protection Regulation (UK GDPR)</strong>, the{' '}
          <strong>Data Protection Act 2018</strong>, and the{' '}
          <strong>ICO Children's Code (Age Appropriate Design Code)</strong>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Who We Are</h3>
        <p className="text-gray-700 mb-4">
          DemiWura (<strong>demiwuraks2.co.uk</strong>) is a free online KS2 learning platform for UK
          primary school children aged 7–11. The service is operated by{' '}
          <strong>BTLTECH LTD</strong> (Company No. 13311691), registered in England and Wales. BTLTECH LTD
          is the data controller responsible for your personal data. For any data protection queries,
          contact us at{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. What Personal Data We Collect</h3>
        <h4 className="font-bold text-gray-800 mb-2">Parent and Teacher Accounts</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
          <li>Full name and email address</li>
          <li>Account password (stored as a cryptographic hash — we never store your plain-text password)</li>
          <li>Account type (parent or teacher)</li>
        </ul>
        <h4 className="font-bold text-gray-800 mb-2">Child Accounts</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
          <li>First name and age</li>
          <li>A 4-digit PIN (stored as a cryptographic hash)</li>
          <li>Learning progress, quiz scores, and subject mastery data</li>
          <li>Avatar customisation preferences (stored locally on your device)</li>
        </ul>
        <h4 className="font-bold text-gray-800 mb-2">Technical Data (all users)</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>IP address (used temporarily for rate-limiting and abuse prevention only — not stored long-term)</li>
          <li>Browser type and device information (for technical support purposes only)</li>
        </ul>
        <p className="text-gray-700 mb-4">
          <strong>We do not collect:</strong> full date of birth, home address, phone number, school name,
          photographs, or any social media identifiers.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Legal Basis for Processing</h3>
        <p className="text-gray-700 mb-2">Under UK GDPR, we process your data on the following legal bases:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>
            <strong>Contract (Article 6(1)(b)):</strong> Processing parent and teacher account data to
            provide the service you signed up for.
          </li>
          <li>
            <strong>Legitimate Interests (Article 6(1)(f)):</strong> Processing child learning progress
            to deliver personalised educational features. We have assessed that this does not override
            children's rights and freedoms.
          </li>
          <li>
            <strong>Consent (Article 6(1)(a)):</strong> For optional communications such as weekly
            progress reports, which you may opt out of at any time.
          </li>
          <li>
            <strong>Legal Obligation (Article 6(1)(c)):</strong> To comply with applicable UK law
            where required.
          </li>
        </ul>
        <p className="text-gray-700 mb-4">
          <strong>Children's data:</strong> In line with the ICO Children's Code, we apply the highest
          default privacy settings for child users and do not use children's data for advertising,
          profiling, or any commercial purpose.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. How We Use Your Data</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Provide and personalise the learning platform</li>
          <li>Enable parent and teacher monitoring dashboards</li>
          <li>Generate learning progress reports</li>
          <li>Protect platform security and prevent abuse</li>
          <li>Improve educational content based on anonymised usage patterns</li>
          <li>Respond to support and contact form enquiries</li>
        </ul>
        <p className="text-gray-700 mb-4">
          <strong>We do not:</strong> sell personal data, use it for advertising, share it with third
          parties for their own commercial purposes, or use children's data for any non-educational purpose.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. Data Processors</h3>
        <p className="text-gray-700 mb-2">
          We use the following trusted third-party processors who handle data on our behalf under data
          processing agreements:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>
            <strong>Google Firebase (Firestore &amp; Authentication)</strong> — stores user accounts and
            learning data. Governed by Google's Data Processing Terms and stored in the EU/EEA.{' '}
            <a
              href="https://firebase.google.com/support/privacy"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firebase Privacy Policy
            </a>
          </li>
          <li>
            <strong>Cloudflare</strong> — processes HTTP requests for our API functions. GDPR-compliant.{' '}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cloudflare Privacy Policy
            </a>
          </li>
          <li>
            <strong>Resend</strong> — delivers contact form notification emails to us only. No user data
            is retained by Resend beyond delivery.
          </li>
        </ul>
        <p className="text-gray-700 mb-4">
          No personal data is transferred outside the UK or EEA without appropriate safeguards in place.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Data Retention</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li><strong>Active accounts:</strong> Retained for as long as the account is active.</li>
          <li>
            <strong>Deleted accounts:</strong> Permanently deleted within 30 days of an account deletion
            request.
          </li>
          <li>
            <strong>Contact form messages:</strong> Retained for up to 12 months, then deleted.
          </li>
          <li>
            <strong>Child learning data:</strong> Deleted when the child account is removed by a parent.
          </li>
          <li>
            <strong>IP addresses (rate-limiting):</strong> Held in server memory only during the
            rate-limit window (15 minutes) — not permanently stored.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. Your Rights Under UK GDPR</h3>
        <p className="text-gray-700 mb-2">You have the following rights regarding your personal data:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li>
            <strong>Right to Rectification:</strong> Ask us to correct inaccurate or incomplete data.
          </li>
          <li>
            <strong>Right to Erasure:</strong> Request deletion of your data where there is no compelling
            reason to continue processing it.
          </li>
          <li>
            <strong>Right to Restriction:</strong> Ask us to restrict processing in certain circumstances.
          </li>
          <li>
            <strong>Right to Data Portability:</strong> Receive your data in a structured,
            machine-readable format.
          </li>
          <li>
            <strong>Right to Object:</strong> Object to processing based on legitimate interests.
          </li>
          <li>
            <strong>Rights for children:</strong> Parents may exercise all of the above rights on behalf
            of their child.
          </li>
        </ul>
        <p className="text-gray-700 mb-4">
          To exercise any of these rights, email{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a>. We will respond within <strong>30 days</strong>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">8. Complaints</h3>
        <p className="text-gray-700 mb-4">
          If you are unhappy with how we handle your data, you have the right to lodge a complaint with the
          UK's data protection supervisory authority:
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-sm text-gray-700">
          <strong>Information Commissioner's Office (ICO)</strong><br />
          Helpline: 0303 123 1113<br />
          Website:{' '}
          <a
            href="https://ico.org.uk/make-a-complaint"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ico.org.uk/make-a-complaint
          </a>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">9. Changes to This Policy</h3>
        <p className="text-gray-700 mb-4">
          We will notify registered users by email of any material changes to this policy. The "last
          updated" date at the top of this page always reflects the most recent revision.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Contact</h3>
        <p className="text-gray-700">
          Email:{' '}
          <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            privacy@demiwuraks2.co.uk
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default PrivacyPolicy;
