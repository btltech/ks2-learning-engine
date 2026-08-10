/**
 * Teacher Dashboard Component
 * 
 * Overview of class progress and student management
 * Uses the authenticated shared classroom API so classes and assignments work
 * across devices and learner accounts.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Difficulty } from '../types';
import {
  SharedClass,
  SharedHomework,
  homeworkStats,
  teacherWorkspaceService,
} from '../services/teacherWorkspaceService';
import { parseTeacherDashboardView } from '../utils/dashboardRoutes';
import { DashboardShell } from './layout/AppShells';

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
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SharedClass[]>([]);
  const [homework, setHomework] = useState<SharedHomework[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('Year 5');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const view = parseTeacherDashboardView(searchParams.get('tab'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([teacherWorkspaceService.getClasses(), teacherWorkspaceService.getHomework()])
      .then(([sharedClasses, sharedHomework]) => {
        if (cancelled) return;
        setClasses(sharedClasses);
        setHomework(sharedHomework);
        setSelectedClassId((current) =>
          sharedClasses.some((entry) => entry.classId === current) ? current : sharedClasses[0]?.classId || ''
        );
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load the shared classroom.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !selectedClassId) {
      setStudents([]);
      return;
    }

    const classData = classes.find((candidate) => candidate.classId === selectedClassId);
    if (!classData) {
      setStudents([]);
      return;
    }

    const nextStudents = (classData.students || []).map((progress): Student => {
      return {
        id: progress.studentId,
        name: progress.studentName,
        age: progress.age || 10,
        avatarColor: '#6366f1',
        points: progress.points,
        streak: progress.streak,
        lastActive: progress.lastActive || new Date(0).toISOString(),
        subjectMastery: progress.subjectMastery,
        quizzesCompleted: progress.totalQuizzes,
        averageScore: progress.averageScore,
      };
    });
    setStudents(nextStudents);
  }, [classes, selectedClassId, user?.id]);

  const handleCreateClass = async () => {
    if (!user?.id || !newClassName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const created = await teacherWorkspaceService.createClass(newClassName.trim(), newClassGrade);
      setClasses((current) => [...current, { ...created, students: created.students || [] }]);
      setSelectedClassId(created.classId);
      setNewClassName('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create the class.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClassId || !window.confirm('Remove this learner from the selected class?')) return;
    setError('');
    try {
      await teacherWorkspaceService.removeStudent(selectedClassId, studentId);
      setClasses((current) => current.map((entry) => entry.classId === selectedClassId
        ? {
            ...entry,
            studentIds: entry.studentIds.filter((id) => id !== studentId),
            students: (entry.students || []).filter((student) => student.studentId !== studentId),
          }
        : entry));
      setSelectedStudent(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to remove the learner.');
    }
  };

  // Calculate stats from actual student data
  const averageMastery = students.reduce<Record<string, { total: number; count: number }>>((result, student) => {
    Object.entries(student.subjectMastery || {}).forEach(([subject, value]) => {
      const current = result[subject] || { total: 0, count: 0 };
      result[subject] = { total: current.total + (Number(value) || 0), count: current.count + 1 };
    });
    return result;
  }, {});

  const classStats: ClassStats = {
    totalStudents: students.length,
    averagePoints: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.points, 0) / students.length) 
      : 0,
    averageStreak: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.streak, 0) / students.length) 
      : 0,
    averageMastery: Object.fromEntries(
      (Object.entries(averageMastery) as Array<[string, { total: number; count: number }]>).map(([subject, values]) => [subject, Math.round(values.total / values.count)])
    ),
    topPerformers: [...students].sort((a, b) => b.averageScore - a.averageScore).slice(0, 3),
    strugglingStudents: students.filter(s => s.averageScore < 60),
    recentActivity: [], // Would be populated from activity log
  };

  return (
    <DashboardShell
      title="Teacher Dashboard"
      subtitle="Class overview and student progress"
      icon="👩‍🏫"
      onExit={onClose}
      exitLabel="Back to teacher home"
      tone="purple"
      navigation={(
        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Teacher dashboard sections">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'students', label: '👨‍🎓 Students' },
            { id: 'assignments', label: '📝 Assignments' },
            { id: 'reports', label: '📈 Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams(tab.id === 'overview' ? {} : { tab: tab.id })}
              role="tab"
              aria-selected={view === tab.id}
              tabIndex={view === tab.id ? 0 : -1}
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
      )}
    >
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800" role="alert">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-indigo-800">
              Loading shared classroom data…
            </div>
          )}
          <div className="bg-white rounded-xl p-4 shadow mb-6 flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Active Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                {classes.length === 0 ? (
                  <option value="">No classes yet</option>
                ) : (
                  classes.map((classData) => (
                    <option key={classData.classId} value={classData.classId}>
                      {classData.className} · {classData.grade} · {classData.studentIds.length} students
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Create Class</label>
              <input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Year 5 Maple"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option>Year 3</option>
                <option>Year 4</option>
                <option>Year 5</option>
                <option>Year 6</option>
              </select>
            </div>
            <button
              onClick={handleCreateClass}
              disabled={!newClassName.trim() || saving}
              className="bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700"
            >
              {saving ? 'Creating…' : 'Create Class'}
            </button>
          </div>

          {classes.find((entry) => entry.classId === selectedClassId)?.joinCode && (
            <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="font-bold text-indigo-900">Learner class code</div>
                <div className="text-sm text-indigo-700">Learners enter this code from their home screen.</div>
              </div>
              <code className="text-2xl tracking-[0.25em] font-black text-indigo-800 bg-white px-4 py-2 rounded-lg">
                {classes.find((entry) => entry.classId === selectedClassId)?.joinCode}
              </code>
            </div>
          )}

          {view === 'overview' && (
            <OverviewView stats={classStats} students={students} />
          )}
          {view === 'students' && (
            <StudentsView 
              students={students} 
              selectedStudent={selectedStudent}
              onSelectStudent={setSelectedStudent}
              onRemoveStudent={handleRemoveStudent}
            />
          )}
          {view === 'assignments' && (
            <AssignmentsView
              classes={classes}
              selectedClassId={selectedClassId}
              homework={homework}
              onCreated={(created) => setHomework((current) => [created, ...current])}
            />
          )}
          {view === 'reports' && <ReportsView stats={classStats} students={students} />}
    </DashboardShell>
  );
};

// Overview View Component
const OverviewView: React.FC<{
  stats: ClassStats;
  students: Student[];
}> = ({ stats, students }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
        These overview figures are cumulative for the selected class. Activity timestamps are shown on individual learner records.
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
          {Object.keys(stats.averageMastery).length === 0 ? (
            <p className="text-sm text-gray-500">Subject mastery will appear after learners complete quizzes.</p>
          ) : Object.entries(stats.averageMastery).map(([subject, mastery]) => {
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
            {stats.topPerformers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏁</div>
                <p>No class results yet</p>
                <p className="text-sm">Learner performance appears after students complete quizzes.</p>
              </div>
            ) : stats.topPerformers.map((student, index) => (
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
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No recent class activity</p>
                <p className="text-sm">Activity logs will appear when class sessions are recorded.</p>
              </div>
            ) : stats.recentActivity.map((activity) => (
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
  onRemoveStudent: (studentId: string) => Promise<void>;
}> = ({ students, selectedStudent, onSelectStudent, onRemoveStudent }) => {
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
        onRemove={() => onRemoveStudent(selectedStudent.id)}
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
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow text-center text-gray-500">
          <div className="text-5xl mb-3">👨‍🎓</div>
          <h3 className="text-lg font-bold text-gray-800">No students in this class yet</h3>
          <p className="text-sm">Add student IDs to the class data source and they will appear here with progress summaries.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

// Student Detail View
const StudentDetailView: React.FC<{
  student: Student;
  onBack: () => void;
  onRemove: () => void;
}> = ({ student, onBack, onRemove }) => {
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

      {/* Class membership */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Class membership</h3>
        <p className="text-sm text-gray-600 mb-4">Removing a learner does not delete their account or learning history.</p>
        <button onClick={onRemove} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200">
          Remove from this class
        </button>
      </div>
    </div>
  );
};

