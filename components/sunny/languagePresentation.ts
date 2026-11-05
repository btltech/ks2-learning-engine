/** Language tags for presentation; audio routing remains in the existing services. */
const languageTags: Record<string, string> = {
  French: 'fr', Spanish: 'es', German: 'de', Welsh: 'cy', Yoruba: 'yo',
  Romanian: 'ro', Mandarin: 'zh', Japanese: 'ja', Korean: 'ko', English: 'en',
};

export const languageTag = (language: string): string | undefined => languageTags[language];
