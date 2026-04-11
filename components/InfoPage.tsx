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
      <header className={`bg-gradient-to-r ${GRADIENTS.primary} text-white py-12 ${SHADOWS.primary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/30"
            aria-label="Go back to previous page"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">
            {emoji && <span className="mr-3" role="img" aria-label={`${title} icon`}>{emoji}</span>}
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-white mt-2 text-sm">Last updated: {lastUpdated}</p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className={`bg-white ${RADIUS.container} ${SHADOWS.secondary} p-8`}>
          {children}
        </article>
      </main>
    </div>
  );
};

export default InfoPage;
