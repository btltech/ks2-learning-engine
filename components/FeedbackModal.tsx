import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateFeedback } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import type { QuizResult, Explanation } from '../types';

interface FeedbackModalProps {
  quizResults: QuizResult[];
  studentAge: number;
  pointsEarned: number;
  onRetry: () => void;
  onNewTopic: () => void;
  nextDifficultySuggestion?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ quizResults, studentAge, pointsEarned, onRetry, onNewTopic, nextDifficultySuggestion }) => {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const score = quizResults.filter(r => r.isCorrect).length;
  const total = quizResults.length;
  
  const incorrectAnswers = useMemo(() => 
    quizResults.filter(r => !r.isCorrect), 
    [quizResults]
  );

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (incorrectAnswers.length > 0) {
      try {
        const generatedExplanations = await generateFeedback(incorrectAnswers, studentAge);
        setExplanations(generatedExplanations);
      } catch (err) {
        console.error('Error generating feedback:', err);
        setError('We couldn\'t load explanations right now, but you can still see your results!');
      }
    }
    setLoading(false);
  }, [incorrectAnswers, studentAge]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center transform transition-all animate-pop-in max-h-[90vh] overflow-y-auto">
        <SparklesIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" aria-hidden="true"/>
        <h2 id="feedback-title" className="text-3xl font-extrabold text-gray-800">Quiz Complete!</h2>
        
        <div 
          className="bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full inline-block my-4 text-lg"
          role="status"
          aria-label={`You earned ${pointsEarned} points`}
        >
          +{pointsEarned} points!
        </div>

        <p 
          className="text-5xl font-bold my-2" 
          style={{color: percentage > 70 ? '#10B981' : percentage > 40 ? '#F59E0B' : '#EF4444'}}
          role="status"
          aria-label={`Your score: ${score} out of ${total} correct`}
        >
            {score} / {total}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-6" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            <div 
                className={`h-4 rounded-full transition-all duration-500 ${percentage > 70 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>

        {/* Difficulty Recommendation */}
        {nextDifficultySuggestion && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700 font-semibold mb-2">📊 Difficulty Recommendation</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Next Time:</span>
              <span className={`px-3 py-1 rounded-full font-bold text-white ${
                nextDifficultySuggestion === 'Easy' ? 'bg-green-500' :
                nextDifficultySuggestion === 'Hard' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}>
                {nextDifficultySuggestion}
              </span>
              <span className="text-xs text-gray-600 ml-2">
                {nextDifficultySuggestion === 'Easy' && '💪 You got this! Try Easy mode to build confidence.' }
                {nextDifficultySuggestion === 'Hard' && '🚀 You\'re ready for a challenge!' }
                {nextDifficultySuggestion === 'Medium' && '⚡ Keep the balance and push yourself!' }
              </span>
            </div>
          </div>
        )}

        {incorrectAnswers.length > 0 && (
          <section className="text-left my-8 p-4 bg-gray-50 rounded-lg" aria-labelledby="review-heading">
            <h3 id="review-heading" className="text-xl font-bold text-gray-800 mb-4">Let's Review!</h3>
            {loading ? <LoadingSpinner message="Preparing your personalized explanations..." /> : error ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            ) : (
              <ul className="space-y-4" role="list" aria-label="Quiz review">
                {incorrectAnswers.map((result, index) => {
                  const explanation = explanations.find(e => e.question === result.question)?.explanation;
                  return (
                    <li key={index} className="border-b pb-4 last:border-b-0" role="listitem">
                      <p className="font-semibold text-gray-700">{result.question}</p>
                      <div className="flex items-center text-sm mt-2">
                        <XCircleIcon className="h-5 w-5 text-red-500 mr-2 shrink-0" aria-hidden="true" />
                        <span className="text-gray-500">You answered: <span className="font-semibold">{result.userAnswer}</span></span>
                      </div>
                       <div className="flex items-center text-sm mt-1">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" aria-hidden="true" />
                        <span className="text-gray-500">Correct answer: <span className="font-semibold">{result.correctAnswer}</span></span>
                      </div>
                      {explanation && (
                         <div className="mt-2 p-3 bg-blue-50 rounded-md text-blue-800 font-semibold">
                            {explanation}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {score === total && (
            <p className="text-lg text-green-600 font-bold my-8" role="status">Wow, a perfect score! You're a superstar!</p>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onRetry}
            aria-label="Retry the quiz"
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transform hover:scale-105 transition-transform"
          >
            Try Again
          </button>
          <button
            onClick={onNewTopic}
            aria-label="Choose a new topic"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-300 transform hover:scale-105 transition-transform"
          >
            New Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;