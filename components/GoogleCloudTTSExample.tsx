import React, { useState } from 'react';
import { useTTSEnhanced } from '../hooks/useTTSEnhanced';
import TTSSettings from './TTSSettings';
import type { TTSConfig } from '../services/ttsConfigManager';

interface GoogleCloudTTSExampleProps {
  language?: string;
}

export const GoogleCloudTTSExample: React.FC<GoogleCloudTTSExampleProps> = ({
  language = 'English'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [testText, setTestText] = useState('Hello! This is a test of Google Cloud Text-to-Speech.');
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<'MALE' | 'FEMALE'>('FEMALE');

  const {
    speak,
    cancel,
    switchProvider,
    isSpeaking,
    isLoading,
    progress,
    errorMessage,
    activeProvider,
    googleCloudAvailable,
    availableProviders
  } = useTTSEnhanced(language, {
    googleCloudApiKey: (import.meta as unknown as { env: { VITE_GOOGLE_CLOUD_TTS_API_KEY?: string } }).env?.VITE_GOOGLE_CLOUD_TTS_API_KEY
  });

  const handleSpeak = async () => {
    if (testText.trim()) {
      await speak(testText);
    }
  };

  const handleCancel = () => {
    cancel();
  };

  const handleSwitchProvider = (provider: 'web-speech' | 'google-cloud' | 'piper') => {
    switchProvider(provider);
  };

  const handleConfigChange = (config: TTSConfig) => {
    console.log('TTS Configuration updated:', config);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Text-to-Speech Demo</h2>
        <p className="text-gray-600">
          Language: <span className="font-semibold">{language}</span> | 
          Provider: <span className="font-semibold">{activeProvider === 'google-cloud' ? 'Google Cloud' : activeProvider === 'web-speech' ? 'Web Speech' : 'Piper'}</span>
        </p>
      </div>

      {/* Status Bar */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-800">Status</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isSpeaking ? 'bg-red-100 text-red-700' :
            isLoading ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {isSpeaking ? '🔊 Speaking' : isLoading ? '⏳ Loading' : '✓ Ready'}
          </span>
        </div>

        {progress !== null && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {errorMessage && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
            ⚠ {errorMessage}
          </div>
        )}

        {googleCloudAvailable && !errorMessage && (
          <div className="mt-2 p-2 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
            ✓ Google Cloud TTS is ready
          </div>
        )}
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text to Speak
        </label>
        <textarea
          value={testText}
          onChange={e => setTestText(e.target.value)}
          disabled={isSpeaking || isLoading}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Enter text to convert to speech..."
        />
        <p className="text-xs text-gray-600 mt-1">
          {testText.length} characters
        </p>
      </div>

      {/* Voice Gender Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voice Gender
        </label>
        <div className="flex gap-3">
          {(['FEMALE', 'MALE'] as const).map(gender => (
            <label key={gender} className="flex items-center">
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={selectedVoiceGender === gender}
                onChange={e => setSelectedVoiceGender(e.target.value as any)}
                disabled={isSpeaking || isLoading}
                className="w-4 h-4"
              />
              <span className="ml-2 text-gray-700">{gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          onClick={handleSpeak}
          disabled={isSpeaking || isLoading || !testText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          🔊 Speak
        </button>
        <button
          onClick={handleCancel}
          disabled={!isSpeaking}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ⏹ Stop
        </button>
      </div>

      {/* Provider Selection */}
      {availableProviders.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TTS Provider
          </label>
          <div className="flex gap-2">
            {availableProviders.map(provider => (
              <button
                key={provider}
                onClick={() => handleSwitchProvider(provider as 'web-speech' | 'google-cloud' | 'piper')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeProvider === provider
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={isSpeaking || isLoading}
              >
                {provider === 'google-cloud' ? '☁️ Google Cloud' :
                 provider === 'web-speech' ? '🎙️ Web Speech' :
                 '🎵 Piper'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Click to switch between available TTS providers
          </p>
        </div>
      )}

      {/* Settings Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ⚙️ Advanced Settings
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">ℹ️ Information</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Google Cloud TTS</strong>: Premium neural voices with high quality</li>
          <li>• <strong>Web Speech API</strong>: Free, built-in browser TTS (fallback)</li>
          <li>• <strong>Piper TTS</strong>: Open-source offline text-to-speech</li>
          <li>• All 17 languages supported with native voices</li>
          <li>• Audio is automatically cached for improved performance</li>
        </ul>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <TTSSettings
          onClose={() => setShowSettings(false)}
          onConfigChange={handleConfigChange}
        />
      )}
    </div>
  );
};

export default GoogleCloudTTSExample;
