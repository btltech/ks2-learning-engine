/**
 * Analytics Service
 * 
 * Tracks and analyzes learning patterns, performance metrics, and usage data
 * Provides insights for students, parents, and teachers
 */

import { Difficulty, QuizSession, Subject, Topic } from '../types';

// Types
export interface TopicPerformance {
  subject: Subject;
  topic: Topic;
  totalAttempts: number;
  avgScore: number;
  avgTimePerQuestion: number;
  bestScore: number;
  lastAttempt: string;
  trend: 'improving' | 'declining' | 'stable';
  masteryLevel: 'struggling' | 'learning' | 'proficient' | 'mastered';
}

export interface DailyActivity {
  date: string;
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpentMinutes: number;
  xpEarned: number;
  subjectsStudied: Subject[];
}

export interface StudyPattern {
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  avgSessionLength: number; // minutes
  avgQuestionsPerSession: number;
  mostActiveDay: string;
  leastActiveDay: string;
  peakHour: number;
}

export interface StruggleTopic {
  subject: Subject;
  topic: Topic;
  score: number;
  attempts: number;
  suggestion: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  avgAccuracy: number;
  totalTimeMinutes: number;
  xpEarned: number;
  streakDays: number;
  topSubject: Subject | null;
  struggleAreas: StruggleTopic[];
  achievements: string[];
  comparedToLastWeek: {
    quizzes: number;
    accuracy: number;
    time: number;
  };
}

export interface AnalyticsSummary {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  overallAccuracy: number;
  totalTimeMinutes: number;
  topicPerformance: TopicPerformance[];
  dailyActivity: DailyActivity[];
  studyPattern: StudyPattern;
  weeklyReport: WeeklyReport;
  recommendations: string[];
}

// Storage keys
const ANALYTICS_KEY = 'ks2_analytics_data';
const SESSIONS_KEY = 'ks2_session_history';

class AnalyticsService {
  private sessions: QuizSession[] = [];
  private dailyData: Map<string, DailyActivity> = new Map();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const storedSessions = localStorage.getItem(SESSIONS_KEY);
      if (storedSessions) {
        this.sessions = JSON.parse(storedSessions);
      }

