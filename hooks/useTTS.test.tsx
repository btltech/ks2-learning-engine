import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { useTTS } from './useTTS';

// Mock Google Cloud TTS to force fallback to browser TTS
vi.mock('../services/googleCloudTTS', () => ({
  initializeGoogleCloudTTS: vi.fn(),
  isGoogleCloudConfigured: vi.fn(() => false),
  speakWithGoogleCloud: vi.fn(),
  stopGoogleCloudAudio: vi.fn(),
  isLanguageSupportedByGoogleCloud: vi.fn(() => false),
}));

// Mock window.speechSynthesis for testing
const mockSpeak = vi.fn().mockImplementation((utterance) => {
  // Simulate speech duration
  setTimeout(() => {
    if (utterance.onend) {
      utterance.onend();
    }
  }, 500);
});
const mockCancel = vi.fn();

Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: vi.fn(() => []),
  },
  writable: true,
  configurable: true,
});

// Mock Audio
const listeners: Record<string, Function[]> = {};

class MockAudio {
  src: string;
  
  constructor(src: string) {
    this.src = src;
  }

  play() {
    // Simulate audio playing and ending
    setTimeout(() => {
      if (listeners['ended']) {
        listeners['ended'].forEach(cb => cb());
      }
    }, 500); // 500ms duration
    return Promise.resolve();
  }

  pause() {
    // Simulate pause event
    if (listeners['pause']) {
      listeners['pause'].forEach(cb => cb());
    }
  }

  addEventListener(event: string, callback: Function) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  }
}

// Mock Audio constructor properly
global.Audio = vi.fn().mockImplementation(function(src) {
  return new MockAudio(src);
}) as any;

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = vi.fn().mockImplementation(function(text) {
  return {
    text,
    lang: '',
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    onend: () => {},
    onerror: () => {},
  };
}) as any;

const TestComponent: React.FC<{ text: string }> = ({ text }) => {
  const { speak, cancel, isSpeaking, isLoading, progress, errorMessage } = useTTS();
  return (
    <div>
      <button onClick={() => speak(text)}>Speak</button>
      <button onClick={cancel}>Cancel</button>
      <div data-testid="status">{isSpeaking ? 'speaking' : isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="progress">{progress ?? ''}</div>
      <div data-testid="error">{errorMessage ?? ''}</div>
    </div>
  );
};

describe('useTTS hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts speaking when speak is called', async () => {
    const { getByText, getByTestId } = render(<TestComponent text="Hello" />);
    
    await act(async () => {
      fireEvent.click(getByText('Speak'));
    });

    expect(mockSpeak).toHaveBeenCalledWith(expect.objectContaining({ text: 'Hello' }));
    expect(getByTestId('status').textContent).toBe('speaking');

    // Fast forward to end of speech (500ms) + pause (200ms)
    // We advance in steps to ensure sequential timers are triggered
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    
    expect(getByTestId('status').textContent).toBe('idle');
  });

  it('stops speaking after timeout', async () => {
    const { getByText, getByTestId } = render(<TestComponent text="Hello" />);
    
    await act(async () => {
      fireEvent.click(getByText('Speak'));
    });

    expect(getByTestId('status').textContent).toBe('speaking');

    // Wait for timeout (2000ms min duration)
    // Advance in steps to handle sequential async timers
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(getByTestId('status').textContent).toBe('idle');
  });

  it('cancels speaking', async () => {
    // Mock window.speechSynthesis
    const cancelMock = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: cancelMock,
        getVoices: vi.fn(() => []),
        speak: vi.fn(),
      },
      writable: true,
    });

    const { getByText, getByTestId } = render(<TestComponent text="Hello" />);
    
    await act(async () => {
      fireEvent.click(getByText('Speak'));
    });

    expect(getByTestId('status').textContent).toBe('speaking');

    await act(async () => {
      fireEvent.click(getByText('Cancel'));
    });

    expect(cancelMock).toHaveBeenCalled();
    expect(getByTestId('status').textContent).toBe('idle');
  });
});
