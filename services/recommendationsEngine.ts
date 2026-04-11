/**
 * Smart Recommendations Engine
 * ML-based personalized learning path and content suggestions
 */

export interface RecommendationItem {
  id: string;
  type: 'quiz' | 'lesson' | 'game' | 'review' | 'challenge';
  subject: string;
  topic: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: number; // minutes
  relevanceScore: number; // 0-1
  reason: string;
  tags: string[];
}

export interface LearningPath {
  pathId: string;
  studentId: string;
  title: string;
  description: string;
  steps: Array<{
    stepNumber: number;
    subject: string;
    topic: string;
    difficulty: string;
    completed: boolean;
    score?: number;
  }>;
  progress: number; // 0-100
  estimatedCompletionTime: number; // minutes
  createdAt: string;
}

class RecommendationsEngine {
  /**
   * Generate personalized recommendations for student
   */
  public generateRecommendations(studentId: string, count: number = 10): RecommendationItem[] {
    const sessions = this.getStudentSessions(studentId);
    const profile = this.buildStudentProfile(sessions);
    
    const recommendations: RecommendationItem[] = [];
    
    // 1. Review weak areas
    profile.weakTopics.forEach((topic) => {
      recommendations.push({
        id: `review_${topic.subject}_${topic.topic}`,
        type: 'review',
        subject: topic.subject,
        topic: topic.topic,
        title: `Review ${topic.topic}`,
        description: `Strengthen your understanding of ${topic.topic}`,
        difficulty: 'Easy',
        estimatedTime: 15,
        relevanceScore: 0.95,
        reason: `You scored ${topic.score}% on this topic. A review will help!`,
        tags: ['review', 'improvement', topic.subject.toLowerCase()],
      });
    });
    
    // 2. Next progression topics
    profile.nextTopics.forEach((topic) => {
      recommendations.push({
        id: `next_${topic.subject}_${topic.topic}`,
        type: 'lesson',
        subject: topic.subject,
        topic: topic.topic,
        title: `Learn ${topic.topic}`,
        description: `Continue your learning journey with ${topic.topic}`,
        difficulty: profile.recommendedDifficulty,
        estimatedTime: 20,
        relevanceScore: 0.85,
        reason: 'Natural next step in your learning path',
        tags: ['new', 'progression', topic.subject.toLowerCase()],
      });
    });
    
    // 3. Challenge strong areas
    profile.strongTopics.forEach((topic) => {
      recommendations.push({
        id: `challenge_${topic.subject}_${topic.topic}`,
        type: 'challenge',
        subject: topic.subject,
        topic: topic.topic,
        title: `${topic.topic} Challenge`,
        description: `Test your mastery with advanced ${topic.topic} questions`,
        difficulty: 'Hard',
        estimatedTime: 10,
        relevanceScore: 0.75,
        reason: `You're excellent at ${topic.topic}! Ready for a challenge?`,
        tags: ['challenge', 'advanced', topic.subject.toLowerCase()],
      });
    });
    
    // 4. Gamified learning (if high engagement)
    if (profile.engagementLevel > 0.7) {
      const subjects = ['Maths', 'English', 'Science'];
      subjects.forEach(subject => {
        recommendations.push({
          id: `game_${subject}`,
          type: 'game',
          subject,
          topic: 'Mixed',
          title: `${subject} Mini-Game`,
          description: `Fun ${subject} challenges and puzzles`,
          difficulty: 'Medium',
          estimatedTime: 5,
          relevanceScore: 0.65,
          reason: 'Take a fun break while learning!',
          tags: ['game', 'fun', subject.toLowerCase()],
        });
      });
    }
    
    // 5. Time-based recommendations
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 6 && hour < 9) {
      // Morning: Quick review
      recommendations.push({
        id: 'morning_review',
        type: 'review',
        subject: profile.strongTopics[0]?.subject || 'Maths',
        topic: 'Quick Review',
        title: 'Morning Brain Warm-up',
        description: '5-minute morning review to start your day',
        difficulty: 'Easy',
        estimatedTime: 5,
        relevanceScore: 0.8,
        reason: 'Perfect morning warm-up to boost your day!',
        tags: ['morning', 'quick', 'review'],
      });
    }
    
