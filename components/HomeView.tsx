/**
 * Home View Component
 * 
 * Enhanced home screen with daily challenges, quick actions, and subject selection
 */

import React from 'react';
import SubjectSelector from './SubjectSelector';
import { DailyChallengeCard, StreakMilestone } from './DailyChallenge';
import { ReviewDueBadge } from './ReviewMode';
import { useUser } from '../context/UserContext';
import { Subject, ProgressData } from '../types';
import { DailyChallenge } from '../services/dailyChallengeService';

interface HomeViewProps {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyChallenge: (challenge: DailyChallenge) => void;
  onOpenReviewMode: () => void;
  onOpenQuizBattle: () => void;
  onOpenLearningPaths: () => void;
  onOpenAchievements: () => void;
  onOpenClassroom?: () => void;
  onOpenAnalytics?: () => void;
  onOpenStreakRewards?: () => void;
  onOpenAvatarCustomization?: () => void;
  onOpenMiniGames?: () => void;
  progress: ProgressData;
}

const HomeView: React.FC<HomeViewProps> = ({
  onSelectSubject,
  onStartDailyChallenge,
  onOpenReviewMode,
  onOpenQuizBattle,
  onOpenLearningPaths,
  onOpenAchievements,
  onOpenClassroom,
  onOpenAnalytics,
  onOpenStreakRewards,
  onOpenAvatarCustomization,
  onOpenMiniGames,
  progress,
}) => {
  const { user, currentChild } = useUser();
  const streak = currentChild?.streak || user?.streak || 0;
  const userId = currentChild?.id || user?.id || 'default';

  return (
    <div className="w-full max-w-screen-content mx-auto touch-card p-4 mobile:p-5 sm:p-6 md:p-8 content-visibility-auto" id="main-content">
      {/* Welcome & Streak Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {currentChild?.name || user?.name || 'Learner'}! 👋
        </h1>
        
        {streak > 0 && (
          <StreakMilestone streak={streak} />
        )}
      </div>

      {/* Daily Challenge */}
      <DailyChallengeCard onStartChallenge={onStartDailyChallenge} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 mobile:grid-cols-3 laptop:grid-cols-4 gap-3 mobile:gap-4 mb-6">
        <QuickActionButton
          icon="📚"
          label="Review Mode"
          description="Practice weak areas"
          onClick={onOpenReviewMode}
          color="bg-purple-100 text-purple-700 hover:bg-purple-200"
        />
        <QuickActionButton
          icon="⚔️"
          label="Quiz Battle"
          description="Challenge friends"
          onClick={onOpenQuizBattle}
          color="bg-pink-100 text-pink-700 hover:bg-pink-200"
        />
        <QuickActionButton
          icon="🎯"
          label="Learning Paths"
          description="Structured courses"
          onClick={onOpenLearningPaths}
          color="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
        />
        <QuickActionButton
          icon="🏆"
          label="Achievements"
          description="View rewards"
          onClick={onOpenAchievements}
          color="bg-amber-100 text-amber-700 hover:bg-amber-200"
        />
        {onOpenMiniGames && (
          <QuickActionButton
            icon="🎮"
            label="Mini Games"
            description="Learn with fun"
            onClick={onOpenMiniGames}
            color="bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
          />
        )}
        {onOpenStreakRewards && (
          <QuickActionButton
            icon="🔥"
            label="Streaks"
            description="Daily rewards"
            onClick={onOpenStreakRewards}
            color="bg-orange-100 text-orange-700 hover:bg-orange-200"
          />
        )}
        {onOpenAvatarCustomization && (
          <QuickActionButton
            icon="✨"
            label="Avatar"
            description="Customize look"
            onClick={onOpenAvatarCustomization}
            color="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          />
        )}
        {onOpenAnalytics && (
          <QuickActionButton
            icon="📊"
            label="Analytics"
            description="Track progress"
            onClick={onOpenAnalytics}
            color="bg-blue-100 text-blue-700 hover:bg-blue-200"
          />
        )}
        {onOpenClassroom && (
          <QuickActionButton
            icon="🏫"
            label="Classroom"
            description="Join session"
            onClick={onOpenClassroom}
            color="bg-violet-100 text-violet-700 hover:bg-violet-200"
          />
        )}
      </div>

      {/* Review Due Badge */}
      <div className="flex justify-center mb-6">
        <ReviewDueBadge userId={userId} onClick={onOpenReviewMode} />
      </div>

      {/* Subject Selection */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">📖 Choose a Subject</h2>
      </div>
      <SubjectSelector onSelect={onSelectSubject} progress={progress} />
    </div>
  );
};

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  description,
  onClick,
  color,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${color} touch-target w-full rounded-xl mobile:rounded-2xl text-left transition-all shadow-subtle hover:shadow-lifted active:translate-y-[1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-bold text-sm">{label}</div>
      <div className="text-xs opacity-75">{description}</div>
    </button>
  );
};

export default HomeView;
