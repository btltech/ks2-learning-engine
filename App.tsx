import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LanguageSelector from './components/LanguageSelector';
import TopicSelector from './components/TopicSelector';
import FeedbackModal from './components/FeedbackModal';
import GuideAvatar from './components/GuideAvatar';
import OfflineIndicator from './components/OfflineIndicator';
import LoginView from './components/LoginView';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastProvider } from './components/Toast';
import { AchievementsGallery } from './components/DailyChallenge';
import { ReviewMode, ReviewSummary } from './components/ReviewMode';
import { AccessibilitySettingsModal, initializeAccessibility, SkipToMainContent } from './components/AccessibilitySettings';
import { QuizBattleMode } from './components/QuizBattle';
import { LearningPathsView } from './components/LearningPaths';
import { useUser } from './context/UserContext';
import { Difficulty, Subject, QuizResult, ProgressData, UserProfile, QuizSession } from './types';
import { SUBJECTS } from './constants';
import HomeView from './components/HomeView';
import { spacedRepetitionService } from './services/spacedRepetitionService';
import { dailyChallengeService, DailyChallenge } from './services/dailyChallengeService';
import { initializeGoogleCloudTTS } from './services/googleCloudTTS';
import { ttsConfigManager } from './services/ttsConfigManager';

// Initialize accessibility features
if (typeof window !== 'undefined') {
  initializeAccessibility();
  
  // Initialize Google Cloud TTS if API key is available
  const apiKey = (import.meta as unknown as { env: { VITE_GOOGLE_CLOUD_TTS_API_KEY?: string } }).env?.VITE_GOOGLE_CLOUD_TTS_API_KEY;
  if (apiKey) {
    initializeGoogleCloudTTS(apiKey);
    ttsConfigManager.setGoogleCloudApiKey(apiKey);
    console.log('✓ Google Cloud TTS initialized successfully');
  } else {
    console.info('ℹ Google Cloud TTS API key not configured. Using Web Speech API as fallback.');
  }
}

// Lazy loaded components
const LessonView = lazy(() => import('./components/LessonView'));
const QuizView = lazy(() => import('./components/QuizView'));
const StoreView = lazy(() => import('./components/StoreView'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));
const ParentMonitoringDashboard = lazy(() => import('./components/ParentMonitoringDashboard'));
const LeaderboardView = lazy(() => import('./components/LeaderboardView'));
const ProgressView = lazy(() => import('./components/ProgressView'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));

// Wrapper for protected routes - currently not used but kept for future auth implementation
// const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
//   const { user } = useUser();
//   if (!user) {
//     return <LoginView onLogin={() => {}} />; // LoginView handles the login via context now? No, LoginView needs update.
//   }
//   return children;
// };

const AppContent: React.FC = () => {
  const { user, logout, checkStreak, addPoints, updateMastery, setUser, recordQuizSession, addTimeSpent, suggestNextDifficulty } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [showStore, setShowStore] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  
  // New feature states
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [showReviewSummary, setShowReviewSummary] = useState(false);
  const [reviewResults, setReviewResults] = useState<any>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showQuizBattle, setShowQuizBattle] = useState(false);
  const [showLearningPaths, setShowLearningPaths] = useState(false);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false);
  
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
    }
  }, [user?.id]); // Run when user changes/loads

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

  // Parent view - show monitoring dashboard
  if (user?.role === 'parent') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ParentMonitoringDashboard onLogout={logout} />
      </Suspense>
    );
  }

  // Student view - show learning interface
  if (!user) {
    // Show login page
    return (
      <ToastProvider>
        <LoginView onLogin={handleLoginWrapper} />
      </ToastProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 text-gray-800">
      <SkipToMainContent />
      <OfflineIndicator />
      
      <Header 
        onHomeClick={() => navigate('/')} 
        user={user}
        onOpenStore={() => setShowStore(true)}
        onOpenParentDashboard={() => setShowParentDashboard(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenProgress={() => setShowProgress(true)}
        onLogout={logout}
      />

      <main className="flex-grow w-full content-visibility-auto safe-area-bottom">
        <div className="mobile-shell py-4 mobile:py-5 sm:py-6 lg:py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginView onLogin={handleLoginWrapper} />} />
              
              <Route path="/" element={
                <HomeView
                  onSelectSubject={(s) => navigate(`/subject/${encodeURIComponent(s.name)}`)}
                  onStartDailyChallenge={handleStartDailyChallenge}
                  onOpenReviewMode={() => setShowReviewMode(true)}
                  onOpenQuizBattle={() => setShowQuizBattle(true)}
                  onOpenLearningPaths={() => setShowLearningPaths(true)}
                  onOpenAchievements={() => setShowAchievements(true)}
                  progress={progress}
                />
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
        quizScore={showFeedback && quizResults.length > 0 ? Math.round((quizResults.filter(r => r.isCorrect).length / quizResults.length) * 100) : undefined}
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

      {/* New Feature Modals */}
      {showAccessibilitySettings && (
        <AccessibilitySettingsModal onClose={() => setShowAccessibilitySettings(false)} />
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

      <Footer />
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

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
