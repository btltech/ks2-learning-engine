import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject, ProgressData } from '../types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface SubjectSelectorProps {
  onSelect: (subject: Subject) => void;
  studentAge: number;
  onAgeChange: (age: number) => void;
  progress: ProgressData;
}

const AGES = [7, 8, 9, 10, 11];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelect, studentAge, onAgeChange, progress }) => {
  return (
    <div className="text-center w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, Super Learner!</h2>
      <p className="text-lg text-gray-600 mb-8">First things first, how old are you?</p>
      
      <div 
        className="flex justify-center space-x-2 sm:space-x-4 mb-12"
        role="radiogroup"
        aria-label="Select your age"
      >
        {AGES.map(age => (
          <button
            key={age}
            onClick={() => onAgeChange(age)}
            role="radio"
            aria-checked={studentAge === age}
            aria-label={`${age} years old`}
            className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-full shadow-md transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              studentAge === age 
              ? 'bg-blue-500 text-white scale-110 ring-4 ring-blue-400' 
              : 'bg-white text-blue-500 hover:bg-blue-100 hover:scale-105'
            }`}
          >
            {age}
          </button>
        ))}
      </div>

      <p className="text-lg text-gray-600 mb-8">Great! Now, what adventure shall we go on today?</p>
      <div 
        className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        role="list"
        aria-label="Subject selection"
      >
        {SUBJECTS.map((subject) => {
          const isCompleted = progress[subject.name] && progress[subject.name].length > 0;
          return (
            <button
              key={subject.name}
              onClick={() => onSelect(subject)}
              role="listitem"
              aria-label={`${subject.name}${isCompleted ? ' - topics completed' : ''}`}
              className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${subject.bgColor} focus:outline-none focus:ring-4 focus:ring-opacity-50 ${subject.color.replace('text-', 'focus:ring-')}`}
            >
              {isCompleted && (
                <CheckCircleIcon className="absolute top-3 right-3 h-7 w-7 text-green-500 bg-white rounded-full" aria-hidden="true" />
              )}
              <subject.icon className={`h-16 w-16 mb-3 ${subject.color} transition-transform group-hover:scale-110`} aria-hidden="true" />
              <span className="text-xl font-bold text-gray-800">{subject.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectSelector;