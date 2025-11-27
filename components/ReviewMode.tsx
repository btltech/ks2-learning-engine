/**
 * Review Mode Component
 * 
 * Implements spaced repetition review sessions
 */

import React, { useState, useEffect } from 'react';
import { spacedRepetitionService, ReviewItem } from '../services/spacedRepetitionService';
import { useUser } from '../context/UserContext';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';

interface ReviewModeProps {
  onComplete: (results: ReviewResults) => void;
  onClose: () => void;
}

interface ReviewResults {
  totalReviewed: number;
  correctCount: number;
  incorrectCount: number;
  averageQuality: number;
}

interface ReviewSession {
  items: ReviewItem[];
  currentIndex: number;
  results: { itemId: string; quality: number }[];
}

export const ReviewMode: React.FC<ReviewModeProps> = ({ onComplete, onClose }) => {
  const { currentChild, addPoints } = useUser();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    initializeReview();
  }, [currentChild?.id]);

  const initializeReview = async () => {
    setLoading(true);
    
    // Get items due for review
    const dueItems = spacedRepetitionService.getDueItems().slice(0, 10);
    
    if (dueItems.length === 0) {
      // No items to review
      setSession(null);
      setLoading(false);
      return;
    }

    setSession({
      items: dueItems,
      currentIndex: 0,
      results: [],
    });

    // Generate question for first item
    await generateQuestion(dueItems[0]);
    setLoading(false);
  };

  const generateQuestion = async (item: ReviewItem) => {
    try {
      // Generate a question based on the stored question text
      const questions = await generateQuiz(
        item.subject,
        item.topic,
        'Medium' as any,
        1
      );
      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
      }
    } catch (error) {
      console.error('Error generating review question:', error);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // Record the review
    if (session) {
      const item = session.items[session.currentIndex];
      const quality = correct ? 4 : 1; // SM-2 quality scale
      
      spacedRepetitionService.recordReview(
        item.id,
        quality
      );

      // Award points for correct answer
      if (correct) {
        addPoints(5);
      }

      setSession({
        ...session,
        results: [...session.results, { itemId: item.id, quality }],
      });
    }
  };

  const handleNext = async () => {
    if (!session) return;

    const nextIndex = session.currentIndex + 1;
    
    if (nextIndex >= session.items.length) {
      // Review complete
      const correctCount = session.results.filter(r => r.quality >= 3).length;
      const averageQuality = session.results.reduce((sum, r) => sum + r.quality, 0) / session.results.length;
      
      onComplete({
        totalReviewed: session.results.length,
        correctCount,
        incorrectCount: session.results.length - correctCount,
        averageQuality,
      });
      return;
    }

    // Move to next item
    setSession({
      ...session,
      currentIndex: nextIndex,
    });
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentQuestion(null);
    
    await generateQuestion(session.items[nextIndex]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading your review items...</p>
        </div>
      </div>
    );
  }

  // No items to review
  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-6">
            You have no items due for review right now. Keep learning and come back later!
          </p>
          <button
            onClick={onClose}
            className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700"
          >
            Back to Learning
          </button>
        </div>
      </div>
    );
  }

  const currentItem = session.items[session.currentIndex];
  const progress = ((session.currentIndex + 1) / session.items.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col z-50">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">📚 Review Mode</h2>
            <p className="text-purple-200 text-sm">
              {currentItem.subject} - {currentItem.topic}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              {session.currentIndex + 1} / {session.items.length}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Review interval info */}
          <div className="bg-white/10 rounded-lg p-3 mb-4 text-purple-200 text-sm">
            <span className="mr-2">🔄</span>
            Review #{currentItem.repetitions + 1} • 
            Last seen: {currentItem.lastReview 
              ? new Date(currentItem.lastReview).toLocaleDateString() 
              : 'Never'}
          </div>

          {currentQuestion ? (
            <>
              {/* Question */}
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-xl">
                <p className="text-lg text-gray-900">{currentQuestion.question}</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let buttonClass = "w-full p-4 rounded-xl text-left transition-all ";
                  
                  if (showResult) {
                    if (index === currentQuestion.correctAnswer) {
                      buttonClass += "bg-green-500 text-white";
                    } else if (index === selectedAnswer && !isCorrect) {
                      buttonClass += "bg-red-500 text-white";
                    } else {
                      buttonClass += "bg-white/50 text-gray-500";
                    }
                  } else if (selectedAnswer === index) {
                    buttonClass += "bg-purple-600 text-white";
                  } else {
                    buttonClass += "bg-white text-gray-900 hover:bg-purple-100";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <span className="font-bold mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Result & Explanation */}
              {showResult && (
                <div className={`mt-4 p-4 rounded-xl ${
                  isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 text-white mb-2">
                    <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                    <span className="font-bold">
                      {isCorrect ? 'Correct!' : 'Not quite right'}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/10 rounded-2xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full mx-auto" />
              <p className="text-purple-200 mt-4">Loading question...</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Next Button */}
      {showResult && (
        <div className="bg-white/10 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleNext}
              className="w-full bg-white text-purple-900 font-bold py-4 rounded-xl hover:bg-purple-100 transition-colors"
            >
              {session.currentIndex + 1 >= session.items.length 
                ? 'Finish Review' 
                : 'Next Question →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Review Summary Component
interface ReviewSummaryProps {
  results: ReviewResults;
  onClose: () => void;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ results, onClose }) => {
  const percentage = Math.round((results.correctCount / results.totalReviewed) * 100);
  
  let message = '';
  let emoji = '';
  
  if (percentage >= 90) {
    message = "Outstanding! Your memory is incredible!";
    emoji = '🌟';
  } else if (percentage >= 70) {
    message = "Great job! You're retaining well!";
    emoji = '🎉';
  } else if (percentage >= 50) {
    message = "Good effort! Keep practicing!";
    emoji = '👍';
  } else {
    message = "Don't worry! Practice makes perfect!";
    emoji = '💪';
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Complete!</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{results.totalReviewed}</div>
            <div className="text-sm text-gray-500">Reviewed</div>
          </div>
          <div className="bg-green-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600">{results.correctCount}</div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          <div className="bg-red-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-600">{results.incorrectCount}</div>
            <div className="text-sm text-gray-500">To Review</div>
          </div>
        </div>

        <div className="bg-purple-100 rounded-xl p-4 mb-6">
          <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
          <div className="text-sm text-purple-600">Accuracy</div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

// Items Due Badge Component
export const ReviewDueBadge: React.FC<{ userId: string; onClick: () => void }> = ({ userId, onClick }) => {
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const count = spacedRepetitionService.getDueItems().length;
    setDueCount(count);
  }, [userId]);

  if (dueCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
    >
      <span>📚</span>
      <span>{dueCount} items to review</span>
    </button>
  );
};
