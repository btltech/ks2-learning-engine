// Content validation utilities for AI-generated content

import { QuestionType, CognitiveLevel } from '../types';

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  sanitizedContent?: string;
}

// Valid question types and cognitive levels
const VALID_QUESTION_TYPES = Object.values(QuestionType);
const VALID_COGNITIVE_LEVELS = Object.values(CognitiveLevel);

// Comprehensive list of inappropriate words/phrases for children's content
// IMPORTANT: Only block truly harmful content, not educational topics
// Categories: graphic violence, adult content, hate speech, self-harm, illegal drugs
const inappropriateKeywords = [
  // Graphic violence & weapons (educational history/safety content is OK)
  'murder', 'dead body', 'gore', 'stab', 'knife attack', 'torture', 
  'strangle', 'suffocate', 'decapitate', 'dismember', 'slaughter',
  
  // Adult/sexual content
  'sex', 'sexual', 'naked', 'nude', 'porn', 'explicit', 'erotic', 'xxx',
  'adult content', 'intercourse', 'genitals', 'breasts', 'buttocks',
  
  // Hate speech & discrimination (but allow educational discussion of racism/discrimination)
  'hate speech', 'nazi', 'supremacist', 'bigot',
  
  // Illegal drugs (allow educational content about medicine/health)
  'cocaine', 'heroin', 'meth', 'crack', 'drug abuse', 'overdose',
  'get high', 'illegal drugs', 'drug dealer',
  
  // Self-harm & dangerous activities
  'suicide', 'self-harm', 'cut yourself', 'hurt yourself', 'kill yourself',
  'starve yourself',
  
  // Profanity (severe only - mild terms removed for educational context)
  'f**k', 'sh*t', 'a**hole', 'b*tch'
];

// Patterns that indicate truly harmful content (not educational)
const problematicPatterns = [
  /\b(how to )(murder|kill someone|harm others)/i,
  /\bsecretly\s+(poison|harm|kill)/i,
  /\b(hate|kill)\s+(all|every)\s+\w+/i,
  /\b(shouldn't|don't deserve to)\s+(live|exist)/i,
  /\b(how to make)\s+(bomb|weapon|explosive)/i,
];

// Validate that content is appropriate for children
export const validateContentForChildren = (content: string): ValidationResult => {
  const issues: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check for inappropriate keywords
  for (const keyword of inappropriateKeywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      issues.push(`Content contains potentially inappropriate term: "${keyword}"`);
    }
  }

  // Check for problematic patterns
  for (const pattern of problematicPatterns) {
    if (pattern.test(content)) {
      issues.push('Content contains a potentially harmful pattern');
    }
  }

  // Check content length is reasonable
  if (content.length < 50) {
    issues.push('Content is too short to be meaningful');
  }

  if (content.length > 10000) {
    issues.push('Content is excessively long');
  }

  // Check for excessive punctuation (potential spam/abuse)
  const exclamationCount = (content.match(/!/g) || []).length;
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  
  if (exclamationCount > 10) {
    issues.push('Content has excessive exclamation marks');
  }
  
  if (capsRatio > 0.5 && content.length > 20) {
    issues.push('Content has excessive capital letters (shouting)');
  }

  return {
    isValid: issues.length === 0,
    issues,
    sanitizedContent: content
  };
};

