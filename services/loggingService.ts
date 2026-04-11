/**
 * Logging Service
 * 
 * Centralized logging with:
 * - Log levels (debug, info, warn, error)
 * - Structured logging with context
 * - Performance tracking
 * - Analytics integration ready
 * - Remote logging capability (production)
 */

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4,
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  userId?: string;
  sessionId: string;
  userAgent?: string;
  url?: string;
}

export interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class LoggingService {
  private logLevel: LogLevel = LogLevel.Info;
  private logs: LogEntry[] = [];
  private performanceMarks: Map<string, PerformanceMark> = new Map();
  private readonly MAX_LOGS = 500;
  private readonly STORAGE_KEY = 'ks2_logs';
  private readonly SESSION_ID: string;
  private userId?: string;

  constructor() {
    this.SESSION_ID = this.generateSessionId();
    this.loadFromStorage();
    
    // Set log level based on environment
    if (import.meta.env.DEV) {
      this.logLevel = LogLevel.Debug;
    } else {
      this.logLevel = LogLevel.Warn;
    }

    // Capture uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Uncaught Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled Promise Rejection', {
          reason: String(event.reason),
        });
      });
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load logs:', e);
    }
  }

  private saveToStorage(): void {
    try {
      // Keep only recent logs
      const recentLogs = this.logs.slice(-this.MAX_LOGS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentLogs));
    } catch (e) {
      // Storage full - clear old logs
      this.logs = this.logs.slice(-100);
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private createEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      userId: this.userId,
      sessionId: this.SESSION_ID,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (level < this.logLevel) return;

    const entry = this.createEntry(level, category, message, data);
    this.logs.push(entry);

    // Console output
    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${LogLevel[level]}] [${category}]`;
    
    switch (level) {
      case LogLevel.Debug:
        console.debug(prefix, message, data || '');
        break;
      case LogLevel.Info:
        console.info(prefix, message, data || '');
        break;
      case LogLevel.Warn:
        console.warn(prefix, message, data || '');
        break;
      case LogLevel.Error:
        console.error(prefix, message, data || '');
        break;
    }

    // Save to storage periodically
    if (this.logs.length % 10 === 0) {
      this.saveToStorage();
    }

    // In production, send errors to remote service
    if (!import.meta.env.DEV && level >= LogLevel.Error) {
      this.sendToRemote(entry);
    }
  }

  debug(message: string, data?: Record<string, unknown>, category = 'App'): void {
    this.log(LogLevel.Debug, category, message, data);
  }

  info(message: string, data?: Record<string, unknown>, category = 'App'): void {
    this.log(LogLevel.Info, category, message, data);
  }

  warn(message: string, data?: Record<string, unknown>, category = 'App'): void {
    this.log(LogLevel.Warn, category, message, data);
  }

  error(message: string, data?: Record<string, unknown>, category = 'App'): void {
    this.log(LogLevel.Error, category, message, data);
  }

  // Specialized loggers
  quizEvent(event: string, data: Record<string, unknown>): void {
    this.info(event, data, 'Quiz');
  }

  userAction(action: string, data?: Record<string, unknown>): void {
    this.info(action, data, 'UserAction');
  }

  apiCall(endpoint: string, method: string, duration: number, status?: number): void {
    this.debug(`${method} ${endpoint}`, { duration, status }, 'API');
  }

  // Performance tracking
  startMark(name: string, metadata?: Record<string, unknown>): void {
    this.performanceMarks.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  endMark(name: string): PerformanceMark | null {
    const mark = this.performanceMarks.get(name);
    if (!mark) return null;

    mark.endTime = performance.now();
    mark.duration = mark.endTime - mark.startTime;
    
    this.debug(`Performance: ${name}`, { 
      duration: `${mark.duration.toFixed(2)}ms`,
      ...mark.metadata 
    }, 'Performance');

    this.performanceMarks.delete(name);
    return mark;
  }

  // Get logs for debugging/export
  getLogs(options?: {
    level?: LogLevel;
    category?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let filtered = this.logs;

    if (options?.level !== undefined) {
      filtered = filtered.filter(l => l.level >= options.level!);
    }
    if (options?.category) {
      filtered = filtered.filter(l => l.category === options.category);
    }
    if (options?.since) {
      filtered = filtered.filter(l => l.timestamp >= options.since!);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
  }

  // Send to remote logging service (placeholder)
  private async sendToRemote(entry: LogEntry): Promise<void> {
    // In a real app, this would send to a logging service like Sentry, LogRocket, etc.
    // For now, just a placeholder
    try {
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   body: JSON.stringify(entry),
      // });
    } catch (e) {
      // Silently fail - don't want logging to break the app
    }
  }

  // Get session stats
  getSessionStats(): {
    sessionId: string;
    duration: number;
    logCount: number;
    errorCount: number;
  } {
    const sessionLogs = this.logs.filter(l => l.sessionId === this.SESSION_ID);
    return {
      sessionId: this.SESSION_ID,
      duration: sessionLogs.length > 0 
        ? Date.now() - sessionLogs[0].timestamp 
        : 0,
      logCount: sessionLogs.length,
      errorCount: sessionLogs.filter(l => l.level === LogLevel.Error).length,
    };
  }
}

export const logger = new LoggingService();

// Convenience function for components
export function useLogger(category: string) {
  return {
    debug: (msg: string, data?: Record<string, unknown>) => logger.debug(msg, data, category),
    info: (msg: string, data?: Record<string, unknown>) => logger.info(msg, data, category),
    warn: (msg: string, data?: Record<string, unknown>) => logger.warn(msg, data, category),
    error: (msg: string, data?: Record<string, unknown>) => logger.error(msg, data, category),
    startMark: (name: string) => logger.startMark(`${category}:${name}`),
    endMark: (name: string) => logger.endMark(`${category}:${name}`),
  };
}

export default logger;
