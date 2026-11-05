import React, { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserFeedbackModal from './UserFeedbackModal';
import { GRADIENTS } from '../constants';
import { OwlLogo } from './sunny/OwlLogo';

const AccessibilitySettingsModal = lazy(() => import('./AccessibilitySettings').then(m => ({ default: m.AccessibilitySettingsModal })));

interface FooterProps {
  userRole?: 'student' | 'teacher' | 'parent' | 'admin';
  variant?: 'default' | 'sunny';
}

const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <footer className={variant === 'sunny' ? 'sunny-ui sunny-landing-footer' : `bg-gradient-to-r ${GRADIENTS.primary} text-white w-full`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-white/80">
          <span className="flex items-center gap-2 font-semibold text-white">© {currentYear} <OwlLogo height={variant === 'sunny' ? 48 : 24} sticker={variant !== 'sunny'} /></span>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <button onClick={() => handleNavigation('/privacy-policy')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Privacy</button>
            <button onClick={() => handleNavigation('/privacy-for-children')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Children's Privacy</button>
            <button onClick={() => handleNavigation('/terms-of-service')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Terms</button>
            <button onClick={() => handleNavigation('/cookie-policy')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Cookies</button>
            <button onClick={() => handleNavigation('/safeguarding')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Safeguarding</button>
            <button onClick={() => handleNavigation('/accessibility')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Accessibility</button>
            <button onClick={() => setShowAccessibilitySettings(true)} aria-haspopup="dialog" className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Voice &amp; display settings</button>
            <button onClick={() => handleNavigation('/help')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Help</button>
            <button onClick={() => handleNavigation('/contact')} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Contact</button>
            <button onClick={() => setShowFeedback(true)} className="min-h-[48px] min-w-[48px] px-1 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white">Feedback</button>
          </div>
        </div>
      </footer>
      <UserFeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
      {showAccessibilitySettings && (
        <Suspense fallback={null}>
          <AccessibilitySettingsModal onClose={() => setShowAccessibilitySettings(false)} />
        </Suspense>
      )}
    </>
  );
};

export default Footer;
