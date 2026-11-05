import { Owl } from './sunny/Owl';
import { AnswerShape } from './sunny/AnswerShape';
import './SunnyQuizResults.css';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { type QuizQuestion, type Difficulty, type QuizResult, QuestionType } from '../types';
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
import { OrderingQuestion } from './OrderingQuestion';
import { resolveMultipleChoiceAnswer, getExpectedOrder, buildQuizResults } from '../services/quizScoring';
import { CURATED_LANGUAGES } from '../data/curriculumSequences';

interface QuizViewProps {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  studentAge: number;
  studentName?: string;
  onSubmit: (results: QuizResult[]) => void;
  mode?: 'standard' | 'speed';
  questionCount?: number;
}

const QuizView: React.FC<QuizViewProps> = ({ subject, topic, difficulty, studentAge, studentName, onSubmit, mode = 'standard', questionCount }) => {
  const { user } = useUser();

  // Build adaptive profile from current user's quiz history (already Firestore-synced via UserContext)
  const studentProfile = useMemo(() => {
    if (!user?.id) return undefined;
    return adaptiveLearningEngine.analyzeStudent(user.id);
  }, [user?.id, user?.quizHistory?.length]);
  // Detect if this is a language subject and extract the language
  const isLanguageSubject = (CURATED_LANGUAGES as readonly string[]).includes(subject);
  const detectedLanguage = isLanguageSubject ? subject : 'English';
  const { speak, cancel, isSpeaking } = useTTSEnhanced(detectedLanguage);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ result: QuizResult; timedOut: boolean } | null>(null);
  const [finished, setFinished] = useState(false);
  // Refs close the gap before React commits a render (rapid input / timeout races).
  const phaseRef = useRef<'answering' | 'checked' | 'finished'>('answering');
  const activeQuestionRef = useRef(0);
  const quizEpochRef = useRef(0);
  const resultsRef = useRef<QuizResult[]>([]);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInBlankAnswer, setFillInBlankAnswer] = useState<string>('');
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [matchingAnswer, setMatchingAnswer] = useState<Record<string, string>>({});
  const [sortingAnswer, setSortingAnswer] = useState<Record<string, string>>({});
  const [orderingAnswer, setOrderingAnswer] = useState<string[]>([]);
  const { playClick } = useGameSounds();
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerEnabled, setTimerEnabled] = useState(mode === 'speed');
  const [currentHint, setCurrentHint] = useState<string>('');
  const [isGettingHint, setIsGettingHint] = useState(false);
  const questionStartTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkHandlerRef = useRef<(isTimeout?: boolean, index?: number, epoch?: number) => void>(() => undefined);
  const nextHandlerRef = useRef<() => void>(() => undefined);
  const hintHandlerRef = useRef<() => void>(() => undefined);
  const questionTimesRef = useRef<number[]>([]);
  const lastProcessedTranscript = useRef<string>('');
  const fillInBlankInputRef = useRef<HTMLInputElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!loading && currentQuestionIndex > 0) questionHeadingRef.current?.focus();
  }, [loading, currentQuestionIndex]);

  // Voice input for hands-free quiz answering
  const handleVoiceCommand = useCallback((command: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    if (command === 'repeat') {
      speak(currentQuestion.question);
      return;
    }
    if (command === 'next' || command === 'submit') {
      // Repeated submit commands cannot turn checking into advancement.
      if (phaseRef.current === 'checked' && command === 'next') nextHandlerRef.current();
      else if (phaseRef.current === 'answering') checkHandlerRef.current();
      return;
    }
    if (phaseRef.current !== 'answering') return;
    const optionIndex = ['selectA', 'selectB', 'selectC', 'selectD'].indexOf(command);
    if (optionIndex >= 0 && currentQuestion.options[optionIndex]) {
      setSelectedOption(currentQuestion.options[optionIndex]);
      playClick();
    } else if (command === 'hint') hintHandlerRef.current();
  }, [questions, currentQuestionIndex, playClick, speak]);

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
    if (transcript && transcript !== lastProcessedTranscript.current) {
      lastProcessedTranscript.current = transcript;
      if (phaseRef.current !== 'answering' || !questions[currentQuestionIndex]) return;
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

  useEffect(() => {
    if (feedback) {
      cancel();
      stopListening?.();
      feedbackRef.current?.focus();
    }
  }, [feedback, cancel, stopListening]);

  // Only an opted-in, unanswered question can run a timer. Capture its identity
  // so a stale tick can never submit the following question.
  useEffect(() => {
    if (mode !== 'speed' || !timerEnabled || loading || error || !questions.length || feedback || finished) return;
    const index = currentQuestionIndex;
    const epoch = quizEpochRef.current;
    remainingTimeRef.current = 15;
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      if (phaseRef.current !== 'answering' || activeQuestionRef.current !== index || quizEpochRef.current !== epoch) return;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - 1);
      setTimeLeft(remainingTimeRef.current);
      if (remainingTimeRef.current === 0) checkHandlerRef.current(true, index, epoch);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [mode, timerEnabled, loading, error, questions.length, currentQuestionIndex, feedback, finished]);

  // Stop speaking when question changes
  useEffect(() => {
    cancel();
  }, [currentQuestionIndex, cancel]);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentQuestionIndex(0);
    quizEpochRef.current += 1;
    phaseRef.current = 'answering';
    activeQuestionRef.current = 0;
    resultsRef.current = [];
    setFeedback(null);
    setFinished(false);
    setFillInBlankAnswer('');
    setDrawingData(null);
    setMatchingAnswer({});
    setSortingAnswer({});
    setCurrentHint('');
    setSelectedOption(null);
    setOrderingAnswer([]);
    setTimerEnabled(mode === 'speed');
    setTimeLeft(15);
    questionTimesRef.current = [];
    questionStartTimeRef.current = Date.now();
    try {
      const generatedQuestions = await generateQuiz(subject, topic, difficulty, studentAge, undefined, studentProfile);
      if (!generatedQuestions || generatedQuestions.length === 0) {
        setError('We couldn\'t create quiz questions right now. Please try again.');
      } else {
        questionStartTimeRef.current = Date.now();
        setQuestions(questionCount ? generatedQuestions.slice(0, questionCount) : generatedQuestions);
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
  }, [subject, topic, difficulty, studentAge, studentProfile, mode, questionCount]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const currentQuestion = questions[currentQuestionIndex];
  const questionType = currentQuestion?.questionType || QuestionType.MultipleChoice;
  const canCheck = questionType === QuestionType.FillInBlank ? Boolean(fillInBlankAnswer.trim())
    : questionType === QuestionType.Drawing ? Boolean(drawingData)
    : questionType === QuestionType.Matching ? Object.keys(matchingAnswer).length === currentQuestion?.matchingPairs?.length
    : questionType === QuestionType.DragAndDrop ? Object.keys(sortingAnswer).length === currentQuestion?.dragItems?.length
    : questionType === QuestionType.Ordering ? orderingAnswer.length === currentQuestion?.options.length
    : Boolean(selectedOption);

  const handleCheckAnswer = (isTimeout = false, index = currentQuestionIndex, epoch = quizEpochRef.current) => {
    if (phaseRef.current !== 'answering' || index !== activeQuestionRef.current || epoch !== quizEpochRef.current ||
        !currentQuestion || loading || error || (!isTimeout && !canCheck)) return;
    phaseRef.current = 'checked';
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    const answer = isTimeout ? ''
      : questionType === QuestionType.FillInBlank ? fillInBlankAnswer.trim()
      // Keep canvas data local, as before.
      : questionType === QuestionType.Drawing ? 'Drawing submitted'
      : questionType === QuestionType.Matching ? JSON.stringify(matchingAnswer)
      : questionType === QuestionType.DragAndDrop ? JSON.stringify(sortingAnswer)
      : questionType === QuestionType.Ordering ? JSON.stringify(orderingAnswer)
      : selectedOption || '';
    const result = buildQuizResults([currentQuestion], [answer])[0];
    resultsRef.current[currentQuestionIndex] = result;
    questionTimesRef.current[currentQuestionIndex] = (Date.now() - questionStartTimeRef.current) / 1000;
    setFeedback({ result, timedOut: isTimeout });
  };

  const handleNextQuestion = () => {
    if (phaseRef.current !== 'checked' || activeQuestionRef.current !== currentQuestionIndex) return;
    if (currentQuestionIndex === questions.length - 1) {
      phaseRef.current = 'finished';
      setFinished(true);
      // The existing completion pipeline receives the results already scored at Check.
      const results = [...resultsRef.current];
      recordQuizAttempts(results.map((r, idx) => ({
        id: r.id, question: r.question, isCorrect: r.isCorrect, timeToAnswer: questionTimesRef.current[idx]
      })), subject, topic, difficulty);
      onSubmit(results);
      return;
    }
    phaseRef.current = 'answering';
    activeQuestionRef.current = currentQuestionIndex + 1;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setFeedback(null);
    setSelectedOption(null);
    setFillInBlankAnswer('');
    setDrawingData(null);
    setMatchingAnswer({});
    setSortingAnswer({});
    setOrderingAnswer([]);
    setCurrentHint('');
    questionStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    checkHandlerRef.current = handleCheckAnswer;
    nextHandlerRef.current = handleNextQuestion;
    hintHandlerRef.current = handleGetHint;
  });

  // A stable callback is essential: OrderingQuestion uses it to initialise its list.
  const handleOrderingChange = useCallback((answer: string[]) => {
    if (phaseRef.current === 'answering') setOrderingAnswer(answer);
  }, []);
  const blockLockedInput = (event: React.SyntheticEvent) => {
    if (phaseRef.current !== 'answering') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleGetHint = async () => {
    if (!currentQuestion || isGettingHint || phaseRef.current !== 'answering') return;
    const index = currentQuestionIndex;
    const epoch = quizEpochRef.current;
    const stillAnswering = () => activeQuestionRef.current === index && quizEpochRef.current === epoch && phaseRef.current === 'answering';

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
      if (stillAnswering()) setCurrentHint(hint);
    } catch (error) {
      console.error('Error getting hint:', error);
      if (stillAnswering()) setCurrentHint("I'm having trouble thinking of a hint right now. Try reading the question again carefully!");
    } finally {
      setIsGettingHint(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (phaseRef.current !== 'answering') return;
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

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const correctAnswer = questionType === QuestionType.Matching
    ? currentQuestion.matchingPairs?.map(pair => `${pair.left} → ${pair.right}`).join('; ')
    : questionType === QuestionType.DragAndDrop
    ? currentQuestion.dragItems?.map((item, index) => `${item} → ${currentQuestion.dropZones?.[index]}`).join('; ')
    : questionType === QuestionType.Ordering ? getExpectedOrder(currentQuestion).join(' → ')
    : questionType === QuestionType.FillInBlank ? currentQuestion.correctAnswer
    : resolveMultipleChoiceAnswer(currentQuestion);

  return (
    <section className="sunny-quiz sunny-ui w-full max-w-3xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100" aria-label={`${subject} ${topic} quiz`}>
      <div className="sunny-quiz-session-progress mb-4 sm:mb-6" role="status" aria-live="polite">
        <div className="sunny-quiz-progress-label"><p className="text-sm font-bold text-blue-600 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>{(mode !== 'speed' || !timerEnabled) && <span>No timer</span>}</div>
        <ol className="sunny-quiz-dots" aria-hidden="true">{questions.map((_, index) => <li key={index} data-state={index < currentQuestionIndex ? 'done' : index === currentQuestionIndex ? 'current' : 'new'}>{index < currentQuestionIndex ? '✓' : ''}</li>)}</ol>
        <div className="sr-only" role="progressbar" aria-label="Quiz progress" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>
      <div className="sunny-quiz-question flex justify-between items-start mb-6">
        <Owl pose={feedback ? feedback.result.isCorrect ? 'hooray' : 'wave' : 'thinking'} height={140} />
        <div className="flex-grow">
          {mode === 'speed' && (
            <div className="mb-3 rounded-xl bg-orange-50 p-3 text-orange-700">
              <div className="flex flex-wrap items-center gap-3 font-bold">
                <span>⚡ Speed Challenge</span>
                <span className={`text-2xl ${timerEnabled && timeLeft <= 5 ? 'text-red-600' : ''}`} aria-live="polite">
                  {timerEnabled ? `${timeLeft}s` : 'No time limit'}
                </span>
                {timerEnabled && (
                  <button type="button" disabled={Boolean(feedback)} onClick={() => { remainingTimeRef.current += 30; setTimeLeft(remainingTimeRef.current); }} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm hover:bg-orange-100">
                    +30 seconds
                  </button>
                )}
                <button type="button" disabled={Boolean(feedback)} onClick={() => setTimerEnabled((enabled) => !enabled)} className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm hover:bg-orange-100">
                  {timerEnabled ? 'Turn off timer' : 'Turn timer on'}
                </button>
              </div>
            </div>
          )}
          <div className="sunny-quiz-subject"><span>{subject}</span><span>{topic}</span></div>
          <h1 ref={questionHeadingRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-gray-800">{currentQuestion.question}</h1>
        </div>
        <div className="sunny-quiz-tools flex gap-2 ml-2 sm:ml-4">
          <button
            onClick={() => isSpeaking ? cancel() : speak(currentQuestion.question)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            aria-label={isSpeaking ? "Stop reading" : "Read question"}
          >
            {isSpeaking ? <StopIcon className="h-6 w-6" /> : <SpeakerWaveIcon className="h-6 w-6" />}<span>{isSpeaking ? 'Stop' : 'Read question'}</span>
          </button>
          {voiceSupported && (
            <button
              disabled={Boolean(feedback)} onClick={() => isListening ? stopListening() : startListening()}
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
            disabled={isGettingHint || Boolean(feedback)}
            className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors disabled:opacity-50"
            aria-label="Get a hint"
            title="Get a helpful hint (won't give away the answer)"
          >
            <LightBulbIcon className="h-6 w-6" /><span>Hint</span>
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
        <div className="sunny-quiz-hint mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
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

      <fieldset key={currentQuestionIndex} className="sunny-quiz-inputs" aria-label="Your answer" disabled={Boolean(feedback) || finished}
        onClickCapture={blockLockedInput} onPointerDownCapture={blockLockedInput} onPointerMoveCapture={blockLockedInput}
        onKeyDownCapture={blockLockedInput} onDropCapture={blockLockedInput} onDragStartCapture={blockLockedInput}>
      {/* Multiple Choice / True-False Options */}
      {(currentQuestion.questionType === QuestionType.MultipleChoice ||
        currentQuestion.questionType === QuestionType.TrueFalse ||
        !currentQuestion.questionType) && currentQuestion.options && currentQuestion.options.length > 0 && (
        <div className="sunny-answer-grid" role="radiogroup" aria-label="Quiz answer options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              role="radio"
              aria-checked={selectedOption === option}
              aria-label={`Option: ${option}`}
              tabIndex={selectedOption === option || (!selectedOption && index === 0) ? 0 : -1}
              onKeyDown={(event) => {
                const offsets: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
                if (!(event.key in offsets) && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                const options = currentQuestion.options;
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
                  : (index + offsets[event.key] + options.length) % options.length;
                handleOptionSelect(options[next]);
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
              }}
              className={`sunny-quiz-answer w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-base sm:text-lg font-semibold
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
              <AnswerShape index={index} />
              <span className="sunny-quiz-answer-value">
              {currentQuestion.questionType === QuestionType.TrueFalse && (
                <span className="mr-2">{option === 'True' ? '✓' : '✗'}</span>
              )}
              {option}</span>
              {selectedOption === option && <span className="sunny-quiz-answer-status">Your answer</span>}
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
              aria-label="Your answer"
              type="text"
              value={fillInBlankAnswer}
              onChange={(e) => { if (phaseRef.current === 'answering') setFillInBlankAnswer(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!e.repeat && fillInBlankAnswer.trim()) handleCheckAnswer();
                }
              }}
              placeholder="Type your answer here..."
              className="w-full p-4 text-lg border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-green-50"
              autoFocus
            />
            {fillInBlankAnswer && (
              <button
                aria-label="Clear answer"
                onClick={() => setFillInBlankAnswer('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 text-center">
            💡 Type your answer and press Enter or click Check answer
          </p>
        </div>
      )}

      {/* Drawing Canvas */}
      {currentQuestion.questionType === QuestionType.Drawing && (
        <div className="space-y-4">
          <DrawingCanvas
            idea={currentQuestion.question}
            onSave={(data) => { if (phaseRef.current === 'answering') setDrawingData(data); }}
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
          deferCheck
          onChange={(answer) => { if (phaseRef.current === 'answering') setMatchingAnswer(answer); }}
          onComplete={() => undefined}
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
          zones={[...new Set(currentQuestion.dropZones)].map((label, _idx) => ({
            id: label,
            label
          }))}
          deferCheck
          onChange={(answer) => { if (phaseRef.current === 'answering') setSortingAnswer(answer); }}
          onComplete={() => undefined}
        />
      )}

      {/* Ordering Question */}
      {currentQuestion.questionType === QuestionType.Ordering && currentQuestion.options.length > 0 && (
        <OrderingQuestion items={currentQuestion.options} onChange={handleOrderingChange} />
      )}

      </fieldset>
      {feedback && (
        <div ref={feedbackRef} className="sunny-quiz-feedback" data-correct={feedback.result.isScored === false ? undefined : feedback.result.isCorrect}
          role="status" aria-label="Answer feedback" aria-live="polite" aria-atomic="true" tabIndex={-1}>
          <Owl pose={feedback.result.isCorrect ? 'hooray' : 'wave'} height={80} />
          <div>
            <strong><span aria-hidden="true">{feedback.timedOut ? '→' : feedback.result.isScored === false ? '✓' : feedback.result.isCorrect ? '✓' : '→'} </span>
              {feedback.timedOut ? "Time’s up" : feedback.result.isScored === false ? 'Creative task complete' : feedback.result.isCorrect ? "Hooray! That's correct" : 'Worth another look'}</strong>
            {currentQuestion.explanation && <p>{currentQuestion.explanation}</p>}
            {feedback.result.isScored === false ? <p>Creative tasks are not part of your quiz score.</p>
              : !feedback.result.isCorrect && <p>Correct answer: {correctAnswer}</p>}
          </div>
        </div>
      )}
      <div className="sunny-quiz-submit mt-6 sm:mt-8 text-right">
        <button
          onClick={(event) => {
            if (event.detail > 1) return;
            if (feedback) handleNextQuestion();
            else handleCheckAnswer();
          }}
          onKeyDown={(event) => {
            if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
          }}
          disabled={finished || (!feedback && !canCheck)}
          className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 active:scale-95 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
        >
          {feedback ? isLastQuestion ? 'Finish Quiz' : 'Next question' : 'Check answer'}
        </button>
      </div>
    </section>
  );
};

export default QuizView;
