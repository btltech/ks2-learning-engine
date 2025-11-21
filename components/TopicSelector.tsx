import React, { useState, useEffect, useCallback } from 'react';
// Fix: 'Difficulty' is an enum used as a value, so it must be a value import. 'Subject' is only used as a type.
import { Difficulty, type Subject, type ProgressData } from '../types';
import { getTopicsForSubject } from '../services/geminiService';
import { createCacheKey } from '../services/cacheService';
import LoadingSpinner from './LoadingSpinner';
import OfflineBadge from './OfflineBadge';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface TopicSelectorProps {
  subject: Subject;
  studentAge: number;
  onSelect: (topic: string) => void;
  onBack: () => void;
  progress: ProgressData;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ subject, studentAge, onSelect, onBack, progress }) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTopics = await getTopicsForSubject(subject.name, studentAge);
      if (fetchedTopics.length === 0) {
        setError('No topics available at the moment. Please try again.');
      } else {
        setTopics(fetchedTopics);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Oops! We couldn\'t load the topics. Please check your internet connection and try again.');
    }
    setLoading(false);
  }, [subject.name, studentAge]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);
  
  const completedTopics = progress[subject.name] || [];

  return (
    <div className="w-full max-w-5xl mx-auto text-center">
      <button 
        onClick={onBack} 
        className="absolute top-24 left-4 sm:left-8 flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg font-semibold transition-all duration-200"
        aria-label="Go back to subject selection"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" aria-hidden="true"/>
        Back to Subjects
      </button>
      <div className="flex items-center justify-center gap-4 mb-4">
         <subject.icon className={`h-12 w-12 ${subject.color}`} aria-hidden="true" />
         <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">{subject.name}</h2>
      </div>
      <p className="text-lg text-gray-600 mb-8 font-medium">Pick a topic to explore! We'll adjust the challenge just for you.</p>
      
      <div role="main" aria-live="polite" aria-busy={loading}>
      {loading ? (
        <LoadingSpinner message={`Finding exciting ${subject.name} topics for you...`} />
      ) : error ? (
        <div className="text-center p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
            <button
              onClick={fetchTopics}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/60 active:scale-95 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
          aria-label="Available topics"
        >
          {topics.map((topic) => {
            const isCompleted = completedTopics.includes(topic);
            // Note: Cache key might need adjustment if we want to show offline status for specific difficulties, 
            // but since difficulty is dynamic now, maybe just check Medium as a proxy or remove specific difficulty check?
            // For now, we'll check Medium as a default.
            const lessonCacheKey = createCacheKey('lesson', subject.name, topic, Difficulty.Medium, '9');
            return (
              <button
                key={topic}
                onClick={() => onSelect(topic)}
                role="listitem"
                aria-label={`${topic}${isCompleted ? ' - completed' : ''}`}
                className={`p-4 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-left font-semibold text-lg flex flex-col group relative overflow-hidden
              
              before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/10 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300
              
              ${subject.bgColor} ${subject.color.replace('text-','hover:bg-').replace('600','-200')} focus:outline-none focus:ring-4 focus:ring-opacity-50 ${subject.color.replace('text-', 'focus:ring-')} animate-fadeInUp`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex-1 relative text-gray-900">{topic}</span>
                  {isCompleted && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500 shrink-0 relative" aria-hidden="true" />
                  )}
                </div>
                <OfflineBadge cacheKey={lessonCacheKey} />
              </button>
            )
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default TopicSelector;