import React, { useState } from 'react';
import { microlearningService, MicroSession } from '../services/microlearningService';
import { useNavigate } from 'react-router-dom';

interface Props {
  session: MicroSession;
  onStart: (session: MicroSession) => void;
}

const MicrolearningCard: React.FC<Props> = ({ session, onStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    onStart(session);
    navigate('/quiz', {
      state: {
        subject: session.subject,
        topic: session.topic,
        difficulty: session.difficulty,
        questionCount: session.questionCount,
        isMicroSession: true,
        sessionId: session.id,
      },
    });
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
        isHovered ? 'transform scale-105 shadow-2xl' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStart}
    >
      {/* Header with gradient */}
      <div className={`h-2 ${
        (session.subject as string) === 'Maths' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
        (session.subject as string) === 'English' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
        'bg-gradient-to-r from-orange-500 to-red-500'
      }`} />

      <div className="p-6">
        {/* Duration badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {session.duration / 60} min
          </span>

          <span className="text-2xl">⚡</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {session.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm">
          {session.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {session.questionCount} questions
          </span>

          <span className="flex items-center font-semibold text-yellow-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            +{session.estimatedPoints} pts
          </span>
        </div>

        {/* Start button */}
        <button
          className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 ${
            (session.subject as string) === 'Maths' ? 'bg-blue-500 hover:bg-blue-600' :
            (session.subject as string) === 'English' ? 'bg-green-500 hover:bg-green-600' :
            'bg-orange-500 hover:bg-orange-600'
          } ${isHovered ? 'shadow-lg' : ''}`}
        >
          Start Challenge →
        </button>
      </div>
    </div>
  );
};

export default MicrolearningCard;
