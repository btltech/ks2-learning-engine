import React from 'react';
import InfoPage from './InfoPage';

const TermsOfService: React.FC = () => (
  <InfoPage title="Terms of Service" emoji="📜" lastUpdated="August 10, 2026">
    <div className="prose max-w-none">
      <p className="text-gray-700 mb-4">
        These terms govern use of DemiWura at <strong>demiwuraks2.co.uk</strong>. DemiWura is a free
        learning platform designed mainly for UK Key Stage 2 children aged 7–11. The service is operated by
        <strong> BTLTECH LTD</strong> (Company No. 13311691), 161 The Vale, London, England, W3 7RD.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-blue-950">
        Adults should read these terms for the child they supervise. Children should also follow the simple rules
        in sections 3 and 4 and can read our <a href="/privacy-for-children" className="font-semibold underline">Privacy for Children</a> page.
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Who may use DemiWura</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li><strong>Children:</strong> DemiWura is designed for ages 7–11 and must be used with appropriate parent, guardian or school supervision.</li>
        <li><strong>Parents and guardians:</strong> an adult creates the family account and manages each child profile, parent code and PIN.</li>
        <li><strong>Teachers:</strong> teacher access is issued after administrative verification. Teachers create classes and share class join codes; they do not use a class code to create a child's family profile.</li>
        <li><strong>Schools:</strong> a school using DemiWura remains responsible for its own safeguarding, lawful-use, consent and data-protection duties.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Accounts and codes</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Adults must provide accurate registration information and keep their email and password secure.</li>
        <li>A parent must create a separate profile and PIN for each child. Do not publish or widely share parent, PIN, class or battle codes.</li>
        <li>A child signs in using the profile details created by their parent. A child does not need to provide an email address.</li>
        <li>Tell us promptly if credentials or codes may have been exposed. We may reset a code or restrict a session to protect users.</li>
        <li>Teacher and administrator permissions must not be shared and may only be granted through the authorised role process.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Rules for everyone</h3>
      <p className="text-gray-700 mb-2">Do not:</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Try to access another person's profile, class, code, data or platform administration tools</li>
        <li>Use a name, free-text field, class or battle feature to bully, threaten, impersonate or upset someone</li>
        <li>Enter unlawful, harmful, discriminatory, sexual or otherwise inappropriate material</li>
        <li>Enter passwords, PINs, contact details, school details or other sensitive personal information into MiRa</li>
        <li>Interfere with security, rate limits, availability or testing systems</li>
        <li>Scrape, resell or commercially redistribute DemiWura content or data without written permission</li>
      </ul>
      <p className="text-gray-700 mb-4">
        There is no public chat or public user profile. Limited display names or aliases may appear to authorised class
        participants during class activities, quiz battles or leaderboards.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. AI and educational content</h3>
      <p className="text-gray-700 mb-3">
        MiRa and some lessons, questions, hints and reports may be generated or assisted by artificial intelligence.
        Automated safeguards and content checks reduce risk but cannot guarantee that every response is correct,
        complete or suitable. AI output should be treated as learning support, not as professional, medical, legal or safety advice.
      </p>
      <p className="text-gray-700 mb-4">
        Parents and teachers should review important content and report mistakes. A child should stop and tell a trusted
        adult if content is worrying, private, confusing or clearly wrong. DemiWura does not guarantee a particular exam
        result, curriculum outcome or level of progress.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. Parent, teacher and school responsibilities</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Provide age-appropriate supervision and balanced screen time.</li>
        <li>Use dashboard information as one source of support, not as the sole assessment of a child.</li>
        <li>Preview assignments and AI-assisted materials before relying on them in a classroom.</li>
        <li>Follow the school's safeguarding, acceptable-use and data-protection procedures.</li>
        <li>Remove learners from classes and reset shared codes when access is no longer appropriate.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Content and intellectual property</h3>
      <p className="text-gray-700 mb-4">
        DemiWura's software, original lessons, original questions, branding and original artwork are owned by or licensed
        to BTLTECH LTD. Some materials may be licensed from third parties or may be in the public domain; ownership remains
        with the relevant rights holder. Users receive a limited, revocable, non-transferable right to use the service for
        personal or authorised classroom education. Nothing in these terms claims ownership of a user's original feedback
        or of third-party and public-domain material.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. Availability and changes</h3>
      <p className="text-gray-700 mb-4">
        DemiWura is currently free. Features may be unavailable because of maintenance, internet failure, provider limits
        or necessary safety work. We may change or discontinue features and will give reasonable notice of a material
        change where practicable. Any future paid feature will be presented separately before a charge is made.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">8. Suspension, closure and deletion</h3>
      <p className="text-gray-700 mb-4">
        We may restrict or suspend access to protect a child, another user or the service, or where these terms are
        seriously or repeatedly broken. Parents can delete individual child profiles from Parent Monitoring. Adult account
        closure is currently handled through a verified request to{' '}
        <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">privacy@demiwuraks2.co.uk</a>
        {' '}or the Contact page. Personal data is then handled under the Privacy Policy and applicable legal retention duties.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">9. Liability and consumer rights</h3>
      <p className="text-gray-700 mb-4">
        To the extent permitted by law, BTLTECH LTD is not responsible for indirect or consequential loss resulting from
        the free service. Nothing in these terms excludes liability that cannot legally be excluded, including liability
        for death or personal injury caused by negligence, fraud or fraudulent misrepresentation. Nothing in these terms
        removes mandatory rights available under UK consumer law.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">10. Law and changes to these terms</h3>
      <p className="text-gray-700 mb-4">
        These terms are governed by the law of England and Wales, with the non-exclusive jurisdiction of its courts. We
        will update the date above and provide a prominent notice before material changes take effect. Where consent is
        legally required, we will ask for it rather than treating continued use alone as consent.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Contact</h3>
      <p className="text-gray-700">
        Questions about these terms can be sent to{' '}
        <a href="mailto:legal@demiwuraks2.co.uk" className="text-blue-600 hover:underline">legal@demiwuraks2.co.uk</a>
        {' '}or through the <a href="/contact" className="text-blue-600 hover:underline">Contact page</a>.
      </p>
    </div>
  </InfoPage>
);

export default TermsOfService;
