import React from 'react';
import InfoPage from './InfoPage';

const SafeguardingPolicy: React.FC = () => {
  return (
    <InfoPage
      title="Safeguarding & Child Protection"
      emoji="🛡️"
      lastUpdated="April 17, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Keeping Children Safe Online</h2>
        <p className="text-gray-700 mb-4">
          The safety and wellbeing of children is DemiWura's highest priority. This policy outlines our
          commitments under the <strong>UK Online Safety Act 2023</strong>, the{' '}
          <strong>ICO Children's Code (Age Appropriate Design Code)</strong>, and broader child
          safeguarding principles.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Who This Policy Protects</h3>
        <p className="text-gray-700 mb-4">
          DemiWura's primary users are children aged 7–11 (KS2). All platform design decisions treat
          every user as potentially a child, applying the highest safeguarding standards by default.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Our Safeguarding Commitments</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>
            <strong>No child-to-child communication:</strong> DemiWura has no public chat, messaging,
            forums, or any feature that allows children to contact one another.
          </li>
          <li>
            <strong>Privacy by default:</strong> Child accounts collect only the minimum data necessary
            — first name and age. No surname, school, location, or contact details are collected for
            children.
          </li>
          <li>
            <strong>No behavioural profiling:</strong> We do not use children's data for advertising,
            profiling, or any commercial purpose.
          </li>
          <li>
            <strong>Age-appropriate content:</strong> All educational content is reviewed to be
            curriculum-aligned, age-appropriate, inclusive, and free from inappropriate language or
            imagery.
          </li>
          <li>
            <strong>Parental oversight by design:</strong> Children can only access DemiWura via a
            parent-generated code. Parents have full visibility via the monitoring dashboard.
          </li>
          <li>
            <strong>Secure authentication:</strong> Child accounts use PIN-based login with
            rate-limiting and lockout protection to prevent unauthorised access.
          </li>
          <li>
            <strong>No advertising:</strong> DemiWura contains no advertising of any kind.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. ICO Children's Code Compliance</h3>
        <p className="text-gray-700 mb-2">
          We have implemented the standards of the ICO Age Appropriate Design Code, including:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>Best interests of the child as a primary consideration in all design decisions</li>
          <li>High privacy settings switched on by default</li>
          <li>No nudge techniques to encourage children to share more data than necessary</li>
          <li>No geolocation tracking</li>
          <li>Parental controls readily available</li>
          <li>Content moderation proportionate to risk</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Content Safety</h3>
        <p className="text-gray-700 mb-2">All quiz questions and educational content on DemiWura are:</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>Aligned to the UK National Curriculum for KS2</li>
          <li>Reviewed for age-appropriate language and difficulty</li>
          <li>Free from discriminatory, violent, or inappropriate content</li>
          <li>Inclusive and respectful of all backgrounds and abilities</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. AI-Generated Content</h3>
        <p className="text-gray-700 mb-4">
          DemiWura uses AI to generate some quiz questions. All AI-generated content is subject to
          automated quality review before being presented to children. A quality scoring system flags
          questions for manual review if they fall below accepted standards.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Reporting Safeguarding Concerns</h3>
        <p className="text-gray-700 mb-2">
          If you have any safeguarding concerns — including concerns about a child's welfare or
          inappropriate content on the platform — please contact us immediately:
        </p>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="font-bold text-red-900">Safeguarding Contact</p>
          <p className="text-red-800">
            Email:{' '}
            <a href="mailto:safeguarding@demiwuraks2.co.uk" className="underline">
              safeguarding@demiwuraks2.co.uk
            </a>
          </p>
          <p className="text-red-800 text-sm mt-1">
            We aim to respond to all safeguarding reports within 24 hours.
          </p>
          <p className="text-red-800 text-sm mt-1">
            <strong>In an emergency or if a child is in immediate danger, call 999 or contact
            your local social services.</strong>
          </p>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. For Parents and Teachers</h3>
        <p className="text-gray-700 mb-4">
          We encourage active supervision of children's online learning. Use the monitoring dashboards
          to review your child's or class's activity. If something doesn't look right, please contact
          us immediately.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">8. Policy Review</h3>
        <p className="text-gray-700">
          This safeguarding policy is reviewed at least annually and following any significant changes
          to the platform or relevant legislation.
        </p>
      </div>
    </InfoPage>
  );
};

export default SafeguardingPolicy;
