import React from 'react';
import { useUser } from '../context/UserContext';
import { TrophyIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';

// Mock data for leaderboard
const MOCK_LEADERBOARD: { id: string; name: string; points: number; avatar: string; streak: number; isCurrentUser: boolean }[] = [
  // { id: '2', name: 'Sarah', points: 1250, avatar: '🦊', streak: 5, isCurrentUser: false },
  // { id: '3', name: 'Mike', points: 980, avatar: '🦁', streak: 3, isCurrentUser: false },
  // { id: '4', name: 'Emma', points: 850, avatar: '🐼', streak: 12, isCurrentUser: false },
  // { id: '5', name: 'Leo', points: 720, avatar: '🐯', streak: 2, isCurrentUser: false },
];

interface LeaderboardViewProps {
  onBack: () => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const { user } = useUser();

  // Combine user with mock data and sort
  const leaderboardData = [
    ...MOCK_LEADERBOARD,
    { 
      id: user?.id || '1', 
      name: user?.name || 'You', 
      points: user?.totalPoints || 0, 
      avatar: '👤', // Could use user avatar config here
      streak: user?.streak || 0,
      isCurrentUser: true
    }
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <button 
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-800 font-bold flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white text-center">
          <TrophyIcon className="h-16 w-16 mx-auto mb-2 text-yellow-100" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="opacity-90">Track your progress!</p>
        </div>

        <div className="p-4">
          {leaderboardData.map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center p-4 mb-3 rounded-xl transition-all ${
                player.isCurrentUser 
                  ? 'bg-blue-50 border-2 border-blue-400 transform scale-105 shadow-md' 
                  : 'bg-gray-50 border border-gray-100'
              }`}
            >
              <div className="w-8 text-2xl font-bold text-gray-400 text-center mr-4">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>
              
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mr-4 border-2 border-gray-100">
                {player.avatar}
              </div>

              <div className="flex-grow">
                <h3 className={`font-bold text-lg ${player.isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                  {player.name} {player.isCurrentUser && '(You)'}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                  {player.streak} day streak
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-xl text-indigo-600 flex items-center justify-end">
                  {player.points}
                  <StarIcon className="h-5 w-5 ml-1 text-yellow-400" />
                </div>
                <div className="text-xs text-gray-400">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
