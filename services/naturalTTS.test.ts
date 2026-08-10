import { beforeEach, describe, expect, it, vi } from 'vitest';

const { playEncouragementAudio } = vi.hoisted(() => ({
  playEncouragementAudio: vi.fn().mockResolvedValue(true),
}));

vi.mock('./encouragementAudio', () => ({
  playEncouragementAudio,
  stopEncouragementAudio: vi.fn(),
  pauseEncouragementAudio: vi.fn(),
  resumeEncouragementAudio: vi.fn(),
}));

class MockUtterance {
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(public text: string) {}
}

describe('natural TTS cost policy', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => []),
        addEventListener: vi.fn(),
        speak: vi.fn((utterance: MockUtterance) => utterance.onend?.()),
        speaking: false,
      },
    });
  });

  it('never uses paid Google speech for lesson or quiz read-aloud', async () => {
    const { speakNaturally } = await import('./naturalTTS');
    await speakNaturally('Read this lesson.', 'English');
    expect(playEncouragementAudio).not.toHaveBeenCalled();
  });

  it('uses the cached R2 library for celebration speech', async () => {
    const { speakCelebration } = await import('./naturalTTS');
    await speakCelebration('Well done!', 'English', 'high_score');
    expect(playEncouragementAudio).toHaveBeenCalledWith('high_score');
  });

  it('falls back to free browser speech if cached audio is unavailable', async () => {
    playEncouragementAudio.mockResolvedValueOnce(false);
    const { speakCelebration } = await import('./naturalTTS');
    await speakCelebration('Excellent work!', 'English');
    expect(window.speechSynthesis.speak).toHaveBeenCalledOnce();
  });
});
