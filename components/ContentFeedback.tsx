/**
 * Content Feedback Component
 * 
 * Allows users to provide feedback on questions and content
 */

import React, { useState } from 'react';
import { contentQualityService, FLAG_REASONS, FlagReason } from '../services/contentQualityService';
import { HandThumbUpIcon, HandThumbDownIcon, FlagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid';

interface ContentFeedbackProps {
  contentId: string;
  userId: string;
  onClose?: () => void;
  compact?: boolean;
}

export const ContentFeedback: React.FC<ContentFeedbackProps> = ({
  contentId,
  userId,
  onClose,
  compact = false,
}) => {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState<FlagReason | null>(null);
  const [flagMessage, setFlagMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleLike = () => {
    if (liked !== true) {
      setLiked(true);
      contentQualityService.rateContent(contentId, userId, true);
    }
  };

  const handleDislike = () => {
    if (liked !== false) {
      setLiked(false);
      contentQualityService.rateContent(contentId, userId, false);
    }
  };

  const handleFlag = () => {
    if (!selectedReason) return;
    
    contentQualityService.flagContent(
      contentId,
      userId,
      selectedReason.code,
      flagMessage || undefined
    );
    
    setSubmitted(true);
    setTimeout(() => {
      setShowFlagForm(false);
      setSubmitted(false);
      onClose?.();
    }, 2000);
  };

  // Compact mode - just thumbs up/down
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleLike}
          className={`p-1.5 rounded-full transition-colors ${
            liked === true 
              ? 'text-green-600 bg-green-100' 
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
          }`}
          aria-label="Like this content"
        >
          {liked === true ? (
            <HandThumbUpSolid className="h-5 w-5" />
          ) : (
            <HandThumbUpIcon className="h-5 w-5" />
          )}
        </button>
        
        <button
          onClick={handleDislike}
          className={`p-1.5 rounded-full transition-colors ${
            liked === false 
              ? 'text-red-600 bg-red-100' 
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
          }`}
          aria-label="Dislike this content"
        >
          {liked === false ? (
            <HandThumbDownSolid className="h-5 w-5" />
          ) : (
            <HandThumbDownIcon className="h-5 w-5" />
          )}
        </button>
        
        <button
          onClick={() => setShowFlagForm(true)}
          className="p-1.5 rounded-full text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          aria-label="Report a problem"
        >
          <FlagIcon className="h-5 w-5" />
        </button>

        {/* Flag Modal */}
        {showFlagForm && (
          <FlagModal
            onClose={() => setShowFlagForm(false)}
            onSubmit={handleFlag}
            selectedReason={selectedReason}
            setSelectedReason={setSelectedReason}
            flagMessage={flagMessage}
            setFlagMessage={setFlagMessage}
            submitted={submitted}
          />
        )}
      </div>
    );
  }

  // Full mode
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">How was this question?</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            liked === true
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {liked === true ? (
            <HandThumbUpSolid className="h-5 w-5" />
          ) : (
            <HandThumbUpIcon className="h-5 w-5" />
          )}
          Good
        </button>

        <button
          onClick={handleDislike}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            liked === false
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          {liked === false ? (
            <HandThumbDownSolid className="h-5 w-5" />
          ) : (
            <HandThumbDownIcon className="h-5 w-5" />
          )}
          Not good
        </button>
      </div>

      {liked === false && !showFlagForm && (
        <button
          onClick={() => setShowFlagForm(true)}
          className="w-full py-2 text-orange-600 font-medium hover:bg-orange-50 rounded-lg transition-colors"
        >
          <FlagIcon className="h-4 w-4 inline mr-2" />
          Tell us what's wrong
        </button>
      )}

      {showFlagForm && (
        <FlagForm
          selectedReason={selectedReason}
          setSelectedReason={setSelectedReason}
          flagMessage={flagMessage}
          setFlagMessage={setFlagMessage}
          onSubmit={handleFlag}
          onCancel={() => setShowFlagForm(false)}
          submitted={submitted}
        />
      )}
    </div>
  );
};

// Flag modal for compact mode
const FlagModal: React.FC<{
  onClose: () => void;
  onSubmit: () => void;
  selectedReason: FlagReason | null;
  setSelectedReason: (r: FlagReason | null) => void;
  flagMessage: string;
  setFlagMessage: (m: string) => void;
  submitted: boolean;
}> = ({ onClose, onSubmit, selectedReason, setSelectedReason, flagMessage, setFlagMessage, submitted }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Report a Problem</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <FlagForm
          selectedReason={selectedReason}
          setSelectedReason={setSelectedReason}
          flagMessage={flagMessage}
          setFlagMessage={setFlagMessage}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitted={submitted}
        />
      </div>
    </div>
  );
};

// Flag form component
const FlagForm: React.FC<{
  selectedReason: FlagReason | null;
  setSelectedReason: (r: FlagReason | null) => void;
  flagMessage: string;
  setFlagMessage: (m: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitted: boolean;
}> = ({ selectedReason, setSelectedReason, flagMessage, setFlagMessage, onSubmit, onCancel, submitted }) => {
  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-600 font-medium">Thank you for your feedback!</p>
        <p className="text-sm text-gray-500">We'll review this content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">What's the problem?</p>
      
      <div className="space-y-2">
        {FLAG_REASONS.map((reason) => (
          <button
            key={reason.code}
            onClick={() => setSelectedReason(reason)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedReason?.code === reason.code
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {reason.label}
          </button>
        ))}
      </div>

      {selectedReason?.requiresMessage && (
        <textarea
          value={flagMessage}
          onChange={(e) => setFlagMessage(e.target.value)}
          placeholder="Please explain..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 outline-none"
          rows={3}
        />
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={!selectedReason || (selectedReason.requiresMessage && !flagMessage.trim())}
          className="flex-1 py-2 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ContentFeedback;
