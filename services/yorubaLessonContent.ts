import type { YorubaAudioEntry } from './yorubaAudio';

/** Select a stable, topic-relevant set from the reviewed R2 pack. */
export const getYorubaLessonEntries = (entries: YorubaAudioEntry[], topic: string, limit = 12): YorubaAudioEntry[] => {
  const normalizedTopic = topic.toLocaleLowerCase();
  return entries
    .filter((entry) => entry.topics?.some((entryTopic) => entryTopic.toLocaleLowerCase() === normalizedTopic))
    .slice(0, limit);
};
