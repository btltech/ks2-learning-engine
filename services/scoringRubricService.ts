/**
 * Scoring Rubric Service
 * 
 * Provides standardized scoring criteria for different question types
 * and generates performance reports based on rubric evaluations
 */

import { QuestionType, CognitiveLevel, Difficulty } from '../types';

// Rubric criteria for evaluating answers
export interface RubricCriteria {
  level: number; // 1-5 scale
  label: string;
  description: string;
  pointValue: number;
}

// Rubric definition for a question type
export interface ScoringRubric {
  questionType: QuestionType;
  criteria: RubricCriteria[];
  maxPoints: number;
}

// Performance evaluation result
export interface PerformanceEvaluation {
  questionId: string;
  questionType: QuestionType;
  score: number;
  maxScore: number;
  rubricLevel: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

// Overall quiz performance summary
export interface QuizPerformanceSummary {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  gradeLevel: string;
  overallFeedback: string;
  byQuestionType: Record<QuestionType, {
    count: number;
    averageScore: number;
    feedback: string;
  }>;
  byCognitiveLevel: Record<CognitiveLevel, {
    count: number;
    averageScore: number;
  }>;
  recommendations: string[];
}

// Standard rubrics for each question type
const SCORING_RUBRICS: Record<QuestionType, ScoringRubric> = {
  [QuestionType.MultipleChoice]: {
    questionType: QuestionType.MultipleChoice,
    maxPoints: 10,
    criteria: [
      { level: 5, label: 'Excellent', description: 'Correct answer with quick response', pointValue: 10 },
      { level: 4, label: 'Good', description: 'Correct answer', pointValue: 8 },
      { level: 3, label: 'Satisfactory', description: 'Correct on second attempt', pointValue: 5 },
      { level: 2, label: 'Developing', description: 'Partially correct reasoning', pointValue: 3 },
      { level: 1, label: 'Beginning', description: 'Incorrect but attempted', pointValue: 1 },
    ],
  },
  [QuestionType.TrueFalse]: {
    questionType: QuestionType.TrueFalse,
    maxPoints: 5,
    criteria: [
      { level: 5, label: 'Excellent', description: 'Correct with understanding', pointValue: 5 },
      { level: 3, label: 'Satisfactory', description: 'Correct', pointValue: 3 },
      { level: 1, label: 'Beginning', description: 'Incorrect', pointValue: 0 },
    ],
  },
  [QuestionType.FillInBlank]: {
    questionType: QuestionType.FillInBlank,
    maxPoints: 15,
    criteria: [
      { level: 5, label: 'Excellent', description: 'Correct spelling and answer', pointValue: 15 },
      { level: 4, label: 'Good', description: 'Correct answer with minor spelling errors', pointValue: 12 },
      { level: 3, label: 'Satisfactory', description: 'Acceptable alternative answer', pointValue: 10 },
      { level: 2, label: 'Developing', description: 'Partially correct', pointValue: 5 },
      { level: 1, label: 'Beginning', description: 'Related attempt', pointValue: 2 },
    ],
  },
  [QuestionType.Ordering]: {
    questionType: QuestionType.Ordering,
    maxPoints: 20,
    criteria: [
      { level: 5, label: 'Excellent', description: 'Perfect order', pointValue: 20 },
      { level: 4, label: 'Good', description: 'One item misplaced', pointValue: 15 },
      { level: 3, label: 'Satisfactory', description: 'Two items misplaced', pointValue: 10 },
      { level: 2, label: 'Developing', description: 'Some correct positions', pointValue: 5 },
      { level: 1, label: 'Beginning', description: 'Attempted ordering', pointValue: 2 },
    ],
  },
  [QuestionType.Drawing]: {
    questionType: QuestionType.Drawing,
    maxPoints: 25,
    criteria: [
      { level: 5, label: 'Excellent', description: 'Accurate representation with detail', pointValue: 25 },
      { level: 4, label: 'Good', description: 'Good representation', pointValue: 20 },
      { level: 3, label: 'Satisfactory', description: 'Basic representation', pointValue: 15 },
      { level: 2, label: 'Developing', description: 'Attempted representation', pointValue: 10 },
      { level: 1, label: 'Beginning', description: 'Made an effort', pointValue: 5 },
    ],
  },
  [QuestionType.Matching]: {
    questionType: QuestionType.Matching,
    maxPoints: 20,
    criteria: [
      { level: 5, label: 'Excellent', description: 'All pairs matched correctly', pointValue: 20 },
      { level: 4, label: 'Good', description: 'Most pairs correct', pointValue: 15 },
      { level: 3, label: 'Satisfactory', description: 'Half correct', pointValue: 10 },
      { level: 2, label: 'Developing', description: 'Some correct matches', pointValue: 5 },
      { level: 1, label: 'Beginning', description: 'Few correct', pointValue: 2 },
    ],
  },
  [QuestionType.DragAndDrop]: {
    questionType: QuestionType.DragAndDrop,
    maxPoints: 20,
    criteria: [
      { level: 5, label: 'Excellent', description: 'All items placed correctly', pointValue: 20 },
      { level: 4, label: 'Good', description: 'Most items correct', pointValue: 15 },
      { level: 3, label: 'Satisfactory', description: 'Half correct', pointValue: 10 },
      { level: 2, label: 'Developing', description: 'Some correct placements', pointValue: 5 },
      { level: 1, label: 'Beginning', description: 'Attempted placement', pointValue: 2 },
    ],
  },
};

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  [Difficulty.Easy]: 0.8,
  [Difficulty.Medium]: 1.0,
  [Difficulty.Hard]: 1.2,
};

