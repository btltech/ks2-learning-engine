import { useState, useEffect } from 'react';
import { microlearningService, MicroSession } from '../services/microlearningService';
import MicrolearningCard from './MicrolearningCard';

export default function MicrolearningDashboard() {
  const [sessions, setSessions] = useState<MicroSession[]>([]);
  const [progress, setProgress] = useState({ completed: 0, goal: 3, percentage: 0 });
  const [dailyChallenge, setDailyChallenge] = useState<MicroSession | null>(null);
  const [recommended, setRecommended] = useState<MicroSession | null>(null);

  useEffect(() => {
    // Load sessions
    setSessions(microlearningService.getAvailableSessions());
    setProgress(microlearningService.getTodayProgress());
    setDailyChallenge(microlearningService.getDailyChallenge());
    setRecommended(microlearningService.getRecommendedSession());
  }, []);

  const handleSessionStart = (session: MicroSession) => {
    console.log('Starting micro session:', session);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            5-Minute Challenges ⚡
          </h1>
          <p className="text-gray-600 text-lg">
            Quick learning sessions that fit into your day
          </p>
        </div>

        {/* Daily Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Progress</h2>
              <p className="text-gray-600">
                {microlearningService.getMotivationalMessage()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600">
                {progress.completed}/{progress.goal}
              </div>
              <div className="text-sm text-gray-500">sessions</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* Goal Achievement */}
          {progress.percentage >= 100 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-green-800 font-semibold text-center">
                🎉 Daily goal achieved! You're amazing!
              </p>
            </div>
          )}
        </div>

        {/* Daily Challenge (Featured) */}
        {dailyChallenge && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌟</span>
              <h2 className="text-2xl font-bold text-gray-900">Today's Featured Challenge</h2>
            </div>
            <div className="max-w-md">
              <MicrolearningCard
                session={dailyChallenge}
                onStart={handleSessionStart}
              />
            </div>
          </div>
        )}

        {/* Recommended for You */}
        {recommended && recommended.id !== dailyChallenge?.id && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            </div>
            <div className="max-w-md">
              <MicrolearningCard
                session={recommended}
                onStart={handleSessionStart}
              />
            </div>
          </div>
        )}

        {/* All Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            All Quick Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <MicrolearningCard
                key={session.id}
                session={session}
                onStart={handleSessionStart}
              />
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Pro Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Best time: Morning before school or evening before bed</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Complete 3 sessions daily to build a strong learning habit</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Each session is timed - focus and try your best!</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Earn bonus points for completing your daily goal</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
