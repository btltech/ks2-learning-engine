/**
 * Enhanced Error Handling Service
 * 
 * Provides:
 * - Categorized error types with user-friendly messages
 * - Automatic retry mechanisms with exponential backoff
 * - Offline queue for failed operations
 * - Error analytics and reporting
 */

// Error categories for better UX
export enum ErrorCategory {
  Network = 'network',
  Authentication = 'auth',
  Permission = 'permission',
  Validation = 'validation',
  AI = 'ai',
  Storage = 'storage',
  Unknown = 'unknown',
}

export interface AppError {
  code: string;
  category: ErrorCategory;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  timestamp: number;
  context?: Record<string, unknown>;
  originalError?: Error;
}

export interface QueuedOperation {
  id: string;
  type: 'quiz' | 'progress' | 'drawing' | 'feedback';
  payload: unknown;
  createdAt: number;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<string, { user: string; recoverable: boolean; retryable: boolean }> = {
  // Network errors
  'NETWORK_OFFLINE': {
    user: "You're currently offline. We'll save your work and sync when you're back online!",
    recoverable: true,
    retryable: true,
  },
  'NETWORK_TIMEOUT': {
    user: "That's taking a bit long. Let's try again!",
    recoverable: true,
    retryable: true,
  },
  'NETWORK_ERROR': {
    user: "Having trouble connecting. Please check your internet and try again.",
    recoverable: true,
    retryable: true,
  },
  
  // Authentication errors
  'AUTH_EXPIRED': {
    user: "Your session has ended. Please sign in again to continue.",
    recoverable: true,
    retryable: false,
  },
  'AUTH_INVALID': {
    user: "There was a problem with your login. Please try signing in again.",
    recoverable: true,
    retryable: false,
  },
  
  // Permission errors
  'PERMISSION_DENIED': {
    user: "You don't have permission to do this. Ask your teacher or parent for help!",
    recoverable: false,
    retryable: false,
  },
  
  // AI/Quiz errors
  'AI_RATE_LIMITED': {
    user: "We're very busy right now! Please wait a moment and try again.",
    recoverable: true,
    retryable: true,
  },
  'AI_GENERATION_FAILED': {
    user: "Oops! We had trouble creating your questions. Let's try a different topic!",
    recoverable: true,
    retryable: true,
  },
  'AI_CONTENT_BLOCKED': {
    user: "We couldn't generate that content. Try a different question!",
    recoverable: true,
    retryable: false,
  },
  
  // Storage errors
  'STORAGE_QUOTA_EXCEEDED': {
    user: "Your device is running low on space. Try clearing some old data.",
    recoverable: true,
    retryable: false,
  },
  'STORAGE_UNAVAILABLE': {
    user: "We couldn't save your progress right now. Don't worry, we'll keep trying!",
    recoverable: true,
    retryable: true,
  },
  
  // Validation errors
  'VALIDATION_REQUIRED_FIELD': {
    user: "Please fill in all required fields.",
    recoverable: true,
    retryable: false,
  },
  'VALIDATION_INVALID_FORMAT': {
    user: "Something doesn't look right. Please check your input.",
    recoverable: true,
    retryable: false,
  },
  
  // Generic
  'UNKNOWN_ERROR': {
    user: "Something unexpected happened. Please try again!",
    recoverable: true,
    retryable: true,
  },
};

// Categorize errors based on error object
function categorizeError(error: Error | unknown): { code: string; category: ErrorCategory } {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('failed to fetch') || name.includes('network')) {
      if (!navigator.onLine) {
        return { code: 'NETWORK_OFFLINE', category: ErrorCategory.Network };
      }
      return { code: 'NETWORK_ERROR', category: ErrorCategory.Network };
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return { code: 'NETWORK_TIMEOUT', category: ErrorCategory.Network };
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') ||
        message.includes('unauthenticated') || message.includes('token')) {
      if (message.includes('expired')) {
        return { code: 'AUTH_EXPIRED', category: ErrorCategory.Authentication };
      }
      return { code: 'AUTH_INVALID', category: ErrorCategory.Authentication };
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('forbidden') ||
        message.includes('access denied')) {
      return { code: 'PERMISSION_DENIED', category: ErrorCategory.Permission };
    }
    
