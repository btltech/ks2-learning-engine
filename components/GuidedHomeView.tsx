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
import { HomeOverview } from './sunny/HomeOverview';
import { HomeSubjectIcon } from './sunny/HomeSubjectIcon';
import { KidCard } from './sunny/KidCard';
import './SunnyHome.css';
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
  passesCount: number;
  requiredPasses: number;
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
    <div className="sunny-home sunny-ui sunny-guided-home">
      <HomeOverview
        learner={user}
        greeting={`Hi, ${user?.name || 'Friend'}!`}
        subjects={guidedSubjects}
        progress={progress}
        onSelectSubject={onSelectSubject}
        onOpenAchievements={onOpenAchievements}
        dailyChallenge={<DailyChallengeCard sunny onStartChallenge={onStartDailyChallenge} />}
      >
        {/* Subject Selection - Large Cards */}
        <section id="subjects" className="sunny-explore">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Where shall we explore?
          </h2>
          <div className="sunny-subject-grid sunny-guided-subjects">
            {guidedSubjects.map((subject) => {
              const subjectProgress = progress[subject.name] || {};
              const topicCount = Object.keys(subjectProgress).length;
            
              return (
                <button
                  key={subject.name}
                  onClick={() => onSelectSubject(subject)}
                  className={`sunny-subject-tile w-full p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${subject.bgColor}`}
                  aria-label={`Study ${subject.name}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/30 flex items-center justify-center">
                      <HomeSubjectIcon subject={subject} size={72} />
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
        </section>
      </HomeOverview>

      {/* Fun Section - Big Buttons */}
      <KidCard className="sunny-home-section mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🎮 Fun Stuff
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {onOpenMiniGames && (
            gamesUnlockStatus && !gamesUnlockStatus.isUnlocked ? (
              <GamesLockOverlay
                requiredCorrect={gamesUnlockStatus.requiredCorrect}
                totalQuestions={gamesUnlockStatus.totalQuestions}
                passesCount={gamesUnlockStatus.passesCount}
                requiredPasses={gamesUnlockStatus.requiredPasses}
                lastQuiz={gamesUnlockStatus.lastQuiz}
                onClick={onOpenMiniGames}
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
      </KidCard>

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
    className="sunny-home-action relative overflow-hidden p-6 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
