import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetKokoroForTests,
  disableKokoro,
  enableKokoro,
  getKokoroState,
  initKokoroFromPreference,
  isKokoroLanguage,
  speakWithKokoro,
  stopKokoro,
  pauseKokoro,
  resumeKokoro,
} from './kokoroTTS';

class FakeWorker {
  static instances: FakeWorker[] = [];
  static autoGenerate = true;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message: string }) => void) | null = null;
  sent: Array<Record<string, unknown>> = [];
  terminated = false;
  constructor() { FakeWorker.instances.push(this); }
  postMessage(message: Record<string, unknown>) {
    this.sent.push(message);
    if (message.type === 'generate' && FakeWorker.autoGenerate) {
      queueMicrotask(() => this.emit({ type: 'audio', id: message.id, samples: new Float32Array(240), sampleRate: 24000 }));
    }
  }
  terminate() { this.terminated = true; }
  emit(data: unknown) { this.onmessage?.({ data }); }
}

class FakeSource {
  static instances: FakeSource[] = [];
  static autoFinish = true;
  started = false;
  constructor() { FakeSource.instances.push(this); }
  buffer: unknown = null;
  onended: (() => void) | null = null;
  connect() {}
  start() { this.started = true; if (FakeSource.autoFinish) queueMicrotask(() => this.onended?.()); }
  stop() {}
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  constructor() { FakeAudioContext.instances.push(this); }
  state = 'running';
  destination = {};
  createBuffer(_channels: number, length: number) { return { copyToChannel: vi.fn(), length }; }
  createBufferSource() { return new FakeSource(); }
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
}

const ready = () => FakeWorker.instances.at(-1)!.emit({ type: 'ready' });

