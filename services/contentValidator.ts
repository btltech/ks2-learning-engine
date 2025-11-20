// Content validation utilities for AI-generated content

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  sanitizedContent?: string;
}

// List of inappropriate words/phrases to check for (basic filter)
const inappropriateKeywords = [
  // This would contain a more comprehensive list in production
  'inappropriate',
  'violent',
  'explicit'
];

// Validate that content is appropriate for children
export const validateContentForChildren = (content: string): ValidationResult => {
  const issues: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check for inappropriate keywords
  for (const keyword of inappropriateKeywords) {
    if (lowerContent.includes(keyword)) {
      issues.push(`Content contains potentially inappropriate keyword: ${keyword}`);
    }
  }

  // Check content length is reasonable
  if (content.length < 50) {
    issues.push('Content is too short to be meaningful');
  }

  if (content.length > 10000) {
    issues.push('Content is excessively long');
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

  // Check for duplicate options
  if (question.options) {
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
