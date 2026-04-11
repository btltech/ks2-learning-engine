/**
 * AI-Powered Adaptive Learning Engine
 * Adjusts difficulty, content, and pacing based on student performance
 */

export interface StudentPerformanceProfile {
  studentId: string;
  currentLevel: number; // 1-10
  learningPace: 'slow' | 'average' | 'fast';
  strengthAreas: string[];
  weaknessAreas: string[];
  recentPerformance: Array<{
    date: string;
    subject: string;
    topic: string;
    score: number;
    difficulty: string;
    timeSpent: number;
  }>;
  recommendedDifficulty: 'Easy' | 'Medium' | 'Hard';
  nextTopics: string[];
  masteryScores: { [topic: string]: number };
}

export interface AdaptiveRecommendation {
  type: 'difficulty_adjustment' | 'topic_recommendation' | 'intervention' | 'challenge';
  subject: string;
  topic: string;
  difficulty: string;
  reason: string;
  confidence: number; // 0-1
  priority: 'low' | 'medium' | 'high';
}

class AdaptiveLearningEngine {
  private readonly PERFORMANCE_WINDOW = 10; // Last 10 sessions
  private readonly MASTERY_THRESHOLD = 85;
  private readonly STRUGGLE_THRESHOLD = 60;
  
  /**
   * Analyze student performance and create adaptive profile
   */
  public analyzeStudent(studentId: string): StudentPerformanceProfile {
    const sessions = this.getRecentSessions(studentId);
    
    if (sessions.length === 0) {
      return this.getDefaultProfile(studentId);
    }
    
    // Calculate current level (1-10 scale)
    const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
    const currentLevel = Math.max(1, Math.min(10, Math.floor((averageScore / 10))));
    
    // Determine learning pace
    const recentSessions = sessions.slice(-5);
    const avgTimePerQuestion = recentSessions.reduce((sum, s) => {
      return sum + (s.timeSpent / (s.totalQuestions || 10));
    }, 0) / recentSessions.length;
    
    const learningPace = avgTimePerQuestion < 30 ? 'fast' 
                       : avgTimePerQuestion < 60 ? 'average'
                       : 'slow';
    
    // Identify strengths and weaknesses by subject
    const subjectScores = this.groupBySubject(sessions);
    const strengthAreas: string[] = [];
    const weaknessAreas: string[] = [];
    
    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg >= this.MASTERY_THRESHOLD) strengthAreas.push(subject);
      if (avg < this.STRUGGLE_THRESHOLD) weaknessAreas.push(subject);
    });
    
    // Calculate mastery scores by topic
    const masteryScores: { [topic: string]: number } = {};
    sessions.forEach(session => {
      const key = `${session.subject}:${session.topic}`;
      if (!masteryScores[key]) {
        masteryScores[key] = session.score;
      } else {
        // Weighted average (recent scores matter more)
        masteryScores[key] = masteryScores[key] * 0.7 + session.score * 0.3;
      }
    });
    
    // Recommend difficulty
    const recommendedDifficulty = this.calculateOptimalDifficulty(averageScore, learningPace);
    
    // Recommend next topics
    const nextTopics = this.recommendNextTopics(sessions, masteryScores);
    
    return {
      studentId,
      currentLevel,
      learningPace,
      strengthAreas,
      weaknessAreas,
      recentPerformance: sessions.slice(-10),
      recommendedDifficulty,
      nextTopics,
      masteryScores,
    };
  }
  
  /**
   * Generate adaptive recommendations for student
   */
  public generateRecommendations(studentId: string): AdaptiveRecommendation[] {
    const profile = this.analyzeStudent(studentId);
    const recommendations: AdaptiveRecommendation[] = [];
    
    // 1. Difficulty Adjustment Recommendations
    profile.recentPerformance.slice(-3).forEach((session) => {
      if (session.score >= 95) {
        recommendations.push({
          type: 'difficulty_adjustment',
          subject: session.subject,
          topic: session.topic,
          difficulty: 'Hard',
          reason: `Excellent performance (${session.score}%) indicates readiness for harder challenges`,
          confidence: 0.9,
          priority: 'medium',
        });
      } else if (session.score < 50) {
        recommendations.push({
          type: 'difficulty_adjustment',
          subject: session.subject,
          topic: session.topic,
          difficulty: 'Easy',
          reason: `Struggling with current level (${session.score}%). Easier content will build confidence`,
          confidence: 0.85,
          priority: 'high',
        });
      }
    });
    
    // 2. Intervention Recommendations for Weaknesses
    profile.weaknessAreas.forEach((subject) => {
      recommendations.push({
        type: 'intervention',
        subject,
        topic: 'Review Basics',
        difficulty: 'Easy',
        reason: `Identified weakness in ${subject}. Recommend focused review sessions`,
        confidence: 0.8,
        priority: 'high',
      });
    });
    
    // 3. Challenge Recommendations for Strengths
    profile.strengthAreas.forEach((subject) => {
      recommendations.push({
        type: 'challenge',
        subject,
        topic: 'Advanced Topics',
        difficulty: 'Hard',
        reason: `Strong performance in ${subject}. Ready for advanced challenges`,
        confidence: 0.85,
        priority: 'low',
      });
    });
    
    // 4. Topic Recommendations (Next Best Topics)
    profile.nextTopics.slice(0, 3).forEach((topic) => {
      recommendations.push({
        type: 'topic_recommendation',
        subject: topic.split(':')[0],
        topic: topic.split(':')[1],
        difficulty: profile.recommendedDifficulty,
        reason: 'Natural progression based on your learning path',
        confidence: 0.75,
        priority: 'medium',
      });
    });
    
    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.confidence - a.confidence;
    });
  }
  
  /**
   * Dynamically adjust question difficulty during quiz
   */
  public adjustQuizDifficulty(
    currentDifficulty: string,
    recentAnswers: boolean[],
    studentProfile: StudentPerformanceProfile
  ): string {
    if (recentAnswers.length < 3) return currentDifficulty;
    
    const last3 = recentAnswers.slice(-3);
    const correctCount = last3.filter(Boolean).length;
    
    // All correct → Increase difficulty
    if (correctCount === 3 && currentDifficulty !== 'Hard') {
      return currentDifficulty === 'Easy' ? 'Medium' : 'Hard';
    }
    
    // All wrong → Decrease difficulty
    if (correctCount === 0 && currentDifficulty !== 'Easy') {
      return currentDifficulty === 'Hard' ? 'Medium' : 'Easy';
    }
    
    // Consider learning pace
    if (studentProfile.learningPace === 'fast' && correctCount >= 2) {
      return 'Hard';
    }
    
    if (studentProfile.learningPace === 'slow' && correctCount <= 1) {
      return 'Easy';
    }
    
    return currentDifficulty;
  }
  
  /**
   * Predict optimal study time for student
   */
  public predictOptimalStudyTime(studentId: string): {
    recommendedMinutes: number;
    bestTimeOfDay: string;
    sessionFrequency: string;
  } {
    const profile = this.analyzeStudent(studentId);
    
    // Base recommendation on learning pace
    const baseMinutes = profile.learningPace === 'fast' ? 20
                      : profile.learningPace === 'average' ? 30
                      : 45;
    
    // Adjust for current level
    const levelAdjustment = Math.floor(profile.currentLevel / 2);
    const recommendedMinutes = baseMinutes + levelAdjustment;
    
    // Analyze best time of day from historical data
    const sessions = profile.recentPerformance;
    const timeScores: { [hour: string]: number[] } = {};
    
    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      
      if (!timeScores[timeOfDay]) timeScores[timeOfDay] = [];
      timeScores[timeOfDay].push(session.score);
    });
    
    let bestTimeOfDay = 'afternoon'; // default
    let bestScore = 0;
    
    Object.entries(timeScores).forEach(([time, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestScore) {
        bestScore = avg;
        bestTimeOfDay = time;
      }
    });
    
    // Recommend frequency
    const sessionFrequency = profile.currentLevel < 5 ? 'daily'
                           : profile.currentLevel < 8 ? '3-4 times per week'
                           : '2-3 times per week';
    
    return {
      recommendedMinutes,
      bestTimeOfDay,
      sessionFrequency,
    };
  }
  
  // Helper methods
  private getRecentSessions(studentId: string): any[] {
    const key = `ks2_quiz_sessions_${studentId}`;
    const data = localStorage.getItem(key);
    const sessions = data ? JSON.parse(data) : [];
    return sessions.slice(-this.PERFORMANCE_WINDOW);
  }
  
  private getDefaultProfile(studentId: string): StudentPerformanceProfile {
    return {
      studentId,
      currentLevel: 5,
      learningPace: 'average',
      strengthAreas: [],
      weaknessAreas: [],
      recentPerformance: [],
      recommendedDifficulty: 'Medium',
      nextTopics: [],
      masteryScores: {},
    };
  }
  
  private groupBySubject(sessions: any[]): { [subject: string]: number[] } {
    const grouped: { [subject: string]: number[] } = {};
    
    sessions.forEach(session => {
      if (!grouped[session.subject]) grouped[session.subject] = [];
      grouped[session.subject].push(session.score);
    });
    
    return grouped;
  }
  
  private calculateOptimalDifficulty(averageScore: number, pace: string): 'Easy' | 'Medium' | 'Hard' {
    if (averageScore >= 85 && pace === 'fast') return 'Hard';
    if (averageScore >= 75) return 'Medium';
    if (averageScore < 60) return 'Easy';
    return 'Medium';
  }
  
  private recommendNextTopics(sessions: any[], masteryScores: { [topic: string]: number }): string[] {
    const topicOrder: { [subject: string]: string[] } = {
      'Maths': ['Counting', 'Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions', 'Decimals'],
      'English': ['Phonics', 'Reading', 'Writing', 'Grammar', 'Vocabulary'],
      'Science': ['Living Things', 'Materials', 'Forces', 'Earth and Space', 'Light'],
    };
    
    const recommended: string[] = [];
    
    Object.entries(topicOrder).forEach(([subject, topics]) => {
      for (let i = 0; i < topics.length; i++) {
        const key = `${subject}:${topics[i]}`;
        const mastery = masteryScores[key] || 0;
        
        if (mastery < this.MASTERY_THRESHOLD && recommended.length < 5) {
          recommended.push(key);
        }
      }
    });
    
    return recommended;
  }
}

export const adaptiveLearningEngine = new AdaptiveLearningEngine();
export default adaptiveLearningEngine;
