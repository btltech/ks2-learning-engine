/**
 * Home View Component
 * 
 * Enhanced home screen with daily challenges, quick actions, and subject selection
 */

import React, { useState } from 'react';
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
  progress: ProgressData;
}

const HomeView: React.FC<HomeViewProps> = ({
  onSelectSubject,
  onStartDailyChallenge,
  onOpenReviewMode,
  onOpenQuizBattle,
  onOpenLearningPaths,
  onOpenAchievements,
  progress,
}) => {
  const { user, currentChild } = useUser();
  const streak = currentChild?.streak || user?.streak || 0;
  const userId = currentChild?.id || user?.id || 'default';

  return (
    <div className="w-full max-w-6xl mx-auto" id="main-content">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
      className={`${color} p-4 rounded-xl text-left transition-all hover:shadow-md`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-bold text-sm">{label}</div>
      <div className="text-xs opacity-75">{description}</div>
    </button>
  );
};

export default HomeView;
