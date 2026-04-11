import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADIENTS, SHADOWS, RADIUS } from '../constants';

interface InfoPageProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
  emoji?: string;
}

const InfoPage: React.FC<InfoPageProps> = ({ title, lastUpdated, children, emoji }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${GRADIENTS.primary} text-white py-12 ${SHADOWS.primary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white/90 hover:text-white motion-safe:transition-colors focus-visible:outline-none focus-visible:underline"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">
            {emoji && <span className="mr-3">{emoji}</span>}
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-white/80 mt-2 text-sm">Last updated: {lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`bg-white ${RADIUS.container} ${SHADOWS.secondary} p-8`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
