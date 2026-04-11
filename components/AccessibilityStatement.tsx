import React from 'react';
import InfoPage from './InfoPage';

const AccessibilityStatement: React.FC = () => {
  return (
    <InfoPage 
      title="Accessibility Statement" 
      emoji="♿"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Accessibility</h2>
        <p className="text-gray-700 mb-4">
          KS2 Learning Engine is committed to ensuring digital accessibility for all learners, 
          including those with disabilities. We continually improve the user experience for everyone.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Accessibility Features</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li><strong>Screen Reader Support:</strong> Compatible with NVDA, JAWS, and VoiceOver</li>
          <li><strong>Keyboard Navigation:</strong> Full keyboard accessibility without requiring a mouse</li>
          <li><strong>Text-to-Speech:</strong> Built-in natural voice reading for all content</li>
          <li><strong>Visual Adjustments:</strong> High contrast modes and resizable text</li>
          <li><strong>Reduced Motion:</strong> Respects prefers-reduced-motion settings</li>
          <li><strong>Color Contrast:</strong> WCAG AA compliant color schemes</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Assistive Technologies</h3>
        <p className="text-gray-700 mb-4">
          Our platform is designed to work with:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
          <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
          <li>Screen magnification software</li>
          <li>Speech recognition software</li>
          <li>Alternative input devices</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Standards Compliance</h3>
        <p className="text-gray-700 mb-4">
          We strive to conform to WCAG 2.1 Level AA standards and UK accessibility regulations 
          for educational platforms.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Feedback and Support</h3>
        <p className="text-gray-700 mb-4">
          We welcome feedback on accessibility. If you encounter barriers or need assistance:
        </p>
        <p className="text-gray-700">
          Email: <a href="mailto:accessibility@ks2learning.com" className="text-blue-600 hover:underline">
            accessibility@ks2learning.com
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default AccessibilityStatement;
