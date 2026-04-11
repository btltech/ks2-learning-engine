import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { type QuizQuestion, type Difficulty, type QuizResult, QuestionType, MatchingPair, DragDropItem, DragDropZone } from '../types';
import { generateQuiz, generateQuizHint } from '../services/geminiService';
import { adaptiveLearningEngine } from '../services/adaptiveLearningEngine';
import { useUser } from '../context/UserContext';
import { recordQuizAttempts } from '../services/questionPerformance';
import { offlineManager } from '../services/offlineManager';
import LoadingSpinner from './LoadingSpinner';
import { Skeleton } from './Skeleton';
import { useTTSEnhanced } from '../hooks/useTTSEnhanced';
import { useGameSounds } from '../hooks/useGameSounds';
import { useVoiceInput, parseAnswerOption } from '../hooks/useVoiceInput';
import { SpeakerWaveIcon, StopIcon, LightBulbIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
import { DrawingCanvas } from './DrawingCanvas';
import { MatchingQuestion } from './MatchingQuestion';
import { DragDropQuestion } from './DragDropQuestion';

const normalizeAnswerText = (value?: string | null): string => (value ?? '').trim().toLowerCase();

const resolveMultipleChoiceAnswer = (question: QuizQuestion): string | undefined => {
  if (!question.correctAnswer) return undefined;
  const trimmedAnswer = question.correctAnswer.trim();
  const normalizedCorrect = normalizeAnswerText(trimmedAnswer);

  if (question.options && question.options.length > 0) {
    const exactMatch = question.options.find(option => normalizeAnswerText(option) === normalizedCorrect);
    if (exactMatch) {
      return exactMatch;
    }

    const parsedIndex = Number(trimmedAnswer);
    if (!Number.isNaN(parsedIndex)) {
      if (question.options[parsedIndex]) {
        return question.options[parsedIndex];
      }
      const oneBasedIndex = parsedIndex - 1;
      if (question.options[oneBasedIndex]) {
        return question.options[oneBasedIndex];
      }
    }

    const letterMatch = trimmedAnswer.match(/^([A-Za-z])/);
    if (letterMatch) {
      const letterIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (letterIndex >= 0 && letterIndex < question.options.length) {
        return question.options[letterIndex];
      }
    }
  }

  return trimmedAnswer;
};

const isMultipleChoiceAnswerCorrect = (question: QuizQuestion, userAnswer: string): boolean => {
  if (!question.correctAnswer || !userAnswer) return false;
  const resolvedAnswer = resolveMultipleChoiceAnswer(question);
  if (!resolvedAnswer) return false;
  return normalizeAnswerText(resolvedAnswer) === normalizeAnswerText(userAnswer);
};

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
  const { user } = useUser();

  // Build adaptive profile from current user's quiz history (already Firestore-synced via UserContext)
  const studentProfile = useMemo(() => {
    if (!user?.id) return undefined;
    return adaptiveLearningEngine.analyzeStudent(user.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.quizHistory?.length]);
  // Detect if this is a language subject and extract the language
  const isLanguageSubject = subject === 'Languages';
  const detectedLanguage = isLanguageSubject ? topic.split(':')[0] : 'English';
  const { speak, cancel, isSpeaking } = useTTSEnhanced(detectedLanguage, {
    googleCloudApiKey: (import.meta as unknown as { env: { VITE_GOOGLE_CLOUD_TTS_API_KEY?: string } }).env?.VITE_GOOGLE_CLOUD_TTS_API_KEY
  });
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInBlankAnswer, setFillInBlankAnswer] = useState<string>('');
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [matchingCompleted, setMatchingCompleted] = useState<boolean>(false);
  const [matchingResult, setMatchingResult] = useState<{ isCorrect: boolean; matches: Record<string, string> } | null>(null);
  const [dragDropCompleted, setDragDropCompleted] = useState<boolean>(false);
  const [dragDropResult, setDragDropResult] = useState<{ isCorrect: boolean; placements: Record<string, string> } | null>(null);
  const { playClick } = useGameSounds();
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentHint, setCurrentHint] = useState<string>('');
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastProcessedTranscript = useRef<string>('');
  const fillInBlankInputRef = useRef<HTMLInputElement>(null);

  // Voice input for hands-free quiz answering
  const handleVoiceCommand = useCallback((command: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Handle answer selection
    if (command === 'selectA' && currentQuestion.options[0]) {
      setSelectedOption(currentQuestion.options[0]);
      playClick();
    } else if (command === 'selectB' && currentQuestion.options[1]) {
      setSelectedOption(currentQuestion.options[1]);
      playClick();
    } else if (command === 'selectC' && currentQuestion.options[2]) {
      setSelectedOption(currentQuestion.options[2]);
      playClick();
    } else if (command === 'selectD' && currentQuestion.options[3]) {
      setSelectedOption(currentQuestion.options[3]);
      playClick();
    } else if (command === 'next' || command === 'submit') {
      if (selectedOption) {
        handleNextQuestion();
      }
    } else if (command === 'repeat') {
      speak(currentQuestion.question);
    } else if (command === 'hint') {
      handleGetHint();
    }
  }, [questions, currentQuestionIndex, selectedOption, playClick, speak]);

  const { 
    isListening, 
    transcript, 
    interimTranscript,
    isSupported: voiceSupported,
    startListening, 
    stopListening 
  } = useVoiceInput({ 
    language: 'en-GB',
    onCommand: handleVoiceCommand
  });

  // Process voice transcript for direct answer selection
  useEffect(() => {
    // Prevent processing the same transcript twice
    if (transcript && transcript !== lastProcessedTranscript.current && questions[currentQuestionIndex]) {
      lastProcessedTranscript.current = transcript;
      const answerOption = parseAnswerOption(transcript);
      if (answerOption) {
        const optionIndex = answerOption.charCodeAt(0) - 65; // A=0, B=1, etc.
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion.options[optionIndex]) {
          setSelectedOption(currentQuestion.options[optionIndex]);
          playClick();
        }
      }
    }
  }, [transcript, questions, currentQuestionIndex, playClick]);

  // Timer for speed mode
  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mode === 'speed' && !loading && !error && questions.length > 0) {
      setTimeLeft(15);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // Use setTimeout to avoid state update during render
            // Ensure component is still mounted before calling handleNextQuestion
            // Note: handleNextQuestion should ideally be wrapped in useCallback or check mounted state
            setTimeout(() => handleNextQuestion(true), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mode, loading, error, questions.length]);

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
      const generatedQuestions = await generateQuiz(subject, topic, difficulty, studentAge, undefined, studentProfile);
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
    const currentQuestion = questions[currentQuestionIndex];
    const questionType = currentQuestion?.questionType || QuestionType.MultipleChoice;
    
    // Get the answer based on question type
    let answerToRecord: string;
    if (isTimeout) {
      answerToRecord = '';
    } else if (questionType === QuestionType.FillInBlank) {
      answerToRecord = fillInBlankAnswer.trim();
    } else if (questionType === QuestionType.Drawing) {
      answerToRecord = drawingData || 'No drawing submitted';
    } else if (questionType === QuestionType.Matching) {
      answerToRecord = matchingResult ? JSON.stringify(matchingResult.matches) : '';
    } else if (questionType === QuestionType.DragAndDrop) {
      answerToRecord = dragDropResult ? JSON.stringify(dragDropResult.placements) : '';
    } else {
      answerToRecord = selectedOption || '';
    }
    
    // Calculate time spent on this question
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    
    if (answerToRecord || isTimeout) {
      const newAnswers = [...selectedAnswers, answerToRecord];
      setSelectedAnswers(newAnswers);
      setSelectedOption(null);
      setFillInBlankAnswer('');
      setDrawingData(null);
      setMatchingCompleted(false);
      setMatchingResult(null);
      setDragDropCompleted(false);
      setDragDropResult(null);
      setQuestionStartTime(Date.now());

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentHint(''); // Clear hint for new question
      } else {
        // Final submission - check answers and record performance
        const results: QuizResult[] = questions.map((q, index) => {
          const userAnswer = newAnswers[index];
          let isCorrect: boolean;
          
          // Check correctness based on question type
          if (q.questionType === QuestionType.FillInBlank) {
            // Case-insensitive match, also check acceptable answers
            const normalizedAnswer = userAnswer.toLowerCase().trim();
            isCorrect = normalizedAnswer === q.correctAnswer.toLowerCase().trim() ||
              (q.acceptableAnswers?.some(a => a.toLowerCase().trim() === normalizedAnswer) ?? false);
          } else if (q.questionType === QuestionType.Drawing) {
            isCorrect = true; // Drawings are always marked as correct for now
          } else if (q.questionType === QuestionType.Matching) {
            // Check if matching was submitted and correct
            try {
              const matches = userAnswer ? JSON.parse(userAnswer) : {};
              isCorrect = q.matchingPairs?.every(pair => matches[pair.left] === pair.right) ?? false;
            } catch {
              isCorrect = false;
            }
          } else if (q.questionType === QuestionType.DragAndDrop) {
            // Check if drag-drop was submitted and correct
            try {
              const placements = userAnswer ? JSON.parse(userAnswer) : {};
              // For now, check if all placements match expected zones
              isCorrect = Object.keys(placements).length === (q.dragItems?.length ?? 0);
            } catch {
              isCorrect = false;
            }
          } else {
            isCorrect = isMultipleChoiceAnswerCorrect(q, userAnswer);
          }
          
          return {
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            userAnswer,
            isCorrect,
          };
        });
        
        // Record question performance for analytics
        recordQuizAttempts(
          results.map((r, idx) => ({
            id: r.id,
            question: r.question,
            isCorrect: r.isCorrect,
            timeToAnswer: idx === currentQuestionIndex ? timeSpent : undefined
          })),
          subject,
          topic,
          difficulty
        );
        
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

  const handleOptionSelect = (option: string) => {
    playClick();
    setSelectedOption(option);
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
    <div className="w-full max-w-3xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100" role="main">
      <div className="mb-4 sm:mb-6" role="status" aria-live="polite">
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
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{currentQuestion.question}</h3>
        </div>
        <div className="flex gap-2 ml-2 sm:ml-4">
          <button 
            onClick={() => isSpeaking ? cancel() : speak(currentQuestion.question)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            aria-label={isSpeaking ? "Stop reading" : "Read question"}
          >
            {isSpeaking ? <StopIcon className="h-6 w-6" /> : <SpeakerWaveIcon className="h-6 w-6" />}
          </button>
          {voiceSupported && (
            <button
              onClick={() => isListening ? stopListening() : startListening()}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'text-purple-500 hover:bg-purple-50'
              }`}
              aria-label={isListening ? "Stop voice input" : "Answer by voice"}
              title="Say 'A', 'B', 'C', or 'D' to select an answer"
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>
          )}
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

      {/* Voice Input Status */}
      {isListening && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3" />
            <p className="text-sm text-purple-700 font-medium">
              Listening... Say "A", "B", "C", or "D" to select an answer
            </p>
          </div>
          {interimTranscript && (
            <p className="text-xs text-purple-500 mt-1 italic">Hearing: "{interimTranscript}"</p>
          )}
        </div>
      )}

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

      {/* Question Type Badge */}
      {currentQuestion.questionType && currentQuestion.questionType !== QuestionType.MultipleChoice && (
        <div className="mb-4 flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            currentQuestion.questionType === QuestionType.TrueFalse 
              ? 'bg-purple-100 text-purple-700'
              : currentQuestion.questionType === QuestionType.FillInBlank
              ? 'bg-green-100 text-green-700'
              : currentQuestion.questionType === QuestionType.Matching
              ? 'bg-cyan-100 text-cyan-700'
              : currentQuestion.questionType === QuestionType.DragAndDrop
              ? 'bg-pink-100 text-pink-700'
              : 'bg-orange-100 text-orange-700'
          }`}>
            {currentQuestion.questionType === QuestionType.TrueFalse && '✓✗ True or False'}
            {currentQuestion.questionType === QuestionType.FillInBlank && '✏️ Fill in the Blank'}
            {currentQuestion.questionType === QuestionType.Ordering && '🔢 Put in Order'}
            {currentQuestion.questionType === QuestionType.Drawing && '🎨 Drawing Challenge'}
            {currentQuestion.questionType === QuestionType.Matching && '🔗 Match the Pairs'}
            {currentQuestion.questionType === QuestionType.DragAndDrop && '📦 Drag and Drop'}
          </span>
          {currentQuestion.cognitiveLevel && (
            <span className="text-xs text-gray-500 italic">
              ({currentQuestion.cognitiveLevel})
            </span>
          )}
        </div>
      )}

      {/* Multiple Choice / True-False Options */}
      {(currentQuestion.questionType === QuestionType.MultipleChoice || 
        currentQuestion.questionType === QuestionType.TrueFalse ||
        !currentQuestion.questionType) && currentQuestion.options && currentQuestion.options.length > 0 && (
        <div className="space-y-4" role="radiogroup" aria-label="Quiz answer options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              role="radio"
              aria-checked={selectedOption === option}
              aria-label={`Option: ${option}`}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-base sm:text-lg font-semibold
                ${selectedOption === option 
                  ? currentQuestion.questionType === QuestionType.TrueFalse
                    ? option === 'True'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white scale-105 shadow-lg shadow-green-500/40'
                      : 'bg-gradient-to-r from-red-500 to-red-600 border-red-600 text-white scale-105 shadow-lg shadow-red-500/40'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 text-white scale-105 shadow-lg shadow-blue-500/40'
                  : currentQuestion.questionType === QuestionType.TrueFalse
                    ? option === 'True'
                      ? 'bg-green-50 border-green-200 text-gray-700 hover:bg-green-100 hover:border-green-400 hover:shadow-md'
                      : 'bg-red-50 border-red-200 text-gray-700 hover:bg-red-100 hover:border-red-400 hover:shadow-md'
                    : 'bg-blue-50 border-blue-200 text-gray-700 hover:bg-blue-100 hover:border-blue-400 hover:shadow-md'
                }`}
            >
              {currentQuestion.questionType === QuestionType.TrueFalse && (
                <span className="mr-2">{option === 'True' ? '✓' : '✗'}</span>
              )}
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Fill in the Blank Input */}
      {currentQuestion.questionType === QuestionType.FillInBlank && (
        <div className="space-y-4">
          <div className="relative">
            <input
              ref={fillInBlankInputRef}
              type="text"
              value={fillInBlankAnswer}
              onChange={(e) => setFillInBlankAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && fillInBlankAnswer.trim()) {
                  handleNextQuestion(false);
                }
              }}
              placeholder="Type your answer here..."
              className="w-full p-4 text-lg border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-green-50"
              autoFocus
            />
            {fillInBlankAnswer && (
              <button
                onClick={() => setFillInBlankAnswer('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 text-center">
            💡 Type your answer and press Enter or click Next
          </p>
        </div>
      )}

      {/* Drawing Canvas */}
      {currentQuestion.questionType === QuestionType.Drawing && (
        <div className="space-y-4">
          <DrawingCanvas 
            onSave={(data) => setDrawingData(data)} 
            width={600} 
            height={400} 
          />
          <p className="text-sm text-gray-500 text-center">
            🎨 Draw your answer above and click Submit Drawing!
          </p>
        </div>
      )}

      {/* Matching Question */}
      {currentQuestion.questionType === QuestionType.Matching && currentQuestion.matchingPairs && (
        <MatchingQuestion
          pairs={currentQuestion.matchingPairs}
          onComplete={(isCorrect, matches) => {
            setMatchingCompleted(true);
            setMatchingResult({ isCorrect, matches });
          }}
        />
      )}

      {/* Drag and Drop Question */}
      {currentQuestion.questionType === QuestionType.DragAndDrop && currentQuestion.dragItems && currentQuestion.dropZones && (
        <DragDropQuestion
          items={currentQuestion.dragItems.map((content, idx) => ({
            id: `item-${idx}`,
            content,
            correctZoneId: currentQuestion.dropZones?.[idx] || `zone-${idx}`
          }))}
          zones={[...new Set(currentQuestion.dropZones)].map((label, idx) => ({
            id: label,
            label
          }))}
          onComplete={(isCorrect, placements) => {
            setDragDropCompleted(true);
            setDragDropResult({ isCorrect, placements });
          }}
        />
      )}

      <div className="mt-6 sm:mt-8 text-right">
        <button
          onClick={() => handleNextQuestion(false)}
          disabled={
            currentQuestion.questionType === QuestionType.FillInBlank 
              ? !fillInBlankAnswer.trim()
              : currentQuestion.questionType === QuestionType.Drawing
              ? !drawingData
              : currentQuestion.questionType === QuestionType.Matching
              ? !matchingCompleted
              : currentQuestion.questionType === QuestionType.DragAndDrop
              ? !dragDropCompleted
              : !selectedOption
          }
          aria-label={isLastQuestion ? 'Finish quiz and see results' : 'Go to next question'}
          aria-disabled={
            currentQuestion.questionType === QuestionType.FillInBlank 
              ? !fillInBlankAnswer.trim()
              : currentQuestion.questionType === QuestionType.Drawing
              ? !drawingData
              : currentQuestion.questionType === QuestionType.Matching
              ? !matchingCompleted
              : currentQuestion.questionType === QuestionType.DragAndDrop
              ? !dragDropCompleted
              : !selectedOption
          }
          className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 active:scale-95 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;
