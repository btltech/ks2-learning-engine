/**
 * Teacher Dashboard Component
 * 
 * Overview of class progress and student management
 * Note: This requires Firebase/backend integration to fetch real student data
 * Currently shows empty state - students would be loaded from a class roster
 */

import React, { useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  age: number;
  avatarColor: string;
  points: number;
  streak: number;
  lastActive: string;
  subjectMastery: Record<string, number>;
  quizzesCompleted: number;
  averageScore: number;
}

interface ClassStats {
  totalStudents: number;
  averagePoints: number;
  averageStreak: number;
  averageMastery: Record<string, number>;
  topPerformers: Student[];
  strugglingStudents: Student[];
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  studentName: string;
  action: string;
  subject: string;
  timestamp: string;
  score?: number;
}

interface TeacherDashboardProps {
  onClose: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onClose }) => {
  // Start with empty students array - would be populated from Firebase/backend
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [view, setView] = useState<'overview' | 'students' | 'assignments' | 'reports'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term'>('week');

  useEffect(() => {
    // In production, this would fetch students from Firebase based on teacher's class
    // For now, we start with an empty array - no mock data
    setStudents([]);
  }, []);

  // Calculate stats from actual student data
  const classStats: ClassStats = {
    totalStudents: students.length,
    averagePoints: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.points, 0) / students.length) 
      : 0,
    averageStreak: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.streak, 0) / students.length) 
      : 0,
    averageMastery: students.length > 0 
      ? {
          Maths: Math.round(students.reduce((sum, s) => sum + (s.subjectMastery.Maths || 0), 0) / students.length),
          English: Math.round(students.reduce((sum, s) => sum + (s.subjectMastery.English || 0), 0) / students.length),
          Science: Math.round(students.reduce((sum, s) => sum + (s.subjectMastery.Science || 0), 0) / students.length),
        }
      : { Maths: 0, English: 0, Science: 0 },
    topPerformers: [...students].sort((a, b) => b.averageScore - a.averageScore).slice(0, 3),
    strugglingStudents: students.filter(s => s.averageScore < 60),
    recentActivity: [], // Would be populated from activity log
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">👩‍🏫 Teacher Dashboard</h1>
            <p className="text-indigo-200">Class Overview & Student Progress</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
          >
            Close Dashboard
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'students', label: '👨‍🎓 Students', icon: '👨‍🎓' },
            { id: 'assignments', label: '📝 Assignments', icon: '📝' },
            { id: 'reports', label: '📈 Reports', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                view === tab.id
                  ? 'bg-white text-indigo-700 font-bold'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {view === 'overview' && (
            <OverviewView stats={classStats} students={students} timeRange={timeRange} setTimeRange={setTimeRange} />
          )}
          {view === 'students' && (
            <StudentsView 
              students={students} 
              selectedStudent={selectedStudent}
              onSelectStudent={setSelectedStudent}
            />
          )}
          {view === 'assignments' && <AssignmentsView students={students} />}
          {view === 'reports' && <ReportsView stats={classStats} students={students} />}
        </div>
      </div>
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{
  stats: ClassStats;
  students: Student[];
  timeRange: string;
  setTimeRange: (range: 'week' | 'month' | 'term') => void;
}> = ({ stats, students, timeRange, setTimeRange }) => {
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="bg-white rounded-lg p-1 inline-flex gap-1">
          {['week', 'month', 'term'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 rounded ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          icon="👨‍🎓"
          color="bg-blue-500"
        />
        <StatCard
          title="Average Points"
          value={stats.averagePoints.toLocaleString()}
          icon="⭐"
          color="bg-yellow-500"
        />
        <StatCard
          title="Average Streak"
          value={`${stats.averageStreak} days`}
          icon="🔥"
          color="bg-orange-500"
        />
        <StatCard
          title="Active Today"
          value={students.filter(s => isToday(new Date(s.lastActive))).length.toString()}
          icon="✅"
          color="bg-green-500"
        />
      </div>

      {/* Subject Mastery Overview */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Class Mastery by Subject</h3>
        <div className="space-y-4">
          {Object.entries(stats.averageMastery).map(([subject, mastery]) => {
            const masteryValue = mastery as number;
            return (
              <div key={subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{subject}</span>
                  <span className="text-gray-500">{masteryValue}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      masteryValue >= 70 ? 'bg-green-500' : masteryValue >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${masteryValue}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Performers</h3>
          <div className="space-y-3">
            {stats.topPerformers.map((student, index) => (
              <div key={student.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                }`}>
                  {index + 1}
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: student.avatarColor }}
                >
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">
                    Avg Score: {student.averageScore}%
                  </div>
                </div>
                <div className="text-yellow-500 font-bold">
                  {student.points.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{activity.studentName}</span>
                  {' '}
                  <span className="text-gray-600">{activity.action}</span>
                  {' '}
                  <span className="text-indigo-600">{activity.subject}</span>
                  {activity.score && (
                    <span className="text-green-600 ml-1">({activity.score}%)</span>
                  )}
                </div>
                <div className="text-gray-400 text-xs">
                  {formatTimeAgo(new Date(activity.timestamp))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Struggling Students Alert */}
      {stats.strugglingStudents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
            <span>⚠️</span> Students Needing Support
          </h3>
          <p className="text-red-600 mb-4">
            These students are averaging below 60% and may need additional help:
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.strugglingStudents.map((student) => (
              <span
                key={student.id}
                className="bg-white px-3 py-1 rounded-full text-sm border border-red-200"
              >
                {student.name} ({student.averageScore}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Students View Component
const StudentsView: React.FC<{
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student | null) => void;
}> = ({ students, selectedStudent, onSelectStudent }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'points' | 'streak' | 'score'>('name');

  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'points': return b.points - a.points;
        case 'streak': return b.streak - a.streak;
        case 'score': return b.averageScore - a.averageScore;
        default: return a.name.localeCompare(b.name);
      }
    });

  if (selectedStudent) {
    return (
      <StudentDetailView 
        student={selectedStudent} 
        onBack={() => onSelectStudent(null)} 
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="bg-white rounded-xl p-4 shadow flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="name">Sort by Name</option>
          <option value="points">Sort by Points</option>
          <option value="streak">Sort by Streak</option>
          <option value="score">Sort by Average Score</option>
        </select>
      </div>

      {/* Students Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => onSelectStudent(student)}
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: student.avatarColor }}
              >
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{student.name}</div>
                <div className="text-sm text-gray-500">Age {student.age}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-gray-100 rounded-lg py-2">
                <div className="font-bold text-gray-900">{student.points}</div>
                <div className="text-xs text-gray-500">Points</div>
              </div>
              <div className="bg-gray-100 rounded-lg py-2">
                <div className="font-bold text-orange-500">{student.streak}</div>
                <div className="text-xs text-gray-500">Streak</div>
              </div>
              <div className="bg-gray-100 rounded-lg py-2">
                <div className={`font-bold ${
                  student.averageScore >= 70 ? 'text-green-500' : 
                  student.averageScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {student.averageScore}%
                </div>
                <div className="text-xs text-gray-500">Avg</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Last active: {formatTimeAgo(new Date(student.lastActive))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Student Detail View
const StudentDetailView: React.FC<{
  student: Student;
  onBack: () => void;
}> = ({ student, onBack }) => {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
      >
        ← Back to Students
      </button>

      {/* Student Header */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            style={{ backgroundColor: student.avatarColor }}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-500">Age {student.age} • {student.quizzesCompleted} quizzes completed</p>
            <div className="flex gap-4 mt-2">
              <span className="text-yellow-500 font-bold">{student.points.toLocaleString()} points</span>
              <span className="text-orange-500">🔥 {student.streak} day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Progress</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(student.subjectMastery).map(([subject, mastery]) => {
            const masteryValue = mastery as number;
            return (
              <div key={subject} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{masteryValue}%</div>
                <div className="text-gray-500">{subject}</div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      masteryValue >= 70 ? 'bg-green-500' : masteryValue >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${masteryValue}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200">
            📧 Send Message
          </button>
          <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200">
            📝 Assign Quiz
          </button>
          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200">
            📊 View Full Report
          </button>
          <button className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200">
            🎯 Set Goals
          </button>
        </div>
      </div>
    </div>
  );
};

// Assignments View
const AssignmentsView: React.FC<{ students: Student[] }> = ({ students }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Create Assignment</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select className="w-full p-3 border rounded-lg">
              <option>Maths</option>
              <option>English</option>
              <option>Science</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select className="w-full p-3 border rounded-lg">
              <option>Fractions</option>
              <option>Multiplication</option>
              <option>Division</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select className="w-full p-3 border rounded-lg">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" className="w-full p-3 border rounded-lg" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
          <div className="flex flex-wrap gap-2">
            <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              + Whole Class
            </button>
            {students.slice(0, 5).map((s) => (
              <span key={s.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {s.name}
              </span>
            ))}
            <button className="text-gray-500 text-sm">+{students.length - 5} more</button>
          </div>
        </div>
        <button className="mt-4 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700">
          Create Assignment
        </button>
      </div>
    </div>
  );
};

// Reports View
const ReportsView: React.FC<{ stats: ClassStats; students: Student[] }> = ({ _stats, _students }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Class Performance Report</h3>
        <p className="text-gray-600 mb-4">
          Generate detailed reports for your class or individual students.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200">
            📄 Weekly Progress Report
          </button>
          <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200">
            📈 Subject Analysis
          </button>
          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200">
            👨‍👩‍👧‍👦 Parent Report
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📥 Export Data</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Export as CSV
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Export as PDF
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </div>
    </div>
  );
};

// Helper Functions
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
