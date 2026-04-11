/**
 * UI Settings Context
 * 
 * Manages UI complexity settings including:
 * - Guided Mode: Simplified interface for younger students
 * - Progressive Disclosure: Show/hide advanced features
 * - Visual Preferences: Font sizes, animations, etc.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UIMode = 'guided' | 'standard' | 'advanced';

export interface UISettings {
  // Core mode
  mode: UIMode;
  
  // Progressive disclosure
  showAdvancedFeatures: boolean;
  showAnalytics: boolean;
  showSATsPractice: boolean;
  showClassroomMode: boolean;
  showQuizBattle: boolean;
  showLearningPaths: boolean;
  showCurriculumCoverage: boolean;
  
  // Visual preferences
  reducedAnimations: boolean;
  largerText: boolean;
  highContrast: boolean;
  
  // Navigation
  simplifiedNav: boolean;
  showHints: boolean;
  autoReadQuestions: boolean;
}

interface UISettingsContextType {
  settings: UISettings;
  updateSettings: (updates: Partial<UISettings>) => void;
  setMode: (mode: UIMode) => void;
  isFeatureVisible: (feature: keyof UISettings) => boolean;
  resetToDefaults: () => void;
  
  // Convenience methods
  isGuidedMode: boolean;
  isAdvancedMode: boolean;
}

const getDefaultSettings = (age?: number): UISettings => {
  // Default to guided mode for younger students
  const isYoungStudent = age !== undefined && age <= 8;
  const isOlderStudent = age !== undefined && age >= 10;
  
  const mode: UIMode = isYoungStudent ? 'guided' : (isOlderStudent ? 'advanced' : 'standard');
  
  return {
    mode,
    
    // Progressive disclosure - guided mode hides complex features
    showAdvancedFeatures: mode !== 'guided',
    showAnalytics: mode === 'advanced',
    showSATsPractice: mode !== 'guided', // Only for older students
    showClassroomMode: mode !== 'guided',
    showQuizBattle: true, // Always show - kids love competition
    showLearningPaths: mode !== 'guided',
    showCurriculumCoverage: mode === 'advanced',
    
    // Visual preferences
    reducedAnimations: false,
    largerText: isYoungStudent,
    highContrast: false,
    
    // Navigation
    simplifiedNav: mode === 'guided',
    showHints: mode === 'guided',
    autoReadQuestions: isYoungStudent,
  };
};

const UISettingsContext = createContext<UISettingsContextType | undefined>(undefined);

export const UISettingsProvider: React.FC<{ children: React.ReactNode; userAge?: number }> = ({ 
  children, 
  userAge 
}) => {
  const [settings, setSettings] = useState<UISettings>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('ks2_ui_settings');
    if (saved) {
      try {
        return { ...getDefaultSettings(userAge), ...JSON.parse(saved) };
      } catch {
        // Ignore parse errors
      }
    }
    return getDefaultSettings(userAge);
  });

  // Update settings when user age changes
  useEffect(() => {
    if (userAge !== undefined) {
      const defaults = getDefaultSettings(userAge);
      // Only update mode-related settings if mode hasn't been manually changed
      const savedMode = localStorage.getItem('ks2_ui_mode_manual');
      if (!savedMode) {
        setSettings(prev => ({
          ...prev,
          mode: defaults.mode,
          showAdvancedFeatures: defaults.showAdvancedFeatures,
          showSATsPractice: defaults.showSATsPractice,
          simplifiedNav: defaults.simplifiedNav,
          showHints: defaults.showHints,
          autoReadQuestions: defaults.autoReadQuestions,
          largerText: defaults.largerText,
        }));
      }
    }
  }, [userAge]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('ks2_ui_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<UISettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const setMode = useCallback((mode: UIMode) => {
    localStorage.setItem('ks2_ui_mode_manual', 'true'); // Mark as manually set
    
    const modePresets: Record<UIMode, Partial<UISettings>> = {
      guided: {
        mode: 'guided',
        showAdvancedFeatures: false,
        showAnalytics: false,
        showSATsPractice: false,
        showClassroomMode: false,
        showLearningPaths: false,
        showCurriculumCoverage: false,
        simplifiedNav: true,
        showHints: true,
        autoReadQuestions: true,
        largerText: true,
      },
      standard: {
        mode: 'standard',
        showAdvancedFeatures: true,
        showAnalytics: false,
        showSATsPractice: true,
        showClassroomMode: true,
        showQuizBattle: true,
        showLearningPaths: true,
        showCurriculumCoverage: false,
        simplifiedNav: false,
        showHints: false,
        autoReadQuestions: false,
        largerText: false,
      },
      advanced: {
        mode: 'advanced',
        showAdvancedFeatures: true,
        showAnalytics: true,
        showSATsPractice: true,
        showClassroomMode: true,
        showQuizBattle: true,
        showLearningPaths: true,
        showCurriculumCoverage: true,
        simplifiedNav: false,
        showHints: false,
        autoReadQuestions: false,
        largerText: false,
      },
    };
    
    setSettings(prev => ({ ...prev, ...modePresets[mode] }));
  }, []);

  const isFeatureVisible = useCallback((feature: keyof UISettings): boolean => {
    const value = settings[feature];
    return typeof value === 'boolean' ? value : true;
  }, [settings]);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem('ks2_ui_mode_manual');
    setSettings(getDefaultSettings(userAge));
  }, [userAge]);

  const value: UISettingsContextType = {
    settings,
    updateSettings,
    setMode,
    isFeatureVisible,
    resetToDefaults,
    isGuidedMode: settings.mode === 'guided',
    isAdvancedMode: settings.mode === 'advanced',
  };

  return (
    <UISettingsContext.Provider value={value}>
      {children}
    </UISettingsContext.Provider>
  );
};

export const useUISettings = (): UISettingsContextType => {
  const context = useContext(UISettingsContext);
  if (!context) {
    throw new Error('useUISettings must be used within a UISettingsProvider');
  }
  return context;
};

// Hook for conditional rendering based on UI mode
export const useFeatureVisibility = () => {
  const { settings, isGuidedMode } = useUISettings();
  
  return {
    showAnalytics: settings.showAnalytics,
    showSATsPractice: settings.showSATsPractice,
    showClassroomMode: settings.showClassroomMode,
    showQuizBattle: settings.showQuizBattle,
    showLearningPaths: settings.showLearningPaths,
    showCurriculumCoverage: settings.showCurriculumCoverage,
    showAdvancedFeatures: settings.showAdvancedFeatures,
    isGuidedMode,
    simplifiedNav: settings.simplifiedNav,
    showHints: settings.showHints,
    autoReadQuestions: settings.autoReadQuestions,
  };
};
