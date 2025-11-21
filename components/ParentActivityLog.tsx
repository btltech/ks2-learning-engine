import React, { useMemo } from 'react';
import { CheckCircleIcon, SparklesIcon, FireIcon, StarIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useRealtimeStudentActivity } from '../hooks/useRealtimeListeners';
import { UserProfile } from '../types';

interface ParentActivityLogProps {
  childId: string;
  childName: string;
}

const ParentActivityLog: React.FC<ParentActivityLogProps> = ({ childId, childName }) => {
  const { lastUpdate, pointsGained, loading, error } = useRealtimeStudentActivity(childId);

  // Mock activity history - in real app, this would come from Firestore
  const activityHistory = useMemo(() => [
    {
      id: 'activity-1',
      timestamp: new Date(Date.now() - 5 * 60000), // 5 mins ago
      type: 'quiz_complete',
      title: 'Completed Fractions Quiz',
      description: 'Score: 92% | Earned 45 points',
      icon: '✅',
      points: 45,
      subject: 'Maths',
    },
    {
      id: 'activity-2',
      timestamp: new Date(Date.now() - 15 * 60000), // 15 mins ago
      type: 'lesson_complete',
      title: 'Completed Photosynthesis Lesson',
      description: 'Video lesson - 8 minutes | Earned 20 points',
      icon: '📖',
      points: 20,
      subject: 'Science',
    },
    {
      id: 'activity-3',
      timestamp: new Date(Date.now() - 1 * 60 * 60000), // 1 hour ago
      type: 'badge_earned',
      title: 'Badge Unlocked: Math Master',
      description: 'Earned badge for 80% mastery in Mathematics',
      icon: '🏅',
      points: 0,
      subject: 'Maths',
    },
    {
      id: 'activity-4',
      timestamp: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
      type: 'streak_milestone',
      title: 'Streak Milestone: 7 Days!',
      description: 'Maintained learning streak for 7 consecutive days',
      icon: '🔥',
      points: 50,
      subject: 'General',
    },
    {
      id: 'activity-5',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000), // 1 day ago
      type: 'quiz_complete',
      title: 'Completed Victorian Era Quiz',
      description: 'Score: 78% | Earned 35 points',
      icon: '✅',
      points: 35,
      subject: 'History',
    },
  ], []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_complete':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'lesson_complete':
        return <SparklesIcon className="h-6 w-6 text-blue-500" />;
      case 'badge_earned':
        return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
      case 'streak_milestone':
        return <FireIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <StarIcon className="h-6 w-6 text-purple-500" />;
    }
  };

  const totalPointsEarned = useMemo(
    () => activityHistory.reduce((sum, activity) => sum + activity.points, 0),
    [activityHistory]
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <ClockIcon className="h-6 w-6 text-blue-500" />
        Activity Timeline
      </h3>
      <p className="text-gray-600 mb-6">Real-time updates of {childName}'s learning activities</p>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div>
          <p className="text-sm text-gray-600">Points Today</p>
          <p className="text-2xl font-bold text-blue-600">{totalPointsEarned}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Activities</p>
          <p className="text-2xl font-bold text-purple-600">{activityHistory.length}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-600">Last Activity</p>
          <p className="text-lg font-bold text-green-600">{formatTime(activityHistory[0]?.timestamp || new Date())}</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-0">
        {activityHistory.map((activity, idx) => (
          <div
            key={activity.id}
            className="flex gap-4 p-4 hover:bg-gray-50 transition-colors border-l-4 border-gray-200 hover:border-l-4 hover:border-purple-500"
          >
            {/* Icon */}
            <div className="flex-shrink-0 pt-1">
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                </div>
                <span className="text-xs font-bold text-gray-500 ml-4 whitespace-nowrap">
                  {formatTime(activity.timestamp)}
                </span>
              </div>

              {/* Subject Badge & Points */}
              <div className="flex gap-2 mt-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {activity.subject}
                </span>
                {activity.points > 0 && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    +{activity.points} points
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {activityHistory.length === 0 && (
        <div className="text-center py-12">
          <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No activities yet</p>
        </div>
      )}

      {/* Real-time Sync Indicator */}
      {lastUpdate && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm text-green-700">
            Last sync: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ParentActivityLog;
