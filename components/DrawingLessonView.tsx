import React, { useState, useCallback } from 'react';
import { DrawingLesson, getArtworkById } from '../data/artResources';

interface DrawingLessonViewProps {
  lesson: DrawingLesson;
  onComplete: () => void;
  onBack: () => void;
  studentAge: number;
}

export const DrawingLessonView: React.FC<DrawingLessonViewProps> = ({
  lesson,
  onComplete,
  onBack,
  studentAge,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepComplete = useCallback(() => {
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    if (currentStep < lesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, lesson.steps.length]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleNextStep = useCallback(() => {
    if (currentStep < lesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, lesson.steps.length]);

  const isLastStep = currentStep === lesson.steps.length - 1;
  const allStepsCompleted = completedSteps.size === lesson.steps.length;
  const step = lesson.steps[currentStep];
  
  // Get related artwork if any
  const relatedArtwork = lesson.relatedArtworks.length > 0 
    ? getArtworkById(lesson.relatedArtworks[0]) 
    : null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="font-medium">Back to Art</span>
        </button>

        {/* Lesson Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Lesson Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🎨</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm">
                ⏱️ {lesson.duration}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>

          {/* Materials Section */}
          <div className="p-4 bg-yellow-50 border-b border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">📦 You'll need:</h3>
            <div className="flex flex-wrap gap-2">
              {lesson.materials.map((material, idx) => (
                <span key={idx} className="px-3 py-1 bg-yellow-100 rounded-full text-sm text-yellow-800">
                  {material}
                </span>
              ))}
            </div>
          </div>

          {/* Related Artwork */}
          {relatedArtwork && (
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">🖼️ Inspired by:</h3>
              <div className="flex items-center gap-3">
                <img 
                  src={relatedArtwork.thumbnailUrl} 
                  alt={relatedArtwork.title}
                  className="w-16 h-16 object-cover rounded-lg shadow"
                />
                <div>
                  <p className="font-semibold text-blue-900">{relatedArtwork.title}</p>
                  <p className="text-sm text-blue-700">by {relatedArtwork.artist}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {lesson.steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {completedSteps.size} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / lesson.steps.length) * 100}%` }}
              />
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between mt-2">
              {lesson.steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${idx === currentStep 
                      ? 'bg-purple-500 text-white scale-110' 
                      : completedSteps.has(idx)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  {completedSteps.has(idx) ? '✓' : idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Step */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4">
                Step {step.stepNumber}: 
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {step.instruction}
              </p>
              
              {step.imageHint && (
                <p className="mt-3 text-sm text-purple-600 italic">
                  💡 Hint: {step.imageHint}
                </p>
              )}
              
              {step.tip && (
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⭐ Tip: {step.tip}
                  </p>
                </div>
              )}
            </div>

            {/* Encouragement */}
            <div className="text-center mb-6">
              <p className="text-gray-600 italic">
                {currentStep === 0 
                  ? "Let's get started! 🎨" 
                  : currentStep < lesson.steps.length / 2
                    ? "You're doing great! Keep going! 🌟"
                    : isLastStep
                      ? "Almost there! Finish strong! 🏆"
                      : "Looking good! Keep up the amazing work! ✨"
                }
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-xl font-bold transition-all
                  ${currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                ← Previous
              </button>

              <button
                onClick={handleStepComplete}
                disabled={completedSteps.has(currentStep)}
                className={`px-6 py-3 rounded-xl font-bold transition-all
                  ${completedSteps.has(currentStep)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                  }`}
              >
                {completedSteps.has(currentStep) ? '✓ Done!' : 'Mark Complete ✓'}
              </button>

              {isLastStep ? (
                <button
                  onClick={onComplete}
                  disabled={!allStepsCompleted}
                  className={`px-6 py-3 rounded-xl font-bold transition-all
                    ${allStepsCompleted
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  🎉 Finish!
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 rounded-xl font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          {/* Tips Section */}
          {lesson.tips.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-t">
              <h3 className="font-bold text-blue-800 mb-3">💡 Pro Tips:</h3>
              <ul className="space-y-2">
                {lesson.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-sm text-blue-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Completion Celebration */}
        {allStepsCompleted && (
          <div className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-center shadow-xl animate-bounce">
            <span className="text-4xl">🎨🎉🌟</span>
            <h2 className="text-2xl font-bold text-white mt-2">
              Amazing Work, Artist!
            </h2>
            <p className="text-white/90 mt-1">
              You've completed all the steps! Your artwork is unique and special.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingLessonView;
