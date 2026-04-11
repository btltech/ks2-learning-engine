import React from 'react';
import InfoPage from './InfoPage';
import { RADIUS } from '../constants';

const TeacherGuide: React.FC = () => {
  return (
    <InfoPage 
      title="Teacher Guide" 
      emoji="👩‍🏫"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Using KS2 Learning Engine in Your Classroom</h2>
        <p className="text-gray-700 mb-6">
          This guide helps teachers integrate our platform into their teaching practice and 
          maximize student outcomes.
        </p>

        <div className={`bg-purple-50 ${RADIUS.card} p-6 mb-6`}>
          <h3 className="text-xl font-bold text-purple-900 mb-2">Getting Started</h3>
          <ol className="list-decimal pl-6 text-gray-700 space-y-1">
            <li>Create a teacher account</li>
            <li>Set up your first class</li>
            <li>Generate student access codes</li>
            <li>Share codes with students to join your class</li>
            <li>Start assigning quizzes and tracking progress</li>
          </ol>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Classroom Features</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
          <li><strong>Class Dashboard:</strong> View aggregated performance across all students</li>
          <li><strong>Custom Assignments:</strong> Create focused revision sets on specific topics</li>
          <li><strong>Progress Tracking:</strong> Identify struggling students early</li>
          <li><strong>Question Quality:</strong> Find and flag unclear or problematic questions</li>
          <li><strong>Curriculum Coverage:</strong> Ensure all National Curriculum objectives are met</li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Best Practices</h3>
        <div className="space-y-4 mb-6">
          <div className={`${RADIUS.card} p-4 border-l-4 border-blue-500 bg-blue-50`}>
            <p className="font-bold text-blue-900">Use as Formative Assessment</p>
            <p className="text-gray-700">Quick quizzes help identify knowledge gaps without high-stakes testing.</p>
          </div>
          <div className={`${RADIUS.card} p-4 border-l-4 border-green-500 bg-green-50`}>
            <p className="font-bold text-green-900">Differentiate Learning</p>
            <p className="text-gray-700">Assign different difficulty levels based on individual student needs.</p>
          </div>
          <div className={`${RADIUS.card} p-4 border-l-4 border-orange-500 bg-orange-50`}>
            <p className="font-bold text-orange-900">Review Before Assigning</p>
            <p className="text-gray-700">Preview questions to ensure they align with your teaching approach.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Classroom Mode</h3>
        <p className="text-gray-700 mb-4">
          Use Classroom Mode for whole-class activities with projector display, 
          collaborative challenges, and real-time quiz battles.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Support</h3>
        <p className="text-gray-700">
          For teacher-specific support:{' '}
          <a href="mailto:teachers@ks2learning.com" className="text-blue-600 hover:underline">
            teachers@ks2learning.com
          </a>
        </p>
      </div>
    </InfoPage>
  );
};

export default TeacherGuide;
