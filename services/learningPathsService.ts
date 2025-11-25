/**
 * Learning Paths Service
 * 
 * Provides structured learning journeys through the KS2 curriculum
 * with milestones, certificates, and personalized recommendations
 */

import { Subject, Difficulty } from '../types';

export interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  prerequisites?: string[];
  objectives: string[];
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  subject: Subject;
  difficulty: Difficulty;
  steps: LearningPathStep[];
  totalSteps: number;
  completedSteps: number;
  estimatedHours: number;
  certificateId?: string;
  badges: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  learningPathId: string;
  learningPathName: string;
  userId: string;
  userName: string;
  childName?: string;
  subject: Subject;
  earnedAt: string;
  score: number;
  grade: 'distinction' | 'merit' | 'pass';
}

export interface PathProgress {
  pathId: string;
  currentStepIndex: number;
  totalScore: number;
  averageScore: number;
  timeSpentMinutes: number;
  startedAt: string;
  lastActivityAt: string;
}

const STORAGE_KEY = 'ks2_learning_paths';
const CERTIFICATES_KEY = 'ks2_certificates';
const PROGRESS_KEY = 'ks2_path_progress';

// Predefined learning paths for the KS2 curriculum
const CURRICULUM_PATHS: any[] = [
  // MATHS PATHS
  {
    id: 'maths-foundations',
    name: 'Maths Foundations',
    description: 'Build a strong foundation in number sense, place value, and basic operations',
    subject: 'Maths' as string,
    difficulty: Difficulty.Easy,
    estimatedHours: 10,
    badges: ['number_ninja', 'addition_ace'],
    steps: [
      {
        id: 'maths-1-1',
        title: 'Place Value to 1000',
        description: 'Understand hundreds, tens, and ones',
        subject: 'Maths' as string,
        topic: 'Place Value',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 30,
        objectives: ['Identify place value of digits', 'Read and write 3-digit numbers'],
        isCompleted: false,
      },
      {
        id: 'maths-1-2',
        title: 'Addition Facts to 20',
        description: 'Master number bonds and addition strategies',
        subject: 'Maths' as string,
        topic: 'Addition',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 30,
        objectives: ['Recall addition facts fluently', 'Use number bonds'],
        isCompleted: false,
      },
      {
        id: 'maths-1-3',
        title: 'Subtraction Facts to 20',
        description: 'Connect subtraction to addition',
        subject: 'Maths' as string,
        topic: 'Subtraction',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 30,
        prerequisites: ['maths-1-2'],
        objectives: ['Recall subtraction facts', 'Find missing numbers'],
        isCompleted: false,
      },
      {
        id: 'maths-1-4',
        title: 'Adding 2-digit Numbers',
        description: 'Add numbers with regrouping',
        subject: 'Maths' as string,
        topic: 'Addition',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 45,
        prerequisites: ['maths-1-2'],
        objectives: ['Add 2-digit numbers', 'Use column addition'],
        isCompleted: false,
      },
      {
        id: 'maths-1-5',
        title: 'Word Problems',
        description: 'Apply addition and subtraction to real problems',
        subject: 'Maths' as string,
        topic: 'Word Problems',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 45,
        prerequisites: ['maths-1-3', 'maths-1-4'],
        objectives: ['Identify operation needed', 'Solve 1-step problems'],
        isCompleted: false,
      },
    ],
    totalSteps: 5,
  },
  {
    id: 'maths-multiplication-mastery',
    name: 'Times Tables Champion',
    description: 'Master multiplication facts and apply them to solve problems',
    subject: 'Maths' as string,
    difficulty: Difficulty.Medium,
    estimatedHours: 15,
    badges: ['times_table_hero', 'multiplication_master'],
    steps: [
      {
        id: 'maths-2-1',
        title: '2, 5, 10 Times Tables',
        description: 'Start with the foundational multiplication facts',
        subject: 'Maths' as string,
        topic: 'Multiplication',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 40,
        objectives: ['Recall 2, 5, 10 times tables', 'Identify patterns'],
        isCompleted: false,
      },
      {
        id: 'maths-2-2',
        title: '3, 4, 6 Times Tables',
        description: 'Build on doubles and patterns',
        subject: 'Maths' as string,
        topic: 'Multiplication',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 45,
        prerequisites: ['maths-2-1'],
        objectives: ['Recall 3, 4, 6 times tables', 'Use known facts'],
        isCompleted: false,
      },
      {
        id: 'maths-2-3',
        title: '7, 8, 9 Times Tables',
        description: 'Complete the times tables up to 12',
        subject: 'Maths' as string,
        topic: 'Multiplication',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 45,
        prerequisites: ['maths-2-2'],
        objectives: ['Recall 7, 8, 9 times tables', 'Quick recall'],
        isCompleted: false,
      },
      {
        id: 'maths-2-4',
        title: 'Division Facts',
        description: 'Connect multiplication and division',
        subject: 'Maths' as string,
        topic: 'Division',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 40,
        prerequisites: ['maths-2-3'],
        objectives: ['Use inverse operations', 'Solve division problems'],
        isCompleted: false,
      },
      {
        id: 'maths-2-5',
        title: 'Multiplication Word Problems',
        description: 'Apply multiplication to real-world scenarios',
        subject: 'Maths' as string,
        topic: 'Word Problems',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 50,
        prerequisites: ['maths-2-4'],
        objectives: ['Identify when to multiply', 'Solve multi-step problems'],
        isCompleted: false,
      },
    ],
    totalSteps: 5,
  },
  {
    id: 'maths-fractions-journey',
    name: 'Fractions Explorer',
    description: 'Understand and work with fractions from basics to operations',
    subject: 'Maths' as string,
    difficulty: Difficulty.Hard,
    estimatedHours: 12,
    badges: ['fraction_finder', 'fraction_master'],
    steps: [
      {
        id: 'maths-3-1',
        title: 'Understanding Fractions',
        description: 'What fractions mean and how to represent them',
        subject: 'Maths' as string,
        topic: 'Fractions',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 35,
        objectives: ['Understand parts of a whole', 'Read and write fractions'],
        isCompleted: false,
      },
      {
        id: 'maths-3-2',
        title: 'Equivalent Fractions',
        description: 'Find fractions that are equal',
        subject: 'Maths' as string,
        topic: 'Fractions',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 40,
        prerequisites: ['maths-3-1'],
        objectives: ['Identify equivalent fractions', 'Simplify fractions'],
        isCompleted: false,
      },
      {
        id: 'maths-3-3',
        title: 'Comparing Fractions',
        description: 'Which fraction is bigger?',
        subject: 'Maths' as string,
        topic: 'Fractions',
        difficulty: Difficulty.Hard,
        estimatedMinutes: 40,
        prerequisites: ['maths-3-2'],
        objectives: ['Compare fractions with same denominators', 'Use equivalent fractions to compare'],
        isCompleted: false,
      },
      {
        id: 'maths-3-4',
        title: 'Adding Fractions',
        description: 'Add fractions with same and different denominators',
        subject: 'Maths' as string,
        topic: 'Fractions',
        difficulty: Difficulty.Hard,
        estimatedMinutes: 50,
        prerequisites: ['maths-3-3'],
        objectives: ['Add fractions with same denominator', 'Find common denominators'],
        isCompleted: false,
      },
    ],
    totalSteps: 4,
  },

  // ENGLISH PATHS
  {
    id: 'english-grammar-basics',
    name: 'Grammar Genius',
    description: 'Master the building blocks of English grammar',
    subject: 'English' as string,
    difficulty: Difficulty.Easy,
    estimatedHours: 8,
    badges: ['grammar_guru', 'word_wizard'],
    steps: [
      {
        id: 'eng-1-1',
        title: 'Nouns and Pronouns',
        description: 'Naming words and their replacements',
        subject: 'English' as string,
        topic: 'Grammar',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 30,
        objectives: ['Identify nouns', 'Use pronouns correctly'],
        isCompleted: false,
      },
      {
        id: 'eng-1-2',
        title: 'Verbs and Tenses',
        description: 'Action words and when they happen',
        subject: 'English' as string,
        topic: 'Grammar',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 35,
        objectives: ['Identify verbs', 'Use past, present, future tense'],
        isCompleted: false,
      },
      {
        id: 'eng-1-3',
        title: 'Adjectives and Adverbs',
        description: 'Describing words that make writing exciting',
        subject: 'English' as string,
        topic: 'Grammar',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 35,
        prerequisites: ['eng-1-1', 'eng-1-2'],
        objectives: ['Use adjectives to describe nouns', 'Use adverbs to describe verbs'],
        isCompleted: false,
      },
      {
        id: 'eng-1-4',
        title: 'Sentences and Punctuation',
        description: 'Building proper sentences',
        subject: 'English' as string,
        topic: 'Punctuation',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 40,
        prerequisites: ['eng-1-3'],
        objectives: ['Write complete sentences', 'Use capital letters and full stops'],
        isCompleted: false,
      },
    ],
    totalSteps: 4,
  },
  {
    id: 'english-reading-comprehension',
    name: 'Reading Champion',
    description: 'Develop skills to understand and analyse texts',
    subject: 'English' as string,
    difficulty: Difficulty.Medium,
    estimatedHours: 10,
    badges: ['bookworm', 'reading_star'],
    steps: [
      {
        id: 'eng-2-1',
        title: 'Finding Information',
        description: 'Locate facts and details in text',
        subject: 'English' as string,
        topic: 'Reading Comprehension',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 35,
        objectives: ['Scan for key information', 'Answer retrieval questions'],
        isCompleted: false,
      },
      {
        id: 'eng-2-2',
        title: 'Making Inferences',
        description: 'Read between the lines',
        subject: 'English' as string,
        topic: 'Reading Comprehension',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 40,
        prerequisites: ['eng-2-1'],
        objectives: ['Use clues to understand meaning', 'Explain character feelings'],
        isCompleted: false,
      },
      {
        id: 'eng-2-3',
        title: 'Understanding Vocabulary',
        description: 'Work out word meanings from context',
        subject: 'English' as string,
        topic: 'Reading Comprehension',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 35,
        objectives: ['Use context clues', 'Understand word families'],
        isCompleted: false,
      },
      {
        id: 'eng-2-4',
        title: 'Summarising and Predicting',
        description: 'Understand the main ideas',
        subject: 'English' as string,
        topic: 'Reading Comprehension',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 45,
        prerequisites: ['eng-2-2', 'eng-2-3'],
        objectives: ['Summarise key points', 'Predict what might happen'],
        isCompleted: false,
      },
    ],
    totalSteps: 4,
  },

  // SCIENCE PATHS
  {
    id: 'science-living-things',
    name: 'Life Science Explorer',
    description: 'Discover the world of living things and habitats',
    subject: 'Science' as string,
    difficulty: Difficulty.Medium,
    estimatedHours: 12,
    badges: ['nature_explorer', 'science_star'],
    steps: [
      {
        id: 'sci-1-1',
        title: 'Classification of Living Things',
        description: 'How we group animals and plants',
        subject: 'Science' as string,
        topic: 'Living Things',
        difficulty: Difficulty.Easy,
        estimatedMinutes: 35,
        objectives: ['Identify vertebrates and invertebrates', 'Group living things'],
        isCompleted: false,
      },
      {
        id: 'sci-1-2',
        title: 'Habitats and Ecosystems',
        description: 'Where living things live',
        subject: 'Science' as string,
        topic: 'Habitats',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 40,
        objectives: ['Describe different habitats', 'Understand food chains'],
        isCompleted: false,
      },
      {
        id: 'sci-1-3',
        title: 'Life Cycles',
        description: 'How living things grow and change',
        subject: 'Science' as string,
        topic: 'Life Cycles',
        difficulty: Difficulty.Medium,
        estimatedMinutes: 40,
        prerequisites: ['sci-1-1'],
        objectives: ['Describe plant life cycles', 'Describe animal life cycles'],
        isCompleted: false,
      },
      {
        id: 'sci-1-4',
        title: 'Adaptation and Evolution',
        description: 'How living things survive',
        subject: 'Science' as string,
        topic: 'Evolution',
        difficulty: Difficulty.Hard,
        estimatedMinutes: 45,
        prerequisites: ['sci-1-2', 'sci-1-3'],
        objectives: ['Explain adaptation', 'Understand evolution basics'],
        isCompleted: false,
      },
    ],
    totalSteps: 4,
  },
];

