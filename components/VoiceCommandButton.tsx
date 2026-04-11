import { useState, useEffect } from 'react';
import { voiceNavigationService } from '../services/voiceNavigationService';

export default function VoiceCommandButton() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showCommands, setShowCommands] = useState(false);

  useEffect(() => {
    setIsSupported(voiceNavigationService.isSupported());

    // Subscribe to command recognition
    voiceNavigationService.onCommand((command) => {
      console.log('Command recognized:', command);
    });

    // Check listening state
    const interval = setInterval(() => {
      setIsListening(voiceNavigationService.isActive());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleVoiceClick = () => {
    if (isListening) {
      voiceNavigationService.stopListening();
    } else {
      voiceNavigationService.startListening();
    }
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Commands List */}
      {showCommands && (
        <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-6 w-80 mb-2 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎤</span> Voice Commands
          </h3>
          
          <div className="space-y-2 mb-4">
            {voiceNavigationService.getCommands().map((cmd, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">"{cmd.phrases[0]}"</p>
                <p className="text-xs text-gray-600">{cmd.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowCommands(false)}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Voice Button */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => setShowCommands(!showCommands)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 text-sm"
        >
          ℹ️
        </button>

        <button
          onClick={handleVoiceClick}
          className={`relative p-6 rounded-full shadow-2xl transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {/* Listening Animation */}
          {isListening && (
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
            </div>
          )}

          {/* Icon */}
          <div className="relative z-10">
            {isListening ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>

          {/* Status Text */}
          <div className="absolute -top-2 -right-2 bg-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            {isListening ? '🔴' : '🎤'}
          </div>
        </button>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="mt-2 bg-white rounded-full shadow-lg px-4 py-2 text-center">
          <p className="text-sm font-semibold text-gray-900">Listening...</p>
          <p className="text-xs text-gray-500">Speak your command</p>
        </div>
      )}
    </div>
  );
}
