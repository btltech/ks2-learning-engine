/**
 * Guided Home View Component
 * 
 * Simplified home screen for younger students (ages 7-8)
 * Features:
 * - Larger buttons and text
 * - Fewer options
 * - More visual cues
 * - Encouraging messages
 */

import React from 'react';
import { Subject, ProgressData } from '../types';
import { useUser } from '../context/UserContext';
import { DailyChallengeCard } from './DailyChallenge';
import { GamesLockOverlay } from './GamesLockOverlay';
import { DailyChallenge } from '../services/dailyChallengeService';
import { SUBJECTS } from '../constants';

interface GamesUnlockStatus {
  isUnlocked: boolean;
  gamesRemaining: number;
  requiredCorrect: number;
  totalQuestions: number;
  lastQuiz?: { correct: number; total: number; passed: boolean; at: string };
}

interface GuidedHomeViewProps {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyChallenge: (challenge: DailyChallenge) => void;
  onOpenMiniGames?: () => void;
  onOpenAchievements: () => void;
  onOpenAvatarCustomization?: () => void;
  progress: ProgressData;
  gamesUnlockStatus?: GamesUnlockStatus;
}

// Simplified subject list for guided mode
const GUIDED_SUBJECTS = ['Maths', 'English', 'Science'];

const GuidedHomeView: React.FC<GuidedHomeViewProps> = ({
  onSelectSubject,
  onStartDailyChallenge,
  onOpenMiniGames,
  onOpenAchievements,
  onOpenAvatarCustomization,
  progress,
  gamesUnlockStatus,
}) => {
  const { user } = useUser();
  const streak = user?.streak || 0;

  // Filter subjects for guided mode
  const guidedSubjects = SUBJECTS.filter(s => 
    GUIDED_SUBJECTS.includes(s.name)
  );

  return (
    <div className="w-full max-w-lg mx-auto p-6" id="main-content">
      {/* Big Welcome Message */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hi, {user?.name || 'Friend'}!
        </h1>
        <p className="text-xl text-gray-600">
          Ready to learn today?
        </p>
        
        {streak > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-400 px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg">
            <span className="text-2xl">🔥</span>
            <span>{streak} day streak!</span>
          </div>
        )}
      </div>

      {/* Daily Challenge - Big and Prominent */}
      <div className="mb-8">
        <DailyChallengeCard onStartChallenge={onStartDailyChallenge} />
      </div>

      {/* Subject Selection - Large Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          📚 Pick a Subject
        </h2>
        <div className="space-y-3">
          {guidedSubjects.map((subject) => {
            const subjectProgress = progress[subject.name] || {};
            const topicCount = Object.keys(subjectProgress).length;
            
            return (
              <button
                key={subject.name}
                onClick={() => onSelectSubject(subject)}
                className={`w-full p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md ${subject.bgColor}`}
                aria-label={`Study ${subject.name}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/30 flex items-center justify-center">
                    <subject.icon className={`w-10 h-10 ${subject.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-800">{subject.name}</p>
                    {topicCount > 0 && (
                      <p className="text-sm text-gray-600">
                        {topicCount} topic{topicCount !== 1 ? 's' : ''} started
                      </p>
                    )}
                  </div>
                  <span className="text-3xl">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fun Section - Big Buttons */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🎮 Fun Stuff
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {onOpenMiniGames && (
            gamesUnlockStatus && !gamesUnlockStatus.isUnlocked ? (
              <GamesLockOverlay
                requiredCorrect={gamesUnlockStatus.requiredCorrect}
                totalQuestions={gamesUnlockStatus.totalQuestions}
                lastQuiz={gamesUnlockStatus.lastQuiz}
              />
            ) : (
              <BigActionButton
                icon="🎮"
                label="Play Games"
                color="from-cyan-500 to-blue-600"
                onClick={onOpenMiniGames}
              />
            )
          )}
          <BigActionButton
            icon="🏆"
            label="My Badges"
            color="from-amber-500 to-yellow-600"
            onClick={onOpenAchievements}
          />
          {onOpenAvatarCustomization && (
            <BigActionButton
              icon="🎨"
              label="My Avatar"
              color="from-purple-500 to-pink-600"
              onClick={onOpenAvatarCustomization}
            />
          )}
        </div>
      </div>

      {/* Encouraging Message */}
      <div className="text-center py-4">
        <p className="text-lg text-gray-600">
          {getEncouragingMessage(streak)}
        </p>
      </div>
    </div>
  );
};

// Big Action Button for Guided Mode
interface BigActionButtonProps {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}

const BigActionButton: React.FC<BigActionButtonProps> = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden p-6 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
    <div className="relative z-10">
      <span className="text-4xl block mb-2">{icon}</span>
      <p className="font-bold text-white text-lg">{label}</p>
    </div>
  </button>
);

// Encouraging messages based on streak
function getEncouragingMessage(streak: number): string {
  const messages = [
    "You're doing great! Keep it up! 🌟",
    "Every lesson makes you smarter! 📚",
    "Learning is fun with you! 🎉",
    "You're a superstar learner! ⭐",
    "Great job coming back today! 👏",
  ];
  
  if (streak >= 7) {
    return "WOW! A whole week of learning! You're amazing! 🏆";
  } else if (streak >= 3) {
    return "You're on fire! Keep that streak going! 🔥";
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
}

export default GuidedHomeView;
