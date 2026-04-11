import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserFeedbackModal from './UserFeedbackModal';
import { GRADIENTS } from '../constants';

interface FooterProps {
  userRole?: 'student' | 'teacher' | 'parent' | 'admin';
}

const Footer: React.FC<FooterProps> = ({ userRole = 'student' }) => {
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <footer className={`bg-gradient-to-r ${GRADIENTS.primary} text-white mt-auto w-full`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Support Column */}
            <div>
              <h3 className="text-sm font-bold mb-2">Support</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavigation('/help')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left underline-offset-2"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('/getting-started')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left underline-offset-2"
                  >
                    Getting Started
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('/contact')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left underline-offset-2"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left font-medium underline-offset-2"
                  >
                    Give Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-sm font-bold mb-2">Resources</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavigation('/how-it-works')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('/parent-guide')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                  >
                    Parent Guide
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('/teacher-guide')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                  >
                    Teacher Guide
                  </button>
                </li>
                {userRole === 'admin' && (
                  <li>
                    <button
                      onClick={() => handleNavigation('/admin-guide')}
                      className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                    >
                      Admin Guide
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-sm font-bold mb-2">Legal</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavigation('/privacy-policy')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('/terms-of-service')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('/cookie-policy')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                  >
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Safety & Trust Column */}
            <div>
              <h3 className="text-sm font-bold mb-2">Safety & Trust</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavigation('/safeguarding')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left font-semibold"
                  >
                    🛡️ Safeguarding Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('/accessibility')}
                    className="text-white hover:text-blue-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:underline text-left"
                  >
                    Accessibility Statement
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-3 pt-3 border-t border-white/20 text-center text-white/70 text-xs">
            <p>© {currentYear} KS2 Learning Engine</p>
          </div>
        </div>
      </footer>
      <UserFeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </>
  );
};

export default Footer;
