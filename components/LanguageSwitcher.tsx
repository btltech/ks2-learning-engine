import { useState, useEffect } from 'react';
import { translationService, SupportedLanguage } from '../services/translationService';

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(translationService.getLanguage());
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    const unsubscribe = translationService.subscribe((lang) => {
      setCurrentLang(lang);
    });
    
    return unsubscribe;
  }, []);
  
  const languages = translationService.getAvailableLanguages();
  const currentLanguage = languages.find(l => l.code === currentLang);
  
  const handleLanguageChange = (lang: SupportedLanguage) => {
    translationService.setLanguage(lang);
    setShowMenu(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-colors"
        aria-label="Change language"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline text-sm font-medium text-gray-700">
          {currentLanguage?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  lang.code === currentLang ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                {lang.code === currentLang && (
                  <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
