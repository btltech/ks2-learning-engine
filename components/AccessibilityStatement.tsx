import React from 'react';
import InfoPage from './InfoPage';

const AccessibilityStatement: React.FC = () => {
  return (
    <InfoPage
      title="Accessibility Statement"
      emoji="♿"
      lastUpdated="April 17, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Accessibility</h2>
        <p className="text-gray-700 mb-4">
          DemiWura is committed to ensuring digital accessibility for all learners, including those
          with disabilities. We continually improve the user experience for everyone and apply relevant
          accessibility standards.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Conformance Status</h3>
        <p className="text-gray-700 mb-4">
          We aim to conform to{' '}
          <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>. These guidelines
          explain how to make web content more accessible to people with disabilities.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Accessibility Features</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>
            <strong>Screen Reader Support:</strong> Semantic HTML and ARIA labels throughout the
            application, designed for compatibility with VoiceOver, NVDA, JAWS, and TalkBack.
          </li>
          <li>
            <strong>Keyboard Navigation:</strong> All interactive elements are reachable and operable
            by keyboard alone, including a skip-to-main-content link.
          </li>
          <li>
            <strong>Text-to-Speech:</strong> Built-in natural voice reading for quiz questions and
            learning content.
          </li>
          <li>
            <strong>Visual Adjustments:</strong> High contrast mode, dyslexia-friendly font option,
            and resizable text support.
          </li>
          <li>
            <strong>Reduced Motion:</strong> Animations respect the{' '}
            <code>prefers-reduced-motion</code> media query.
          </li>
          <li>
            <strong>Colour Contrast:</strong> Interactive elements and body text meet WCAG AA contrast
            ratios.
          </li>
          <li>
            <strong>Focus Indicators:</strong> Visible focus rings on all interactive elements.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Known Limitations</h3>
        <p className="text-gray-700 mb-2">
          We are aware of the following limitations and are actively working to address them:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>
            Some complex interactive features (e.g. the drawing canvas in the Art Studio) have limited
            screen reader support. Text-based alternatives are available for all learning content.
          </li>
          <li>
            Audio-only quiz feedback may not be accessible to deaf users in all contexts — visual
            feedback is also provided for all responses.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Assistive Technologies Supported</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>Screen readers: VoiceOver, NVDA, JAWS, TalkBack</li>
          <li>Screen magnification software</li>
          <li>Speech recognition software (e.g. Dragon NaturallySpeaking)</li>
          <li>Alternative input devices</li>
          <li>Browser text zoom up to 200%</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Feedback and Contact</h3>
        <p className="text-gray-700 mb-4">
          We welcome feedback on accessibility. If you encounter any barrier, need content in an
          alternative format, or have a suggestion:
        </p>
        <p className="text-gray-700 mb-4">
          Email:{' '}
          <a href="mailto:accessibility@demiwuraks2.co.uk" className="text-blue-600 hover:underline">
            accessibility@demiwuraks2.co.uk
          </a>
        </p>
        <p className="text-gray-700 mb-4">
          We aim to respond to accessibility feedback within <strong>5 working days</strong>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Enforcement</h3>
        <p className="text-gray-700 mb-4">
          If you are not satisfied with our response to your accessibility concern, you may contact the{' '}
          <strong>Equality Advisory and Support Service (EASS)</strong> at{' '}
          <a
            href="https://www.equalityadvisoryservice.com"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            equalityadvisoryservice.com
          </a>.
        </p>

        <p className="text-gray-500 text-sm mt-6">
          This statement was prepared on 17 April 2026 following a self-assessment of the DemiWura
          platform.
        </p>
      </div>
    </InfoPage>
  );
};

export default AccessibilityStatement;