class LearningPathsService {
  private paths: Map<string, LearningPath> = new Map();
  private certificates: Map<string, Certificate> = new Map();
  private progress: Map<string, PathProgress> = new Map();

  constructor() {
    this.loadFromStorage();
    this.initializePaths();
  }

  private loadFromStorage(): void {
    try {
      const savedPaths = localStorage.getItem(STORAGE_KEY);
      if (savedPaths) {
        const parsed = JSON.parse(savedPaths);
        this.paths = new Map(Object.entries(parsed));
      }

      const savedCerts = localStorage.getItem(CERTIFICATES_KEY);
      if (savedCerts) {
        const parsed = JSON.parse(savedCerts);
        this.certificates = new Map(Object.entries(parsed));
      }

      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        this.progress = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading learning paths data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(this.paths)));
      localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(Object.fromEntries(this.certificates)));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(Object.fromEntries(this.progress)));
    } catch (error) {
      console.error('Error saving learning paths data:', error);
    }
  }

  private initializePaths(): void {
    // Initialize curriculum paths if they don't exist
    for (const pathTemplate of CURRICULUM_PATHS) {
      if (!this.paths.has(pathTemplate.id)) {
        const path: LearningPath = {
          ...pathTemplate,
          completedSteps: 0,
          createdAt: new Date().toISOString(),
        };
        this.paths.set(path.id, path);
      }
    }
    this.saveToStorage();
  }

  /**
   * Get all available learning paths
   */
  getAllPaths(): LearningPath[] {
    return Array.from(this.paths.values());
  }

  /**
   * Get paths by subject
   */
  getPathsBySubject(subject: Subject): LearningPath[] {
    return Array.from(this.paths.values()).filter(p => p.subject === subject);
  }

  /**
   * Get paths by difficulty
   */
  getPathsByDifficulty(difficulty: Difficulty): LearningPath[] {
    return Array.from(this.paths.values()).filter(p => p.difficulty === difficulty);
  }

  /**
   * Get recommended paths based on user progress
   */
  getRecommendedPaths(
    completedTopics: string[],
    masteryLevels: Record<string, number>
  ): LearningPath[] {
    const allPaths = this.getAllPaths();
    
    return allPaths
      .filter(path => {
        // Not completed
        if (path.completedAt) return false;
        
        // Check if prerequisites are met
        const firstStep = path.steps[0];
        if (firstStep.prerequisites) {
          return firstStep.prerequisites.every(prereq => {
            const prereqStep = this.findStepById(prereq);
            return prereqStep?.isCompleted;
          });
        }
        return true;
      })
      .sort((a, b) => {
        // Prioritize started paths
        if (a.startedAt && !b.startedAt) return -1;
        if (!a.startedAt && b.startedAt) return 1;
        
        // Then by mastery in subject
        const aMastery = masteryLevels[a.subject as unknown as string] || 0;
        const bMastery = masteryLevels[b.subject as unknown as string] || 0;
        return bMastery - aMastery;
      })
      .slice(0, 5);
  }

  private findStepById(stepId: string): LearningPathStep | null {
    for (const path of this.paths.values()) {
      const step = path.steps.find(s => s.id === stepId);
      if (step) return step;
    }
    return null;
  }

  /**
   * Get a specific path
   */
  getPath(pathId: string): LearningPath | null {
    return this.paths.get(pathId) || null;
  }

  /**
   * Start a learning path
   */
  startPath(pathId: string): LearningPath | null {
    const path = this.paths.get(pathId);
    if (!path) return null;

    if (!path.startedAt) {
      path.startedAt = new Date().toISOString();
      this.paths.set(pathId, path);

      // Initialize progress
      this.progress.set(pathId, {
        pathId,
        currentStepIndex: 0,
        totalScore: 0,
        averageScore: 0,
        timeSpentMinutes: 0,
        startedAt: path.startedAt,
        lastActivityAt: path.startedAt,
      });

      this.saveToStorage();
    }

    return path;
  }

  /**
   * Complete a step in a learning path
   */
  completeStep(pathId: string, stepId: string, score: number): LearningPath | null {
    const path = this.paths.get(pathId);
    if (!path) return null;

    const stepIndex = path.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return null;

    const step = path.steps[stepIndex];
    step.isCompleted = true;
    step.completedAt = new Date().toISOString();
    step.score = score;

    path.completedSteps++;

    // Update progress
    const pathProgress = this.progress.get(pathId);
    if (pathProgress) {
      pathProgress.currentStepIndex = stepIndex + 1;
      pathProgress.totalScore += score;
      pathProgress.averageScore = pathProgress.totalScore / path.completedSteps;
      pathProgress.lastActivityAt = new Date().toISOString();
      this.progress.set(pathId, pathProgress);
    }

    // Check if path is complete
    if (path.completedSteps >= path.totalSteps) {
      path.completedAt = new Date().toISOString();
    }

    this.paths.set(pathId, path);
    this.saveToStorage();

    return path;
  }

  /**
   * Get the next step in a path
   */
  getNextStep(pathId: string): LearningPathStep | null {
    const path = this.paths.get(pathId);
    if (!path) return null;

    // Find first incomplete step where prerequisites are met
    for (const step of path.steps) {
      if (step.isCompleted) continue;

      // Check prerequisites
      if (step.prerequisites) {
        const prereqsMet = step.prerequisites.every(prereqId => {
          const prereqStep = path.steps.find(s => s.id === prereqId);
          return prereqStep?.isCompleted;
        });
        if (!prereqsMet) continue;
      }

      return step;
    }

    return null;
  }

  /**
   * Award certificate for completing a path
   */
  awardCertificate(
    pathId: string,
    userId: string,
    userName: string,
    childName?: string
  ): Certificate | null {
    const path = this.paths.get(pathId);
    if (!path || !path.completedAt) return null;

    const progress = this.progress.get(pathId);
    if (!progress) return null;

    // Calculate grade based on average score
    let grade: Certificate['grade'];
    if (progress.averageScore >= 90) {
      grade = 'distinction';
    } else if (progress.averageScore >= 70) {
      grade = 'merit';
    } else {
      grade = 'pass';
    }

    const certificate: Certificate = {
      id: `cert_${Date.now()}_${pathId}`,
      learningPathId: pathId,
      learningPathName: path.name,
      userId,
      userName,
      childName,
      subject: path.subject,
      earnedAt: new Date().toISOString(),
      score: progress.averageScore,
      grade,
    };

    path.certificateId = certificate.id;
    this.certificates.set(certificate.id, certificate);
    this.paths.set(pathId, path);
    this.saveToStorage();

    return certificate;
  }

  /**
   * Get all certificates for a user
   */
  getUserCertificates(userId: string): Certificate[] {
    return Array.from(this.certificates.values()).filter(c => c.userId === userId);
  }

  /**
   * Get progress for a path
   */
  getPathProgress(pathId: string): PathProgress | null {
    return this.progress.get(pathId) || null;
  }

  /**
   * Get overall progress across all paths
   */
  getOverallProgress(): {
    totalPaths: number;
    startedPaths: number;
    completedPaths: number;
    totalCertificates: number;
  } {
    const paths = Array.from(this.paths.values());
    
    return {
      totalPaths: paths.length,
      startedPaths: paths.filter(p => p.startedAt).length,
      completedPaths: paths.filter(p => p.completedAt).length,
      totalCertificates: this.certificates.size,
    };
  }

  /**
   * Reset a path to start fresh
   */
  resetPath(pathId: string): LearningPath | null {
    const path = this.paths.get(pathId);
    if (!path) return null;

    // Reset all steps
    path.steps.forEach(step => {
      step.isCompleted = false;
      step.completedAt = undefined;
      step.score = undefined;
    });

    path.completedSteps = 0;
    path.startedAt = undefined;
    path.completedAt = undefined;
    path.certificateId = undefined;

    // Remove progress
    this.progress.delete(pathId);

    this.paths.set(pathId, path);
    this.saveToStorage();

    return path;
  }
}

export const learningPathsService = new LearningPathsService();
