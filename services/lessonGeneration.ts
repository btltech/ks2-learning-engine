import { CURATED_LANGUAGES, getCurriculumUnit, getYearGroupForAge } from '../data/curriculumSequences';
import { Difficulty } from '../types';
import { validateLesson } from './contentValidator';

export const LESSON_MODEL = 'gemini-2.5-flash';
export const LESSON_PROMPT_VERSION = 'ks2-lesson-v3';

export interface LessonRequestContext {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  studentAge: number;
}

const REQUIRED_SECTIONS = [
  'Learning Objective',
  'Key Vocabulary',
  'Teach',
  'Modelled Example',
  'Guided Practice',
  'Independent Check',
] as const;

const SECTION_LOOKUP = new Map(
  REQUIRED_SECTIONS.map((section) => [section.toLowerCase(), section] as const),
);

/**
 * Gemini sometimes follows the requested section names but emits bold or plain
 * numbered labels instead of Markdown headings. Canonicalise only exact known
 * section-label lines so valid lesson content is not rejected for presentation
 * syntax alone.
 */
export function normalizeLessonHeadings(content: string): string {
  const headingPattern = /^\s*(?:#{1,6}\s*)?(?:\d+[.)]\s*)?(?:\*\*|__)?(Learning Objective|Key Vocabulary|Teach|Modelled Example|Guided Practice|Independent Check)(?:\*\*|__)?(?:\s*\([^)]*\))?\s*:?[ \t]*(.*)$/i;

  return content
    .replace(/^```(?:markdown|md)?\s*$/gim, '')
    .replace(/^```\s*$/gim, '')
    .split('\n')
    .flatMap((line) => {
      const match = line.match(headingPattern);
      if (!match) return [line];
      const canonical = SECTION_LOOKUP.get(match[1].toLowerCase());
      if (!canonical) return [line];
      const remainder = match[2].trim();
      return remainder ? [`# ${canonical}`, remainder] : [`# ${canonical}`];
    })
    .join('\n')
    .trim();
}

function subjectInstructions(subject: string, studentAge: number): string {
  const subjectLower = subject.toLowerCase();
  const languageSubjects = CURATED_LANGUAGES.map((language) => language.toLowerCase());
  let instructions = '';

  if (subjectLower === 'computing' || subjectLower === 'coding') {
    instructions = "For Computing, ensure 'Teach' and 'Modelled Example' include a short Python or Scratch-style example where appropriate, and explain how it works.";
  } else if (languageSubjects.includes(subjectLower)) {
    instructions = "For Languages, 'Key Vocabulary' must include the foreign word, a simple pronunciation guide in brackets, and English meaning. 'Teach' should focus on short useful phrases and usage, with one accurately modelled exchange.";
    if (subjectLower === 'yoruba') {
      instructions += ' Use standard Yoruba orthography, including underdots and tone marks (for example: Ẹ ṣé, ọmọ, ìyá). Explain that tone changes meaning and never replace Yoruba letters with approximate English spelling.';
    } else if (subjectLower === 'romanian') {
      instructions += ' Use Romanian diacritics accurately (ă, â, î, ș, ț) and model natural Romanian word order.';
    } else if (subjectLower === 'mandarin') {
      instructions += ' Use simplified Chinese characters with accurate Hanyu Pinyin and tone marks. Do not replace tones with English-style spellings.';
    } else if (subjectLower === 'japanese') {
      instructions += ' Use age-appropriate Japanese script, give accurate kana readings for new kanji, and distinguish polite forms from casual forms.';
    } else if (subjectLower === 'korean') {
      instructions += ' Use accurate Hangul and natural polite Korean. Do not rely on approximate English spelling when Hangul can be shown.';
    }
  } else if (subjectLower === 'maths' || subjectLower === 'mathematics') {
    instructions = "For Maths, 'Modelled Example' must show concise step-by-step working.";
  } else if (subjectLower === 'science') {
    instructions = 'For Science, distinguish evidence from explanation and include a safe observation or enquiry step. Never instruct a child to handle hazardous materials.';
  } else if (subjectLower === 'history') {
    instructions = 'For History, establish chronology and explain how evidence supports claims. Do not present legends or contested interpretations as settled fact.';
  } else if (subjectLower === 'geography') {
    instructions = 'For Geography, use a real place or map skill and distinguish human from physical processes.';
  } else if (subjectLower === 'art') {
    instructions = 'For Art, teach one observable technique, prompt a short sketchbook experiment, and treat the creative outcome as unscored.';
  } else if (subjectLower === 'music') {
    instructions = 'For Music, include a safe listening, clapping or performance task; describe rhythm or pitch precisely and do not claim to assess a performance the app cannot hear.';
  } else if (subjectLower === 'pe') {
    instructions = 'For PE, act as a knowledge companion: explain safe technique and reflection, require suitable space and adult or teacher supervision where relevant, and never diagnose injury.';
  } else if (subjectLower === 'd&t' || subjectLower === 'design & technology') {
    instructions = 'For Design & Technology, connect user need, design criteria, making and evaluation. Any tools, heat, food or electrical work must follow the published safety note and appropriate supervision.';
  } else if (subjectLower === 'religious education') {
    instructions = 'For Religious Education, use respectful, accurate and age-appropriate language. Present religious and non-religious worldviews without treating any belief claim as universally accepted fact, distinguish belief from historical evidence, and encourage reasoned comparison rather than devotion.';
  }

  const isYear6 = getYearGroupForAge(studentAge) === 6;
  if (isYear6 && (subjectLower === 'maths' || subjectLower === 'mathematics')) {
    instructions += `
SATs FOCUS (Year 6):
- Align with KS2 SATs Arithmetic and Reasoning papers.
- 'Teach' MUST include a specific "SATs Tip" (for example, "Remember to check units!" or "Show your working").
- Practice and check tasks should mirror SATs question styles.
- Emphasise formal written methods where applicable.`;
  } else if (isYear6 && (subjectLower === 'english' || subjectLower === 'literacy')) {
    instructions += `
SATs FOCUS (Year 6):
- Align with KS2 SATs Reading and GPS (SPaG) papers.
- 'Key Vocabulary' MUST include formal grammatical terms when relevant.
- 'Teach' MUST include a short SATs tip.
- Practice and check tasks should mirror SATs question styles.`;
  }

  return instructions;
}

export function buildLessonPrompt(context: LessonRequestContext): string {
  const { subject, topic, difficulty, studentAge } = context;
  const curriculumUnit = getCurriculumUnit(subject, topic, studentAge);
  if (!curriculumUnit) {
    throw new Error('Lesson request is not part of the published KS2 curriculum');
  }

  return `You are MiRa, an AI tutor for KS2 students (ages 7–11).
Create a SHORT KS2 lesson for the published curriculum unit '${curriculumUnit.title}' in the subject '${curriculumUnit.subject}'.
The learner is in Year ${getYearGroupForAge(studentAge)} and the support level is ${difficulty}.

PUBLISHED LEARNING OBJECTIVE (do not replace or broaden it):
${curriculumUnit.objective}
${curriculumUnit.practicalNote ? `\nSAFETY / PRACTICAL LIMIT: ${curriculumUnit.practicalNote}` : ''}

Make the lesson compact and engaging. It must explicitly teach, model, practise and check the objective.

STRICT FORMAT (use these exact Markdown heading lines, with no numbering and no extra sections):
# Learning Objective
# Key Vocabulary
# Teach
# Modelled Example
# Guided Practice
# Independent Check

Under those headings include, respectively: one short objective sentence; 3–6 vocabulary words with very short meanings; 2–4 teaching sentences; one concise worked example with visible reasoning; one short guided task with a hint; and one short independent task that directly checks the objective.

RULES:
- Use friendly, clear, calm language – not babyish and not over-excited.
- Keep everything as short as possible while still clear.
- Use exactly one small modelled example.
- Tasks must be answerable by KS2 children without extra resources.
- Avoid long lists, big blocks of text and repeated information.
${subjectInstructions(subject, studentAge)}
- Do not add introductions, unrelated facts or closing speeches outside the headings.

Output clean markdown with exactly those 6 headings.`;
}

export function validateGeneratedLessonContent(content: string) {
  const normalizedContent = normalizeLessonHeadings(content);
  const validation = validateLesson(normalizedContent);
  const missingSections = REQUIRED_SECTIONS.filter((section) => {
    const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return !new RegExp(`^#{1,3}\\s*${escaped}\\s*$`, 'im').test(normalizedContent);
  });
  const issues = [
    ...validation.issues,
    ...missingSections.map((section) => `Lesson is missing the required ${section} heading`),
  ];
  return {
    ...validation,
    isValid: issues.length === 0,
    issues,
    sanitizedContent: normalizedContent,
  };
}
