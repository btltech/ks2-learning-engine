// TTS Configuration Manager
// Centralized configuration for all TTS providers

export interface TTSProviderConfig {
  enabled: boolean;
  priority: number;
  fallbackOnError?: boolean;
}

export interface TTSConfig {
  providers: {
    webSpeech: TTSProviderConfig;
    googleCloud: TTSProviderConfig & {
      apiKey?: string;
      projectId?: string;
      cachingEnabled?: boolean;
      maxCacheSize?: number;
    };
    piper: TTSProviderConfig;
  };
  defaultProvider: 'web-speech' | 'google-cloud' | 'piper';
  audioSettings: {
    speakingRate: number; // 0.5 to 2.0
    pitch: number; // -20 to 20
    volumeGain: number; // -96 to 16
  };
  language: {
    autoDetect: boolean;
    defaultLanguage: string;
  };
  caching: {
    enabled: boolean;
    maxSize: number; // MB
    ttl: number; // milliseconds
  };
}

// Default configuration
const DEFAULT_CONFIG: TTSConfig = {
  providers: {
    webSpeech: {
      enabled: true,
      priority: 2,
      fallbackOnError: true
    },
    googleCloud: {
      enabled: false,
      priority: 1,
      fallbackOnError: true,
      cachingEnabled: true,
      maxCacheSize: 100
    },
    piper: {
      enabled: true,
      priority: 2,
      fallbackOnError: true
    }
  },
  defaultProvider: 'web-speech',
  audioSettings: {
    speakingRate: 0.95,
    pitch: 0,
    volumeGain: 0
  },
  language: {
    autoDetect: true,
    defaultLanguage: 'English'
  },
  caching: {
    enabled: true,
    maxSize: 100,
    ttl: 86400000 // 24 hours
  }
};

class TTSConfigManager {
  private config: TTSConfig;
  private listeners: Set<(config: TTSConfig) => void> = new Set();

  constructor(initialConfig?: Partial<TTSConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
    this.loadFromLocalStorage();
  }

  /**
   * Get current TTS configuration
   */
  getConfig(): TTSConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<TTSConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  /**
   * Update provider configuration
   */
  updateProvider(provider: keyof TTSConfig['providers'], config: Partial<Record<string, unknown>>) {
    this.config.providers[provider] = {
      ...this.config.providers[provider],
      ...config
    };
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  /**
   * Update audio settings
   */
  updateAudioSettings(settings: Partial<TTSConfig['audioSettings']>) {
    this.config.audioSettings = {
      ...this.config.audioSettings,
      ...settings
    };
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  /**
   * Get active provider (based on priority and availability)
   */
  getActiveProvider(): 'web-speech' | 'google-cloud' | 'piper' {
    const providers = Object.entries(this.config.providers)
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => a.priority - b.priority)
      .map(([key]) => {
        if (key === 'webSpeech') return 'web-speech';
        if (key === 'googleCloud') return 'google-cloud';
        return 'piper';
      });

    return (providers[0] as typeof this.config.defaultProvider) || this.config.defaultProvider;
  }

  /**
   * Check if Google Cloud TTS is configured
   */
  isGoogleCloudConfigured(): boolean {
    return !!(
      this.config.providers.googleCloud.enabled &&
      this.config.providers.googleCloud.apiKey
    );
  }

  /**
   * Set Google Cloud API key
   */
  setGoogleCloudApiKey(apiKey: string, projectId?: string) {
    this.config.providers.googleCloud.apiKey = apiKey;
    if (projectId) {
      this.config.providers.googleCloud.projectId = projectId;
    }
    this.config.providers.googleCloud.enabled = true;
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (config: TTSConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getConfig()));
  }

  /**
   * Save configuration to localStorage
   */
  private saveToLocalStorage() {
    try {
      localStorage.setItem('tts-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save TTS config to localStorage:', error);
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('tts-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load TTS config from localStorage:', error);
    }
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.config = { ...DEFAULT_CONFIG };
    this.saveToLocalStorage();
    this.notifyListeners();
  }
}

// Create and export singleton instance
export const ttsConfigManager = new TTSConfigManager();

export default ttsConfigManager;
