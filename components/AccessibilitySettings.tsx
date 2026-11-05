/**
 * Accessibility Settings Component
 * 
 * UI for managing accessibility preferences
 */

import React, { useState, useEffect, useId } from 'react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { disableKokoro, enableKokoro, getKokoroState, subscribeKokoro, type KokoroState } from '../services/kokoroTTS';
import { accessibilityService, AccessibilitySettings, ACCESSIBILITY_CSS, COLOR_BLIND_FILTERS } from '../services/accessibilityService';

import { Owl } from './sunny/Owl';
import { useOptionalUISettings } from '../context/UISettingsContext';
import './SunnySettings.css';
import './sunny/displayPreferences.css';

interface AccessibilitySettingsModalProps {
  onClose: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({ onClose }) => {
  const [savedSettings, setSettings] = useState<AccessibilitySettings>(accessibilityService.getSettings());
  const ui = useOptionalUISettings();
  const settings = { ...savedSettings, largeText: savedSettings.largeText || !!ui?.settings.largerText, highContrast: savedSettings.highContrast || !!ui?.settings.highContrast, reducedMotion: savedSettings.reducedMotion || !!ui?.settings.reducedAnimations };
  const syncDisplay = (key: keyof AccessibilitySettings, value: boolean) => {
    if (key === 'largeText') ui?.updateSettings({ largerText: value });
    if (key === 'highContrast') ui?.updateSettings({ highContrast: value });
    if (key === 'reducedMotion') ui?.updateSettings({ reducedAnimations: value });
  };
  const dialogRef = useModalAccessibility(onClose);
  const [kokoro, setKokoro] = useState<KokoroState>(getKokoroState());

  useEffect(() => subscribeKokoro(setKokoro), []);

  const kokoroDescription = (() => {
    if (kokoro.status === 'loading') return `Downloading voice… ${Math.round(kokoro.progress * 100)}%`;
    if (kokoro.status === 'ready') return 'Natural English voice is on. An internet connection may be needed to start it again.';
    if (kokoro.status === 'error') return kokoro.error || 'The natural voice could not start. Using the standard voice.';
    return 'A more natural English voice. Downloads about 90MB of voice data, best on Wi-Fi.';
  })();

  useEffect(() => {
    const unsubscribe = accessibilityService.subscribe(setSettings);
    return unsubscribe;
  }, []);

  const handleToggle = (key: keyof AccessibilitySettings) => {
    const value = settings[key];
    if (typeof value === 'boolean') {
      syncDisplay(key, !value);
      accessibilityService.updateSetting(key, !value);
    }
  };

  const handleSelect = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    if (typeof value === 'boolean') syncDisplay(key, value);
    accessibilityService.updateSetting(key, value);
  };

  const handleReset = () => {
    if (window.confirm('Reset all accessibility settings to default?')) {
      ui?.updateSettings({ largerText: false, highContrast: false, reducedAnimations: false });
      accessibilityService.resetSettings();
    }
  };

