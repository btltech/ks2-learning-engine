/**
 * Home View Component
 * 
 * Organized home screen with clear sections for learning, fun, and progress
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
  onOpenClassroom?: () => void;
  onOpenAnalytics?: () => void;
  onOpenStreakRewards?: () => void;
  onOpenAvatarCustomization?: () => void;
  onOpenMiniGames?: () => void;
  progress: ProgressData;
}

type ActiveTab = 'learn' | 'play' | 'progress';

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn');

  return (
    <div className="w-full max-w-screen-content mx-auto p-4 mobile:p-5 sm:p-6 md:p-8 content-visibility-auto" id="main-content">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {currentChild?.name || user?.name || 'Learner'}! 👋
        </h1>
        {streak > 0 && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-full">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-orange-700">{streak} day streak!</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 gap-1">
          <TabButton 
            active={activeTab === 'learn'} 
            onClick={() => setActiveTab('learn')}
            icon="📚"
            label="Learn"
          />
          <TabButton 
            active={activeTab === 'play'} 
            onClick={() => setActiveTab('play')}
            icon="🎮"
            label="Play"
          />
          <TabButton 
            active={activeTab === 'progress'} 
            onClick={() => setActiveTab('progress')}
            icon="📊"
            label="Progress"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'learn' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Daily Challenge - Hero Card */}
            <DailyChallengeCard onStartChallenge={onStartDailyChallenge} />

            {/* Review Due Badge */}
            <div className="flex justify-center">
              <ReviewDueBadge userId={userId} onClick={onOpenReviewMode} />
            </div>

            {/* Learning Actions */}
            <SectionCard title="📖 Study" subtitle="Choose how you want to learn">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ActionCard
                  icon="📚"
                  label="Review Mode"
                  description="Practice weak areas"
                  onClick={onOpenReviewMode}
                  gradient="from-purple-500 to-indigo-600"
                />
                <ActionCard
                  icon="🎯"
                  label="Learning Paths"
                  description="Structured courses"
                  onClick={onOpenLearningPaths}
                  gradient="from-emerald-500 to-teal-600"
                />
                {onOpenClassroom && (
                  <ActionCard
                    icon="🏫"
                    label="Classroom"
                    description="Join a session"
                    onClick={onOpenClassroom}
                    gradient="from-violet-500 to-purple-600"
                  />
                )}
              </div>
            </SectionCard>

            {/* Subject Selection */}
            <SectionCard title="📚 Subjects" subtitle="Pick a subject to start learning">
              <SubjectSelector onSelect={onSelectSubject} progress={progress} />
            </SectionCard>
          </div>
        )}

        {activeTab === 'play' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Fun Activities */}
            <SectionCard title="🎮 Games & Challenges" subtitle="Learn while having fun!">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ActionCard
                  icon="⚔️"
                  label="Quiz Battle"
                  description="Challenge friends"
                  onClick={onOpenQuizBattle}
                  gradient="from-pink-500 to-rose-600"
                  featured
                />
                {onOpenMiniGames && (
                  <ActionCard
                    icon="🎮"
                    label="Mini Games"
                    description="Fun learning games"
                    onClick={onOpenMiniGames}
                    gradient="from-cyan-500 to-blue-600"
                    featured
                  />
                )}
                {onOpenStreakRewards && (
                  <ActionCard
                    icon="🔥"
                    label="Daily Rewards"
                    description="Claim your prizes"
                    onClick={onOpenStreakRewards}
                    gradient="from-orange-500 to-red-600"
                  />
                )}
              </div>
            </SectionCard>

            {/* Customization */}
            <SectionCard title="✨ Personalize" subtitle="Make it yours!">
              <div className="grid grid-cols-2 gap-3">
                {onOpenAvatarCustomization && (
                  <ActionCard
                    icon="🎨"
                    label="Avatar"
                    description="Customize your look"
                    onClick={onOpenAvatarCustomization}
                    gradient="from-indigo-500 to-purple-600"
                  />
                )}
                <ActionCard
                  icon="🏆"
                  label="Achievements"
                  description="View your badges"
                  onClick={onOpenAchievements}
                  gradient="from-amber-500 to-yellow-600"
                />
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Streak Display */}
            {streak > 0 && (
              <StreakMilestone streak={streak} />
            )}

            {/* Progress & Analytics */}
            <SectionCard title="📈 Your Progress" subtitle="Track your learning journey">
              <div className="grid grid-cols-2 gap-3">
                {onOpenAnalytics && (
                  <ActionCard
                    icon="📊"
                    label="Analytics"
                    description="Detailed stats"
                    onClick={onOpenAnalytics}
                    gradient="from-blue-500 to-indigo-600"
                    featured
                  />
                )}
                <ActionCard
                  icon="🏆"
                  label="Achievements"
                  description="Your rewards"
                  onClick={onOpenAchievements}
                  gradient="from-amber-500 to-orange-600"
                />
                {onOpenStreakRewards && (
                  <ActionCard
                    icon="📅"
                    label="Streaks"
                    description="Daily progress"
                    onClick={onOpenStreakRewards}
                    gradient="from-orange-500 to-red-600"
                  />
                )}
                <ActionCard
                  icon="🎯"
                  label="Learning Paths"
                  description="Course progress"
                  onClick={onOpenLearningPaths}
                  gradient="from-emerald-500 to-teal-600"
                />
              </div>
            </SectionCard>

            {/* Quick Stats */}
            <SectionCard title="⭐ Quick Stats" subtitle="Your learning at a glance">
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon="⭐"
                  value={user?.totalPoints || 0}
                  label="Total XP"
                  color="text-yellow-600 bg-yellow-50"
                />
                <StatCard
                  icon="🔥"
                  value={streak}
                  label="Day Streak"
                  color="text-orange-600 bg-orange-50"
                />
                <StatCard
                  icon="🏅"
                  value={user?.badges?.length || 0}
                  label="Badges"
                  color="text-blue-600 bg-blue-50"
                />
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
};

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
      active
        ? 'bg-white text-gray-900 shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Section Card Component
interface SectionCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Action Card Component
interface ActionCardProps {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
  gradient: string;
  featured?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, label, description, onClick, gradient, featured }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden p-4 rounded-xl text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
      featured ? 'col-span-1 sm:col-span-1' : ''
    }`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
    <div className="relative z-10">
      <span className="text-3xl mb-2 block">{icon}</span>
      <p className="font-bold text-white text-sm">{label}</p>
      <p className="text-white/80 text-xs">{description}</p>
    </div>
  </button>
);

// Stat Card Component
interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <div className={`${color} rounded-xl p-4 text-center`}>
    <span className="text-2xl block mb-1">{icon}</span>
    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    <p className="text-xs opacity-75">{label}</p>
  </div>
);

export default HomeView;