// Assignments View
const AssignmentsView: React.FC<{
  classes: SharedClass[];
  selectedClassId: string;
  homework: SharedHomework[];
  onCreated: (homework: SharedHomework) => void;
}> = ({ classes, selectedClassId, homework, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Maths');
  const [topic, setTopic] = useState('Fractions');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [questionCount, setQuestionCount] = useState(10);
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const selectedClass = classes.find((entry) => entry.classId === selectedClassId);
  const visibleHomework = homework.filter((entry) => entry.assignedClassIds.includes(selectedClassId));

  const createAssignment = async () => {
    if (!selectedClassId || !title.trim() || !topic.trim()) {
      setMessage('Choose a class and enter an assignment title and topic.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const created = await teacherWorkspaceService.createHomework({
        title: title.trim(),
        description: description.trim(),
        subject,
        topic: topic.trim(),
        difficulty,
        questionCount,
        dueDate: new Date(`${dueDate}T23:59:00`).toISOString(),
        assignedClassIds: [selectedClassId],
      });
      onCreated(created);
      setTitle('');
      setDescription('');
      setMessage('Assignment published to the class.');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to create the assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Create Assignment</h3>
        {message && <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">{message}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. Fractions practice" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input value={selectedClass?.className || 'Create a class first'} readOnly className="w-full p-3 border rounded-lg bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full p-3 border rounded-lg">
              <option>Maths</option>
              <option>English</option>
              <option>Science</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input value={topic} onChange={(event) => setTopic(event.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. Fractions" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="w-full p-3 border rounded-lg">
              {Object.values(Difficulty).map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={dueDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setDueDate(event.target.value)} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
            <input type="number" min={5} max={20} value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} className="w-full p-3 border rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (optional)</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full p-3 border rounded-lg" placeholder="What should learners focus on?" />
          </div>
        </div>
        <button onClick={createAssignment} disabled={saving || !selectedClassId} className="mt-4 bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700">
          {saving ? 'Publishing…' : 'Publish to Whole Class'}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Published Assignments</h3>
        {visibleHomework.length === 0 ? (
          <p className="text-gray-500">No shared assignments for this class yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {visibleHomework.map((assignment) => {
              const stats = homeworkStats(assignment, selectedClass?.studentIds.length || 0);
              return (
                <div key={assignment.homeworkId} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">{assignment.subject} · {assignment.topics.join(', ')} · {assignment.difficulty}</p>
                    </div>
                    <span className="text-xs text-gray-500">Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded bg-gray-50 p-2"><strong>{stats.submitted}</strong><br />Submitted</div>
                    <div className="rounded bg-gray-50 p-2"><strong>{stats.pending}</strong><br />Pending</div>
                    <div className="rounded bg-gray-50 p-2"><strong>{stats.averageScore}%</strong><br />Average</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Reports View
const ReportsView: React.FC<{ stats: ClassStats; students: Student[] }> = ({ stats, students }) => {
  const download = (contents: string, type: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => download(
    JSON.stringify({ generatedAt: new Date().toISOString(), summary: stats, students }, null, 2),
    'application/json',
    `class-report-${new Date().toISOString().slice(0, 10)}.json`
  );

  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Name', 'Age', 'Points', 'Streak', 'Quizzes', 'Average score'],
      ...students.map((student) => [student.name, student.age, student.points, student.streak, student.quizzesCompleted, student.averageScore]),
    ];
    download(rows.map((row) => row.map(escape).join(',')).join('\n'), 'text/csv', `class-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Class Performance Report</h3>
        <p className="text-gray-600 mb-4">
          Generate detailed reports for your class or individual students.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Learners" value={String(stats.totalStudents)} icon="👥" color="bg-indigo-500" />
          <StatCard title="Average score" value={`${Math.round(students.length ? students.reduce((sum, student) => sum + student.averageScore, 0) / students.length : 0)}%`} icon="📈" color="bg-green-500" />
          <StatCard title="Quizzes" value={String(students.reduce((sum, student) => sum + student.quizzesCompleted, 0))} icon="📝" color="bg-purple-500" />
          <StatCard title="Needs support" value={String(stats.strugglingStudents.length)} icon="🎯" color="bg-orange-500" />
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📥 Export Data</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCsv} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Export as CSV
          </button>
          <button onClick={exportJson} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Export as JSON
          </button>
          <button onClick={() => window.print()} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
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
  if (!Number.isFinite(date.getTime())) return false;
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function formatTimeAgo(date: Date): string {
  if (!Number.isFinite(date.getTime()) || date.getTime() <= 0) return 'No activity yet';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 0) return 'just now';
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
