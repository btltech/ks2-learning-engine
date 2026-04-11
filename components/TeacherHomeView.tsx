/**
 * Teacher Home View Component
 * 
 * Main dashboard for teachers - different from student home
 * Features:
 * - Class overview
 * - Student progress monitoring
 * - Assignment management
 * - Quick access to teacher tools
 */

import React, { useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { teacherAnalyticsService } from '../services/teacherAnalyticsService';

interface TeacherHomeViewProps {
  onOpenTeacherDashboard: () => void;
  onOpenClassroom: () => void;
  onOpenQuestionQuality: () => void;
  onOpenAnalytics: () => void;
  onOpenCurriculumCoverage: () => void;
}

export const TeacherHomeView: React.FC<TeacherHomeViewProps> = ({
  onOpenTeacherDashboard,
  onOpenClassroom,
  onOpenQuestionQuality,
  onOpenAnalytics,
  onOpenCurriculumCoverage,
}) => {
  const { user } = useUser();
  const [showWelcome, setShowWelcome] = useState(true);
  const classSummary = useMemo(() => {
    if (!user?.id) {
      return {
        classCount: 0,
        studentCount: 0,
        totalQuizzes: 0,
        averageScore: 0,
        needsHelp: 0,
      };
    }

    try {
      const classes = teacherAnalyticsService.getClasses(user.id);
      const analytics = classes.map((classData) => {
        try {
          return teacherAnalyticsService.getClassAnalytics(user.id, classData.classId);
        } catch {
          return null;
        }
      }).filter(Boolean);

      return {
        classCount: classes.length,
        studentCount: classes.reduce((sum, classData) => sum + classData.students.length, 0),
        totalQuizzes: analytics.reduce((sum, classData) => sum + (classData?.totalQuizzes || 0), 0),
        averageScore: analytics.length > 0
          ? Math.round(analytics.reduce((sum, classData) => sum + (classData?.averageScore || 0), 0) / analytics.length)
          : 0,
        needsHelp: analytics.reduce((sum, classData) => sum + (classData?.needingHelp.length || 0), 0),
      };
    } catch {
      return {
        classCount: 0,
        studentCount: 0,
        totalQuizzes: 0,
        averageScore: 0,
        needsHelp: 0,
      };
    }
  }, [user?.id]);

  const hasClasses = classSummary.classCount > 0;

  const quickActions = [
    {
      icon: '👩‍🏫',
      title: 'Class Dashboard',
      description: 'Set up classes, review learners, and spot who needs support',
      color: 'from-indigo-500 to-purple-600',
      priority: 'primary',
      onClick: onOpenTeacherDashboard,
    },
    {
      icon: '📚',
      title: 'Classroom Mode',
      description: 'Start a live classroom session',
      color: 'from-green-500 to-teal-600',
      priority: 'secondary',
      onClick: onOpenClassroom,
    },
    {
      icon: '📊',
      title: 'Question Quality',
      description: 'Review weak or ambiguous questions before pupils see them',
      color: 'from-orange-500 to-red-600',
      priority: 'attention',
      onClick: onOpenQuestionQuality,
    },
    {
      icon: '📈',
      title: 'Analytics',
      description: 'Detailed learning analytics',
      color: 'from-blue-500 to-cyan-600',
      priority: 'secondary',
      onClick: onOpenAnalytics,
    },
    {
      icon: '🎯',
      title: 'Curriculum Coverage',
      description: 'Track curriculum alignment',
      color: 'from-pink-500 to-rose-600',
      priority: 'secondary',
      onClick: onOpenCurriculumCoverage,
    },
  ];

  const recentUpdates = [
    { icon: '📝', text: 'New question bank features available', time: 'Today' },
    { icon: '🎮', text: 'Games unlock feature added for students', time: 'Today' },
    { icon: '📊', text: 'Question performance tracking live', time: 'Yesterday' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6" id="main-content">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6 relative">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            ✕
          </button>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-center gap-4">
            <div className="text-5xl">👋</div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Teacher'}!</h1>
              <p className="text-indigo-200 mt-1">
                Start with the class dashboard, then use quality tools when something needs review.
              </p>
            </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onOpenTeacherDashboard}
                className="bg-white text-indigo-700 px-5 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors"
              >
                Open Class Dashboard
              </button>
              <button
                onClick={onOpenClassroom}
                className="bg-white/15 text-white px-5 py-3 rounded-lg font-bold hover:bg-white/25 transition-colors"
              >
                Start Live Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="👥"
          label="Students"
          value={hasClasses ? classSummary.studentCount : 'Not set'}
          subtext={hasClasses ? `${classSummary.classCount} class${classSummary.classCount === 1 ? '' : 'es'}` : 'Create or connect a class'}
        />
        <StatCard
          icon="📝"
          label="Quizzes"
          value={hasClasses ? classSummary.totalQuizzes : 'None'}
          subtext={hasClasses ? 'From class activity' : 'Assign practice from dashboard'}
        />
        <StatCard
          icon="📊"
          label="Class Trend"
          value={hasClasses && classSummary.totalQuizzes > 0 ? `${classSummary.averageScore}%` : 'Waiting'}
          subtext={classSummary.totalQuizzes > 0 ? 'Average score' : 'Appears after quizzes'}
        />
        <StatCard
          icon="⚡"
          label="Needs Support"
          value={hasClasses ? classSummary.needsHelp : 'Check'}
          subtext={hasClasses ? 'Students below 60%' : 'Question quality queue'}
        />
      </div>

      {/* Decision Prompt */}
      <div className="bg-white border border-indigo-100 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-600 font-bold mb-1">Next best action</p>
            <h2 className="text-xl font-bold text-gray-800">Set up your teaching workspace</h2>
            <p className="text-sm text-gray-600 mt-1">
              {hasClasses
                ? 'Open the class dashboard to review student lists, weak topics, and class reports from saved class data.'
                : 'Connect students first. Once quiz activity exists, this page can surface weak topics, recent changes, and content that needs attention.'}
            </p>
          </div>
          <button
            onClick={onOpenTeacherDashboard}
            className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-bold"
          >
            Manage Class
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Teacher Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`bg-gradient-to-br ${action.color} rounded-xl p-5 text-white text-left
                         transform transition-all hover:scale-[1.02] hover:shadow-lg ${
                           action.priority === 'primary' ? 'md:col-span-2 ring-4 ring-indigo-100' : ''
                         } ${action.priority === 'attention' ? 'ring-4 ring-orange-100' : ''}`}
            >
              {action.priority === 'primary' && (
                <span className="inline-flex bg-white/20 text-xs font-bold px-2 py-1 rounded-md mb-3">Start here</span>
              )}
              {action.priority === 'attention' && (
                <span className="inline-flex bg-white/20 text-xs font-bold px-2 py-1 rounded-md mb-3">Quality check</span>
              )}
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-bold text-lg">{action.title}</h3>
              <p className="text-white/80 text-sm mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Student Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>Student activity will appear here</p>
            <p className="text-sm">Once students are in your class</p>
          </div>
        </div>

        {/* Platform Updates */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Updates</h3>
          <div className="space-y-3">
            {recentUpdates.map((update, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{update.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{update.text}</p>
                  <p className="text-xs text-gray-500">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Need Help Getting Started?</h3>
            <p className="text-sm text-gray-600">Check out our teacher guides and tutorials</p>
          </div>
          <button 
            onClick={() => window.location.href = '/teacher-guide'}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Guides
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
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

export default TeacherHomeView;
