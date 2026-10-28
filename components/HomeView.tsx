/**
 * Home View Component
 * 
 * Organized home screen with clear sections for learning, fun, and progress
 */

import React, { useEffect, useState, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOverview } from './sunny/HomeOverview';
import { KidCard } from './sunny/KidCard';
import { SUBJECTS } from '../constants';
import './SunnyHome.css';
import SubjectSelector from './SubjectSelector';
import { DailyChallengeCard, StreakMilestone } from './DailyChallenge';
import { ReviewDueBadge } from './ReviewMode';
import { GamesLockOverlay } from './GamesLockOverlay';
import { CardSkeleton } from './SkeletonLoader';
import { useUser } from '../context/UserContext';
import { Subject, ProgressData } from '../types';
import { DailyChallenge } from '../services/dailyChallengeService';
import { SharedClass, SharedHomework, teacherWorkspaceService } from '../services/teacherWorkspaceService';
import { GRADIENTS, SHADOWS, RADIUS } from '../constants';

// Phase 2: Lazy load new widgets
const SkillProgressWidget = lazy(() => import('./SkillProgressWidget'));
const NextCertificateWidget = lazy(() => import('./NextCertificateWidget'));

interface GamesUnlockStatus {
  isUnlocked: boolean;
  gamesRemaining: number;
  requiredCorrect: number;
  totalQuestions: number;
  passesCount: number;
  requiredPasses: number;
  activeSessionId?: string | null;
  lastQuiz?: { correct: number; total: number; passed: boolean; at: string };
}

