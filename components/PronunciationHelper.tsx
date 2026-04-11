import React, { useState } from 'react';
import { SpeakerWaveIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { getPhonetics, getPronunciationRules, breakIntoSyllables } from '../services/phoneticsService';
import { speakPronunciation } from '../services/naturalTTS';

interface PronunciationHelperProps {
  word: string;
  language: string;
  showRules?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Yoruba tone guide component
const YorubaToneGuide: React.FC = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
    <div className="text-sm font-bold text-amber-800 mb-2">🎵 Yoruba is a TONAL language!</div>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="bg-white rounded p-2 text-center">
        <div className="text-red-500 font-bold text-lg">↑</div>
        <div className="font-semibold">HIGH</div>
        <div className="text-gray-500">Voice goes UP</div>
      </div>
      <div className="bg-white rounded p-2 text-center">
        <div className="text-blue-500 font-bold text-lg">→</div>
        <div className="font-semibold">MID</div>
        <div className="text-gray-500">Normal voice</div>
      </div>
      <div className="bg-white rounded p-2 text-center">
        <div className="text-green-500 font-bold text-lg">↓</div>
        <div className="font-semibold">LOW</div>
        <div className="text-gray-500">Voice goes DOWN</div>
      </div>
    </div>
    <div className="text-xs text-amber-700 mt-2">
      💡 The same word with different tones can mean different things!
    </div>
  </div>
);

/**
 * Pronunciation Helper Component
 * 
 * Displays phonetic guides and allows students to:
 * - See how words are pronounced
 * - Hear slow pronunciation
 * - Practice syllable by syllable
 */
const PronunciationHelper: React.FC<PronunciationHelperProps> = ({
  word,
  language,
  showRules = false,
  size = 'md',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSyllable, setCurrentSyllable] = useState<number>(-1);
  const [speed, setSpeed] = useState<'slow' | 'normal'>('slow');

  // Get phonetics from our dictionary
  const phoneticsData = getPhonetics(word, language) as { phonetic: string; syllables: string[]; tones?: string; found?: boolean } | null;
  const syllables = phoneticsData?.syllables || breakIntoSyllables(word);
  const pronunciationRules = showRules ? getPronunciationRules(language) : null;
  const isYoruba = language === 'Yoruba';
  const tones = phoneticsData?.tones?.split('-') || [];

  const handleSpeak = async () => {
    setIsSpeaking(true);
    try {
      await speakPronunciation(word, language);
    } catch (error) {
      console.error('Pronunciation error:', error);
    }
    setIsSpeaking(false);
  };

  const handleSpeakSyllable = async (syllable: string, index: number) => {
    setCurrentSyllable(index);
    setIsSpeaking(true);
    try {
      await speakPronunciation(syllable, language);
    } catch (error) {
      console.error('Syllable pronunciation error:', error);
    }
    setIsSpeaking(false);
    setCurrentSyllable(-1);
  };

  const handleSpeakAllSyllables = async () => {
    setIsSpeaking(true);
    for (let i = 0; i < syllables.length; i++) {
      setCurrentSyllable(i);
      try {
        await speakPronunciation(syllables[i], language);
        // Pause between syllables
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Syllable pronunciation error:', error);
      }
    }
    setCurrentSyllable(-1);
    setIsSpeaking(false);
  };

  // Get tone indicator for Yoruba syllables
  const getToneIndicator = (index: number): { symbol: string; color: string; label: string } | null => {
    if (!isYoruba || !tones[index]) return null;
    const tone = tones[index];
    if (tone === 'high') return { symbol: '↑', color: 'text-red-500', label: 'HIGH' };
    if (tone === 'mid') return { symbol: '→', color: 'text-blue-500', label: 'MID' };
    if (tone === 'low') return { symbol: '↓', color: 'text-green-500', label: 'LOW' };
    return null;
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100 ${sizeClasses[size]}`}>
      {/* Yoruba Tone Guide */}
      {isYoruba && showRules && <YorubaToneGuide />}
      
      {/* Word and Phonetic */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-bold text-gray-800 text-xl">{word}</span>
          {phoneticsData && (
            <span className="ml-3 text-purple-600 font-mono bg-purple-100 px-2 py-1 rounded">
              [{phoneticsData.phonetic}]
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Speed toggle */}
          <button
            onClick={() => setSpeed(s => s === 'slow' ? 'normal' : 'slow')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              speed === 'slow' 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
            title={speed === 'slow' ? 'Slow speed' : 'Normal speed'}
          >
            {speed === 'slow' ? '🐢 Slow' : '🐇 Normal'}
          </button>
          
          {/* Speak button */}
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50"
            title="Hear pronunciation"
          >
            {isSpeaking ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <SpeakerWaveIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Syllables */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
          Syllables {isYoruba && tones.length > 0 ? '(with tones)' : '(tap each to hear)'}:
        </div>
        <div className="flex flex-wrap gap-2">
          {syllables.map((syllable, index) => {
            const toneInfo = getToneIndicator(index);
            return (
              <button
                key={index}
                onClick={() => handleSpeakSyllable(syllable, index)}
                className={`px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-105 relative ${
                  currentSyllable === index
                    ? 'bg-purple-500 text-white scale-110 shadow-lg'
                    : 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400'
                }`}
              >
                {syllable}
                {toneInfo && (
                  <span className={`absolute -top-2 -right-2 ${toneInfo.color} bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow border`}>
                    {toneInfo.symbol}
                  </span>
                )}
              </button>
            );
          })}
          
          {syllables.length > 1 && (
            <button
              onClick={handleSpeakAllSyllables}
              disabled={isSpeaking}
              className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
              title="Hear all syllables slowly"
            >
              ▶️ All
            </button>
          )}
        </div>
      </div>

      {/* Yoruba-specific tip about TTS limitation */}
      {isYoruba && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm mb-3">
          <span className="font-semibold text-amber-800">⚠️ Audio Note:</span>
          <span className="text-amber-700 ml-2">
            Computer voices can't speak Yoruba perfectly. Use the phonetic spelling above and practice the tones!
          </span>
        </div>
      )}

      {/* Pronunciation tip */}
      {phoneticsData && (
        <div className="bg-white/70 rounded-lg p-3 text-sm">
          <span className="font-semibold text-purple-700">💡 Tip:</span>
          <span className="text-gray-600 ml-2">
            Say it like: <span className="font-mono font-bold text-purple-600">{phoneticsData.phonetic}</span>
          </span>
        </div>
      )}

      {/* Pronunciation rules */}
      {showRules && pronunciationRules && pronunciationRules.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
            {language} Pronunciation Rules:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pronunciationRules.slice(0, 6).map((rule, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-2 text-xs">
                <span className="font-bold text-purple-600">{rule.pattern.source}</span>
                <span className="text-gray-500 mx-1">→</span>
                <span className="text-gray-700">{rule.guide}</span>
                <div className="text-gray-400 mt-1 italic">{rule.example}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PronunciationHelper;
