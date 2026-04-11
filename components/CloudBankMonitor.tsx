/**
 * Cloud Bank Monitor Component
 * Displays statistics about AI-generated questions saved to Firebase
 */

import React, { useState, useEffect } from 'react';
import { getCloudBankStats, CloudBankStats } from '../services/cloudBankService';

export const CloudBankMonitor: React.FC = () => {
  const [stats, setStats] = useState<CloudBankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getCloudBankStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error loading Cloud Bank stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
            ☁️
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Cloud Bank Monitor</h3>
            <p className="text-sm text-gray-500">AI-generated questions saved to Firestore</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="text-2xl">⏳</div>
          </div>
          <p className="text-gray-600 mt-2">Loading Cloud Bank stats...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Cloud Bank Monitor</h3>
            <p className="text-sm text-gray-500">Error loading stats</p>
          </div>
        </div>
        <p className="text-red-600 text-sm">{error || 'Could not load Cloud Bank statistics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
            ☁️
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Cloud Bank Monitor</h3>
            <p className="text-sm text-gray-500">AI-generated questions saved to Firestore</p>
          </div>
        </div>
        <button
          onClick={loadStats}
          className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 text-sm font-medium transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Stats */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-1">Total AI-Generated Questions</p>
            <p className="text-4xl font-bold text-indigo-600">{stats.totalQuestions}</p>
            <p className="text-xs text-gray-500 mt-2">Questions in Cloud Bank</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Generation Rate</p>
            <p className="text-4xl font-bold text-purple-600">
              {stats.averagePerDay.toFixed(1)}/day
            </p>
            <p className="text-xs text-gray-500 mt-2">Average per day</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {stats.oldestQuestion && stats.newestQuestion && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Oldest question:</span>
              <span className="text-gray-800 font-medium">
                {stats.oldestQuestion.toLocaleDateString()} {stats.oldestQuestion.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Newest question:</span>
              <span className="text-gray-800 font-medium">
                {stats.newestQuestion.toLocaleDateString()} {stats.newestQuestion.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Time span:</span>
              <span className="text-gray-800 font-medium">
                {Math.round(
                  (stats.newestQuestion.getTime() - stats.oldestQuestion.getTime()) / (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </span>
            </div>
          </div>
        </div>
      )}

      {/* By Subject */}
      {Object.keys(stats.bySubject).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-4">By Subject</h4>
          <div className="space-y-2">
            {Object.entries(stats.bySubject)
              .sort((a, b) => b[1] - a[1])
              .map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between">
                  <span className="text-gray-600">{subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${(count / stats.totalQuestions) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-gray-800 font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By Difficulty */}
      {Object.keys(stats.byDifficulty).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-4">By Difficulty</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Easy', 'Medium', 'Hard'].map((difficulty) => {
              const count = stats.byDifficulty[difficulty] || 0;
              const colors = {
                Easy: 'bg-green-100 text-green-700',
                Medium: 'bg-yellow-100 text-yellow-700',
                Hard: 'bg-red-100 text-red-700'
              };
              return (
                <div key={difficulty} className={`${colors[difficulty as keyof typeof colors]} rounded-lg p-4 text-center`}>
                  <p className="font-semibold text-lg">{count}</p>
                  <p className="text-sm opacity-75">{difficulty}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* By Age Group */}
      {Object.keys(stats.byAgeGroup).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-4">By Age Group</h4>
          <div className="space-y-2">
            {Object.entries(stats.byAgeGroup)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([age, count]) => (
                <div key={age} className="flex items-center justify-between">
                  <span className="text-gray-600">Age {age}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${(count / stats.totalQuestions) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-gray-800 font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {stats.totalQuestions === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-800">
            📝 No AI-generated questions in Cloud Bank yet.
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Questions will be saved here when students take quizzes and the AI generates new questions.
          </p>
        </div>
      )}
    </div>
  );
};

export default CloudBankMonitor;