    // AI errors
    if (message.includes('rate limit') || message.includes('quota')) {
      return { code: 'AI_RATE_LIMITED', category: ErrorCategory.AI };
    }
    if (message.includes('content') && message.includes('block')) {
      return { code: 'AI_CONTENT_BLOCKED', category: ErrorCategory.AI };
    }
    if (message.includes('generate') || message.includes('gemini') || 
        message.includes('ai') || message.includes('model')) {
      return { code: 'AI_GENERATION_FAILED', category: ErrorCategory.AI };
    }
    
    // Storage errors
    if (message.includes('quota') && message.includes('exceed')) {
      return { code: 'STORAGE_QUOTA_EXCEEDED', category: ErrorCategory.Storage };
    }
    if (message.includes('storage') || message.includes('indexeddb')) {
      return { code: 'STORAGE_UNAVAILABLE', category: ErrorCategory.Storage };
    }
  }
  
  return { code: 'UNKNOWN_ERROR', category: ErrorCategory.Unknown };
}

// Create a structured AppError from any error
export function createAppError(
  error: Error | unknown,
  context?: Record<string, unknown>
): AppError {
  const { code, category } = categorizeError(error);
  const errorInfo = ERROR_MESSAGES[code] || ERROR_MESSAGES['UNKNOWN_ERROR'];
  
  return {
    code,
    category,
    message: error instanceof Error ? error.message : String(error),
    userMessage: errorInfo.user,
    recoverable: errorInfo.recoverable,
    retryable: errorInfo.retryable,
    timestamp: Date.now(),
    context,
    originalError: error instanceof Error ? error : undefined,
  };
}

// Offline queue for failed operations
class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private readonly STORAGE_KEY = 'ks2_offline_queue';
  private processing = false;
  
  constructor() {
    this.loadFromStorage();
    window.addEventListener('online', () => this.processQueue());
  }
  
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load offline queue:', e);
    }
  }
  
  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }
  
  enqueue(operation: Omit<QueuedOperation, 'id' | 'createdAt' | 'retryCount'>): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queuedOp: QueuedOperation = {
      ...operation,
      id,
      createdAt: Date.now(),
      retryCount: 0,
    };
    
    this.queue.push(queuedOp);
    this.saveToStorage();
    
    return id;
  }
  
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.processing || !navigator.onLine || this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }
    
    this.processing = true;
    let success = 0;
    let failed = 0;
    
    const operationsToProcess = [...this.queue];
    
    for (const op of operationsToProcess) {
      try {
        await this.executeOperation(op);
        this.removeFromQueue(op.id);
        success++;
      } catch (error) {
        op.retryCount++;
        op.lastError = error instanceof Error ? error.message : String(error);
        
        if (op.retryCount >= op.maxRetries) {
          this.removeFromQueue(op.id);
          failed++;
          console.error(`Operation ${op.id} failed permanently:`, error);
        }
      }
    }
    
    this.saveToStorage();
    this.processing = false;
    
    return { success, failed };
  }
  
  private async executeOperation(op: QueuedOperation): Promise<void> {
    // This would be extended to handle different operation types
    switch (op.type) {
      case 'progress':
        // Re-submit progress data
        break;
      case 'drawing':
        // Re-submit drawing
        break;
      case 'feedback':
        // Re-submit feedback
        break;
      default:
        throw new Error(`Unknown operation type: ${op.type}`);
    }
  }
  
  private removeFromQueue(id: string) {
    this.queue = this.queue.filter(op => op.id !== id);
  }
  
  getQueueLength(): number {
    return this.queue.length;
  }
  
  getPendingOperations(): QueuedOperation[] {
    return [...this.queue];
  }
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    initialDelay = 1000, 
    maxDelay = 10000,
    onRetry 
  } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Error reporting service (would integrate with analytics)
export function reportError(error: AppError): void {
  // Log to console in development
  console.error('App Error:', {
    code: error.code,
    category: error.category,
    message: error.message,
    context: error.context,
    timestamp: new Date(error.timestamp).toISOString(),
  });
  
  // In production, this would send to an analytics service
  // analytics.trackError(error);
}

// Export singleton instances
export const offlineQueue = new OfflineQueue();

// React hook helper for error handling
export function useErrorHandler() {
  const handleError = (error: Error | unknown, context?: Record<string, unknown>) => {
    const appError = createAppError(error, context);
    reportError(appError);
    return appError;
  };
  
  return { handleError, createAppError, retryWithBackoff };
}

export default {
  createAppError,
  reportError,
  retryWithBackoff,
  offlineQueue,
  ErrorCategory,
};
