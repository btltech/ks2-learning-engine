import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastProvider, useToast } from './components/Toast';
import { SkipToMainContent } from './components/SkipToMainContent';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import { useUser } from './context/UserContext';
import { useUISettings, useFeatureVisibility } from './context/UISettingsContext';
import { hasRole } from './utils/roles';
import { streakRewardsService } from './services/streakRewardsService';
import { analyticsService } from './services/analyticsService';
import { gamesUnlockService } from './services/gamesUnlockService';
import { Difficulty, Subject, QuizResult, ProgressData, UserProfile, QuizSession } from './types';
import { SUBJECTS } from './constants';
import { spacedRepetitionService } from './services/spacedRepetitionService';
import { dailyChallengeService, DailyChallenge } from './services/dailyChallengeService';
import { Artwork, DrawingLesson } from './data/artResources';
import { firebaseAuthService } from './services/firebaseAuthService';

// Initialize accessibility features lazily
const initAccessibility = () => {
  if (typeof window !== 'undefined') {
    import('./components/AccessibilitySettings').then(({ initializeAccessibility }) => {
      initializeAccessibility();
    });
  }
};
initAccessibility();

// Lazy loaded components - move more to lazy loading for smaller initial bundle
const LoginView = lazy(() => import('./components/LoginView'));
const HomeView = lazy(() => import('./components/HomeView'));
const GuidedHomeView = lazy(() => import('./components/GuidedHomeView'));
const LanguageSelector = lazy(() => import('./components/LanguageSelector'));
const TopicSelector = lazy(() => import('./components/TopicSelector'));
const FeedbackModal = lazy(() => import('./components/FeedbackModal'));
const GuideAvatar = lazy(() => import('./components/GuideAvatar'));
const OfflineIndicator = lazy(() => import('./components/OfflineIndicator'));
const LessonView = lazy(() => import('./components/LessonView'));
const QuizView = lazy(() => import('./components/QuizView'));
const StoreView = lazy(() => import('./components/StoreView'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));
const ParentMonitoringDashboard = lazy(() => import('./components/ParentMonitoringDashboard'));
const LeaderboardView = lazy(() => import('./components/LeaderboardView'));
const ProgressView = lazy(() => import('./views/ProgressView'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const TeacherHomeView = lazy(() => import('./components/TeacherHomeView'));
const ParentHomeView = lazy(() => import('./components/ParentHomeView'));
const AdminConsole = lazy(() => import('./components/AdminConsole'));
const QuestionQualityDashboard = lazy(() => import('./components/QuestionQualityDashboard'));
const ArtGalleryView = lazy(() => import('./components/ArtGalleryView'));
const DrawingLessonView = lazy(() => import('./components/DrawingLessonView'));
const AchievementsGallery = lazy(() => import('./components/DailyChallenge').then(m => ({ default: m.AchievementsGallery })));
const ReviewMode = lazy(() => import('./components/ReviewMode').then(m => ({ default: m.ReviewMode })));
const ReviewSummary = lazy(() => import('./components/ReviewMode').then(m => ({ default: m.ReviewSummary })));
const AccessibilitySettingsModal = lazy(() => import('./components/AccessibilitySettings').then(m => ({ default: m.AccessibilitySettingsModal })));
const QuizBattleMode = lazy(() => import('./components/QuizBattleRealtime').then(m => ({ default: m.QuizBattleMode })));
const LearningPathsView = lazy(() => import('./components/LearningPaths').then(m => ({ default: m.LearningPathsView })));
const ClassroomMode = lazy(() => import('./components/ClassroomMode'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const StreakRewards = lazy(() => import('./components/StreakRewards'));
const AvatarCustomization = lazy(() => import('./components/AvatarCustomization'));
const MiniGames = lazy(() => import('./components/MiniGames'));
const GamesUnlockedCelebration = lazy(() => import('./components/GamesLockOverlay').then(m => ({ default: m.GamesUnlockedCelebration })));
const UIModeSelector = lazy(() => import('./components/UIModeSelector').then(m => ({ default: m.UIModeSelector })));
const CurriculumCoverageDashboard = lazy(() => import('./components/CurriculumCoverageDashboard').then(m => ({ default: m.CurriculumCoverageDashboard })));
const SATsPracticeMode = lazy(() => import('./components/SATsPracticeMode').then(m => ({ default: m.SATsPracticeMode })));

// Phase 1 & 2 - New Features
const MicrolearningDashboard = lazy(() => import('./components/MicrolearningDashboard'));
const DailyMissionsPanel = lazy(() => import('./components/DailyMissionsPanel'));
const VirtualPetWidget = lazy(() => import('./components/VirtualPetWidget'));
const VoiceCommandButton = lazy(() => import('./components/VoiceCommandButton'));
const StruggleAlert = lazy(() => import('./components/StruggleAlert'));

// Info & Policy Pages
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const CookiePolicy = lazy(() => import('./components/CookiePolicy'));
const SafeguardingPolicy = lazy(() => import('./components/SafeguardingPolicy'));
const AccessibilityInfo = lazy(() => import('./components/AccessibilityStatement'));
const ParentGuide = lazy(() => import('./components/ParentGuide'));
const TeacherGuide = lazy(() => import('./components/TeacherGuide'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const GettingStarted = lazy(() => import('./components/GettingStarted'));
const AdminGuide = lazy(() => import('./components/AdminGuide'));
const PublicLayout = lazy(() => import('./components/PublicLayout').then(m => ({ default: m.PublicLayout })));
const CookieBanner = lazy(() => import('./components/CookieBanner').then(m => ({ default: m.CookieBanner })));

// Wrapper for protected routes - currently not used but kept for future auth implementation
// const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
//   const { user } = useUser();
//   if (!user) {
//     return <LoginView onLogin={() => {}} />; // LoginView handles the login via context now? No, LoginView needs update.
//   }
//   return children;
// };

const AppContent: React.FC = () => {
  const { user, logout, checkStreak, addPoints, updateMastery, setUser, recordQuizSession, addTimeSpent, suggestNextDifficulty, pendingBadgeNotification, clearBadgeNotification } = useUser();
  const { isGuidedMode } = useUISettings();
  const featureVisibility = useFeatureVisibility();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [showStore, setShowStore] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  
  // New feature states
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [showUIModeSelector, setShowUIModeSelector] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [showReviewSummary, setShowReviewSummary] = useState(false);
  const [reviewResults, setReviewResults] = useState<any>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showQuizBattle, setShowQuizBattle] = useState(false);
  const [showLearningPaths, setShowLearningPaths] = useState(false);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false);
  const [showQuestionQuality, setShowQuestionQuality] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCurriculumCoverage, setShowCurriculumCoverage] = useState(false);
  const [adminConsoleView, setAdminConsoleView] = useState<'dashboard' | 'users' | 'content' | 'analytics' | 'settings'>('dashboard');
  const [showSATsPractice, setShowSATsPractice] = useState(false);
  const [selectedDrawingLesson, setSelectedDrawingLesson] = useState<DrawingLesson | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  
  // Games unlock state
  const [gamesUnlockStatus, setGamesUnlockStatus] = useState(() => gamesUnlockService.getStatus());
  const [showGamesUnlockedCelebration, setShowGamesUnlockedCelebration] = useState(false);
  
  // Subscribe to games unlock changes
  useEffect(() => {
    const unsubscribe = gamesUnlockService.subscribe(() => {
      const newStatus = gamesUnlockService.getStatus();
      const wasLocked = !gamesUnlockStatus.isUnlocked;
      setGamesUnlockStatus(newStatus);
      // Show celebration when games just unlocked
      if (wasLocked && newStatus.isUnlocked) {
        setShowGamesUnlockedCelebration(true);
      }
    });
    return unsubscribe;
  }, [gamesUnlockStatus.isUnlocked]);
  
  // Use age from user profile, default to 9 if not set
  const studentAge = user?.age || 9;
  
  // Quiz State (still local as it's transient)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [nextDifficultySuggestion, setNextDifficultySuggestion] = useState<Difficulty | null>(null);
  const [quizStartTime] = useState<number>(Date.now());

  // Check streak on mount
  useEffect(() => {
    if (user) {
      checkStreak();
      // Check daily login for streak rewards
      streakRewardsService.checkDailyLogin();
    }
  }, [user?.id]); // Run when user changes/loads

  // Display badge notifications as toast
  useEffect(() => {
    if (pendingBadgeNotification) {
      showToast('success', pendingBadgeNotification, 5000);
      clearBadgeNotification();
    }
  }, [pendingBadgeNotification, showToast, clearBadgeNotification]);

  // Helper to get subject from URL
  const getSubjectFromUrl = (path: string): Subject | undefined => {
    const match = path.match(/\/subject\/([^/]+)/);
    if (match) {
      const subjectName = decodeURIComponent(match[1]);
      return SUBJECTS.find(s => s.name === subjectName);
    }
    return undefined;
  };

  // Helper to get topic from URL
  const getTopicFromUrl = (path: string): string | undefined => {
    const match = path.match(/\/topic\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  // Helper to get language from URL
  const getLanguageFromUrl = (path: string): string | undefined => {
    const match = path.match(/\/subject\/Languages\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  // Derive progress from user mastery
  const getProgressFromMastery = (): ProgressData => {
    if (!user) return {};
    const progress: ProgressData = {};
    Object.entries(user.mastery).forEach(([subject, topics]) => {
      progress[subject] = Object.keys(topics);
    });
    return progress;
  };

  const progress = getProgressFromMastery();

  const currentSubject = getSubjectFromUrl(location.pathname);
  const currentTopic = getTopicFromUrl(location.pathname);
  const currentLanguage = getLanguageFromUrl(location.pathname);
  const subjectKey = currentLanguage || currentSubject?.name;

  const parseDifficultyFromSearch = (search: string): Difficulty | null => {
    const param = new URLSearchParams(search).get('difficulty');
    return param && Object.values(Difficulty).includes(param as Difficulty)
      ? param as Difficulty
      : null;
  };

  const urlDifficulty = parseDifficultyFromSearch(location.search);

  // Smart Difficulty Logic
  const getRecommendedDifficulty = (subject: string, topic: string): Difficulty => {
    if (!user) return Difficulty.Medium;
    const subjectMastery = user.mastery[subject];
    if (!subjectMastery) return Difficulty.Medium;
    
    const score = subjectMastery[topic] || 0;
    if (score > 80) return Difficulty.Hard;
    if (score < 40) return Difficulty.Easy;
    return Difficulty.Medium;
  };

  const difficulty = urlDifficulty
    ? urlDifficulty
    : (subjectKey && currentTopic) 
      ? getRecommendedDifficulty(subjectKey, currentTopic) 
      : Difficulty.Medium;

  const handleLoginWrapper = (userProfile: UserProfile) => {
    // Set the user in context and localStorage
    setUser(userProfile);
  };

  const handleQuizSubmit = (results: QuizResult[]) => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const earned = correctAnswers * 10;
    const scorePercentage = (correctAnswers / results.length) * 100;
    const timeSpentSeconds = Date.now() - quizStartTime;
    
    setPointsEarned(earned);
    setQuizResults(results);
    
    // Update Context
    addPoints(earned);
    
    if (currentSubject && currentTopic) {
      const trackedSubject = subjectKey || currentSubject.name;
      updateMastery(trackedSubject, currentTopic, scorePercentage);
      
      // Record quiz session for analytics
      const quizSession: QuizSession = {
        id: `quiz_${Date.now()}`,
        subject: trackedSubject,
        topic: currentTopic,
        difficulty,
        score: scorePercentage,
        completedAt: new Date().toISOString(),
        timeSpent: timeSpentSeconds
      };
      recordQuizSession(quizSession);
      
      // Also record to analytics service
      analyticsService.recordSession({
        ...quizSession,
        totalQuestions: results.length,
        correctAnswers: correctAnswers,
        xpEarned: earned,
        date: new Date().toISOString(),
      });
      
      // Unlock games if the quiz score is high enough (>= 7/10).
      gamesUnlockService.recordQuizResult({ correct: correctAnswers, total: results.length });
      
      // Update challenge progress
      streakRewardsService.updateChallengeProgress('complete_quizzes', 1, trackedSubject);
      streakRewardsService.updateChallengeProgress('score_points', earned, trackedSubject);
      if (scorePercentage >= 80) {
        streakRewardsService.updateChallengeProgress('perfect_scores', 1, trackedSubject);
      }
      
      // Track time spent on this subject
      addTimeSpent(trackedSubject, Math.round(timeSpentSeconds / 60));
      
      // Get difficulty recommendation for next attempt
      const suggestedDifficulty = suggestNextDifficulty(trackedSubject, currentTopic);
      setNextDifficultySuggestion(suggestedDifficulty);
      
      // Add wrong answers to spaced repetition
      results.forEach((result) => {
        if (!result.isCorrect) {
          spacedRepetitionService.addWrongAnswer(
            trackedSubject,
            currentTopic,
            result.question,
            result.options[parseInt(result.correctAnswer, 10)] || result.correctAnswer
          );
        }
      });
      
      // Update daily challenge progress
      dailyChallengeService.completeChallenge(scorePercentage);
      
      // Phase 2: Progress Visualization Integration
      import('./services/progressVisualizationService').then(({ progressVisualizationService }) => {
        // Record progress data for charts
        progressVisualizationService.recordProgress(
          trackedSubject,
          scorePercentage,
          Math.round(timeSpentSeconds / 60)
        );
        
        // Award certificates for achievements
        if (scorePercentage === 100) {
          progressVisualizationService.awardCertificate(
            user?.name || 'Student',
            trackedSubject,
            `Perfect Score on ${currentTopic}`,
            'platinum'
          );
          showToast('success', '💎 Platinum Certificate Earned!', 5000);
        } else if (scorePercentage >= 95) {
          progressVisualizationService.awardCertificate(
            user?.name || 'Student',
            trackedSubject,
            `Excellent Performance on ${currentTopic}`,
            'gold'
          );
          showToast('success', '🥇 Gold Certificate Earned!', 5000);
        } else if (scorePercentage >= 85) {
          progressVisualizationService.awardCertificate(
            user?.name || 'Student',
            trackedSubject,
            `Great Work on ${currentTopic}`,
            'silver'
          );
          showToast('success', '🥈 Silver Certificate Earned!', 5000);
        }
      });
      
      // Update achievements
      dailyChallengeService.updateStreakAchievements(user?.streak || 0);
    }

    setShowFeedback(true);
  };
  
  // Handle starting a daily challenge
  const handleStartDailyChallenge = (challenge: DailyChallenge) => {
    const path = `/subject/${encodeURIComponent(challenge.subject)}/topic/${encodeURIComponent(challenge.topic)}/quiz?difficulty=${challenge.difficulty}`;
    navigate(path);
  };
  
  // Handle starting a lesson from learning paths
  const handleStartLearningPathLesson = (subject: string, topic: string, _difficulty: Difficulty) => {
    setShowLearningPaths(false);
    navigate(`/subject/${encodeURIComponent(subject)}/topic/${encodeURIComponent(topic)}?difficulty=${_difficulty}`);
  };

  const getGuideMessage = () => {
    if (location.pathname === '/') return `Hi ${user?.name || 'there'}! Ready to learn?`;
    if (location.pathname.includes('/quiz')) return "Show me what you've learned! Good luck!";
    if (location.pathname.includes('/topic')) return "Read carefully. I'm here to help!";
    if (location.pathname.includes('/subject')) return `Great choice! Pick a topic.`;
    return "Let's learn!";
  };

  const handleMiRaQuickAction = (action: string): string | void => {
    switch (action) {
      case 'teacher-revision':
        setShowTeacherDashboard(true);
        return 'Opening the class dashboard so you can build the revision set from real class data.';
      case 'teacher-weak-questions':
        setShowQuestionQuality(true);
        return 'Opening Question Quality. Start with low-success or high-friction questions before assigning more practice.';
      case 'parent-progress':
        navigate('/parent-monitoring');
        return 'Opening parent monitoring so you can check recent progress and decide the next short practice task.';
      case 'admin-quality':
        setAdminConsoleView('content');
        navigate('/');
        setShowQuestionQuality(true);
        return 'Opening the content quality workflow. Use the moderation queue and weak-question review first.';
      case 'admin-settings':
        setAdminConsoleView('settings');
        navigate('/');
        return 'Opening settings. Save one group at a time so reward, AI, safety, and access changes are easy to verify.';
      default:
        return undefined;
    }
  };

  // Public routes that don't require authentication
  const publicRoutes = [
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/safeguarding',
    '/accessibility',
    '/parent-guide',
    '/teacher-guide',
    '/how-it-works',
    '/help',
    '/contact',
    '/getting-started',
    '/admin-guide'
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname);

  // DEBUG LOGGING - Remove after fixing
  console.log('[PUBLIC ROUTE DEBUG]', {
    pathname: location.pathname,
    isPublicRoute,
    hasUser: !!user,
    userEmail: user?.email
  });

  // If user is not logged in and trying to access a protected route, show login
  if (!user && !isPublicRoute) {
    return (
      <ToastProvider>
        <LoginView onLogin={handleLoginWrapper} />
      </ToastProvider>
    );
  }

  // If user is not logged in but accessing a public route, show public layout
  if (!user && isPublicRoute) {
    return (
      <ToastProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <PublicLayout>
            <Routes>
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/safeguarding" element={<SafeguardingPolicy />} />
              <Route path="/accessibility" element={<AccessibilityInfo />} />
              <Route path="/parent-guide" element={<ParentGuide />} />
              <Route path="/teacher-guide" element={<TeacherGuide />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/admin-guide" element={<AdminGuide />} />
            </Routes>
          </PublicLayout>
        </Suspense>
      </ToastProvider>
    );
  }

  // Special case: Parent monitoring dashboard (full-screen)
  if (user && hasRole(user, 'parent') && location.pathname === '/parent-monitoring') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ParentMonitoringDashboard onLogout={logout} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-transparent text-gray-800">
      <SkipToMainContent />
      <OfflineIndicator />
      
      <Header 
        onHomeClick={() => navigate('/')} 
        user={user}
        onOpenStore={() => setShowStore(true)}
        onOpenParentDashboard={() => setShowParentDashboard(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenProgress={() => setShowProgress(true)}
        onOpenAvatar={() => navigate('/avatar')}
        onOpenUISettings={() => setShowUIModeSelector(true)}
        onOpenQuestionQuality={() => setShowQuestionQuality(true)}
        onLogout={logout}
      />

      {/* Email verification banner */}
      <EmailVerificationBanner />

      <main className="flex-grow w-full content-visibility-auto safe-area-bottom">
        <div className="mobile-shell py-4 mobile:py-5 sm:py-6 lg:py-10">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginView onLogin={handleLoginWrapper} />} />
              
              <Route path="/" element={
                // Route based on user role
                hasRole(user, 'admin') ? (
                  <AdminConsole 
                    initialView={adminConsoleView}
                    onOpenQuestionQuality={() => setShowQuestionQuality(true)}
                    onOpenCurriculumCoverage={() => setShowCurriculumCoverage(true)}
                  />
                ) : hasRole(user, 'teacher') ? (
                  <TeacherHomeView
                    onOpenTeacherDashboard={() => setShowTeacherDashboard(true)}
                    onOpenClassroom={() => navigate('/classroom')}
                    onOpenQuestionQuality={() => setShowQuestionQuality(true)}
                    onOpenAnalytics={() => setShowAnalytics(true)}
                    onOpenCurriculumCoverage={() => setShowCurriculumCoverage(true)}
                  />
                ) : hasRole(user, 'parent') ? (
                  <ParentHomeView
                    onOpenParentDashboard={() => setShowParentDashboard(true)}
                    onOpenParentMonitoring={() => navigate('/parent-monitoring')}
                    onOpenAnalytics={() => setShowAnalytics(true)}
                    onSwitchToChild={() => {
                      // Switch to child view if child is linked
                      showToast('info', 'Switch to your child\'s view to see their learning experience');
                    }}
                  />
                ) : isGuidedMode ? (
                  <GuidedHomeView
                    onSelectSubject={(s) => navigate(`/subject/${encodeURIComponent(s.name)}`)}
                    onStartDailyChallenge={handleStartDailyChallenge}
                    onOpenMiniGames={gamesUnlockStatus.isUnlocked ? () => navigate('/games') : undefined}
                    onOpenAchievements={() => setShowAchievements(true)}
                    onOpenAvatarCustomization={() => navigate('/avatar')}
                    progress={progress}
                    gamesUnlockStatus={gamesUnlockStatus}
                  />
                ) : (
                  <HomeView
                    onSelectSubject={(s) => navigate(`/subject/${encodeURIComponent(s.name)}`)}
                    onStartDailyChallenge={handleStartDailyChallenge}
                    onOpenReviewMode={() => setShowReviewMode(true)}
                    onOpenQuizBattle={featureVisibility.showQuizBattle ? () => setShowQuizBattle(true) : undefined}
                    onOpenLearningPaths={featureVisibility.showLearningPaths ? () => setShowLearningPaths(true) : undefined}
                    onOpenAchievements={() => setShowAchievements(true)}
                    onOpenClassroom={featureVisibility.showClassroomMode ? () => navigate('/classroom') : undefined}
                    onOpenAnalytics={featureVisibility.showAnalytics ? () => setShowAnalytics(true) : undefined}
                    onOpenMiniGames={gamesUnlockStatus.isUnlocked ? () => navigate('/games') : undefined}
                    onOpenArtStudio={() => navigate('/art-studio')}
                    onOpenCurriculumCoverage={featureVisibility.showCurriculumCoverage ? () => setShowCurriculumCoverage(true) : undefined}
                    onOpenSATsPractice={featureVisibility.showSATsPractice ? () => setShowSATsPractice(true) : undefined}
                    progress={progress}
                    gamesUnlockStatus={gamesUnlockStatus}
                  />
                )
              } />
              
              {/* Specific Routes for Languages */}
              <Route path="/subject/Languages" element={
                <LanguageSelector 
                  onSelect={(lang) => navigate(`/subject/Languages/${encodeURIComponent(lang)}`)}
                  onBack={() => navigate('/')}
                />
              } />
              
              <Route path="/subject/Languages/:language" element={<LanguageTopicWrapper studentAge={studentAge} progress={progress} />} />
              
              <Route path="/subject/Languages/:language/topic/:topicName" element={
                <LanguageLessonWrapper 
                  studentAge={studentAge} 
                  difficulty={difficulty}
                />
              } />

              <Route path="/subject/Languages/:language/topic/:topicName/quiz" element={
                <LanguageQuizWrapper 
                  studentAge={studentAge} 
                  difficulty={difficulty}
                  onSubmit={handleQuizSubmit}
                />
              } />

              {/* Generic Routes for other subjects */}
              <Route path="/subject/:subjectName" element={<SubjectRouteWrapper studentAge={studentAge} progress={progress} />} />
              
              <Route path="/subject/:subjectName/topic/:topicName" element={
                <LessonRouteWrapper 
                  studentAge={studentAge} 
                  difficulty={difficulty}
                />
              } />

              <Route path="/subject/:subjectName/topic/:topicName/quiz" element={
                <QuizRouteWrapper 
                  studentAge={studentAge} 
                  difficulty={difficulty}
                  onSubmit={handleQuizSubmit}
                />
              } />

              {/* Full Page Feature Routes */}
              <Route path="/games" element={
                gamesUnlockStatus.isUnlocked ? (
                  <MiniGames
                    onClose={() => navigate('/')}
                    onXpEarned={(xp) => {
                      addPoints(xp);
                      if (user?.id) void firebaseAuthService.incrementUserPoints(user.id, xp);
                    }}
                    onGameStarted={() => gamesUnlockService.recordGamePlay()}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } />
              
              <Route path="/avatar" element={
                <AvatarCustomization
                  currentXp={user?.points || 0}
                  currentStreak={user?.streak || 0}
                  onClose={() => navigate('/')}
                />
              } />
              
              {/* Art Studio Route */}
              <Route path="/art-studio" element={
                <ArtGalleryView
                  studentAge={studentAge}
                  onSelectArtwork={(artwork) => {
                    setSelectedArtwork(artwork);
                    navigate(`/art-studio/quiz/${artwork.id}`);
                  }}
                  onSelectLesson={(lesson) => {
                    setSelectedDrawingLesson(lesson);
                    navigate(`/art-studio/draw/${lesson.id}`);
                  }}
                  onBack={() => navigate('/')}
                />
              } />
              
              <Route path="/art-studio/draw/:lessonId" element={
                selectedDrawingLesson ? (
                  <DrawingLessonView
                    lesson={selectedDrawingLesson}
                    studentAge={studentAge}
                    onComplete={() => {
                      setSelectedDrawingLesson(null);
                      navigate('/art-studio');
                    }}
                    onBack={() => {
                      setSelectedDrawingLesson(null);
                      navigate('/art-studio');
                    }}
                  />
                ) : <Navigate to="/art-studio" />
              } />

              <Route path="/art-studio/quiz/:artworkId" element={
                selectedArtwork ? (
                  <QuizView
                    subject="Art"
                    topic={selectedArtwork.title}
                    difficulty={difficulty}
                    studentAge={studentAge}
                    studentName={user?.name}
                    onSubmit={(results) => {
                      handleQuizSubmit(results);
                      navigate('/art-studio');
                    }}
                  />
                ) : <Navigate to="/art-studio" />
              } />

              <Route path="/rewards" element={
                <StreakRewards
                  onClose={() => navigate('/')}
                  onXpEarned={(xp) => {
                    addPoints(xp);
                    if (user?.id) void firebaseAuthService.incrementUserPoints(user.id, xp);
                  }}
                />
              } />
              
              <Route path="/classroom" element={
                <ClassroomMode
                  userId={user?.id || ''}
                  userName={user?.name || ''}
                  isTeacher={hasRole(user, 'teacher')}
                  onExit={() => navigate('/')}
                />
              } />

              <Route path="/parent-monitoring" element={
                hasRole(user, 'parent') ? (
                  <ParentMonitoringDashboard onLogout={logout} />
                ) : (
                  <Navigate to="/" />
                )
              } />
              
              {/* Phase 2: New Progress & Social Routes */}
              <Route path="/progress" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProgressView />
                </Suspense>
              } />
              
              <Route path="/microlearning" element={
                <MicrolearningDashboard
                  onSelectSession={(session) => {
                    // Navigate to quiz with microlearning context
                    navigate(`/subject/${session.subject}/topic/${session.topic}/quiz?difficulty=${session.difficulty}&microlearning=true`);
                  }}
                />
              } />
              
              {/* Info & Policy Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/safeguarding" element={<SafeguardingPolicy />} />
              <Route path="/accessibility" element={<AccessibilityInfo />} />
              <Route path="/parent-guide" element={<ParentGuide />} />
              <Route path="/teacher-guide" element={<TeacherGuide />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/admin-guide" element={<AdminGuide />} />
              
              {/* Redirect to login if accessing dashboard without auth */}
              <Route path="*" element={!user ? <Navigate to="/login" /> : <Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      <GuideAvatar 
        message={getGuideMessage()} 
        studentAge={studentAge}
        studentName={user?.name}
        context={subjectKey && currentTopic ? { subject: subjectKey, topic: currentTopic } : undefined}
        currentActivity={(() => {
          const path = location.pathname;
          if (path.includes('/quiz')) return 'Quiz';
          if (path.includes('/lesson') || (path.includes('/topic/') && !path.includes('/quiz'))) return 'Lesson';
          if (path.includes('/games') || path.includes('/minigames')) return 'Game';
          if (path.includes('/art-studio')) return 'Art Studio';
          if (path.includes('/store')) return 'Store';
          if (path === '/') return 'Home';
          return 'Browsing';
        })()}
        userRole={user?.role}
        quizScore={showFeedback && quizResults.length > 0 ? Math.round((quizResults.filter(r => r.isCorrect).length / quizResults.length) * 100) : undefined}
        onQuickAction={handleMiRaQuickAction}
      />

      {showFeedback && currentSubject && currentTopic && (
        <FeedbackModal 
          quizResults={quizResults} 
          studentAge={studentAge} 
          pointsEarned={pointsEarned}
          nextDifficultySuggestion={nextDifficultySuggestion || undefined}
          onRetry={() => {
            setShowFeedback(false);
            const retryPath = currentSubject.name === 'Languages' && currentLanguage
              ? `/subject/Languages/${encodeURIComponent(currentLanguage)}/topic/${encodeURIComponent(currentTopic)}`
              : `/subject/${encodeURIComponent(currentSubject.name)}/topic/${encodeURIComponent(currentTopic)}`;
            navigate(retryPath);
          }} 
          onNewTopic={() => {
            setShowFeedback(false);
            if (currentSubject.name === 'Languages' && currentLanguage) {
              navigate(`/subject/Languages/${encodeURIComponent(currentLanguage)}`);
            } else {
              navigate(`/subject/${encodeURIComponent(currentSubject.name)}`);
            }
          }} 
        />
      )}

      {showStore && (
        <Suspense fallback={<LoadingSpinner />}>
          <StoreView 
            user={user} 
            onUpdateUser={setUser}
            onClose={() => setShowStore(false)} 
          />
        </Suspense>
      )}

      {showParentDashboard && (
        <Suspense fallback={<LoadingSpinner />}>
          <ParentDashboard onClose={() => setShowParentDashboard(false)} />
        </Suspense>
      )}

      {showLeaderboard && (
        <Suspense fallback={<LoadingSpinner />}>
          <LeaderboardView onBack={() => setShowLeaderboard(false)} />
        </Suspense>
      )}

      {showProgress && (
        <Suspense fallback={<LoadingSpinner />}>
          <ProgressView onBack={() => setShowProgress(false)} />
        </Suspense>
      )}

      {/* Question Quality Dashboard - Admin/Teacher only */}
      {showQuestionQuality && (
        <Suspense fallback={<LoadingSpinner />}>
          <QuestionQualityDashboard onClose={() => setShowQuestionQuality(false)} />
        </Suspense>
      )}

      {/* New Feature Modals */}
      {showAccessibilitySettings && (
        <AccessibilitySettingsModal onClose={() => setShowAccessibilitySettings(false)} />
      )}

      {showUIModeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <UIModeSelector onClose={() => setShowUIModeSelector(false)} />
        </div>
      )}

      {showReviewMode && (
        <ReviewMode 
          onComplete={(results) => {
            setReviewResults(results);
            setShowReviewMode(false);
            setShowReviewSummary(true);
          }}
          onClose={() => setShowReviewMode(false)}
        />
      )}

      {showReviewSummary && reviewResults && (
        <ReviewSummary 
          results={reviewResults}
          onClose={() => {
            setShowReviewSummary(false);
            setReviewResults(null);
          }}
        />
      )}

      {showAchievements && (
        <AchievementsGallery onClose={() => setShowAchievements(false)} />
      )}

      {showGamesUnlockedCelebration && (
        <GamesUnlockedCelebration onDismiss={() => {
          setShowGamesUnlockedCelebration(false);
          navigate('/games');
        }} />
      )}

      {showQuizBattle && (
        <QuizBattleMode 
          onClose={() => setShowQuizBattle(false)}
          onComplete={(won, points) => {
            if (points > 0) addPoints(points);
            setShowQuizBattle(false);
          }}
        />
      )}

      {showLearningPaths && (
        <LearningPathsView 
          onStartLesson={handleStartLearningPathLesson}
          onClose={() => setShowLearningPaths(false)}
        />
      )}

      {showTeacherDashboard && (
        <Suspense fallback={<LoadingSpinner />}>
          <TeacherDashboard onClose={() => setShowTeacherDashboard(false)} />
        </Suspense>
      )}

      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}

      {showCurriculumCoverage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <div className="relative min-h-screen">
            <button 
              onClick={() => setShowCurriculumCoverage(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <CurriculumCoverageDashboard 
              studentName={user?.name} 
              studentYear={user?.yearGroup || 5} 
            />
          </div>
        </div>
      )}

      {showSATsPractice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <SATsPracticeMode onExit={() => setShowSATsPractice(false)} />
        </div>
      )}

      {/* Google Cloud TTS test UI removed */}

      <Footer />
      
      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
};



// Route Wrappers to handle params
const SubjectRouteWrapper = ({ studentAge, progress }: { studentAge: number, progress: ProgressData }) => {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  
  // If subject is Languages, redirect to the specific route
  if (subjectName === 'Languages') {
      return <Navigate to="/subject/Languages" />;
  }

  const subject = SUBJECTS.find(s => s.name === decodeURIComponent(subjectName || ''));
  
  if (!subject) return <Navigate to="/" />;

  return (
    <TopicSelector 
      subject={subject} 
      studentAge={studentAge} 
      onSelect={(topic) => navigate(`/subject/${encodeURIComponent(subject.name)}/topic/${encodeURIComponent(topic)}`)} 
      onBack={() => navigate('/')} 
      progress={progress} 
    />
  );
};

const LanguageTopicWrapper = ({ studentAge, progress: _progress }: { studentAge: number, progress: ProgressData }) => {
  const { language } = useParams();
  const navigate = useNavigate();
  const languageName = decodeURIComponent(language || '');
  
  // Create a pseudo-subject for the language
  const subject: Subject = {
      name: languageName,
      icon: SUBJECTS.find(s => s.name === 'Languages')?.icon || SUBJECTS[0].icon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
  };

  return (
    <TopicSelector 
      subject={subject} 
      studentAge={studentAge} 
      onSelect={(topic) => navigate(`/subject/Languages/${encodeURIComponent(languageName)}/topic/${encodeURIComponent(topic)}`)} 
      onBack={() => navigate('/subject/Languages')} 
      progress={{}} 
    />
  );
};

const LanguageLessonWrapper = ({ studentAge, difficulty: _difficulty }: { studentAge: number, difficulty: Difficulty }) => {
  const { language, topicName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!language || !topicName) return <Navigate to="/" />;

  return (
    <LessonView 
      subject={decodeURIComponent(language)} 
      topic={decodeURIComponent(topicName)} 
      difficulty={_difficulty} 
      studentAge={studentAge} 
      onStartQuiz={(mode = 'standard') => navigate(`${location.pathname}/quiz?mode=${mode}`)} 
      onBack={() => navigate(`/subject/Languages/${language}`)} 
    />
  );
};

const LanguageQuizWrapper = ({ studentAge, difficulty, onSubmit }: { studentAge: number, difficulty: Difficulty, onSubmit: (results: QuizResult[]) => void }) => {
  const { language, topicName } = useParams();
  const { search } = useLocation();
  const { user } = useUser();
  const mode = new URLSearchParams(search).get('mode') === 'speed' ? 'speed' : 'standard';
  
  if (!language || !topicName) return <Navigate to="/" />;

  return (
    <QuizView 
      subject={decodeURIComponent(language)} 
      topic={decodeURIComponent(topicName)} 
      difficulty={difficulty} 
      studentAge={studentAge}
      studentName={user?.name}
      onSubmit={onSubmit} 
      mode={mode}
    />
  );
};

const LessonRouteWrapper = ({ studentAge, difficulty }: { studentAge: number, difficulty: Difficulty }) => {
  const { subjectName, topicName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!subjectName || !topicName) return <Navigate to="/" />;

  return (
    <LessonView 
      subject={decodeURIComponent(subjectName)} 
      topic={decodeURIComponent(topicName)} 
      difficulty={difficulty} 
      studentAge={studentAge} 
      onStartQuiz={(mode = 'standard') => navigate(`${location.pathname}/quiz?mode=${mode}`)} 
      onBack={() => navigate(`/subject/${subjectName}`)} 
    />
  );
};

const QuizRouteWrapper = ({ studentAge, difficulty, onSubmit }: { studentAge: number, difficulty: Difficulty, onSubmit: (results: QuizResult[]) => void }) => {
  const { subjectName, topicName } = useParams();
  const { search } = useLocation();
  const { user } = useUser();
  const mode = new URLSearchParams(search).get('mode') === 'speed' ? 'speed' : 'standard';
  
  if (!subjectName || !topicName) return <Navigate to="/" />;

  return (
    <QuizView 
      subject={decodeURIComponent(subjectName)} 
      topic={decodeURIComponent(topicName)} 
      difficulty={difficulty} 
      studentAge={studentAge}
      studentName={user?.name}
      onSubmit={onSubmit} 
      mode={mode}
    />
  );
};

import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
