import { useState, useEffect } from 'react';
import {
  adaptiveLearningEngine,
  type AdaptiveRecommendation,
  type StudentPerformanceProfile,
} from '../services/adaptiveLearningEngine';
import {
  recommendationsEngine,
  type RecommendationItem,
  type LearningPath,
} from '../services/recommendationsEngine';

interface AdaptiveDashboardProps {
  studentId: string;
  onClose: () => void;
}

export default function AdaptiveDashboard({ studentId, onClose }: AdaptiveDashboardProps) {
  const [profile, setProfile] = useState<StudentPerformanceProfile | null>(null);
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [smartRecs, setSmartRecs] = useState<RecommendationItem[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'recommendations' | 'path'>('profile');

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = () => {
    const studentProfile = adaptiveLearningEngine.analyzeStudent(studentId);
    const adaptiveRecs = adaptiveLearningEngine.generateRecommendations(studentId);
    const smartRecommendations = recommendationsEngine.generateRecommendations(studentId, 8);
    
    setProfile(studentProfile);
    setRecommendations(adaptiveRecs);
    setSmartRecs(smartRecommendations);
  };

  const createPath = (subject: string, targetLevel: number) => {
    const path = recommendationsEngine.createLearningPath(studentId, subject, targetLevel);
    setLearningPath(path);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return '📝';
      case 'lesson': return '📚';
      case 'game': return '🎮';
      case 'review': return '🔄';
      case 'challenge': return '🏆';
      default: return '📖';
    }
  };

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">Loading adaptive analysis...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🧠 AI-Powered Learning Dashboard</h2>
              <p className="text-purple-100 mt-1">Personalized insights and recommendations</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Performance Profile
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'recommendations'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💡 Smart Recommendations
          </button>
          <button
            onClick={() => setActiveTab('path')}
            className={`flex-1 py-3 px-4 font-medium ${
              activeTab === 'path'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🗺️ Learning Path
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-blue-600 text-sm font-medium">Current Level</div>
                  <div className="text-3xl font-bold text-blue-900 mt-1">{profile.currentLevel}/10</div>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="text-green-600 text-sm font-medium">Learning Pace</div>
                  <div className="text-2xl font-bold text-green-900 mt-1 capitalize">{profile.learningPace}</div>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="text-purple-600 text-sm font-medium">Strengths</div>
                  <div className="text-3xl font-bold text-purple-900 mt-1">{profile.strengthAreas.length}</div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <div className="text-orange-600 text-sm font-medium">Focus Areas</div>
                  <div className="text-3xl font-bold text-orange-900 mt-1">{profile.weaknessAreas.length}</div>
                </div>
              </div>

              {/* Recommended Difficulty */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-indigo-900 mb-2">🎯 Optimal Difficulty Level</h3>
                <div className="text-3xl font-bold text-indigo-600">{profile.recommendedDifficulty}</div>
                <p className="text-gray-600 mt-2">
                  Based on your recent performance, this difficulty level will challenge you appropriately
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-green-900 mb-3">💪 Strengths</h3>
                  <div className="space-y-2">
                    {profile.strengthAreas.length > 0 ? (
                      profile.strengthAreas.map((area, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <span className="font-medium text-green-900">{area}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Keep practicing to build strengths!</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-900 mb-3">🎯 Focus Areas</h3>
                  <div className="space-y-2">
                    {profile.weaknessAreas.length > 0 ? (
                      profile.weaknessAreas.map((area, index) => (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <span className="font-medium text-orange-900">{area}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No weak areas identified - great job!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div>
                <h3 className="font-bold text-lg text-purple-900 mb-3">🤖 AI Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((rec, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium capitalize">{rec.type.replace('_', ' ')}</div>
                          <div className="text-sm mt-1">{rec.subject} - {rec.topic}</div>
                          <p className="text-sm mt-2 opacity-90">{rec.reason}</p>
                        </div>
                        <div className="ml-4 text-sm">
                          <div className="font-bold">{rec.difficulty}</div>
                          <div className="text-xs mt-1">{Math.round(rec.confidence * 100)}% confident</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-purple-900">✨ Personalized for You</h3>
                <p className="text-gray-700 mt-1">
                  These recommendations are based on your learning style, performance, and goals
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {smartRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{getTypeIcon(rec.type)}</div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">{rec.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{rec.subject} • {rec.difficulty}</div>
                        <p className="text-sm text-gray-700 mt-2">{rec.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span>⏱️ {rec.estimatedTime} min</span>
                          <span>⭐ {Math.round(rec.relevanceScore * 100)}% match</span>
                        </div>
                        <div className="mt-2 text-xs text-purple-600 italic">{rec.reason}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path Tab */}
          {activeTab === 'path' && (
            <div className="space-y-6">
              {!learningPath ? (
                <div>
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-indigo-900 text-lg">🗺️ Create Your Learning Path</h3>
                    <p className="text-gray-700 mt-2">
                      Choose a subject and target level to generate a personalized learning journey
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {['Maths', 'English', 'Science'].map((subject) => (
                      <div key={subject} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                        <div className="text-2xl mb-2">
                          {subject === 'Maths' ? '🔢' : subject === 'English' ? '📖' : '🔬'}
                        </div>
                        <h4 className="font-bold text-lg mb-4">{subject}</h4>
                        <div className="space-y-2">
                          {[5, 7, 10].map((level) => (
                            <button
                              key={level}
                              onClick={() => createPath(subject, level)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                              Master Level {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Path Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
                    <h3 className="text-2xl font-bold">{learningPath.title}</h3>
                    <p className="mt-2">{learningPath.description}</p>
                    <div className="mt-4 flex gap-6">
                      <div>
                        <div className="text-indigo-100 text-sm">Progress</div>
                        <div className="text-2xl font-bold">{Math.round(learningPath.progress)}%</div>
                      </div>
                      <div>
                        <div className="text-indigo-100 text-sm">Time Remaining</div>
                        <div className="text-2xl font-bold">{learningPath.estimatedCompletionTime} min</div>
                      </div>
                      <div>
                        <div className="text-indigo-100 text-sm">Steps</div>
                        <div className="text-2xl font-bold">{learningPath.steps.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-indigo-500 h-full transition-all"
                        style={{ width: `${learningPath.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    {learningPath.steps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className={`border-2 rounded-lg p-4 ${
                          step.completed
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            step.completed
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {step.completed ? '✓' : step.stepNumber}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{step.topic}</div>
                            <div className="text-sm text-gray-600">{step.subject} • {step.difficulty}</div>
                          </div>
                          {step.score !== undefined && (
                            <div className="text-right">
                              <div className="font-bold text-2xl text-green-600">{step.score}%</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setLearningPath(null)}
                    className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                  >
                    Create New Path
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
