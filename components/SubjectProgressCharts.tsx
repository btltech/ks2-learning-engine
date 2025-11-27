import React, { useMemo } from 'react';
import { ChartBarIcon, SparklesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { useUser } from '../context/UserContext';

interface SubjectProgressChartsProps {
  subjects: string[];
  studentName?: string;
  _minMasteryScore?: number;
  childMastery?: Record<string, Record<string, number>>;
}

// Subject color mapping
const SUBJECT_COLORS: Record<string, string> = {
  'Maths': 'from-blue-400 to-blue-600',
  'English': 'from-purple-400 to-purple-600',
  'Science': 'from-green-400 to-green-600',
  'History': 'from-orange-400 to-orange-600',
  'Geography': 'from-red-400 to-red-600',
  'PE': 'from-pink-400 to-pink-600',
};

const SubjectProgressCharts: React.FC<SubjectProgressChartsProps> = ({
  subjects,
  studentName = 'Student',
  _minMasteryScore = 0,
  childMastery,
}) => {
  const { user } = useUser();
  
  // Use provided childMastery or fall back to current user's mastery
  const mastery = childMastery || user?.mastery || {};

  // Calculate real subject data from mastery
  const getSubjectData = (subject: string) => {
    const subjectMastery = mastery[subject] || {};
    const topicValues = Object.values(subjectMastery) as number[];
    const totalTopics = topicValues.length;
    const progress = totalTopics > 0 
      ? Math.round(topicValues.reduce((sum: number, val: number) => sum + val, 0) / totalTopics)
      : 0;
    const mastered = topicValues.filter((v: number) => v >= 80).length;
    
    return {
      progress,
      topics: totalTopics,
      mastered,
      color: SUBJECT_COLORS[subject] || 'from-gray-400 to-gray-600',
    };
  };

  const totalProgress = useMemo(() => {
    return subjects.reduce((sum, subject) => sum + getSubjectData(subject).progress, 0) / subjects.length;
  }, [subjects]);

  const totalTopics = useMemo(() => {
    return subjects.reduce((sum, subject) => sum + getSubjectData(subject).topics, 0);
  }, [subjects]);

  const totalMastered = useMemo(() => {
    return subjects.reduce((sum, subject) => sum + getSubjectData(subject).mastered, 0);
  }, [subjects]);

  // Rank progress by mastery
  const rankedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => getSubjectData(b).progress - getSubjectData(a).progress);
  }, [subjects]);

  const getMasteryLevel = (progress: number) => {
    if (progress >= 90) return { label: 'Expert', color: 'bg-green-500' };
    if (progress >= 75) return { label: 'Proficient', color: 'bg-blue-500' };
    if (progress >= 50) return { label: 'Intermediate', color: 'bg-yellow-500' };
    if (progress >= 25) return { label: 'Beginner', color: 'bg-orange-500' };
    return { label: 'Starting', color: 'bg-red-500' };
  };

  // Show empty state when there's no progress data yet
  const hasProgress = totalTopics > 0;

  if (!hasProgress) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">No Progress Yet</h3>
        <p className="text-gray-600 mb-4">
          {studentName} hasn't completed any quizzes yet. Progress will appear here once they start learning!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p className="font-bold text-blue-800 mb-2">💡 How to get started:</p>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Select a subject from the main menu</li>
            <li>• Choose a topic to learn about</li>
            <li>• Complete a lesson and take a quiz</li>
            <li>• Progress will be tracked automatically!</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Progress Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md p-8 border border-purple-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-purple-500" />
          Subject Progress Overview
        </h3>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 font-medium">Overall Mastery</p>
            <p className="text-3xl font-black text-purple-600 mt-2">{Math.round(totalProgress)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 font-medium">Topics Mastered</p>
            <p className="text-3xl font-black text-green-600 mt-2">{totalMastered}</p>
            <p className="text-xs text-gray-600 mt-2">of {totalTopics} total</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 font-medium">Subjects</p>
            <p className="text-3xl font-black text-blue-600 mt-2">{subjects.length}</p>
            <p className="text-xs text-gray-600 mt-2">in progress</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 font-medium">Top Subject</p>
            <p className="text-lg font-black text-orange-600 mt-2">{rankedSubjects[0]}</p>
            <p className="text-xs text-gray-600 mt-2">{Math.round(getSubjectData(rankedSubjects[0]).progress)}% mastery</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <p className="font-bold text-gray-800 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            Learning Progress
          </p>
          <div className="w-full bg-gray-300 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Keep going! You're {Math.round(totalProgress)}% through your learning journey.
          </p>
        </div>
      </div>

      {/* Individual Subject Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rankedSubjects.map((subject) => {
          const data = getSubjectData(subject);
          const mastery = getMasteryLevel(data.progress);

          return (
            <div key={subject} className={`bg-gradient-to-br ${data.color} rounded-xl shadow-lg p-6 text-white`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-bold opacity-90">{subject}</p>
                  <p className="text-3xl font-black mt-1">{Math.round(data.progress)}%</p>
                </div>
                <div className={`${mastery.color} rounded-full px-3 py-1 text-sm font-bold`}>
                  {mastery.label}
                </div>
              </div>

              {/* Main Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm font-bold mb-2 opacity-90">
                  <span>Mastery Level</span>
                  <span>{Math.round(data.progress)}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-25 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all"
                    style={{ width: `${data.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-xs opacity-75 font-medium">Topics Mastered</p>
                  <p className="text-2xl font-black mt-1">{data.mastered}</p>
                  <p className="text-xs opacity-75">{data.topics - data.mastered} to go</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-xs opacity-75 font-medium">Total Topics</p>
                  <p className="text-2xl font-black mt-1">{data.topics}</p>
                  <p className="text-xs opacity-75">in this subject</p>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 pt-4 border-t border-white border-opacity-25">
                <p className="text-xs opacity-75 font-medium mb-2">💡 Next Steps:</p>
                {data.progress >= 80 ? (
                  <p className="text-sm">Great work! Try challenging quizzes to master remaining topics.</p>
                ) : data.progress >= 50 ? (
                  <p className="text-sm">You're doing well! Keep practicing to improve mastery.</p>
                ) : (
                  <p className="text-sm">Keep going! Complete more lessons to unlock new topics.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5" />
          Personalized Recommendations
        </h4>
        <div className="space-y-3">
          {rankedSubjects.length > 0 && getSubjectData(rankedSubjects[rankedSubjects.length - 1]).progress < 50 && (
            <p className="text-blue-800">
              📚 <strong>Priority:</strong> {rankedSubjects[rankedSubjects.length - 1]} needs more attention. Try completing a few lessons today!
            </p>
          )}
          {rankedSubjects.length > 0 && getSubjectData(rankedSubjects[0]).progress >= 80 && (
            <p className="text-blue-800">
              🌟 <strong>Well done!</strong> You've mastered {rankedSubjects[0]} at 80%+. Consider tackling some advanced challenges!
            </p>
          )}
          <p className="text-blue-800">
            🎯 <strong>Goal:</strong> Aim for 80%+ mastery in all subjects to unlock special badges!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubjectProgressCharts;
