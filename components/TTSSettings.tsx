import React, { useState, useEffect } from 'react';
import { ttsConfigManager } from '../services/ttsConfigManager';
import type { TTSConfig } from '../services/ttsConfigManager';

interface TTSSettingsProps {
  onClose?: () => void;
  onConfigChange?: (config: TTSConfig) => void;
}

export const TTSSettings: React.FC<TTSSettingsProps> = ({ onClose, onConfigChange }) => {
  const [config, setConfig] = useState<TTSConfig>(ttsConfigManager.getConfig());
  const [googleCloudApiKey, setGoogleCloudApiKey] = useState(
    config.providers.googleCloud.apiKey || ''
  );
  const [projectId, setProjectId] = useState(
    config.providers.googleCloud.projectId || ''
  );

  useEffect(() => {
    const unsubscribe = ttsConfigManager.subscribe(newConfig => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  const handleProviderToggle = (provider: 'webSpeech' | 'googleCloud' | 'piper') => {
    const updatedConfig = { ...config };
    updatedConfig.providers[provider].enabled = !updatedConfig.providers[provider].enabled;
    ttsConfigManager.updateConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  const handleDefaultProviderChange = (provider: 'web-speech' | 'google-cloud' | 'piper') => {
    ttsConfigManager.updateConfig({ defaultProvider: provider });
    onConfigChange?.(ttsConfigManager.getConfig());
  };

  const handleGoogleCloudApiKeySubmit = () => {
    if (googleCloudApiKey.trim()) {
      ttsConfigManager.setGoogleCloudApiKey(googleCloudApiKey, projectId);
      setConfig(ttsConfigManager.getConfig());
      onConfigChange?.(config);
    }
  };

  const handleAudioSettingChange = (setting: keyof TTSConfig['audioSettings'], value: number) => {
    ttsConfigManager.updateAudioSettings({ [setting]: value });
    setConfig(ttsConfigManager.getConfig());
    onConfigChange?.(config);
  };

  const handleReset = () => {
    if (confirm('Reset TTS configuration to defaults?')) {
      ttsConfigManager.reset();
      setConfig(ttsConfigManager.getConfig());
      setGoogleCloudApiKey('');
      setProjectId('');
      onConfigChange?.(config);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">TTS Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">TTS Providers</h3>
            <div className="space-y-3">
              {/* Web Speech API */}
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="web-speech"
                  checked={config.providers.webSpeech.enabled}
                  onChange={() => handleProviderToggle('webSpeech')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="web-speech" className="ml-3 flex-1">
                  <div className="font-medium text-gray-800">Web Speech API</div>
                  <div className="text-sm text-gray-600">Free, built-in browser TTS (Fallback)</div>
                </label>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Priority: 2</span>
              </div>

              {/* Google Cloud TTS */}
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="google-cloud"
                  checked={config.providers.googleCloud.enabled}
                  onChange={() => handleProviderToggle('googleCloud')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="google-cloud" className="ml-3 flex-1">
                  <div className="font-medium text-gray-800">Google Cloud TTS</div>
                  <div className="text-sm text-gray-600">Premium neural voices (Requires API key)</div>
                </label>
                <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">Priority: 1</span>
              </div>

              {/* Piper TTS */}
              <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  id="piper"
                  checked={config.providers.piper.enabled}
                  onChange={() => handleProviderToggle('piper')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="piper" className="ml-3 flex-1">
                  <div className="font-medium text-gray-800">Piper TTS</div>
                  <div className="text-sm text-gray-600">Open-source offline TTS</div>
                </label>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Priority: 2</span>
              </div>
            </div>
          </section>

          {/* Default Provider */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Default Provider</h3>
            <select
              value={config.defaultProvider}
              onChange={e => handleDefaultProviderChange(e.target.value as 'web-speech' | 'google-cloud' | 'piper')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="web-speech">Web Speech API</option>
              {config.providers.googleCloud.enabled && (
                <option value="google-cloud">Google Cloud TTS</option>
              )}
              <option value="piper">Piper TTS</option>
            </select>
          </section>

          {/* Google Cloud Configuration */}
          {config.providers.googleCloud.enabled && (
            <section className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Google Cloud Configuration</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={googleCloudApiKey}
                    onChange={e => setGoogleCloudApiKey(e.target.value)}
                    placeholder="Enter your Google Cloud API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    placeholder="Enter your Google Cloud Project ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleGoogleCloudApiKeySubmit}
                  disabled={!googleCloudApiKey.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Save Configuration
                </button>

                {config.providers.googleCloud.apiKey && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                    ✓ Google Cloud TTS is configured and ready
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Audio Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Audio Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speaking Rate: {config.audioSettings.speakingRate.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.audioSettings.speakingRate}
                  onChange={e => handleAudioSettingChange('speakingRate', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {config.audioSettings.pitch}
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={config.audioSettings.pitch}
                  onChange={e => handleAudioSettingChange('pitch', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Lower</span>
                  <span>Normal</span>
                  <span>Higher</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {config.audioSettings.volumeGain} dB
                </label>
                <input
                  type="range"
                  min="-96"
                  max="16"
                  step="1"
                  value={config.audioSettings.volumeGain}
                  onChange={e => handleAudioSettingChange('volumeGain', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Language Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Language Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.language.autoDetect}
                  onChange={e => {
                    ttsConfigManager.updateConfig({
                      language: { ...config.language, autoDetect: e.target.checked }
                    });
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Auto-detect language from content</span>
              </label>
            </div>
          </section>

          {/* Cache Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Caching</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.caching.enabled}
                  onChange={e => {
                    ttsConfigManager.updateConfig({
                      caching: { ...config.caching, enabled: e.target.checked }
                    });
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Enable audio caching</span>
              </label>
              <p className="text-sm text-gray-600">
                Cache size: {config.caching.maxSize} MB | TTL: {(config.caching.ttl / 1000 / 60 / 60).toFixed(1)} hours
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleReset}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTSSettings;
