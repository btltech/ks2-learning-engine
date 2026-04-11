import React, { useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuthService';

interface EmailVerificationBannerProps {
  onVerified?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ onVerified }) => {
  const [isVerified, setIsVerified] = useState(firebaseAuthService.isEmailVerified());
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Check verification status periodically
  useEffect(() => {
    if (isVerified) return;
    
    const checkInterval = setInterval(async () => {
      const verified = await firebaseAuthService.refreshAuthState();
      if (verified) {
        setIsVerified(true);
        onVerified?.();
        clearInterval(checkInterval);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkInterval);
  }, [isVerified, onVerified]);

  const handleResend = async () => {
    setSending(true);
    setMessage(null);
    try {
      await firebaseAuthService.resendVerificationEmail();
      setMessage({ type: 'success', text: 'Verification email sent! Check your inbox.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  // Don't show if verified or dismissed
  if (isVerified || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📧</span>
          <span className="text-amber-800 text-sm font-medium">
            Please verify your email (check spam/junk) to unlock all features
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {message && (
            <span className={`text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={handleResend}
            disabled={sending}
            className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {sending ? 'Sending...' : 'Resend Email'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-800 p-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