// Validate quiz questions
export const validateQuizQuestion = (question: any): ValidationResult => {
  const issues: string[] = [];

  // Check required fields
  if (!question.question || typeof question.question !== 'string') {
    issues.push('Question text is missing or invalid');
  }

  // Validate question type (default to multiple-choice if not specified)
  const questionType = question.questionType || QuestionType.MultipleChoice;
  if (question.questionType && !VALID_QUESTION_TYPES.includes(questionType)) {
    issues.push(`Invalid question type: ${question.questionType}`);
  }

  // Validate cognitive level if specified
  if (question.cognitiveLevel && !VALID_COGNITIVE_LEVELS.includes(question.cognitiveLevel)) {
    issues.push(`Invalid cognitive level: ${question.cognitiveLevel}`);
  }

  // Type-specific validation
  switch (questionType) {
    case QuestionType.TrueFalse: {
      // True/False should have exactly 2 options
      if (!Array.isArray(question.options) || question.options.length !== 2) {
        issues.push('True/False questions must have exactly 2 options');
      }
      // Options should be True and False
      const tfOptions = question.options?.map((o: string) => o.toLowerCase()) || [];
      if (!tfOptions.includes('true') || !tfOptions.includes('false')) {
        issues.push('True/False options must be "True" and "False"');
      }
      break;
    }

    case QuestionType.FillInBlank:
      // Fill-in-blank needs correct answer and optionally acceptable alternatives
      if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
        issues.push('Fill-in-blank questions need a correct answer');
      }
      // Question should contain a blank indicator
      if (question.question && !question.question.includes('___') && !question.question.includes('_____')) {
        issues.push('Fill-in-blank questions should contain blank indicator (_____)');
      }
      break;

    case QuestionType.Ordering:
      // Ordering needs options and correct order
      if (!Array.isArray(question.options) || question.options.length < 3) {
        issues.push('Ordering questions must have at least 3 items to order');
      }
      if (!Array.isArray(question.correctOrder) || question.correctOrder.length !== question.options?.length) {
        issues.push('Ordering questions must have correctOrder matching options length');
      }
      break;

    case QuestionType.MultipleChoice:
    default:
      // Standard multiple choice validation
      if (!Array.isArray(question.options) || question.options.length < 2) {
        issues.push('Must have at least 2 options');
      }
      if (question.options && question.options.length > 6) {
        issues.push('Too many options (max 6)');
      }
      if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
        issues.push('Correct answer is missing or invalid');
      }
      // Validate correct answer is in options
      if (question.correctAnswer && question.options && !question.options.includes(question.correctAnswer)) {
        issues.push('Correct answer must be one of the options');
      }
      break;
  }

  // Check for duplicate options (for types that use options)
  if (question.options && questionType !== QuestionType.FillInBlank) {
    const uniqueOptions = new Set(question.options);
    if (uniqueOptions.size !== question.options.length) {
      issues.push('Quiz has duplicate options');
    }
  }

  // Validate content appropriateness
  const contentCheck = validateContentForChildren(
    JSON.stringify(question)
  );
  
  if (!contentCheck.isValid) {
    issues.push(...contentCheck.issues);
  }

  if (issues.length > 0) {
    console.log('Validation failed for question:', JSON.stringify(question).substring(0, 100) + '...', issues);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

// Validate topics list
export const validateTopicsList = (topics: string[]): ValidationResult => {
  const issues: string[] = [];

  if (!Array.isArray(topics)) {
    issues.push('Topics must be an array');
  }

  if (topics.length === 0) {
    issues.push('Topics list is empty');
  }

  if (topics.length > 20) {
    issues.push('Too many topics (max 20)');
  }

  // Check each topic
  topics.forEach((topic, index) => {
    if (typeof topic !== 'string' || topic.trim().length === 0) {
      issues.push(`Topic ${index + 1} is invalid or empty`);
    }

    if (topic.length > 100) {
      issues.push(`Topic ${index + 1} is too long`);
    }

    // Check for inappropriate keywords directly instead of using validateContentForChildren
    // because validateContentForChildren enforces a minimum length of 50 which is too long for topics
    const lowerTopic = topic.toLowerCase();
    for (const keyword of inappropriateKeywords) {
      if (lowerTopic.includes(keyword)) {
        issues.push(`Topic ${index + 1} contains potentially inappropriate keyword: ${keyword}`);
      }
    }
  });

  // Check for duplicates
  const uniqueTopics = new Set(topics.map(t => t.toLowerCase()));
  if (uniqueTopics.size !== topics.length) {
    issues.push('Topics list contains duplicates');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

// Validate lesson content
export const validateLesson = (lesson: string): ValidationResult => {
  const issues: string[] = [];

  // Basic content validation
  const contentCheck = validateContentForChildren(lesson);
  if (!contentCheck.isValid) {
    issues.push(...contentCheck.issues);
  }

  // Check for markdown structure (should have some headings)
  const hasHeadings = lesson.includes('#') || lesson.includes('##');
  if (!hasHeadings) {
    issues.push('Lesson should have structured headings');
  }

  // Check minimum content
  const wordCount = lesson.split(/\s+/).length;
  if (wordCount < 50) {
    issues.push('Lesson content is too brief (minimum 50 words)');
  }

  if (wordCount > 2000) {
    issues.push('Lesson content is too long (maximum 2000 words)');
  }

  return {
    isValid: issues.length === 0,
    issues,
    sanitizedContent: lesson
  };
};

// Validate explanation
export const validateExplanation = (explanation: any): ValidationResult => {
  const issues: string[] = [];

  if (!explanation.question || typeof explanation.question !== 'string') {
    issues.push('Explanation must have a valid question');
  }

  if (!explanation.explanation || typeof explanation.explanation !== 'string') {
    issues.push('Explanation text is missing');
  }

  if (explanation.explanation && explanation.explanation.length < 10) {
    issues.push('Explanation is too short');
  }

  if (explanation.explanation && explanation.explanation.length > 500) {
    issues.push('Explanation is too long');
  }

  const contentCheck = validateContentForChildren(
    JSON.stringify(explanation)
  );
  
  if (!contentCheck.isValid) {
    issues.push(...contentCheck.issues);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};
