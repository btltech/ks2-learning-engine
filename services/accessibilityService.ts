/**
 * Accessibility Settings Service
 * 
 * Manages accessibility preferences for the app
 */

export interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  largeText: boolean;
  dyslexiaFriendlyFont: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Audio
  screenReaderOptimized: boolean;
  soundEffects: boolean;
  textToSpeech: boolean;
  ttsSpeed: number; // 0.5 to 2.0
  ttsVoice: string;
  
  // Interaction
  keyboardNavigation: boolean;
  focusHighlight: boolean;
  clickTargetSize: 'normal' | 'large' | 'extra-large';
  autoAdvance: boolean;
  extendedTimeLimit: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  dyslexiaFriendlyFont: false,
  reducedMotion: false,
  colorBlindMode: 'none',
  screenReaderOptimized: false,
  soundEffects: true,
  textToSpeech: false,
  ttsSpeed: 1.0,
  ttsVoice: 'default',
  keyboardNavigation: true,
  focusHighlight: true,
  clickTargetSize: 'normal',
  autoAdvance: false,
  extendedTimeLimit: false,
};

const STORAGE_KEY = 'ks2_accessibility_settings';

class AccessibilityService {
  private settings: AccessibilitySettings;
  private listeners: Set<(settings: AccessibilitySettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
    this.applySettings();
  }

  private loadSettings(): AccessibilitySettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }

  /**
   * Apply current settings to the document
   */
  applySettings(): void {
    const root = document.documentElement;
    const body = document.body;

    // High contrast
    root.classList.toggle('high-contrast', this.settings.highContrast);
    
    // Large text
    root.classList.toggle('large-text', this.settings.largeText);
    if (this.settings.largeText) {
      root.style.fontSize = '120%';
    } else {
      root.style.fontSize = '';
    }

    // Dyslexia-friendly font
    root.classList.toggle('dyslexia-font', this.settings.dyslexiaFriendlyFont);
    
    // Reduced motion
    if (this.settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Color blind mode
    root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    if (this.settings.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${this.settings.colorBlindMode}`);
    }

    // Click target size
    root.classList.remove('click-target-large', 'click-target-extra-large');
    if (this.settings.clickTargetSize !== 'normal') {
      root.classList.add(`click-target-${this.settings.clickTargetSize}`);
    }

    // Focus highlight
    root.classList.toggle('focus-highlight', this.settings.focusHighlight);

    // Screen reader optimizations
    if (this.settings.screenReaderOptimized) {
      body.setAttribute('role', 'application');
      body.setAttribute('aria-label', 'KS2 Learning Engine - Educational Application');
    } else {
      body.removeAttribute('role');
      body.removeAttribute('aria-label');
    }
  }

  /**
   * Get current settings
   */
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Update a single setting
   */
  updateSetting<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ): void {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(updates: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  /**
   * Reset all settings to defaults
   */
  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.applySettings();
    this.notifyListeners();
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(callback: (settings: AccessibilitySettings) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.getSettings()));
  }

  /**
   * Check if reduced motion is preferred by the system
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if high contrast is preferred by the system
   */
  prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: more)').matches;
  }

  /**
   * Apply system preferences
   */
  applySystemPreferences(): void {
    if (this.prefersReducedMotion()) {
      this.updateSetting('reducedMotion', true);
    }
    if (this.prefersHighContrast()) {
      this.updateSetting('highContrast', true);
    }
  }
}

export const accessibilityService = new AccessibilityService();

// CSS to be added to your styles
export const ACCESSIBILITY_CSS = `
/* High Contrast Mode */
.high-contrast {
  --bg-primary: #000000 !important;
  --bg-secondary: #1a1a1a !important;
  --text-primary: #ffffff !important;
  --text-secondary: #ffff00 !important;
  --accent-color: #00ffff !important;
  --border-color: #ffffff !important;
}

.high-contrast button,
.high-contrast a {
  border: 2px solid #ffffff !important;
}

.high-contrast button:focus,
.high-contrast a:focus {
  outline: 3px solid #ffff00 !important;
  outline-offset: 2px;
}

/* Dyslexia-Friendly Font */
.dyslexia-font {
  font-family: 'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif !important;
  letter-spacing: 0.05em;
  word-spacing: 0.1em;
  line-height: 1.8;
}

/* Large Text */
.large-text {
  font-size: 120%;
}

.large-text h1 { font-size: 2.5rem; }
.large-text h2 { font-size: 2rem; }
.large-text h3 { font-size: 1.75rem; }
.large-text p, .large-text button, .large-text input { font-size: 1.25rem; }

/* Click Target Sizes */
.click-target-large button,
.click-target-large a,
.click-target-large input,
.click-target-large select {
  min-height: 48px !important;
  min-width: 48px !important;
  padding: 12px 16px !important;
}

.click-target-extra-large button,
.click-target-extra-large a,
.click-target-extra-large input,
.click-target-extra-large select {
  min-height: 56px !important;
  min-width: 56px !important;
  padding: 16px 20px !important;
}

/* Focus Highlight */
.focus-highlight *:focus {
  outline: 3px solid var(--accent-color, #3b82f6) !important;
  outline-offset: 2px;
  box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.3) !important;
}

.focus-highlight *:focus:not(:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

.focus-highlight *:focus-visible {
  outline: 3px solid var(--accent-color, #3b82f6) !important;
  outline-offset: 2px;
}

/* Color Blind Modes */
.colorblind-protanopia {
  filter: url('#protanopia-filter');
}

.colorblind-deuteranopia {
  filter: url('#deuteranopia-filter');
}

.colorblind-tritanopia {
  filter: url('#tritanopia-filter');
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-color, #3b82f6);
  color: white;
  padding: 8px 16px;
  z-index: 100;
  transition: top 0.2s;
}

.skip-to-main:focus {
  top: 0;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

// SVG Filters for color blind simulation
export const COLOR_BLIND_FILTERS = `
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <defs>
    <!-- Protanopia (Red-blind) -->
    <filter id="protanopia-filter">
      <feColorMatrix type="matrix" values="
        0.567, 0.433, 0,     0, 0
        0.558, 0.442, 0,     0, 0
        0,     0.242, 0.758, 0, 0
        0,     0,     0,     1, 0
      "/>
    </filter>
    
    <!-- Deuteranopia (Green-blind) -->
    <filter id="deuteranopia-filter">
      <feColorMatrix type="matrix" values="
        0.625, 0.375, 0,   0, 0
        0.7,   0.3,   0,   0, 0
        0,     0.3,   0.7, 0, 0
        0,     0,     0,   1, 0
      "/>
    </filter>
    
    <!-- Tritanopia (Blue-blind) -->
    <filter id="tritanopia-filter">
      <feColorMatrix type="matrix" values="
        0.95, 0.05,  0,     0, 0
        0,    0.433, 0.567, 0, 0
        0,    0.475, 0.525, 0, 0
        0,    0,     0,     1, 0
      "/>
    </filter>
  </defs>
</svg>
`;