// Cognitive level bonuses
const COGNITIVE_BONUSES: Record<CognitiveLevel, number> = {
  [CognitiveLevel.Remember]: 0,
  [CognitiveLevel.Understand]: 2,
  [CognitiveLevel.Apply]: 4,
  [CognitiveLevel.Analyze]: 6,
};

class ScoringRubricService {
  /**
   * Get the rubric for a question type
   */
  getRubric(questionType: QuestionType): ScoringRubric {
    return SCORING_RUBRICS[questionType] || SCORING_RUBRICS[QuestionType.MultipleChoice];
  }

  /**
   * Evaluate a single answer and return performance data
   */
  evaluateAnswer(
    questionType: QuestionType,
    isCorrect: boolean,
    difficulty: Difficulty = Difficulty.Medium,
    cognitiveLevel?: CognitiveLevel,
    timeSpent?: number, // in seconds
    attempts: number = 1
  ): PerformanceEvaluation {
    const rubric = this.getRubric(questionType);
    
    // Determine rubric level based on correctness and attempts
    let level: number;
    if (isCorrect) {
      if (attempts === 1) {
        level = timeSpent && timeSpent < 10 ? 5 : 4;
      } else {
        level = Math.max(1, 5 - attempts);
      }
    } else {
      level = 1;
    }

    const criteria = rubric.criteria.find(c => c.level === level) || rubric.criteria[rubric.criteria.length - 1];
    
    // Calculate score with multipliers
    let score = criteria.pointValue;
    score *= DIFFICULTY_MULTIPLIERS[difficulty];
    if (cognitiveLevel) {
      score += COGNITIVE_BONUSES[cognitiveLevel];
    }
    score = Math.round(score);

    // Generate feedback
    const feedback = this.generateFeedback(level, questionType, isCorrect);
    const strengths = this.identifyStrengths(level, questionType, timeSpent);
    const areas = this.identifyAreasForImprovement(level, questionType, isCorrect);

    return {
      questionId: '',
      questionType,
      score,
      maxScore: rubric.maxPoints,
      rubricLevel: level,
      feedback,
      strengths,
      areasForImprovement: areas,
    };
  }

