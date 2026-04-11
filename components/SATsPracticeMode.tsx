import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  ChevronRight, 
  ChevronLeft,
  Flag,
  Save,
  Loader2
} from 'lucide-react';
import { BankQuestion, SATsSession, YearGroup, Difficulty } from '../types';
import { generateSATsQuiz, SATsPaperType } from '../services/geminiService';

// No static fallback - SATs always uses AI generation

interface SATsPracticeModeProps {
  onExit: () => void;
}

export const SATsPracticeMode: React.FC<SATsPracticeModeProps> = ({ onExit }) => {
  const [sessionState, setSessionState] = useState<'menu' | 'loading' | 'active' | 'review'>('menu');
  const [selectedPaper, setSelectedPaper] = useState<string>('arithmetic');
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [totalTime, setTotalTime] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reduced question counts for practice mode (full papers would be too long)
  const papers = [
    { id: 'arithmetic', name: 'Maths Paper 1: Arithmetic', time: 15, questions: 15, color: 'bg-blue-100 text-blue-800' },
    { id: 'reasoning1', name: 'Maths Paper 2: Reasoning', time: 20, questions: 10, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'reasoning2', name: 'Maths Paper 3: Reasoning', time: 20, questions: 10, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'reading', name: 'English Reading', time: 20, questions: 10, color: 'bg-green-100 text-green-800' },
    { id: 'spag', name: 'English GPS (SPaG)', time: 15, questions: 15, color: 'bg-amber-100 text-amber-800' },
  ];

  const startTest = async () => {
    const paper = papers.find(p => p.id === selectedPaper);
    if (!paper) return;

    setSessionState('loading');
    setGenerationError(null);

    try {
      // Map paper ID to SATs paper type
      let paperTypeForAI: SATsPaperType = 'arithmetic';
      
      if (selectedPaper === 'arithmetic') {
        paperTypeForAI = 'arithmetic';
      } else if (selectedPaper.startsWith('reasoning')) {
        paperTypeForAI = 'reasoning';
      } else if (selectedPaper === 'reading') {
        paperTypeForAI = 'reading';
      } else if (selectedPaper === 'spag') {
        paperTypeForAI = 'spag';
      }

      // Use the dedicated SATs generator (ALWAYS uses AI with DfE specs)
      console.log(`📝 Requesting SATs paper: ${paperTypeForAI} (${paper.questions} questions)`);
      const aiQuestions = await generateSATsQuiz(paperTypeForAI, paper.questions);
      console.log(`✅ Received ${aiQuestions.length} AI-generated SATs questions`);
      
      if (aiQuestions.length === 0) {
        throw new Error('No questions were generated');
      }
      
      // Transform to SATs format
      const satsQuestions = aiQuestions.map((q, index) => ({
        ...q,
        id: `sats-${selectedPaper}-${index}-${Date.now()}`,
        subject: paperTypeForAI === 'arithmetic' || paperTypeForAI === 'reasoning' ? 'Maths' : 'English',
        topic: paperTypeForAI,
        ageGroup: [10, 11],
        difficulty: Difficulty.Hard,
        yearGroup: YearGroup.Year6,
        satsMetadata: {
          paperType: selectedPaper as any,
          marks: 1,
          questionStyle: 'standard'
        }
      }));

      setQuestions(satsQuestions);
      setAnswers({});
      setFlaggedQuestions({});
      setCurrentQuestionIndex(0);
      setTotalTime(paper.time * 60);
      setTimeLeft(paper.time * 60);
      setSessionState('active');
    } catch (error: any) {
      console.error("Failed to generate SATs paper:", error);
      const errorMessage = error.message || "Unknown error occurred";
      setGenerationError(`Could not generate SATs paper: ${errorMessage}. Please check your internet connection and try again.`);
      setSessionState('menu');
    }
  };

  const submitTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSessionState('review');
  };

  useEffect(() => {
    if (sessionState === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    const currentQ = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: answer
    }));
  };

  const toggleFlag = () => {
    const currentQ = questions[currentQuestionIndex];
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score += q.satsMetadata?.marks || 1;
      }
    });
    return score;
  };

  const getScaledScore = (rawScore: number, totalMarks: number) => {
    // Rough approximation of KS2 scaled scores
    // 100 is the expected standard
    const percentage = (rawScore / totalMarks) * 100;
    if (percentage >= 85) return 110; // High score
    if (percentage >= 55) return 100; // Expected standard
    if (percentage >= 40) return 95;
    return 85;
  };

  // --- RENDER: LOADING ---
  if (sessionState === 'loading') {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Paper</h2>
          <p className="text-gray-600 mb-6">Creating a unique {papers.find(p => p.id === selectedPaper)?.name} using AI...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-2/3"></div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Aligning with DfE National Curriculum</p>
        </div>
      </div>
    );
  }

  // --- RENDER: MENU ---
  if (sessionState === 'menu') {
    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={onExit} className="mb-6 text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-600 p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Year 6 SATs Practice</h1>
              <p className="text-indigo-100">AI-generated practice papers aligned with DfE standards.</p>
            </div>

            <div className="p-8">
              {generationError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{generationError}</p>
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Paper</h2>
              <p className="text-sm text-gray-500 mb-4">Each paper is freshly generated using AI to match official DfE SATs format.</p>
              <div className="grid grid-cols-1 gap-4">
                {papers.map(paper => (
                  <button
                    key={paper.id}
                    onClick={() => setSelectedPaper(paper.id)}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      selectedPaper === paper.id 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${paper.color.replace('text-', 'bg-').replace('800', '200')}`}>
                        <FileText className={`w-6 h-6 ${paper.color.split(' ')[1]}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900">{paper.name}</h3>
                        <p className="text-sm text-gray-500">{paper.questions} Questions • {paper.time} Minutes</p>
                      </div>
                    </div>
                    {selectedPaper === paper.id && (
                      <CheckCircle className="w-6 h-6 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={startTest}
                  disabled={sessionState === 'loading'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sessionState === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Paper...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE TEST ---
  if (sessionState === 'active') {
    const currentQ = questions[currentQuestionIndex];
    const isFlagged = flaggedQuestions[currentQ.id];
    const hasAnswered = !!answers[currentQ.id];

    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">Question {currentQuestionIndex + 1} of {questions.length}</span>
            {hasAnswered && <span className="text-green-600 flex items-center gap-1 text-sm"><CheckCircle className="w-4 h-4" /> Answered</span>}
            {isFlagged && <span className="text-amber-500 flex items-center gap-1 text-sm"><Flag className="w-4 h-4 fill-current" /> Flagged</span>}
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={submitTest}
            className="text-sm text-gray-500 hover:text-red-600 underline"
          >
            Finish Test
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-6">
          <div className="bg-white rounded-xl shadow-sm p-8 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-medium text-gray-900">{currentQ.question}</h2>
              <button 
                onClick={toggleFlag}
                className={`p-2 rounded-full hover:bg-gray-100 ${isFlagged ? 'text-amber-500' : 'text-gray-300'}`}
                title="Flag for review"
              >
                <Flag className={`w-6 h-6 ${isFlagged ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQ.id] === option
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm ${
                      answers[currentQ.id] === option ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>

            <div className="flex gap-1 overflow-x-auto max-w-[50%] px-2 scrollbar-hide">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    currentQuestionIndex === idx 
                      ? 'bg-indigo-600 text-white' 
                      : flaggedQuestions[q.id]
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : answers[q.id]
                          ? 'bg-gray-200 text-gray-700'
                          : 'border border-gray-300 text-gray-500'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (currentQuestionIndex === questions.length - 1) {
                  submitTest();
                } else {
                  setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: REVIEW ---
  if (sessionState === 'review') {
    const score = calculateScore();
    const totalMarks = questions.reduce((acc, q) => acc + (q.satsMetadata?.marks || 1), 0);
    const scaledScore = getScaledScore(score, totalMarks);
    const percentage = Math.round((score / totalMarks) * 100);

    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-indigo-900 p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Test Complete</h2>
              <p className="opacity-80">Here is how you performed</p>
              
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">{score}/{totalMarks}</div>
                  <div className="text-sm opacity-70">Raw Score ({percentage}%)</div>
                </div>
                <div className="w-px bg-indigo-700"></div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-1 ${scaledScore >= 100 ? 'text-green-400' : 'text-amber-400'}`}>
                    {scaledScore}
                  </div>
                  <div className="text-sm opacity-70">Scaled Score</div>
                </div>
                <div className="w-px bg-indigo-700"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">{formatTime(totalTime - timeLeft)}</div>
                  <div className="text-sm opacity-70">Time Taken</div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Question Analysis</h3>
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const isCorrect = answers[q.id] === q.correctAnswer;
                  return (
                    <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-700">Q{idx + 1}</span>
                        {isCorrect 
                          ? <span className="text-green-700 text-sm font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Correct (+1 mark)</span>
                          : <span className="text-red-700 text-sm font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Incorrect (0 marks)</span>
                        }
                      </div>
                      <p className="text-gray-800 mb-2">{q.question}</p>
                      <div className="text-sm">
                        <span className="text-gray-500">Your answer: </span>
                        <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {answers[q.id] || 'Skipped'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="text-sm mt-1">
                          <span className="text-gray-500">Correct answer: </span>
                          <span className="font-medium text-green-700">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => setSessionState('menu')}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors"
                >
                  Back to Menu
                </button>
                <button
                  onClick={onExit}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
