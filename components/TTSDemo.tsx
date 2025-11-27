import React, { useState } from 'react';
import { useTTSEnhanced } from '../hooks/useTTSEnhanced';

const TTSDemo: React.FC = () => {
  const [text, setText] = useState('Hello from Kasita!');
  const { speak, cancel, isLoading, progress, errorMessage, needsGesture, setNeedsGesture } = useTTSEnhanced(undefined, {
    googleCloudApiKey: (import.meta as unknown as { env: { VITE_GOOGLE_CLOUD_TTS_API_KEY?: string } }).env?.VITE_GOOGLE_CLOUD_TTS_API_KEY,
    preferGoogleCloud: true
  });

  return (
    <div className="p-6 border rounded-md bg-white shadow-md">
      <h3 className="font-bold mb-2">TTS Demo</h3>
      <textarea className="w-full p-2 border rounded" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 flex gap-3">
        <button onClick={() => speak(text)} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">Generate</button>
        <button onClick={() => cancel()} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
      </div>
      {isLoading && (
        <div className="mt-3">Downloading model... {typeof progress === 'number' ? `${Math.round(progress)}%` : ''}</div>
      )}
      {errorMessage && (
        <div className="mt-3 text-red-700">Error: {errorMessage}</div>
      )}
      {needsGesture && (
        <div className="mt-3">
          <button onClick={() => { setNeedsGesture(false); speak(text); }} className="px-4 py-2 bg-blue-700 text-white rounded">Tap to Play</button>
        </div>
      )}
    </div>
  );
};

export default TTSDemo;
