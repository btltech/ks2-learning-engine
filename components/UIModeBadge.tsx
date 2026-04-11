/**
 * UI Mode Badge Component
 * 
 * Compact display of current UI mode for header/settings
 */

import React from 'react';
import { useUISettings, UIMode } from '../context/UISettingsContext';

interface UIModeOption {
  mode: UIMode;
  icon: string;
  title: string;
}

const MODE_OPTIONS: UIModeOption[] = [
  {
    mode: 'guided',
    icon: '🌟',
    title: 'Guided Mode',
  },
  {
    mode: 'standard',
    icon: '📚',
    title: 'Standard Mode',
  },
  {
    mode: 'advanced',
    icon: '🚀',
    title: 'Advanced Mode',
  },
];

export const UIModeBadge: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { settings } = useUISettings();

  const currentMode = MODE_OPTIONS.find(o => o.mode === settings.mode);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
      title="Change UI Mode"
    >
      <span className="text-lg">{currentMode?.icon}</span>
      <span className="text-sm font-medium text-gray-700 hidden sm:inline">
        {currentMode?.title.replace(' Mode', '')}
      </span>
    </button>
  );
};