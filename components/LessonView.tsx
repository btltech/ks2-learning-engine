import React, { useState, useEffect, useCallback } from 'react';
import type { Difficulty } from '../types';
import { generateLesson } from '../services/geminiService';
import { offlineManager } from '../services/offlineManager';
import LoadingSpinner from './LoadingSpinner';
import { Skeleton } from './Skeleton';
import { useTTSEnhanced } from '../hooks/useTTSEnhanced';
import { ArrowLeftIcon, SpeakerWaveIcon, StopIcon, BoltIcon, BookOpenIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useGameSounds } from '../hooks/useGameSounds';
import PronunciationHelper from './PronunciationHelper';
import { getCommonWords, getSupportedLanguages } from '../services/phoneticsService';
import DOMPurify from 'dompurify';

// A simple markdown to HTML converter
const Markdown: React.FC<{ content: string }> = ({ content }) => {
  const htmlContent = content
    .split('\n')
    .map(line => {
        if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold my-4">${line.substring(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold my-5">${line.substring(2)}</h1>`;
        if (line.trim() === '') return '<br />';
        if (line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
        return `<p class="mb-4">${line}</p>`;
    })
    .join('');

    const sanitizedContent = DOMPurify.sanitize(htmlContent);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}

interface LessonViewProps {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  studentAge: number;
  onStartQuiz: (mode?: 'standard' | 'speed') => void;
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ subject, topic, difficulty, studentAge, onStartQuiz, onBack }) => {
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  // Detect language for native pronunciation
  const isLanguageSubject = ['French','Spanish','German','Japanese','Mandarin','Romanian','Yoruba','Languages'].includes(subject);
  const detectedLanguage = isLanguageSubject ? subject : 'English';
  const supportsPhonetics = getSupportedLanguages().includes(subject);
  const vocabularyWords = supportsPhonetics ? getCommonWords(subject).slice(0, 12) : [];
  
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isLoading: isTTSLoading, progress: ttsProgress, errorMessage: ttsError, needsGesture, setNeedsGesture } = useTTSEnhanced(detectedLanguage, {
    googleCloudApiKey: (import.meta as unknown as { env: { VITE_GOOGLE_CLOUD_TTS_API_KEY?: string } }).env?.VITE_GOOGLE_CLOUD_TTS_API_KEY
  });
  
  const { playClick } = useGameSounds();

  // Stop speaking when unmounting or changing lesson
  useEffect(() => {
    return () => cancel();
  }, [cancel, lesson]);

  const handleSpeak = () => {
    playClick();
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      // Simple markdown stripping for better speech
      const textToRead = lesson
        .replace(/#{1,6} /g, '') // Remove headers
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '') // Remove bullets
        .replace(/\n/g, '. '); // Replace newlines with pauses
      speak(textToRead);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent single click trigger
    playClick();
    cancel();
  };

  const handleBack = () => {
    playClick();
    onBack();
  };

  const handleStartQuiz = (mode: 'standard' | 'speed') => {
    playClick();
    onStartQuiz(mode);
  };

  const fetchLesson = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedLesson = await generateLesson(subject, topic, difficulty, studentAge);
      if (!generatedLesson || generatedLesson.includes('couldn\'t prepare')) {
        setError('We couldn\'t create your lesson right now. Please try again in a moment.');
      } else {
        setLesson(generatedLesson);
      }
    } catch (err) {
      console.error('Error generating lesson:', err);
      const isOffline = !offlineManager.checkOnlineStatus();
      setError(
        isOffline
          ? 'You\'re offline! This lesson hasn\'t been downloaded yet. Try a topic you\'ve studied before, or connect to the internet to load new lessons.'
          : 'Oops! Something went wrong while creating your lesson. Please check your connection and try again.'
      );
    }
    setLoading(false);
  }, [subject, topic, difficulty, studentAge]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return (
    <div className="w-full max-w-4xl mx-auto">
       <button 
         onClick={handleBack} 
         className="flex items-center text-gray-600 hover:text-gray-900 font-semibold transition-colors mb-4 sm:mb-6"
         aria-label="Go back to topic selection"
       >
        <ArrowLeftIcon className="h-5 w-5 mr-2" aria-hidden="true"/>
        Back to Topics
      </button>
      <article className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl" role="main" aria-live="polite" aria-busy={loading}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800">{topic}</h2>
          {!loading && !error && (
            <div className="flex items-center gap-2">
              {isLanguageSubject && (
                <button
                  onClick={() => {
                    playClick();
                    speak(topic);
                  }}
                  disabled={isTTSLoading}
                  className="p-3 rounded-full bg-emerald-100 text-emerald-700 hover:bg-opacity-80 transition-colors disabled:opacity-50"
                  title="Hear pronunciation"
                  aria-label="Hear pronunciation of this topic"
                >
                  {isTTSLoading ? (
                    <div className="h-6 w-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SpeakerWaveIcon className="h-6 w-6" />
                  )}
                </button>
              )}
              <button 
                onClick={handleSpeak}
                onDoubleClick={handleStop}
                disabled={isTTSLoading}
                className={`p-3 rounded-full ${isSpeaking ? (isPaused ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600') : 'bg-blue-100 text-blue-600'} hover:bg-opacity-80 transition-colors disabled:opacity-50`}
                title={isSpeaking ? (isPaused ? 'Resume reading' : 'Pause reading (Double click to stop)') : 'Read lesson aloud'}
                aria-label={isSpeaking ? (isPaused ? 'Resume reading' : 'Pause reading') : 'Read lesson aloud'}
              >
                {isSpeaking ? (
                  isPaused ? <PlayIcon className="h-6 w-6" /> : <PauseIcon className="h-6 w-6" />
                ) : (
                  <SpeakerWaveIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div>
            <LoadingSpinner 
              message={`Creating your ${difficulty} lesson on ${topic}...`}
              showProgress={true}
              estimatedTime={8}
            />
            <div className="mt-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton lines={3} />
              <Skeleton className="h-32 mt-6" />
              <Skeleton lines={2} />
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
              <button
                onClick={fetchLesson}
                className="px-6 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transform hover:scale-105 transition-transform"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none text-lg text-gray-700 leading-relaxed">
            <Markdown content={lesson} />
          </div>
        )}
      </article>

      {/* Vocabulary Practice Section - Only for language subjects with phonetics support */}
      {!loading && !error && supportsPhonetics && vocabularyWords.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden">
          <button
            onClick={() => setShowVocabulary(!showVocabulary)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
          >
            <div className="flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-3" />
              Vocabulary Practice - Hear How to Say It!
            </div>
            <span className="text-2xl">{showVocabulary ? '−' : '+'}</span>
          </button>
          
          {showVocabulary && (
            <div className="p-4 sm:p-6">
              {selectedWord ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="flex items-center text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to word list
                  </button>
                  <PronunciationHelper
                    word={selectedWord}
                    language={subject}
                    showRules={true}
                    size="lg"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4 text-center">
                    🎯 Tap a word to practice pronunciation with syllable-by-syllable audio!
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {vocabularyWords.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedWord(item.word)}
                        className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100 rounded-xl hover:border-purple-400 hover:shadow-md transition-all text-left group"
                      >
                        <div className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {item.word}
                        </div>
                        <div className="text-xs text-purple-500 font-mono mt-1">
                          [{item.phonetic}]
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => handleStartQuiz('standard')}
            aria-label="Start the quiz for this lesson"
            className="px-6 py-3 sm:px-10 sm:py-4 bg-green-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-lg hover:bg-green-600 transform hover:scale-105 transition-transform duration-300"
          >
            Ready for a Quiz?
          </button>
          
          <button
            onClick={() => handleStartQuiz('speed')}
            aria-label="Start a speed challenge"
            className="px-6 py-3 sm:px-10 sm:py-4 bg-orange-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-transform duration-300 flex items-center justify-center"
          >
            <BoltIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Speed Challenge!
          </button>
        </div>
      )}
      {ttsError && (
        <div className="mt-4 text-center text-red-700 font-semibold p-3 rounded-md bg-red-50 border border-red-100">
          {`Voice error: ${ttsError}`}
        </div>
      )}
      {needsGesture && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // Try to resume audio: we can trigger the last audio by calling speak again with the topic
              setNeedsGesture(false);
              speak(lesson || topic);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700"
          >
            Tap to Play Audio
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonView;