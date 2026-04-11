/**
 * Offline Queue Service
 * Handles quiz submissions when offline and syncs when connection returns
 */

import { QuizSession } from '../types';

interface QueuedQuizSubmission {
  id: string;
  userId: string;
  session: QuizSession;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'ks2_offline_queue';
const MAX_RETRY_COUNT = 3;

class OfflineQueueService {
  private queue: QueuedQuizSubmission[] = [];
  private isSyncing = false;
  private listeners: Set<(count: number) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Add quiz submission to offline queue
   */
  queueQuizSubmission(userId: string, session: QuizSession): void {
    const submission: QueuedQuizSubmission = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      session,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(submission);
    this.saveQueue();
    this.notifyListeners();
    
    console.log('[OfflineQueue] Added submission to queue:', submission.id);
  }

  /**
   * Get number of pending submissions
   */
  getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Check if there are pending submissions
   */
  hasPendingSubmissions(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Get all pending submissions (for display)
   */
  getPendingSubmissions(): QueuedQuizSubmission[] {
    return [...this.queue];
  }

  /**
   * Sync all pending submissions
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing || this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    if (!navigator.onLine) {
      console.log('[OfflineQueue] Cannot sync - still offline');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failedCount = 0;

    console.log(`[OfflineQueue] Starting sync of ${this.queue.length} submissions`);

    // Process queue in order
    const submissions = [...this.queue];
    for (const submission of submissions) {
      try {
        await this.syncSubmission(submission);
        successCount++;
        // Remove from queue on success
        this.queue = this.queue.filter(s => s.id !== submission.id);
      } catch (error) {
        console.error('[OfflineQueue] Sync failed:', error);
        failedCount++;
        
        // Increment retry count
        const sub = this.queue.find(s => s.id === submission.id);
        if (sub) {
          sub.retryCount++;
          
          // Remove if exceeded max retries
          if (sub.retryCount >= MAX_RETRY_COUNT) {
            console.warn('[OfflineQueue] Max retries exceeded, removing:', sub.id);
            this.queue = this.queue.filter(s => s.id !== submission.id);
          }
        }
      }
    }

    this.saveQueue();
    this.notifyListeners();
    this.isSyncing = false;

    console.log(`[OfflineQueue] Sync complete: ${successCount} success, ${failedCount} failed`);
    return { success: successCount, failed: failedCount };
  }

  /**
   * Sync a single submission to Firestore
   */
  private async syncSubmission(submission: QueuedQuizSubmission): Promise<void> {
    // Import dynamically to avoid circular dependencies
    const { db } = await import('./firebase');
    const { doc, setDoc, Timestamp } = await import('firebase/firestore');

    const sessionId = `session_${submission.userId}_${submission.timestamp}`;
    const sessionRef = doc(db, 'quizSessions', sessionId);

    await setDoc(sessionRef, {
      ...submission.session,
      userId: submission.userId,
      syncedAt: Timestamp.now(),
      wasOffline: true,
    });

    console.log('[OfflineQueue] Synced submission:', submission.id);
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[OfflineQueue] Loaded ${this.queue.length} pending submissions`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue:', error);
    }
  }

  /**
   * Setup listener for online/offline events
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Connection restored, syncing...');
      setTimeout(() => {
        this.syncAll();
      }, 1000); // Small delay to ensure connection is stable
    });

    // Try sync on load if online
    if (navigator.onLine && this.queue.length > 0) {
      setTimeout(() => {
        this.syncAll();
      }, 2000);
    }
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (count: number) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify of current state
    listener(this.queue.length);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const count = this.queue.length;
    this.listeners.forEach(listener => listener(count));
  }

  /**
   * Clear all pending submissions (admin/debug)
   */
  clearAll(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
    console.log('[OfflineQueue] Queue cleared');
  }
}

// Export singleton
export const offlineQueueService = new OfflineQueueService();
