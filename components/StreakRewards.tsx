import React, { useState, useEffect } from 'react';
import { 
  streakRewardsService, 
  DailyStreak, 
  DailyReward, 
  Challenge, 
  RewardNotification 
} from '../services/streakRewardsService';

interface StreakRewardsProps {
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
}

type Tab = 'streak' | 'rewards' | 'challenges';

const StreakRewards: React.FC<StreakRewardsProps> = ({ onClose, onXpEarned }) => {
  const [activeTab, setActiveTab] = useState<Tab>('streak');
  const [streak, setStreak] = useState<DailyStreak>(streakRewardsService.getStreak());
  const [rewards, setRewards] = useState<DailyReward[]>(streakRewardsService.getDailyRewards());
  const [challenges, setChallenges] = useState<Challenge[]>(streakRewardsService.getChallenges());
  const [notifications, setNotifications] = useState<RewardNotification[]>([]);
  const [showNotification, setShowNotification] = useState<RewardNotification | null>(null);

  useEffect(() => {
    // Check daily login
    const loginResult = streakRewardsService.checkDailyLogin();
    setStreak(streakRewardsService.getStreak());
    setRewards(streakRewardsService.getDailyRewards());
    
    if (loginResult.rewards.length > 0) {
      setNotifications(loginResult.rewards);
      setShowNotification(loginResult.rewards[0]);

      // Calculate XP from rewards
      const totalXp = loginResult.rewards.reduce((sum, n) => {
        if (n.reward?.type === 'xp') {
          return sum + (n.reward.value as number);
        }
        return sum;
      }, 0);

      if (totalXp > 0 && onXpEarned) {
        onXpEarned(totalXp);
      }
    }
  }, [onXpEarned]);

  const handleClaimChallenge = (challengeId: string) => {
    const claimed = streakRewardsService.claimChallenge(challengeId);
    if (claimed) {
      setChallenges(streakRewardsService.getChallenges());
      
      if (claimed.reward.type === 'xp' && onXpEarned) {
        onXpEarned(claimed.reward.value as number);
      }
    }
  };

  const dismissNotification = () => {
    if (notifications.length > 1) {
      const remaining = notifications.slice(1);
      setNotifications(remaining);
      setShowNotification(remaining[0]);
    } else {
      setNotifications([]);
      setShowNotification(null);
    }
  };

  const tabs = [
    { id: 'streak', label: 'Streak', icon: '🔥' },
    { id: 'rewards', label: 'Daily Rewards', icon: '🎁' },
    { id: 'challenges', label: 'Challenges', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4">
      {/* Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 max-w-sm w-full text-center animate-bounce-in">
            <div className="text-6xl mb-4">
              {showNotification.type === 'streak' && '🔥'}
              {showNotification.type === 'daily_reward' && '🎁'}
              {showNotification.type === 'challenge_complete' && '🎯'}
              {showNotification.type === 'achievement' && '🏆'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{showNotification.title}</h2>
            <p className="text-white/90 mb-4">{showNotification.message}</p>
            {showNotification.reward && (
              <div className="bg-white/20 rounded-xl p-3 mb-4">
                <p className="text-white font-bold">
                  +{showNotification.reward.value} {showNotification.reward.type.toUpperCase()}
                </p>
              </div>
            )}
            <button
              onClick={dismissNotification}
              className="w-full py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-white/90 transition-all"
            >
              {notifications.length > 1 ? 'Next' : 'Awesome!'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🔥 Streaks & Rewards</h1>
            <p className="text-white/60">Keep learning every day!</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Streak Display */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-6 text-center">
          <div className="text-6xl font-bold text-white mb-2">{streak.currentStreak}</div>
          <div className="text-white/90 text-lg mb-4">Day Streak 🔥</div>
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-white/70">Longest</p>
              <p className="text-white font-bold">{streak.longestStreak} days</p>
            </div>
            <div>
              <p className="text-white/70">Total Days</p>
              <p className="text-white font-bold">{streak.totalDaysActive}</p>
            </div>
            <div>
              <p className="text-white/70">Freezes</p>
              <p className="text-white font-bold">❄️ {streak.streakFreezes}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
          {/* Streak Tab */}
          {activeTab === 'streak' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Streak Milestones</h3>
              
              {[7, 14, 30, 60, 100].map(milestone => {
                const achieved = streak.longestStreak >= milestone;
                const progress = Math.min((streak.currentStreak / milestone) * 100, 100);
                
                return (
                  <div
                    key={milestone}
                    className={`p-4 rounded-xl ${achieved ? 'bg-green-500/20' : 'bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {milestone === 7 && '🔥'}
                          {milestone === 14 && '🌟'}
                          {milestone === 30 && '👑'}
                          {milestone === 60 && '💎'}
                          {milestone === 100 && '🏆'}
                        </span>
                        <div>
                          <p className="text-white font-medium">{milestone} Day Streak</p>
                          <p className="text-white/60 text-sm">
                            {achieved ? 'Achieved!' : `${milestone - streak.currentStreak} days to go`}
                          </p>
                        </div>
                      </div>
                      {achieved && <span className="text-2xl">✅</span>}
                    </div>
                    
                    {!achieved && (
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Daily Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Weekly Rewards Calendar</h3>
              
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const reward = rewards[i];
                  const today = (new Date().getDay() || 7) - 1; // 0-6 (Mon-Sun)
                  const isToday = i === today;
                  const isPast = i < today;
                  
                  return (
                    <div
                      key={day}
                      className={`p-2 rounded-xl text-center ${
                        isToday
                          ? 'bg-yellow-500 ring-2 ring-yellow-300'
                          : reward?.claimed
                          ? 'bg-green-500/30'
                          : isPast
                          ? 'bg-red-500/20'
                          : 'bg-white/10'
                      }`}
                    >
                      <p className="text-xs text-white/70">{day}</p>
                      <p className="text-xl my-1">
                        {reward?.claimed ? '✅' :
                         reward?.type === 'xp' ? '⭐' :
                         reward?.type === 'badge' ? '🏅' :
                         reward?.type === 'avatar_item' ? '✨' :
                         reward?.type === 'streak_freeze' ? '❄️' : '🎁'}
                      </p>
                      <p className="text-xs text-white/60">
                        {reward?.type === 'xp' ? `${reward.value} XP` :
                         reward?.type === 'badge' ? 'Badge' :
                         reward?.type === 'avatar_item' ? 'Item' :
                         reward?.type === 'streak_freeze' ? 'Freeze' : ''}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-white/70 text-sm mb-2">Collect all 7 days for bonus rewards!</p>
                <div className="flex justify-center gap-1">
                  {rewards.map((r, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${r.claimed ? 'bg-green-400' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🎯 Daily Challenges</h3>
                {challenges.filter(c => c.type === 'daily').map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onClaim={handleClaimChallenge}
                  />
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📅 Weekly Challenges</h3>
                {challenges.filter(c => c.type === 'weekly').map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onClaim={handleClaimChallenge}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Challenge Card Component
const ChallengeCard: React.FC<{
  challenge: Challenge;
  onClaim: (id: string) => void;
}> = ({ challenge, onClaim }) => {
  const progress = Math.min((challenge.progress / challenge.requirement.count) * 100, 100);
  const timeLeft = new Date(challenge.endDate).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  return (
    <div className={`p-4 rounded-xl mb-3 ${challenge.claimed ? 'bg-green-500/20' : 'bg-white/5'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white font-medium">{challenge.title}</p>
          <p className="text-white/60 text-sm">{challenge.description}</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-400 font-bold text-sm">
            {challenge.reward.type === 'xp' ? `+${challenge.reward.value} XP` :
             challenge.reward.type === 'badge' ? '🏅 Badge' :
             challenge.reward.type === 'avatar_item' ? '✨ Item' : '🎁'}
          </p>
          <p className="text-white/40 text-xs">{hoursLeft}h left</p>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${
            challenge.completed ? 'bg-green-400' : 'bg-blue-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-white/60 text-sm">
          {challenge.progress}/{challenge.requirement.count}
        </p>
        
        {challenge.completed && !challenge.claimed && (
          <button
            onClick={() => onClaim(challenge.id)}
            className="px-4 py-1 bg-yellow-500 text-black font-bold rounded-full text-sm hover:bg-yellow-400 transition-all"
          >
            Claim!
          </button>
        )}
        
        {challenge.claimed && (
          <span className="text-green-400 text-sm">✓ Claimed</span>
        )}
      </div>
    </div>
  );
};

export default StreakRewards;
