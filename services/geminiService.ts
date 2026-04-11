import { GoogleGenAI, Type } from "@google/genai";
import { getAuth } from 'firebase/auth';
import { db, collection, getDocs, addDoc, query, where, limit, Timestamp } from './firebase';
import type { QuizQuestion, QuizResult, Explanation, QuestionType, CognitiveLevel } from '../types';
import { QuestionType as QType, CognitiveLevel as CLevel, Difficulty } from '../types';
import { createCacheKey, getFromCache, setInCache } from './cacheService';
import { getFromSharedCache, setInSharedCache } from './sharedCacheService';
import { 
  validateTopicsList, 
  validateLesson, 
  validateQuizQuestion, 
  validateExplanation 
} from './contentValidator';
import { contentMonitor } from './contentMonitor';
import { offlineManager } from './offlineManager';
import { getRandomQuestions } from '../data/questionBank';
import { getUsedQuestions, markQuestionsAsUsed, resetUsedQuestions } from './questionTracker';
import { 
  filterPoorlyPerformingQuestions, 
  filterSimilarQuestions, 
  getAdaptedDifficulty 
} from './questionPerformance';

const LANGUAGE_SUBJECTS = ['french', 'spanish', 'german', 'japanese', 'mandarin', 'romanian', 'yoruba', 'welsh'];

// In production, the API key is handled server-side via Cloudflare Pages Functions
// In development, we use the VITE_ env var directly
const USE_PROXY = import.meta.env.PROD;
const apiKey = USE_PROXY ? 'proxy' : ((import.meta as any).env.VITE_GEMINI_API_KEY as string);

if (!USE_PROXY && !apiKey) {
  console.warn('⚠️ VITE_GEMINI_API_KEY is not set. AI features will not work. Please configure your environment variables.');
}

const getFirebaseIdToken = async (): Promise<string> => {
  const auth = getAuth();
  let user = auth.currentUser;
  
  // If no user is signed in, sign in anonymously
  if (!user) {
    try {
      const { signInAnonymously } = await import('firebase/auth');
      const userCredential = await signInAnonymously(auth);
      user = userCredential.user;
      console.log('🔐 Signed in anonymously for AI features');
    } catch (error) {
      console.error('Failed to sign in anonymously:', error);
      throw new Error('Please sign in to use AI features.');
    }
  }
  
  return user.getIdToken();
};

const isSafetyIssue = (issue: string): boolean => {
  const lower = issue.toLowerCase();
  return lower.includes('inappropriate') || lower.includes('harmful');
};

const hasSafetyIssues = (issues: string[]): boolean => issues.some(isSafetyIssue);

const sanitizeSharedTopics = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;

  const cleaned = value
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 100);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const topic of cleaned) {
    const key = topic.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(topic);
  }

  if (unique.length === 0) return null;
  return unique;
};

const sanitizeSharedLesson = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const lesson = value.trim();
  if (lesson.length < 50) return null;
  // Soft cap to avoid pathological cache entries; the generator already tries to keep lessons reasonable.
  if (lesson.length > 50_000) return null;
  return lesson;
};

const sanitizeSharedQuiz = (value: unknown): QuizQuestion[] | null => {
  if (!Array.isArray(value)) return null;

  const validQuestions: QuizQuestion[] = [];

  for (const q of value) {
    const candidate: any = q as any;

    // Drawing questions don't satisfy the default multiple-choice validator (options empty),
    // so validate a probe version while keeping the original question object.
    if (candidate?.questionType === QType.Drawing) {
      const answer = typeof candidate.correctAnswer === 'string' && candidate.correctAnswer.trim()
        ? candidate.correctAnswer.trim()
        : 'Drawing submitted';
      const probe = {
        ...candidate,
        options: [answer, 'Other'],
        correctAnswer: answer,
      };
      const validation = validateQuizQuestion(probe);
      if (validation.isValid) validQuestions.push(candidate as QuizQuestion);
      continue;
    }

    const validation = validateQuizQuestion(candidate);
    if (validation.isValid) validQuestions.push(candidate as QuizQuestion);
  }

  if (validQuestions.length === 0) return null;
  return validQuestions;
};

// Proxy-based AI client for production
const createProxyAI = () => ({
  models: {
    generateContent: async (params: { model: string; contents: string; config?: any }) => {
      const token = await getFirebaseIdToken();
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: params.model,
          contents: [{ parts: [{ text: params.contents }] }],
          generationConfig: params.config ? {
            responseMimeType: params.config.responseMimeType,
            responseSchema: params.config.responseSchema,
          } : undefined,
        }),
      });
      
      if (!response.ok) {
        let errorMessage = 'AI request failed';
        try {
          const error = await response.json();
          errorMessage = error?.error || errorMessage;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text };
    }
  }
});

// Use proxy in production, direct SDK in development
const ai = USE_PROXY ? createProxyAI() : new GoogleGenAI({ apiKey: apiKey || '' });

const model = 'gemini-2.5-flash';
// Cheaper model for lightweight requests (topic listing, hints)
const topicsModel = 'gemini-2.0-flash';
// Cache version tied to the AI model — changing the model busts stale cached content
const CACHE_MODEL_VERSION = model;

