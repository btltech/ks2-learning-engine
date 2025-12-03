import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject, ProgressData } from '../types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useGameSounds } from '../hooks/useGameSounds';

interface SubjectSelectorProps {
  onSelect: (subject: Subject) => void;
  progress: ProgressData;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelect, progress }) => {
  const { playClick } = useGameSounds();

  const handleSelect = (subject: Subject) => {
    playClick();
    onSelect(subject);
  };

  return (
    <div className="w-full">
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        role="list"
        aria-label="Subject selection"
      >
        {SUBJECTS.map((subject, index) => {
          const completedTopics = progress[subject.name]?.length || 0;
          const isCompleted = completedTopics > 0;
          
          return (
            <button
              key={subject.name}
              onClick={() => handleSelect(subject)}
              role="listitem"
              aria-label={`${subject.name}${isCompleted ? ` - ${completedTopics} topics completed` : ''}`}
              className={`group relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${subject.bgColor}
              hover:shadow-lg hover:-translate-y-1 ${subject.color.replace('text-', 'focus:ring-')} animate-fadeInUp`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isCompleted && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  <CheckCircleIcon className="h-3 w-3" />
                  <span>{completedTopics}</span>
                </div>
              )}
              <subject.icon className={`h-10 w-10 sm:h-12 sm:w-12 mb-2 ${subject.color} transition-transform group-hover:scale-110`} aria-hidden="true" />
              <span className="text-sm sm:text-base font-bold text-gray-800 text-center">{subject.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectSelector;
