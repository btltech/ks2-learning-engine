/**
 * Progress Visualization Service
 * Manages skill trees, visual progress tracking, and certificates
 */

export interface SkillNode {
  id: string;
  subject: string;
  topic: string;
  name: string;
  description: string;
  level: number;
  prerequisites: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0-100
  requiredScore: number; // Score needed to unlock
  rewards: {
    points: number;
    badge?: string;
    nextUnlock?: string[];
  };
  position: {
    x: number;
    y: number;
  };
}

export interface SkillTree {
  subject: string;
  nodes: SkillNode[];
  totalNodes: number;
  completedNodes: number;
  unlockedNodes: number;
}

export interface ProgressDataPoint {
  date: string;
  subject: string;
  score: number;
  quizCount: number;
  timeSpent: number; // minutes
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic?: string;
  awardedDate: number;
  recipient: string;
  achievement: string;
  iconUrl?: string;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const STORAGE_KEY_SKILL_TREES = 'ks2_skill_trees';
const STORAGE_KEY_PROGRESS_DATA = 'ks2_progress_data';
const STORAGE_KEY_CERTIFICATES = 'ks2_certificates';

class ProgressVisualizationService {
  private skillTrees: Map<string, SkillTree> = new Map();
  private progressData: ProgressDataPoint[] = [];
  private certificates: Certificate[] = [];

  constructor() {
    this.loadData();
    this.initializeSkillTrees();
  }

  // ============ SKILL TREES ============

  /**
   * Initialize skill trees for each subject
   */
  private initializeSkillTrees(): void {
    // Maths skill tree
    this.skillTrees.set('Maths', this.createMathsSkillTree());
    // English skill tree
    this.skillTrees.set('English', this.createEnglishSkillTree());
    // Science skill tree
    this.skillTrees.set('Science', this.createScienceSkillTree());
  }

  /**
   * Create Maths skill tree
   */
  private createMathsSkillTree(): SkillTree {
    const nodes: SkillNode[] = [
      // Foundation nodes
      {
        id: 'maths_numbers_1',
        subject: 'Maths',
        topic: 'Number Sense',
        name: 'Counting Master',
        description: 'Master counting and number recognition',
        level: 1,
        prerequisites: [],
        isUnlocked: true,
        isCompleted: false,
        progress: 0,
        requiredScore: 70,
        rewards: { points: 50, nextUnlock: ['maths_addition_1'] },
        position: { x: 1, y: 1 },
      },
      {
        id: 'maths_addition_1',
        subject: 'Maths',
        topic: 'Addition',
        name: 'Addition Apprentice',
        description: 'Learn basic addition',
        level: 2,
        prerequisites: ['maths_numbers_1'],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
        requiredScore: 75,
        rewards: { points: 75, nextUnlock: ['maths_subtraction_1', 'maths_addition_2'] },
        position: { x: 2, y: 1 },
      },
      {
        id: 'maths_subtraction_1',
        subject: 'Maths',
        topic: 'Subtraction',
        name: 'Subtraction Scout',
        description: 'Learn basic subtraction',
        level: 2,
        prerequisites: ['maths_numbers_1'],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
        requiredScore: 75,
        rewards: { points: 75, nextUnlock: ['maths_subtraction_2'] },
        position: { x: 2, y: 2 },
      },
      {
        id: 'maths_addition_2',
        subject: 'Maths',
        topic: 'Addition',
        name: 'Addition Expert',
        description: 'Master advanced addition',
        level: 3,
        prerequisites: ['maths_addition_1'],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
        requiredScore: 80,
        rewards: { points: 100, badge: '🧮', nextUnlock: ['maths_multiplication_1'] },
        position: { x: 3, y: 1 },
      },
      {
        id: 'maths_multiplication_1',
        subject: 'Maths',
        topic: 'Multiplication',
        name: 'Times Table Titan',
        description: 'Conquer multiplication tables',
        level: 4,
        prerequisites: ['maths_addition_2'],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
        requiredScore: 85,
        rewards: { points: 150, badge: '⭐', nextUnlock: ['maths_division_1'] },
        position: { x: 4, y: 1 },
      },
    ];

    return {
      subject: 'Maths',
      nodes,
      totalNodes: nodes.length,
      completedNodes: nodes.filter(n => n.isCompleted).length,
      unlockedNodes: nodes.filter(n => n.isUnlocked).length,
    };
  }

