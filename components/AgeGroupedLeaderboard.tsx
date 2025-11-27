import React, { useMemo, useState } from 'react';
import { TrophyIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useRealtimeLeaderboard } from '../hooks/useRealtimeListeners';

interface AgeGroupedLeaderboardProps {
  studentId?: string;
  studentAge?: number;
  limit?: number;
}

const AgeGroupedLeaderboard: React.FC<AgeGroupedLeaderboardProps> = ({
  studentId,
  studentAge = 10,
  limit = 10,
}) => {
  const [viewMode, setViewMode] = useState<'age-group' | 'global'>('age-group');
  const { leaderboard, loading, error } = useRealtimeLeaderboard(limit, studentAge - 2, studentAge + 2);

  // Get global leaderboard without age restrictions
  const { leaderboard: globalLeaderboard } = useRealtimeLeaderboard(limit);

  const currentLeaderboard = viewMode === 'age-group' ? leaderboard : globalLeaderboard;

  // Calculate student's rank
  const studentRank = useMemo(() => {
    if (!studentId) return null;
    const rank = currentLeaderboard.findIndex((student) => student.id === studentId) + 1;
    return rank > 0 ? rank : null;
  }, [currentLeaderboard, studentId]);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-400 to-gray-600';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('age-group')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === 'age-group'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👥 Age Group
          </button>
          <button
            onClick={() => setViewMode('global')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === 'global'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌍 Global
          </button>
        </div>
      </div>

      {/* Student's Rank Card */}
      {studentId && studentRank && (
        <div className={`bg-gradient-to-r ${getRankColor(studentRank)} rounded-xl shadow-lg p-6 mb-8 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold opacity-90">Your Rank</p>
              <p className="text-4xl font-black mt-2">{getMedalEmoji(studentRank)}</p>
              <p className="text-sm opacity-90 mt-2">
                {viewMode === 'age-group'
                  ? `Age ${studentAge - 2}-${studentAge + 2} Group`
                  : 'Global Rankings'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Points</p>
              <p className="text-5xl font-black mt-2">
                {currentLeaderboard.find((s) => s.id === studentId)?.totalPoints || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <SparklesIcon className="h-8 w-8 text-purple-500" />
          </div>
          <p className="ml-3 text-gray-600">Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-bold">Error loading leaderboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : currentLeaderboard.length > 0 ? (
        <div className="space-y-2">
          {currentLeaderboard.map((student, idx) => {
            const rank = idx + 1;
            const isCurrentStudent = student.id === studentId;
            return (
              <div
                key={student.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  isCurrentStudent
                    ? 'bg-purple-50 border-2 border-purple-300 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Rank Medal */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${
                    rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                      : rank === 2
                      ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                      : rank === 3
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                      : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                  }`}
                >
                  {rank <= 3 ? getMedalEmoji(rank).replace(/[🥇🥈🥉]/gu, (m) => m) : rank}
                </div>

                {/* Student Info */}
                <div className="flex-grow">
                  <p className={`font-bold text-gray-800 flex items-center gap-2 ${isCurrentStudent ? 'text-purple-700' : ''}`}>
                    {student.name}
                    {isCurrentStudent && <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full font-bold">You</span>}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Age {student.age} • {student.totalPoints} points</p>
                </div>

                {/* Points & Streak */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-black text-blue-600">{student.totalPoints}</p>
                      <p className="text-xs text-gray-500 font-bold">points</p>
                    </div>
                    {student.currentStreak && student.currentStreak > 0 && (
                      <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                        <span>🔥</span>
                        <p className="text-sm font-bold text-orange-600">{student.currentStreak}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No students in this leaderboard yet</p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <p className="font-bold mb-1">💡 How it works:</p>
        <p>
          {viewMode === 'age-group'
            ? `Compete with students aged ${studentAge - 2}-${studentAge + 2}. Earn points by completing quizzes, lessons, and unlocking badges!`
            : 'View global rankings of all students. Show off your learning progress!'}
        </p>
      </div>
    </div>
  );
};

export default AgeGroupedLeaderboard;
