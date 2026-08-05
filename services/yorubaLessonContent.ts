import type { YorubaAudioEntry } from './yorubaAudio';

const TOPIC_TERMS: Record<string, readonly string[]> = {
  'greetings and introductions': ['morning', 'afternoon', 'evening', 'name', 'how are', 'please', 'sorry', 'welcome', 'goodbye'],
  'alphabet and pronunciation': ['listen', 'sound', 'tone', 'syllable', 'say it again'],
  'numbers and age': ['one', 'two', 'three', 'five', 'ten', 'age', 'old', 'number', 'books'],
  'colours and classroom objects': ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'book', 'chair'],
  'family and people': ['mother', 'father', 'family', 'child', 'sibling', 'uncle', 'aunt', 'cousin', 'friend'],
  'body and health': ['body', 'head', 'eye', 'arm', 'hand', 'leg', 'health', 'illness', 'doctor'],
  'food and preferences': ['food', 'rice', 'water', 'yam', 'beans', 'meat', 'fish', 'eat', 'drink', 'like'],
  'school and daily routine': ['school', 'teacher', 'student', 'study', 'book', 'classroom', 'help'],
  'home and everyday objects': ['house', 'home', 'room', 'chair', 'sofa', 'table', 'bed', 'kitchen'],
  clothing: ['clothes', 'wearing', 'shirt', 'trousers', 'dress', 'shoes', 'hat'],
  'animals and nature': ['animal', 'dog', 'cat', 'sheep', 'chicken', 'bird', 'fish', 'lion', 'tree', 'flower'],
  'weather and seasons': ['rain', 'wind', 'weather', 'season', 'hot', 'cold', 'sunny'],
  'time and calendar': ['today', 'tomorrow', 'yesterday', 'month', 'january', 'monday', 'time', 'clock'],
  'transport and road safety': ['road', 'car', 'bus', 'bicycle', 'walk', 'cross', 'driver'],
  'shopping and money': ['price', 'money', 'market', 'buy', 'sell', 'how much'],
  'hobbies and free time': ['music', 'football', 'dance', 'reading', 'draw', 'swim', 'sport'],
  'community and public places': ['doctor', 'hospital', 'police', 'fire', 'library', 'market', 'help'],
  'yoruba culture and identity': ['culture', 'traditional', 'festival', 'clothing', 'music', 'food', 'elder'],
  'conversations and opinions': ['like', 'because', 'what', 'who', 'when', 'yes', 'no'],
  'grammar and sentence patterns': ['you', 'they', 'and', 'but', 'because'],
  'reading short texts': ['read', 'story', 'picture', 'school', 'today'],
  'reading stories, poems and songs': ['read', 'story', 'poem', 'music', 'song'],
  'listening and dictation': ['listen', 'hear', 'say it again', 'please listen'],
  'speaking and presentations': ['talk', 'say', 'describe', 'name', 'please listen'],
  'writing connected sentences': ['write', 'sentence', 'copy', 'school', 'home'],
};

const scoreEntry = (entry: YorubaAudioEntry, terms: readonly string[]) => {
  const english = (entry.english || '').toLocaleLowerCase();
  return terms.reduce((score, term) => score + (english.includes(term) ? term.length : 0), 0);
};

/** Select a stable, topic-relevant set from the reviewed R2 pack. */
export const getYorubaLessonEntries = (entries: YorubaAudioEntry[], topic: string, limit = 12): YorubaAudioEntry[] => {
  const terms = TOPIC_TERMS[topic.toLocaleLowerCase()] || [];
  const ranked = entries
    .map((entry, index) => ({ entry, index, score: scoreEntry(entry, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ entry }) => entry);

  // Every curriculum unit must remain usable even where the pack has fewer
  // exact English-keyword matches. Rotate the reviewed pack deterministically.
  const offset = [...topic].reduce((total, character) => total + character.charCodeAt(0), 0) % Math.max(entries.length, 1);
  const fallback = entries.slice(offset).concat(entries.slice(0, offset));
  return [...ranked, ...fallback.filter((entry) => !ranked.some((match) => match.hash === entry.hash))].slice(0, limit);
};