  /**
   * Generate a performance summary for a complete quiz
   */
  generateQuizSummary(
    evaluations: PerformanceEvaluation[],
    studentAge: number
  ): QuizPerformanceSummary {
    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const maxPossibleScore = evaluations.reduce((sum, e) => sum + e.maxScore, 0);
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Group by question type
    const byQuestionType = {} as Record<QuestionType, { count: number; averageScore: number; feedback: string }>;
    for (const eval_ of evaluations) {
      if (!byQuestionType[eval_.questionType]) {
        byQuestionType[eval_.questionType] = { count: 0, averageScore: 0, feedback: '' };
      }
      byQuestionType[eval_.questionType].count++;
      byQuestionType[eval_.questionType].averageScore += eval_.score / eval_.maxScore;
    }
    
    // Calculate averages and generate feedback
    for (const type of Object.keys(byQuestionType) as QuestionType[]) {
      const data = byQuestionType[type];
      data.averageScore = Math.round((data.averageScore / data.count) * 100);
      data.feedback = this.getQuestionTypeFeedback(type, data.averageScore);
    }

    // Grade level
    const gradeLevel = this.getGradeLevel(percentage);
    
    // Overall feedback
    const overallFeedback = this.getOverallFeedback(percentage, studentAge);
    
    // Recommendations
    const recommendations = this.generateRecommendations(evaluations, percentage);

    return {
      totalScore,
      maxPossibleScore,
      percentage,
      gradeLevel,
      overallFeedback,
      byQuestionType,
      byCognitiveLevel: {} as Record<CognitiveLevel, { count: number; averageScore: number }>,
      recommendations,
    };
  }

  private generateFeedback(level: number, questionType: QuestionType, isCorrect: boolean): string {
    if (isCorrect) {
      const correctFeedback = [
        "Brilliant work! You've got this! ⭐",
        "Fantastic! Keep up the great work! 🌟",
        "Well done! You're making excellent progress! 🎉",
        "Great job! You really understand this! 💪",
      ];
      return correctFeedback[Math.floor(Math.random() * correctFeedback.length)];
    } else {
      return "Don't worry! Every mistake helps you learn. Let's try to understand this better. 📚";
    }
  }

  private identifyStrengths(level: number, questionType: QuestionType, timeSpent?: number): string[] {
    const strengths: string[] = [];
    
    if (level >= 4) {
      strengths.push('Shows strong understanding of the concept');
    }
    if (timeSpent && timeSpent < 15) {
      strengths.push('Quick problem-solving skills');
    }
    if (level >= 3) {
      strengths.push('Good recall of key facts');
    }
    
    return strengths;
  }

  private identifyAreasForImprovement(level: number, questionType: QuestionType, isCorrect: boolean): string[] {
    const areas: string[] = [];
    
    if (!isCorrect) {
      areas.push('Review the key concepts for this topic');
      areas.push('Practice similar questions for reinforcement');
    }
    if (level < 3) {
      areas.push('Take more time to read questions carefully');
    }
    
    return areas;
  }

  private getGradeLevel(percentage: number): string {
    if (percentage >= 90) return 'Outstanding';
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    if (percentage >= 50) return 'Developing';
    return 'Needs Improvement';
  }

  private getOverallFeedback(percentage: number, studentAge: number): string {
    if (percentage >= 90) {
      return `Absolutely amazing work! You scored ${percentage}%! You're a superstar learner! 🌟`;
    } else if (percentage >= 70) {
      return `Great job! You scored ${percentage}%! Keep practising and you'll be even better! 💪`;
    } else if (percentage >= 50) {
      return `Good effort! You scored ${percentage}%! Let's review the topics you found tricky. 📚`;
    } else {
      return `You scored ${percentage}%. Don't worry - learning takes practice! Let's try again together. 🤗`;
    }
  }

  private getQuestionTypeFeedback(type: QuestionType, averagePercent: number): string {
    if (averagePercent >= 80) {
      return `You're doing great with ${type} questions!`;
    } else if (averagePercent >= 60) {
      return `Good progress on ${type} questions. Keep practising!`;
    } else {
      return `Let's work more on ${type} questions together.`;
    }
  }

  private generateRecommendations(evaluations: PerformanceEvaluation[], overallPercent: number): string[] {
    const recommendations: string[] = [];
    
    // Find weak areas
    const weakEvaluations = evaluations.filter(e => e.rubricLevel <= 2);
    if (weakEvaluations.length > 0) {
      recommendations.push('Review the topics where you had difficulty');
      recommendations.push('Try the lesson mode before attempting another quiz');
    }
    
    if (overallPercent < 70) {
      recommendations.push('Consider starting with easier difficulty questions');
    }
    
    if (overallPercent >= 80) {
      recommendations.push('Try harder difficulty questions to challenge yourself');
      recommendations.push('Explore new topics to expand your knowledge');
    }
    
    recommendations.push('Take breaks between study sessions for better retention');
    
    return recommendations.slice(0, 3); // Return top 3 recommendations
  }
}

export const scoringRubricService = new ScoringRubricService();
