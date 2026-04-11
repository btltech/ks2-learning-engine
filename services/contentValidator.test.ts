import { describe, it, expect } from 'vitest';
import { validateContentForChildren, validateQuizQuestion } from './contentValidator';
import { QuestionType, CognitiveLevel } from '../types';

describe('ContentValidator', () => {
  describe('validateContentForChildren', () => {
    it('should accept appropriate educational content', () => {
      const content = 'What is 2 + 2? This is a simple addition question for students learning basic mathematics.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject content with violent keywords', () => {
      const content = 'This question involves killing and murder which is not appropriate for children at all.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some(i => i.includes('kill') || i.includes('murder'))).toBe(true);
    });

    it('should reject content with adult keywords', () => {
      const content = 'This content contains sexual and explicit material that should not be shown to children.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('sexual') || i.includes('explicit'))).toBe(true);
    });

    it('should reject content with hate speech', () => {
      const content = 'This content promotes nazi ideology and white supremacist views which are completely inappropriate.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('nazi') || i.includes('supremacist'))).toBe(true);
    });

    it('should reject content with drug references', () => {
      const content = 'This story is about cocaine and heroin and how people use illegal drugs to get high.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('cocaine') || i.includes('heroin'))).toBe(true);
    });

    it('should reject content with self-harm references', () => {
      const content = 'This content discusses suicide and self-harm and ways to hurt yourself which is very dangerous.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('suicide') || i.includes('self-harm'))).toBe(true);
    });

    it('should reject harmful patterns', () => {
      const content = 'Here is how to murder someone and get away with it, a detailed guide that should never exist.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('harmful pattern'))).toBe(true);
    });

    it('should reject content that is too short', () => {
      const content = 'Hi there!';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('too short'))).toBe(true);
    });

    it('should reject content with excessive exclamation marks', () => {
      const content = 'This is a test!!!!!!!!!!!!! With too many!!!!! Exclamation marks!!!!! Everywhere!!!!!';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('excessive exclamation'))).toBe(true);
    });

    it('should reject content with excessive caps (shouting)', () => {
      const content = 'THIS IS ALL CAPS AND LOOKS LIKE SOMEONE IS SHOUTING AT THE CHILDREN WHICH IS NOT NICE';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('capital letters'))).toBe(true);
    });

    it('should accept normal educational content with some caps', () => {
      const content = 'The United Kingdom (UK) includes England, Scotland, Wales, and Northern Ireland. London is the capital city.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(true);
    });

    it('should accept educational content about sensitive social topics', () => {
      const content = 'This lesson teaches students about racism and discrimination in history and why treating everyone with respect is important.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should accept educational content about bullying prevention', () => {
      const content = 'If you see someone being bullied, tell a trusted adult. Being kind and standing up for others is important.';
      const result = validateContentForChildren(content);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('validateQuizQuestion', () => {
    it('should accept a valid multiple choice question', () => {
      const question = {
        question: 'What is the capital of France? This is a geography question about European capitals.',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 'Paris',
        questionType: QuestionType.MultipleChoice
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(true);
    });

    it('should reject a question without text', () => {
      const question = {
        options: ['A', 'B', 'C'],
        correctAnswer: 'A'
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('missing'))).toBe(true);
    });

    it('should reject a question with duplicate options', () => {
      const question = {
        question: 'What is 2 + 2? This is a simple addition question for primary school students.',
        options: ['4', '4', '5', '6'],
        correctAnswer: '4'
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('duplicate'))).toBe(true);
    });

    it('should reject a question where correct answer is not in options', () => {
      const question = {
        question: 'What is the largest planet in our solar system? This is a science question.',
        options: ['Mars', 'Venus', 'Saturn', 'Neptune'],
        correctAnswer: 'Jupiter'
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('one of the options'))).toBe(true);
    });

    it('should accept a valid true/false question', () => {
      const question = {
        question: 'The Earth is the third planet from the Sun. Is this statement true or false?',
        options: ['True', 'False'],
        correctAnswer: 'True',
        questionType: QuestionType.TrueFalse
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(true);
    });

    it('should reject true/false with wrong options', () => {
      const question = {
        question: 'The Earth is flat. Is this statement correct or incorrect?',
        options: ['Yes', 'No'],
        correctAnswer: 'No',
        questionType: QuestionType.TrueFalse
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('True') && i.includes('False'))).toBe(true);
    });

    it('should accept a valid fill-in-blank question', () => {
      const question = {
        question: 'The _____ is the largest ocean on Earth. Fill in the blank with the correct answer.',
        correctAnswer: 'Pacific',
        questionType: QuestionType.FillInBlank
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(true);
    });

    it('should reject fill-in-blank without blank indicator', () => {
      const question = {
        question: 'Which ocean is the largest on Earth? Please type your answer below.',
        correctAnswer: 'Pacific',
        questionType: QuestionType.FillInBlank
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.includes('blank indicator'))).toBe(true);
    });

    it('should reject questions with inappropriate content', () => {
      const question = {
        question: 'This violent and explicit question about murder should not be shown to children ever.',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A'
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(false);
    });

    it('should accept a valid ordering question', () => {
      const question = {
        question: 'Put these numbers in order from smallest to largest. Arrange them correctly.',
        options: ['5', '2', '8', '1'],
        correctOrder: [3, 1, 0, 2], // 1, 2, 5, 8
        questionType: QuestionType.Ordering
      };
      const result = validateQuizQuestion(question);
      expect(result.isValid).toBe(true);
    });
  });
});
