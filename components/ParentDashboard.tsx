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
  const { settings, updateSettings, user } = useUser();

  useEffect(() => {
    // In a real app, this would be an async call
    const data = authService.getParentStats();
    setStats(data);
  }, []);

  const handleGenerateProgressReport = async () => {
    if (!user) return;
    setIsGeneratingReport(true);
    try {
      const report = await generateProgressReport(user, user.age);
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
      const insights = await generateLearningInsights(user, [], user.age);
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
