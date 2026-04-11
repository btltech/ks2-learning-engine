import React from 'react';
import InfoPage from './InfoPage';
import { useNavigate } from 'react-router-dom';
import { GRADIENTS, RADIUS, SHADOWS } from '../constants';

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();

  return (
    <InfoPage 
      title="Getting Started" 
      emoji="🚀"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to KS2 Learning Engine!</h2>
        <p className="text-gray-700 mb-6">
          Let's get you up and running in just a few steps.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Path</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => navigate('/parent-guide')}
            className={`${RADIUS.card} ${SHADOWS.secondary} p-6 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 motion-safe:transition-colors text-left`}
          >
            <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
            <h4 className="font-bold text-gray-900 mb-1">I'm a Parent</h4>
            <p className="text-sm text-gray-600">Help my child learn at home</p>
          </button>

          <button 
            onClick={() => navigate('/teacher-guide')}
            className={`${RADIUS.card} ${SHADOWS.secondary} p-6 bg-gradient-to-br from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 motion-safe:transition-colors text-left`}
          >
            <div className="text-4xl mb-2">👩‍🏫</div>
            <h4 className="font-bold text-gray-900 mb-1">I'm a Teacher</h4>
            <p className="text-sm text-gray-600">Use in my classroom</p>
          </button>

          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-6 bg-gradient-to-br from-orange-50 to-yellow-50`}>
            <div className="text-4xl mb-2">🎓</div>
            <h4 className="font-bold text-gray-900 mb-1">I'm a Student</h4>
            <p className="text-sm text-gray-600">Ask your parent or teacher for your code!</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Setup (Parents)</h3>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-6">
          <li>Create your parent account with email and password</li>
          <li>Create a child profile (first name, age, year group)</li>
          <li>Note the unique child code shown</li>
          <li>Your child logs in using that code to start learning</li>
          <li>Monitor progress from your Parent Dashboard</li>
        </ol>

        <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Setup (Teachers)</h3>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-6">
          <li>Create your teacher account</li>
          <li>Set up a class (give it a name and year group)</li>
          <li>Generate student codes (one per student)</li>
          <li>Share codes with students via printed handout or projection</li>
          <li>Students create accounts using their codes</li>
          <li>Assign quizzes and view class progress</li>
        </ol>

        <div className={`bg-blue-50 border-l-4 border-blue-500 ${RADIUS.card} p-4 mb-6`}>
          <p className="font-bold text-blue-900">💡 Tip: Start Small</p>
          <p className="text-gray-700">
            Try one subject first (we recommend Maths or English). Take a few quizzes to get familiar 
            with how the platform works before exploring more features.
          </p>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">Need More Help?</h3>
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/help')}
            className="text-blue-600 hover:underline block"
          >
            → Visit the Help Center
          </button>
          <button 
            onClick={() => navigate('/how-it-works')}
            className="text-blue-600 hover:underline block"
          >
            → Learn How It Works
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="text-blue-600 hover:underline block"
          >
            → Contact Support
          </button>
        </div>
      </div>
    </InfoPage>
  );
};

export default GettingStarted;
