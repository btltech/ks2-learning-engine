import React, { useState, useEffect } from 'react';
import { classroomService, ClassroomSession, ClassroomStudent, SessionStatus } from '../services/classroomService';
import { QuizQuestion, Difficulty } from '../types';
import { generateQuiz } from '../services/geminiService';
import { SUBJECTS } from '../constants';

// Subject topics mapping for classroom mode
const SUBJECT_TOPICS: Record<string, string[]> = {
  'English': ['Reading Comprehension', 'Grammar', 'Spelling', 'Creative Writing', 'Vocabulary'],
  'Maths': ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions', 'Decimals', 'Geometry', 'Time'],
  'Science': ['Living Things', 'Materials', 'Forces', 'Light', 'Sound', 'Earth and Space', 'Animals', 'Plants'],
  'History': ['Romans', 'Victorians', 'World War II', 'Ancient Egypt', 'Tudor Period', 'Anglo-Saxons'],
  'Geography': ['Maps', 'UK Regions', 'Rivers', 'Mountains', 'Climate', 'Continents'],
  'Art': ['Drawing', 'Painting', 'Sculpture', 'Colour Theory', 'Famous Artists'],
  'Computing': ['Coding Basics', 'Algorithms', 'Internet Safety', 'Digital Literacy'],
  'Languages': ['French Basics', 'Spanish Basics', 'German Basics'],
  'Music': ['Rhythm', 'Instruments', 'Composers', 'Music Notation'],
  'PE': ['Sports Rules', 'Fitness', 'Team Games', 'Athletics'],
  'PSHE': ['Health', 'Relationships', 'Safety', 'Wellbeing'],
  'D&T': ['Design Process', 'Materials', 'Food Technology', 'Structures'],
  'Religious Education': ['Christianity', 'Islam', 'Judaism', 'Hinduism', 'Festivals'],
  'Citizenship': ['Rights', 'Responsibilities', 'Community', 'Democracy']
};

interface ClassroomModeProps {
  userId: string;
  userName: string;
  isTeacher: boolean;
  onExit: () => void;
}

type ViewMode = 'menu' | 'create' | 'join' | 'waiting' | 'active' | 'results';

