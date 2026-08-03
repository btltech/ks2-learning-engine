import { describe, expect, it } from 'vitest';
import { getCloudSubjectAliases, getCloudTopicAliases } from './questionTopicAliases';

describe('cloud question topic mappings', () => {
  it('maps every existing Yoruba and Romanian topic family into published lessons', () => {
    expect(getCloudTopicAliases('Yoruba', 'Yoruba: Greetings')).toEqual(expect.arrayContaining([
      'Greetings', "Let's say hello and goodbye in Yoruba!", 'My Name Is...',
    ]));
    expect(getCloudTopicAliases('Yoruba', 'Yoruba: Writing')).toContain('Building sentences: Making simple Yoruba sentences.');
    expect(getCloudTopicAliases('Romanian', 'Romanian: Greetings')).toContain('Introducing Myself: Say your name and ask someone theirs. "My name is...".');
  });

  it('publishes the additional language and RE banks without mixing them together', () => {
    expect(getCloudTopicAliases('Mandarin', 'Mandarin: Vocabulary')).toContain('My Favourite Foods');
    expect(getCloudTopicAliases('Japanese', 'Japanese: Greetings')).toContain('Self-Introduction');
    expect(getCloudTopicAliases('Korean', 'Korean: Greetings')).toContain('Hello and Goodbye! (인사해요!)');
    expect(getCloudTopicAliases('Religious Education', 'Sikhism')).toContain('Langar: Sharing and caring in Sikhism.');
    expect(getCloudSubjectAliases('PSHE')).toEqual(['PSHE', 'Citizenship']);
  });

  it('routes generic language-skills records to English rather than a named language', () => {
    expect(getCloudSubjectAliases('English')).toEqual(['English', 'Languages']);
    expect(getCloudSubjectAliases('Yoruba')).toEqual(['Yoruba']);
    expect(getCloudTopicAliases('English', 'Reading Comprehension')).toContain('Vocabulary');
  });
});

