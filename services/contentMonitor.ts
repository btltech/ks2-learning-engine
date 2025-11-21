// Content monitoring and logging service

interface ContentLog {
  timestamp: Date;
  type: 'topic' | 'lesson' | 'quiz' | 'explanation';
  subject?: string;
  topic?: string;
  validationIssues: string[];
  wasBlocked: boolean;
}

class ContentMonitor {
  private logs: ContentLog[] = [];
  private readonly maxLogs = 100;

  logValidationIssue(log: ContentLog): void {
    this.logs.push(log);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Only log blocked content to avoid console spam
    if (log.wasBlocked) {
      console.warn('[Content Validation - Blocked]', {
        type: log.type,
        subject: log.subject,
        topic: log.topic,
        issues: log.validationIssues
      });
    }

    // In production, you could send this to an analytics service
    // or monitoring dashboard to track content quality
  }

  getRecentIssues(count: number = 10): ContentLog[] {
    return this.logs.slice(-count);
  }

  getIssuesByType(type: ContentLog['type']): ContentLog[] {
    return this.logs.filter(log => log.type === type);
  }

  getBlockedContent(): ContentLog[] {
    return this.logs.filter(log => log.wasBlocked);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const contentMonitor = new ContentMonitor();
