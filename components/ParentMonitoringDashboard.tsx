import React, { useState, useMemo } from 'react';
import { ChartBarIcon, AcademicCapIcon, FireIcon, StarIcon, ArrowLeftIcon, Cog6ToothIcon, TrashIcon, BellIcon } from '@heroicons/react/24/solid';
import ChildSelector from './ChildSelector';
import ParentActivityLog from './ParentActivityLog';
import ProgressNotifications, { Notification } from './ProgressNotifications';
import AgeGroupedLeaderboard from './AgeGroupedLeaderboard';
import SubjectProgressCharts from './SubjectProgressCharts';
import { useUser } from '../context/UserContext';

interface ParentMonitoringDashboardProps {
  onLogout: () => void;
}

const ParentMonitoringDashboard: React.FC<ParentMonitoringDashboardProps> = ({ onLogout }) => {
  const { user, selectedChildId, selectChild, linkChildToParent, generateParentCode } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'insights' | 'reports' | 'leaderboard' | 'settings'>('overview');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sample notifications - in production, these would come from real-time listeners
  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Mock children for demo
  const mockChildren = [
    { id: 'child-1', name: 'Alex', age: 9 },
    { id: 'child-2', name: 'Sarah', age: 11 }
  ];

  // Mock student data - in a real app, this would come from props or API
  const studentData = {
    name: 'Alex',
    totalPointsEarned: 320,
    currentStreak: 5,
    badges: 7,
    subjects: {
      'Maths': { progress: 75, lastActive: 'Today', topicsMastered: 5 },
      'English': { progress: 68, lastActive: '2 days ago', topicsMastered: 3 },
      'Science': { progress: 82, lastActive: 'Today', topicsMastered: 6 },
      'History': { progress: 45, lastActive: '5 days ago', topicsMastered: 1 },
    },
    recentActivity: [
      { date: 'Today', activity: 'Completed Fractions Quiz', score: 90 },
      { date: 'Today', activity: 'Read Photosynthesis Lesson' },
      { date: 'Yesterday', activity: 'Completed Grammar Quiz', score: 85 },
      { date: '2 days ago', activity: 'Completed Victorian Era Quiz', score: 72 },
    ]
  };

  const handleResetActivity = () => {
    // In a real app, this would call an API to reset the student's data
    // For now, we'll just show a success message
    localStorage.removeItem('ks2_user');
    alert(`✅ All activities for ${studentData.name} have been reset!\n\nThe student will need to log in again to set up their profile.`);
    setShowResetConfirm(false);
  };

  const handleResetPoints = () => {
    alert(`✅ Points reset for ${studentData.name}!\n\nThey now have 0 points.`);
  };

  const handleResetStreak = () => {
    alert(`✅ Streak reset for ${studentData.name}!\n\nTheir streak counter is now at 0.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Notifications Toast */}
      <ProgressNotifications
        notifications={notifications}
        onDismiss={handleDismissNotification}
        maxVisible={3}
      />
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <AcademicCapIcon className="h-10 w-10 text-purple-500" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 hidden sm:block">
                Parent Portal
              </h1>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Selector */}
        <ChildSelector
          children={mockChildren}
          selectedChildId={selectedChildId}
          onSelectChild={selectChild}
          onAddChild={(code) => {
            if (user?.role === 'parent') {
              linkChildToParent(code, 'child-new');
            }
          }}
          parentCode={user?.parentCode}
        />

        {/* Student Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Monitoring: <span className="text-purple-600">{studentData.name}</span>
          </h2>
          <p className="text-gray-600">Track your child's learning progress and insights</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Points Earned</p>
                <p className="text-3xl font-bold text-blue-600">{studentData.totalPointsEarned}</p>
              </div>
              <StarIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{studentData.currentStreak} days</p>
              </div>
              <FireIcon className="h-12 w-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Badges Earned</p>
                <p className="text-3xl font-bold text-green-600">{studentData.badges}</p>
              </div>
              <span className="text-4xl">🏅</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Subjects</p>
                <p className="text-3xl font-bold text-purple-600">{Object.keys(studentData.subjects).length}</p>
              </div>
              <AcademicCapIcon className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {(['overview', 'progress', 'insights', 'leaderboard', 'reports', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'settings' ? '⚙️ Settings' : tab === 'leaderboard' ? '🏆 Leaderboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subject Progress Charts */}
            <div className="lg:col-span-2">
              <SubjectProgressCharts
                subjects={['Maths', 'English', 'Science', 'History', 'Geography', 'PE']}
                studentName={studentData.name}
              />
            </div>

            {/* Activity Log Sidebar */}
            <div>
              <ParentActivityLog
                childId="child-1"
                childName={studentData.name}
              />
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Learning Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(studentData.subjects).map(([subject, data]) => (
                <div key={subject} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">{subject}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Mastery Level</span>
                        <span className="text-sm font-bold text-blue-600">{data.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${data.progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">✓ {data.topicsMastered} topics mastered</p>
                    <p className="text-sm text-gray-600">Last active: {data.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <AgeGroupedLeaderboard
            studentId="child-1"
            studentAge={10}
            limit={10}
          />
        )}

        {activeTab === 'insights' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Learning Insights</h3>
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <p className="font-bold text-blue-900 mb-2">💡 Strength Area</p>
                <p className="text-blue-800">{studentData.name} is showing excellent progress in <strong>Science</strong> with 82% mastery. Consider encouraging deeper exploration with advanced topics!</p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded">
                <p className="font-bold text-amber-900 mb-2">⚠️ Areas for Support</p>
                <p className="text-amber-800"><strong>History</strong> is an area where {studentData.name} could use more focus (45% mastery). Try encouraging more practice quizzes and interactive lessons.</p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                <p className="font-bold text-green-900 mb-2">🎯 Recommendation</p>
                <p className="text-green-800">Your child is maintaining a {studentData.currentStreak}-day streak! Keep encouraging consistent learning. Consider setting a weekly learning goal to maintain momentum.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analysis</h3>
            <div className="space-y-4">
              <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow text-left">
                📊 Generate Monthly Progress Report
              </button>
              <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow text-left">
                📈 Subject Performance Analysis
              </button>
              <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow text-left">
                🎯 Learning Goals & Recommendations
              </button>
              <button className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow text-left">
                📧 Email Report to Family
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Cog6ToothIcon className="h-6 w-6 text-purple-500" />
              Settings & Actions
            </h3>
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-blue-900 mb-4">📊 Account Management</h4>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold text-left">
                    🔄 Reset Mastery Progress
                  </button>
                  <p className="text-sm text-blue-700">Resets all subject mastery scores to 0%, allowing {studentData.name} to start fresh.</p>
                </div>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-orange-900 mb-4">🪙 Points & Rewards</h4>
                <div className="space-y-3">
                  <button onClick={handleResetPoints} className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold text-left">
                    💰 Reset All Points to Zero
                  </button>
                  <p className="text-sm text-orange-700">Removes all earned points. {studentData.name} will start with 0 coins.</p>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-amber-900 mb-4">🔥 Streak Management</h4>
                <div className="space-y-3">
                  <button onClick={handleResetStreak} className="w-full p-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-bold text-left">
                    🔄 Reset Streak Counter
                  </button>
                  <p className="text-sm text-amber-700">Resets the daily streak to 0 days. Useful if starting a new learning cycle.</p>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-red-900 mb-4">🗑️ Reset All Activities</h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold flex items-center gap-2 justify-center"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Reset Everything
                  </button>
                  <p className="text-sm text-red-700">⚠️ <strong>WARNING:</strong> This will completely reset {studentData.name}'s profile including all progress, points, badges, and activity. This action cannot be undone.</p>
                </div>
              </div>

              {/* Reset Confirmation Modal */}
              {showResetConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-pop-in">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">⚠️ Confirm Reset</h4>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to reset all activities for <strong>{studentData.name}</strong>? This includes:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                      <li>All learning progress and mastery scores</li>
                      <li>All earned points and coins</li>
                      <li>Daily streak counter</li>
                      <li>All badges and unlocked items</li>
                      <li>Complete activity history</li>
                    </ul>
                    <p className="text-red-600 font-bold mb-6">This action cannot be undone!</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetActivity}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
                      >
                        Yes, Reset All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentMonitoringDashboard;
