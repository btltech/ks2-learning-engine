import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SkillTreeView from '../components/SkillTreeView';
import ProgressChart from '../components/ProgressChart';
import CertificateGallery from '../components/CertificateGallery';
import { progressVisualizationService } from '../services/progressVisualizationService';
import { socialLearningService } from '../services/socialLearningService';

type ProgressTab = 'progress' | 'certificates' | 'friends';

const isProgressTab = (value: string | null): value is ProgressTab =>
  value === 'progress' || value === 'certificates' || value === 'friends';

const subjectStyles = {
  Maths: {
    icon: '🔢',
    card: 'from-blue-100 to-blue-200 text-blue-900 border-blue-300',
    track: 'bg-blue-300',
    fill: 'bg-blue-600',
  },
  English: {
    icon: '📚',
    card: 'from-green-100 to-green-200 text-green-900 border-green-300',
    track: 'bg-green-300',
    fill: 'bg-green-600',
  },
  Science: {
    icon: '🔬',
    card: 'from-orange-100 to-orange-200 text-orange-900 border-orange-300',
    track: 'bg-orange-300',
    fill: 'bg-orange-600',
  },
} as const;

export default function ProgressView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab: ProgressTab = isProgressTab(requestedTab) ? requestedTab : 'progress';
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [skillTreeSubject, setSkillTreeSubject] = useState('');

  const skillTrees = useMemo(
    () => Object.keys(subjectStyles).map((subject) => progressVisualizationService.getSkillTree(subject)),
    [],
  );
  const friends = useMemo(() => socialLearningService.getFriends(), []);

  const selectTab = (tab: ProgressTab) => {
    setSearchParams(tab === 'progress' ? {} : { tab });
  };

  const handleOpenSkillTree = (subject: string) => {
    setSkillTreeSubject(subject);
    setShowSkillTree(true);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4" aria-labelledby="progress-heading">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 id="progress-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2" role="tablist" aria-label="Progress sections">
          {([
            ['progress', '📈 Progress & Skills'],
            ['certificates', '🏆 Certificates'],
            ['friends', '👥 Friends'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`progress-panel-${tab}`}
              id={`progress-tab-${tab}`}
              onClick={() => selectTab(tab)}
              className={`min-h-11 py-3 px-4 rounded-xl font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'progress' && (
          <div id="progress-panel-progress" role="tabpanel" aria-labelledby="progress-tab-progress" className="space-y-6">
            <ProgressChart days={30} />

            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🌳 Skill Trees</h2>
              <p className="text-gray-600 mb-6">Open a subject to see the milestones you have reached.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {skillTrees.map((tree) => {
                  if (!tree) return null;
                  const style = subjectStyles[tree.subject as keyof typeof subjectStyles];
                  const percentage = tree.totalNodes > 0
                    ? Math.round((tree.completedNodes / tree.totalNodes) * 100)
                    : 0;

                  return (
                    <button
                      type="button"
                      key={tree.subject}
                      onClick={() => handleOpenSkillTree(tree.subject)}
                      className={`group w-full text-left bg-gradient-to-br rounded-xl border p-6 hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${style.card}`}
                    >
                      <span className="block text-5xl mb-4 text-center" aria-hidden="true">{style.icon}</span>
                      <span className="block text-xl font-bold text-center mb-2">{tree.subject}</span>
                      <span className="block text-sm text-center">{tree.totalNodes} tracked milestones</span>
                      <span className="block mt-4 pt-4 border-t border-current/20">
                        <span className={`block h-2 rounded-full overflow-hidden ${style.track}`}>
                          <span className={`block h-full ${style.fill}`} style={{ width: `${percentage}%` }} />
                        </span>
                        <span className="block text-xs text-center mt-2">{tree.completedNodes}/{tree.totalNodes} completed ({percentage}%)</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div id="progress-panel-certificates" role="tabpanel" aria-labelledby="progress-tab-certificates">
            <CertificateGallery />
          </div>
        )}

        {activeTab === 'friends' && (
          <div id="progress-panel-friends" role="tabpanel" aria-labelledby="progress-tab-friends" className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Friends</h2>
            {friends.length === 0 ? (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-6 text-center">
                <span className="text-4xl" aria-hidden="true">👋</span>
                <p className="font-semibold text-gray-900 mt-3">No learning friends linked yet</p>
                <p className="text-sm text-gray-600 mt-1">A parent or teacher can help connect safe classroom friends.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {friends.map((friend) => (
                  <li key={friend.userId} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{friend.displayName}</p>
                      <p className="text-sm text-gray-600">Level {friend.level} · {friend.points} points</p>
                    </div>
                    <span className={`text-sm font-medium ${friend.status === 'offline' ? 'text-gray-500' : 'text-green-700'}`}>
                      {friend.status === 'in-quiz' ? 'In a quiz' : friend.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showSkillTree && (
        <SkillTreeView subject={skillTreeSubject} onClose={() => setShowSkillTree(false)} />
      )}
    </section>
  );
}
