import React, { useState, useEffect, useCallback } from 'react';
import { type BankQuestion, type Difficulty } from '../types';
import { generateLesson } from '../services/geminiService';
import { offlineManager } from '../services/offlineManager';
import LoadingSpinner from './LoadingSpinner';
import { Skeleton } from './Skeleton';
import { useTTSEnhanced } from '../hooks/useTTSEnhanced';
import { ArrowLeftIcon, SpeakerWaveIcon, BoltIcon, BookOpenIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useGameSounds } from '../hooks/useGameSounds';
import PronunciationHelper from './PronunciationHelper';
import { getCommonWords, getSupportedLanguages } from '../services/phoneticsService';
import DOMPurify from 'dompurify';
import { CURATED_LANGUAGES, getCurriculumUnit, getYearGroupForAge } from '../data/curriculumSequences';
import { getCanonicalQuestionsForCurriculumUnit } from '../services/cloudQuestionRepository';
import { getReviewedQuestions } from '../data/reviewedQuestions';
import { getReviewedLanguageQuestions, getReviewedLanguageVocabulary } from '../data/reviewedLanguageContent';

// A simple markdown to HTML converter
const Markdown: React.FC<{ content: string }> = ({ content }) => {
  const parts: string[] = [];
  let listOpen = false;
  const closeList = () => {
    if (listOpen) parts.push('</ul>');
    listOpen = false;
  };
  for (const line of content.split('\n')) {
    if (line.startsWith('* ')) {
      if (!listOpen) parts.push('<ul class="mb-4 list-disc space-y-2 pl-6">');
      listOpen = true;
      parts.push(`<li>${line.substring(2)}</li>`);
      continue;
    }
    closeList();
    if (line.startsWith('### ')) parts.push(`<h3 class="mt-5 text-xl font-bold">${line.substring(4)}</h3>`);
    else if (line.startsWith('## ')) parts.push(`<h2 class="my-4 text-2xl font-bold">${line.substring(3)}</h2>`);
    else if (line.startsWith('# ')) parts.push(`<h2 class="mb-3 mt-6 text-2xl font-bold text-gray-900">${line.substring(2)}</h2>`);
    else if (line.trim() !== '') parts.push(`<p class="mb-4">${line}</p>`);
  }
  closeList();
  const htmlContent = parts.join('');

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
  const [practiceQuestions, setPracticeQuestions] = useState<BankQuestion[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  
  // Detect language for native pronunciation
  const isLanguageSubject = (CURATED_LANGUAGES as readonly string[]).includes(subject);
  const detectedLanguage = isLanguageSubject ? subject : 'English';
  const supportsPhonetics = getSupportedLanguages().includes(subject);
  const reviewedTopicVocabulary = getReviewedLanguageVocabulary(subject, topic);
  const vocabularyWords = subject === 'Yoruba' && reviewedTopicVocabulary.length > 0
    ? reviewedTopicVocabulary
    : supportsPhonetics ? getCommonWords(subject).slice(0, 12) : [];
  
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isLoading: isTTSLoading, errorMessage: ttsError, needsGesture, setNeedsGesture } = useTTSEnhanced(detectedLanguage, {
    googleCloudApiKey: (import.meta as unknown as { env: { VITE_GOOGLE_CLOUD_TTS_API_KEY?: string } }).env?.VITE_GOOGLE_CLOUD_TTS_API_KEY
  });
  
  const { playClick } = useGameSounds();
  const curriculumUnit = getCurriculumUnit(subject, topic, studentAge);
  const completedPracticeCount = Object.keys(practiceAnswers).length;
  const practiceComplete = practiceQuestions.length === 0 || completedPracticeCount === practiceQuestions.length;

  const resolveCorrectOption = (question: BankQuestion): string => {
    const exact = question.options.find((option) => option.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase());
    if (exact) return exact;
    const numeric = Number(question.correctAnswer);
    if (Number.isInteger(numeric)) return question.options[numeric] || question.options[numeric - 1] || question.correctAnswer;
    const letter = question.correctAnswer.trim().match(/^([A-Fa-f])(?:[.)\s:]|$)/);
    return letter ? question.options[letter[1].toUpperCase().charCodeAt(0) - 65] || question.correctAnswer : question.correctAnswer;
  };

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

  useEffect(() => {
    let active = true;
    setPracticeAnswers({});
    if (!curriculumUnit) {
      setPracticeQuestions([]);
      return () => { active = false; };
    }
    const reviewed = [
      ...getReviewedQuestions(subject, topic, studentAge),
      ...getReviewedLanguageQuestions(subject, topic, studentAge),
    ];
    const questionsPromise = getCanonicalQuestionsForCurriculumUnit(
      subject,
      curriculumUnit.bankTopic,
      studentAge,
      difficulty,
      2,
      [],
      reviewed,
    );
    void questionsPromise
      .then((questions) => {
        if (active) setPracticeQuestions(questions.filter((question) => question.options.length >= 2));
      })
      .catch(() => {
        if (active) setPracticeQuestions([]);
      });
    return () => { active = false; };
  }, [subject, topic, studentAge, difficulty, curriculumUnit?.id]);

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
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-indigo-600">Year {getYearGroupForAge(studentAge)} · Unit {curriculumUnit?.order || 1}</p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800">{topic}</h2>
            {curriculumUnit?.objective && <p className="mt-2 max-w-2xl text-base font-medium text-gray-600">{curriculumUnit.objective}</p>}
          </div>
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

      {!loading && !error && practiceQuestions.length > 0 && (
        <section className="mt-6 rounded-2xl border border-indigo-100 bg-white p-4 shadow-xl sm:p-8" aria-labelledby="guided-check-title">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Guided practice</p>
              <h3 id="guided-check-title" className="text-2xl font-bold text-gray-900">Check your understanding</h3>
            </div>
            <p className="text-sm font-semibold text-gray-600">{completedPracticeCount} of {practiceQuestions.length} checked</p>
          </div>
          <div className="space-y-6">
            {practiceQuestions.map((question, questionIndex) => {
              const questionKey = question.id || `practice-${questionIndex}`;
              const selected = practiceAnswers[questionKey];
              const correct = resolveCorrectOption(question);
              return (
                <div key={questionKey} className="rounded-xl bg-indigo-50/60 p-4">
                  <p className="mb-3 font-bold text-gray-900">{questionIndex + 1}. {question.question}</p>
                  <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={`Practice question ${questionIndex + 1}`}>
                    {question.options.map((option) => {
                      const isSelected = selected === option;
                      const isCorrect = option === correct;
                      const answerClass = !selected
                        ? 'border-gray-200 bg-white hover:border-indigo-400'
                        : isCorrect
                          ? 'border-green-500 bg-green-100 text-green-900'
                          : isSelected
                            ? 'border-red-400 bg-red-100 text-red-900'
                            : 'border-gray-200 bg-white opacity-70';
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={Boolean(selected)}
                          onClick={() => setPracticeAnswers((answers) => ({ ...answers, [questionKey]: option }))}
                          className={`rounded-xl border-2 p-3 text-left font-semibold transition-colors ${answerClass}`}
                          role="radio"
                          aria-checked={isSelected}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {selected && (
                    <div className={`mt-3 rounded-lg p-3 text-sm font-semibold ${selected === correct ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`} role="status">
                      {selected === correct ? 'Correct — well reasoned.' : `Not quite. The correct answer is ${correct}.`}
                      {question.explanation ? ` ${question.explanation}` : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Vocabulary Practice Section - Only for language subjects with phonetics support */}
      {!loading && !error && supportsPhonetics && vocabularyWords.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden">
          <button
            onClick={() => setShowVocabulary(!showVocabulary)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
          >
            <div className="flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-3" />
              {subject === 'Yoruba' ? 'Vocabulary and Tone Practice' : 'Vocabulary Practice - Hear How to Say It!'}
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
                    {subject === 'Yoruba'
                      ? 'Read the marked spelling carefully: H = high, M = mid and L = low tone.'
                      : '🎯 Tap a word to practise pronunciation with syllable-by-syllable audio!'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {vocabularyWords.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => subject !== 'Yoruba' && setSelectedWord(item.word)}
                        disabled={subject === 'Yoruba'}
                        className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100 rounded-xl hover:border-purple-400 hover:shadow-md transition-all text-left group disabled:cursor-default"
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
            disabled={!practiceComplete}
            aria-label="Start the quiz for this lesson"
            className="px-6 py-3 sm:px-10 sm:py-4 bg-green-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-lg hover:bg-green-600 transform hover:scale-105 transition-transform duration-300 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none disabled:hover:scale-100"
          >
            Ready for a Quiz?
          </button>
          
          <button
            onClick={() => handleStartQuiz('speed')}
            disabled={!practiceComplete}
            aria-label="Start a speed challenge"
            className="px-6 py-3 sm:px-10 sm:py-4 bg-orange-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-transform duration-300 flex items-center justify-center disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none disabled:hover:scale-100"
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
