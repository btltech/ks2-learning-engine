/**
 * Parent-Teacher Communication Service
 * 
 * Enables structured communication between parents and teachers
 * Includes progress reports, messaging, and meeting scheduling
 */

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher';
  recipientId: string;
  recipientName: string;
  recipientRole: 'parent' | 'teacher';
  studentId: string;
  studentName: string;
  subject: string;
  body: string;
  createdAt: number;
  readAt?: number;
  replyToId?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'progress-report' | 'screenshot' | 'achievement' | 'concern';
  title: string;
  data: unknown;
}

export interface ProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  createdAt: number;
  period: {
    start: string;
    end: string;
  };
  subjects: SubjectProgress[];
  overallComments: string;
  recommendations: string[];
  nextSteps: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  attendanceRate?: number;
  homeworkCompletionRate?: number;
}

export interface SubjectProgress {
  subject: string;
  level: 'below' | 'at' | 'above' | 'exceeding';
  recentScore: number;
  trend: 'improving' | 'stable' | 'declining';
  topicsCompleted: number;
  topicsMastered: number;
  comments: string;
}

export interface MeetingRequest {
  id: string;
  requesterId: string;
  requesterRole: 'parent' | 'teacher';
  studentId: string;
  studentName: string;
  purpose: string;
  preferredDates: string[];
  preferredTimes: string[];
  isVirtual: boolean;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmedDate?: string;
  confirmedTime?: string;
  meetingLink?: string;
  notes?: string;
}

export interface Concern {
  id: string;
  reporterId: string;
  reporterRole: 'parent' | 'teacher';
  studentId: string;
  type: 'academic' | 'behavioral' | 'wellbeing' | 'social' | 'other';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  createdAt: number;
  status: 'open' | 'in-progress' | 'resolved';
  responses: ConcernResponse[];
}

export interface ConcernResponse {
  id: string;
  responderId: string;
  responderRole: 'parent' | 'teacher';
  message: string;
  createdAt: number;
  actionTaken?: string;
}

class CommunicationService {
  private messages: Map<string, Message> = new Map();
  private reports: Map<string, ProgressReport> = new Map();
  private meetings: Map<string, MeetingRequest> = new Map();
  private concerns: Map<string, Concern> = new Map();
  
