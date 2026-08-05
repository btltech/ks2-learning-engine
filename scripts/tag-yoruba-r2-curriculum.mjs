#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packPath = path.join(root, 'audio/yoruba/r2-pack-curated-450/manifest.json');
const sourcePath = path.join(root, 'data/audio/yoruba-audio-manifest.json');
const reviewedPath = path.join(root, 'data/reviewedLanguageContent.ts');

const normalize = (value) => value.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('yo-NG');
const publishedTopic = (topic) => ({
  'Days of the week': 'Time and calendar',
  'Months of the year': 'Time and calendar',
  'Listening and pronunciation': 'Alphabet and pronunciation',
  'Language patterns and grammar': 'Grammar and sentence patterns',
}[topic] || topic);

const semanticRules = {
  'Greetings and introductions': ['hello', 'greeting', 'good morning', 'good afternoon', 'good evening', 'good day', 'how are', 'fine', 'well', 'welcome', 'goodbye', 'please', 'thank', 'sorry', 'excuse', 'name', 'come from', 'visitor', 'guest'],
  'Alphabet and pronunciation': ['alphabet', 'letter', 'vowel', 'consonant', 'underdot', 'tone', 'syllable', 'sound', 'pronounce', 'say it again', 'open e', 'open o'],
  'Numbers and age': ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'hundred', 'number', 'count', 'arithmetic', 'maths', 'years old', 'age'],
  'Colours and classroom objects': ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink', 'brown', 'colour', 'book', 'paper', 'pen', 'pencil', 'file', 'classroom', 'arts'],
  'Family and people': ['mother', 'father', 'parent', 'child', 'family', 'sibling', 'brother', 'sister', 'grandmother', 'grandfather', 'uncle', 'aunt', 'cousin', 'husband', 'wife', 'friend', 'person', 'people', 'human', 'boy', 'girl', 'male', 'female'],
  'Body and health': ['body', 'head', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'teeth', 'hair', 'hand', 'arm', 'leg', 'foot', 'feet', 'heart', 'liver', 'health', 'illness', 'sick', 'doctor', 'nurse', 'hospital', 'medicine', 'toothbrush', 'deodorant'],
  'Food and preferences': ['food', 'meal', 'rice', 'water', 'yam', 'beans', 'meat', 'fish', 'fruit', 'vegetable', 'corn', 'peanut', 'plantain', 'fritter', 'pap', 'bread', 'drink', 'eat', 'cook', 'palm wine', 'pork', 'like', 'dislike'],
  'School and daily routine': ['school', 'teacher', 'student', 'study', 'lesson', 'degree', 'education', 'classroom', 'subject', 'homework', 'university', 'college', 'help me'],
  'Home and everyday objects': ['house', 'home', 'room', 'chair', 'sofa', 'table', 'bed', 'kitchen', 'bathroom', 'door', 'window', 'furniture', 'household', 'towel'],
  Clothing: ['clothes', 'clothing', 'wear', 'shirt', 'trousers', 'dress', 'shoe', 'hat', 'cloth', 'fabric', 'formal wear', 'wrap-around', 'tie-dy', 'waist'],
  'Animals and nature': ['animal', 'dog', 'cat', 'sheep', 'chicken', 'bird', 'fish', 'lion', 'goat', 'cow', 'horse', 'elephant', 'pig', 'ram', 'guinea fowl', 'tree', 'flower', 'river', 'mountain', 'nature', 'environment', 'palm tree'],
  'Weather and seasons': ['weather', 'rain', 'wind', 'cloud', 'sun', 'sunny', 'hot', 'cold', 'season', 'harmattan'],
  'Time and calendar': ['time', 'clock', 'wristwatch', 'today', 'tomorrow', 'yesterday', 'day', 'week', 'month', 'year', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  'Transport and road safety': ['transport', 'road', 'car', 'bus', 'bicycle', 'bike', 'walk', 'cross', 'driver', 'truck', 'travel', 'stop'],
  'Places and directions': ['where', 'place', 'area', 'neighborhood', 'near', 'far', 'left', 'right', 'direction', 'location', 'city', 'town', 'village', 'go to', 'come to'],
  'Shopping and money': ['shop', 'shopping', 'market', 'money', 'price', 'cost', 'buy', 'sell', 'goods', 'sale', 'how much'],
  'Hobbies and free time': ['hobby', 'football', 'soccer', 'basketball', 'ball', 'sport', 'athletics', 'run', 'swim', 'music', 'dance', 'draw', 'game', 'play with me', 'reading'],
  'Community and public places': ['community', 'police', 'firefighter', 'library', 'post office', 'hospital', 'doctor', 'teacher', 'referee', 'council', 'healer', 'psychiatrist', 'podiatrist', 'optometrist', 'pediatrician', 'occupation', 'profession'],
  'Yoruba culture and identity': ['yoruba', 'culture', 'traditional', 'tradition', 'festival', 'elder', 'proverb', 'respect', 'name', 'tie-dy', 'mat weaving'],
  'Conversations and opinions': ['question', 'ask', 'answer', 'yes', 'no', 'what', 'who', 'when', 'why', 'how', 'opinion', 'because', 'explain', 'describe', 'common expression'],
  'Reading short texts': ['read', 'text', 'story', 'dialogue', 'passage', 'picture', 'word', 'example'],
  'Reading stories, poems and songs': ['story', 'poem', 'song', 'music'],
  'Listening and dictation': ['listen', 'hear', 'quiet', 'dictation', 'say it again'],
  'Speaking and presentations': ['speak', 'talk', 'say', 'presentation', 'describe', 'listen to me'],
  'Writing connected sentences': ['write', 'copy', 'sentence', 'paragraph', 'paper', 'and', 'but', 'then', 'because'],
};

