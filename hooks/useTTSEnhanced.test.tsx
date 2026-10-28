import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTTSEnhanced } from './useTTSEnhanced';
import { speakNaturally, stopSpeaking, pauseSpeaking, resumeSpeaking } from '../services/naturalTTS';
import { stopYorubaAudio } from '../services/yorubaAudio';
vi.mock('../services/naturalTTS', () => ({ speakNaturally: vi.fn(), stopSpeaking: vi.fn(), pauseSpeaking: vi.fn(), resumeSpeaking: vi.fn(), speakCelebration: vi.fn(), speakAsMiRa: vi.fn() }));
vi.mock('../services/yorubaAudio', () => ({ playYorubaAudio: vi.fn(), stopYorubaAudio: vi.fn(), pauseYorubaAudio: vi.fn(), resumeYorubaAudio: vi.fn() }));
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); });
const pending = () => {
  let resolve!: () => void; let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
};
describe('enhanced speech lifecycle', () => {
  it('Stop clears busy state and an old completion cannot stop a newer Play', async () => {
    const first = pending(); const second = pending();
    vi.mocked(speakNaturally).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useTTSEnhanced('English'));
    let old!: Promise<void>; act(() => { old = result.current.speak('Old lesson.'); });
    act(() => result.current.cancel()); expect(result.current.isSpeaking).toBe(false); expect(result.current.isLoading).toBe(false); expect(result.current.progress).toBeNull();
    let current!: Promise<void>; act(() => { current = result.current.speak('Current lesson.'); });
    await act(async () => { first.resolve(); await old; }); expect(result.current.isSpeaking).toBe(true);
    await act(async () => { second.resolve(); await current; }); expect(result.current.isSpeaking).toBe(false); expect(result.current.isLoading).toBe(false);
  });
  it('ignores late errors from a cancelled reading', async () => {
    const request = pending(); vi.mocked(speakNaturally).mockReturnValueOnce(request.promise);
    const { result } = renderHook(() => useTTSEnhanced()); let reading!: Promise<void>;
    act(() => { reading = result.current.speak('Lesson.'); }); act(() => result.current.cancel());
    await act(async () => { request.reject(new Error('late provider error')); await reading; });
    expect(result.current.errorMessage).toBeNull(); expect(result.current.isLoading).toBe(false);
  });
  it('Pause and Resume keep the same speech request active', async () => {
    const request = pending(); vi.mocked(speakNaturally).mockReturnValueOnce(request.promise);
    const { result } = renderHook(() => useTTSEnhanced()); let reading!: Promise<void>;
    act(() => { reading = result.current.speak('Same sentence.'); }); act(() => result.current.pause()); expect(result.current.isPaused).toBe(true); expect(pauseSpeaking).toHaveBeenCalledOnce();
    act(() => result.current.resume()); expect(result.current.isPaused).toBe(false); expect(resumeSpeaking).toHaveBeenCalledOnce(); expect(speakNaturally).toHaveBeenCalledOnce();
    act(() => result.current.cancel()); await act(async () => { request.resolve(); await reading; });
  });
  it('stops on a language change and on unmount without allowing late state updates', async () => {
    const request = pending(); vi.mocked(speakNaturally).mockReturnValueOnce(request.promise);
    const { result, rerender, unmount } = renderHook(({language}) => useTTSEnhanced(language), {initialProps:{language:'English'}}); let reading!: Promise<void>;
    act(() => { reading = result.current.speak('Lesson.'); }); vi.mocked(stopSpeaking).mockClear();
    rerender({language:'French'}); expect(stopSpeaking).toHaveBeenCalled(); expect(result.current.isSpeaking).toBe(false); expect(result.current.isLoading).toBe(false);
    vi.mocked(stopSpeaking).mockClear(); unmount(); expect(stopSpeaking).toHaveBeenCalled(); expect(stopYorubaAudio).toHaveBeenCalled();
    await act(async () => { request.resolve(); await reading; });
  });
});
