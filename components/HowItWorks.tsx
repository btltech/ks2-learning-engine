import React from 'react';
import InfoPage from './InfoPage';
import { useNavigate } from 'react-router-dom';
import { GRADIENTS, RADIUS, SHADOWS } from '../constants';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <InfoPage 
      title="How It Works" 
      emoji="🎯"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Learn, Practice, Master</h2>
        <p className="text-gray-700 mb-6">
          KS2 Learning Engine makes mastering the National Curriculum fun and engaging. 
          Here's how our platform works.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-6 bg-gradient-to-br from-blue-50 to-purple-50`}>
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">1. Choose Your Subject</h3>
            <p className="text-gray-700 text-sm">
              Pick from Maths, English, Science, and 7 other subjects aligned to the UK National Curriculum.
            </p>
          </div>
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-6 bg-gradient-to-br from-green-50 to-teal-50`}>
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">2. Learn & Play</h3>
            <p className="text-gray-700 text-sm">
              Take quizzes, play educational games, and earn rewards. MiRa the AI tutor helps when you're stuck.
            </p>
          </div>
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-6 bg-gradient-to-br from-orange-50 to-yellow-50`}>
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">3. Track Progress</h3>
            <p className="text-gray-700 text-sm">
              Watch your mastery grow! Parents and teachers can monitor your journey.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Key Features</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🤖</span>
            <div>
              <p className="font-bold text-gray-900">MiRa AI Tutor</p>
              <p className="text-gray-700 text-sm">Get instant help, hints, and explanations tailored to your age.</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🎨</span>
            <div>
              <p className="font-bold text-gray-900">Customize Your Avatar</p>
              <p className="text-gray-700 text-sm">Express yourself with custom avatars and accessories.</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚡</span>
            <div>
              <p className="font-bold text-gray-900">Adaptive Learning</p>
              <p className="text-gray-700 text-sm">Questions adjust to your skill level for optimal challenge.</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔊</span>
            <div>
              <p className="font-bold text-gray-900">Text-to-Speech</p>
              <p className="text-gray-700 text-sm">Every question can be read aloud with natural voices.</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">For Different Users</h3>
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/parent-guide')}
            className={`w-full text-left ${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white hover:bg-gray-50 motion-safe:transition-colors`}
          >
            <p className="font-bold text-blue-600">👨‍👩‍👧‍👦 Parents → View Parent Guide</p>
          </button>
          <button 
            onClick={() => navigate('/teacher-guide')}
            className={`w-full text-left ${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white hover:bg-gray-50 motion-safe:transition-colors`}
          >
            <p className="font-bold text-purple-600">👩‍🏫 Teachers → View Teacher Guide</p>
          </button>
        </div>
      </div>
    </InfoPage>
  );
};

export default HowItWorks;
