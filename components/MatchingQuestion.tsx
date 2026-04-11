/**
 * Matching Question Component
 * 
 * Interactive matching question where students connect pairs
 * Uses drag-and-drop or click-to-select interaction
 */

import React, { useState, useCallback } from 'react';
import { MatchingPair } from '../types';

interface MatchingQuestionProps {
  pairs: MatchingPair[];
  onComplete: (isCorrect: boolean, matches: Record<string, string>) => void;
}

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ pairs, onComplete }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Shuffle the right side options
  const [shuffledRight] = useState(() => {
    return [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
  });

  const handleLeftClick = useCallback((left: string) => {
    if (isSubmitted) return;
    setSelectedLeft(left === selectedLeft ? null : left);
  }, [selectedLeft, isSubmitted]);

  const handleRightClick = useCallback((right: string) => {
    if (isSubmitted || !selectedLeft) return;
    
    // Remove existing match if this right item was already matched
    const existingKey = Object.keys(matches).find(k => matches[k] === right);
    const newMatches = { ...matches };
    if (existingKey) {
      delete newMatches[existingKey];
    }
    
    // Add new match
    newMatches[selectedLeft] = right;
    setMatches(newMatches);
    setSelectedLeft(null);
  }, [selectedLeft, matches, isSubmitted]);

  const handleRemoveMatch = useCallback((left: string) => {
    if (isSubmitted) return;
    const newMatches = { ...matches };
    delete newMatches[left];
    setMatches(newMatches);
  }, [matches, isSubmitted]);

  const handleSubmit = useCallback(() => {
    // Check if all pairs are matched
    if (Object.keys(matches).length !== pairs.length) {
      return;
    }

    setIsSubmitted(true);

    // Check correctness
    let correctCount = 0;
    for (const pair of pairs) {
      if (matches[pair.left] === pair.right) {
        correctCount++;
      }
    }

    const isAllCorrect = correctCount === pairs.length;
    onComplete(isAllCorrect, matches);
  }, [matches, pairs, onComplete]);

  const isRightUsed = (right: string) => Object.values(matches).includes(right);
  const allMatched = Object.keys(matches).length === pairs.length;

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600 font-medium">
        Click an item on the left, then click its match on the right
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-500 text-center mb-3">Match From</h4>
          {pairs.map((pair) => {
            const isMatched = pair.left in matches;
            const isSelected = selectedLeft === pair.left;
            let bgColor = 'bg-blue-50 border-blue-200 hover:border-blue-400';
            
            if (isSubmitted) {
              const isCorrect = matches[pair.left] === pair.right;
              bgColor = isCorrect 
                ? 'bg-green-100 border-green-400' 
                : 'bg-red-100 border-red-400';
            } else if (isMatched) {
              bgColor = 'bg-indigo-100 border-indigo-400';
            } else if (isSelected) {
              bgColor = 'bg-yellow-100 border-yellow-400 scale-105 shadow-md';
            }

            return (
              <button
                key={pair.left}
                onClick={() => handleLeftClick(pair.left)}
                disabled={isSubmitted}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{pair.left}</span>
                  {isMatched && !isSubmitted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMatch(pair.left);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                  {isSubmitted && (
                    <span className="text-lg">
                      {matches[pair.left] === pair.right ? '✓' : '✗'}
                    </span>
                  )}
                </div>
                {isMatched && (
                  <div className="mt-1 text-sm text-indigo-600 font-medium">
                    → {matches[pair.left]}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-500 text-center mb-3">Match To</h4>
          {shuffledRight.map((right) => {
            const isUsed = isRightUsed(right);
            let bgColor = 'bg-purple-50 border-purple-200 hover:border-purple-400';
            
            if (isSubmitted) {
              const correctPair = pairs.find(p => p.right === right);
              const matchedLeft = Object.keys(matches).find(k => matches[k] === right);
              const isCorrect = correctPair && matchedLeft === correctPair.left;
              bgColor = isCorrect 
                ? 'bg-green-100 border-green-400' 
                : 'bg-red-100 border-red-400';
            } else if (isUsed) {
              bgColor = 'bg-gray-100 border-gray-300 opacity-60';
            } else if (selectedLeft) {
              bgColor = 'bg-purple-100 border-purple-400 hover:scale-105';
            }

            return (
              <button
                key={right}
                onClick={() => handleRightClick(right)}
                disabled={isSubmitted || !selectedLeft}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${bgColor}`}
              >
                <span className="font-medium text-gray-800">{right}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connection Lines Visualization */}
      {Object.keys(matches).length > 0 && !isSubmitted && (
        <div className="text-center text-sm text-gray-500">
          {Object.keys(matches).length} of {pairs.length} matched
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!allMatched}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
            allMatched
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {allMatched ? 'Check Answers' : `Match ${pairs.length - Object.keys(matches).length} more`}
        </button>
      )}

      {/* Results */}
      {isSubmitted && (
        <div className="text-center p-4 rounded-xl bg-gray-50">
          {Object.keys(matches).filter(k => matches[k] === pairs.find(p => p.left === k)?.right).length === pairs.length ? (
            <div className="text-green-600 font-bold text-lg">
              🎉 Perfect! All pairs matched correctly!
            </div>
          ) : (
            <div className="text-orange-600 font-bold text-lg">
              {Object.keys(matches).filter(k => matches[k] === pairs.find(p => p.left === k)?.right).length} of {pairs.length} correct
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchingQuestion;
