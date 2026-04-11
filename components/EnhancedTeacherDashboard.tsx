import { useState, useEffect } from 'react';
import { teacherAnalyticsService, ClassData, ClassAnalytics, StudentProgress } from '../services/teacherAnalyticsService';
import { homeworkService, Homework } from '../services/homeworkService';

interface Props {
  teacherId: string;
  onClose: () => void;
}

export default function EnhancedTeacherDashboard({ teacherId, onClose }: Props) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'homework'>('overview');
  
  useEffect(() => {
    loadData();
  }, [teacherId]);
  
  useEffect(() => {
    if (selectedClass) {
      loadClassAnalytics(selectedClass);
    }
  }, [selectedClass]);
  
  const loadData = () => {
    const teacherClasses = teacherAnalyticsService.getClasses(teacherId);
    setClasses(teacherClasses);
    
    if (teacherClasses.length > 0 && !selectedClass) {
      setSelectedClass(teacherClasses[0].classId);
    }
    
    const teacherHomework = homeworkService.getTeacherHomework(teacherId);
    setHomework(teacherHomework);
  };
  
  const loadClassAnalytics = (classId: string) => {
    try {
      const classAnalytics = teacherAnalyticsService.getClassAnalytics(teacherId, classId);
      setAnalytics(classAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };
  
  const handleExportReport = () => {
    if (!selectedClass) return;
    
    const report = teacherAnalyticsService.exportClassReport(teacherId, selectedClass);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-report-${selectedClass}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">📊 Teacher Dashboard</h2>
              <p className="text-blue-100">Comprehensive class analytics and management</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Class Selector */}
          <div className="mt-4">
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {classes.map((cls) => (
                <option key={cls.classId} value={cls.classId} className="text-gray-900">
                  {cls.className} - Grade {cls.grade}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'students'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Students
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'homework'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Homework
          </button>
          
          <button
            onClick={handleExportReport}
            className="ml-auto px-6 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4 my-2"
          >
            📥 Export Report
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</div>
                  <div className="text-sm text-blue-800">Students</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{Math.round(analytics.averageScore)}%</div>
                  <div className="text-sm text-green-800">Avg Score</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600">{analytics.totalQuizzes}</div>
                  <div className="text-sm text-purple-800">Total Quizzes</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600">{Math.round(analytics.totalTimeSpent / 60)}h</div>
                  <div className="text-sm text-orange-800">Time Spent</div>
                </div>
              </div>
              
              {/* Subject Performance */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Subject Performance</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.subjectPerformance).map(([subject, data]) => (
                    <div key={subject}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{subject}</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(data.averageScore)}% • {data.quizzesCompleted} quizzes
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          style={{ width: `${data.averageScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Performers & Need Help */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-900 mb-4">🏆 Top Performers</h3>
                  <div className="space-y-2">
                    {analytics.topPerformers.slice(0, 5).map((student, index) => (
                      <div key={student.studentId} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">#{index + 1}</span>
                          <span className="font-semibold">{student.studentName}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          {Math.round(student.averageScore)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-orange-900 mb-4">⚠️ Needs Support</h3>
                  <div className="space-y-2">
                    {analytics.needingHelp.map((student) => (
                      <div key={student.studentId} className="bg-white p-3 rounded-lg">
                        <div className="font-semibold mb-1">{student.studentName}</div>
                        <div className="text-sm text-gray-600">
                          {Math.round(student.averageScore)}% • Struggles with: {student.weaknesses.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'students' && analytics && (
            <div>
              <h3 className="text-xl font-bold mb-4">Student Progress</h3>
              <div className="space-y-3">
                {[...analytics.topPerformers, ...analytics.needingHelp].map((student) => (
                  <div key={student.studentId} className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{student.studentName}</h4>
                        <p className="text-sm text-gray-600">
                          {student.totalQuizzes} quizzes • {Math.round(student.timeSpent / 60)} hours
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(student.averageScore)}%</div>
                        <div className="text-sm text-gray-600">Avg Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-semibold text-green-700 mb-1">Strengths:</div>
                        <div className="text-sm text-gray-600">{student.strengths.join(', ') || 'None yet'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-orange-700 mb-1">Weaknesses:</div>
                        <div className="text-sm text-gray-600">{student.weaknesses.join(', ') || 'None'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'homework' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Homework Assignments</h3>
              {homework.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-600">No homework assigned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {homework.map((hw) => {
                    const stats = homeworkService.getHomeworkStats(hw.homeworkId);
                    const isOverdue = homeworkService.isOverdue(hw);
                    
                    return (
                      <div key={hw.homeworkId} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-lg">{hw.title}</h4>
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Overdue</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{hw.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>Subject: <span className="font-semibold">{hw.subject}</span></div>
                          <div>Due: <span className="font-semibold">{new Date(hw.dueDate).toLocaleDateString()}</span></div>
                          <div>Submitted: <span className="font-semibold">{stats.submitted}/{stats.totalAssigned}</span></div>
                          <div>Avg Score: <span className="font-semibold">{stats.averageScore}%</span></div>
                        </div>
                        
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(stats.submitted / stats.totalAssigned) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
