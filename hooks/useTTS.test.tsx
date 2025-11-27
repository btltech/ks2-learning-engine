import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { useTTS } from './useTTS';

// Mock services/piperTTS
vi.mock('../services/piperTTS', () => ({
  initPiperTTS: vi.fn(async () => true),
  generatePiperAudio: vi.fn(async () => 'web-speech-api'),
}));

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
  });

  it('starts speaking when speak is called', async () => {
    const { getByText, getByTestId } = render(<TestComponent text="Hello" />);
    
    await act(async () => {
      fireEvent.click(getByText('Speak'));
    });

    // Should go to speaking (loading is brief)
    await waitFor(() => {
      expect(getByTestId('status').textContent).toBe('speaking');
    });
  });

  it('stops speaking after timeout', async () => {
    const { getByText, getByTestId } = render(<TestComponent text="Hello" />);
    
    await act(async () => {
      fireEvent.click(getByText('Speak'));
    });

    await waitFor(() => {
      expect(getByTestId('status').textContent).toBe('speaking');
    });

    // Wait for timeout (2000ms min duration)
    await new Promise(resolve => setTimeout(resolve, 2100));

    await waitFor(() => {
      expect(getByTestId('status').textContent).toBe('idle');
    });
  }, 10000);

  it('cancels speaking', async () => {
    // Mock window.speechSynthesis
    const cancelMock = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: cancelMock,
      },
      writable: true,
    });

    const { getByText, getByTestId } = render(<TestComponent text="Hello" />);
    
    await act(async () => {
      fireEvent.click(getByText('Speak'));
    });

    await waitFor(() => {
      expect(getByTestId('status').textContent).toBe('speaking');
    });

    await act(async () => {
      fireEvent.click(getByText('Cancel'));
    });

    expect(cancelMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(getByTestId('status').textContent).toBe('idle');
    });
  });
});
