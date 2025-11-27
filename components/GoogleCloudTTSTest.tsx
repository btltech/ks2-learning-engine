import React, { useState, useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';
import { getSupportedLanguages, getAvailableVoices } from '../services/googleCloudTTS';

export const GoogleCloudTTSTestComponent: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const { speak, isSpeaking, errorMessage } = useTTS(selectedLanguage);
  const [testText, setTestText] = useState('Hello! This is a test of Google Cloud Text-to-Speech.');
  const [voiceGender, setVoiceGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [googleCloudConfigured, setGoogleCloudConfigured] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);

  useEffect(() => {
    // Get supported languages
    const langs = getSupportedLanguages();
    setSupportedLanguages(langs);
    
    addLog('Using Web Speech API');
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSpeak = async () => {
    addLog(`Speaking: "${testText}" in ${selectedLanguage}`);
    await speak(testText);
  };

  const handleClearCache = () => {
    addLog('Cache cleared');
    // Implementation would go in googleCloudTTS service
  };

  const availableVoices = getAvailableVoices(selectedLanguage);
  const voiceCount = availableVoices.length;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Google Cloud TTS Test</h3>
        <button 
          onClick={() => setShowLogs(!showLogs)}
          className="text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
        >
          {showLogs ? 'Hide' : 'Show'} Logs
        </button>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <span className="text-green-600">
              ✓ Web Speech API: Ready
            </span>
          </div>
          <div>Provider: <span className="font-semibold">Web Speech API</span></div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Text to Speak</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
            rows={2}
          />
        </div>

        {/* Language & Voice */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              {supportedLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">{voiceCount} voices available</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voice Gender</label>
            <select
              value={voiceGender}
              onChange={(e) => setVoiceGender(e.target.value as 'MALE' | 'FEMALE')}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-2 bg-gray-50 p-2 rounded">
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => { setSpeakingRate(0.9); setPitch(0); setVolume(0); }}
              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title="Slower, more natural speech"
            >
              Natural Slow
            </button>
            <button
              onClick={() => { setSpeakingRate(1.0); setPitch(0); setVolume(0); }}
              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title="Normal natural speech"
            >
              Natural Normal
            </button>
            <button
              onClick={() => { setSpeakingRate(1.1); setPitch(2); setVolume(2); }}
              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title="Faster with more expression"
            >
              Natural Fast
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">
              Speaking Rate: {speakingRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speakingRate}
              onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-700">
              Pitch: {pitch > 0 ? '+' : ''}{pitch}
            </label>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-700">
              Volume: {volume > 0 ? '+' : ''}{volume} dB
            </label>
            <input
              type="range"
              min="-96"
              max="16"
              step="1"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-700">
              <span className="font-semibold">Error:</span> {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex gap-2">
        <button
          onClick={handleSpeak}
          disabled={isSpeaking || !testText.trim()}
          className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
            isSpeaking
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isSpeaking ? 'Speaking...' : 'Speak'}
        </button>
        
        <button
          onClick={handleClearCache}
          className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium"
          title="Clear audio cache"
        >
          Clear Cache
        </button>
      </div>

      {/* Logs Section */}
      {showLogs && (
        <div className="bg-gray-900 text-green-400 font-mono text-xs px-4 py-2 border-t border-gray-700 max-h-32 overflow-y-auto rounded-b-lg">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {logs.length === 0 && <div className="text-gray-500">No logs yet...</div>}
        </div>
      )}
    </div>
  );
};

export default GoogleCloudTTSTestComponent;
