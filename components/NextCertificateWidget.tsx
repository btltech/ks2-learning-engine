import { useState, useEffect } from 'react';
import { progressVisualizationService } from '../services/progressVisualizationService';
import { useNavigate } from 'react-router-dom';

export default function NextCertificateWidget() {
  const [nextGoal, setNextGoal] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    calculateNextGoal();
  }, []);

  const calculateNextGoal = () => {
    const summary = progressVisualizationService.getWeeklySummary();
    const certificates = progressVisualizationService.getCertificates();
    
    // Determine next certificate goal
    let goal = null;
    
    // Check for streak achievements
    const currentStreak = parseInt(localStorage.getItem('ks2_current_streak') || '0');
    if (currentStreak < 7) {
      goal = {
        title: '7-Day Streak',
        description: 'Complete quizzes for 7 days in a row',
        progress: currentStreak,
        target: 7,
        icon: '🔥',
        badge: '🥉'
      };
    } else if (summary.totalQuizzes < 10) {
      goal = {
        title: '10 Quiz Milestone',
        description: 'Complete 10 quizzes this week',
        progress: summary.totalQuizzes,
        target: 10,
        icon: '📝',
        badge: '🥉'
      };
    } else if (summary.averageScore < 80) {
      goal = {
        title: '80% Average Score',
        description: 'Reach 80% average score',
        progress: summary.averageScore,
        target: 80,
        icon: '📊',
        badge: '🥈'
      };
    } else if (summary.averageScore < 90) {
      goal = {
        title: 'Excellence Certificate',
        description: 'Achieve 90% average score',
        progress: summary.averageScore,
        target: 90,
        icon: '⭐',
        badge: '🥇'
      };
    } else {
      goal = {
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        progress: summary.averageScore,
        target: 100,
        icon: '💯',
        badge: '💎'
      };
    }
    
    setNextGoal(goal);
  };

  if (!nextGoal) return null;

  const progressPercent = (nextGoal.progress / nextGoal.target) * 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md p-4 border-2 border-purple-200">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span>🏆</span> Next Certificate
      </h3>

      <div className="text-center mb-3">
        <div className="text-4xl mb-2">{nextGoal.badge}</div>
        <h4 className="font-bold text-gray-900 mb-1">{nextGoal.title}</h4>
        <p className="text-xs text-gray-600">{nextGoal.description}</p>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-purple-700">Progress</span>
          <span className="text-xs font-bold text-purple-900">
            {Math.round(nextGoal.progress)}/{nextGoal.target}
          </span>
        </div>
        <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => navigate('/progress?tab=certificates')}
        className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-sm transition-colors"
      >
        View All Certificates
      </button>
    </div>
  );
}
