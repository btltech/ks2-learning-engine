import React from 'react';
import { LANGUAGES } from '../constants';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

interface LanguageSelectorProps {
  onSelect: (language: string) => void;
  onBack: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      <button 
         onClick={onBack} 
         className="flex items-center text-gray-600 hover:text-gray-900 font-semibold transition-colors mb-8"
         aria-label="Go back to subjects"
       >
        <ArrowLeftIcon className="h-5 w-5 mr-2" aria-hidden="true"/>
        Back to Subjects
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose a Language</h2>
      <p className="text-lg text-gray-600 mb-10">Which language would you like to explore today?</p>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        role="list"
        aria-label="Language selection"
      >
        {LANGUAGES.map((lang) => (
          <button
            key={lang.name}
            onClick={() => onSelect(lang.name)}
            className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-pink-200"
          >
            <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform" role="img" aria-label={`${lang.name} flag`}>
              {lang.flag}
            </span>
            <span className="text-2xl font-bold text-gray-800 mb-2">{lang.name}</span>
            <span className="text-pink-500 font-medium">{lang.greeting}!</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
