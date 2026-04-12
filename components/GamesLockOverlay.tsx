/**
 * Games Lock Overlay Component
 * 
 * Shows a locked state for Mini Games with progress toward unlocking
 */

import React from 'react';

interface GamesLockOverlayProps {
  requiredCorrect: number;
  totalQuestions: number;
  passesCount: number;
  requiredPasses: number;
  lastQuiz?: { correct: number; total: number; passed: boolean; at: string };
  onClick?: () => void;
}

export const GamesLockOverlay: React.FC<GamesLockOverlayProps> = ({
  requiredCorrect,
  totalQuestions,
  passesCount,
  requiredPasses,
  lastQuiz,
  onClick,
}) => {
  const thresholdPercent = Math.round((requiredCorrect / totalQuestions) * 100);
  const lastPercent = lastQuiz ? Math.round((lastQuiz.correct / Math.max(1, lastQuiz.total)) * 100) : 0;
  const quizzesLeft = requiredPasses - passesCount;

  return (
    <div 
      className="relative cursor-pointer group"
      onClick={onClick}
    >
      {/* Locked card appearance */}
      <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl p-4 text-white shadow-lg 
                      transform transition-all duration-200 group-hover:scale-102 group-hover:shadow-xl
                      border-2 border-dashed border-gray-300">
        {/* Lock icon */}
        <div className="text-center mb-2">
          <span className="text-4xl filter grayscale opacity-50">🎮</span>
          <div className="absolute top-2 right-2">
            <span className="text-2xl">🔒</span>
          </div>
        </div>
        
        <h3 className="font-bold text-lg text-center mb-2">Mini Games</h3>
        
        {/* Progress section */}
        <div className="space-y-2">
          <p className="text-sm text-center text-gray-100">
            Pass {requiredPasses} quizzes ({thresholdPercent}%+ each) to unlock games!
          </p>

          {/* Star/step progress */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: requiredPasses }).map((_, i) => (
              <span key={i} className={`text-xl ${i < passesCount ? 'text-yellow-300' : 'text-gray-600'}`}>
                {i < passesCount ? '★' : '☆'}
              </span>
            ))}
          </div>

          <p className="text-xs text-center text-gray-200 font-medium">
            {passesCount}/{requiredPasses} passing {passesCount === 1 ? 'quiz' : 'quizzes'} — {quizzesLeft} more to go!
          </p>

          {/* Last quiz score bar */}
          {lastQuiz && (
            <>
              <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${lastPercent}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-200">
                Last quiz: {lastQuiz.correct}/{lastQuiz.total} ({lastPercent}%)
                {lastQuiz.passed ? ' ✓' : ' ✗'}
              </p>
            </>
          )}
        </div>
        
        {/* Motivational message */}
        <p className="text-xs text-center mt-2 text-yellow-200 font-medium">
          {passesCount > 0
            ? quizzesLeft === 1
              ? "One more to go — you can do it! 🌟"
              : `Great work! Keep going — ${quizzesLeft} more passing quizzes needed.`
            : lastQuiz && !lastQuiz.passed
              ? lastPercent >= thresholdPercent - 10
                ? "So close! Try again — you've got this!"
                : "Keep going — take a quiz and score 70%+ to progress."
              : 'Start a quiz to earn games! 🎯'}
        </p>
      </div>
    </div>
  );
};

/**
 * Compact version for smaller layouts
 */
export const GamesLockBadge: React.FC<{
  passesCount: number;
  requiredPasses: number;
}> = ({ passesCount, requiredPasses }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm">
      <span>🔒</span>
      <div className="w-16 bg-gray-300 rounded-full h-2">
        <div 
          className="h-full bg-yellow-400 rounded-full transition-all"
          style={{ width: `${Math.min(100, (passesCount / requiredPasses) * 100)}%` }}
        />
      </div>
      <span className="text-gray-600 font-medium">{passesCount}/{requiredPasses} quizzes</span>
    </div>
  );
};

/**
 * Celebration animation when games unlock
 */
export const GamesUnlockedCelebration: React.FC<{
  onDismiss: () => void;
  onGoToGames: () => void;
}> = ({ onDismiss, onGoToGames }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
    >
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl transform animate-bounce-in max-w-sm mx-4">
        <div className="text-6xl mb-4 animate-pulse">🎮🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Games Unlocked!</h2>
        <p className="text-gray-600 mb-6">
          Amazing work! You passed 3 quizzes and earned 2 game plays. Ready to play?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onDismiss}
            className="bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-semibold
                       hover:bg-gray-200 transition-all"
          >
            Maybe Later
          </button>
          <button
            onClick={onGoToGames}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold
                       hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            Play Now! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