const ClassroomMode: React.FC<ClassroomModeProps> = ({ userId, userName, isTeacher, onExit }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Create session form
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  
  // Quiz state
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Subscribe to session updates
  useEffect(() => {
    if (!session?.id) return;

    const unsubscribe = classroomService.subscribeToSession(session.id, (updatedSession) => {
      if (updatedSession) {
        setSession(updatedSession);
        
        // Update view mode based on session status
        if (updatedSession.status === 'active' && viewMode === 'waiting') {
          setViewMode('active');
        }
        if (updatedSession.status === 'completed') {
          setViewMode('results');
        }
      }
    });

    return () => unsubscribe();
  }, [session?.id, viewMode]);

  // Question timer
  useEffect(() => {
    if (viewMode !== 'active' || !session || session.status !== 'active') return;

    const timer = setInterval(() => {
      if (session.questionStartTime) {
        const elapsed = (Date.now() - session.questionStartTime) / 1000;
        const remaining = Math.max(0, session.timePerQuestion - elapsed);
        setTimeLeft(Math.ceil(remaining));

        // Auto-submit if time runs out
        if (remaining <= 0 && !hasAnswered && !isTeacher) {
          handleSubmitAnswer(-1); // Wrong answer
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [viewMode, session, hasAnswered, isTeacher]);

  // Reset answer state on new question
  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimeLeft(session?.timePerQuestion || 30);
  }, [session?.currentQuestionIndex, session?.timePerQuestion]);

  const handleCreateSession = async () => {
    if (!title.trim() || !selectedSubject || !selectedTopic) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate quiz questions (use studentAge of 10 for KS2)
      const allQuestions = await generateQuiz(
        selectedSubject,
        selectedTopic,
        difficulty,
        10 // KS2 age
      );
      
      // Take only the requested number of questions
      const questions = allQuestions.slice(0, questionCount);

      const newSession = await classroomService.createSession(
        userId,
        userName,
        title,
        selectedSubject,
        selectedTopic,
        difficulty,
        questions
      );

      setSession(newSession);
      setSessionCode(newSession.sessionCode);
      setViewMode('waiting');
    } catch (err) {
      setError('Failed to create session. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a session code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const colors = ['#3B82F6', '#22C55E', '#EAB308', '#EC4899', '#A855F7', '#F97316'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const joinedSession = await classroomService.joinSession(
        joinCode.toUpperCase(),
        userId,
        userName,
        randomColor
      );

      if (joinedSession) {
        setSession(joinedSession);
        setViewMode('waiting');
      } else {
        setError('Session not found or no longer accepting players');
      }
    } catch (err) {
      setError('Failed to join session. Please check the code and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!session) return;
    await classroomService.startSession(session.id);
  };

  const handleNextQuestion = async () => {
    if (!session) return;
    const hasMore = await classroomService.nextQuestion(session.id);
    if (!hasMore) {
      setViewMode('results');
    }
  };

  const handleSubmitAnswer = async (answerIndex: number) => {
    if (!session || hasAnswered || isTeacher) return;

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    const question = session.questions[session.currentQuestionIndex];
    const isCorrect = answerIndex === question.correctAnswer;
    const timeMs = session.questionStartTime 
      ? Date.now() - session.questionStartTime 
      : 30000;

    await classroomService.submitAnswer(
      session.id,
      userId,
      session.currentQuestionIndex,
      isCorrect,
      timeMs
    );
  };

  const handleEndSession = async () => {
    if (!session) return;
    await classroomService.endSession(session.id);
    onExit();
  };

  const getLeaderboard = () => {
    if (!session) return [];
    return classroomService.getLeaderboard(session);
  };

  // Menu View
  if (viewMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-2">🏫 Classroom Mode</h1>
          <p className="text-white/70 text-center mb-8">
            {isTeacher ? 'Create a live quiz session for your class' : 'Join your teacher\'s quiz session'}
          </p>

          <div className="space-y-4">
            {isTeacher && (
              <button
                onClick={() => setViewMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📝</span>
                Create New Session
              </button>
            )}

            <button
              onClick={() => setViewMode('join')}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🚀</span>
              Join Session
            </button>

            <button
              onClick={onExit}
              className="w-full py-3 px-6 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Session View
  if (viewMode === 'create') {
    const subjectInfo = selectedSubject ? SUBJECTS.find(s => s.name === selectedSubject) : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setViewMode('menu')}
            className="text-white/70 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Create Quiz Session</h2>

            {error && (
              <div className="bg-red-500/20 text-red-200 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-1 block">Session Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Year 5 Maths Quiz"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-1 block">Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject.name}
                      onClick={() => { setSelectedSubject(subject.name); setSelectedTopic(''); }}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedSubject === subject.name
                          ? 'bg-white/30 ring-2 ring-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-white font-medium">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubject && SUBJECT_TOPICS[selectedSubject] && (
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-800">Select a topic</option>
                    {SUBJECT_TOPICS[selectedSubject].map(topic => (
                      <option key={topic} value={topic} className="bg-gray-800">{topic}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer"
                  >
                    <option value="Easy" className="bg-gray-800">Easy</option>
                    <option value="Medium" className="bg-gray-800">Medium</option>
                    <option value="Hard" className="bg-gray-800">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-1 block">Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer"
                  >
                    <option value={5} className="bg-gray-800">5 questions</option>
                    <option value={10} className="bg-gray-800">10 questions</option>
                    <option value={15} className="bg-gray-800">15 questions</option>
                    <option value={20} className="bg-gray-800">20 questions</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateSession}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Join Session View
  if (viewMode === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
          <button
            onClick={() => setViewMode('menu')}
            className="text-white/70 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">Join Session</h2>
          <p className="text-white/70 text-center mb-6">Enter the 6-digit code from your teacher</p>

          {error && (
            <div className="bg-red-500/20 text-red-200 px-4 py-2 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="ABC123"
            className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-3xl font-mono tracking-widest placeholder-white/30"
            maxLength={6}
          />

          <button
            onClick={handleJoinSession}
            disabled={loading || joinCode.length !== 6}
            className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    );
  }

  // Waiting Room View
  if (viewMode === 'waiting' && session) {
    const students: ClassroomStudent[] = Object.values(session.students || {}) as ClassroomStudent[];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{session.title}</h2>
              <div className="inline-block bg-white/20 rounded-xl px-6 py-3 mb-4">
                <p className="text-white/70 text-sm">Session Code</p>
                <p className="text-4xl font-mono font-bold text-white tracking-widest">
                  {session.sessionCode}
                </p>
              </div>
              <p className="text-white/70">
                {session.subject} • {session.topic} • {session.difficulty}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              👥 Players ({students.length})
            </h3>
            
            {students.length === 0 ? (
              <p className="text-white/50 text-center py-8">
                Waiting for players to join...
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {students.map(student => (
                  <div
                    key={student.id}
                    className="bg-white/10 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: student.avatarColor }}
                    >
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-green-400 text-xs">● Connected</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isTeacher ? (
            <div className="flex gap-4">
              <button
                onClick={handleStartSession}
                disabled={students.length === 0}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                Start Quiz ({session.questions.length} questions)
              </button>
              <button
                onClick={handleEndSession}
                className="py-4 px-6 bg-red-500/20 text-red-200 rounded-xl font-medium hover:bg-red-500/30 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="text-center text-white/70 py-4">
              <div className="inline-block animate-pulse">
                ⏳ Waiting for teacher to start the quiz...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Quiz View
  if (viewMode === 'active' && session && session.currentQuestionIndex >= 0) {
    const question = session.questions[session.currentQuestionIndex];
    const leaderboard = getLeaderboard();

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {/* Main Quiz Area */}
          <div className="md:col-span-2 space-y-4">
            {/* Progress & Timer */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between">
              <span className="text-white font-medium">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </span>
              <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            {/* Question */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">{question.question}</h2>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  let buttonClass = 'w-full py-4 px-6 rounded-xl text-left transition-all ';
                  
                  if (hasAnswered) {
                    if (index === question.correctAnswer) {
                      buttonClass += 'bg-green-500 text-white';
                    } else if (index === selectedAnswer) {
                      buttonClass += 'bg-red-500 text-white';
                    } else {
                      buttonClass += 'bg-white/10 text-white/50';
                    }
                  } else {
                    buttonClass += 'bg-white/10 hover:bg-white/20 text-white';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleSubmitAnswer(index)}
                      disabled={hasAnswered || isTeacher}
                      className={buttonClass}
                    >
                      <span className="font-mono mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {hasAnswered && session.settings.showCorrectAnswers && (
                <div className="mt-4 p-4 bg-blue-500/20 rounded-xl">
                  <p className="text-blue-200">{question.explanation}</p>
                </div>
              )}
            </div>

            {/* Teacher Controls */}
            {isTeacher && (
              <div className="flex gap-4">
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                >
                  {session.currentQuestionIndex < session.questions.length - 1 
                    ? 'Next Question →' 
                    : 'Show Results'}
                </button>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          {session.settings.showLeaderboardDuringQuiz && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">🏆 Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((student, index) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      student.id === userId ? 'bg-white/20' : ''
                    }`}
                  >
                    <span className="text-xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: student.avatarColor }}
                    >
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-white flex-1 truncate">{student.name}</span>
                    <span className="text-yellow-400 font-bold">{student.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results View
  if (viewMode === 'results' && session) {
    const leaderboard = getLeaderboard();
    const myStats = leaderboard.find(s => s.id === userId);
    const myRank = leaderboard.findIndex(s => s.id === userId) + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">🎉 Quiz Complete!</h1>
            <p className="text-white/70">{session.title}</p>
          </div>

          {/* Podium */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-end justify-center gap-4 mb-6">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: leaderboard[1].avatarColor }}
                  >
                    {leaderboard[1].name.charAt(0)}
                  </div>
                  <p className="text-white font-medium">{leaderboard[1].name}</p>
                  <p className="text-2xl">🥈</p>
                  <p className="text-yellow-400 font-bold">{leaderboard[1].score} pts</p>
                  <div className="w-16 h-20 bg-gray-400/30 rounded-t-lg mt-2" />
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-yellow-400"
                    style={{ backgroundColor: leaderboard[0].avatarColor }}
                  >
                    {leaderboard[0].name.charAt(0)}
                  </div>
                  <p className="text-white font-bold text-lg">{leaderboard[0].name}</p>
                  <p className="text-3xl">🥇</p>
                  <p className="text-yellow-400 font-bold text-xl">{leaderboard[0].score} pts</p>
                  <div className="w-20 h-28 bg-yellow-500/30 rounded-t-lg mt-2" />
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: leaderboard[2].avatarColor }}
                  >
                    {leaderboard[2].name.charAt(0)}
                  </div>
                  <p className="text-white font-medium">{leaderboard[2].name}</p>
                  <p className="text-2xl">🥉</p>
                  <p className="text-yellow-400 font-bold">{leaderboard[2].score} pts</p>
                  <div className="w-16 h-16 bg-orange-500/30 rounded-t-lg mt-2" />
                </div>
              )}
            </div>
          </div>

          {/* My Stats */}
          {!isTeacher && myStats && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Results</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-white">#{myRank}</p>
                  <p className="text-white/70 text-sm">Rank</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-400">{myStats.score}</p>
                  <p className="text-white/70 text-sm">Points</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">
                    {myStats.answers.filter(a => a.correct).length}/{session.questions.length}
                  </p>
                  <p className="text-white/70 text-sm">Correct</p>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Final Standings</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {leaderboard.map((student, index) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    student.id === userId ? 'bg-white/20' : 'bg-white/5'
                  }`}
                >
                  <span className="text-xl w-8 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: student.avatarColor }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{student.name}</p>
                    <p className="text-white/50 text-sm">
                      {student.answers.filter(a => a.correct).length}/{session.questions.length} correct
                    </p>
                  </div>
                  <span className="text-yellow-400 font-bold text-lg">{student.score}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ClassroomMode;
