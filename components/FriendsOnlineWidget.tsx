import { useState, useEffect } from 'react';
import { socialLearningService, Friend } from '../services/socialLearningService';
import { useNavigate } from 'react-router-dom';

export default function FriendsOnlineWidget() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadFriends();
    const interval = setInterval(loadFriends, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadFriends = () => {
    const allFriends = socialLearningService.getFriends();
    setFriends(allFriends.slice(0, 5)); // Show top 5
    setOnlineCount(allFriends.filter(f => f.status === 'online').length);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span>👥</span> Friends
        {onlineCount > 0 && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {onlineCount} online
          </span>
        )}
      </h3>

      {friends.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">👋</div>
          <p className="text-sm text-gray-600 mb-3">Add friends to compete!</p>
          <button
            onClick={() => navigate('/progress?tab=friends')}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Add Friends
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-3">
            {friends.map(friend => (
              <div
                key={friend.userId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('/progress?tab=friends')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {friend.displayName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {friend.displayName}
                      </span>
                      {friend.status === 'online' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">Level {friend.level}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{friend.points} pts</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/progress?tab=friends')}
            className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold text-sm transition-colors"
          >
            View All Friends
          </button>
        </>
      )}
    </div>
  );
}
