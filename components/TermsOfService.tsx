import React from 'react';
import InfoPage from './InfoPage';

const TermsOfService: React.FC = () => {
  return (
    <InfoPage
      title="Terms of Service"
      emoji="📜"
      lastUpdated="April 17, 2026"
    >
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-4">
          These Terms of Service govern your use of DemiWura (<strong>demiwuraks2.co.uk</strong>), a free
          KS2 learning platform for UK primary school children. By creating an account or using DemiWura,
          you agree to these terms. Please read them carefully.
        </p>
        <p className="text-gray-700 mb-4">
          DemiWura is operated by <strong>BTLTECH LTD</strong> (Company No. 13311691), registered in
          England and Wales at 161 The Vale, London, W3 7RD. These terms are governed by the law of{' '}
          <strong>England and Wales</strong>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Who Can Use DemiWura</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>
            <strong>Children (aged 5–18):</strong> May use DemiWura under parental or teacher supervision.
            A parent or teacher must create and manage their account.
          </li>
          <li>
            <strong>Parents and guardians:</strong> Must be 18 or over to register and are responsible
            for their child's use of the platform.
          </li>
          <li>
            <strong>Teachers:</strong> Must be employed or engaged by a school or educational institution
            and are responsible for any class or student accounts they manage.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Creating an Account</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>You must provide accurate and current information when registering.</li>
          <li>You are responsible for keeping your credentials (email, password, or PIN) secure.</li>
          <li>You must not share your account or create duplicate accounts for the same person.</li>
          <li>
            If you believe your account has been compromised, contact us immediately at{' '}
            <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
              privacy@demiwuraks2.co.uk
            </a>.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Acceptable Use</h3>
        <p className="text-gray-700 mb-2">You must not use DemiWura to:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Attempt to gain unauthorised access to other accounts or our systems</li>
          <li>Upload, transmit, or distribute harmful, offensive, or unlawful content</li>
          <li>Reverse-engineer, scrape, or copy the platform or its content</li>
          <li>Use the platform for commercial purposes without our written permission</li>
          <li>Misrepresent your identity or impersonate another person</li>
          <li>Circumvent any security or rate-limiting measures</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Parent and Teacher Responsibilities</h3>
        <p className="text-gray-700 mb-4">
          Parents are responsible for supervising their child's activity on DemiWura. Teachers are
          responsible for any child accounts they create or manage within their class. Both agree to use
          the platform's monitoring tools to oversee children's usage.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. Intellectual Property</h3>
        <p className="text-gray-700 mb-4">
          All content on DemiWura — including quizzes, lessons, artwork, and platform features — is
          owned by or licensed to DemiWura. You may not copy, redistribute, or repurpose any content
          without our prior written consent. You are granted a limited, non-transferable licence to use
          the platform for personal, non-commercial, educational purposes only.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Free Service and Changes</h3>
        <p className="text-gray-700 mb-4">
          DemiWura is currently provided free of charge. We reserve the right to introduce paid features
          in future and will give reasonable notice before doing so. We also reserve the right to modify,
          suspend, or discontinue the service at any time, with notice where reasonably practicable.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. Limitation of Liability</h3>
        <p className="text-gray-700 mb-4">
          DemiWura provides educational content in good faith but makes no guarantees about specific
          learning outcomes or academic results. To the fullest extent permitted by law, we are not
          liable for any indirect or consequential loss arising from use of the platform. Nothing in
          these terms excludes or limits liability for death or personal injury caused by negligence,
          fraud or fraudulent misrepresentation, or any other liability that cannot be lawfully excluded
          under English law.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">8. Termination</h3>
        <p className="text-gray-700 mb-4">
          You may delete your account at any time. We reserve the right to suspend or terminate accounts
          that breach these terms. On termination, your personal data will be handled in accordance with
          our{' '}
          <a href="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">9. Governing Law</h3>
        <p className="text-gray-700 mb-4">
          These terms are governed by the law of England and Wales. Any disputes shall be subject to
          the non-exclusive jurisdiction of the courts of England and Wales.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">10. Changes to These Terms</h3>
        <p className="text-gray-700 mb-4">
          We will notify registered users by email of any material changes before they take effect.
          Continued use of DemiWura after changes are published constitutes acceptance of the updated terms.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Contact</h3>
        <p className="text-gray-700">
          Questions about these terms? Email{' '}
          <a href="mailto:legal@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            legal@demiwuraks2.co.uk
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default TermsOfService;
