import React, { useState } from 'react';
import UserFeedbackModal from './UserFeedbackModal';

const Footer: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto w-full">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">&copy; {new Date().getFullYear()} KS2 Learning Engine. All rights reserved.</p>
          <div className="flex justify-center space-x-4 text-sm">
            <button onClick={() => alert("Help center coming soon!")} className="hover:text-blue-600 transition-colors">Help</button>
            <button onClick={() => alert("Privacy policy coming soon!")} className="hover:text-blue-600 transition-colors">Privacy</button>
            <button onClick={() => alert("Terms of service coming soon!")} className="hover:text-blue-600 transition-colors">Terms</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => setShowFeedback(true)} className="hover:text-blue-600 transition-colors font-medium text-blue-500">Feedback</button>
          </div>
        </div>
      </footer>
      <UserFeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </>
  );
};

export default Footer;
