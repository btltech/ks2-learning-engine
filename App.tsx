import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import Header from './components/Header';
import SubjectSelector from './components/SubjectSelector';
import LanguageSelector from './components/LanguageSelector';
import TopicSelector from './components/TopicSelector';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import FeedbackModal from './components/FeedbackModal';
import GuideAvatar from './components/GuideAvatar';
import OfflineIndicator from './components/OfflineIndicator';
import LoginView from './components/LoginView';
import StoreView from './components/StoreView';
import ParentDashboard from './components/ParentDashboard';
import LeaderboardView from './components/LeaderboardView';
import ProgressView from './components/ProgressView';
import { useUser } from './context/UserContext';
import { Difficulty, Subject, QuizResult, ProgressData, UserProfile } from './types';
import { SUBJECTS } from './constants';

// Wrapper for protected routes - currently not used but kept for future auth implementation
// const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
//   const { user } = useUser();
//   if (!user) {
//     return <LoginView onLogin={() => {}} />; // LoginView handles the login via context now? No, LoginView needs update.
//   }
//   return children;
// };

const AppContent: React.FC = () => {
  const { user, logout, checkStreak, addPoints, updateMastery, updateAge, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [showStore, setShowStore] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  
  // Use age from user profile, default to 9 if not set
  const studentAge = user?.age || 9;
  
  // Quiz State (still local as it's transient)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);

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

  const difficulty = (currentSubject && currentTopic) 
    ? getRecommendedDifficulty(currentSubject.name, currentTopic) 
    : Difficulty.Medium;

  const handleLoginWrapper = (userProfile: UserProfile) => {
    // Set the user in context and localStorage
    setUser(userProfile);
  };

  const handleQuizSubmit = (results: QuizResult[]) => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const earned = correctAnswers * 10;
    setPointsEarned(earned);
    setQuizResults(results);
    
    // Update Context
    addPoints(earned);
    if (currentSubject && currentTopic) {
      const scorePercentage = (correctAnswers / results.length) * 100;
      updateMastery(currentSubject.name, currentTopic, scorePercentage);
    }

    setShowFeedback(true);
  };

  const getGuideMessage = () => {
    if (location.pathname === '/') return `Hi ${user?.name || 'there'}! Ready to learn?`;
    if (location.pathname.includes('/quiz')) return "Show me what you've learned! Good luck!";
    if (location.pathname.includes('/topic')) return "Read carefully. I'm here to help!";
    if (location.pathname.includes('/subject')) return `Great choice! Pick a topic.`;
    return "Let's learn!";
  };

  if (!user) {
    return <LoginView onLogin={handleLoginWrapper} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 text-gray-800">
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

      <main className="flex-grow w-full container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Routes>
          <Route path="/" element={
            <SubjectSelector 
              onSelect={(s) => navigate(`/subject/${encodeURIComponent(s.name)}`)} 
              studentAge={studentAge} 
              onAgeChange={updateAge} 
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
        </Routes>
      </main>

      <GuideAvatar 
        message={getGuideMessage()} 
        studentAge={studentAge}
        context={currentSubject && currentTopic ? { subject: currentSubject.name, topic: currentTopic } : undefined}
      />

      {showFeedback && currentSubject && currentTopic && (
        <FeedbackModal 
          quizResults={quizResults} 
          studentAge={studentAge} 
          pointsEarned={pointsEarned} 
          onRetry={() => {
            setShowFeedback(false);
            // Stay on quiz page or reload it?
            // Actually we are on the quiz page, so just closing modal might show old quiz.
            // Better to navigate back to lesson or reload quiz.
            // For now, let's go back to lesson
            navigate(`/subject/${encodeURIComponent(currentSubject.name)}/topic/${encodeURIComponent(currentTopic)}`);
          }} 
          onNewTopic={() => {
            setShowFeedback(false);
            navigate(`/subject/${encodeURIComponent(currentSubject.name)}`);
          }} 
        />
      )}

      {showStore && (
        <StoreView 
          user={user} 
          onUpdateUser={() => {}} // Handled by context now
          onClose={() => setShowStore(false)} 
        />
      )}

      {showParentDashboard && (
        <ParentDashboard onClose={() => setShowParentDashboard(false)} />
      )}

      {showLeaderboard && (
        <LeaderboardView onBack={() => setShowLeaderboard(false)} />
      )}

      {showProgress && (
        <ProgressView onBack={() => setShowProgress(false)} />
      )}
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

const LanguageLessonWrapper = ({ studentAge, difficulty }: { studentAge: number, difficulty: Difficulty }) => {
  const { language, topicName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!language || !topicName) return <Navigate to="/" />;

  return (
    <LessonView 
      subject={decodeURIComponent(language)} 
      topic={decodeURIComponent(topicName)} 
      difficulty={difficulty} 
      studentAge={studentAge} 
      onStartQuiz={(mode = 'standard') => navigate(`${location.pathname}/quiz?mode=${mode}`)} 
      onBack={() => navigate(`/subject/Languages/${language}`)} 
    />
  );
};

const LanguageQuizWrapper = ({ studentAge, difficulty, onSubmit }: { studentAge: number, difficulty: Difficulty, onSubmit: (results: QuizResult[]) => void }) => {
  const { language, topicName } = useParams();
  const { search } = useLocation();
  const mode = new URLSearchParams(search).get('mode') === 'speed' ? 'speed' : 'standard';
  
  if (!language || !topicName) return <Navigate to="/" />;

  return (
    <QuizView 
      subject={decodeURIComponent(language)} 
      topic={decodeURIComponent(topicName)} 
      difficulty={difficulty} 
      studentAge={studentAge} 
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
  const mode = new URLSearchParams(search).get('mode') === 'speed' ? 'speed' : 'standard';
  
  if (!subjectName || !topicName) return <Navigate to="/" />;

  return (
    <QuizView 
      subject={decodeURIComponent(subjectName)} 
      topic={decodeURIComponent(topicName)} 
      difficulty={difficulty} 
      studentAge={studentAge} 
      onSubmit={onSubmit} 
      mode={mode}
    />
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