  /**
   * Create English skill tree
   */
  private createEnglishSkillTree(): SkillTree {
    const nodes: SkillNode[] = [
      {
        id: 'english_phonics_1',
        subject: 'English',
        topic: 'Phonics',
        name: 'Phonics Pioneer',
        description: 'Master letter sounds',
        level: 1,
        prerequisites: [],
        isUnlocked: true,
        isCompleted: false,
        progress: 0,
        requiredScore: 70,
        rewards: { points: 50, nextUnlock: ['english_reading_1'] },
        position: { x: 1, y: 1 },
      },
      {
        id: 'english_reading_1',
        subject: 'English',
        topic: 'Reading',
        name: 'Reading Rookie',
        description: 'Build reading skills',
        level: 2,
        prerequisites: ['english_phonics_1'],
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
        requiredScore: 75,
        rewards: { points: 75, nextUnlock: ['english_comprehension_1'] },
        position: { x: 2, y: 1 },
      },
    ];

    return {
      subject: 'English',
      nodes,
      totalNodes: nodes.length,
      completedNodes: 0,
      unlockedNodes: 1,
    };
  }

  /**
   * Create Science skill tree
   */
  private createScienceSkillTree(): SkillTree {
    const nodes: SkillNode[] = [
      {
        id: 'science_living_1',
        subject: 'Science',
        topic: 'Living Things',
        name: 'Life Explorer',
        description: 'Discover living organisms',
        level: 1,
        prerequisites: [],
        isUnlocked: true,
        isCompleted: false,
        progress: 0,
        requiredScore: 70,
        rewards: { points: 50, nextUnlock: ['science_plants_1'] },
        position: { x: 1, y: 1 },
      },
    ];

    return {
      subject: 'Science',
      nodes,
      totalNodes: nodes.length,
      completedNodes: 0,
      unlockedNodes: 1,
    };
  }

  /**
   * Get skill tree for subject
   */
  getSkillTree(subject: string): SkillTree | null {
    return this.skillTrees.get(subject) || null;
  }

  /**
   * Update node progress
   */
  updateNodeProgress(nodeId: string, score: number): {
    unlocked: string[];
    completed: boolean;
    rewards: any;
  } {
    const result = { unlocked: [] as string[], completed: false, rewards: null };

    // Find node in any skill tree
    for (const tree of this.skillTrees.values()) {
      const node = tree.nodes.find(n => n.id === nodeId);
      if (node) {
        // Update progress
        node.progress = Math.max(node.progress, score);

        // Check if completed
        if (score >= node.requiredScore && !node.isCompleted) {
          node.isCompleted = true;
          result.completed = true;
          result.rewards = node.rewards;

          // Unlock next nodes
          if (node.rewards.nextUnlock) {
            for (const nextId of node.rewards.nextUnlock) {
              const nextNode = tree.nodes.find(n => n.id === nextId);
              if (nextNode && !nextNode.isUnlocked) {
                nextNode.isUnlocked = true;
                result.unlocked.push(nextId);
              }
            }
          }

          // Update tree stats
          tree.completedNodes = tree.nodes.filter(n => n.isCompleted).length;
          tree.unlockedNodes = tree.nodes.filter(n => n.isUnlocked).length;
        }

        this.saveData();
        break;
      }
    }

    return result;
  }

  // ============ PROGRESS TRACKING ============

  /**
   * Record quiz result for progress tracking
   */
  recordProgress(subject: string, score: number, timeSpent: number): void {
    const today = new Date().toISOString().split('T')[0];

    // Find existing entry for today
    let dataPoint = this.progressData.find(
      d => d.date === today && d.subject === subject
    );

    if (dataPoint) {
      // Update existing
      dataPoint.score = (dataPoint.score + score) / 2; // Average
      dataPoint.quizCount++;
      dataPoint.timeSpent += Math.round(timeSpent / 60); // Convert to minutes
    } else {
      // Create new
      dataPoint = {
        date: today,
        subject,
        score,
        quizCount: 1,
        timeSpent: Math.round(timeSpent / 60),
      };
      this.progressData.push(dataPoint);
    }

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.progressData = this.progressData.filter(
      d => new Date(d.date) >= thirtyDaysAgo
    );

    this.saveData();
  }

