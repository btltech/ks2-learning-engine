import React, { useState, useEffect, useCallback } from 'react';
import { type QuizQuestion, type Difficulty, type QuizResult } from '../types';
import { generateQuiz, generateQuizHint } from '../services/geminiService';
import { offlineManager } from '../services/offlineManager';
import LoadingSpinner from './LoadingSpinner';
import { Skeleton } from './Skeleton';
import { useTTS } from '../hooks/useTTS';
import { SpeakerWaveIcon, StopIcon, LightBulbIcon } from '@heroicons/react/24/solid';

interface QuizViewProps {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  studentAge: number;
  studentName?: string;
  onSubmit: (results: QuizResult[]) => void;
  mode?: 'standard' | 'speed';
}

const QuizView: React.FC<QuizViewProps> = ({ subject, topic, difficulty, studentAge, studentName, onSubmit, mode = 'standard' }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { speak, cancel, isSpeaking } = useTTS();
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentHint, setCurrentHint] = useState<string>('');
  const [isGettingHint, setIsGettingHint] = useState(false);

  // Timer for speed mode
  useEffect(() => {
    if (mode === 'speed' && !loading && !error && questions.length > 0) {
      setTimeLeft(15);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextQuestion(true); // Force next on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, mode, loading, error, questions.length]);

  // Stop speaking when question changes
  useEffect(() => {
    cancel();
  }, [currentQuestionIndex, cancel]);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
    try {
      const generatedQuestions = await generateQuiz(subject, topic, difficulty, studentAge);
      if (!generatedQuestions || generatedQuestions.length === 0) {
        setError('We couldn\'t create quiz questions right now. Please try again.');
      } else {
        setQuestions(generatedQuestions);
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      const isOffline = !offlineManager.checkOnlineStatus();
      setError(
        isOffline
          ? 'You\'re offline! This quiz hasn\'t been downloaded yet. Try reviewing a lesson you\'ve studied before, or connect to the internet.'
          : 'Oops! Something went wrong while creating your quiz. Please check your connection and try again.'
      );
    }
    setLoading(false);
  }, [subject, topic, difficulty, studentAge]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleNextQuestion = (isTimeout = false) => {
    // If timeout, treat as no answer (or wrong)
    const answerToRecord = isTimeout ? '' : selectedOption;
    
    if (answerToRecord || isTimeout) {
      const newAnswers = [...selectedAnswers, answerToRecord || ''];
      setSelectedAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentHint(''); // Clear hint for new question
      } else {
        // Final submission
        const results: QuizResult[] = questions.map((q, index) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: newAnswers[index],
          isCorrect: q.correctAnswer === newAnswers[index],
        }));
        onSubmit(results);
      }
    }
  };

  const handleGetHint = async () => {
    if (!currentQuestion || isGettingHint) return;
    
    setIsGettingHint(true);
    try {
      const hint = await generateQuizHint(
        currentQuestion.question,
        currentQuestion.options,
        subject,
        topic,
        studentAge,
        studentName
      );
      setCurrentHint(hint);
    } catch (error) {
      console.error('Error getting hint:', error);
      setCurrentHint("I'm having trouble thinking of a hint right now. Try reading the question again carefully!");
    } finally {
      setIsGettingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <LoadingSpinner 
          message="Preparing your quiz questions..." 
          showProgress={true}
          estimatedTime={6}
        />
        <div className="bg-white p-8 rounded-2xl shadow-2xl mt-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <div className="mt-6">
            <Skeleton className="h-12 rounded-lg" lines={4} />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
          <button
            onClick={fetchQuiz}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50 active:scale-95 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100" role="main">
      <div className="mb-6" role="status" aria-live="polite">
        <p className="text-sm font-bold text-blue-600 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-grow">
          {mode === 'speed' && (
            <div className="flex items-center mb-2 text-orange-600 font-bold animate-pulse">
              <span className="mr-2">⚡ Speed Challenge!</span>
              <span className={`text-2xl ${timeLeft <= 5 ? 'text-red-600 scale-110' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-800">{currentQuestion.question}</h3>
        </div>
        <div className="flex gap-2 ml-4">
          <button 
            onClick={() => isSpeaking ? cancel() : speak(currentQuestion.question)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            aria-label={isSpeaking ? "Stop reading" : "Read question"}
          >
            {isSpeaking ? <StopIcon className="h-6 w-6" /> : <SpeakerWaveIcon className="h-6 w-6" />}
          </button>
          <button
            onClick={handleGetHint}
            disabled={isGettingHint}
            className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors disabled:opacity-50"
            aria-label="Get a hint"
            title="Get a helpful hint (won't give away the answer)"
          >
            <LightBulbIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Hint Display */}
      {currentHint && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <div className="flex items-start">
            <LightBulbIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-1">MiRa's Hint:</p>
              <p className="text-sm text-yellow-700">{currentHint}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4" role="radiogroup" aria-label="Quiz answer options">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedOption(option)}
            role="radio"
            aria-checked={selectedOption === option}
            aria-label={`Option: ${option}`}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-lg font-semibold
              ${selectedOption === option 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 text-white scale-105 shadow-lg shadow-blue-500/40' 
                : 'bg-blue-50 border-blue-200 text-gray-700 hover:bg-blue-100 hover:border-blue-400 hover:shadow-md'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-8 text-right">
        <button
          onClick={() => handleNextQuestion(false)}
          disabled={!selectedOption}
          aria-label={isLastQuestion ? 'Finish quiz and see results' : 'Go to next question'}
          aria-disabled={!selectedOption}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 active:scale-95 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;