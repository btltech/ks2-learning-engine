import { beforeEach, describe, expect, it, vi } from 'vitest';

const { initializeGoogleCloudTTS, speakWithGoogleCloud } = vi.hoisted(() => ({
  initializeGoogleCloudTTS: vi.fn(),
  speakWithGoogleCloud: vi.fn().mockResolvedValue(true),
}));

vi.mock('./googleCloudTTS', () => ({
  initializeGoogleCloudTTS,
  isGoogleCloudConfigured: vi.fn(() => true),
  speakWithGoogleCloud,
  stopGoogleCloudAudio: vi.fn(),
  pauseGoogleCloudAudio: vi.fn(),
  resumeGoogleCloudAudio: vi.fn(),
  isLanguageSupportedByGoogleCloud: vi.fn(() => true),
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
    vi.stubEnv('VITE_ENABLE_PAID_CELEBRATION_TTS', 'false');
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
    expect(initializeGoogleCloudTTS).not.toHaveBeenCalled();
    expect(speakWithGoogleCloud).not.toHaveBeenCalled();
  });

  it('keeps celebration speech free unless paid celebrations are explicitly enabled', async () => {
    const { speakCelebration } = await import('./naturalTTS');
    await speakCelebration('Well done!', 'English');
    expect(initializeGoogleCloudTTS).not.toHaveBeenCalled();
    expect(speakWithGoogleCloud).not.toHaveBeenCalled();
  });

  it('allows only the explicit paid celebration opt-in', async () => {
    vi.stubEnv('VITE_ENABLE_PAID_CELEBRATION_TTS', 'true');
    const { speakCelebration } = await import('./naturalTTS');
    await speakCelebration('Excellent work!', 'English');
    expect(initializeGoogleCloudTTS).toHaveBeenCalledWith();
    expect(speakWithGoogleCloud).toHaveBeenCalledOnce();
  });
});
