// Offline detection and management service

class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  /**
   * Check if the app is currently online
   */
  checkOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to online/offline status changes
   */
  subscribe(callback: (online: boolean) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get all cached data for offline use
   */
  getCachedDataSummary(): { 
    topics: number; 
    lessons: number; 
    quizzes: number; 
    totalSize: number;
  } {
    let topics = 0;
    let lessons = 0;
    let quizzes = 0;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          
          if (key.includes('-topics-')) topics++;
          else if (key.includes('-lesson-')) lessons++;
          else if (key.includes('-quiz-')) quizzes++;
        }
      }
    }

    return { topics, lessons, quizzes, totalSize };
  }

  /**
   * Check if specific content is available offline
   */
  isContentAvailable(cacheKey: string): boolean {
    return localStorage.getItem(cacheKey) !== null;
  }
}

export const offlineManager = new OfflineManager();
