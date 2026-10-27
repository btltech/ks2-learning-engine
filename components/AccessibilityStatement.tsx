import React from 'react';
import InfoPage from './InfoPage';

const AccessibilityStatement: React.FC = () => (
  <InfoPage title="Accessibility Statement" emoji="♿" lastUpdated="August 10, 2026">
    <div className="prose max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Our accessibility commitment</h2>
      <p className="text-gray-700 mb-4">
        DemiWura aims to be usable by children and adults with a wide range of access needs. We design toward the
        Web Content Accessibility Guidelines <strong>WCAG 2.2 Level AA</strong> and continue to test and improve the service.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Current conformance status</h3>
      <p className="text-gray-700 mb-4">
        DemiWura is <strong>partially conformant</strong> with WCAG 2.2 Level AA. This means many requirements are met,
        but some complex learning and game interactions still have known or unverified limitations. This statement is
        based on code review, automated checks and keyboard testing; it is not a claim of independent certification.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Accessibility support currently provided</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Semantic headings, labelled controls and visible keyboard focus on core routes</li>
        <li>A skip-to-main-content link in the public and authenticated layouts</li>
        <li>Keyboard operation for core navigation, forms, lessons and standard quizzes</li>
        <li>High-contrast, dyslexia-friendly text, interface mode and reduced-motion settings</li>
        <li>Browser zoom and responsive layouts for different screen sizes</li>
        <li>Visual quiz feedback alongside sound, so sound is not the only way to receive a result</li>
        <li>Read-aloud support where a compatible voice or reviewed recording is available</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Known limitations</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Drawing canvas, drag-and-drop, matching, real-time battle and some game interactions may have limited screen-reader or alternative-input support.</li>
        <li>Not every colour combination and every responsive state has completed manual contrast verification.</li>
        <li>Screen-reader testing across VoiceOver, NVDA, JAWS and TalkBack is not yet complete for every route.</li>
        <li>Third-party security controls such as Turnstile may present an additional interaction when a risk check is required.</li>
        <li>Some generated or imported learning content may need clearer heading structure or alternative descriptions.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">What you can do</h3>
      <p className="text-gray-700 mb-4">
        Use the accessibility settings in DemiWura, browser zoom, your device's screen reader or speech controls, and
        reduced-motion preferences. If a learning activity is inaccessible, contact us for a text-based alternative or
        another reasonable format where available.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Feedback and alternative formats</h3>
      <p className="text-gray-700 mb-4">
        Tell us the page, device, browser and assistive technology involved, without including a child's unnecessary
        personal information. Email{' '}
        <a href="mailto:support@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
          support@demiwuraks2.co.uk
        </a>{' '}
        or use the Contact page. We aim to acknowledge accessibility reports within five working days.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Escalation</h3>
      <p className="text-gray-700 mb-4">
        If you remain dissatisfied, you can seek advice from the{' '}
        <a href="https://www.equalityadvisoryservice.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          Equality Advisory and Support Service
        </a>.
      </p>

      <p className="text-gray-500 text-sm mt-6">
        Prepared following a self-assessment. Next review: after the next material interface change or by August 2027.
      </p>
    </div>
  </InfoPage>
);

export default AccessibilityStatement;
