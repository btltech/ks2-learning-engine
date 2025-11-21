import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject, ProgressData } from '../types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface SubjectSelectorProps {
  onSelect: (subject: Subject) => void;
  progress: ProgressData;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelect, progress }) => {
  return (
    <div className="text-center w-full">
      <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 tracking-tight animate-fadeInDown">What would you like to learn today?</h2>
      <div 
        className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        role="list"
        aria-label="Subject selection"
      >
        {SUBJECTS.map((subject, index) => {
          const isCompleted = progress[subject.name] && progress[subject.name].length > 0;
          return (
            <button
              key={subject.name}
              onClick={() => onSelect(subject)}
              role="listitem"
              aria-label={`${subject.name}${isCompleted ? ' - topics completed' : ''}`}
              className={`group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${subject.bgColor}
              
              before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/10 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300
              
              hover:shadow-2xl hover:shadow-${subject.color.split('-')[1]}-300/30 shadow-lg hover:-translate-y-2 ${subject.color.replace('text-', 'focus:ring-')} animate-fadeInUp`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {isCompleted && (
                <CheckCircleIcon className="absolute top-3 right-3 h-7 w-7 text-green-500 bg-white rounded-full" aria-hidden="true" />
              )}
              <subject.icon className={`relative h-16 w-16 mb-3 ${subject.color} transition-transform group-hover:scale-110`} aria-hidden="true" />
              <span className="relative text-xl font-bold text-gray-800">{subject.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectSelector;