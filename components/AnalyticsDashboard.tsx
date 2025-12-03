import React, { useState, useEffect } from 'react';
import { analyticsService, AnalyticsSummary, TopicPerformance, DailyActivity } from '../services/analyticsService';
import { streakRewardsService } from '../services/streakRewardsService';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

type Tab = 'overview' | 'topics' | 'activity' | 'weekly';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = analyticsService.getSummary();
    setSummary(data);
    setLoading(false);
  }, []);

  if (loading || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  const streak = streakRewardsService.getStreak();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'topics', label: 'Topics', icon: '📚' },
    { id: 'activity', label: 'Activity', icon: '📅' },
    { id: 'weekly', label: 'Weekly', icon: '📈' },
  ];

  const getMasteryColor = (level: TopicPerformance['masteryLevel']) => {
    switch (level) {
      case 'mastered': return 'text-green-400';
      case 'proficient': return 'text-blue-400';
      case 'learning': return 'text-yellow-400';
      case 'struggling': return 'text-red-400';
    }
  };

  const getMasteryBg = (level: TopicPerformance['masteryLevel']) => {
    switch (level) {
      case 'mastered': return 'bg-green-500/20';
      case 'proficient': return 'bg-blue-500/20';
      case 'learning': return 'bg-yellow-500/20';
      case 'struggling': return 'bg-red-500/20';
    }
  };

  const getTrendIcon = (trend: TopicPerformance['trend']) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h1>
            <p className="text-white/60">Track your learning progress</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{summary.totalQuizzes}</p>
            <p className="text-white/60 text-sm">Total Quizzes</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{summary.overallAccuracy}%</p>
            <p className="text-white/60 text-sm">Accuracy</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{streak.currentStreak}</p>
            <p className="text-white/60 text-sm">Day Streak 🔥</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{summary.totalTimeMinutes}</p>
            <p className="text-white/60 text-sm">Minutes Studied</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Study Pattern */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">📚 Study Patterns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm">Preferred Time</p>
                    <p className="text-white font-medium capitalize">
                      {summary.studyPattern.preferredTime === 'morning' && '🌅 '}
                      {summary.studyPattern.preferredTime === 'afternoon' && '☀️ '}
                      {summary.studyPattern.preferredTime === 'evening' && '🌆 '}
                      {summary.studyPattern.preferredTime === 'night' && '🌙 '}
                      {summary.studyPattern.preferredTime}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm">Avg Session</p>
                    <p className="text-white font-medium">{summary.studyPattern.avgSessionLength} min</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm">Most Active</p>
                    <p className="text-white font-medium">{summary.studyPattern.mostActiveDay}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">💡 Recommendations</h3>
                <div className="space-y-2">
                  {summary.recommendations.map((rec, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-xl">💡</span>
                      <p className="text-white/80">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Struggling Topics */}
              {summary.weeklyReport.struggleAreas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">⚠️ Areas to Focus On</h3>
                  <div className="space-y-2">
                    {summary.weeklyReport.struggleAreas.map((topic, i) => (
                      <div key={i} className="bg-red-500/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{topic.subject} - {topic.topic}</p>
                          <p className="text-white/60 text-sm">{topic.suggestion}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 font-bold">{topic.score}%</p>
                          <p className="text-white/40 text-xs">{topic.attempts} attempts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Topic Performance</h3>
              
              {summary.topicPerformance.length === 0 ? (
                <p className="text-white/60 text-center py-8">
                  Complete some quizzes to see your topic performance!
                </p>
              ) : (
                <div className="space-y-3">
                  {summary.topicPerformance.map((topic, i) => (
                    <div
                      key={`${topic.subject}-${topic.topic}`}
                      className={`${getMasteryBg(topic.masteryLevel)} rounded-xl p-4`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{topic.topic}</p>
                          <p className="text-white/60 text-sm">{topic.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getMasteryColor(topic.masteryLevel)}`}>
                            {topic.avgScore}%
                          </p>
                          <p className="text-white/40 text-xs">
                            {getTrendIcon(topic.trend)} {topic.totalAttempts} attempts
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            topic.avgScore >= 90 ? 'bg-green-400' :
                            topic.avgScore >= 70 ? 'bg-blue-400' :
                            topic.avgScore >= 50 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${topic.avgScore}%` }}
                        />
                      </div>

                      <div className="flex justify-between mt-2 text-xs text-white/40">
                        <span>Best: {topic.bestScore}%</span>
                        <span className="capitalize">{topic.masteryLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Activity (Last 30 Days)</h3>
              
              {/* Activity Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-white/40 text-xs py-1">{day}</div>
                ))}
                {summary.dailyActivity.map((day, i) => {
                  const intensity = day.quizzesCompleted > 0
                    ? Math.min(day.quizzesCompleted / 5, 1)
                    : 0;
                  return (
                    <div
                      key={day.date}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor: intensity > 0
                          ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`
                          : 'rgba(255, 255, 255, 0.05)',
                      }}
                      title={`${day.date}: ${day.quizzesCompleted} quizzes`}
                    />
                  );
                })}
              </div>

              {/* Recent Activity List */}
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Recent Days</h4>
                <div className="space-y-2">
                  {summary.dailyActivity.slice(-7).reverse().map((day) => (
                    <div
                      key={day.date}
                      className="bg-white/5 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {new Date(day.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-white/60 text-sm">
                          {day.subjectsStudied.join(', ') || 'No activity'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{day.quizzesCompleted} quizzes</p>
                        <p className="text-green-400 text-sm">
                          {day.questionsAnswered > 0
                            ? `${Math.round((day.correctAnswers / day.questionsAnswered) * 100)}% correct`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weekly Tab */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">This Week's Summary</h3>
                <p className="text-white/40 text-sm">
                  {new Date(summary.weeklyReport.weekStart).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  {' - '}
                  {new Date(summary.weeklyReport.weekEnd).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Weekly Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{summary.weeklyReport.totalQuizzes}</p>
                  <p className="text-white/60 text-xs">Quizzes</p>
                  <p className={`text-xs ${summary.weeklyReport.comparedToLastWeek.quizzes >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.weeklyReport.comparedToLastWeek.quizzes >= 0 ? '+' : ''}
                    {summary.weeklyReport.comparedToLastWeek.quizzes} vs last week
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{summary.weeklyReport.avgAccuracy}%</p>
                  <p className="text-white/60 text-xs">Accuracy</p>
                  <p className={`text-xs ${summary.weeklyReport.comparedToLastWeek.accuracy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.weeklyReport.comparedToLastWeek.accuracy >= 0 ? '+' : ''}
                    {summary.weeklyReport.comparedToLastWeek.accuracy}%
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{summary.weeklyReport.totalTimeMinutes}</p>
                  <p className="text-white/60 text-xs">Minutes</p>
                  <p className={`text-xs ${summary.weeklyReport.comparedToLastWeek.time >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.weeklyReport.comparedToLastWeek.time >= 0 ? '+' : ''}
                    {summary.weeklyReport.comparedToLastWeek.time} min
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{summary.weeklyReport.xpEarned}</p>
                  <p className="text-white/60 text-xs">XP Earned</p>
                </div>
              </div>

              {/* Top Subject */}
              {summary.weeklyReport.topSubject && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/60 text-sm">Top Subject This Week</p>
                  <p className="text-white font-bold text-xl">{summary.weeklyReport.topSubject}</p>
                </div>
              )}

              {/* Achievements */}
              {summary.weeklyReport.achievements.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">🏆 Achievements Unlocked</h4>
                  <div className="flex flex-wrap gap-2">
                    {summary.weeklyReport.achievements.map((achievement, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm"
                      >
                        ⭐ {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Days */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-sm mb-2">Active Days</p>
                <div className="flex gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                    const weekStart = new Date(summary.weeklyReport.weekStart);
                    const dayDate = new Date(weekStart);
                    dayDate.setDate(weekStart.getDate() + i);
                    const dateStr = dayDate.toISOString().split('T')[0];
                    const activity = summary.dailyActivity.find(a => a.date === dateStr);
                    const isActive = activity && activity.quizzesCompleted > 0;
                    
                    return (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                          isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <p className="text-white/60 text-sm mt-2">
                  {summary.weeklyReport.streakDays} of 7 days active
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
