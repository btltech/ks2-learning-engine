import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// Mock services/coquiTTS module to prevent Worker creation in Node during tests
vi.mock('../services/coquiTTS', () => ({
  generateCoquiAudio: vi.fn(async () => 'blob:mock'),
  onProgress: vi.fn(() => () => {}),
  onError: vi.fn(() => () => {}),
  onEmbeddingsCount: vi.fn(() => () => {}),
  setSpeakerIndex: vi.fn(),
}));
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useTTS } from './useTTS';

const TestComponent: React.FC<{ text: string }> = ({ text }) => {
  const { speak, cancel, isSpeaking, isLoading, progress, errorMessage, needsGesture, setNeedsGesture } = useTTS();
  return (
    <div>
      <button onClick={() => speak(text)}>Speak</button>
      <button onClick={cancel}>Cancel</button>
      <div data-testid="status">{isSpeaking ? 'speaking' : isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="progress">{progress ?? ''}</div>
      <div data-testid="error">{errorMessage ?? ''}</div>
      <div data-testid="needsGesture">{needsGesture ? 'yes' : 'no'}</div>
    </div>
  );
};

describe('useTTS hook', () => {
  let mockGenerate: any;
  let originalPlay: any;

  beforeEach(async () => {
    const coqui = await import('../services/coquiTTS');
    mockGenerate = vi.spyOn(coqui, 'generateCoquiAudio').mockImplementation(async () => 'blob:mock');
    originalPlay = HTMLAudioElement.prototype.play;
  });
  afterEach(() => {
    mockGenerate.mockRestore();
    HTMLAudioElement.prototype.play = originalPlay;
    vi.restoreAllMocks();
  });

  it('sets needsGesture when play is blocked', async () => {
    // Simulate autoplay blocked
    HTMLAudioElement.prototype.play = vi.fn(() => Promise.reject(new Error('Autoplay policy')));

    const { getByText, getByTestId } = render(<TestComponent text="Hello" />);
    fireEvent.click(getByText('Speak'));

    await waitFor(() => {
      expect(getByTestId('needsGesture').textContent).toBe('yes');
    });
  });

  it('revokes object URL on ended and cancel', async () => {
    const coqui = await import('../services/coquiTTS');
    const mockGenerate = vi.spyOn(coqui, 'generateCoquiAudio').mockImplementation(async () => 'blob:mock');

    const mockRevoke = vi.fn();
    globalThis.URL.createObjectURL = (blob: any) => 'blob:mock';
    globalThis.URL.revokeObjectURL = mockRevoke;

    // Mock Audio element
    const playMock = vi.fn(() => Promise.resolve());
    const pauseMock = vi.fn();
    const createdInstances: any[] = [];
    class FakeAudio {
      src = '';
      onended: any = null;
      onerror: any = null;
      constructor(src?: string) {
        this.src = src || '';
        (this as any).play = playMock;
        (this as any).pause = pauseMock;
        createdInstances.push(this);
      }
    }
    vi.stubGlobal('Audio', FakeAudio as any);

    const { getByText } = render(<TestComponent text="Hello revoke" />);
    fireEvent.click(getByText('Speak'));
    // Wait for play to be called
    await waitFor(() => expect(playMock.mock.calls.length).toBeGreaterThan(0));
    // Retrieve the single created audio by using the mocked constructor's last instance
    const createdInstance = createdInstances[0];
    if (createdInstance && createdInstance.onended) createdInstance.onended();
    expect(mockRevoke).toHaveBeenCalled();
    // Now test cancel directly
    fireEvent.click(getByText('Speak'));
    fireEvent.click(getByText('Cancel'));
    expect(mockRevoke).toHaveBeenCalled();
    mockGenerate.mockRestore();
  });
});
