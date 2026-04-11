import React, { useEffect, useState } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import { 
  getPoorlyPerformingQuestionsFromFirebase, 
  getQuestionBankStats,
  getPerformanceStats 
} from '../services/questionPerformance';
import { SUBJECTS } from '../constants';

interface QuestionQualityDashboardProps {
  onClose: () => void;
}

interface PoorQuestion {
  id: string;
  question: string;
  correctRate: number;
  timesShown: number;
  subject: string;
  topic: string;
}

interface BankStats {
  totalQuestions: number;
  questionsWithPerformanceData: number;
  averageCorrectRate: number;
  poorlyPerformingCount: number;
  wellPerformingCount: number;
}

const QuestionQualityDashboard: React.FC<QuestionQualityDashboardProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<BankStats | null>(null);
  const [localStats, setLocalStats] = useState<ReturnType<typeof getPerformanceStats> | null>(null);
  const [poorQuestions, setPoorQuestions] = useState<PoorQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load Firebase stats
      const bankStats = await getQuestionBankStats();
      setStats(bankStats);
      
      // Load poorly performing questions
      const poor = await getPoorlyPerformingQuestionsFromFirebase(
        selectedSubject || undefined,
        5 // Minimum 5 attempts
      );
      setPoorQuestions(poor);
      
      // Load local stats as backup/comparison
      const local = getPerformanceStats(selectedSubject || undefined);
      setLocalStats(local);
    } catch (err) {
      console.error('Error loading question quality data:', err);
      setError('Failed to load data. Using local stats only.');
      
      // Fallback to local stats
      const local = getPerformanceStats(selectedSubject || undefined);
      setLocalStats(local);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const getHealthColor = (rate: number): string => {
    if (rate < 0.15) return 'text-red-600 bg-red-100';
    if (rate > 0.95) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 0.3 && rate <= 0.8) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getHealthLabel = (rate: number): string => {
    if (rate < 0.15) return 'Too Hard / Confusing';
    if (rate > 0.95) return 'Too Easy';
    if (rate >= 0.3 && rate <= 0.8) return 'Good';
    return 'Needs Review';
  };

  const formatPercent = (rate: number): string => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-pop-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ChartBarIcon className="w-7 h-7" />
              Question Quality Dashboard
            </h2>
            <p className="opacity-90 text-sm">Monitor and improve your question bank</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-blue-600 text-sm font-medium">Total Questions</div>
              <div className="text-2xl font-bold text-blue-800">
                {isLoading ? '...' : (stats?.totalQuestions || localStats?.totalQuestions || 0).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-purple-600 text-sm font-medium">With Data</div>
              <div className="text-2xl font-bold text-purple-800">
                {isLoading ? '...' : (stats?.questionsWithPerformanceData || 0).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-green-600 text-sm font-medium">Avg Correct Rate</div>
              <div className="text-2xl font-bold text-green-800">
                {isLoading ? '...' : formatPercent(stats?.averageCorrectRate || localStats?.averageEffectiveness || 0)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <div className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4" /> Well Performing
              </div>
              <div className="text-2xl font-bold text-emerald-800">
                {isLoading ? '...' : (stats?.wellPerformingCount || localStats?.wellPerformingCount || 0)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
              <div className="text-red-600 text-sm font-medium flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" /> Needs Review
              </div>
              <div className="text-2xl font-bold text-red-800">
                {isLoading ? '...' : (stats?.poorlyPerformingCount || localStats?.poorlyPerformingCount || 0)}
              </div>
            </div>
          </div>

          {/* Health Gauge */}
          <div className="bg-gray-50 rounded-xl p-6 border">
            <h3 className="font-semibold text-gray-800 mb-4">Question Bank Health</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                  {stats && stats.questionsWithPerformanceData > 0 && (
                    <>
                      <div 
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${(stats.wellPerformingCount / stats.questionsWithPerformanceData) * 100}%` }}
                        title={`Well Performing: ${stats.wellPerformingCount}`}
                      />
                      <div 
                        className="bg-gray-400 h-full transition-all duration-500"
                        style={{ width: `${((stats.questionsWithPerformanceData - stats.wellPerformingCount - stats.poorlyPerformingCount) / stats.questionsWithPerformanceData) * 100}%` }}
                        title="Neutral"
                      />
                      <div 
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ width: `${(stats.poorlyPerformingCount / stats.questionsWithPerformanceData) * 100}%` }}
                        title={`Needs Review: ${stats.poorlyPerformingCount}`}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" /> Good
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded" /> Neutral
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded" /> Review
                </span>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600 font-medium">Filter by Subject:</span>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(subject => (
                <option key={subject.name} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>

          {/* Poorly Performing Questions */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b bg-gray-50 rounded-t-xl">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                Questions Needing Review
                <span className="text-sm font-normal text-gray-500">
                  ({poorQuestions.length} found)
                </span>
              </h3>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading questions...
              </div>
            ) : poorQuestions.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">All questions are performing well!</p>
                <p className="text-gray-500 text-sm">No questions need review at this time.</p>
              </div>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
                {poorQuestions.map((q) => (
                  <div key={q.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getHealthColor(q.correctRate)}`}>
                            {getHealthLabel(q.correctRate)}
                          </span>
                          <span className="text-xs text-gray-500">{q.subject} • {q.topic}</span>
                        </div>
                        <p 
                          className={`text-gray-800 ${expandedQuestion === q.id ? '' : 'truncate'} cursor-pointer`}
                          onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                        >
                          {q.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${q.correctRate < 0.15 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {formatPercent(q.correctRate)}
                          </div>
                          <div className="text-xs text-gray-500">{q.timesShown} attempts</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedQuestion === q.id && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg text-sm">
                        <p className="text-gray-700 mb-2"><strong>Full Question:</strong> {q.question}</p>
                        <p className="text-gray-600">
                          <strong>Stats:</strong> Shown {q.timesShown} times, 
                          answered correctly {formatPercent(q.correctRate)} of the time.
                        </p>
                        {q.correctRate < 0.15 && (
                          <p className="text-red-600 mt-2">
                            ⚠️ This question may be too difficult, confusing, or have an incorrect answer.
                          </p>
                        )}
                        {q.correctRate > 0.95 && (
                          <p className="text-yellow-600 mt-2">
                            ⚠️ This question may be too easy and not providing learning value.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Local Stats Summary */}
          {localStats && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">📊 Local Browser Stats</h4>
              <p className="text-blue-700 text-sm">
                Your browser has tracked {localStats.totalQuestions} questions locally 
                with an average effectiveness of {formatPercent(localStats.averageEffectiveness)}.
                ({localStats.wellPerformingCount} performing well, {localStats.poorlyPerformingCount} need review)
              </p>
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-3">💡 Tips for Improving Question Quality</h4>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span><strong>Too Hard (&lt;15% correct):</strong> Simplify wording, add hints, or check if the answer is correct</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span><strong>Too Easy (&gt;95% correct):</strong> Increase difficulty or replace with more challenging questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span><strong>Sweet Spot (30-80% correct):</strong> These questions provide optimal learning value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                <span><strong>Need Data:</strong> Questions need at least 5-10 attempts before stats are meaningful</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionQualityDashboard;
