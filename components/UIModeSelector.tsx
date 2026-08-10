/**
 * UI Mode Selector Component
 * 
 * Allows users to switch between Guided, Standard, and Advanced modes
 * with visual feedback and descriptions
 */

import React from 'react';
import { useUISettings, UIMode } from '../context/UISettingsContext';
import { ModalShell } from './layout/AppShells';

interface UIModeOption {
  mode: UIMode;
  icon: string;
  title: string;
  description: string;
  ageRange: string;
  features: string[];
}

const MODE_OPTIONS: UIModeOption[] = [
  {
    mode: 'guided',
    icon: '🌟',
    title: 'Guided Mode',
    description: 'Simple and easy to use',
    ageRange: 'Perfect for ages 7-8',
    features: [
      'Big, clear buttons',
      'Helpful hints',
      'Auto-read questions',
      'Fewer options',
    ],
  },
  {
    mode: 'standard',
    icon: '📚',
    title: 'Standard Mode',
    description: 'Full learning experience',
    ageRange: 'Great for ages 9-10',
    features: [
      'All subjects available',
      'Quiz battles',
      'SATs practice',
      'Learning paths',
    ],
  },
  {
    mode: 'advanced',
    icon: '🚀',
    title: 'Advanced Mode',
    description: 'All features unlocked',
    ageRange: 'For ages 10+ or power users',
    features: [
      'Detailed analytics',
      'Curriculum tracking',
      'Classroom mode',
      'All customization options',
    ],
  },
];

export const UIModeSelector: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { settings, setMode } = useUISettings();

  const handleSelectMode = (mode: UIMode) => {
    setMode(mode);
    onClose();
  };

  return (
    <ModalShell
      title="Choose Your Experience"
      subtitle="Select the mode that works best for you"
      onClose={onClose}
      tone="purple"
      footer={(
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-11 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Done
        </button>
      )}
    >
      <div className="p-6 space-y-4">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.mode}
            onClick={() => handleSelectMode(option.mode)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              settings.mode === option.mode
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{option.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{option.title}</h3>
                  {settings.mode === option.mode && (
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{option.description}</p>
                <p className="text-indigo-600 text-xs font-medium mt-1">{option.ageRange}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {option.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {settings.mode === option.mode && (
                <span className="text-indigo-500 text-2xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

    </ModalShell>
  );
};
