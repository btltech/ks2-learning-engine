import React, { useEffect, useState } from 'react';
import { ParentStats } from '../types';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { generateProgressReport, generateLearningInsights } from '../services/geminiService';

interface ParentDashboardProps {
  onClose: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onClose }) => {
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [progressReport, setProgressReport] = useState<string>('');
  const [learningInsights, setLearningInsights] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const { user, getPerformanceTrends } = useUser();

  useEffect(() => {
    // In a real app, this would be an async call
    const data = authService.getParentStats();
    setStats(data);
  }, []);

  const handleGenerateProgressReport = async () => {
    if (!user) return;
    setIsGeneratingReport(true);
    try {
      const report = await generateProgressReport(user, user.age, user.name);
      setProgressReport(report);
    } catch (error) {
      console.error('Error generating progress report:', error);
      setProgressReport('Sorry, I couldn\'t generate the progress report right now. Please try again later.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateLearningInsights = async () => {
    if (!user) return;
    setIsGeneratingInsights(true);
    try {
      // We'll need to get recent quiz results - for now using empty array
      const insights = await generateLearningInsights(user, [], user.age, user.name);
      setLearningInsights(insights);
    } catch (error) {
      console.error('Error generating learning insights:', error);
      setLearningInsights('Sorry, I couldn\'t generate learning insights right now. Please try again later.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (!stats) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-pop-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              👨‍👩‍👧 Parent Dashboard
            </h2>
            <p className="opacity-90">Track your child's progress</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <div className="text-purple-500 text-lg font-bold mb-2">Total Learning Time</div>
              <div className="text-4xl font-bold text-gray-800">
                {Math.floor(stats.totalTimeSpent / 60)}h {stats.totalTimeSpent % 60}m
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="text-blue-500 text-lg font-bold mb-2">Quizzes Completed</div>
              <div className="text-4xl font-bold text-gray-800">{stats.quizzesTaken}</div>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="text-green-500 text-lg font-bold mb-2">Average Score</div>
              <div className="text-4xl font-bold text-gray-800">{stats.averageScore}%</div>
            </div>
          </div>

          {/* MiRa Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Progress Report
              </h3>
              <p className="text-gray-600 mb-4">Get a detailed report on your child's learning journey</p>
              <button
                onClick={handleGenerateProgressReport}
                disabled={isGeneratingReport}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
              </button>
              {progressReport && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{progressReport}</pre>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                💡 Learning Insights
              </h3>
              <p className="text-gray-600 mb-4">Receive data-driven recommendations for supporting your child</p>
              <button
                onClick={handleGenerateLearningInsights}
                disabled={isGeneratingInsights}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingInsights ? 'Generating...' : 'Get Insights'}
              </button>
              {learningInsights && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{learningInsights}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border-2 border-green-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                💪 Strongest Subject
              </h3>
              <div className="text-2xl text-green-600 font-bold">{stats.strongestSubject}</div>
              <p className="text-gray-500 mt-2">Consistently high scores in this area.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-orange-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎯 Focus Area
              </h3>
              <div className="text-2xl text-orange-600 font-bold">{stats.weakestSubject}</div>
              <p className="text-gray-500 mt-2">Recommended for extra practice.</p>
            </div>
          </div>

          {/* Time Spent Learning Per Subject */}
          {user?.timeSpentLearning && Object.keys(user.timeSpentLearning).length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⏱️ Time Spent Learning (by Subject)
              </h3>
              <div className="space-y-3">
                {Object.entries(user.timeSpentLearning).map(([subject, minutes]) => {
                  const minutesNum = typeof minutes === 'number' ? minutes : 0;
                  return (
                    <div key={subject} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-semibold text-gray-700 w-24">{subject}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                            style={{
                              width: `${Math.min((minutesNum / 300) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-600 font-bold ml-4">{Math.round(minutesNum)} min</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly Progress & Goals */}
          {user?.weeklyProgress && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📅 Weekly Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Minutes This Week</p>
                  <p className="text-3xl font-bold text-blue-600">{user.weeklyProgress.minutesLearned}</p>
                  <p className="text-xs text-gray-500 mt-1">Goal: {user.weeklyGoal} mins</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Quizzes This Week</p>
                  <p className="text-3xl font-bold text-purple-600">{user.weeklyProgress.quizzesTaken}</p>
                  <p className="text-xs text-gray-500 mt-1">Avg: {user.weeklyProgress.averageScore}%</p>
                </div>
                <div className={`p-4 rounded-lg border ${user.weeklyProgress.goalMet ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                  <p className="text-sm text-gray-600">Weekly Goal</p>
                  <p className={`text-3xl font-bold ${user.weeklyProgress.goalMet ? 'text-green-600' : 'text-orange-600'}`}>
                    {user.weeklyProgress.goalMet ? '✅' : `${Math.round((user.weeklyProgress.minutesLearned / (user.weeklyGoal || 180)) * 100)}%`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{user.weeklyProgress.goalMet ? 'Goal Met!' : 'Keep going!'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Performance Trends */}
          {user && (
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📈 Performance Trends
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 font-semibold mb-2">Overall Performance</p>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-blue-600">
                      {getPerformanceTrends().avgScore}%
                    </div>
                    <div className="text-sm font-semibold mb-1" style={{
                      color: getPerformanceTrends().trend === 'improving' ? '#10b981' : 
                             getPerformanceTrends().trend === 'declining' ? '#ef4444' : '#f59e0b'
                    }}>
                      {getPerformanceTrends().trend === 'improving' ? '📈 Improving' :
                       getPerformanceTrends().trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700 font-semibold mb-2">Total Quizzes Taken</p>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-green-600">
                      {user.quizHistory?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Streak: {user.streak} days 🔥
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              {stats.recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="p-4 border-b border-gray-200 last:border-0 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="font-bold text-gray-800">{activity.activity}</div>
                      <div className="text-sm text-gray-500">{activity.date}</div>
                    </div>
                  </div>
                  {activity.score && (
                    <div className={`font-bold ${
                      activity.score >= 80 ? 'text-green-600' : 
                      activity.score >= 60 ? 'text-orange-500' : 'text-red-500'
                    }`}>
                      {activity.score}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
