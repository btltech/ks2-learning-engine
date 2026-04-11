/**
 * Content Quality Service
 * 
 * Provides:
 * - Content review pipeline for teacher verification
 * - User feedback mechanisms
 * - Content flagging system
 * - Quality metrics tracking
 */

import { QuizQuestion, CognitiveLevel } from '../types';

// Content review status
export enum ContentStatus {
  Pending = 'pending',
  Approved = 'approved',
  NeedsRevision = 'needs-revision',
  Rejected = 'rejected',
}

export interface ContentReview {
  id: string;
  contentId: string;
  contentType: 'question' | 'lesson' | 'explanation';
  status: ContentStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: number;
  comments?: string;
  qualityScore?: number; // 1-5
  ageAppropriate: boolean;
  curriculumAligned: boolean;
  factuallyAccurate: boolean;
}

export interface ContentFeedback {
  id: string;
  contentId: string;
  userId: string;
  userName?: string;
  userRole: 'student' | 'parent' | 'teacher';
  type: 'like' | 'dislike' | 'flag' | 'suggestion';
  reason?: string;
  message?: string;
  createdAt: number;
  resolved: boolean;
}

export interface FlagReason {
  code: string;
  label: string;
  requiresMessage: boolean;
}

export const FLAG_REASONS: FlagReason[] = [
  { code: 'incorrect', label: 'Answer is incorrect', requiresMessage: false },
  { code: 'confusing', label: 'Question is confusing', requiresMessage: false },
  { code: 'age_inappropriate', label: 'Not age appropriate', requiresMessage: true },
  { code: 'off_topic', label: 'Off topic for subject', requiresMessage: false },
  { code: 'too_hard', label: 'Too difficult for age group', requiresMessage: false },
  { code: 'too_easy', label: 'Too easy for age group', requiresMessage: false },
  { code: 'technical', label: 'Technical issue (display/loading)', requiresMessage: true },
  { code: 'other', label: 'Other (please explain)', requiresMessage: true },
];

// Quality metrics for auto-generated content
export interface QualityMetrics {
  readabilityScore: number; // Flesch-Kincaid grade level
  vocabularyLevel: 'simple' | 'moderate' | 'advanced';
  sentenceComplexity: number; // Average words per sentence
  hasDistractors: boolean; // For MC questions - do wrong answers make sense
  cognitiveLevel: CognitiveLevel;
  estimatedAge: { min: number; max: number };
}

class ContentQualityService {
  private feedbackQueue: ContentFeedback[] = [];
  private readonly STORAGE_KEY = 'ks2_content_feedback';
  private readonly REVIEWS_KEY = 'ks2_content_reviews';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.feedbackQueue = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load feedback queue:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.feedbackQueue));
    } catch (e) {
      console.error('Failed to save feedback queue:', e);
    }
  }

  /**
   * Submit feedback for content
   */
  submitFeedback(feedback: Omit<ContentFeedback, 'id' | 'createdAt' | 'resolved'>): string {
    const id = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullFeedback: ContentFeedback = {
      ...feedback,
      id,
      createdAt: Date.now(),
      resolved: false,
    };

    this.feedbackQueue.push(fullFeedback);
    this.saveToStorage();

    // In production, this would also send to the server
    console.log('Feedback submitted:', fullFeedback);

    return id;
  }

  /**
   * Flag content for review
   */
  flagContent(
    contentId: string,
    userId: string,
    reasonCode: string,
    message?: string
  ): string {
    return this.submitFeedback({
      contentId,
      userId,
      userRole: 'student',
      type: 'flag',
      reason: reasonCode,
      message,
    });
  }

  /**
   * Like/dislike content
   */
  rateContent(
    contentId: string,
    userId: string,
    isPositive: boolean
  ): void {
    this.submitFeedback({
      contentId,
      userId,
      userRole: 'student',
      type: isPositive ? 'like' : 'dislike',
    });
  }

  /**
   * Get pending feedback for review (teacher/admin)
   */
  getPendingFeedback(): ContentFeedback[] {
    return this.feedbackQueue.filter(f => !f.resolved);
  }

  /**
   * Resolve feedback
   */
  resolveFeedback(feedbackId: string): void {
    const feedback = this.feedbackQueue.find(f => f.id === feedbackId);
    if (feedback) {
      feedback.resolved = true;
      this.saveToStorage();
    }
  }

  /**
   * Analyze question quality automatically
   */
  analyzeQuestionQuality(question: QuizQuestion): QualityMetrics {
    const text = question.question + ' ' + question.options.join(' ');
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // Simple Flesch-Kincaid calculation
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = this.estimateSyllables(text) / words.length;
    const readability = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    // Vocabulary level based on word length
    const avgWordLength = text.length / words.length;
    const vocabularyLevel = avgWordLength < 5 ? 'simple' 
      : avgWordLength < 7 ? 'moderate' 
      : 'advanced';

    // Check if distractors are plausible
    const hasDistractors = question.options.length >= 4 && 
      question.options.every(opt => opt.length > 2);

    return {
      readabilityScore: Math.max(1, Math.min(12, readability)),
      vocabularyLevel,
      sentenceComplexity: avgWordsPerSentence,
      hasDistractors,
      cognitiveLevel: question.cognitiveLevel || CognitiveLevel.Remember,
      estimatedAge: this.estimateAgeRange(readability),
    };
  }

  private estimateSyllables(text: string): number {
    // Simplified syllable counter
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((total, word) => {
      return total + Math.max(1, word.replace(/[^aeiouy]/g, '').length);
    }, 0);
  }

  private estimateAgeRange(readability: number): { min: number; max: number } {
    // Map Flesch-Kincaid grade to UK ages (Grade 1 = Year 2 = Age 6-7)
    const ukAge = readability + 5;
    return {
      min: Math.max(7, Math.floor(ukAge) - 1),
      max: Math.min(11, Math.ceil(ukAge) + 1),
    };
  }

  /**
   * Validate question content for common issues
   */
  validateQuestion(question: QuizQuestion): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check question has content
    if (!question.question || question.question.trim().length < 10) {
      issues.push('Question text is too short');
    }

    // Check options
    if (!question.options || question.options.length < 2) {
      issues.push('Question needs at least 2 answer options');
    }

    // Check for duplicate options
    const uniqueOptions = new Set(question.options.map(o => o.toLowerCase().trim()));
    if (uniqueOptions.size !== question.options.length) {
      issues.push('Question has duplicate answer options');
    }

    // Check correct answer exists in options
    if (!question.options.includes(question.correctAnswer)) {
      issues.push('Correct answer not found in options');
    }

    // Check for empty options
    if (question.options.some(o => !o || o.trim().length === 0)) {
      issues.push('Some answer options are empty');
    }

    // Check question ends with appropriate punctuation
    const lastChar = question.question.trim().slice(-1);
    if (!['?', '.', ':', '!'].includes(lastChar)) {
      issues.push('Question should end with proper punctuation');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get feedback statistics for content
   */
  getFeedbackStats(contentId: string): {
    likes: number;
    dislikes: number;
    flags: number;
    netScore: number;
  } {
    const feedback = this.feedbackQueue.filter(f => f.contentId === contentId);
    const likes = feedback.filter(f => f.type === 'like').length;
    const dislikes = feedback.filter(f => f.type === 'dislike').length;
    const flags = feedback.filter(f => f.type === 'flag').length;

    return {
      likes,
      dislikes,
      flags,
      netScore: likes - dislikes - (flags * 2),
    };
  }
}

export const contentQualityService = new ContentQualityService();

export default contentQualityService;
