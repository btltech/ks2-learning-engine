import { useState, useEffect } from 'react';
import { strugglingStudentService } from '../services/strugglingStudentService';

interface Props {
  intervention: {
    type: 'easier_questions' | 'lesson_suggestion' | 'parent_alert' | 'video_tutorial';
    message: string;
  } | null;
  onDismiss: () => void;
  onAccept?: () => void;
}

export default function StruggleAlert({ intervention, onDismiss, onAccept }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (intervention) {
      setIsVisible(true);
    }
  }, [intervention]);

  if (!intervention || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(() => {
      onAccept?.();
      onDismiss();
    }, 300);
  };

  const getIcon = () => {
    switch (intervention.type) {
      case 'parent_alert':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'video_tutorial':
        return (
          <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'easier_questions':
        return (
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  const getActionText = () => {
    switch (intervention.type) {
      case 'parent_alert':
        return 'Notify Parent';
      case 'video_tutorial':
        return 'Watch Video';
      case 'easier_questions':
        return 'Try Easier Questions';
      case 'lesson_suggestion':
        return 'Review Lesson';
      default:
        return 'OK';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          {intervention.type === 'parent_alert' ? "Let's Get Some Help" :
           intervention.type === 'video_tutorial' ? "Watch & Learn" :
           intervention.type === 'easier_questions' ? "Build Confidence First" :
           "Review Time"}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-6 text-center leading-relaxed">
          {intervention.message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleAccept}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              intervention.type === 'parent_alert' ? 'bg-red-500 hover:bg-red-600' :
              intervention.type === 'video_tutorial' ? 'bg-purple-500 hover:bg-purple-600' :
              'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {getActionText()}
          </button>
        </div>

        {/* Encouragement */}
        <p className="mt-4 text-sm text-gray-500 text-center italic">
          Remember: Every expert was once a beginner! 🌟
        </p>
      </div>
    </div>
  );
}
