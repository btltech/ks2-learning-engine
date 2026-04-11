import { useState } from 'react';
import FriendsPanel from '../components/FriendsPanel';
import SkillTreeView from '../components/SkillTreeView';
import ProgressChart from '../components/ProgressChart';
import CertificateGallery from '../components/CertificateGallery';

export default function ProgressView() {
  const [activeTab, setActiveTab] = useState<'progress' | 'friends' | 'certificates'>('progress');
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [skillTreeSubject, setSkillTreeSubject] = useState('');

  const handleOpenSkillTree = (subject: string) => {
    setSkillTreeSubject(subject);
    setShowSkillTree(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'progress'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 Progress & Skills
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Friends
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'certificates'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏆 Certificates
          </button>
        </div>

        {/* Content */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Progress Chart */}
            <ProgressChart days={30} />

            {/* Skill Trees */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🌳 Skill Trees</h2>
              <p className="text-gray-600 mb-6">
                Master skills and unlock new challenges in each subject
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Maths Tree */}
                <div
                  onClick={() => handleOpenSkillTree('Maths')}
                  className="group cursor-pointer bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform">
                    🔢
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 text-center mb-2">Maths</h3>
                  <p className="text-sm text-blue-700 text-center">
                    5 skills to master
                  </p>
                  <div className="mt-4 pt-4 border-t border-blue-300">
                    <div className="h-2 bg-blue-300 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: '20%' }} />
                    </div>
                    <p className="text-xs text-blue-700 text-center mt-2">1/5 completed</p>
                  </div>
                </div>

                {/* English Tree */}
                <div
                  onClick={() => handleOpenSkillTree('English')}
                  className="group cursor-pointer bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform">
                    📚
                  </div>
                  <h3 className="text-xl font-bold text-green-900 text-center mb-2">English</h3>
                  <p className="text-sm text-green-700 text-center">
                    2 skills to master
                  </p>
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <div className="h-2 bg-green-300 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: '50%' }} />
                    </div>
                    <p className="text-xs text-green-700 text-center mt-2">1/2 completed</p>
                  </div>
                </div>

                {/* Science Tree */}
                <div
                  onClick={() => handleOpenSkillTree('Science')}
                  className="group cursor-pointer bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform">
                    🔬
                  </div>
                  <h3 className="text-xl font-bold text-orange-900 text-center mb-2">Science</h3>
                  <p className="text-sm text-orange-700 text-center">
                    1 skill to master
                  </p>
                  <div className="mt-4 pt-4 border-t border-orange-300">
                    <div className="h-2 bg-orange-300 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600" style={{ width: '100%' }} />
                    </div>
                    <p className="text-xs text-orange-700 text-center mt-2">1/1 completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && <FriendsPanel />}

        {activeTab === 'certificates' && <CertificateGallery />}
      </div>

      {/* Skill Tree Modal */}
      {showSkillTree && (
        <SkillTreeView
          subject={skillTreeSubject}
          onClose={() => setShowSkillTree(false)}
        />
      )}
    </div>
  );
}
