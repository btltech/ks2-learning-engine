/**
 * Drawing Review Service
 * 
 * Handles teacher review workflows for student drawings
 * Stores drawings for later review and tracks feedback
 * Uses localStorage as primary storage for simplicity
 */

export interface DrawingSubmission {
  id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  question: string;
  topic: string;
  subject: string;
  imageData: string; // Base64 encoded image
  submittedAt: string;
  reviewStatus: 'pending' | 'reviewed' | 'flagged';
  feedback?: string;
  score?: number; // 1-5 scale
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DrawingFeedback {
  score: number;
  feedback: string;
  reviewedBy: string;
}

const STORAGE_KEY = 'ks2_drawing_submissions';

class DrawingReviewService {
  private drawings: DrawingSubmission[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.drawings = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load drawings:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.drawings));
    } catch (e) {
      console.error('Failed to save drawings:', e);
    }
  }

  /**
   * Submit a drawing for review
   */
  submitDrawing(submission: Omit<DrawingSubmission, 'id' | 'reviewStatus' | 'submittedAt'>): string {
    const id = `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullSubmission: DrawingSubmission = {
      ...submission,
      id,
      reviewStatus: 'pending',
      submittedAt: new Date().toISOString(),
    };
    
    this.drawings.push(fullSubmission);
    this.saveToStorage();
    
    return id;
  }

  /**
   * Get pending drawings for review (for teachers/parents)
   */
  getPendingDrawings(studentId?: string): DrawingSubmission[] {
    return this.drawings
      .filter(d => 
        d.reviewStatus === 'pending' && 
        (!studentId || d.studentId === studentId)
      )
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  /**
   * Get all drawings for a student
   */
  getStudentDrawings(studentId: string): DrawingSubmission[] {
    return this.drawings
      .filter(d => d.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  /**
   * Submit feedback for a drawing
   */
  submitFeedback(drawingId: string, feedback: DrawingFeedback): boolean {
    const drawing = this.drawings.find(d => d.id === drawingId);
    if (!drawing) return false;
    
    drawing.feedback = feedback.feedback;
    drawing.score = feedback.score;
    drawing.reviewedBy = feedback.reviewedBy;
    drawing.reviewedAt = new Date().toISOString();
    drawing.reviewStatus = 'reviewed';
    
    this.saveToStorage();
    return true;
  }

  /**
   * Flag a drawing for further review
   */
  flagDrawing(drawingId: string, reason: string): boolean {
    const drawing = this.drawings.find(d => d.id === drawingId);
    if (!drawing) return false;
    
    drawing.reviewStatus = 'flagged';
    drawing.feedback = reason;
    
    this.saveToStorage();
    return true;
  }

  /**
   * Get reviewed drawings
   */
  getReviewedDrawings(studentId?: string): DrawingSubmission[] {
    return this.drawings
      .filter(d => 
        d.reviewStatus === 'reviewed' && 
        (!studentId || d.studentId === studentId)
      )
      .sort((a, b) => new Date(b.reviewedAt || b.submittedAt).getTime() - new Date(a.reviewedAt || a.submittedAt).getTime());
  }

  /**
   * Get statistics
   */
  getStatistics(studentId?: string): {
    total: number;
    pending: number;
    reviewed: number;
    flagged: number;
    averageScore: number;
  } {
    const filtered = studentId 
      ? this.drawings.filter(d => d.studentId === studentId)
      : this.drawings;
    
    const reviewed = filtered.filter(d => d.reviewStatus === 'reviewed' && d.score);
    const avgScore = reviewed.length > 0
      ? reviewed.reduce((sum, d) => sum + (d.score || 0), 0) / reviewed.length
      : 0;

    return {
      total: filtered.length,
      pending: filtered.filter(d => d.reviewStatus === 'pending').length,
      reviewed: filtered.filter(d => d.reviewStatus === 'reviewed').length,
      flagged: filtered.filter(d => d.reviewStatus === 'flagged').length,
      averageScore: Math.round(avgScore * 10) / 10,
    };
  }
}

export const drawingReviewService = new DrawingReviewService();
