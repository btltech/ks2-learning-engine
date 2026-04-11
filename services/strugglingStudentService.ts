/**
 * Struggling Student Detection Service
 * Detects when students are struggling and provides interventions
 */

import { QuizResult } from '../types';

interface StrugglePattern {
  subject: string;
  topic: string;
  failureCount: number;
  lastFailureDate: number;
  averageScore: number;
}

interface Intervention {
  type: 'easier_questions' | 'lesson_suggestion' | 'parent_alert' | 'video_tutorial';
  message: string;
  action?: () => void;
}

const STORAGE_KEY = 'ks2_struggle_tracking';
const FAILURE_THRESHOLD = 3; // 3 failures triggers intervention
const POOR_SCORE_THRESHOLD = 40; // Below 40% is considered struggling

class StrugglingStudentService {
  private patterns: Map<string, StrugglePattern> = new Map();

  constructor() {
    this.loadPatterns();
  }

  /**
   * Record quiz result and detect struggles
   */
  recordQuizResult(result: QuizResult): Intervention | null {
    const key = `${result.subject}_${result.topic}`;
    const isStruggling = result.score < POOR_SCORE_THRESHOLD;

    let pattern = this.patterns.get(key);
    
    if (!pattern) {
      pattern = {
        subject: result.subject,
        topic: result.topic,
        failureCount: 0,
        lastFailureDate: Date.now(),
        averageScore: result.score,
      };
    }

    // Update pattern
    if (isStruggling) {
      pattern.failureCount++;
      pattern.lastFailureDate = Date.now();
    } else if (result.score >= 70) {
      // Good score - reduce failure count
      pattern.failureCount = Math.max(0, pattern.failureCount - 1);
    }

    // Update average score (weighted towards recent)
    pattern.averageScore = (pattern.averageScore * 0.7) + (result.score * 0.3);

    this.patterns.set(key, pattern);
    this.savePatterns();

    // Check if intervention needed
    if (pattern.failureCount >= FAILURE_THRESHOLD) {
      return this.getIntervention(pattern);
    }

    return null;
  }

  /**
   * Get appropriate intervention for struggling student
   */
  private getIntervention(pattern: StrugglePattern): Intervention {
    const { subject, topic, failureCount, averageScore } = pattern;

    // Escalating interventions based on severity
    if (failureCount >= 5 || averageScore < 30) {
      // Severe struggle - alert parent
      return {
        type: 'parent_alert',
        message: `${topic} in ${subject} needs extra help. Consider reviewing basics or getting support.`,
      };
    } else if (failureCount >= 4) {
      // Moderate struggle - suggest video
      return {
        type: 'video_tutorial',
        message: `Having trouble with ${topic}? Watch a lesson video first to understand better.`,
      };
    } else if (failureCount >= 3) {
      // Early struggle - offer easier questions
      return {
        type: 'easier_questions',
        message: `Let's try some easier ${topic} questions to build confidence first.`,
      };
    } else {
      // Mild struggle - suggest lesson review
      return {
        type: 'lesson_suggestion',
        message: `Would you like to review the ${topic} lesson before trying again?`,
      };
    }
  }

  /**
   * Get all struggling areas for a student
   */
  getStrugglingAreas(): StrugglePattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.failureCount >= 2 || p.averageScore < POOR_SCORE_THRESHOLD)
      .sort((a, b) => b.failureCount - a.failureCount);
  }

  /**
   * Get parent report of struggling areas
   */
  getParentReport(): string {
    const struggling = this.getStrugglingAreas();
    
    if (struggling.length === 0) {
      return 'Your child is progressing well across all subjects! 🎉';
    }

    const areas = struggling
      .slice(0, 3) // Top 3 concerns
      .map(p => `${p.topic} in ${p.subject} (${Math.round(p.averageScore)}% average)`)
      .join(', ');

    return `Areas needing extra support: ${areas}. Consider spending more time on these topics.`;
  }

  /**
   * Reset struggle tracking for a specific topic (after improvement)
   */
  resetTopic(subject: string, topic: string): void {
    const key = `${subject}_${topic}`;
    this.patterns.delete(key);
    this.savePatterns();
  }

  /**
   * Check if student is struggling with current topic
   */
  isStruggling(subject: string, topic: string): boolean {
    const key = `${subject}_${topic}`;
    const pattern = this.patterns.get(key);
    return pattern ? pattern.failureCount >= FAILURE_THRESHOLD : false;
  }

  /**
   * Get encouragement message based on progress
   */
  getEncouragementMessage(subject: string, topic: string): string {
    const key = `${subject}_${topic}`;
    const pattern = this.patterns.get(key);

    if (!pattern || pattern.averageScore >= 70) {
      return "You're doing great! Keep up the good work! 🌟";
    } else if (pattern.averageScore >= 50) {
      return "You're making progress! Practice makes perfect! 💪";
    } else {
      return "Don't give up! Every expert was once a beginner. You've got this! 🚀";
    }
  }

  /**
   * Load patterns from localStorage
   */
  private loadPatterns(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('[StrugglingStudent] Failed to load patterns:', error);
    }
  }

  /**
   * Save patterns to localStorage
   */
  private savePatterns(): void {
    try {
      const data = Object.fromEntries(this.patterns);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[StrugglingStudent] Failed to save patterns:', error);
    }
  }

  /**
   * Clear all tracking (admin/debug)
   */
  clearAll(): void {
    this.patterns.clear();
    this.savePatterns();
  }
}

// Export singleton
export const strugglingStudentService = new StrugglingStudentService();
