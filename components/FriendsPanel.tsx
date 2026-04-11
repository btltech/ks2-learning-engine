import { useState, useEffect } from 'react';
import { socialLearningService, Friend, FriendChallenge } from '../services/socialLearningService';
import { useNavigate } from 'react-router-dom';

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<FriendChallenge[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setFriends(socialLearningService.getFriends());
    setChallenges(socialLearningService.getPendingChallenges());
  };

  const handleChallengeFriend = (friend: Friend) => {
    const challenge = socialLearningService.createChallenge(
      friend.userId,
      'Maths',
      'Mixed',
      'Medium',
      10
    );
    
    alert(`Challenge sent to ${friend.displayName}! 🎯`);
    loadData();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>👥</span> Friends
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddFriend(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>+</span> Add Friend
        </button>
      </div>

      {/* Pending Challenges */}
      {challenges.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <h3 className="font-bold text-yellow-900 mb-2">
            ⚔️ Pending Challenges ({challenges.length})
          </h3>
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div key={challenge.challengeId} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{challenge.fromUserName}</p>
                  <p className="text-sm text-gray-600">
                    {challenge.subject} • {challenge.topic} • {challenge.questionCount} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      socialLearningService.acceptChallenge(challenge.challengeId);
                      navigate('/quiz', { state: { challengeId: challenge.challengeId } });
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg font-semibold text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      socialLearningService.declineChallenge(challenge.challengeId);
                      loadData();
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded-lg font-semibold text-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-3">
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👋</div>
            <p className="text-gray-600 mb-4">No friends yet!</p>
            <button
              onClick={() => setShowAddFriend(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Your First Friend
            </button>
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.userId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {friend.displayName[0]}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{friend.displayName}</p>
                    {friend.status === 'online' && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Level {friend.level} • {friend.points.toLocaleString()} points
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleChallengeFriend(friend)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  ⚔️ Challenge
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${friend.displayName} from friends?`)) {
                      socialLearningService.removeFriend(friend.userId);
                      loadData();
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 px-2"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Friends Leaderboard */}
      {friends.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
          <h3 className="font-bold text-purple-900 mb-3">🏆 Friends Leaderboard</h3>
          <div className="space-y-2">
            {socialLearningService
              .getFriendsLeaderboard()
              .slice(0, 5)
              .map((friend, index) => (
                <div
                  key={friend.userId}
                  className="flex items-center justify-between bg-white p-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg w-6">#{index + 1}</span>
                    <span className="font-semibold">{friend.displayName}</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    {friend.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Add Friend</h3>
            
            <input
              type="text"
              placeholder="Search by name or friend code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddFriend(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (searchQuery) {
                    socialLearningService.sendFriendRequest(searchQuery);
                    setShowAddFriend(false);
                    setSearchQuery('');
                    alert('Friend request sent! 🎉');
                  }
                }}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
