/**
 * Enhanced Teacher Analytics Service
 * Comprehensive class management and student tracking
 */

export interface StudentProgress {
  studentId: string;
  studentName: string;
  grade: string;
  totalQuizzes: number;
  averageScore: number;
  timeSpent: number; // minutes
  subjectMastery: {
    [subject: string]: number; // percentage
  };
  recentActivity: Array<{
    date: string;
    subject: string;
    topic: string;
    score: number;
    timeSpent: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  lastActive: string;
}

export interface ClassData {
  classId: string;
  className: string;
  teacherId: string;
  students: string[]; // student IDs
  grade: string;
  createdAt: string;
}

export interface ClassAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  averageScore: number;
  totalQuizzes: number;
  totalTimeSpent: number;
  subjectPerformance: {
    [subject: string]: {
      averageScore: number;
      quizzesCompleted: number;
      topTopics: string[];
      strugglingTopics: string[];
    };
  };
  topPerformers: StudentProgress[];
  needingHelp: StudentProgress[];
}

class TeacherAnalyticsService {
  private storageKey = 'ks2_teacher_classes';
  
  // Class Management
  public createClass(teacherId: string, className: string, grade: string): ClassData {
    const classes = this.getClasses(teacherId);
    
    const newClass: ClassData = {
      classId: `class_${Date.now()}`,
      className,
      teacherId,
      students: [],
      grade,
      createdAt: new Date().toISOString(),
    };
    
    classes.push(newClass);
    this.saveClasses(teacherId, classes);
    
    return newClass;
  }
  
  public getClasses(teacherId: string): ClassData[] {
    const key = `${this.storageKey}_${teacherId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  private saveClasses(teacherId: string, classes: ClassData[]): void {
    const key = `${this.storageKey}_${teacherId}`;
    localStorage.setItem(key, JSON.stringify(classes));
  }
  
  public addClass(teacherId: string, classData: ClassData): void {
    const classes = this.getClasses(teacherId);
    classes.push(classData);
    this.saveClasses(teacherId, classes);
  }
  
  public addStudentToClass(teacherId: string, classId: string, studentId: string): void {
    const classes = this.getClasses(teacherId);
    const classData = classes.find(c => c.classId === classId);
    
    if (classData && !classData.students.includes(studentId)) {
      classData.students.push(studentId);
      this.saveClasses(teacherId, classes);
    }
  }
  
  public removeStudentFromClass(teacherId: string, classId: string, studentId: string): void {
    const classes = this.getClasses(teacherId);
    const classData = classes.find(c => c.classId === classId);
    
    if (classData) {
      classData.students = classData.students.filter(id => id !== studentId);
      this.saveClasses(teacherId, classes);
    }
  }
  
  // Student Progress Tracking
  public getStudentProgress(studentId: string): StudentProgress {
    // Get from user context/storage
    const userData = this.getUserData(studentId);
    const sessions = this.getStudentSessions(studentId);
    
    const recentActivity = sessions.slice(-10).map(session => ({
      date: session.completedAt,
      subject: session.subject,
      topic: session.topic,
      score: session.score,
      timeSpent: session.timeSpent,
    }));
    
    const subjectScores: { [subject: string]: number[] } = {};
    sessions.forEach(session => {
      if (!subjectScores[session.subject]) {
        subjectScores[session.subject] = [];
      }
      subjectScores[session.subject].push(session.score);
    });
    
    const subjectMastery: { [subject: string]: number } = {};
    Object.entries(subjectScores).forEach(([subject, scores]) => {
      subjectMastery[subject] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    
    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    Object.entries(subjectMastery).forEach(([subject, score]) => {
      if (score >= 80) strengths.push(subject);
      if (score < 60) weaknesses.push(subject);
    });
    
    return {
      studentId,
      studentName: userData.name || 'Student',
      grade: userData.grade || 'N/A',
      totalQuizzes: sessions.length,
      averageScore: sessions.reduce((sum, s) => sum + s.score, 0) / (sessions.length || 1),
      timeSpent: sessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0),
      subjectMastery,
      recentActivity,
      strengths,
      weaknesses,
      lastActive: sessions.length > 0 ? sessions[sessions.length - 1].completedAt : 'Never',
    };
  }
  
  public getClassAnalytics(teacherId: string, classId: string): ClassAnalytics {
    const classes = this.getClasses(teacherId);
    const classData = classes.find(c => c.classId === classId);
    
    if (!classData) {
      throw new Error('Class not found');
    }
    
    const studentProgresses = classData.students.map(studentId => 
      this.getStudentProgress(studentId)
    );
    
    const totalQuizzes = studentProgresses.reduce((sum, s) => sum + s.totalQuizzes, 0);
    const averageScore = studentProgresses.reduce((sum, s) => sum + s.averageScore, 0) / (studentProgresses.length || 1);
    const totalTimeSpent = studentProgresses.reduce((sum, s) => sum + s.timeSpent, 0);
    
    // Subject performance analysis
    const subjectPerformance: ClassAnalytics['subjectPerformance'] = {};
    const subjects = ['Maths', 'English', 'Science', 'History', 'Geography'];
    
    subjects.forEach(subject => {
      const scores = studentProgresses
        .map(s => s.subjectMastery[subject])
        .filter(score => score !== undefined);
      
      if (scores.length > 0) {
        subjectPerformance[subject] = {
          averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
          quizzesCompleted: scores.length,
          topTopics: [], // Could be enhanced with more data
          strugglingTopics: [],
        };
      }
    });
    
    // Top performers and students needing help
    const sorted = [...studentProgresses].sort((a, b) => b.averageScore - a.averageScore);
    const topPerformers = sorted.slice(0, 5);
    const needingHelp = sorted.filter(s => s.averageScore < 60).slice(0, 5);
    
    return {
      classId,
      className: classData.className,
      totalStudents: studentProgresses.length,
      averageScore,
      totalQuizzes,
      totalTimeSpent,
      subjectPerformance,
      topPerformers,
      needingHelp,
    };
  }
  
  // Helper methods
  private getUserData(studentId: string): any {
    const key = `ks2_user_${studentId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { name: 'Student', grade: 'N/A' };
  }
  
  private getStudentSessions(studentId: string): any[] {
    const key = `ks2_quiz_sessions_${studentId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  // Export reports
  public exportClassReport(teacherId: string, classId: string): string {
    const analytics = this.getClassAnalytics(teacherId, classId);
    
    const report = {
      generatedAt: new Date().toISOString(),
      className: analytics.className,
      summary: {
        totalStudents: analytics.totalStudents,
        averageScore: Math.round(analytics.averageScore),
        totalQuizzes: analytics.totalQuizzes,
        totalTimeSpent: Math.round(analytics.totalTimeSpent / 60), // hours
      },
      subjectPerformance: analytics.subjectPerformance,
      topPerformers: analytics.topPerformers.map(s => ({
        name: s.studentName,
        averageScore: Math.round(s.averageScore),
        totalQuizzes: s.totalQuizzes,
      })),
      needingHelp: analytics.needingHelp.map(s => ({
        name: s.studentName,
        averageScore: Math.round(s.averageScore),
        weaknesses: s.weaknesses,
      })),
    };
    
    return JSON.stringify(report, null, 2);
  }
}

export const teacherAnalyticsService = new TeacherAnalyticsService();
export default teacherAnalyticsService;