  private readonly MESSAGES_KEY = 'ks2_messages';
  private readonly REPORTS_KEY = 'ks2_progress_reports';
  private readonly MEETINGS_KEY = 'ks2_meetings';
  private readonly CONCERNS_KEY = 'ks2_concerns';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    this.loadCollection(this.MESSAGES_KEY, this.messages);
    this.loadCollection(this.REPORTS_KEY, this.reports);
    this.loadCollection(this.MEETINGS_KEY, this.meetings);
    this.loadCollection(this.CONCERNS_KEY, this.concerns);
  }

  private loadCollection<T extends { id: string }>(
    key: string,
    map: Map<string, T>
  ): void {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const items: T[] = JSON.parse(saved);
        items.forEach(item => map.set(item.id, item));
      }
    } catch (e) {
      console.error(`Failed to load ${key}:`, e);
    }
  }

  private saveCollection<T>(key: string, map: Map<string, T>): void {
    try {
      const items = Array.from(map.values());
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  }

  // === MESSAGING ===

  sendMessage(
    message: Omit<Message, 'id' | 'createdAt' | 'readAt'>
  ): Message {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMessage: Message = {
      ...message,
      id,
      createdAt: Date.now(),
    };

    this.messages.set(id, fullMessage);
    this.saveCollection(this.MESSAGES_KEY, this.messages);
    return fullMessage;
  }

  getMessagesForUser(userId: string): Message[] {
    return Array.from(this.messages.values())
      .filter(m => m.senderId === userId || m.recipientId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getUnreadCount(userId: string): number {
    return Array.from(this.messages.values())
      .filter(m => m.recipientId === userId && !m.readAt)
      .length;
  }

  markAsRead(messageId: string): void {
    const message = this.messages.get(messageId);
    if (message && !message.readAt) {
      message.readAt = Date.now();
      this.saveCollection(this.MESSAGES_KEY, this.messages);
    }
  }

  // === PROGRESS REPORTS ===

  createProgressReport(
    report: Omit<ProgressReport, 'id' | 'createdAt'>
  ): ProgressReport {
    const id = `report_${Date.now()}`;
    const fullReport: ProgressReport = {
      ...report,
      id,
      createdAt: Date.now(),
    };

    this.reports.set(id, fullReport);
    this.saveCollection(this.REPORTS_KEY, this.reports);
    return fullReport;
  }

  getReportsForStudent(studentId: string): ProgressReport[] {
    return Array.from(this.reports.values())
      .filter(r => r.studentId === studentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  generateAutomatedReport(
    studentId: string,
    studentName: string,
    teacherId: string,
    quizResults: { subject: string; score: number; date: number }[]
  ): ProgressReport {
    // Group results by subject
    const subjectData = new Map<string, { scores: number[]; dates: number[] }>();
    
    for (const result of quizResults) {
      const existing = subjectData.get(result.subject) || { scores: [], dates: [] };
      existing.scores.push(result.score);
      existing.dates.push(result.date);
      subjectData.set(result.subject, existing);
    }

    // Generate subject progress
    const subjects: SubjectProgress[] = Array.from(subjectData.entries()).map(([subject, data]) => {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const recentScores = data.scores.slice(-3);
      const trend = recentScores.length >= 2
        ? recentScores[recentScores.length - 1] > recentScores[0] 
          ? 'improving' 
          : recentScores[recentScores.length - 1] < recentScores[0] 
            ? 'declining' 
            : 'stable'
        : 'stable';

      return {
        subject,
        level: avgScore >= 90 ? 'exceeding' 
          : avgScore >= 70 ? 'above' 
          : avgScore >= 50 ? 'at' 
          : 'below',
        recentScore: Math.round(avgScore),
        trend,
        topicsCompleted: data.scores.length,
        topicsMastered: data.scores.filter(s => s >= 80).length,
        comments: this.generateSubjectComment(subject, avgScore, trend),
      };
    });

    // Identify strengths and improvements
    const sorted = [...subjects].sort((a, b) => b.recentScore - a.recentScore);
    const strengths = sorted.slice(0, 2).map(s => s.subject);
    const improvements = sorted.slice(-2).map(s => s.subject);

    return this.createProgressReport({
      studentId,
      studentName,
      teacherId,
      period: {
        start: new Date(Math.min(...quizResults.map(r => r.date))).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      subjects,
      overallComments: `${studentName} has been working hard this period.`,
      recommendations: [
        ...improvements.map(s => `Focus more practice time on ${s}`),
        'Continue regular study sessions',
      ],
      nextSteps: [
        'Review any incorrect answers from recent quizzes',
        'Try the spaced repetition feature for challenging topics',
      ],
      strengthAreas: strengths,
      improvementAreas: improvements,
    });
  }

  private generateSubjectComment(subject: string, score: number, trend: string): string {
    if (score >= 80) {
      return `Excellent progress in ${subject}. Keep up the great work!`;
    } else if (score >= 60) {
      return `Good understanding of ${subject} concepts. ${trend === 'improving' ? 'Progress is improving!' : 'Continue practicing regularly.'}`;
    } else {
      return `More practice needed in ${subject}. Consider using the review features more regularly.`;
    }
  }

  // === MEETINGS ===

  requestMeeting(
    request: Omit<MeetingRequest, 'id' | 'status'>
  ): MeetingRequest {
    const id = `meeting_${Date.now()}`;
    const fullRequest: MeetingRequest = {
      ...request,
      id,
      status: 'pending',
    };

    this.meetings.set(id, fullRequest);
    this.saveCollection(this.MEETINGS_KEY, this.meetings);
    return fullRequest;
  }

  confirmMeeting(
    meetingId: string,
    confirmedDate: string,
    confirmedTime: string,
    meetingLink?: string
  ): MeetingRequest | null {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) return null;

    meeting.status = 'confirmed';
    meeting.confirmedDate = confirmedDate;
    meeting.confirmedTime = confirmedTime;
    meeting.meetingLink = meetingLink;

    this.saveCollection(this.MEETINGS_KEY, this.meetings);
    return meeting;
  }

  // === CONCERNS ===

  raiseConcern(
    concern: Omit<Concern, 'id' | 'createdAt' | 'status' | 'responses'>
  ): Concern {
    const id = `concern_${Date.now()}`;
    const fullConcern: Concern = {
      ...concern,
      id,
      createdAt: Date.now(),
      status: 'open',
      responses: [],
    };

    this.concerns.set(id, fullConcern);
    this.saveCollection(this.CONCERNS_KEY, this.concerns);
    return fullConcern;
  }

  respondToConcern(
    concernId: string,
    response: Omit<ConcernResponse, 'id' | 'createdAt'>
  ): Concern | null {
    const concern = this.concerns.get(concernId);
    if (!concern) return null;

    const fullResponse: ConcernResponse = {
      ...response,
      id: `resp_${Date.now()}`,
      createdAt: Date.now(),
    };

    concern.responses.push(fullResponse);
    concern.status = 'in-progress';

    this.saveCollection(this.CONCERNS_KEY, this.concerns);
    return concern;
  }

  getConcernsForStudent(studentId: string): Concern[] {
    return Array.from(this.concerns.values())
      .filter(c => c.studentId === studentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const communicationService = new CommunicationService();

export default communicationService;
