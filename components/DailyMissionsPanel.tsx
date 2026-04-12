import React, { useState, useEffect } from 'react';
import { gamificationService, DailyMission } from '../services/gamificationService';

export default function DailyMissionsPanel() {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [summary, setSummary] = useState({ completed: 0, total: 0, percentage: 0 });

  useEffect(() => {
    loadMissions();
    // Refresh every minute to update progress
    const interval = setInterval(loadMissions, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMissions = () => {
    setMissions(gamificationService.getDailyMissions());
    setSummary(gamificationService.getMissionsSummary());
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span> Daily Missions
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Complete missions to earn rewards!
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600">{summary.completed}/{summary.total}</div>
          <div className="text-sm text-gray-500">completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-purple-600">{summary.percentage}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
            style={{ width: `${summary.percentage}%` }}
          />
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-3">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>

      {/* All Complete Message */}
      {summary.percentage === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-bold text-lg">All Missions Complete!</div>
          <div className="text-sm opacity-90">You're a learning champion!</div>
        </div>
      )}
    </div>
  );
}

const MissionCard: React.FC<{ mission: DailyMission }> = ({ mission }) => {
  const progress = Math.min(100, (mission.progress / mission.requirement) * 100);
  const isComplete = mission.completed;

  return (
    <div
      className={`bg-white rounded-xl p-4 border-2 transition-all duration-300 ${
        isComplete
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            {mission.title}
            {isComplete && <span className="text-green-500">✓</span>}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
        </div>
        
        {/* Rewards */}
        <div className="flex flex-col items-end gap-1 ml-4">
          <span className="text-sm font-semibold text-yellow-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            +{mission.reward.points}
          </span>
          {mission.reward.coins && (
            <span className="text-sm font-semibold text-orange-600 flex items-center gap-1">
              🪙 +{mission.reward.coins}
            </span>
          )}
          {mission.reward.badge && (
            <span className="text-lg">{mission.reward.badge}</span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-700">
            {mission.progress} / {mission.requirement}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isComplete
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
