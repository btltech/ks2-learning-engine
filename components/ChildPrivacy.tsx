import React from 'react';
import InfoPage from './InfoPage';

const ChildPrivacy: React.FC = () => (
  <InfoPage title="Privacy for Children" emoji="🌱" lastUpdated="August 10, 2026">
    <div className="prose max-w-none text-lg leading-relaxed">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <p className="font-bold text-blue-950 mb-2">The short version</p>
        <p className="text-blue-900">
          DemiWura remembers some information so it can give you lessons, save your progress and keep your account safe.
          We do not sell your information or use it to show you adverts.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">What do we know about you?</h2>
      <p className="text-gray-700 mb-4">
        Your parent gives us your first name and age and creates a private PIN. We also remember the quizzes you take,
        your scores, rewards, learning time and the subjects you practise. This helps the app show your progress.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">What happens when you ask MiRa?</h2>
      <p className="text-gray-700 mb-4">
        MiRa uses Google Gemini, an AI service, to help answer some questions. Your words and the lesson you are working
        on are sent to that service. We try not to send your name. AI can make mistakes, so check anything strange with
        a parent, teacher or another adult you trust.
      </p>

      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 my-6">
        <p className="font-bold text-amber-950">Keep private things private</p>
        <p className="text-amber-900 mt-1">
          Do not type your surname, address, school, phone number, email, password, parent code, PIN, photograph or
          private health information into MiRa or a message box.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Who can see your learning?</h2>
      <p className="text-gray-700 mb-4">
        Your parent can see the progress saved to your profile. If you join a class, your teacher can see the class
        information needed to support learning. Other learners may see a limited name or alias during a class activity,
        quiz battle or leaderboard, but there is no public messaging or public profile.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">You can ask questions about your data</h2>
      <p className="text-gray-700 mb-4">
        You can ask what information we have, ask us to fix it or ask us to delete it where the law allows. You can ask
        a trusted adult to help, or email{' '}
        <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-700 font-semibold hover:underline">
          privacy@demiwuraks2.co.uk
        </a>.
      </p>

      <p className="text-gray-700">
        Adults can read the complete <a href="/privacy-policy" className="text-blue-700 font-semibold hover:underline">Privacy Policy</a>.
      </p>
    </div>
  </InfoPage>
);

export default ChildPrivacy;
