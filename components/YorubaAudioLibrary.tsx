import React, { useEffect, useMemo, useState } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { getYorubaAudioEntries, playYorubaAudio, stopYorubaAudio, type YorubaAudioEntry } from '../services/yorubaAudio';
import { PageShell } from './layout/AppShells';
import LoadingSpinner from './LoadingSpinner';

interface YorubaAudioLibraryProps {
  onBack: () => void;
}

const searchableText = (value: string) => value
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .toLocaleLowerCase()
  .trim();

const simplifiedSearchText = (value: string) => searchableText(value)
  .replace(/([aeiou])\1+/gu, '$1');

export const filterYorubaEntries = (
  entries: YorubaAudioEntry[],
  query: string,
  category: string,
) => {
  const normalizedQuery = searchableText(query);
  const simplifiedQuery = simplifiedSearchText(query);
  return entries.filter((entry) => {
    const matchesCategory = !category || entry.category === category || entry.topics?.includes(category);
    const entryText = `${entry.text} ${entry.english || ''}`;
    const matchesQuery = !normalizedQuery
      || searchableText(entryText).includes(normalizedQuery)
      || simplifiedSearchText(entryText).includes(simplifiedQuery);
    return matchesCategory && matchesQuery;
  });
};

const YorubaAudioLibrary: React.FC<YorubaAudioLibraryProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<YorubaAudioEntry[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingHash, setPlayingHash] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getYorubaAudioEntries()
      .then((loadedEntries) => {
        if (active) setEntries(loadedEntries);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'The audio library is unavailable right now.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      stopYorubaAudio();
    };
  }, []);

  useEffect(() => setVisibleCount(60), [query, category]);

  const categories = useMemo(() => Array.from(new Set<string>(
    entries.flatMap((entry) => [entry.category, ...(entry.topics || [])]).filter((value): value is string => Boolean(value)),
  )).sort((a, b) => a.localeCompare(b)), [entries]);
  const filteredEntries = useMemo(() => filterYorubaEntries(entries, query, category), [entries, query, category]);
  const visibleEntries = filteredEntries.slice(0, visibleCount);

  const playEntry = async (entry: YorubaAudioEntry) => {
    stopYorubaAudio();
    setPlayingHash(entry.hash);
    setError('');
    try {
      const played = await playYorubaAudio(entry.text);
      if (!played) setError('That recording could not be played. Please try again.');
    } catch {
      setError('That recording could not be played. Please check your connection.');
    } finally {
      setPlayingHash(null);
    }
  };

  return (
    <PageShell
      title="Yorùbá Audio Library"
      subtitle={`${entries.length || 450} reviewed words and phrases with English translations`}
      icon="🔊"
      onBack={onBack}
      backLabel="Back to Yorùbá topics"
      maxWidth="6xl"
      tone="purple"
    >
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_16rem]">
          <div>
            <label htmlFor="yoruba-library-search" className="mb-1 block text-sm font-bold text-gray-700">Search Yorùbá or English</label>
            <input
              id="yoruba-library-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="For example: family, ọjọ́, school…"
              className="min-h-11 w-full rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            />
          </div>
          <div>
            <label htmlFor="yoruba-library-category" className="mb-1 block text-sm font-bold text-gray-700">Topic</label>
            <select
              id="yoruba-library-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-gray-300 px-3 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              <option value="">All topics</option>
              {categories.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600" role="status" aria-live="polite">
          <span>{filteredEntries.length} {filteredEntries.length === 1 ? 'recording' : 'recordings'} found</span>
          <span>Audio is served from the reviewed library, not browser or Google speech.</span>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</div>}
      {loading ? (
        <LoadingSpinner message="Loading the Yorùbá audio library…" />
      ) : visibleEntries.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center text-gray-600 shadow-sm">No matching word or phrase was found.</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEntries.map((entry) => (
              <button
                key={entry.hash}
                type="button"
                onClick={() => void playEntry(entry)}
                disabled={playingHash !== null}
                className="flex min-h-24 items-start justify-between gap-3 rounded-xl border border-emerald-100 bg-white p-4 text-left shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                aria-label={`Play ${entry.text}: ${entry.english || 'English translation unavailable'}`}
              >
                <span>
                  <span className="block text-lg font-bold text-gray-900">{entry.text}</span>
                  <span className="mt-1 block text-sm text-gray-600">{entry.english || 'English translation unavailable'}</span>
                  {entry.category && <span className="mt-2 inline-block rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700">{entry.category}</span>}
                </span>
                <SpeakerWaveIcon className={`mt-1 h-6 w-6 shrink-0 text-emerald-700 ${playingHash === entry.hash ? 'animate-pulse' : ''}`} aria-hidden="true" />
              </button>
            ))}
          </div>
          {visibleCount < filteredEntries.length && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setVisibleCount((count) => count + 60)} className="min-h-11 rounded-xl bg-emerald-700 px-6 font-bold text-white hover:bg-emerald-800">
                Show 60 more
              </button>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
};

export default YorubaAudioLibrary;
