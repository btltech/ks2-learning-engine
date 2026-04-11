/**
 * Homework Assignment System
 * For teachers to create, assign, and grade homework
 */

export interface Homework {
  homeworkId: string;
  teacherId: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  dueDate: string;
  createdAt: string;
  assignedTo: string[]; // class IDs or student IDs
  submissions: HomeworkSubmission[];
}

export interface HomeworkSubmission {
  submissionId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // seconds
  answers: Array<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
  feedback?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  reviewed: boolean;
}

class HomeworkService {
  private storageKey = 'ks2_homework';
  private submissionsKey = 'ks2_homework_submissions';
  
  // Create homework
  public createHomework(
    teacherId: string,
    title: string,
    description: string,
    subject: string,
    topics: string[],
    difficulty: 'Easy' | 'Medium' | 'Hard',
    questionCount: number,
    dueDate: string,
    assignedTo: string[]
  ): Homework {
    const homework: Homework = {
      homeworkId: `hw_${Date.now()}`,
      teacherId,
      title,
      description,
      subject,
      topics,
      difficulty,
      questionCount,
      dueDate,
      createdAt: new Date().toISOString(),
      assignedTo,
      submissions: [],
    };
    
    const allHomework = this.getAllHomework();
    allHomework.push(homework);
    localStorage.setItem(this.storageKey, JSON.stringify(allHomework));
    
    return homework;
  }
  
  // Get homework by teacher
  public getTeacherHomework(teacherId: string): Homework[] {
    const allHomework = this.getAllHomework();
    return allHomework.filter(hw => hw.teacherId === teacherId);
  }
  
  // Get homework for student
  public getStudentHomework(studentId: string, classIds: string[]): Homework[] {
    const allHomework = this.getAllHomework();
    
    return allHomework.filter(hw => {
      // Check if assigned to student's classes or directly to student
      return hw.assignedTo.some(id => classIds.includes(id) || id === studentId);
    }).map(hw => {
      // Add submission status
      const submission = this.getSubmission(hw.homeworkId, studentId);
      return {
        ...hw,
        submissions: submission ? [submission] : [],
      };
    });
  }
  
  // Submit homework
  public submitHomework(
    homeworkId: string,
    studentId: string,
    studentName: string,
    answers: HomeworkSubmission['answers'],
    timeSpent: number
  ): HomeworkSubmission {
    const homework = this.getHomework(homeworkId);
    
    if (!homework) {
      throw new Error('Homework not found');
    }
    
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = (correctAnswers / answers.length) * 100;
    const grade = this.calculateGrade(score);
    
    const submission: HomeworkSubmission = {
      submissionId: `sub_${Date.now()}`,
      homeworkId,
      studentId,
      studentName,
      submittedAt: new Date().toISOString(),
      score,
      totalQuestions: answers.length,
      timeSpent,
      answers,
      grade,
      reviewed: false,
    };
    
    // Save submission
    const submissions = this.getSubmissions(homeworkId);
    submissions.push(submission);
    this.saveSubmissions(homeworkId, submissions);
    
    return submission;
  }
  
  // Add feedback to submission
  public addFeedback(submissionId: string, feedback: string): void {
    const allSubmissions = this.getAllSubmissions();
    const submission = allSubmissions.find(s => s.submissionId === submissionId);
    
    if (submission) {
      submission.feedback = feedback;
      submission.reviewed = true;
      this.saveAllSubmissions(allSubmissions);
    }
  }
  
  // Get homework details
  public getHomework(homeworkId: string): Homework | null {
    const allHomework = this.getAllHomework();
    return allHomework.find(hw => hw.homeworkId === homeworkId) || null;
  }
  
  // Get submission
  public getSubmission(homeworkId: string, studentId: string): HomeworkSubmission | null {
    const submissions = this.getSubmissions(homeworkId);
    return submissions.find(s => s.studentId === studentId) || null;
  }
  
  // Get all submissions for homework
  public getSubmissions(homeworkId: string): HomeworkSubmission[] {
    const allSubmissions = this.getAllSubmissions();
    return allSubmissions.filter(s => s.homeworkId === homeworkId);
  }
  
  // Check if overdue
  public isOverdue(homework: Homework): boolean {
    return new Date(homework.dueDate) < new Date();
  }
  
  // Get homework statistics
  public getHomeworkStats(homeworkId: string): {
    totalAssigned: number;
    submitted: number;
    pending: number;
    averageScore: number;
    averageTime: number;
    onTimeSubmissions: number;
    lateSubmissions: number;
  } {
    const homework = this.getHomework(homeworkId);
    if (!homework) {
      throw new Error('Homework not found');
    }
    
    const submissions = this.getSubmissions(homeworkId);
    const totalAssigned = homework.assignedTo.length;
    const submitted = submissions.length;
    const pending = totalAssigned - submitted;
    
    const averageScore = submitted > 0
      ? submissions.reduce((sum, s) => sum + s.score, 0) / submitted
      : 0;
    
    const averageTime = submitted > 0
      ? submissions.reduce((sum, s) => sum + s.timeSpent, 0) / submitted
      : 0;
    
    const dueDate = new Date(homework.dueDate);
    const onTimeSubmissions = submissions.filter(s => new Date(s.submittedAt) <= dueDate).length;
    const lateSubmissions = submitted - onTimeSubmissions;
    
    return {
      totalAssigned,
      submitted,
      pending,
      averageScore: Math.round(averageScore),
      averageTime: Math.round(averageTime / 60), // minutes
      onTimeSubmissions,
      lateSubmissions,
    };
  }
  
  // Helper methods
  private getAllHomework(): Homework[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
  
  private getAllSubmissions(): HomeworkSubmission[] {
    const data = localStorage.getItem(this.submissionsKey);
    return data ? JSON.parse(data) : [];
  }
  
  private saveSubmissions(homeworkId: string, submissions: HomeworkSubmission[]): void {
    const allSubmissions = this.getAllSubmissions();
    const filtered = allSubmissions.filter(s => s.homeworkId !== homeworkId);
    const updated = [...filtered, ...submissions];
    this.saveAllSubmissions(updated);
  }
  
  private saveAllSubmissions(submissions: HomeworkSubmission[]): void {
    localStorage.setItem(this.submissionsKey, JSON.stringify(submissions));
  }
  
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

export const homeworkService = new HomeworkService();
export default homeworkService;