    // Sort by relevance score
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Return top N recommendations
    return recommendations.slice(0, count);
  }
  
  /**
   * Create personalized learning path for student
   */
  public createLearningPath(studentId: string, subject: string, targetLevel: number): LearningPath {
    const sessions = this.getStudentSessions(studentId);
    const currentLevel = this.estimateLevel(sessions, subject);
    
    const topicProgression = this.getTopicProgression(subject);
    const startIndex = Math.max(0, currentLevel - 1);
    const endIndex = Math.min(topicProgression.length, targetLevel);
    
    const steps = topicProgression.slice(startIndex, endIndex).map((topic, index) => {
      const topicKey = `${subject}:${topic}`;
      const completed = this.isTopicCompleted(sessions, subject, topic);
      const score = this.getTopicScore(sessions, subject, topic);
      
      return {
        stepNumber: index + 1,
        subject,
        topic,
        difficulty: index < 3 ? 'Easy' : index < 6 ? 'Medium' : 'Hard',
        completed,
        score,
      };
    });
    
    const completedSteps = steps.filter(s => s.completed).length;
    const progress = (completedSteps / steps.length) * 100;
    const estimatedCompletionTime = (steps.length - completedSteps) * 20; // 20 min per topic
    
    const path: LearningPath = {
      pathId: `path_${Date.now()}`,
      studentId,
      title: `${subject} Mastery Path`,
      description: `Complete learning path from Level ${currentLevel} to Level ${targetLevel}`,
      steps,
      progress,
      estimatedCompletionTime,
      createdAt: new Date().toISOString(),
    };
    
    // Save path
    this.saveLearningPath(path);
    
    return path;
  }
  
  /**
   * Get recommended study schedule for student
   */
  public getStudySchedule(studentId: string): Array<{
    day: string;
    recommendations: RecommendationItem[];
  }> {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const allRecommendations = this.generateRecommendations(studentId, 20);
    
    // Distribute recommendations across week
    const schedule = daysOfWeek.map((day, index) => {
      const dayRecommendations = allRecommendations
        .slice(index * 3, (index + 1) * 3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      return {
        day,
        recommendations: dayRecommendations,
      };
    });
    
    return schedule;
  }
  
  /**
   * Suggest optimal quiz configuration
   */
  public suggestQuizConfig(studentId: string, subject: string): {
    difficulty: string;
    questionCount: number;
    topics: string[];
    timeLimit?: number;
  } {
    const sessions = this.getStudentSessions(studentId);
    const subjectSessions = sessions.filter(s => s.subject === subject);
    
    if (subjectSessions.length === 0) {
      return {
        difficulty: 'Medium',
        questionCount: 10,
        topics: ['Mixed'],
      };
    }
    
    const avgScore = subjectSessions.reduce((sum, s) => sum + s.score, 0) / subjectSessions.length;
    const avgTime = subjectSessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / subjectSessions.length;
    
    const difficulty = avgScore >= 85 ? 'Hard' : avgScore >= 65 ? 'Medium' : 'Easy';
    const questionCount = avgScore >= 80 ? 15 : 10;
    
    // Find topics with low mastery
    const topicScores: { [topic: string]: number[] } = {};
    subjectSessions.forEach(s => {
      if (!topicScores[s.topic]) topicScores[s.topic] = [];
      topicScores[s.topic].push(s.score);
    });
    
    const weakTopics = Object.entries(topicScores)
      .map(([topic, scores]) => ({
        topic,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .filter(t => t.avg < 75)
      .map(t => t.topic);
    
    const topics = weakTopics.length > 0 ? weakTopics.slice(0, 3) : ['Mixed'];
    
    return {
      difficulty,
      questionCount,
      topics,
      timeLimit: avgTime > 600 ? 900 : 600, // 10 or 15 minutes
    };
  }
  
  // Helper methods
  private getStudentSessions(studentId: string): any[] {
    const key = `ks2_quiz_sessions_${studentId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  private buildStudentProfile(sessions: any[]): any {
    const topicScores: { [key: string]: number[] } = {};
    
    sessions.forEach(session => {
      const key = `${session.subject}:${session.topic}`;
      if (!topicScores[key]) topicScores[key] = [];
      topicScores[key].push(session.score);
    });
    
    const weakTopics: any[] = [];
    const strongTopics: any[] = [];
    
    Object.entries(topicScores).forEach(([key, scores]) => {
      const [subject, topic] = key.split(':');
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      if (avg < 65) {
        weakTopics.push({ subject, topic, score: Math.round(avg) });
      } else if (avg >= 85) {
        strongTopics.push({ subject, topic, score: Math.round(avg) });
      }
    });
    
    const engagementLevel = sessions.length / 30; // Sessions per month
    
    return {
      weakTopics: weakTopics.slice(0, 3),
      strongTopics: strongTopics.slice(0, 3),
      nextTopics: this.getNextTopics(topicScores),
      recommendedDifficulty: sessions.length > 0 ? this.calculateDifficulty(sessions) : 'Medium',
      engagementLevel: Math.min(1, engagementLevel),
    };
  }
  
  private getNextTopics(topicScores: { [key: string]: number[] }): any[] {
    // Simplified topic progression
    const progressions = {
      'Maths': ['Counting', 'Addition', 'Subtraction', 'Multiplication', 'Division'],
      'English': ['Phonics', 'Reading', 'Writing', 'Grammar'],
      'Science': ['Living Things', 'Materials', 'Forces', 'Light'],
    };
    
    const next: any[] = [];
    
    Object.entries(progressions).forEach(([subject, topics]) => {
      for (const topic of topics) {
        const key = `${subject}:${topic}`;
        if (!topicScores[key] || topicScores[key][0] < 85) {
          next.push({ subject, topic });
          break;
        }
      }
    });
    
    return next;
  }
  
  private calculateDifficulty(sessions: any[]): string {
    const recent = sessions.slice(-5);
    const avg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    return avg >= 85 ? 'Hard' : avg >= 65 ? 'Medium' : 'Easy';
  }
  
  private getTopicProgression(subject: string): string[] {
    const progressions: { [key: string]: string[] } = {
      'Maths': ['Counting', 'Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions', 'Decimals', 'Algebra'],
      'English': ['Phonics', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Comprehension'],
      'Science': ['Living Things', 'Materials', 'Forces', 'Light', 'Earth', 'Space'],
    };
    
    return progressions[subject] || [];
  }
  
  private estimateLevel(sessions: any[], subject: string): number {
    const subjectSessions = sessions.filter(s => s.subject === subject);
    if (subjectSessions.length === 0) return 1;
    
    const avgScore = subjectSessions.reduce((sum, s) => sum + s.score, 0) / subjectSessions.length;
    return Math.max(1, Math.min(10, Math.floor(avgScore / 10)));
  }
  
  private isTopicCompleted(sessions: any[], subject: string, topic: string): boolean {
    const topicSessions = sessions.filter(s => s.subject === subject && s.topic === topic);
    if (topicSessions.length === 0) return false;
    
    const avgScore = topicSessions.reduce((sum, s) => sum + s.score, 0) / topicSessions.length;
    return avgScore >= 85;
  }
  
  private getTopicScore(sessions: any[], subject: string, topic: string): number | undefined {
    const topicSessions = sessions.filter(s => s.subject === subject && s.topic === topic);
    if (topicSessions.length === 0) return undefined;
    
    return Math.round(topicSessions.reduce((sum, s) => sum + s.score, 0) / topicSessions.length);
  }
  
  private saveLearningPath(path: LearningPath): void {
    const key = `ks2_learning_paths_${path.studentId}`;
    const existing = localStorage.getItem(key);
    const paths = existing ? JSON.parse(existing) : [];
    paths.push(path);
    localStorage.setItem(key, JSON.stringify(paths));
  }
}

export const recommendationsEngine = new RecommendationsEngine();
export default recommendationsEngine;
