/**
 * Accessibility Settings Component
 * 
 * UI for managing accessibility preferences
 */

import React, { useState, useEffect } from 'react';
import { accessibilityService, AccessibilitySettings, ACCESSIBILITY_CSS, COLOR_BLIND_FILTERS } from '../services/accessibilityService';

interface AccessibilitySettingsModalProps {
  onClose: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(accessibilityService.getSettings());

  useEffect(() => {
    const unsubscribe = accessibilityService.subscribe(setSettings);
    return unsubscribe;
  }, []);

  const handleToggle = (key: keyof AccessibilitySettings) => {
    const value = settings[key];
    if (typeof value === 'boolean') {
      accessibilityService.updateSetting(key, !value);
    }
  };

  const handleSelect = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    accessibilityService.updateSetting(key, value);
  };

  const handleReset = () => {
    if (window.confirm('Reset all accessibility settings to default?')) {
      accessibilityService.resetSettings();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">♿ Accessibility Settings</h2>
              <p className="text-blue-200">Customize your learning experience</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
              aria-label="Close settings"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Visual Section */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👁️</span> Visual
            </h3>
            
            <div className="space-y-4">
              <ToggleSetting
                label="High Contrast Mode"
                description="Increase color contrast for better visibility"
                checked={settings.highContrast}
                onChange={() => handleToggle('highContrast')}
              />
              
              <ToggleSetting
                label="Large Text"
                description="Increase text size throughout the app"
                checked={settings.largeText}
                onChange={() => handleToggle('largeText')}
              />
              
              <ToggleSetting
                label="Dyslexia-Friendly Font"
                description="Use a font designed for easier reading"
                checked={settings.dyslexiaFriendlyFont}
                onChange={() => handleToggle('dyslexiaFriendlyFont')}
              />
              
              <ToggleSetting
                label="Reduced Motion"
                description="Minimize animations and transitions"
                checked={settings.reducedMotion}
                onChange={() => handleToggle('reducedMotion')}
              />

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Color Blind Mode
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Adjust colors for color vision deficiency
                </p>
                <select
                  value={settings.colorBlindMode}
                  onChange={(e) => handleSelect('colorBlindMode', e.target.value as AccessibilitySettings['colorBlindMode'])}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-blind)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Audio Section */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔊</span> Audio
            </h3>
            
            <div className="space-y-4">
              <ToggleSetting
                label="Sound Effects"
                description="Play sounds for correct/incorrect answers"
                checked={settings.soundEffects}
                onChange={() => handleToggle('soundEffects')}
              />
              
              <ToggleSetting
                label="Text-to-Speech"
                description="Read questions and content aloud"
                checked={settings.textToSpeech}
                onChange={() => handleToggle('textToSpeech')}
              />
              
              {settings.textToSpeech && (
                <div className="bg-gray-50 rounded-xl p-4 ml-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Speech Speed
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.ttsSpeed}
                    onChange={(e) => handleSelect('ttsSpeed', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slower</span>
                    <span>{settings.ttsSpeed}x</span>
                    <span>Faster</span>
                  </div>
                </div>
              )}
              
              <ToggleSetting
                label="Screen Reader Optimized"
                description="Enhanced support for screen readers"
                checked={settings.screenReaderOptimized}
                onChange={() => handleToggle('screenReaderOptimized')}
              />
            </div>
          </section>

          {/* Interaction Section */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🖱️</span> Interaction
            </h3>
            
            <div className="space-y-4">
              <ToggleSetting
                label="Keyboard Navigation"
                description="Navigate using keyboard shortcuts"
                checked={settings.keyboardNavigation}
                onChange={() => handleToggle('keyboardNavigation')}
              />
              
              <ToggleSetting
                label="Focus Highlight"
                description="Show clear focus indicators"
                checked={settings.focusHighlight}
                onChange={() => handleToggle('focusHighlight')}
              />
              
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Click Target Size
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Increase the size of buttons and clickable areas
                </p>
                <select
                  value={settings.clickTargetSize}
                  onChange={(e) => handleSelect('clickTargetSize', e.target.value as AccessibilitySettings['clickTargetSize'])}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>
              
              <ToggleSetting
                label="Extended Time Limits"
                description="Allow more time for timed activities"
                checked={settings.extendedTimeLimit}
                onChange={() => handleToggle('extendedTimeLimit')}
              />
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⌨️</span> Keyboard Shortcuts
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <KeyboardShortcut keys={['1-4']} description="Select answer A-D" />
                <KeyboardShortcut keys={['Enter']} description="Submit / Continue" />
                <KeyboardShortcut keys={['H']} description="Get a hint" />
                <KeyboardShortcut keys={['R']} description="Read question aloud" />
                <KeyboardShortcut keys={['Esc']} description="Close modal / Go back" />
                <KeyboardShortcut keys={['Tab']} description="Navigate elements" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <button
            onClick={handleReset}
            className="text-gray-600 hover:text-gray-900"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Toggle Setting Component
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900">{label}</label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
};

// Keyboard Shortcut Display
interface KeyboardShortcutProps {
  keys: string[];
  description: string;
}

const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keys, description }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-gray-600">{description}</span>
    </div>
  );
};

// Skip to Main Content Link
export const SkipToMainContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-4"
    >
      Skip to main content
    </a>
  );
};

// Accessibility Button for Header
export const AccessibilityButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Open accessibility settings"
      title="Accessibility Settings"
    >
      <span className="text-xl">♿</span>
    </button>
  );
};

// Initialize accessibility CSS and SVG filters
export const initializeAccessibility = () => {
  // Add CSS
  if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('accessibility-styles');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'accessibility-styles';
      style.textContent = ACCESSIBILITY_CSS;
      document.head.appendChild(style);
    }

    // Add SVG filters for color blindness
    const existingFilters = document.getElementById('colorblind-filters');
    if (!existingFilters) {
      const div = document.createElement('div');
      div.id = 'colorblind-filters';
      div.innerHTML = COLOR_BLIND_FILTERS;
      document.body.appendChild(div);
    }

    // Apply any saved settings
    accessibilityService.applySettings();
  }
};
