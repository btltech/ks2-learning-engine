/**
 * Spaced Repetition Service
 * 
 * Implements SM-2 algorithm for optimal learning retention
 * Tracks wrong answers and resurfaces difficult topics at optimal intervals
 */

export interface ReviewItem {
  id: string;
  subject: string;
  topic: string;
  question: string;
  correctAnswer: string;
  difficulty: number; // 0-5 scale
  easeFactor: number; // Starting at 2.5
  interval: number; // Days until next review
  nextReview: string; // ISO date string
  repetitions: number;
  lastReviewScore: number; // 0-5 scale
  createdAt: string;
  wrongCount: number;
}

export interface SpacedRepetitionStats {
  totalItems: number;
  dueToday: number;
  masteredItems: number;
  strugglingItems: number;
  averageEaseFactor: number;
}

const STORAGE_KEY = 'ks2_spaced_repetition';

// SM-2 Algorithm Implementation
const calculateNextReview = (
  item: ReviewItem,
  quality: number // 0-5 rating (0=blackout, 5=perfect)
): ReviewItem => {
  let { easeFactor, interval, repetitions } = item;

  // Quality < 3 means incorrect or struggling
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Correct answer
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ...item,
    easeFactor,
    interval,
    repetitions,
    nextReview: nextReview.toISOString(),
    lastReviewScore: quality,
    wrongCount: quality < 3 ? item.wrongCount + 1 : item.wrongCount,
  };
};

class SpacedRepetitionService {
  private items: Map<string, ReviewItem> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.items = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading spaced repetition data:', error);
      this.items = new Map();
    }
  }

  private saveToStorage(): void {
    try {
      const obj = Object.fromEntries(this.items);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving spaced repetition data:', error);
    }
  }

  /**
   * Add a wrong answer to the review queue
   */
  addWrongAnswer(
    subject: string,
    topic: string,
    question: string,
    correctAnswer: string
  ): ReviewItem {
    const id = `${subject}_${topic}_${btoa(question).slice(0, 20)}`;
    
    const existing = this.items.get(id);
    if (existing) {
      // Update existing item with worse score
      const updated = calculateNextReview(existing, 1); // Score of 1 = wrong
      this.items.set(id, updated);
      this.saveToStorage();
      return updated;
    }

    // Create new item
    const newItem: ReviewItem = {
      id,
      subject,
      topic,
      question,
      correctAnswer,
      difficulty: 2.5,
      easeFactor: 2.5,
      interval: 1,
      nextReview: new Date().toISOString(),
      repetitions: 0,
      lastReviewScore: 0,
      createdAt: new Date().toISOString(),
      wrongCount: 1,
    };

    this.items.set(id, newItem);
    this.saveToStorage();
    return newItem;
  }

  /**
   * Record a review result
   */
  recordReview(itemId: string, quality: number): ReviewItem | null {
    const item = this.items.get(itemId);
    if (!item) return null;

    const updated = calculateNextReview(item, quality);
    this.items.set(itemId, updated);
    this.saveToStorage();
    return updated;
  }

  /**
   * Get items due for review today
   */
  getDueItems(subject?: string): ReviewItem[] {
    const now = new Date();
    const dueItems: ReviewItem[] = [];

    this.items.forEach((item) => {
      const nextReview = new Date(item.nextReview);
      if (nextReview <= now) {
        if (!subject || item.subject === subject) {
          dueItems.push(item);
        }
      }
    });

    // Sort by priority: most overdue and most struggled items first
    return dueItems.sort((a, b) => {
      const aOverdue = now.getTime() - new Date(a.nextReview).getTime();
      const bOverdue = now.getTime() - new Date(b.nextReview).getTime();
      const aScore = aOverdue / 1000 / 60 / 60 / 24 + a.wrongCount * 2;
      const bScore = bOverdue / 1000 / 60 / 60 / 24 + b.wrongCount * 2;
      return bScore - aScore;
    });
  }

  /**
   * Get items user is struggling with
   */
  getStrugglingItems(limit: number = 10): ReviewItem[] {
    const items = Array.from(this.items.values());
    return items
      .filter((item) => item.wrongCount >= 2 || item.easeFactor < 2.0)
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, limit);
  }

  /**
   * Get mastered items (high ease factor, many repetitions)
   */
  getMasteredItems(): ReviewItem[] {
    return Array.from(this.items.values()).filter(
      (item) => item.easeFactor >= 2.5 && item.repetitions >= 5
    );
  }

  /**
   * Get statistics
   */
  getStats(): SpacedRepetitionStats {
    const items = Array.from(this.items.values());
    const now = new Date();
    
    const dueToday = items.filter(
      (item) => new Date(item.nextReview) <= now
    ).length;

    const masteredItems = items.filter(
      (item) => item.easeFactor >= 2.5 && item.repetitions >= 5
    ).length;

    const strugglingItems = items.filter(
      (item) => item.wrongCount >= 2 || item.easeFactor < 2.0
    ).length;

    const averageEaseFactor =
      items.length > 0
        ? items.reduce((sum, item) => sum + item.easeFactor, 0) / items.length
        : 2.5;

    return {
      totalItems: items.length,
      dueToday,
      masteredItems,
      strugglingItems,
      averageEaseFactor,
    };
  }

  /**
   * Get items by subject
   */
  getItemsBySubject(subject: string): ReviewItem[] {
    return Array.from(this.items.values()).filter(
      (item) => item.subject === subject
    );
  }

  /**
   * Get weak topics for a subject
   */
  getWeakTopics(subject: string): string[] {
    const items = this.getItemsBySubject(subject);
    const topicScores = new Map<string, { total: number; wrong: number }>();

    items.forEach((item) => {
      const current = topicScores.get(item.topic) || { total: 0, wrong: 0 };
      current.total += 1;
      current.wrong += item.wrongCount;
      topicScores.set(item.topic, current);
    });

    // Sort by wrong/total ratio
    return Array.from(topicScores.entries())
      .sort((a, b) => b[1].wrong / b[1].total - a[1].wrong / a[1].total)
      .map(([topic]) => topic);
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.items.clear();
    this.saveToStorage();
  }

  /**
   * Export data for backup
   */
  exportData(): string {
    return JSON.stringify(Object.fromEntries(this.items), null, 2);
  }

  /**
   * Import data from backup
   */
  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      this.items = new Map(Object.entries(parsed));
      this.saveToStorage();
      return true;
    } catch {
      return false;
    }
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();