interface HomeViewProps {
  onSelectSubject: (subject: Subject) => void;
  onStartDailyChallenge: (challenge: DailyChallenge) => void;
  onOpenReviewMode: () => void;
  onOpenQuizBattle?: () => void;
  onOpenLearningPaths?: () => void;
  onOpenAchievements: () => void;
  onOpenClassroom?: () => void;
  onOpenAnalytics?: () => void;
  onOpenStreakRewards?: () => void;
  onOpenAvatarCustomization?: () => void;
  onOpenMiniGames?: () => void;
  onOpenArtStudio?: () => void;
  onOpenCurriculumCoverage?: () => void;
  onOpenSATsPractice?: () => void;
  progress: ProgressData;
  gamesUnlockStatus?: GamesUnlockStatus;
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
  onOpenArtStudio,
  onOpenCurriculumCoverage,
  onOpenSATsPractice,
  progress,
  gamesUnlockStatus,
}) => {
  const { user, currentChild } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const streak = currentChild?.streak || user?.streak || 0;
  const userId = currentChild?.id || user?.id || 'default';
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn');
  useEffect(() => {
    if (location.hash === '#subjects') setActiveTab('learn');
  }, [location.key, location.hash]);

  const [classes, setClasses] = useState<SharedClass[]>([]);
  const [homework, setHomework] = useState<SharedHomework[]>([]);
  const [classCode, setClassCode] = useState('');
  const [classMessage, setClassMessage] = useState('');
  const [joiningClass, setJoiningClass] = useState(false);

  useEffect(() => {
    if (user?.role !== 'student') return;
    let cancelled = false;
    Promise.all([teacherWorkspaceService.getClasses(), teacherWorkspaceService.getHomework()])
      .then(([nextClasses, nextHomework]) => {
        if (!cancelled) {
          setClasses(nextClasses);
          setHomework(nextHomework);
        }
      })
      .catch(() => {
        // Joining remains available; errors are shown when the learner submits a code.
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const joinClass = async () => {
    if (classCode.trim().length !== 6) {
      setClassMessage('Enter the 6-character code from your teacher.');
      return;
    }
    setJoiningClass(true);
    setClassMessage('');
    try {
      const joined = await teacherWorkspaceService.joinClass(classCode.trim().toUpperCase());
      const [nextClasses, nextHomework] = await Promise.all([
        teacherWorkspaceService.getClasses(),
        teacherWorkspaceService.getHomework(),
      ]);
      setClasses(nextClasses.length ? nextClasses : [joined]);
      setHomework(nextHomework);
      setClassCode('');
      setClassMessage(`Joined ${joined.className}.`);
    } catch (reason) {
      setClassMessage(reason instanceof Error ? reason.message : 'Unable to join the class.');
    } finally {
      setJoiningClass(false);
    }
  };

  const startHomework = (assignment: SharedHomework) => {
    const topic = assignment.topics[0];
    navigate(
      `/subject/${encodeURIComponent(assignment.subject)}/topic/${encodeURIComponent(topic)}/quiz?difficulty=${encodeURIComponent(assignment.difficulty)}&homework=${encodeURIComponent(assignment.homeworkId)}`
    );
  };

  return (
    <div className="sunny-home sunny-ui">
      {activeTab === 'learn' ? (
        <HomeOverview
          learner={currentChild || user}
          greeting={`Welcome back, ${currentChild?.name || user?.name || 'Learner'}! 👋`}
          subjects={SUBJECTS}
          progress={progress}
          onSelectSubject={onSelectSubject}
          onOpenAchievements={onOpenAchievements}
          dailyChallenge={<DailyChallengeCard sunny onStartChallenge={onStartDailyChallenge} />}
        >
          <section id="subjects" className="sunny-explore" aria-labelledby="sunny-subject-heading">
            <h2 id="sunny-subject-heading">Where shall we explore?</h2>
            <p>Pick a subject to start learning</p>
            <SubjectSelector sunny onSelect={onSelectSubject} progress={progress} />
          </section>
        </HomeOverview>
      ) : (
        <h1 className="sunny-other-tab-greeting">
          Welcome back, {currentChild?.name || user?.name || 'Learner'}! 👋
        </h1>
      )}
      {/* Navigation Tabs */}
      <div className="flex justify-center mb-6" role="tablist" aria-label="Home sections">
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
      <div id="home-tabpanel" className="min-h-[400px]">
        <div id="home-tabpanel-learn" role="tabpanel" tabIndex={0} aria-labelledby="home-tab-learn" hidden={activeTab !== 'learn'}>
        {activeTab === 'learn' && (
          <div className="space-y-6 animate-fadeIn">
            {user?.role === 'student' && (
              <SectionCard title="🏫 My Class" subtitle="Join your teacher's class and complete shared assignments">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={classCode}
                      onChange={(event) => setClassCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                      placeholder="CLASS CODE"
                      aria-label="Teacher class code"
                      className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-bold tracking-[0.2em] uppercase"
                    />
                    <button onClick={joinClass} disabled={joiningClass} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:bg-indigo-300">
                      {joiningClass ? 'Joining…' : 'Join Class'}
                    </button>
                  </div>
                  {classMessage && <p className="text-sm text-indigo-700">{classMessage}</p>}
                  {classes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {classes.map((entry) => (
                        <span key={entry.classId} className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                          {entry.className} · {entry.grade}
                        </span>
                      ))}
                    </div>
                  )}
                  {onOpenClassroom && (
                    <button type="button" onClick={onOpenClassroom} className="min-h-11 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-bold text-indigo-700 hover:bg-indigo-100">
                      Join a live classroom session
                    </button>
                  )}
                  {homework.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {homework.map((assignment) => {
                        const submitted = assignment.submissions.length > 0;
                        return (
                          <div key={assignment.homeworkId} className="rounded-xl border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                                <p className="text-sm text-gray-600">{assignment.subject} · {assignment.topics.join(', ')} · {assignment.difficulty}</p>
                              </div>
                              <span className="text-xs text-gray-500">Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            {submitted ? (
                              <div className="mt-3 rounded-lg bg-green-50 p-2 text-sm font-semibold text-green-700">
                                Submitted · {assignment.submissions[0].score}%
                              </div>
                            ) : (
                              <button onClick={() => startHomework(assignment)} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
                                Start assignment
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Review Due Badge */}
            <KidCard className="sunny-review-due flex justify-center">
              <ReviewDueBadge userId={userId} onClick={onOpenReviewMode} />
            </KidCard>

            {/* Learning Actions */}
            <SectionCard title="📖 Study" subtitle="Choose how you want to learn">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ActionCard
                  icon="📚"
                  label="Review Mode"
                  description="Practice weak areas"
                  onClick={onOpenReviewMode}
                  gradient={GRADIENTS.purple}
                />
                <ActionCard
                  icon="⚡"
                  label="5-Minute Challenge"
                  description="Quick focused practice"
                  onClick={() => navigate('/microlearning')}
                  gradient={GRADIENTS.info}
                />
                {onOpenLearningPaths && (
                  <ActionCard
                    icon="🎯"
                    label="Learning Paths"
                    description="Structured courses"
                    onClick={onOpenLearningPaths}
                    gradient={GRADIENTS.emerald}
                  />
                )}
                {onOpenSATsPractice && (
                  <ActionCard
                    icon="📝"
                    label="SATs Practice"
                    description="Year 6 Exam Prep"
                    onClick={onOpenSATsPractice}
                    gradient={GRADIENTS.primary}
                  />
                )}
              </div>
            </SectionCard>

          </div>
        )}

        </div>
        <div id="home-tabpanel-play" role="tabpanel" tabIndex={0} aria-labelledby="home-tab-play" hidden={activeTab !== 'play'}>
        {activeTab === 'play' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Fun Activities */}
            <SectionCard title="🎮 Games & Challenges" subtitle="Learn while having fun!">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {onOpenQuizBattle && (
                  <ActionCard
                    icon="⚔️"
                    label="Quiz Battle"
                    description="Challenge friends"
                    onClick={onOpenQuizBattle}
                    gradient={GRADIENTS.danger}
                    featured
                  />
                )}
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
                    <ActionCard
                      icon="🎮"
                      label="Mini Games"
                      description={
                        gamesUnlockStatus
                          ? gamesUnlockStatus.activeSessionId
                            ? 'Resume your saved game'
                            : `Fun learning games (${gamesUnlockStatus.gamesRemaining} left)`
                          : 'Fun learning games'
                      }
                      onClick={onOpenMiniGames}
                      gradient={GRADIENTS.info}
                      featured
                    />
                  )
                )}
                {onOpenArtStudio && (
                  <ActionCard
                    icon="🎨"
                    label="Art Studio"
                    description="Draw & learn art"
                    onClick={onOpenArtStudio}
                    gradient={GRADIENTS.purple}
                    featured
                  />
                )}
                {onOpenStreakRewards && (
                  <ActionCard
                    icon="🔥"
                    label="Daily Rewards"
                    description="Claim your prizes"
                    onClick={onOpenStreakRewards}
                    gradient={GRADIENTS.warning}
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
                    gradient={GRADIENTS.indigo}
                  />
                )}
                <ActionCard
                  icon="🏆"
                  label="Achievements"
                  description="View your badges"
                  onClick={onOpenAchievements}
                  gradient={GRADIENTS.warning}
                />
              </div>
            </SectionCard>
          </div>
        )}

        </div>
        <div id="home-tabpanel-progress" role="tabpanel" tabIndex={0} aria-labelledby="home-tab-progress" hidden={activeTab !== 'progress'}>
        {activeTab === 'progress' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Streak Display */}
            {streak > 0 && (
              <KidCard className="sunny-existing-widget"><StreakMilestone streak={streak} /></KidCard>
            )}

            {/* Phase 2: New Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <React.Suspense fallback={<CardSkeleton shadow="secondary" />}>
                <KidCard className="sunny-existing-widget"><SkillProgressWidget /></KidCard>
              </React.Suspense>
              <React.Suspense fallback={<CardSkeleton shadow="secondary" />}>
                <KidCard className="sunny-existing-widget"><NextCertificateWidget /></KidCard>
              </React.Suspense>
            </div>

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
                {onOpenCurriculumCoverage && (
                  <ActionCard
                    icon="📋"
                    label="Curriculum"
                    description="DfE Objectives"
                    onClick={onOpenCurriculumCoverage}
                    gradient="from-teal-500 to-emerald-600"
                    featured
                  />
                )}
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
    type="button"
    onClick={onClick}
    onFocus={onClick}
    onKeyDown={(event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const directions = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!directions.includes(event.key)) return;
      const tabs = Array.from(event.currentTarget.closest('[role="tablist"]')?.querySelectorAll<HTMLButtonElement>('[role="tab"]') || []);
      const index = tabs.indexOf(event.currentTarget);
      if (index < 0) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
    }}
    role="tab"
    id={`home-tab-${label.toLowerCase()}`}
    aria-label={label}
    aria-selected={active}
    aria-controls={`home-tabpanel-${label.toLowerCase()}`}
    tabIndex={active ? 0 : -1}
    className={`flex items-center gap-2 px-5 py-2.5 ${RADIUS.button} font-semibold text-sm transition-all motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
      active
        ? `bg-white text-gray-900 ${SHADOWS.secondary}`
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
    }`}
  >
    <span className="text-lg" aria-hidden="true">{icon}</span>
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
  <KidCard className="sunny-home-section">
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    <div className="p-4">
      {children}
    </div>
  </KidCard>
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
    className={`sunny-home-action relative overflow-hidden p-4 ${RADIUS.card} text-left transition-all ${
      featured ? `motion-safe:hover:scale-105 ${SHADOWS.primary}` : `motion-safe:hover:scale-[1.02] ${SHADOWS.secondary}`
    } motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
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
  <KidCard className={`${color} sunny-home-stat ${RADIUS.card} p-4 text-center`}>
    <span className="text-2xl block mb-1">{icon}</span>
    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    <p className="text-xs opacity-75">{label}</p>
  </KidCard>
);

export default HomeView;
