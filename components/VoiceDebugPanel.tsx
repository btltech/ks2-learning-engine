import React, { useState, useEffect } from 'react';
import { debugVoiceSelection, listAllVoices, testVoiceQuality, compareBrowserVoices } from '../services/voiceDebugger';

/**
 * VoiceDebugPanel Component
 * 
 * Shows real-time voice selection debugging
 * Add this to your app for development/testing:
 * 
 * import { VoiceDebugPanel } from './components/VoiceDebugPanel';
 * 
 * // In your JSX:
 * {process.env.NODE_ENV === 'development' && <VoiceDebugPanel />}
 */

export const VoiceDebugPanel: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [voiceInfo, setVoiceInfo] = useState<string>('');

  useEffect(() => {
    if (showPanel) {
      // Load voice info when panel opens
      const voices = window.speechSynthesis?.getVoices() || [];
      setVoiceInfo(`Available voices: ${voices.length}`);
    }
  }, [showPanel]);

  const runDebug = (fn: () => void, title: string) => {
    console.log(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}\n`);
    fn();
    setVoiceInfo(`✓ Check console for: ${title}`);
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50 font-bold"
        title="Open Voice Debug Panel (dev only)"
      >
        🎤
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-2xl z-50 w-80 p-4 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">🎤 Voice Debug</h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-300">{voiceInfo}</p>
        <p className="text-xs text-gray-400">Browser: {getBrowserName()}</p>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={() => runDebug(() => debugVoiceSelection('en-GB'), 'Voice Selection (en-GB)')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded"
        >
          Debug Voice Selection
        </button>

        <button
          onClick={() => runDebug(() => listAllVoices(), 'All Available Voices')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded"
        >
          List All Voices
        </button>

        <button
          onClick={() => runDebug(() => testVoiceQuality(), 'Test Voice Quality')}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded"
        >
          🔊 Test Voice
        </button>

        <button
          onClick={() => runDebug(() => compareBrowserVoices(), 'Browser Comparison')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded"
        >
          Compare Browser
        </button>
      </div>

      <div className="text-xs text-gray-400 border-t border-gray-700 pt-3">
        💡 Output appears in browser console (F12 → Console tab)
      </div>
    </div>
  );
};

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Brave')) return 'Brave';
  if (ua.includes('Firefox')) return 'Firefox';
  return 'Unknown';
}
