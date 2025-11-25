/**
 * Learning Paths Component
 * 
 * Structured learning journeys with milestones and certificates
 */

import React, { useState, useEffect } from 'react';
import { learningPathsService, LearningPath, LearningPathStep, Certificate } from '../services/learningPathsService';
import { useUser } from '../context/UserContext';
import { Subject, Difficulty } from '../types';

interface LearningPathsProps {
  onStartLesson: (subject: Subject, topic: string, difficulty: Difficulty) => void;
  onClose: () => void;
}

export const LearningPathsView: React.FC<LearningPathsProps> = ({ onStartLesson, onClose }) => {
  const { currentChild, mastery } = useUser();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'certificates'>('list');
  const [filter, setFilter] = useState<'all' | Subject>('all');

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = () => {
    const allPaths = learningPathsService.getAllPaths();
    setPaths(allPaths);
  };

  const filteredPaths = paths.filter(path => 
    filter === 'all' || path.subject === filter
  );

  const handleStartPath = (path: LearningPath) => {
    learningPathsService.startPath(path.id);
    setSelectedPath(learningPathsService.getPath(path.id));
    setView('detail');
  };

  const handleStartStep = (step: LearningPathStep) => {
    onStartLesson(step.subject, step.topic, step.difficulty);
  };

  // Path List View
  if (view === 'list') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">🎯 Learning Paths</h2>
                <p className="text-emerald-200">
                  Structured journeys through the KS2 curriculum
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('certificates')}
                  className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30"
                >
                  🏅 Certificates
                </button>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white text-2xl ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Subject Filter */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {['all', 'Maths', 'English', 'Science'].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setFilter(subject as any)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    filter === subject
                      ? 'bg-white text-emerald-700'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {subject === 'all' ? 'All Subjects' : subject}
                </button>
              ))}
            </div>
          </div>

          {/* Paths Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPaths.map((path) => (
                <PathCard
                  key={path.id}
                  path={path}
                  onClick={() => {
                    setSelectedPath(path);
                    setView('detail');
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Path Detail View
  if (view === 'detail' && selectedPath) {
    const nextStep = learningPathsService.getNextStep(selectedPath.id);
    const progress = learningPathsService.getPathProgress(selectedPath.id);
    const progressPercent = (selectedPath.completedSteps / selectedPath.totalSteps) * 100;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
            <button
              onClick={() => setView('list')}
              className="text-white/80 hover:text-white mb-4 flex items-center gap-1"
            >
              ← Back to Paths
            </button>
            <h2 className="text-2xl font-bold mb-1">{selectedPath.name}</h2>
            <p className="text-emerald-200 mb-4">{selectedPath.description}</p>
            
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{selectedPath.completedSteps} of {selectedPath.totalSteps} steps</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {selectedPath.steps.map((step, index) => {
                const isLocked = step.prerequisites?.some(prereqId => {
                  const prereqStep = selectedPath.steps.find(s => s.id === prereqId);
                  return !prereqStep?.isCompleted;
                });

                return (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={index}
                    isLocked={isLocked}
                    isNext={step.id === nextStep?.id}
                    onStart={() => handleStartStep(step)}
                  />
                );
              })}
            </div>

            {/* Completion Message */}
            {selectedPath.completedAt && (
              <div className="mt-6 bg-emerald-100 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-emerald-800">Path Complete!</h3>
                <p className="text-emerald-600 mb-4">
                  You've mastered all the topics in this path.
                </p>
                {!selectedPath.certificateId && (
                  <button
                    onClick={() => {
                      learningPathsService.awardCertificate(
                        selectedPath.id,
                        currentChild?.id || 'default',
                        currentChild?.name || 'Student'
                      );
                      loadPaths();
                      setSelectedPath(learningPathsService.getPath(selectedPath.id));
                    }}
                    className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700"
                  >
                    🏅 Claim Certificate
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Certificates View
  if (view === 'certificates') {
    const certificates = learningPathsService.getUserCertificates(currentChild?.id || 'default');
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <button
                  onClick={() => setView('list')}
                  className="text-white/80 hover:text-white mb-2 flex items-center gap-1"
                >
                  ← Back to Paths
                </button>
                <h2 className="text-2xl font-bold mb-1">🏅 My Certificates</h2>
                <p className="text-amber-200">
                  {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
                <p className="text-gray-600">
                  Complete learning paths to earn certificates!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <CertificateCard key={cert.id} certificate={cert} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Path Card Component
const PathCard: React.FC<{
  path: LearningPath;
  onClick: () => void;
}> = ({ path, onClick }) => {
  const progressPercent = (path.completedSteps / path.totalSteps) * 100;
  const isStarted = !!path.startedAt;
  const isCompleted = !!path.completedAt;

  const subjectEmoji: Record<string, string> = {
    Maths: '🔢',
    English: '📚',
    Science: '🔬',
    History: '🏛️',
    Geography: '🌍',
  };

  const difficultyColor: Record<string, string> = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-amber-100 text-amber-700',
    Hard: 'bg-red-100 text-red-700',
  };

  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
        isCompleted
          ? 'border-emerald-300 bg-emerald-50'
          : isStarted
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 hover:border-emerald-300'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{subjectEmoji[path.subject] || '📖'}</span>
          <div>
            <h3 className="font-bold text-gray-900">{path.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[path.difficulty]}`}>
              {path.difficulty}
            </span>
          </div>
        </div>
        {isCompleted && <span className="text-2xl">✅</span>}
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{path.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>{path.totalSteps} lessons</span>
        <span>~{path.estimatedHours}h</span>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Badges Preview */}
      {path.badges.length > 0 && (
        <div className="mt-3 flex gap-1">
          {path.badges.slice(0, 3).map((badge, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              🏅 {badge.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Step Card Component
const StepCard: React.FC<{
  step: LearningPathStep;
  index: number;
  isLocked: boolean | undefined;
  isNext: boolean;
  onStart: () => void;
}> = ({ step, index, isLocked, isNext, onStart }) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        step.isCompleted
          ? 'border-emerald-300 bg-emerald-50'
          : isLocked
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : isNext
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-200'
      }`}
    >
      {/* Step Number */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          step.isCompleted
            ? 'bg-emerald-500 text-white'
            : isLocked
            ? 'bg-gray-300 text-gray-500'
            : 'bg-blue-500 text-white'
        }`}
      >
        {step.isCompleted ? '✓' : index + 1}
      </div>

      {/* Step Content */}
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{step.title}</h4>
        <p className="text-sm text-gray-600">{step.description}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>~{step.estimatedMinutes} min</span>
          <span>•</span>
          <span>{step.difficulty}</span>
          {step.score !== undefined && (
            <>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Score: {step.score}%</span>
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      {!step.isCompleted && !isLocked && (
        <button
          onClick={onStart}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            isNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isNext ? 'Start' : 'Review'}
        </button>
      )}

      {isLocked && (
        <span className="text-gray-400 text-xl">🔒</span>
      )}
    </div>
  );
};

// Certificate Card Component
const CertificateCard: React.FC<{ certificate: Certificate }> = ({ certificate }) => {
  const gradeColors: Record<string, string> = {
    distinction: 'from-yellow-400 to-amber-600',
    merit: 'from-gray-300 to-gray-500',
    pass: 'from-amber-700 to-amber-900',
  };

  const gradeLabels: Record<string, string> = {
    distinction: '🥇 Distinction',
    merit: '🥈 Merit',
    pass: '🥉 Pass',
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 relative overflow-hidden">
      {/* Decorative Border */}
      <div className="absolute inset-2 border-2 border-amber-300 rounded-lg pointer-events-none" />
      
      <div className="relative text-center">
        <div className="text-4xl mb-2">🎓</div>
        <div className="text-xs text-amber-600 uppercase tracking-wider mb-1">
          Certificate of Achievement
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {certificate.learningPathName}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Awarded to {certificate.childName || certificate.userName}
        </p>
        
        {/* Grade Badge */}
        <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${gradeColors[certificate.grade]} text-white text-sm font-bold mb-2`}>
          {gradeLabels[certificate.grade]}
        </div>
        
        <div className="text-sm text-gray-500">
          Score: {Math.round(certificate.score)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {new Date(certificate.earnedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
