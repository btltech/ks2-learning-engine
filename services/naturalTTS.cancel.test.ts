import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const providers = vi.hoisted(() => ({ kokoro: vi.fn(), celebration: vi.fn(), language: vi.fn() }));
vi.mock('./kokoroTTS', () => ({ speakWithKokoro: providers.kokoro, stopKokoro: vi.fn(), pauseKokoro: vi.fn(), resumeKokoro: vi.fn(), isKokoroSpeaking: () => false }));
vi.mock('./encouragementAudio', () => ({ playEncouragementAudio: providers.celebration, stopEncouragementAudio: vi.fn(), pauseEncouragementAudio: vi.fn(), resumeEncouragementAudio: vi.fn() }));
vi.mock('./languageAudio', () => ({ hasLanguageAudioFor: () => true, playLanguageAudio: providers.language, stopLanguageAudio: vi.fn(), pauseLanguageAudio: vi.fn(), resumeLanguageAudio: vi.fn() }));
class Utterance {
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}
let utterances: Utterance[];
let engine: { speaking: boolean; paused: boolean; speak: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; resume: ReturnType<typeof vi.fn>; getVoices: () => never[]; addEventListener: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers(); utterances = [];
  providers.kokoro.mockReset().mockResolvedValue(false); providers.celebration.mockReset().mockResolvedValue(false); providers.language.mockReset().mockResolvedValue(false);
  engine = { speaking: false, paused: false, speak: vi.fn((u: Utterance) => { utterances.push(u); engine.speaking = true; }), cancel: vi.fn(() => { engine.speaking = false; }), pause: vi.fn(() => { engine.paused = true; }), resume: vi.fn(() => { engine.paused = false; }), getVoices: () => [], addEventListener: vi.fn() };
  // Deliberately no end/error event on cancel, as happens in some browsers.
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: engine });
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const flush = () => vi.advanceTimersByTimeAsync(0);
describe('browser speech cancellation', () => {
  it('stops mid-sentence, settles the reading and never starts the next sentence', async () => {
    const { speakNaturally, stopSpeaking } = await import('./naturalTTS');
    const reading = speakNaturally('First sentence. Second sentence.'); await flush();
    expect(utterances.map(u => u.text)).toEqual(['First sentence.']);
    stopSpeaking(); await reading;
    utterances[0].onend?.(); await vi.advanceTimersByTimeAsync(5000);
    expect(utterances).toHaveLength(1); expect(engine.speaking).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it('clears the gap timer when stopped between sentences', async () => {
    const { speakNaturally, stopSpeaking } = await import('./naturalTTS');
    const reading = speakNaturally('First sentence. Second sentence.'); await flush();
    utterances[0].onend?.(); await flush(); expect(vi.getTimerCount()).toBe(1);
    stopSpeaking(); await reading; await vi.advanceTimersByTimeAsync(5000);
    expect(utterances).toHaveLength(1); expect(vi.getTimerCount()).toBe(0);
  });
  it('Stop then Play starts the current lesson at its beginning and ignores old callbacks', async () => {
    const { speakNaturally, stopSpeaking } = await import('./naturalTTS');
    const old = speakNaturally('Old first. Old second.'); await flush(); const oldUtterance = utterances[0];
    stopSpeaking(); await old;
    const current = speakNaturally('Current first. Current second.'); await flush();
    oldUtterance.onend?.(); await flush();
    expect(utterances.map(u => u.text)).toEqual(['Old first.', 'Current first.']);
    stopSpeaking(); await current; await vi.runAllTimersAsync(); expect(utterances).toHaveLength(2);
  });
  it('Pause then Resume continues the same utterance before the next sentence', async () => {
    const { speakNaturally, stopSpeaking, pauseSpeaking, resumeSpeaking } = await import('./naturalTTS');
    const reading = speakNaturally('First sentence. Second sentence.'); await flush(); const current = utterances[0];
    pauseSpeaking(); expect(engine.paused).toBe(true); await vi.advanceTimersByTimeAsync(5000);
    expect(utterances).toEqual([current]); resumeSpeaking(); expect(engine.paused).toBe(false); expect(utterances).toEqual([current]);
    current.onend?.(); await vi.advanceTimersByTimeAsync(200); expect(utterances[1].text).toBe('Second sentence.');
    stopSpeaking(); await reading;
  });
  it('resets a paused browser queue before the next Play', async () => {
    const { speakNaturally, stopSpeaking, pauseSpeaking } = await import('./naturalTTS');
    const first = speakNaturally('First. Second.'); await flush(); pauseSpeaking(); stopSpeaking(); await first;
    expect(engine.paused).toBe(false); const next = speakNaturally('Restart.'); await flush(); expect(utterances.at(-1)?.text).toBe('Restart.'); stopSpeaking(); await next;
  });
  it('does not fall back to browser speech when cancelled during a Kokoro request', async () => {
    let settle!: (value: boolean) => void;
    providers.kokoro.mockReturnValueOnce(new Promise<boolean>(resolve => { settle = resolve; }));
    const { speakNaturally, stopSpeaking } = await import('./naturalTTS');
    const reading = speakNaturally('First. Second.'); stopSpeaking(); settle(false); await reading;
    expect(engine.speak).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it('does not start fallback after a stopped recording lookup', async () => {
    let settle!: (value: boolean) => void;
    providers.celebration.mockReturnValueOnce(new Promise<boolean>(resolve => { settle = resolve; }));
    const { speakCelebration, stopSpeaking } = await import('./naturalTTS');
    const reading = speakCelebration('Well done!'); stopSpeaking(); settle(false); await reading;
    expect(engine.speak).not.toHaveBeenCalled(); expect(providers.kokoro).not.toHaveBeenCalled();
  });
});