describe('kokoroTTS', () => {
  beforeEach(() => {
    __resetKokoroForTests();
    FakeWorker.instances = [];
    FakeWorker.autoGenerate = true;
    FakeSource.instances = [];
    FakeSource.autoFinish = true;
    FakeAudioContext.instances = [];
    localStorage.clear();
    vi.stubGlobal('Worker', FakeWorker);
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('caches', {});
    (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('only claims English', () => {
    expect(isKokoroLanguage('English')).toBe(true);
    expect(isKokoroLanguage('en-GB')).toBe(true);
    expect(isKokoroLanguage('French')).toBe(false);
    expect(isKokoroLanguage('Yoruba')).toBe(false);
  });

  it('does nothing until the user opts in', async () => {
    initKokoroFromPreference();
    expect(FakeWorker.instances).toHaveLength(0);
    expect(await speakWithKokoro(['Hello there.'], 'English')).toBe(false);
  });

  it('restores a saved opt-in and loads the model', () => {
    localStorage.setItem('ks2.kokoroVoice.enabled', '1');
    initKokoroFromPreference();
    expect(getKokoroState().status).toBe('loading');
    expect(FakeWorker.instances[0].sent[0]).toMatchObject({ type: 'init' });
  });

  it('falls back (returns false) while the model is still loading', async () => {
    enableKokoro();
    expect(getKokoroState().status).toBe('loading');
    expect(await speakWithKokoro(['Hello there.'], 'English')).toBe(false);
  });

  it('reports download progress', () => {
    enableKokoro();
    FakeWorker.instances[0].emit({ type: 'progress', progress: 0.4 });
    expect(getKokoroState().progress).toBe(0.4);
  });

  it('speaks each sentence once ready, using the requested style voice', async () => {
    enableKokoro();
    ready();
    expect(await speakWithKokoro(['One.', 'Two.'], 'English', 'mira')).toBe(true);
    const generates = FakeWorker.instances[0].sent.filter((m) => m.type === 'generate');
    expect(generates.map((m) => m.text)).toEqual(['One.', 'Two.']);
    expect(generates[0].voice).toBe('bf_isabella');
  });

  it('declines non-English text so the caller can use Web Speech', async () => {
    enableKokoro();
    ready();
    expect(await speakWithKokoro(['Bonjour.'], 'French')).toBe(false);
  });

  it('returns false when the first sentence fails to generate', async () => {
    enableKokoro();
    ready();
    const worker = FakeWorker.instances[0];
    worker.postMessage = (message) => {
      worker.sent.push(message);
      queueMicrotask(() => worker.emit({ type: 'error', id: message.id, message: 'boom' }));
    };
    expect(await speakWithKokoro(['Hello.'], 'English')).toBe(false);
  });

  it('goes to error state if the worker fails to initialise', () => {
    enableKokoro();
    FakeWorker.instances[0].emit({ type: 'error', message: 'model missing' });
    expect(getKokoroState()).toMatchObject({ status: 'error', error: 'model missing' });
  });

  it('disabling clears the preference and stops the worker', () => {
    enableKokoro();
    disableKokoro();
    expect(getKokoroState().status).toBe('off');
    expect(FakeWorker.instances[0].terminated).toBe(true);
    expect(localStorage.getItem('ks2.kokoroVoice.enabled')).toBeNull();
  });

  it('stop is safe when nothing is playing', () => {
    expect(() => stopKokoro()).not.toThrow();
  });
  it('stops mid-buffer without starting the prefetched next sentence', async () => {
    vi.useFakeTimers(); FakeSource.autoFinish = false; enableKokoro(); ready();
    const reading = speakWithKokoro(['First.', 'Second.'], 'English'); await vi.advanceTimersByTimeAsync(0);
    expect(FakeSource.instances.filter(source => source.started)).toHaveLength(1);
    stopKokoro(); await reading; await vi.runAllTimersAsync();
    expect(FakeSource.instances.filter(source => source.started)).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0); expect(getKokoroState().status).toBe('ready'); expect(FakeWorker.instances[0].terminated).toBe(false);
  });
  it('cancels a pending first generation without falling back or accepting late audio', async () => {
    vi.useFakeTimers(); FakeWorker.autoGenerate = false; enableKokoro(); ready();
    const reading = speakWithKokoro(['First.', 'Second.'], 'English'); const request = FakeWorker.instances[0].sent.at(-1)!;
    stopKokoro(); expect(await reading).toBe(true); await vi.advanceTimersByTimeAsync(0); expect(vi.getTimerCount()).toBe(0);
    FakeWorker.instances[0].emit({type:'audio',id:request.id,samples:new Float32Array(240),sampleRate:24000}); await vi.advanceTimersByTimeAsync(0);
    expect(FakeSource.instances).toHaveLength(0);
  });
  it('clears the between-sentence timer on Stop', async () => {
    vi.useFakeTimers(); enableKokoro(); ready();
    const reading = speakWithKokoro(['First.', 'Second.'], 'English'); await vi.advanceTimersByTimeAsync(0);
    expect(FakeSource.instances).toHaveLength(1); expect(vi.getTimerCount()).toBe(1);
    stopKokoro(); await reading; await vi.runAllTimersAsync(); expect(FakeSource.instances).toHaveLength(1); expect(vi.getTimerCount()).toBe(0);
  });
  it('Pause and Resume retain the same active source', async () => {
    vi.useFakeTimers(); FakeSource.autoFinish = false; enableKokoro(); ready();
    const reading = speakWithKokoro(['First.', 'Second.'], 'English'); await vi.advanceTimersByTimeAsync(0);
    const source = FakeSource.instances[0]; const context = FakeAudioContext.instances[0];
    pauseKokoro(); expect(context.state).toBe('suspended'); resumeKokoro(); expect(context.state).toBe('running');
    expect(FakeSource.instances).toEqual([source]); stopKokoro(); await reading;
  });
  it('Stop then Play starts the new reading at its first sentence', async () => {
    vi.useFakeTimers(); FakeSource.autoFinish = false; enableKokoro(); ready();
    const first = speakWithKokoro(['Old first.', 'Old second.'], 'English'); await vi.advanceTimersByTimeAsync(0); stopKokoro(); await first;
    const second = speakWithKokoro(['Current first.', 'Current second.'], 'English'); await vi.advanceTimersByTimeAsync(0);
    expect(FakeSource.instances.filter(source => source.started)).toHaveLength(2);
    expect(FakeWorker.instances[0].sent.filter(message => message.type === 'generate').map(message => message.text)).toEqual(['Old first.','Old second.','Current first.','Current second.']);
    stopKokoro(); await second; expect(vi.getTimerCount()).toBe(0);
  });

  it('queues Resume while the preceding Pause transition is still pending', async () => {
    vi.useFakeTimers(); FakeSource.autoFinish = false; enableKokoro(); ready();
    const reading = speakWithKokoro(['First.', 'Second.'], 'English'); await vi.advanceTimersByTimeAsync(0);
    const context = FakeAudioContext.instances[0];
    context.resume.mockClear();
    context.suspend.mockImplementation(() => new Promise<void>(() => {}));
    pauseKokoro(); expect(context.state).toBe('running');
    resumeKokoro(); expect(context.resume).toHaveBeenCalledOnce();
    stopKokoro(); await reading;
  });
  it('queues a new Play after Stop even while an earlier Pause is still pending', async () => {
    vi.useFakeTimers(); FakeSource.autoFinish = false; enableKokoro(); ready();
    const first = speakWithKokoro(['First.'], 'English'); await vi.advanceTimersByTimeAsync(0);
    const context = FakeAudioContext.instances[0];
    context.suspend.mockImplementation(() => new Promise<void>(() => {}));
    pauseKokoro(); stopKokoro(); await first; context.resume.mockClear();
    const next = speakWithKokoro(['Restart.'], 'English'); await vi.advanceTimersByTimeAsync(0);
    expect(context.resume).toHaveBeenCalledOnce();
    stopKokoro(); await next;
  });

});
