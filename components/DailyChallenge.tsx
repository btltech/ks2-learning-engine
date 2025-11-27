/**
 * Daily Challenge Component
 * 
 * Displays the daily challenge and achievements on the home screen
 */

import React, { useState, useEffect } from 'react';
import { dailyChallengeService, DailyChallenge, Achievement } from '../services/dailyChallengeService';
import { useUser } from '../context/UserContext';

interface DailyChallengeCardProps {
  onStartChallenge: (challenge: DailyChallenge) => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({ onStartChallenge }) => {
  const { currentChild } = useUser();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);

  useEffect(() => {
    // Get or generate today's challenge
    let todayChallenge = dailyChallengeService.getTodaysChallenge();
    if (!todayChallenge) {
      // Generate new challenge if none exists
      const age = currentChild?.age || 9; // Default KS2 age
      todayChallenge = dailyChallengeService.generateTodaysChallenge(age);
    }
    setChallenge(todayChallenge);
  }, [currentChild?.id, currentChild?.age]);

  const handleStartChallenge = () => {
    if (challenge) {
      onStartChallenge(challenge);
    }
  };

  if (!challenge) {
    return null;
  }

  const isCompleted = challenge.isCompleted;

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mobile-lg:rounded-3xl p-5 sm:p-6 text-white shadow-lg touch-only-shadow mb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <h3 className="text-lg font-bold">Daily Challenge</h3>
          </div>
          <p className="text-amber-100 mb-3">Complete today's {challenge.subject} quiz on {challenge.topic}!</p>
        </div>
        <div className="bg-white/20 rounded-lg px-3 py-1">
          <span className="text-sm font-medium">+{challenge.bonusPoints} pts</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>{challenge.subject} - {challenge.topic}</span>
          <span>Target: {challenge.targetScore}%</span>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: isCompleted ? '100%' : '0%' }}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 bg-white/20 rounded-lg py-3 px-3 mobile:px-4">
            <span className="text-xl">✅</span>
            <span className="font-medium">Challenge Complete! Score: {challenge.scoreAchieved}%</span>
          </div>
        ) : (
          <button
            onClick={handleStartChallenge}
            className="w-full bg-white text-orange-600 font-bold rounded-lg hover:bg-amber-50 transition-colors touch-target shadow-subtle hover:shadow-lifted"
          >
            Start Challenge
          </button>
        )}
      </div>

      {/* Achievement Popup */}
      {showAchievement && newAchievements.length > 0 && (
        <AchievementPopup 
          achievement={newAchievements[0]} 
          onClose={() => {
            setShowAchievement(false);
            setNewAchievements(prev => prev.slice(1));
          }}
        />
      )}
    </div>
  );
};

// Achievement Popup Component
interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center transform animate-bounceIn">
        <div className="text-6xl mb-4">{achievement.icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
        <p className="text-lg font-medium text-gray-700 mb-1">{achievement.name}</p>
        <p className="text-gray-500 mb-4">{achievement.description}</p>
        <div className="bg-amber-100 text-amber-700 rounded-lg py-2 px-4 inline-block">
          +{achievement.bonusPoints} bonus points
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

// Achievements Gallery Component
interface AchievementsGalleryProps {
  onClose: () => void;
}

export const AchievementsGallery: React.FC<AchievementsGalleryProps> = ({ onClose }) => {
  const { currentChild } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(dailyChallengeService.getAllAchievements());
  }, [currentChild?.id]);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.bonusPoints, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">🏆 Achievements</h2>
              <p className="text-purple-200">
                {unlockedCount}/{achievements.length} unlocked • {totalPoints} bonus points
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto p-6 touch-scroll">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  achievement.isUnlocked
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className={`text-4xl mb-2 ${!achievement.isUnlocked && 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  {achievement.name}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {achievement.description}
                </p>
                {achievement.isUnlocked ? (
                  <span className="text-xs text-purple-600 font-medium">
                    +{achievement.bonusPoints} pts
                  </span>
                ) : (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full"
                        style={{ 
                          width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {achievement.currentProgress}/{achievement.requirement}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Streak Milestone Component
export const StreakMilestone: React.FC<{ streak: number }> = ({ streak }) => {
  const milestone = dailyChallengeService.getNextStreakMilestone(streak);
  
  if (!milestone) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-red-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-bold">{streak} Day Streak!</p>
            <p className="text-sm text-amber-100">You're on fire! Maximum streak achieved!</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = (streak / milestone.days) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-bold">{streak} Day Streak</span>
        </div>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">
          {milestone.icon} {milestone.name} in {milestone.days - streak} days
        </span>
      </div>
      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-orange-100 mt-2">
        +{milestone.bonusPoints} bonus points at {milestone.days} days!
      </p>
    </div>
  );
};

// Add CSS animations
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-bounceIn {
  animation: bounceIn 0.5s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