  return (
    <div className="sunny-settings-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="presentation">
      <div ref={dialogRef} tabIndex={-1} className="sunny-settings sunny-ui bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="accessibility-settings-title">
        <header className="sunny-settings-hero">
          <Owl pose="wave" height={100} />
          <div><h2 id="accessibility-settings-title">Accessibility Settings</h2>
            <h3>Voice and display</h3>
            <p>Make DemiWura just right for you! Try a setting and watch the example change.</p>
          </div>
          <button onClick={onClose} aria-label="Close settings">✕</button>
        </header>

        {/* Settings Content */}
        <div className="sunny-settings-content flex-1 overflow-y-auto p-6">
          <div className="sunny-settings-cards">
          {/* Visual Section */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span aria-hidden="true">👁️</span> Reading
            </h3>
            
            <div className="space-y-4">
              <fieldset className="sunny-setting-choices"><legend>Text size</legend>
                <div>{[false, true].map(large => <button key={String(large)} aria-pressed={settings.largeText === large} onClick={() => handleSelect('largeText', large)}>{large ? 'Large' : 'Standard'}</button>)}</div>
              </fieldset>
              <fieldset className="sunny-setting-choices"><legend>Colours</legend>
                <div>{(['standard', 'calm', 'dark', 'contrast'] as const).map(appearance => <button key={appearance} aria-pressed={appearance === 'contrast' ? settings.highContrast : !settings.highContrast && settings.appearance === appearance} onClick={() => {
                  syncDisplay('highContrast', appearance === 'contrast');
                  accessibilityService.updateSettings({ highContrast: appearance === 'contrast', ...(appearance !== 'contrast' ? { appearance } : {}) });
                }}>{({ standard: 'Standard', calm: 'Calm tint', dark: 'Dark', contrast: 'High Contrast Mode' })[appearance]}</button>)}</div>
                <p>Dark and calm colours apply to the main learning screens.</p>
              </fieldset>
              <ToggleSetting
                label="Dyslexia-Friendly Font"
                description="Use a font designed for easier reading"
                checked={settings.dyslexiaFriendlyFont}
                onChange={() => handleToggle('dyslexiaFriendlyFont')}
              />
              
              <div className="bg-gray-50 rounded-xl p-4">
                <label htmlFor="display-colour-vision" className="block text-sm font-medium text-gray-900 mb-2">
                  Color Blind Mode
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Adjust colors for color vision deficiency
                </p>
                <select
                  id="display-colour-vision"
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
              <span aria-hidden="true">🔊</span> Listening
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
                <ToggleSetting
                  label="Natural English Voice"
                  description={kokoroDescription}
                  checked={kokoro.status !== 'off'}
                  onChange={() => (kokoro.status === 'off' ? enableKokoro() : disableKokoro())}
                />
              )}

              {settings.textToSpeech && (
                <div className="bg-gray-50 rounded-xl p-4 ml-4">
                  <label htmlFor="display-speech-speed" className="block text-sm font-medium text-gray-900 mb-2">
                    Speech Speed
                  </label>
                  <div className="sunny-setting-choices" role="group" aria-label="Voice speed presets">{[{label:'Slower',speed:0.8},{label:'Normal',speed:1},{label:'A bit faster',speed:1.2}].map(option => <button key={option.speed} aria-pressed={settings.ttsSpeed === option.speed} onClick={() => handleSelect('ttsSpeed', option.speed)}>{option.label}</button>)}</div>
                  <input
                    id="display-speech-speed"
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
              <span aria-hidden="true">🖱️</span> Calm and focus
            </h3>
            
            <div className="space-y-4">
              <ToggleSetting
                label="Reduced Motion"
                description="Less movement: turn off animations and transitions"
                checked={settings.reducedMotion}
                onChange={() => handleToggle('reducedMotion')}
              />

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
                <label htmlFor="display-target-size" className="block text-sm font-medium text-gray-900 mb-2">
                  Click Target Size
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Increase the size of buttons and clickable areas
                </p>
                <select
                  id="display-target-size"
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
          <aside className="sunny-settings-example" aria-label="Live display example">
            <h3>Example</h3>
            <div className="sunny-example-card">
              <p>Maths · A little example</p><h4>What is ¾ of 12?</h4>
              <p>Share 12 into 4 equal groups, then count 3 of the groups.</p>
              <p className="sunny-example-answer">✓ 9 — three groups of three</p>
              <Owl pose="thinking" height={72} className="sunny-float" />
            </div>
            <p role="status">{settings.largeText ? 'Large' : 'Standard'} text · {settings.highContrast ? 'High contrast' : settings.appearance === 'dark' ? 'Dark colours' : settings.appearance === 'calm' ? 'Calm tint' : 'Standard colours'} · {settings.reducedMotion ? 'Less movement on' : 'Less movement off'}</p>
            <p>{settings.textToSpeech ? `Speech speed: ${settings.ttsSpeed}x. ${kokoro.status === 'ready' ? 'Natural English voice is on.' : 'Using your available voice.'}` : 'Text-to-Speech is off.'}</p>
          </aside>
        </div>

        {/* Footer */}
        <div className="sunny-settings-footer border-t p-4 flex justify-between items-center bg-gray-50">
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
  const id = useId();
  return (
    <div className="sunny-setting-toggle flex items-center justify-between bg-gray-50 rounded-xl p-4">
      <div className="flex-1">
        <span id={id} className="block text-sm font-medium text-gray-900">{label}</span>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span className="sunny-switch-word" aria-hidden="true">{checked ? 'On' : 'Off'}</span>
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


export const AccessibilityButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="min-h-12 min-w-12 p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
