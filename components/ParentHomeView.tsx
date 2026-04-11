/**
 * Parent Home View Component
 * 
 * Main dashboard for parents - focused on monitoring children's progress
 * Features:
 * - Children overview
 * - Progress monitoring
 * - Activity reports
 * - Parental controls
 */

import React, { useState } from 'react';
import Footer from './Footer';
import { useUser } from '../context/UserContext';

interface ParentHomeViewProps {
  onOpenParentDashboard: () => void;
  onOpenParentMonitoring: () => void;
  onOpenAnalytics: () => void;
  onSwitchToChild: () => void;
}

export const ParentHomeView: React.FC<ParentHomeViewProps> = ({
  onOpenParentDashboard,
  onOpenParentMonitoring,
  onOpenAnalytics,
  onSwitchToChild,
}) => {
  const { user, currentChild } = useUser();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showChildPreview, setShowChildPreview] = useState(false);

  const openChildPreview = () => {
    if (!currentChild) {
      onSwitchToChild();
      return;
    }
    setShowChildPreview(true);
  };

  const quickActions = [
    {
      icon: '👀',
      title: 'Monitor Progress',
      description: currentChild ? `Review ${currentChild.name}'s latest activity` : 'Link a child to unlock progress tracking',
      color: 'from-purple-500 to-indigo-600',
      onClick: onOpenParentMonitoring,
    },
    {
      icon: '📊',
      title: 'Parent Dashboard',
      description: 'Overview of all children',
      color: 'from-blue-500 to-cyan-600',
      onClick: onOpenParentDashboard,
    },
    {
      icon: '📈',
      title: 'Learning Analytics',
      description: 'Performance insights',
      color: 'from-green-500 to-teal-600',
      onClick: onOpenAnalytics,
    },
    {
      icon: '👧',
      title: 'Switch to Child View',
      description: 'See what your child sees',
      color: 'from-pink-500 to-rose-600',
      onClick: openChildPreview,
    },
  ];

  const tips = [
    { icon: '💡', text: 'Regular short sessions are better than long cramming', },
    { icon: '🎯', text: 'Focus on subjects where your child needs more practice', },
    { icon: '🏆', text: 'Celebrate achievements to boost motivation', },
    { icon: '📅', text: 'Set a consistent learning schedule', },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6" id="main-content">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 relative">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="text-5xl">👨‍👩‍👧</div>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Parent'}!</h1>
              <p className="text-purple-200 mt-1">
                Track your child's learning journey and help them succeed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Child Summary */}
      {currentChild ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl text-white">
                {currentChild.name?.charAt(0) || '👧'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{currentChild.name}</h2>
                <p className="text-gray-500">Age {currentChild.age} • {currentChild.totalPoints || 0} points</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-sm font-medium">{currentChild.streak || 0} day streak</span>
                </div>
              </div>
            </div>
            <button
              onClick={onOpenParentMonitoring}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Review Progress
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <div>
                <h3 className="font-semibold text-yellow-800">No child linked yet</h3>
                <p className="text-yellow-700 text-sm">
                  Share your parent code with your child's account to link them.
                  Your parent code: <span className="font-mono font-bold">{user?.parentCode || 'N/A'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onOpenParentMonitoring}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}

      {/* Next Action */}
      <div className="bg-white border border-purple-100 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-purple-600 font-bold mb-1">Next best action</p>
            <h2 className="text-xl font-bold text-gray-800">
              {currentChild ? `Check what ${currentChild.name} should practise next` : 'Invite your first learner'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentChild
                ? 'Review recent scores, streaks, and subject gaps before recommending practice.'
                : 'Share your parent code so your child can start learning and appear in this dashboard.'}
            </p>
          </div>
          <button
            onClick={onOpenParentMonitoring}
            className="bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition-colors font-bold"
          >
            {currentChild ? 'Open Monitoring' : 'Show Parent Code'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon="📚" 
          label="Quizzes Done" 
          value={currentChild?.quizHistory?.length || 0} 
          subtext="This week" 
        />
        <StatCard 
          icon="⭐" 
          label="Total Points" 
          value={currentChild?.totalPoints || 0} 
          subtext="Earned" 
        />
        <StatCard 
          icon="🔥" 
          label="Streak" 
          value={currentChild?.streak || 0} 
          subtext="Days" 
        />
        <StatCard 
          icon="🏆" 
          label="Badges" 
          value={currentChild?.badges?.length || 0} 
          subtext="Earned" 
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Parent Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`bg-gradient-to-br ${action.color} rounded-xl p-5 text-white text-left
                         transform transition-all hover:scale-[1.02] hover:shadow-lg ${
                           i === 0 ? 'md:col-span-2 ring-4 ring-purple-100' : ''
                         }`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-bold text-lg">{action.title}</h3>
              <p className="text-white/80 text-sm mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          {currentChild?.quizHistory && currentChild.quizHistory.length > 0 ? (
            <div className="space-y-3">
              {currentChild.quizHistory.slice(-5).reverse().map((quiz, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">📝</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {quiz.subject} - {quiz.topic}
                    </p>
                    <p className="text-xs text-gray-500">
                      Score: {quiz.score}% • {new Date(quiz.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No recent activity</p>
              <p className="text-sm">Your child's learning activity will appear here</p>
            </div>
          )}
        </div>

        {/* Tips for Parents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tips for Parents</h3>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">{tip.icon}</span>
                <p className="text-sm text-gray-700">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Need Help?</h3>
            <p className="text-sm text-gray-600">Learn how to make the most of your parent dashboard</p>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            View Guide
          </button>
        </div>
      </div>

      {showChildPreview && currentChild && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-5 rounded-t-xl flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-pink-100 font-bold">Read-only child preview</p>
                <h2 className="text-2xl font-bold">{currentChild.name}'s learning home</h2>
                <p className="text-pink-100 text-sm mt-1">This preview lets you check momentum without leaving your parent account.</p>
              </div>
              <button
                onClick={() => setShowChildPreview(false)}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg font-bold"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="⭐" label="Points" value={currentChild.totalPoints || 0} subtext="Earned" />
                <StatCard icon="🔥" label="Streak" value={currentChild.streak || 0} subtext="Days" />
                <StatCard icon="🏆" label="Badges" value={currentChild.badges?.length || 0} subtext="Unlocked" />
                <StatCard icon="📝" label="Quizzes" value={currentChild.quizHistory?.length || 0} subtext="Completed" />
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-bold mb-1">Next practice cue</p>
                <h3 className="text-lg font-bold text-gray-800">
                  {currentChild.quizHistory?.length
                    ? 'Use recent quiz results to pick one short practice task'
                    : 'Start with one lesson and one short quiz'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Keep the next session focused. One small win is better than a long session that feels like homework.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3">Recent quizzes</h3>
                {currentChild.quizHistory?.length ? (
                  <div className="space-y-3">
                    {currentChild.quizHistory.slice(-5).reverse().map((quiz) => (
                      <div key={quiz.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">{quiz.subject} · {quiz.topic}</p>
                          <p className="text-xs text-gray-500">{new Date(quiz.completedAt).toLocaleDateString()}</p>
                        </div>
                        <span className="font-bold text-purple-700">{quiz.score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No quizzes completed yet</p>
                    <p className="text-sm">Activity will appear here after your child starts learning.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer userRole="parent" />
    </div>
  );
};

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: number | string;
  subtext: string;
}> = ({ icon, label, value, subtext }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500">{subtext}</p>
  </div>
);

export default ParentHomeView;
