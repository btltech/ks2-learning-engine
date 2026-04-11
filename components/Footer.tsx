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
      <footer className={`bg-gradient-to-r ${GRADIENTS.primary} text-white w-full`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-white/80">
          <span className="font-semibold text-white">© {currentYear} KS2 Learning Engine</span>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <button onClick={() => handleNavigation('/privacy-policy')} className="hover:text-white">Privacy</button>
            <button onClick={() => handleNavigation('/terms-of-service')} className="hover:text-white">Terms</button>
            <button onClick={() => handleNavigation('/cookie-policy')} className="hover:text-white">Cookies</button>
            <button onClick={() => handleNavigation('/safeguarding')} className="hover:text-white">Safeguarding</button>
            <button onClick={() => handleNavigation('/accessibility')} className="hover:text-white">Accessibility</button>
            <button onClick={() => handleNavigation('/help')} className="hover:text-white">Help</button>
            <button onClick={() => handleNavigation('/contact')} className="hover:text-white">Contact</button>
            <button onClick={() => setShowFeedback(true)} className="hover:text-white">Feedback</button>
          </div>
        </div>
      </footer>
      <UserFeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </>
  );
};

export default Footer;
