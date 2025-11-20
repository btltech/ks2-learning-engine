import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as coqui from './coquiTTS';

describe('coquiTTS', () => {
  let originalWorker: any;
  let originalCreateObjectURL: any;

  beforeEach(() => {
    originalWorker = (globalThis as any).Worker;
    originalCreateObjectURL = URL.createObjectURL;
  });

  afterEach(() => {
    (globalThis as any).Worker = originalWorker;
    URL.createObjectURL = originalCreateObjectURL;
    coqui.resetCoquiTTS();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retries worker initialization when constructor throws first, then succeeds', async () => {
    let calls = 0;
    (globalThis as any).Worker = function MockWorker() {
      calls++;
      if (calls === 1) {
        throw new Error('Worker init fail');
      }
      // Return an object mimicking the Worker API
      return {
        onmessage: null,
        addEventListener: (name: string, cb: any) => { this.onmessage = cb; },
        removeEventListener: () => {},
        postMessage: () => {},
        terminate: () => {}
      } as any;
    };

    const first = await coqui.initCoquiTTS();
    expect(first).toBe(false);

    const second = await coqui.initCoquiTTS();
    expect(second).toBe(true);
  });

  it('generateCoquiAudio resolves to blob URL when worker sends complete', async () => {
    // Mock Worker to call onmessage post
    const listeners: any = {};
    (globalThis as any).Worker = function MockWorker() {
      const obj: any = { onmessage: null };
      obj.addEventListener = (name: string, cb: any) => { obj.onmessage = cb; };
      obj.removeEventListener = () => { obj.onmessage = null; };
      obj.terminate = () => {};
      obj.postMessage = (msg: any) => {
        setTimeout(() => {
          if (typeof obj.onmessage === 'function') obj.onmessage({ data: { type: 'complete', buffer: new ArrayBuffer(16) } });
        }, 0);
      };
      return obj as any;
    };

    URL.createObjectURL = (blob: any) => 'blob:test';
    const url = await coqui.generateCoquiAudio('Hello');
    expect(url).toBe('blob:test');
  });

  it('timed out generateCoquiAudio returns null and triggers error', async () => {
    // Mock Worker which does not send messages
    (globalThis as any).Worker = function MockWorker() {
      return {
        addEventListener: (_name: string, _cb: any) => {},
        removeEventListener: () => {},
        postMessage: () => {},
        terminate: () => {}
      } as any;
    };

    const errors: string[] = [];
    const unsub = coqui.onError((e) => errors.push(e));
    
    // Initialize first so generateCoquiAudio doesn't await init
    await coqui.initCoquiTTS();

    vi.useFakeTimers();
    const p = coqui.generateCoquiAudio('Slow network');
    vi.advanceTimersByTime(30000 + 100); // advance past the timeout
    const url = await p;
    expect(url).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
    unsub();
  });

  it('passes selected speaker index to worker when provided', async () => {
    let postedMessages: any[] = [];
    (globalThis as any).Worker = function MockWorker() {
      return {
        addEventListener: (n: string, cb: any) => {},
        removeEventListener: () => {},
        terminate: () => {},
        postMessage: (msg: any) => { postedMessages.push(msg); }
      } as any;
    };
    (globalThis as any).Worker = function MockWorker() {
      const obj: any = { onmessage: null };
      obj.addEventListener = (name: string, cb: any) => { obj.onmessage = cb; };
      obj.removeEventListener = () => { obj.onmessage = null; };
      obj.terminate = () => {};
      obj.postMessage = (msg: any) => {
        postedMessages.push(msg);
        setTimeout(() => {
          if (typeof obj.onmessage === 'function') obj.onmessage({ data: { type: 'complete', buffer: new ArrayBuffer(16) } });
        }, 0);
      };
      return obj as any;
    };
    // Set a speaker index
    coqui.setSpeakerIndex(2);
    URL.createObjectURL = (blob: any) => 'blob:test2';
    await coqui.generateCoquiAudio('Testing speaker');
    expect(postedMessages.length).toBeGreaterThan(0);
    const msg = postedMessages.find(m => m.type === 'speak');
    expect(msg).toBeTruthy();
    expect(msg.speakerIndex).toBe(2);
  });
});