  /**
   * Get progress data for charts
   */
  getProgressData(subject?: string, days: number = 30): ProgressDataPoint[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    let data = this.progressData.filter(d => new Date(d.date) >= cutoff);

    if (subject) {
      data = data.filter(d => d.subject === subject);
    }

    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get weekly summary
   */
  getWeeklySummary(): {
    totalQuizzes: number;
    averageScore: number;
    totalTime: number;
    topSubject: string;
    improvement: number;
  } {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekData = this.progressData.filter(d => new Date(d.date) >= sevenDaysAgo);

    const totalQuizzes = weekData.reduce((sum, d) => sum + d.quizCount, 0);
    const totalScore = weekData.reduce((sum, d) => sum + d.score * d.quizCount, 0);
    const totalTime = weekData.reduce((sum, d) => sum + d.timeSpent, 0);

    // Calculate average by subject
    const subjectScores: { [key: string]: number[] } = {};
    weekData.forEach(d => {
      if (!subjectScores[d.subject]) subjectScores[d.subject] = [];
      subjectScores[d.subject].push(d.score);
    });

    let topSubject = 'N/A';
    let highestAvg = 0;
    for (const [subject, scores] of Object.entries(subjectScores)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        topSubject = subject;
      }
    }

    // Calculate improvement (compare first half vs second half of week)
    const midWeek = new Date(sevenDaysAgo.getTime() + 3.5 * 24 * 60 * 60 * 1000);
    const firstHalf = weekData.filter(d => new Date(d.date) < midWeek);
    const secondHalf = weekData.filter(d => new Date(d.date) >= midWeek);

    const firstAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((sum, d) => sum + d.score, 0) / firstHalf.length
        : 0;
    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((sum, d) => sum + d.score, 0) / secondHalf.length
        : 0;

    return {
      totalQuizzes,
      averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
      totalTime,
      topSubject,
      improvement: Math.round(secondAvg - firstAvg),
    };
  }

  // ============ CERTIFICATES ============

  /**
   * Award certificate
   */
  awardCertificate(
    recipient: string,
    subject: string,
    achievement: string,
    badgeLevel: Certificate['badgeLevel'] = 'bronze'
  ): Certificate {
    const certificate: Certificate = {
      id: `cert_${Date.now()}`,
      title: `${subject} Achievement`,
      description: `Awarded for outstanding performance in ${subject}`,
      subject,
      achievement,
      awardedDate: Date.now(),
      recipient,
      badgeLevel,
    };

    this.certificates.push(certificate);
    this.saveData();

    return certificate;
  }

  /**
   * Get all certificates
   */
  getCertificates(): Certificate[] {
    return [...this.certificates].sort((a, b) => b.awardedDate - a.awardedDate);
  }

  /**
   * Get certificates by subject
   */
  getCertificatesBySubject(subject: string): Certificate[] {
    return this.certificates
      .filter(c => c.subject === subject)
      .sort((a, b) => b.awardedDate - a.awardedDate);
  }

  // ============ STORAGE ============

  private loadData(): void {
    try {
      const treesData = localStorage.getItem(STORAGE_KEY_SKILL_TREES);
      if (treesData) {
        try {
          const parsed = JSON.parse(treesData);
          if (parsed && typeof parsed === 'object') {
            this.skillTrees = new Map(Object.entries(parsed));
          }
        } catch (e) {
          console.warn('[ProgressVisualization] Failed to parse skill trees:', e);
        }
      }

      const progressData = localStorage.getItem(STORAGE_KEY_PROGRESS_DATA);
      if (progressData) {
        try {
          const parsed = JSON.parse(progressData);
          this.progressData = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn('[ProgressVisualization] Failed to parse progress data:', e);
          this.progressData = [];
        }
      }

      const certsData = localStorage.getItem(STORAGE_KEY_CERTIFICATES);
      if (certsData) {
        try {
          const parsed = JSON.parse(certsData);
          this.certificates = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn('[ProgressVisualization] Failed to parse certificates:', e);
          this.certificates = [];
        }
      }
    } catch (error) {
      console.error('[ProgressVisualization] Failed to load data:', error);
    }
  }

  private saveData(): void {
    try {
      const treesObj = Object.fromEntries(this.skillTrees);
      localStorage.setItem(STORAGE_KEY_SKILL_TREES, JSON.stringify(treesObj));
      localStorage.setItem(STORAGE_KEY_PROGRESS_DATA, JSON.stringify(this.progressData));
      localStorage.setItem(STORAGE_KEY_CERTIFICATES, JSON.stringify(this.certificates));
    } catch (error) {
      console.error('[ProgressVisualization] Failed to save data:', error);
    }
  }
}

// Export singleton
export const progressVisualizationService = new ProgressVisualizationService();