      const storedDaily = localStorage.getItem(ANALYTICS_KEY);
      if (storedDaily) {
        const parsed = JSON.parse(storedDaily);
        this.dailyData = new Map(Object.entries(parsed.dailyData || {}));
      }
    } catch (e) {
      console.error('[Analytics] Error loading data:', e);
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(this.sessions.slice(-500))); // Keep last 500 sessions
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify({
        dailyData: Object.fromEntries(this.dailyData),
        lastUpdated: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('[Analytics] Error saving data:', e);
    }
  }

  /**
   * Record a completed quiz session
   */
  recordSession(session: QuizSession): void {
    this.sessions.push(session);
    
    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    const daily = this.dailyData.get(today) || {
      date: today,
      quizzesCompleted: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpentMinutes: 0,
      xpEarned: 0,
      subjectsStudied: [],
    };

    daily.quizzesCompleted += 1;
    daily.questionsAnswered += session.totalQuestions;
    daily.correctAnswers += session.correctAnswers;
    daily.timeSpentMinutes += session.timeSpent / 60;
    daily.xpEarned += session.xpEarned;
    
    if (!daily.subjectsStudied.includes(session.subject)) {
      daily.subjectsStudied.push(session.subject);
    }

    this.dailyData.set(today, daily);
    this.saveData();
  }

  /**
   * Get topic performance analysis
   */
  getTopicPerformance(): TopicPerformance[] {
    const topicMap = new Map<string, QuizSession[]>();

    // Group sessions by topic
    this.sessions.forEach(session => {
      const key = `${session.subject}::${session.topic}`;
      const existing = topicMap.get(key) || [];
      existing.push(session);
      topicMap.set(key, existing);
    });

    const performances: TopicPerformance[] = [];

    topicMap.forEach((sessions, key) => {
      const [subject, topic] = key.split('::') as [Subject, Topic];
      const sorted = sessions.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const totalAttempts = sessions.length;
      const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalAttempts;
      const avgTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0) / 
                     sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
      const bestScore = Math.max(...sessions.map(s => s.score));

      // Calculate trend (last 3 vs previous 3)
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (sorted.length >= 6) {
        const recent = sorted.slice(-3);
        const previous = sorted.slice(-6, -3);
        const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / 3;
        const prevAvg = previous.reduce((sum, s) => sum + s.score, 0) / 3;
        if (recentAvg > prevAvg + 5) trend = 'improving';
        else if (recentAvg < prevAvg - 5) trend = 'declining';
      }

      // Determine mastery level
      let masteryLevel: TopicPerformance['masteryLevel'];
      if (avgScore >= 90) masteryLevel = 'mastered';
      else if (avgScore >= 70) masteryLevel = 'proficient';
      else if (avgScore >= 50) masteryLevel = 'learning';
      else masteryLevel = 'struggling';

      performances.push({
        subject,
        topic,
        totalAttempts,
        avgScore: Math.round(avgScore * 10) / 10,
        avgTimePerQuestion: Math.round(avgTime * 10) / 10,
        bestScore,
        lastAttempt: sorted[sorted.length - 1]?.date || '',
        trend,
        masteryLevel,
      });
    });

    return performances.sort((a, b) => a.avgScore - b.avgScore);
  }

  /**
   * Get struggling topics that need attention
   */
  getStrugglingTopics(limit: number = 5): StruggleTopic[] {
    const performances = this.getTopicPerformance();
    
    return performances
      .filter(p => p.masteryLevel === 'struggling' || p.masteryLevel === 'learning')
      .slice(0, limit)
      .map(p => ({
        subject: p.subject,
        topic: p.topic,
        score: p.avgScore,
        attempts: p.totalAttempts,
        suggestion: this.getSuggestionForTopic(p),
      }));
  }

  private getSuggestionForTopic(perf: TopicPerformance): string {
    if (perf.trend === 'improving') {
      return 'Keep practicing! You\'re getting better!';
    }
    if (perf.avgScore < 40) {
      return `Try starting with Easy difficulty on ${perf.topic} lessons.`;
    }
    if (perf.totalAttempts < 3) {
      return `Practice ${perf.topic} a few more times to build confidence.`;
    }
    return `Review the ${perf.topic} lesson before trying the quiz again.`;
  }

  /**
   * Get daily activity history
   */
  getDailyActivity(days: number = 30): DailyActivity[] {
    const activities: DailyActivity[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const activity = this.dailyData.get(dateStr) || {
        date: dateStr,
        quizzesCompleted: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        timeSpentMinutes: 0,
        xpEarned: 0,
        subjectsStudied: [],
      };

      activities.push(activity);
    }

    return activities.reverse();
  }

  /**
   * Analyze study patterns
   */
  getStudyPattern(): StudyPattern {
    const hourCounts = new Array(24).fill(0);
    const dayCounts: { [key: string]: number } = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0,
      Thursday: 0, Friday: 0, Saturday: 0,
    };
    let totalSessionTime = 0;
    let totalQuestions = 0;

    this.sessions.forEach(session => {
      const date = new Date(session.date);
      hourCounts[date.getHours()]++;
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      dayCounts[dayName]++;
      totalSessionTime += session.timeSpent;
      totalQuestions += session.totalQuestions;
    });

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    let preferredTime: StudyPattern['preferredTime'];
    if (peakHour >= 5 && peakHour < 12) preferredTime = 'morning';
    else if (peakHour >= 12 && peakHour < 17) preferredTime = 'afternoon';
    else if (peakHour >= 17 && peakHour < 21) preferredTime = 'evening';
    else preferredTime = 'night';

    const days = Object.entries(dayCounts);
    const mostActiveDay = days.reduce((a, b) => b[1] > a[1] ? b : a)[0];
    const leastActiveDay = days.reduce((a, b) => b[1] < a[1] ? b : a)[0];

    return {
      preferredTime,
      avgSessionLength: this.sessions.length > 0 
        ? Math.round(totalSessionTime / this.sessions.length / 60) 
        : 0,
      avgQuestionsPerSession: this.sessions.length > 0 
        ? Math.round(totalQuestions / this.sessions.length) 
        : 0,
      mostActiveDay,
      leastActiveDay,
      peakHour,
    };
  }

  /**
   * Generate weekly report
   */
  getWeeklyReport(): WeeklyReport {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setTime(weekStart.getTime() - 1);

    // Current week sessions
    const currentWeek = this.sessions.filter(s => {
      const d = new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });

    // Previous week sessions
    const prevWeek = this.sessions.filter(s => {
      const d = new Date(s.date);
      return d >= prevWeekStart && d <= prevWeekEnd;
    });

    const totalQuizzes = currentWeek.length;
    const totalQuestions = currentWeek.reduce((sum, s) => sum + s.totalQuestions, 0);
    const correctAnswers = currentWeek.reduce((sum, s) => sum + s.correctAnswers, 0);
    const avgAccuracy = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 100) 
      : 0;
    const totalTimeMinutes = Math.round(
      currentWeek.reduce((sum, s) => sum + s.timeSpent, 0) / 60
    );
    const xpEarned = currentWeek.reduce((sum, s) => sum + s.xpEarned, 0);

    // Find top subject
    const subjectCounts: { [key: string]: number } = {};
    currentWeek.forEach(s => {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    });
    const topSubject = Object.keys(subjectCounts).length > 0
      ? Object.entries(subjectCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0] as Subject
      : null;

    // Calculate streak days this week
    const uniqueDays = new Set(currentWeek.map(s => s.date.split('T')[0]));
    
    // Comparison to last week
    const prevQuizzes = prevWeek.length;
    const prevQuestions = prevWeek.reduce((sum, s) => sum + s.totalQuestions, 0);
    const prevCorrect = prevWeek.reduce((sum, s) => sum + s.correctAnswers, 0);
    const prevAccuracy = prevQuestions > 0 ? (prevCorrect / prevQuestions) * 100 : 0;
    const prevTime = prevWeek.reduce((sum, s) => sum + s.timeSpent, 0) / 60;

    // Achievements this week
    const achievements: string[] = [];
    if (totalQuizzes >= 10) achievements.push('Completed 10+ quizzes');
    if (avgAccuracy >= 90) achievements.push('90%+ accuracy');
    if (uniqueDays.size >= 5) achievements.push('5+ active days');
    if (totalTimeMinutes >= 60) achievements.push('1+ hour of learning');

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalQuizzes,
      totalQuestions,
      correctAnswers,
      avgAccuracy,
      totalTimeMinutes,
      xpEarned,
      streakDays: uniqueDays.size,
      topSubject,
      struggleAreas: this.getStrugglingTopics(3),
      achievements,
      comparedToLastWeek: {
        quizzes: totalQuizzes - prevQuizzes,
        accuracy: Math.round((avgAccuracy - prevAccuracy) * 10) / 10,
        time: Math.round(totalTimeMinutes - prevTime),
      },
    };
  }

  /**
   * Generate personalized recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const pattern = this.getStudyPattern();
    const struggling = this.getStrugglingTopics(3);
    const weeklyReport = this.getWeeklyReport();

    // Based on study patterns
    if (pattern.avgSessionLength < 5) {
      recommendations.push('Try longer study sessions (10-15 minutes) for better retention.');
    }

    if (pattern.avgQuestionsPerSession < 5) {
      recommendations.push('Challenge yourself with more questions per session!');
    }

    // Based on struggling topics
    if (struggling.length > 0) {
      const topic = struggling[0];
      recommendations.push(
        `Focus on ${topic.subject} - ${topic.topic}. Consider reviewing the lesson first.`
      );
    }

    // Based on weekly progress
    if (weeklyReport.comparedToLastWeek.quizzes < 0) {
      recommendations.push('Your activity dropped this week. Try to maintain consistency!');
    }

    if (weeklyReport.avgAccuracy < 70) {
      recommendations.push('Consider trying easier difficulties to build confidence.');
    }

    // General encouragement
    if (weeklyReport.totalQuizzes === 0) {
      recommendations.push('Start your week strong with a quick quiz session!');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep up the excellent learning!');
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Get full analytics summary
   */
  getSummary(): AnalyticsSummary {
    const topicPerformance = this.getTopicPerformance();
    const dailyActivity = this.getDailyActivity(30);
    const studyPattern = this.getStudyPattern();
    const weeklyReport = this.getWeeklyReport();
    const recommendations = this.getRecommendations();

    const totalQuizzes = this.sessions.length;
    const totalQuestions = this.sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const correctAnswers = this.sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalTimeMinutes = Math.round(
      this.sessions.reduce((sum, s) => sum + s.timeSpent, 0) / 60
    );

    return {
      totalQuizzes,
      totalQuestions,
      correctAnswers,
      overallAccuracy: totalQuestions > 0 
        ? Math.round((correctAnswers / totalQuestions) * 100) 
        : 0,
      totalTimeMinutes,
      topicPerformance,
      dailyActivity,
      studyPattern,
      weeklyReport,
      recommendations,
    };
  }

  /**
   * Export data for parent reports
   */
  exportForParentReport(): {
    summary: AnalyticsSummary;
    recentSessions: QuizSession[];
  } {
    return {
      summary: this.getSummary(),
      recentSessions: this.sessions.slice(-20).reverse(),
    };
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.sessions = [];
    this.dailyData.clear();
    localStorage.removeItem(ANALYTICS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
  }
}

export const analyticsService = new AnalyticsService();
