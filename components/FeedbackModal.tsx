import { Owl } from './sunny/Owl';
import { MiraFace } from './sunny/MiraFace';
import { useUISettings } from '../context/UISettingsContext';
import './SunnyQuizResults.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateFeedback } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon, XCircleIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import type { QuizResult, Explanation } from '../types';
import { useGameSounds } from '../hooks/useGameSounds';
import { speakNaturally, speakCelebration, stopSpeaking } from '../services/naturalTTS';
import { resolveMultipleChoiceAnswer } from '../services/quizScoring';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

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
  const { playSuccess, playIncorrect, soundEnabled } = useGameSounds();
  const { settings: { reducedAnimations } } = useUISettings();
  const dialogRef = useModalAccessibility(onNewTopic);

  const scoredResults = useMemo(() => quizResults.filter((result) => result.isScored !== false), [quizResults]);
  const creativeTasks = quizResults.length - scoredResults.length;
  const score = scoredResults.filter(r => r.isCorrect).length;
  const total = scoredResults.length;
  
  const incorrectAnswers = useMemo(() => 
    scoredResults.filter(r => !r.isCorrect),
    [scoredResults]
  );

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (!soundEnabled || reducedAnimations || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let celebrationTimer: ReturnType<typeof setTimeout>;
    if (percentage >= 70) {
      playSuccess();
      const messages = [
        `Amazing work! You got ${score} out of ${total} correct!`,
        `Fantastic! ${score} out of ${total}! You're doing brilliantly!`,
        `Wow! ${score} out of ${total}! You're a superstar!`,
        `Brilliant! ${percentage}% correct! Keep up the great work!`
      ];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const category = percentage === 100 ? 'perfect_score' : 'high_score';
      celebrationTimer = setTimeout(() => speakCelebration(message, 'English', category), 250);
    } else if (percentage >= 40) {
      const messages = [
        `Good effort! You got ${score} out of ${total}. Keep practicing!`,
        `Nice try! ${score} out of ${total}. You're getting better!`,
        `Well done for trying! Let's review the ones you missed.`
      ];
      const message = messages[Math.floor(Math.random() * messages.length)];
      celebrationTimer = setTimeout(() => speakCelebration(message, 'English', 'effort'), 250);
    } else {
      playIncorrect();
      celebrationTimer = setTimeout(() => {
        speakCelebration(
          "Don't worry! Everyone learns at their own pace. Let's look at the explanations together.",
          'English',
          'retry',
        );
      }, 250);
    }
    
    // Cleanup: stop speaking when modal closes
    return () => { clearTimeout(celebrationTimer); stopSpeaking(); };
  }, [percentage, playSuccess, playIncorrect, score, total, soundEnabled, reducedAnimations]);

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
    <div className="sunny-results-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" role="presentation">
      <div ref={dialogRef} tabIndex={-1} className="sunny-results sunny-ui bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-2xl w-full text-center transform transition-all animate-pop-in max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
        <div className="sunny-results-hero" tabIndex={0} role="group" aria-label="Quiz summary">
          <div className="sunny-confetti-strip" aria-hidden="true">{Array.from({length:12}, (_, i) => <i key={i} />)}</div>
          <Owl pose="hooray" height={180} />
          <p className="sunny-score-badge" role="status" aria-label={`Your score: ${score} out of ${total} correct`}>
            <strong>{score}</strong><span>out of {total}</span>
          </p>
          <div className="sunny-results-greeting">
            <h2 id="feedback-title" className="text-2xl sm:text-3xl font-extrabold text-gray-800">Quiz Complete!</h2>
            <p>Well done for giving it a go!</p>
            <div className="sunny-earned-points" role="status" aria-label={`You earned ${pointsEarned} points`}>
              <span aria-hidden="true">★</span> +{pointsEarned} points earned!
            </div>
          </div>
        </div>
        <div className="sunny-results-meter w-full bg-gray-200 rounded-full h-4 mb-6" role="progressbar" aria-label="Quiz score" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            <div 
                className={`h-4 rounded-full transition-all duration-500 ${percentage > 70 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        {creativeTasks > 0 && (
          <p className="mb-6 rounded-lg bg-indigo-50 p-3 font-semibold text-indigo-800">
            {creativeTasks} creative {creativeTasks === 1 ? 'task was' : 'tasks were'} completed and kept separate from your knowledge score.
          </p>
        )}

        {/* Difficulty Recommendation */}
        {nextDifficultySuggestion && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700 font-semibold mb-2">📊 Difficulty Recommendation</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Next Time:</span>
                <span className={`px-3 py-1 rounded-full font-bold text-white ${
                  nextDifficultySuggestion === 'Easy' ? 'bg-green-500' :
                  nextDifficultySuggestion === 'Hard' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}>
                  {nextDifficultySuggestion}
                </span>
              </div>
              <span className="text-xs text-gray-600 sm:ml-2">
                {nextDifficultySuggestion === 'Easy' && '💪 You got this! Try Easy mode to build confidence.' }
                {nextDifficultySuggestion === 'Hard' && '🚀 You\'re ready for a challenge!' }
                {nextDifficultySuggestion === 'Medium' && '⚡ Keep the balance and push yourself!' }
              </span>
            </div>
          </div>
        )}

        <div className="sunny-results-review">
          <section className="sunny-went-well" aria-labelledby="went-well-heading">
            <h3 id="went-well-heading">What went well</h3>
            {score > 0 ? <ul>{scoredResults.filter(result => result.isCorrect).map((result, index) => <li key={index}>
              <span className="sunny-result-word">✓ Correct</span><p>{result.question}</p>
              <p>Your answer: {result.userAnswer}</p>
            </li>)}</ul> : <p>You completed the quiz. Each practice is a step forward.</p>}
          </section>
        {incorrectAnswers.length > 0 && (
          <section className="sunny-worth-review text-left my-8 p-4 bg-gray-50 rounded-lg" aria-labelledby="review-heading">
            <h3 id="review-heading" className="text-xl font-bold text-gray-800 mb-4">Worth another look</h3>
            {loading ? <LoadingSpinner message="Preparing your personalized explanations..." /> : error ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            ) : (
              <ul className="space-y-4" role="list" aria-label="Quiz review">
                {incorrectAnswers.map((result, index) => {
                  const explanation = explanations.find(e => e.question === result.question)?.explanation;
                  const displayedCorrectAnswer = resolveMultipleChoiceAnswer(result) || result.correctAnswer;
                  return (
                    <li key={index} data-feedback="retry" className="border-b pb-4 last:border-b-0" role="listitem">
                      <span className="sunny-result-word">↻ Try again</span>
                      <p className="font-semibold text-gray-700">{result.question}</p>
                      <div className="flex items-center text-sm mt-2">
                        <XCircleIcon className="h-5 w-5 text-red-500 mr-2 shrink-0" aria-hidden="true" />
                        <span className="text-gray-500">You answered: <span className="font-semibold">{result.userAnswer}</span></span>
                      </div>
                       <div className="flex items-center text-sm mt-1">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" aria-hidden="true" />
                        <span className="text-gray-500">Correct answer: <span className="font-semibold">{displayedCorrectAnswer}</span></span>
                      </div>
                      {explanation && (
                         <div className="mt-2 p-3 bg-blue-50 rounded-md text-blue-800 font-semibold flex items-start gap-2">
                            <button
                              onClick={() => speakNaturally(`The correct answer is ${displayedCorrectAnswer}. ${explanation}`)}
                              className="shrink-0 p-1 hover:bg-blue-100 rounded-full transition-colors"
                              title="Listen to explanation"
                              aria-label={`Listen to the explanation for question ${index + 1}`}
                            >
                              <SpeakerWaveIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            </button>
                            <span>{explanation}</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        </div>
        <div className="sunny-results-tip"><MiraFace size={64} /><p><strong>MiRa’s tip:</strong> Read the explanations, then practise again when you feel ready.</p></div>
        {total > 0 && score === total && (
            <p className="text-lg text-green-600 font-bold my-8" role="status">Wow, a perfect score! You're a superstar!</p>
        )}

        <div className="sunny-results-actions flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            onClick={onRetry}
            aria-label="Retry the quiz"
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transform hover:scale-105 transition-transform"
          >
            Try Again
          </button>
          <button
            onClick={onNewTopic}
            aria-label="Choose a new topic"
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-300 transform hover:scale-105 transition-transform"
          >
            New Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
