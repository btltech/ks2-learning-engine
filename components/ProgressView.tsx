import React from 'react';
import { useUser } from '../context/UserContext';
import { SUBJECTS } from '../constants';
import { ChartBarIcon } from '@heroicons/react/24/solid';

interface ProgressViewProps {
  onBack: () => void;
}

const ProgressView: React.FC<ProgressViewProps> = ({ onBack }) => {
  const { user } = useUser();

  if (!user) return null;

  // Calculate overall progress
  const totalSubjects = SUBJECTS.length;
  const subjectsStarted = Object.keys(user.mastery).length;
  
  // Calculate average mastery per subject
  const subjectProgress = SUBJECTS.map(subject => {
    const subjectMastery = user.mastery[subject.name] || {};
    const topics = Object.keys(subjectMastery);
    const totalScore = (Object.values(subjectMastery) as number[]).reduce((a, b) => a + b, 0);
    const average = topics.length > 0 ? Math.round(totalScore / topics.length) : 0;
    
    return {
      name: subject.name,
      icon: subject.icon,
      color: subject.color,
      bgColor: subject.bgColor,
      topicsCompleted: topics.length,
      averageScore: average
    };
  }).filter(s => s.topicsCompleted > 0).sort((a, b) => b.averageScore - a.averageScore);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <button 
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-800 font-bold flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
              <p className="opacity-90">Keep up the great work, {user.name}!</p>
            </div>
            <ChartBarIcon className="h-20 w-20 text-blue-200 opacity-50" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{user.totalPoints}</div>
              <div className="text-sm opacity-80">Total Points</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{subjectsStarted} / {totalSubjects}</div>
              <div className="text-sm opacity-80">Subjects Started</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{user.streak}</div>
              <div className="text-sm opacity-80">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Subject Mastery</h2>
          
          {subjectProgress.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No progress yet!</p>
              <p>Start a lesson to see your stats here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjectProgress.map((subject) => (
                <div key={subject.name} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${subject.bgColor} mr-3`}>
                      <subject.icon className={`h-6 w-6 ${subject.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{subject.name}</h3>
                      <p className="text-xs text-gray-500">{subject.topicsCompleted} topics studied</p>
                    </div>
                    <div className="ml-auto font-bold text-xl text-gray-700">
                      {subject.averageScore}%
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        subject.averageScore >= 80 ? 'bg-green-500' :
                        subject.averageScore >= 60 ? 'bg-blue-500' :
                        subject.averageScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${subject.averageScore}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