const hasTerm = (english, term) => {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'i').test(english);
};

const reviewedTopicsByText = new Map();
const reviewedSource = fs.readFileSync(reviewedPath, 'utf8');
const sourceFile = ts.createSourceFile(reviewedPath, reviewedSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
for (const statement of sourceFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (declaration.name.getText(sourceFile) !== 'YORUBA' || !ts.isObjectLiteralExpression(declaration.initializer)) continue;
    for (const topicProperty of declaration.initializer.properties) {
      if (!ts.isPropertyAssignment(topicProperty) || !ts.isObjectLiteralExpression(topicProperty.initializer)) continue;
      const topic = publishedTopic(topicProperty.name.text);
      const words = topicProperty.initializer.properties.find((property) => ts.isPropertyAssignment(property) && property.name.getText(sourceFile) === 'words');
      if (!words || !ts.isPropertyAssignment(words) || !ts.isArrayLiteralExpression(words.initializer)) continue;
      for (const tuple of words.initializer.elements) {
        if (!ts.isArrayLiteralExpression(tuple) || tuple.elements.length === 0 || !ts.isStringLiteralLike(tuple.elements[0])) continue;
        const key = normalize(tuple.elements[0].text);
        const topics = reviewedTopicsByText.get(key) || new Set();
        topics.add(topic);
        reviewedTopicsByText.set(key, topics);
      }
    }
  }
}

const sourceManifest = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const metadataByText = new Map(sourceManifest.entries.map((entry) => [normalize(entry.text), entry]));
const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));

for (const entry of pack.entries) {
  const key = normalize(entry.text);
  const metadata = metadataByText.get(key) || {};
  const topics = new Set(reviewedTopicsByText.get(key) || []);
  const english = (entry.english || metadata.english || '').toLocaleLowerCase('en-GB');
  for (const [topic, terms] of Object.entries(semanticRules)) {
    if (terms.some((term) => hasTerm(english, term))) topics.add(topic);
  }

  if (topics.size === 0) {
    const category = metadata.category || '';
    if (/^(Verbs|Verb Phrases|Adjectives|Adverbs|Conjunctions)$/i.test(category)) {
      topics.add('Grammar and sentence patterns');
      topics.add('Writing connected sentences');
    } else if (/Interrogatives|Other Expressions/i.test(category)) {
      topics.add('Conversations and opinions');
      topics.add('Speaking and presentations');
    } else if (/Nouns|Noun Phrases/i.test(category)) {
      topics.add('Reading short texts');
      topics.add('Writing connected sentences');
    } else {
      topics.add('Listening and dictation');
      topics.add('Speaking and presentations');
    }
  }

  entry.category = metadata.category || entry.category || 'reviewed-audio';
  entry.source = metadata.source || entry.source || 'curated-450';
  entry.topics = [...topics].sort();
}

pack.schemaVersion = 2;
pack.curriculumTaggedAt = new Date().toISOString();
fs.writeFileSync(packPath, `${JSON.stringify(pack, null, 2)}\n`);

const coverage = new Map();
for (const entry of pack.entries) for (const topic of entry.topics) coverage.set(topic, (coverage.get(topic) || 0) + 1);
console.log(JSON.stringify({
  total: pack.entries.length,
  tagged: pack.entries.filter((entry) => entry.topics.length > 0).length,
  coverage: Object.fromEntries([...coverage].sort(([a], [b]) => a.localeCompare(b))),
}, null, 2));