/**
 * Retry an async operation with exponential backoff.
 * Retries up to `maxRetries` times on transient errors. Delays: 1s, 2s, 4s…
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError;
}

export const getTopicsForSubject = async (subject: string, studentAge: number): Promise<string[]> => {
  const cacheKey = createCacheKey('topics', subject, studentAge.toString());
  
  // 1. Check Local Cache
  const cachedTopics = getFromCache<string[]>(cacheKey);
  if (cachedTopics) {
    console.log(`Cache hit for topics: ${subject} (age ${studentAge})`);
    return cachedTopics;
  }

  // 2. Check Shared Cache (Firestore)
  if (offlineManager.checkOnlineStatus()) {
    const sharedTopicsRaw = await getFromSharedCache<any>(cacheKey, CACHE_MODEL_VERSION);
    const sharedTopics = sanitizeSharedTopics(sharedTopicsRaw);
    if (sharedTopics) {
      const validation = validateTopicsList(sharedTopics);
      if (!hasSafetyIssues(validation.issues)) {
        console.log(`Shared cache hit for topics: ${subject}`);
        setInCache(cacheKey, sharedTopics); // Save locally for next time
        return sharedTopics;
      }
    }
    if (sharedTopicsRaw) {
      console.warn(`Ignored shared cached topics for ${subject} due to validation issues.`);
    }
  }

  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    console.warn('Offline: No cached topics available');
    return [];
  }

  let contents = '';
  const subjectLower = subject.toLowerCase();
  const isSpecificLanguage = LANGUAGE_SUBJECTS.includes(subjectLower);

  if (subjectLower === 'computing' || subjectLower === 'coding') {
    contents = `List 30 key topics for an introduction to Computing for a ${studentAge}-year-old UK Key Stage 2 student. Focus on foundational concepts using block-based coding (like Scratch), an introduction to Python (e.g., variables, loops, simple commands), and digital literacy (e.g., internet safety, how the internet works). Ensure topics are aligned with the UK Department for Education (DfE) computing curriculum.

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language. Avoid any complex, scary, or inappropriate topics.`;
  } else if (subjectLower === 'languages') {
    contents = `List 30 key language learning topics for a ${studentAge}-year-old UK Key Stage 2 student. 
    
    You MUST include topics for ALL of these languages: French, Spanish, German, Japanese, Mandarin, Romanian, Yoruba, and Welsh.
    
    Format the topics clearly as "[Language]: [Topic]", for example:
    - "French: Greetings"
    - "Spanish: Numbers"
    - "German: Colors"
    - "Japanese: Introduction"
    - "Mandarin: Family"
    - "Yoruba: Common Phrases"
    - "Romanian: Food"
    - "Welsh: Basics"

    Focus on vocabulary and basic conversation. Ensure topics are aligned with the UK DfE curriculum standards where applicable, or beginner levels for the other languages.

    IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else if (isSpecificLanguage) {
    const languageLabel = subject.charAt(0).toUpperCase() + subject.slice(1);
    contents = `List 20 beginner-friendly topics for learning ${languageLabel} for a ${studentAge}-year-old UK Key Stage 2 student.

RULES:
- Keep each topic short and clear (e.g., "Greetings", "Numbers 1-20", "Colors", "Family", "Food", "School")
- Focus on practical vocabulary and simple phrases a child can use
- DO NOT prefix the topic with the language name (just the topic text)
- Avoid grammar-heavy or abstract topics; keep it fun and usable

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else if (subjectLower === 'pe') {
    contents = `List 30 key theoretical topics for Physical Education (PE) for a ${studentAge}-year-old UK Key Stage 2 student. Focus on health, fitness, body awareness, and rules of sports (e.g., 'Healthy Eating', 'Muscles and Bones', 'Importance of Exercise', 'Rules of Football'). Do not include practical activities that require physical movement right now.

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else if (subjectLower === 'pshe') {
    contents = `List 30 key topics for PSHE (Personal, Social, Health and Economic Education) for a ${studentAge}-year-old UK Key Stage 2 student. Focus on emotional well-being, relationships, and safety (e.g., 'Friendship', 'Online Safety', 'Managing Feelings', 'Money Matters').

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else if (subjectLower === 'd&t' || subjectLower === 'design & technology') {
    contents = `List 30 key topics for Design & Technology (D&T) for a ${studentAge}-year-old UK Key Stage 2 student. Focus on design processes, structures, mechanisms, and food technology (e.g., 'Levers and Pulleys', 'Strong Structures', 'Healthy Cooking', 'Textiles').

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else if (subjectLower === 'music') {
    contents = `List 30 key topics for Music for a ${studentAge}-year-old UK Key Stage 2 student. Focus on instruments, musical notation, composers, and rhythm (e.g., 'Orchestra Instruments', 'Reading Notes', 'Famous Composers', 'Rhythm and Pulse').

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else if (subjectLower === 'religious education' || subjectLower === 're') {
    contents = `List 30 key topics for Religious Education (RE) for a ${studentAge}-year-old UK Key Stage 2 student. Focus on major world religions (Christianity, Islam, Judaism, Hinduism, Sikhism, Buddhism), festivals, symbols, and moral stories. Ensure a balanced and respectful representation.

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else if (subjectLower === 'citizenship') {
    contents = `List 30 key topics for Citizenship for a ${studentAge}-year-old UK Key Stage 2 student. Focus on rights and responsibilities, democracy, community, environment, and global awareness (e.g., 'Voting', 'Human Rights', 'Recycling', 'Helping the Community').

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language.`;
  } else {
    contents = `List 30 key topics for the subject '${subject}' for a ${studentAge}-year-old. Provide a comprehensive list covering ALL major areas of the UK Department for Education (DfE) National Curriculum for Key Stage 2. Ensure no major topic is left out.

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language. Avoid any complex, scary, or inappropriate topics.`;
  }

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: topicsModel,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['topics'],
        },
      },
    }));

    const jsonResponse = JSON.parse(response.text);
    const topics = jsonResponse.topics || [];
    
    // Validate topics
    const validation = validateTopicsList(topics);
    if (!validation.isValid) {
      console.warn('Topics validation issues:', validation.issues);
      contentMonitor.logValidationIssue({
        timestamp: new Date(),
        type: 'topic',
        subject,
        validationIssues: validation.issues,
        wasBlocked: topics.length === 0
      });
      // Filter out invalid topics or return empty array if critical issues
      if (topics.length === 0) {
        throw new Error('No valid topics generated');
      }
    }
    
    setInCache(cacheKey, topics);
    
    // Save to Shared Cache (with model version so stale content is busted on model upgrade)
    if (offlineManager.checkOnlineStatus()) {
      setInSharedCache(cacheKey, topics, CACHE_MODEL_VERSION);
    }
    
    return topics;
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

export const generateLesson = async (subject: string, topic: string, difficulty: Difficulty, studentAge: number): Promise<string> => {
  const cacheKey = createCacheKey('lesson', subject, topic, difficulty, studentAge.toString());
  
  // 1. Check Local Cache
  const cachedLesson = getFromCache<string>(cacheKey);
  if (cachedLesson) {
    console.log(`Cache hit for lesson: ${subject} - ${topic} (${difficulty}, age ${studentAge})`);
    return cachedLesson;
  }
  
  // 2. Check Shared Cache
  if (offlineManager.checkOnlineStatus()) {
    const sharedLessonRaw = await getFromSharedCache<any>(cacheKey, CACHE_MODEL_VERSION);
    const sharedLesson = sanitizeSharedLesson(sharedLessonRaw);
    if (sharedLesson) {
      const validation = validateLesson(sharedLesson);
      if (!hasSafetyIssues(validation.issues)) {
        console.log(`Shared cache hit for lesson: ${subject} - ${topic}`);
        setInCache(cacheKey, sharedLesson);
        return sharedLesson;
      }
      console.warn('Ignored shared cached lesson due to validation issues.');
    }
  }
  
  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    return "You're currently offline. This lesson hasn't been downloaded yet. Please connect to the internet to load new lessons, or choose a topic you've studied before!";
  }
  
  let contents = '';
  const subjectLower = subject.toLowerCase();
  
  let specificInstructions = "";
  if (subjectLower === 'computing' || subjectLower === 'coding') {
    specificInstructions = "For Computing, ensure 'Direct Teaching' and 'Modelling' include code snippets in Python or Scratch where appropriate, and explain *how* it works.";
  } else if (['languages', 'french', 'spanish', 'german', 'japanese', 'mandarin', 'romanian', 'yoruba'].includes(subjectLower)) {
    specificInstructions = "For Languages, 'Key Vocabulary' must include the foreign word, phonetic pronunciation in brackets, and English meaning (e.g., 'Chat (sha) - Cat'). 'Quick Explanation' should focus on simple phrases and usage, avoiding complex grammar. Ensure the content is very basic and suitable for a beginner.";
  } else if (subjectLower === 'maths' || subjectLower === 'mathematics') {
    specificInstructions = "For Maths, 'Modelling' must show step-by-step working out.";
  }

  // SATs Revision Logic (Year 6)
  const isYear6 = studentAge >= 10;
  if (isYear6 && (subjectLower === 'maths' || subjectLower === 'mathematics')) {
    specificInstructions += `
    SATs FOCUS (Year 6):
    - Align with KS2 SATs Arithmetic and Reasoning papers.
    - 'Quick Explanation' MUST include a specific "SATs Tip" (e.g., "Remember to check units!", "Show your working").
    - 'Try It' tasks should mirror SATs question styles (e.g., "Calculate...", "Explain why...").
    - Emphasize formal written methods where applicable.`;
  } else if (isYear6 && (subjectLower === 'english' || subjectLower === 'literacy')) {
    specificInstructions += `
    SATs FOCUS (Year 6):
    - Align with KS2 SATs Reading and GPS (SPaG) papers.
    - 'Key Vocabulary' MUST include formal grammatical terms (e.g., 'subjunctive', 'passive', 'determiner') if relevant.
    - 'Quick Explanation' MUST include a "SATs Tip" (e.g., "Look for evidence in the text", "Check your punctuation").
    - 'Try It' tasks should mirror SATs style (e.g., "Tick one box", "Circle the adjective").`;
  }

  contents = `You are MiRa, an AI tutor for KS2 students (ages 7–11).
Create a SHORT KS2 lesson for the topic '${topic}' in the subject '${subject}'.
The difficulty is ${difficulty} and the student is age ${studentAge}.

Make the lesson compact, punchy and engaging – it should feel like a quick mini-lesson, not a full teacher worksheet.

STRICT FORMAT (headings only, no extra sections):
1. Learning Objective (1 short sentence)
2. Key Vocabulary (3–6 words with very short KS2-friendly meanings)
3. Quick Explanation (2–4 short sentences, no long paragraphs)
4. Try It (2–3 very short, clear practice tasks the student can answer)
5. Challenge (1 optional harder question or mini-task)

RULES:
- Use friendly, clear, calm language – not babyish, not over-excited.
- Keep everything as SHORT as possible while still clear.
- Use at most 1 small example in the explanation.
- Tasks must be answerable by KS2 children without extra resources.
- Avoid any long lists, big blocks of text, or repeated information.
${specificInstructions}
- Do NOT add introductions or closing speeches outside the headings.

Output using clean markdown with only those 5 headings.`;


  try {
    const response = await withRetry(() => ai.models.generateContent({
      model,
      contents,
    }));
    const lessonText = response.text;
    
    // Validate lesson content
    const validation = validateLesson(lessonText);
    if (!validation.isValid) {
      // Log non-critical validation issues to content monitor only
      contentMonitor.logValidationIssue({
        timestamp: new Date(),
        type: 'lesson',
        subject,
        topic,
        validationIssues: validation.issues,
        wasBlocked: lessonText.length < 50
      });
      // For critical issues, throw error
      if (lessonText.length < 50) {
        throw new Error('Generated lesson is too short');
      }
    }
    
    setInCache(cacheKey, validation.sanitizedContent || lessonText);
    
    // Save to Shared Cache (model-versioned)
    if (offlineManager.checkOnlineStatus()) {
      setInSharedCache(cacheKey, validation.sanitizedContent || lessonText, CACHE_MODEL_VERSION);
    }

    return validation.sanitizedContent || lessonText;
  } catch (error) {
    console.error("Error generating lesson:", error);
    return "Oops! I couldn't prepare the lesson. Please try again.";
  }
};

export const generateQuiz = async (
  subject: string, 
  topic: string, 
  difficulty: Difficulty, 
  studentAge: number,
  studentQuizHistory?: Array<{ score: number; difficulty: string }>,
  studentProfile?: import('./adaptiveLearningEngine').StudentPerformanceProfile
): Promise<QuizQuestion[]> => {
  // ADAPTIVE DIFFICULTY: Adjust based on student performance
  const adaptedDifficulty = studentQuizHistory 
    ? getAdaptedDifficulty(difficulty, studentQuizHistory) as Difficulty
    : difficulty;
  
  if (adaptedDifficulty !== difficulty) {
    console.log(`Adaptive difficulty: ${difficulty} → ${adaptedDifficulty}`);
  }
  
  // 0. Check Shared Cache for WHOLE QUIZ (Fastest & Cheapest)
  const cacheKey = createCacheKey('quiz', subject, topic, adaptedDifficulty, studentAge.toString());
  
  // Check Local Cache first
  const cachedData = getFromCache<{ questions: QuizQuestion[], timestamp: number, source: string }>(cacheKey);
  if (cachedData && cachedData.questions && cachedData.questions.length >= 10) {
    console.log(`Using cached ${cachedData.source || 'AI'}-generated quiz: ${subject} - ${topic}`);
    return cachedData.questions;
  }

  // Check Shared Cache
  if (offlineManager.checkOnlineStatus()) {
    const sharedQuizRaw = await getFromSharedCache<any>(cacheKey, CACHE_MODEL_VERSION);
    const sharedQuiz = sanitizeSharedQuiz(sharedQuizRaw);
    if (sharedQuiz && sharedQuiz.length >= 10) {
      console.log(`Shared cache hit for quiz: ${subject} - ${topic}`);
      // Save locally
      setInCache(cacheKey, {
        questions: sharedQuiz,
        timestamp: Date.now(),
        source: 'shared-cache'
      });
      return sharedQuiz;
    }
  }

  const usedQuestionIds = getUsedQuestions(subject, topic, studentAge, adaptedDifficulty);
  let finalQuestions: QuizQuestion[] = [];
  const existingQuestionTexts: string[] = [];

  // STEP 1: Try to get questions from Firebase (The "Cloud Bank")
  try {
    if (offlineManager.checkOnlineStatus()) {
        // Note: In a real app, you'd want a more sophisticated query (e.g. random seed)
        // Firestore doesn't support random selection natively easily without extra fields.
        // For now, we fetch a batch and shuffle client-side.
        const q = query(
            collection(db, "questions"),
            where("subject", "==", subject),
            where("topic", "==", topic),
            where("difficulty", "==", adaptedDifficulty),
            where("age", "==", studentAge),
            limit(30) 
        );
        const querySnapshot = await getDocs(q);
        const firebaseQuestions: QuizQuestion[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.question && data.options && data.correctAnswer) {
                 firebaseQuestions.push({
                    id: doc.id,
                    question: data.question,
                    options: data.options,
                    correctAnswer: data.correctAnswer,
                    explanation: data.explanation,
                    questionType: data.questionType || QType.MultipleChoice,
                    cognitiveLevel: data.cognitiveLevel
                });
            }
        });

        // Filter out used questions and poorly performing ones
        let availableFirebaseQuestions = firebaseQuestions.filter(q => !usedQuestionIds.includes(q.id));
        availableFirebaseQuestions = filterPoorlyPerformingQuestions(availableFirebaseQuestions);
        
        // Filter similar questions
        availableFirebaseQuestions = filterSimilarQuestions(availableFirebaseQuestions, existingQuestionTexts);
        
        if (availableFirebaseQuestions.length > 0) {
             console.log(`Found ${availableFirebaseQuestions.length} quality questions in Firebase`);
             finalQuestions = [...availableFirebaseQuestions];
             existingQuestionTexts.push(...availableFirebaseQuestions.map(q => q.question));
        }
    }
  } catch {
      // Firebase permissions not configured or network issue - app will use local bank and AI
      if (process.env.NODE_ENV === 'development') {
        console.debug("Firebase fetch skipped (permissions or network issue)");
      }
  }

  // STEP 2: Try to get questions from the static question bank
  // We only need enough to fill the gap to 10
  const neededFromBank = 10 - finalQuestions.length;
  if (neededFromBank > 0) {
      // Handle language subject mapping for static bank
      let bankSubject = subject;
      let bankTopic = topic;
      const subjectLower = subject.toLowerCase();
      const isLanguage = ['french', 'spanish', 'german', 'japanese', 'mandarin', 'romanian', 'yoruba'].includes(subjectLower);
      
      if (isLanguage) {
          bankSubject = 'Languages';
          // The bank uses "French: Topic" format
          // We try to construct it, but it might not match if AI topic name differs slightly
          bankTopic = `${subject}: ${topic}`; 
      }

      let bankQuestions = await getRandomQuestions(bankSubject, bankTopic, studentAge, adaptedDifficulty, neededFromBank, usedQuestionIds);
      
      // Filter poorly performing and similar questions
      bankQuestions = filterPoorlyPerformingQuestions(bankQuestions);
      bankQuestions = filterSimilarQuestions(bankQuestions, existingQuestionTexts);
      
      // If strict match failed for language, try to find any questions for this language
      if (isLanguage && bankQuestions.length === 0) {
          // Fetch ALL questions for "Languages" subject
          const allLanguageQuestions = await getRandomQuestions(bankSubject, "", studentAge, adaptedDifficulty, 50, usedQuestionIds);
          
          // Filter for the specific language (e.g. "French")
          // The bank topics are like "French: Greetings", so we check if topic starts with "French"
          const languagePrefix = subject + ":";
          let specificLanguageQuestions = allLanguageQuestions.filter(q => 
              q.topic.startsWith(languagePrefix) || q.topic.includes(subject)
          );
          
          // Apply quality filters
          specificLanguageQuestions = filterPoorlyPerformingQuestions(specificLanguageQuestions);
          specificLanguageQuestions = filterSimilarQuestions(specificLanguageQuestions, existingQuestionTexts);
          
          if (specificLanguageQuestions.length > 0) {
              console.log(`Found ${specificLanguageQuestions.length} general ${subject} questions in bank`);
              // Shuffle and take what we need
              const shuffled = specificLanguageQuestions.sort(() => Math.random() - 0.5);
              bankQuestions = shuffled.slice(0, neededFromBank);
          }
      }

      finalQuestions = [...finalQuestions, ...bankQuestions];
      existingQuestionTexts.push(...bankQuestions.map(q => q.question));
  }
  
  // Fallback: If no questions found for specific topic, try finding questions for the subject generally
  if (finalQuestions.length === 0) {
    console.log(`No exact match for topic "${topic}", searching for general ${subject} questions...`);
    
    const fallbackSubject = subject;
    // For languages, we don't want to mix languages, so we skip general fallback 
    // unless we can filter by language. Since getRandomQuestions is strict, 
    // we skip general fallback for languages to avoid showing Spanish questions in French quiz.
    const subjectLower = subject.toLowerCase();
    const isLanguage = ['french', 'spanish', 'german', 'japanese', 'mandarin', 'romanian', 'yoruba'].includes(subjectLower);

    if (!isLanguage) {
        let allSubjectQuestions = await getRandomQuestions(fallbackSubject, "", studentAge, adaptedDifficulty, 10, usedQuestionIds);
        // Apply quality filters
        allSubjectQuestions = filterPoorlyPerformingQuestions(allSubjectQuestions);
        allSubjectQuestions = filterSimilarQuestions(allSubjectQuestions, existingQuestionTexts);
        if (allSubjectQuestions.length > 0) {
            finalQuestions = allSubjectQuestions;
            existingQuestionTexts.push(...allSubjectQuestions.map(q => q.question));
        }
    }
  }
  
  if (finalQuestions.length >= 10) {
    // We have enough unique questions!
    console.log(`Using ${finalQuestions.length} questions (Firebase + Bank)`);
    // Shuffle them
    finalQuestions = finalQuestions.sort(() => Math.random() - 0.5).slice(0, 10);

    const questionIds = finalQuestions.map(q => q.id);
    markQuestionsAsUsed(subject, topic, studentAge, adaptedDifficulty, questionIds);
    
    const cacheKey = createCacheKey('quiz', subject, topic, adaptedDifficulty, studentAge.toString());
    const cacheData = {
      questions: finalQuestions,
      timestamp: Date.now(),
      source: 'hybrid-bank'
    };
    setInCache(cacheKey, cacheData);
    
    return finalQuestions;
  }
  
  // If we've used all questions, reset tracker
  if (finalQuestions.length === 0 && usedQuestionIds.length > 0) {
    console.log('All questions used - resetting tracker');
    resetUsedQuestions(subject, topic, studentAge, adaptedDifficulty);
    // Recursive call to try again with fresh tracker? 
    // Or just proceed to AI. Let's proceed to AI to generate fresh content.
  }

  // STEP 3: Generate new questions with AI (and cache them for later)
  // Note: Cache was already checked at the start of the function
  console.log(`Generating new questions with AI for: ${subject} - ${topic} (${adaptedDifficulty})`);
  
  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    console.warn('Offline: No cached quiz or bank questions available');
    // Return partial bank questions if we have any
    if (finalQuestions.length > 0) {
      console.log(`Returning ${finalQuestions.length} bank questions (offline mode)`);
      return finalQuestions;
    }
    return [];
  }

  let specificQuizInstructions = "";
  const subjectLower = subject.toLowerCase();
  if (['languages', 'french', 'spanish', 'german', 'japanese', 'mandarin', 'romanian', 'yoruba'].includes(subjectLower)) {
      specificQuizInstructions = `
      LANGUAGE-SPECIFIC INSTRUCTIONS:
      - Focus on basic vocabulary, greetings, numbers, colors, common objects, and simple phrases
      - Always provide the English translation in the question or options as needed
      - Ensure the foreign language text is clearly marked (e.g., in quotes or italics description)
      - Include audio-friendly questions like "How do you say 'hello' in French?"
      - Mix question types: translations both ways, fill-in-the-blank, matching
      - Avoid complex grammar - focus on practical, usable vocabulary
      `;
  }

  // DfE KS2 National Curriculum objectives by subject
  const dfeObjectives: Record<string, Record<string, string[]>> = {
    maths: {
      'Addition and Subtraction': ['Add/subtract numbers with up to 4 digits using formal written methods', 'Solve 2-step problems in contexts', 'Estimate and use inverse operations to check'],
      'Multiplication and Division': ['Multiply 2-digit by 1-digit numbers', 'Use place value for mental calculations', 'Recall multiplication facts to 12×12'],
      'Fractions': ['Recognise equivalent fractions', 'Add/subtract fractions with same denominator', 'Find fractions of quantities'],
      'Decimals': ['Recognise decimal equivalents', 'Round decimals to nearest whole number', 'Compare numbers with up to 2 decimal places'],
      'Place Value': ['Read, write, order numbers to 10,000', 'Find 1000 more or less', 'Round to nearest 10, 100, 1000'],
      'Shapes and Geometry': ['Compare and classify geometric shapes', 'Identify lines of symmetry', 'Know angles are measured in degrees'],
    },
    science: {
      'Living Things': ['Recognise living things can be grouped', 'Use classification keys', 'Recognise environments can change'],
      'Plants': ['Identify functions of plant parts', 'Explore requirements for life and growth', 'Investigate water transport in plants'],
      'Animals': ['Describe simple functions of digestive system', 'Identify types of teeth', 'Construct and interpret food chains'],
      'Human Body': ['Describe functions of skeleton and muscles', 'Identify organs', 'Recognise impact of diet and exercise'],
      'Forces and Magnets': ['Compare how things move on different surfaces', 'Notice magnetic poles attract/repel', 'Describe magnets as having two poles'],
      'States of Matter': ['Compare and group materials', 'Observe melting, freezing, evaporation', 'Identify water cycle stages'],
    },
    english: {
      'Spelling': ['Use prefixes and suffixes', 'Spell homophones correctly', 'Use first 2-3 letters for dictionary'],
      'Grammar': ['Use noun phrases expanded by modifiers', 'Use fronted adverbials', 'Use conjunctions, adverbs and prepositions'],
      'Punctuation': ['Use commas after fronted adverbials', 'Use apostrophes for possession', 'Use inverted commas for speech'],
      'Vocabulary': ['Use a thesaurus', 'Choose words for effect', 'Understand formal and informal language'],
      'Parts of Speech': ['Identify nouns, verbs, adjectives, adverbs', 'Use pronouns appropriately', 'Understand determiners'],
      'Synonyms and Antonyms': ['Use synonyms for variety', 'Understand antonyms change meaning', 'Build word families'],
    },
    history: {
      'Romans in Britain': ['Know when Romans invaded', 'Understand impact on British culture', 'Know about Roman roads, towns, villas'],
      'Vikings': ['Know where Vikings came from', 'Understand Viking raids and settlements', 'Compare Viking and Anglo-Saxon life'],
      'Ancient Egypt': ['Know about pharaohs and pyramids', 'Understand Egyptian beliefs', 'Know about hieroglyphics'],
      'Tudors': ['Know key Tudor monarchs', 'Understand religious changes', 'Know about exploration and discovery'],
      'World War 2': ['Know causes and timeline', 'Understand evacuation', 'Know about the Blitz and rationing'],
      'Stone Age to Iron Age': ['Know chronology of periods', 'Understand hunter-gatherer to farmer', 'Know about Stonehenge'],
    },
    geography: {
      'Maps and Atlases': ['Use 4-figure grid references', 'Use symbols and keys', 'Use 8 compass points'],
      'UK Geography': ['Name and locate counties and cities', 'Identify geographical regions', 'Understand human and physical features'],
      'World Continents': ['Locate continents and oceans', 'Identify major countries', 'Understand time zones'],
      'Weather and Climate': ['Describe and understand climate zones', 'Compare climates', 'Understand weather patterns'],
      'Rivers': ['Describe key features of rivers', 'Understand erosion and deposition', 'Know major UK and world rivers'],
      'Environmental Issues': ['Understand human impact on environment', 'Know about sustainability', 'Describe climate change effects'],
    },
    computing: {
      'Algorithms': ['Design and write programs', 'Use sequence, selection, repetition', 'Use logical reasoning'],
      'Coding Basics': ['Use Scratch or similar', 'Debug simple programs', 'Use variables in programs'],
      'Internet Safety': ['Use technology safely', 'Recognise acceptable behaviour', 'Report concerns'],
      'Computer Hardware': ['Understand input/output devices', 'Know about storage', 'Understand networks'],
      'Digital Literacy': ['Use search effectively', 'Evaluate digital content', 'Create digital content'],
    },
    art: {
      'Colour Theory': ['Know primary and secondary colours', 'Understand warm and cool colours', 'Mix colours for shades and tints'],
      'Famous Artists': ['Know about artists from different periods', 'Compare artistic styles', 'Understand artistic techniques'],
      'Drawing Techniques': ['Use line, tone and texture', 'Sketch from observation', 'Use perspective'],
      'Art History': ['Know major art movements', 'Compare art across cultures', 'Understand historical context'],
      'Patterns and Textures': ['Create repeating patterns', 'Use different materials for texture', 'Print patterns'],
    },
  };

  // Add subject-specific guidance for better questions
  const subjectGuidance: Record<string, string> = {
    maths: `
      DfE MATHS OBJECTIVES TO TEST:
      ${dfeObjectives.maths[topic]?.map(o => `• ${o}`).join('\n      ') || '• Apply mathematical knowledge to solve problems'}
      
      QUESTION DESIGN:
      - Include a MIX: calculations, word problems, shape recognition, pattern finding
      - For word problems, use real-life scenarios (shopping, cooking, sports)
      - Include visual descriptions when helpful ("Imagine a rectangle with...")
      - Test both procedural knowledge AND conceptual understanding
      - Use COMMON MISCONCEPTIONS for wrong answers (e.g., "forgot to carry", "added instead of multiplied")
    `,
    science: `
      DfE SCIENCE OBJECTIVES TO TEST:
      ${dfeObjectives.science[topic]?.map(o => `• ${o}`).join('\n      ') || '• Apply scientific enquiry skills'}
      
      QUESTION DESIGN:
      - Mix factual recall with application questions
      - Include "What would happen if..." prediction questions
      - Reference real experiments and observations children might do
      - Connect to everyday phenomena (why does ice melt, how do plants grow)
      - Use COMMON MISCONCEPTIONS for wrong answers (e.g., "plants get food from soil")
    `,
    english: `
      DfE ENGLISH OBJECTIVES TO TEST:
      ${dfeObjectives.english[topic]?.map(o => `• ${o}`).join('\n      ') || '• Apply language skills effectively'}
      
      QUESTION DESIGN:
      - Mix grammar, vocabulary, comprehension, and creative elements
      - Use interesting sentence examples from stories or real life
      - Include questions about word meanings in context
      - Test punctuation with purpose (how it changes meaning)
      - Use COMMON MISTAKES for wrong answers (their/there/they're, its/it's)
    `,
    history: `
      DfE HISTORY OBJECTIVES TO TEST:
      ${dfeObjectives.history[topic]?.map(o => `• ${o}`).join('\n      ') || '• Understand historical concepts and chronology'}
      
      QUESTION DESIGN:
      - Focus on cause and effect, not just dates
      - Include "Why did..." and "What happened because..." questions
      - Connect historical events to daily life back then
      - Make it relatable to children's experience
      - Include PRIMARY SOURCE questions where possible
    `,
    geography: `
      DfE GEOGRAPHY OBJECTIVES TO TEST:
      ${dfeObjectives.geography[topic]?.map(o => `• ${o}`).join('\n      ') || '• Apply geographical knowledge and skills'}
      
      QUESTION DESIGN:
      - Include map-reading skills and real locations
      - Ask about human and physical geography
      - Connect to environmental awareness and current events
      - Include "Where in the world..." exploration questions
      - Use REAL PLACES and CURRENT EXAMPLES
    `,
    computing: `
      DfE COMPUTING OBJECTIVES TO TEST:
      ${dfeObjectives.computing[topic]?.map(o => `• ${o}`).join('\n      ') || '• Apply computational thinking'}
      
      QUESTION DESIGN:
      - Include algorithm/logic puzzles
      - Test debugging skills with "What's wrong with this code?"
      - Include internet safety scenarios
      - Make questions practical and applicable
    `,
    art: `
      DfE ART OBJECTIVES TO TEST:
      ${dfeObjectives.art[topic]?.map(o => `• ${o}`).join('\n      ') || '• Develop artistic knowledge and skills'}
      
      QUESTION DESIGN:
      - Test knowledge about techniques, artists, and art history
      - Include colour theory and mixing questions
      - Ask about famous artworks and what makes them special
      - Include questions about materials and their effects
      - Use "What technique would you use to..." application questions
    `,
  };

  let subjectSpecificTips = subjectGuidance[subjectLower] || '';

  // SATs Enhancement for Year 6
  if (studentAge >= 10) {
      if (subjectLower === 'maths' || subjectLower === 'mathematics') {
          subjectSpecificTips += `
          SATs EXAM STYLE (Year 6):
          - Include questions that mimic the "Arithmetic Paper" (pure calculation, e.g., long multiplication, fractions).
          - Include questions that mimic the "Reasoning Papers" (word problems, explaining why, missing number problems).
          - Ensure difficulty matches the end of KS2 standard.
          `;
      } else if (subjectLower === 'english' || subjectLower === 'literacy') {
          subjectSpecificTips += `
          SATs EXAM STYLE (Year 6):
          - Focus on "Grammar, Punctuation and Spelling" (GPS) paper style questions.
          - Ask to identify parts of speech (e.g., "Which word is the adverb?").
          - Ask to correct punctuation errors.
          - Ask for synonyms/antonyms in context.
          `;
      }
  }

  // Question type distribution guidance
  let questionTypeGuidance = `
  QUESTION TYPE VARIETY (generate a mix - MANDATORY):
  - 4-5 "multiple-choice": Standard 4-option multiple choice questions
  - 2-3 "true-false": True/False statements (options must be exactly ["True", "False"])
  - 2-3 "fill-in-blank": Sentence with _____ where student types the answer
  `;

  if (subjectLower === 'art' || subjectLower === 'design & technology') {
    questionTypeGuidance += `
    - 1-2 "drawing": Ask the student to draw something specific related to the topic (e.g., "Draw a secondary colour", "Draw a pattern")
    `;
  }
  
  questionTypeGuidance += `
  COGNITIVE LEVEL VARIETY (Bloom's Taxonomy - MANDATORY distribution):
  - 2-3 "remember": Recall basic facts (What is...? Who...? When...? Name the...)
  - 3-4 "understand": Explain concepts (Why...? What does X mean? Explain how...)
  - 2-3 "apply": Use knowledge in new situations (If you had..., Calculate..., What would happen if...?)
  - 1-2 "analyze": Compare, contrast, find patterns (How are X and Y similar? What's the difference...?)
  
  QUESTION STEM VARIETY (use DIFFERENT starters - at least 7 different ones):
  ✓ "What is..." / "What are..."
  ✓ "Which of these..." / "Which one..."
  ✓ "Why do you think..." / "Why does..."
  ✓ "How would you..." / "How do..."
  ✓ "If you were..." / "Imagine you..."
  ✓ "True or false:..."
  ✓ "Complete this sentence:..."
  ✓ "What would happen if..."
  ✓ "Compare..." / "What's the difference between..."
  ✓ "Put these in order..." / "Which comes first..."
  `;

  // Generate a unique session ID to help with variety
  const sessionId = Date.now().toString(36);

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model,
      contents: `You are MiRa, a creative AI tutor designing an ENGAGING 10-question quiz for a UK Key Stage 2 student (age ${studentAge}) on '${topic}' in '${subject}'.

SESSION ID: ${sessionId} (use this to ensure unique questions)

UK DfE NATIONAL CURRICULUM ALIGNMENT:
This quiz MUST align with the Department for Education Key Stage 2 Programme of Study.
Test the specific learning objectives for this topic as defined in the National Curriculum.

QUIZ QUALITY REQUIREMENTS:
1. VARIETY: Mix different question types AND cognitive levels (see requirements below)
2. ENGAGEMENT: Make questions interesting with real-world connections and fun scenarios
3. DIFFICULTY: ${adaptedDifficulty} level - ${adaptedDifficulty === 'Easy' ? 'build confidence with clear, achievable questions' : adaptedDifficulty === 'Medium' ? 'challenge without frustrating, include some thinking questions' : 'push their knowledge with multi-step thinking'}
4. UNIQUENESS: Every question must feel FRESH and DIFFERENT - avoid textbook phrasing
5. WRONG ANSWERS: Use PLAUSIBLE distractors based on common misconceptions (not silly options)
${studentProfile ? `
STUDENT ADAPTIVE PROFILE (personalise questions to this student):
- Learning level: ${studentProfile.currentLevel}/10
- Learning pace: ${studentProfile.learningPace}
- Weak areas (prioritise these): ${studentProfile.weaknessAreas.length > 0 ? studentProfile.weaknessAreas.join(', ') : 'none identified'}
- Strong areas: ${studentProfile.strengthAreas.length > 0 ? studentProfile.strengthAreas.join(', ') : 'none identified'}
- Recommended difficulty: ${studentProfile.recommendedDifficulty}
Please include at least 2-3 questions targeting the student's weak areas if relevant to this topic.
` : ''}
${questionTypeGuidance}

WRONG ANSWER DESIGN (CRITICAL):
- Base wrong answers on COMMON MISTAKES students make
- Include "almost right" answers that test careful reading
- Never use obviously wrong or silly answers
- Each wrong answer should represent a real misconception

QUESTION DESIGN TIPS:
- Start questions in varied ways (see stem variety above)
- Use child-friendly scenarios (games, food, animals, family activities)
- Include one "fun fact" style question that teaches something surprising
- Reference real-world applications of the knowledge

${specificQuizInstructions}
${subjectSpecificTips}

CRITICAL RULES:
- All content must be 100% appropriate for children aged ${studentAge}
- Every answer option must be SPECIFIC and RELATED to the topic (NO generic placeholders!)
- Include a brief, encouraging explanation for each answer
- For fill-in-blank: use _____ in the question text, provide correctAnswer, and optionally acceptableAnswers
- For true-false: options must be exactly ["True", "False"]
- Use British English spelling throughout

Generate 10 varied, engaging questions:`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  questionType: { 
                    type: Type.STRING,
                    description: "Type of question: 'multiple-choice', 'true-false', 'fill-in-blank', or 'drawing'"
                  },
                  cognitiveLevel: { 
                    type: Type.STRING,
                    description: "Bloom's level: 'remember', 'understand', 'apply', or 'analyze'" 
                  },
                  acceptableAnswers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Alternative correct answers for fill-in-blank questions"
                  }
                },
                required: ['question', 'correctAnswer', 'questionType', 'cognitiveLevel'],
              },
            },
          },
          required: ['quiz'],
        },
      },
    }));
    
    const jsonResponse = JSON.parse(response.text);
    const quizQuestions = jsonResponse.quiz || [];
    
    // Normalize question types and cognitive levels
    const normalizedQuestions = quizQuestions.map((question: any) => {
      // Map AI response to our enums
      let questionType = QType.MultipleChoice;
      if (question.questionType) {
        const typeMap: Record<string, QuestionType> = {
          'multiple-choice': QType.MultipleChoice,
          'multiplechoice': QType.MultipleChoice,
          'true-false': QType.TrueFalse,
          'truefalse': QType.TrueFalse,
          'fill-in-blank': QType.FillInBlank,
          'fillinblank': QType.FillInBlank,
          'ordering': QType.Ordering,
          'drawing': QType.Drawing,
        };
        questionType = typeMap[question.questionType.toLowerCase()] || QType.MultipleChoice;
      }
      
      let cognitiveLevel: CognitiveLevel | undefined;
      if (question.cognitiveLevel) {
        const levelMap: Record<string, CognitiveLevel> = {
          'remember': CLevel.Remember,
          'recall': CLevel.Remember,
          'understand': CLevel.Understand,
          'comprehend': CLevel.Understand,
          'apply': CLevel.Apply,
          'application': CLevel.Apply,
          'analyze': CLevel.Analyze,
          'analyse': CLevel.Analyze,
          'analysis': CLevel.Analyze,
        };
        cognitiveLevel = levelMap[question.cognitiveLevel.toLowerCase()];
      }
      
      // For true-false, ensure options are correct
      if (questionType === QType.TrueFalse) {
        question.options = ['True', 'False'];
      }
      
      // For fill-in-blank without options, create empty array
      if (questionType === QType.FillInBlank && !question.options) {
        question.options = [];
      }
      
      return {
        ...question,
        questionType,
        cognitiveLevel,
        acceptableAnswers: question.acceptableAnswers || []
      };
    });
    
    // Validate each quiz question
    const validQuestions = normalizedQuestions.filter((question: QuizQuestion) => {
      const validation = validateQuizQuestion(question);
      if (!validation.isValid) {
        console.warn('Quiz question validation failed:', validation.issues, question);
        contentMonitor.logValidationIssue({
          timestamp: new Date(),
          type: 'quiz',
          subject,
          topic,
          validationIssues: validation.issues,
          wasBlocked: true
        });
        return false;
      }
      return true;
    });
    
    // Shuffle options for AI-generated questions to randomize answer positions (only for multiple choice)
    const shuffledAIQuestions: QuizQuestion[] = validQuestions.map((question: QuizQuestion) => {
      // Don't shuffle true/false or fill-in-blank or drawing
      if (question.questionType === QType.TrueFalse || question.questionType === QType.FillInBlank || question.questionType === QType.Drawing) {
        return question;
      }
      return {
        ...question,
        options: [...question.options].sort(() => Math.random() - 0.5)
      };
    });
    
    // Filter similar questions before combining
    const filteredAIQuestions: QuizQuestion[] = filterSimilarQuestions(shuffledAIQuestions, existingQuestionTexts);
    
    console.log(`Debug: validQuestions=${validQuestions.length}, shuffled=${shuffledAIQuestions.length}, filtered=${filteredAIQuestions.length}, finalQuestions=${finalQuestions.length}`);

    // FORCE DRAWING QUESTION FOR ART/D&T
    // If subject is Art/D&T and no drawing question exists, convert one or add one
    const isArtOrDT = ['art', 'design & technology', 'd&t'].includes(subject.toLowerCase());
    const hasDrawingQuestion = filteredAIQuestions.some(q => q.questionType === QType.Drawing);
    
    if (isArtOrDT && !hasDrawingQuestion && filteredAIQuestions.length > 0) {
      console.log('Forcing a drawing question for Art/D&T');
      // Create a generic drawing question based on the topic
      const drawingQuestion: QuizQuestion = {
        id: `drawing-${Date.now()}`,
        question: `Drawing Challenge: Draw something related to ${topic}!`,
        options: [],
        correctAnswer: "Drawing submitted",
        explanation: "Great drawing! Practising your art skills is just as important as answering questions.",
        questionType: QType.Drawing,
        cognitiveLevel: CLevel.Apply
      };
      
      // Replace the last question or add it
      if (filteredAIQuestions.length >= 10) {
        filteredAIQuestions[filteredAIQuestions.length - 1] = drawingQuestion;
      } else {
        filteredAIQuestions.push(drawingQuestion);
      }
    }

    // Combine bank questions with AI-generated questions if needed
    let combinedQuestions = [...finalQuestions, ...filteredAIQuestions];
    
    // Ensure we have at least 5 valid questions total (relaxed from 10 to allow partial success)
    if (combinedQuestions.length < 5) {
      console.error('Not enough valid quiz questions generated');
      throw new Error('Failed to generate valid quiz questions');
    }
    
    // Limit to 10 questions
    combinedQuestions = combinedQuestions.slice(0, 10);
    
    // Cache AI-generated questions for future offline use with metadata
    const aiCacheData = {
      questions: combinedQuestions,
      timestamp: Date.now(),
      source: 'ai-generated'
    };
    setInCache(cacheKey, aiCacheData);
    
    // Save to Shared Cache (model-versioned)
    if (offlineManager.checkOnlineStatus()) {
      setInSharedCache(cacheKey, combinedQuestions, CACHE_MODEL_VERSION);
    }

    console.log(`Generated ${filteredAIQuestions.length} new AI questions, combined with ${finalQuestions.length} existing questions`);

    // SAVE TO FIREBASE (The "Cloud Bank")
    // We process sequentially to check for duplicates
    // Note: This requires appropriate Firestore permissions
    for (const q of filteredAIQuestions) {
        try {
            const createdBy = getAuth().currentUser?.uid;
            if (!createdBy) {
              // Not signed in; Cloud Bank requires authentication
              continue;
            }

            // Check if this specific question text already exists for this topic
            // This prevents exact duplicates from filling up the database
            const dupQuery = query(
                collection(db, "questions"),
                where("subject", "==", subject),
                where("topic", "==", topic),
                where("question", "==", q.question),
                limit(1)
            );
            
            const dupSnapshot = await getDocs(dupQuery);

            if (dupSnapshot.empty) {
                await addDoc(collection(db, "questions"), {
                    subject,
                    topic,
                    difficulty: adaptedDifficulty,
                    age: studentAge,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation || "",
                    questionType: q.questionType || QType.MultipleChoice,
                    cognitiveLevel: q.cognitiveLevel,
                    acceptableAnswers: q.acceptableAnswers || [],
                createdAt: Timestamp.now(),
                createdBy
                });
                console.log("✅ Saved new unique question to Cloud Bank");
            } else {
                console.log("⏭️ Skipped duplicate question (already in Cloud Bank)");
            }
        } catch (e) {
            // Log errors so we can debug save failures
            console.error("❌ Failed to save question to Cloud Bank:", (e as Error).message);
            console.error("Question data:", { subject, topic, difficulty: adaptedDifficulty, age: studentAge });
            // App continues to work with local cache even if Cloud Bank save fails
        }
    }
    
    return combinedQuestions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Return any bank questions we have as fallback
    if (finalQuestions.length > 0) {
      console.log(`Returning ${finalQuestions.length} bank questions (error fallback)`);
      return finalQuestions;
    }
    // Emergency fallback: try any questions for this subject (any topic)
    const subjectLowerFb = subject.toLowerCase();
    const isLangFb = ['french', 'spanish', 'german', 'japanese', 'mandarin', 'romanian', 'yoruba'].includes(subjectLowerFb);
    if (!isLangFb) {
      try {
        const emergencyQs = await getRandomQuestions(subject, '', studentAge, adaptedDifficulty, 10, []);
        if (emergencyQs.length > 0) {
          console.log(`Emergency fallback: ${emergencyQs.length} general ${subject} questions`);
          return emergencyQs.slice(0, 10);
        }
      } catch {
        // ignore
      }
    }
    return [];
  }
};

// ============================================================
// DEDICATED SATs QUESTION GENERATOR - ALWAYS USES AI
// Designed to strictly follow DfE KS2 SATs specifications
// ============================================================
export type SATsPaperType = 'arithmetic' | 'reasoning' | 'reading' | 'spag';

export const generateSATsQuiz = async (
  paperType: SATsPaperType,
  questionCount: number = 10
): Promise<QuizQuestion[]> => {
  console.log(`🎯 Generating SATs paper: ${paperType} (${questionCount} questions)`);
  
  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    console.warn('Offline: Cannot generate SATs paper');
    throw new Error('You need to be online to generate SATs practice papers');
  }

  // SATs-specific prompts aligned with DfE specifications
  const satsPrompts: Record<SATsPaperType, string> = {
    arithmetic: `You are creating questions for the KS2 SATs Maths Paper 1: Arithmetic.

DfE SPECIFICATION FOR ARITHMETIC PAPER:
- Tests calculation methods using the four operations
- Includes: addition, subtraction, multiplication, division
- Uses formal written methods (column addition, long multiplication, short division)
- Includes fractions, decimals, and percentages calculations
- NO word problems - pure number calculations only
- Difficulty progresses through the paper

QUESTION FORMAT REQUIREMENTS:
- ALL questions must be MULTIPLE-CHOICE with exactly 4 options
- Questions must be pure calculations (e.g., "Calculate 3,456 + 2,789")
- Include a mix of: whole numbers, decimals, fractions, percentages
- Use formal calculation language: "Calculate", "Work out", "What is"
- Include multi-step calculations for harder questions
- Provide 4 plausible answer options (one correct, three distractors)
- Distractors should be common calculation errors

IMPORTANT: Set questionType to "multiple-choice" for all questions.

SPECIFIC TOPICS TO COVER (DfE statutory):
- Addition/subtraction with numbers up to 1,000,000
- Multiplication of 4-digit by 2-digit numbers
- Division with remainders
- Equivalent fractions, adding/subtracting fractions
- Multiplying fractions by whole numbers
- Decimal calculations to 3 decimal places
- Percentage of amounts`,

    reasoning: `You are creating questions for the KS2 SATs Maths Papers 2 & 3: Reasoning.

DfE SPECIFICATION FOR REASONING PAPERS:
- Tests mathematical reasoning and problem-solving
- Includes word problems in real-life contexts
- Requires explaining methods and showing working
- Tests application of mathematical knowledge
- Includes multi-step problems

QUESTION FORMAT REQUIREMENTS:
- ALL questions must be MULTIPLE-CHOICE with exactly 4 options
- Use real-life contexts (shopping, time, measurements, data)
- Include problem-solving scenarios children can relate to
- Provide 4 plausible answer options (one correct, three distractors)
- Use names and scenarios children can relate to

SPECIFIC TOPICS TO COVER (DfE statutory):
- Place value and ordering
- Fractions, decimals, percentages in context
- Ratio and proportion
- Algebra (simple equations, sequences)
- Measurement (perimeter, area, volume)
- Geometry (angles, shapes, coordinates)
- Statistics (mean, interpreting charts)`,

    reading: `You are creating questions for the KS2 SATs English Reading Paper.

DfE SPECIFICATION FOR READING PAPER:
- Tests reading comprehension across fiction, non-fiction, poetry
- Assesses vocabulary, inference, retrieval, summarising
- Questions reference specific texts/passages
- Tests understanding of author's intent and language choices

QUESTION FORMAT REQUIREMENTS:
- ALL questions must be MULTIPLE-CHOICE with exactly 4 options
- Include retrieval questions ("According to the text...")
- Include inference questions ("What does this suggest about...")
- Include vocabulary questions ("What does the word X mean...")
- Provide 4 plausible answer options (one correct, three distractors)

IMPORTANT: Set questionType to "multiple-choice" for all questions.

CONTENT DOMAINS TO COVER (DfE):
- 2a: Give/explain meaning of words in context
- 2b: Retrieve and record information
- 2c: Summarise main ideas
- 2d: Make inferences from the text
- 2e: Predict what might happen
- 2f: Identify/explain how language contributes to meaning
- 2g: Identify/explain how meaning is enhanced through word choice
- 2h: Make comparisons within the text

For this practice, create questions based on a SHORT passage about a child's adventure. Include the passage in question context.`,

    spag: `You are creating questions for the KS2 SATs English GPS (Grammar, Punctuation & Spelling) Paper.

DfE SPECIFICATION FOR GPS PAPER:
- Section 1: Short answer questions on grammar and punctuation
- Tests knowledge of grammatical terms and word classes
- Tests punctuation rules and usage
- Tests sentence structure and word formation

QUESTION FORMAT REQUIREMENTS:
- ALL questions must be MULTIPLE-CHOICE with exactly 4 options
- Test grammatical terminology (subjunctive, passive voice, relative clause)
- Include sentence transformation questions
- Test punctuation: commas, apostrophes, colons, semi-colons, hyphens
- Include word class identification
- Provide 4 plausible answer options (one correct, three distractors)

IMPORTANT: Set questionType to "multiple-choice" for all questions.

SPECIFIC GRAMMAR TO COVER (DfE statutory Year 6):
- Subjunctive mood ("If I were...")
- Passive and active voice
- Formal and informal vocabulary
- Synonyms and antonyms
- Prefixes and suffixes
- Relative clauses
- Modal verbs
- Cohesive devices
- Colons and semi-colons
- Hyphens for clarity
- Bullet points`
  };

  const prompt = `${satsPrompts[paperType]}

CRITICAL RULES:
- Generate exactly ${questionCount} questions
- ALL questions MUST be multiple-choice with exactly 4 options
- All content must be appropriate for 10-11 year old children
- Use British English spelling throughout
- Questions must be exam-ready quality
- Include 4 clear, specific answer options for EVERY question
- The correctAnswer MUST exactly match one of the options
- Every answer must be definitively correct
- Include a brief explanation for each answer
- Set questionType to "multiple-choice" for ALL questions

Generate ${questionCount} SATs-style multiple-choice questions:`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  questionType: { 
                    type: Type.STRING,
                    description: "Type: 'multiple-choice', 'true-false', or 'fill-in-blank'"
                  },
                  marks: {
                    type: Type.NUMBER,
                    description: "Mark value for this question (1-3)"
                  }
                },
                required: ['question', 'correctAnswer', 'questionType'],
              },
            },
          },
          required: ['quiz'],
        },
      },
    });
    
    const jsonResponse = JSON.parse(response.text);
    const quizQuestions = jsonResponse.quiz || [];
    
    console.log(`✅ Generated ${quizQuestions.length} SATs questions via AI`);
    
    // Normalize and validate - force all SATs questions to multiple-choice for quiz interface
    const normalizedQuestions: QuizQuestion[] = quizQuestions.map((q: any, index: number) => {
      // Force multiple-choice for all SATs questions in quiz format
      const questionType = QType.MultipleChoice;
      
      // Start with provided options or empty array
      const rawOptions = Array.isArray(q.options) ? q.options : [];
      
      // Ensure correct answer is present
      if (!q.correctAnswer) {
         q.correctAnswer = rawOptions.length > 0 ? rawOptions[0] : "Answer";
      }

      // Add correct answer to options if missing
      if (!rawOptions.includes(q.correctAnswer)) {
        rawOptions.push(q.correctAnswer);
      }
      
      // Deduplicate options
      let uniqueOptions = Array.from(new Set(rawOptions));
      
      // Ensure we have at least 4 options
      while (uniqueOptions.length < 4) {
        const newOption = `Option ${String.fromCharCode(65 + uniqueOptions.length)}`;
        if (!uniqueOptions.includes(newOption)) {
            uniqueOptions.push(newOption);
        } else {
             uniqueOptions.push(`Option ${uniqueOptions.length + 1}`);
        }
      }
      
      // Limit to 4 options
      if (uniqueOptions.length > 4) {
        // Ensure correct answer is kept
        const otherOptions = uniqueOptions.filter((o: any) => o !== q.correctAnswer);
        // Take first 3 others
        const selectedOthers = otherOptions.slice(0, 3);
        uniqueOptions = [...selectedOthers, q.correctAnswer];
      }
      
      // Shuffle options to randomize correct answer position
      const finalOptions = uniqueOptions.sort(() => Math.random() - 0.5);
      
      return {
        id: `sats-ai-${paperType}-${index}-${Date.now()}`,
        question: q.question || "Question text missing",
        options: finalOptions,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'No explanation provided',
        questionType,
        cognitiveLevel: CLevel.Apply,
      };
    });
    
    // Validate with detailed logging
    const validQuestions = normalizedQuestions.filter((q, idx) => {
      const validation = validateQuizQuestion(q);
      if (!validation.isValid) {
        console.warn(`❌ SATs Q${idx + 1} failed validation:`, validation.issues, {
          question: q.question?.substring(0, 50),
          options: q.options,
          correctAnswer: q.correctAnswer
        });
      }
      return validation.isValid;
    });
    
    console.log(`✅ ${validQuestions.length}/${normalizedQuestions.length} SATs questions passed validation`);
    
    if (validQuestions.length < 5) {
      console.error('❌ Not enough valid questions. Raw data:', quizQuestions);
      throw new Error(`Not enough valid SATs questions generated (${validQuestions.length}/5 minimum)`);
    }
    
    return validQuestions;
  } catch (error) {
    console.error("Error generating SATs quiz:", error);
    throw error; // Propagate error - don't fall back to static for SATs
  }
};

export const generateFeedback = async (incorrectQuestions: QuizResult[], studentAge: number): Promise<Explanation[]> => {
    if (incorrectQuestions.length === 0) {
        return [];
    }
    
    // Check if questions already have explanations (from bank or AI)
    const explanationsWithPredefined = incorrectQuestions.map(q => {
        if (q.explanation) {
            return { question: q.question, explanation: q.explanation };
        }
        return null;
    }).filter(Boolean) as Explanation[];
    
    // Filter out questions that already have explanations
    const questionsNeedingAI = incorrectQuestions.filter(q => !q.explanation);
    
    if (questionsNeedingAI.length === 0) {
        return explanationsWithPredefined;
    }

    const cacheKey = createCacheKey('feedback', JSON.stringify(questionsNeedingAI.map(q => q.question)), studentAge.toString());
    const cachedFeedback = getFromCache<Explanation[]>(cacheKey);
    if (cachedFeedback) {
        console.log(`Cache hit for feedback (age ${studentAge})`);
        return [...explanationsWithPredefined, ...cachedFeedback];
    }

    // Check if offline
    if (!offlineManager.checkOnlineStatus()) {
        console.warn('Offline: Cannot generate new feedback');
        const offlineExplanations = questionsNeedingAI.map(q => ({
            question: q.question,
            explanation: "You're offline, so we can't generate personalized feedback right now. But keep practicing!"
        }));
        return [...explanationsWithPredefined, ...offlineExplanations];
    }

    const prompt = `
        You are MiRa, a helpful and simple AI tutor. A ${studentAge}-year-old student answered the following questions incorrectly.
        For each question, provide a very simple, one-sentence explanation for why the correct answer is right.
        The explanation should be easy for a child of this age to understand.

        SAFETY GUIDELINES:
        - Use positive, encouraging language
        - Keep explanations simple and child-friendly
        - Focus on learning, not on mistakes
        - Be supportive and motivating

        Here are the questions and correct answers:
        ${questionsNeedingAI.map(q => `- Question: "${q.question}"\n  Correct Answer: "${q.correctAnswer}"`).join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        explanations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    explanation: { type: Type.STRING },
                                },
                                required: ['question', 'explanation'],
                            },
                        },
                    },
                    required: ['explanations'],
                },
            },
        });
        const jsonResponse = JSON.parse(response.text);
        const aiExplanations = jsonResponse.explanations || [];
        
        // Validate each explanation
        const validExplanations = aiExplanations.filter((explanation: Explanation) => {
          const validation = validateExplanation(explanation);
          if (!validation.isValid) {
            console.warn('Explanation validation failed:', validation.issues, explanation);
            contentMonitor.logValidationIssue({
              timestamp: new Date(),
              type: 'explanation',
              validationIssues: validation.issues,
              wasBlocked: true
            });
            return false;
          }
          return true;
        });
        
        setInCache(cacheKey, validExplanations);
        return [...explanationsWithPredefined, ...validExplanations];
    } catch (error) {
        console.error("Error generating feedback:", error);
        const fallbackExplanations = questionsNeedingAI.map(q => ({
            question: q.question,
            explanation: "I had a little trouble thinking of an explanation for this one, but the correct answer is a great thing to remember!"
        }));
        return [...explanationsWithPredefined, ...fallbackExplanations];
    }
};

// Chat with MiRa - Interactive Q&A for students
export const askMiRa = async (
  question: string, 
  studentAge: number,
  studentName?: string,
  context?: { subject?: string; topic?: string },
  currentActivity?: string
): Promise<string> => {
  // Build context string if available
  let contextInfo = '';
  if (context?.subject) {
    contextInfo = `The student is currently learning ${context.subject}`;
    if (context.topic) {
      contextInfo += `, specifically about ${context.topic}`;
    }
    contextInfo += '. ';
  }

  // Personalize greeting based on time of day
  const hour = new Date().getHours();
  let timeGreeting = '';
  if (hour < 12) timeGreeting = 'this morning';
  else if (hour < 17) timeGreeting = 'this afternoon';
  else timeGreeting = 'this evening';

  const prompt = `
You are MiRa (My Interactive Robot Assistant), a cheerful, encouraging AI tutor for UK Key Stage 2 students aged 7-11.

YOUR PERSONALITY:
- 🤖 Friendly robot who LOVES learning and gets excited about discoveries
- 💡 Uses fun analogies, real-world examples, and "Did you know?" facts
- 🎉 Celebrates small wins with enthusiasm ("Brilliant thinking!" "That's a great question!")
- 😊 Patient and never makes students feel bad about mistakes
- 🌟 Uses occasional emojis to be expressive but not overwhelming

CURRENT CONTEXT:
- Student: ${studentName || 'A learner'}, age ${studentAge}
- Time: ${timeGreeting}
${contextInfo ? `- Currently studying: ${contextInfo}` : ''}
${currentActivity ? `- Current Activity: ${currentActivity}` : ''}

STUDENT'S QUESTION: "${question}"

RESPONSE RULES:
1. Keep responses SHORT (2-4 sentences max) - children have short attention spans
2. Use simple vocabulary appropriate for age ${studentAge}
3. Be warm and encouraging - start with something positive
4. Include ONE interesting fact or analogy when explaining concepts
5. If they seem confused, offer to break it down differently
6. NEVER provide inappropriate content or help with non-educational topics
7. If off-topic, gently redirect: "That's interesting! But let's focus on [current topic] - I bet you'll find it really cool because..."
8. End with encouragement or a thought-provoking question when appropriate

EXAMPLE GOOD RESPONSES:
- "Great question! 🌟 Fractions are like cutting a pizza - if you cut it into 4 slices and eat 1, you've eaten 1/4! Does that help?"
- "Ooh, I love this topic! Did you know that the Romans built roads so straight that some are still used today? Pretty amazing, right?"
- "That's tricky, isn't it? Let me explain it a different way..."

Now respond as MiRa:
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error in askMiRa:", error);
    return "Oops! 🤖 My circuits got a bit tangled there! Could you try asking me again?";
  }
};

// Generate detailed progress reports for parents
export const generateProgressReport = async (
  userProfile: any,
  studentAge: number,
  studentName?: string
): Promise<string> => {
  const cacheKey = createCacheKey('progress-report', userProfile.id, studentAge.toString());
  const cachedReport = getFromCache<string>(cacheKey);
  if (cachedReport) {
    console.log(`Cache hit for progress report (user ${userProfile.id})`);
    return cachedReport;
  }

  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    return "You're currently offline. Progress reports need an internet connection to generate the latest insights.";
  }

  const masteryData = userProfile.mastery || {};
  const totalPoints = userProfile.points || 0;
  const streak = userProfile.streak || 0;

  // Calculate overall statistics
  const subjects = Object.keys(masteryData);
  const totalTopics = subjects.reduce((sum, subject) => sum + Object.keys(masteryData[subject]).length, 0);
  const averageMastery = subjects.length > 0 
    ? subjects.reduce((sum, subject) => {
        const topicScores = Object.values(masteryData[subject]) as number[];
        return sum + (topicScores.reduce((a, b) => a + b, 0) / topicScores.length);
      }, 0) / subjects.length
    : 0;

  const prompt = `
You are MiRa, creating a detailed progress report for parents about their ${studentAge}-year-old child's learning journey.

STUDENT PROFILE:
- Name: ${studentName || userProfile.name}
- Age: ${studentAge}
- Total Points Earned: ${totalPoints}
- Current Streak: ${streak} days
- Subjects Studied: ${subjects.join(', ') || 'None yet'}
- Total Topics Completed: ${totalTopics}
- Average Mastery Level: ${averageMastery.toFixed(1)}%

SUBJECT-BY-SUBJECT BREAKDOWN:
${subjects.map(subject => {
  const topics = masteryData[subject];
  const topicList = Object.entries(topics).map(([topic, score]) => `${topic}: ${score}%`).join(', ');
  const topicValues = Object.values(topics) as number[];
  const avgScore = topicValues.length > 0 ? topicValues.reduce((a, b) => a + b, 0) / topicValues.length : 0;
  return `${subject}: Average ${avgScore.toFixed(1)}% (${Object.keys(topics).length} topics) - ${topicList}`;
}).join('\n')}

Create a comprehensive but parent-friendly progress report that includes:
1. Overall Progress Summary (2-3 paragraphs)
2. Subject-by-Subject Analysis
3. Strengths and Areas for Improvement
4. Learning Recommendations
5. Encouragement and Next Steps

GUIDELINES:
- Use positive, encouraging language
- Be specific about achievements and areas needing attention
- Provide actionable recommendations for parents
- Keep it age-appropriate and supportive
- Focus on growth mindset and progress
- Include specific examples from their learning data

Format as a clean, readable report with clear headings.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const report = response.text.trim();
    setInCache(cacheKey, report);
    return report;
  } catch (error) {
    console.error("Error generating progress report:", error);
    return `Here's a quick summary of ${userProfile.name}'s progress:\n\n- Total Points: ${totalPoints}\n- Current Streak: ${streak} days\n- Subjects Studied: ${subjects.join(', ') || 'None yet'}\n- Average Mastery: ${averageMastery.toFixed(1)}%\n\nKeep up the great work! Learning is a journey, and every step counts.`;
  }
};

// Generate learning insights and recommendations for parents
export const generateLearningInsights = async (
  userProfile: any,
  recentQuizResults: any[],
  studentAge: number,
  studentName?: string
): Promise<string> => {
  const cacheKey = createCacheKey('learning-insights', userProfile.id, Date.now().toString());
  const cachedInsights = getFromCache<string>(cacheKey);
  if (cachedInsights) {
    console.log(`Cache hit for learning insights (user ${userProfile.id})`);
    return cachedInsights;
  }

  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    return "Learning insights require an internet connection to analyze your child's recent performance.";
  }

  const masteryData = userProfile.mastery || {};
  const recentPerformance = recentQuizResults.slice(-10); // Last 10 quiz results

  // Analyze patterns
  const subjectPerformance = {};
  recentPerformance.forEach(result => {
    if (!subjectPerformance[result.subject]) {
      subjectPerformance[result.subject] = { total: 0, correct: 0, quizzes: 0 };
    }
    subjectPerformance[result.subject].total += result.questions?.length || 0;
    subjectPerformance[result.subject].correct += result.correct || 0;
    subjectPerformance[result.subject].quizzes += 1;
  });

  const prompt = `
You are MiRa, providing data-driven learning insights and recommendations for parents of a ${studentAge}-year-old KS2 student.

STUDENT DATA:
- Name: ${studentName || userProfile.name}
- Age: ${studentAge}
- Current Mastery Levels: ${JSON.stringify(masteryData, null, 2)}

RECENT QUIZ PERFORMANCE (last ${recentPerformance.length} quizzes):
${Object.entries(subjectPerformance).map(([subject, data]: [string, any]) => 
  `${subject}: ${data.correct}/${data.total} correct (${((data.correct/data.total)*100).toFixed(1)}% across ${data.quizzes} quizzes)`
).join('\n')}

INDIVIDUAL QUIZ BREAKDOWN:
${recentPerformance.map((quiz, i) => 
  `Quiz ${i+1}: ${quiz.subject} - ${quiz.topic} - ${quiz.correct}/${quiz.questions?.length || 0} correct`
).join('\n')}

Provide actionable insights and recommendations covering:
1. Learning Patterns & Trends
2. Subject-Specific Recommendations
3. Study Strategies That Would Help
4. When to Seek Additional Support
5. Encouragement Strategies for Parents

GUIDELINES:
- Be specific and data-driven in your analysis
- Focus on actionable recommendations
- Use encouraging, supportive language
- Consider the child's age and developmental stage
- Suggest concrete next steps for parents

Format as clear, actionable insights with specific recommendations.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const insights = response.text.trim();
    setInCache(cacheKey, insights);
    return insights;
  } catch (error) {
    console.error("Error generating learning insights:", error);
    return `Based on ${userProfile.name}'s recent activity, here are some general insights:\n\n- Continue encouraging daily practice\n- Focus on building confidence in weaker subjects\n- Celebrate small victories and progress\n- Consider mixing up study methods to keep learning engaging`;
  }
};

// Generate subject connections showing how topics relate across subjects
export const generateSubjectConnections = async (
  currentSubject: string,
  currentTopic: string,
  studentAge: number,
  masteryData: any,
  studentName?: string
): Promise<string> => {
  const cacheKey = createCacheKey('subject-connections', currentSubject, currentTopic, studentAge.toString());
  const cachedConnections = getFromCache<string>(cacheKey);
  if (cachedConnections) {
    console.log(`Cache hit for subject connections: ${currentSubject} - ${currentTopic}`);
    return cachedConnections;
  }

  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    return "Subject connections require an internet connection to explore interdisciplinary links.";
  }

  const prompt = `
You are MiRa, helping ${studentName ? `${studentName}` : 'a student'}, a ${studentAge}-year-old, understand how "${currentTopic}" in ${currentSubject} connects to other subjects.

CURRENT FOCUS: ${currentSubject} - ${currentTopic}

STUDENT'S MASTERY IN OTHER SUBJECTS:
${Object.entries(masteryData).filter(([subject]) => subject !== currentSubject).map(([subject, topics]) => 
  `${subject}: ${Object.entries(topics).map(([topic, score]) => `${topic} (${score}%)`).join(', ')}`
).join('\n')}

Show how this topic connects to other subjects by explaining:
1. Real-world applications that combine multiple subjects
2. How skills from other subjects help with this topic
3. How mastering this topic helps with other subjects
4. Simple examples a ${studentAge}-year-old can understand
5. Suggested learning activities that combine subjects

GUIDELINES:
- Use simple, engaging language for a ${studentAge}-year-old
- Provide concrete, relatable examples
- Show practical connections, not just theoretical ones
- Keep explanations positive and encouraging
- Suggest 2-3 interdisciplinary activities

Make it fun and show how learning connects across different areas!`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const connections = response.text.trim();
    setInCache(cacheKey, connections);
    return connections;
  } catch (error) {
    console.error("Error generating subject connections:", error);
    return `Learning ${currentTopic} in ${currentSubject} helps you in many ways! For example, math skills help with science experiments, and reading helps you learn about history. Keep exploring - you'll see how everything connects!`;
  }
};

// Generate creative project suggestions based on current learning
export const generateProjectSuggestions = async (
  subject: string,
  topic: string,
  studentAge: number,
  masteryData: any,
  studentName?: string
): Promise<string> => {
  const cacheKey = createCacheKey('project-suggestions', subject, topic, studentAge.toString());
  const cachedSuggestions = getFromCache<string>(cacheKey);
  if (cachedSuggestions) {
    console.log(`Cache hit for project suggestions: ${subject} - ${topic}`);
    return cachedSuggestions;
  }

  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    return "Project suggestions need an internet connection to generate creative ideas.";
  }

  const prompt = `
You are MiRa, suggesting creative projects for ${studentName ? `${studentName}` : 'a student'}, a ${studentAge}-year-old who just learned about "${topic}" in ${subject}.

STUDENT PROFILE:
- Name: ${studentName || 'Learner'}
- Age: ${studentAge}
- Current topic: ${topic} (${subject})
- Other subjects they're learning: ${Object.keys(masteryData).join(', ')}

Suggest 3-4 creative projects that:
1. Apply what they learned in practical, fun ways
2. Combine with other subjects if possible
3. Are age-appropriate and achievable at home/school
4. Include step-by-step guidance
5. Connect to real-world applications

For each project, include:
- Project title
- What they'll learn/create
- Materials needed (simple, common items)
- Step-by-step instructions
- Why it's a great project for them

GUIDELINES:
- Keep projects simple and achievable
- Use household items where possible
- Make them engaging and fun
- Include safety considerations for hands-on activities
- Encourage creativity and personal expression

Format each project clearly with headings and bullet points.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const suggestions = response.text.trim();
    setInCache(cacheKey, suggestions);
    return suggestions;
  } catch (error) {
    console.error("Error generating project suggestions:", error);
    return `Here are some fun project ideas for ${topic}:\n\n1. **Create a Poster**: Draw or make a poster showing what you learned!\n2. **Teach Someone**: Explain the topic to a family member or friend\n3. **Make a Model**: Build something simple that shows the concept\n\nRemember, the best projects come from your own creativity!`;
  }
};

// Generate contextual hints during quizzes (without giving away answers)
export const generateQuizHint = async (
  question: string,
  options: string[],
  subject: string,
  topic: string,
  studentAge: number,
  studentName?: string
): Promise<string> => {
  // Don't cache hints as they should be contextual
  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    return "I'm offline right now, but try thinking about what you've learned in the lesson!";
  }

  const prompt = `
You are MiRa, providing a helpful hint for ${studentName ? `${studentName}` : 'a student'}, a ${studentAge}-year-old stuck on a quiz question.

QUESTION: "${question}"
OPTIONS: ${options.join(', ')}

SUBJECT CONTEXT: ${subject} - ${topic}

Provide a gentle hint that:
- Helps them think about the concept without giving the answer
- Reminds them of something from the lesson
- Uses simple, encouraging language
- Is just 1-2 sentences long

GUIDELINES:
- NEVER give away the correct answer
- Focus on helping them reason through it
- Be encouraging and supportive
- Keep it very brief

Example: "Remember what we learned about [concept]? Think about how [related idea] works."`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating quiz hint:", error);
    return "Take your time and think about what you learned in the lesson. You've got this!";
  }
};

// Generate additional practice problems for concept reinforcement
export const generateConceptReinforcement = async (
  subject: string,
  topic: string,
  difficulty: Difficulty,
  studentAge: number,
  weakAreas?: string[],
  studentName?: string
): Promise<string> => {
  const cacheKey = createCacheKey('concept-reinforcement', subject, topic, difficulty, studentAge.toString());
  const cachedReinforcement = getFromCache<string>(cacheKey);
  if (cachedReinforcement) {
    console.log(`Cache hit for concept reinforcement: ${subject} - ${topic}`);
    return cachedReinforcement;
  }

  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    return "Concept reinforcement exercises need an internet connection to generate personalized practice.";
  }

  const prompt = `
You are MiRa, creating concept reinforcement exercises for ${studentName ? `${studentName}` : 'a student'}, a ${studentAge}-year-old who needs extra practice with "${topic}" in ${subject}.

DIFFICULTY: ${difficulty}
WEAK AREAS TO FOCUS ON: ${weakAreas?.join(', ') || 'General practice needed'}

Create 3-5 additional practice exercises that:
1. Target the specific concepts they need help with
2. Are slightly easier than quiz level to build confidence
3. Include clear instructions and examples
4. Have space for the student to show their work
5. End with encouragement

For each exercise, provide:
- Clear instructions
- Any examples needed
- Space for answers (use ___ for blanks)
- Brief explanations of correct approaches

GUIDELINES:
- Keep exercises age-appropriate and achievable
- Focus on understanding, not just memorization
- Include positive reinforcement
- Make them varied and engaging
- Provide hints if exercises are challenging

Format as numbered exercises with clear instructions.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    const reinforcement = response.text.trim();
    setInCache(cacheKey, reinforcement);
    return reinforcement;
  } catch (error) {
    console.error("Error generating concept reinforcement:", error);
    return `Here are some extra practice ideas for ${topic}:\n\n1. Review your notes from the lesson\n2. Try explaining the concept to someone else\n3. Look for examples in everyday life\n4. Practice with similar problems you know how to solve\n\nRemember, practice makes perfect! Keep trying and you'll get better.`;
  }
};

// Generate artwork-specific quiz questions
export const generateArtworkQuiz = async (
  artworkData: {
    title: string;
    artist: string;
    year: string | number;
    style: string;
    medium: string;
    period: string;
    country: string;
    techniques: string[];
    colours: string[];
    funFacts: string[];
  },
  studentAge: number,
  difficulty: Difficulty = Difficulty.Medium
): Promise<QuizQuestion[]> => {
  const cacheKey = createCacheKey('artwork-quiz', artworkData.title, studentAge.toString(), difficulty);
  const cachedQuiz = getFromCache<QuizQuestion[]>(cacheKey);
  if (cachedQuiz) {
    console.log(`Cache hit for artwork quiz: ${artworkData.title}`);
    return cachedQuiz;
  }

  // Check if offline - provide fallback questions
  if (!offlineManager.checkOnlineStatus()) {
    return generateFallbackArtworkQuestions(artworkData);
  }

  const prompt = `You are MiRa, creating an engaging art quiz for a ${studentAge}-year-old about the famous artwork "${artworkData.title}" by ${artworkData.artist}.

ARTWORK DETAILS:
- Title: ${artworkData.title}
- Artist: ${artworkData.artist}
- Year: ${artworkData.year}
- Style: ${artworkData.style}
- Medium: ${artworkData.medium}
- Period: ${artworkData.period}
- Country: ${artworkData.country}
- Techniques: ${artworkData.techniques.join(', ')}
- Main Colours: ${artworkData.colours.join(', ')}
- Fun Facts: ${artworkData.funFacts.join(' | ')}

Create 6 quiz questions that test knowledge about this artwork:
- 2 questions about the artist and basic facts
- 2 questions about techniques and artistic elements
- 1 question about colours and visual elements
- 1 question that connects to a fun fact

DIFFICULTY: ${difficulty}

QUESTION REQUIREMENTS:
- Mix question types: multiple-choice, true-false
- Use the fun facts creatively
- Make questions interesting and engaging
- Include encouraging explanations
- Test observation skills ("What do you notice about...")

CRITICAL RULES:
- All content must be 100% appropriate for children aged ${studentAge}
- Use British English spelling
- Make it fun and educational!`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  questionType: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['quiz'],
        },
      },
    });
    
    const jsonResponse = JSON.parse(response.text);
    const quizQuestions = jsonResponse.quiz || [];
    
    // Normalize and add metadata
    const normalizedQuestions: QuizQuestion[] = quizQuestions.map((q: any, idx: number) => ({
      ...q,
      questionType: q.questionType?.includes('true') ? QType.TrueFalse : QType.MultipleChoice,
      cognitiveLevel: idx < 2 ? CLevel.Remember : idx < 4 ? CLevel.Understand : CLevel.Apply,
      options: q.questionType?.includes('true') ? ['True', 'False'] : q.options,
    }));
    
    setInCache(cacheKey, normalizedQuestions);
    return normalizedQuestions;
  } catch (error) {
    console.error("Error generating artwork quiz:", error);
    return generateFallbackArtworkQuestions(artworkData);
  }
};

// Fallback questions when offline or API fails
function generateFallbackArtworkQuestions(artworkData: any): QuizQuestion[] {
  return [
    {
      question: `Who painted "${artworkData.title}"?`,
      options: [artworkData.artist, 'Pablo Picasso', 'Claude Monet', 'Leonardo da Vinci'].sort(() => Math.random() - 0.5),
      correctAnswer: artworkData.artist,
      explanation: `That's right! ${artworkData.artist} painted this famous artwork.`,
      questionType: QType.MultipleChoice,
      cognitiveLevel: CLevel.Remember,
    },
    {
      question: `"${artworkData.title}" was created in the ${artworkData.period}.`,
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: `Correct! This artwork is from the ${artworkData.period}.`,
      questionType: QType.TrueFalse,
      cognitiveLevel: CLevel.Remember,
    },
    {
      question: `What style is "${artworkData.title}" painted in?`,
      options: [artworkData.style, 'Abstract Art', 'Cubism', 'Pop Art'].sort(() => Math.random() - 0.5),
      correctAnswer: artworkData.style,
      explanation: `Well done! This artwork is a great example of ${artworkData.style}.`,
      questionType: QType.MultipleChoice,
      cognitiveLevel: CLevel.Understand,
    },
    {
      question: `Which of these colours is a main colour in "${artworkData.title}"?`,
      options: [artworkData.colours[0], 'Neon Pink', 'Bright Orange', 'Lime Green'].sort(() => Math.random() - 0.5),
      correctAnswer: artworkData.colours[0],
      explanation: `Great observation! ${artworkData.colours[0]} is one of the main colours used.`,
      questionType: QType.MultipleChoice,
      cognitiveLevel: CLevel.Understand,
    },
  ];
}
