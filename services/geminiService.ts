import { GoogleGenAI, Type } from "@google/genai";
import { db, collection, getDocs, addDoc, query, where, limit } from './firebase';
import type { QuizQuestion, Difficulty, QuizResult, Explanation } from '../types';
import { createCacheKey, getFromCache, setInCache } from './cacheService';
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

const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY as string });

const model = 'gemini-2.5-flash';

export const getTopicsForSubject = async (subject: string, studentAge: number): Promise<string[]> => {
  const cacheKey = createCacheKey('topics', subject, studentAge.toString());
  const cachedTopics = getFromCache<string[]>(cacheKey);
  if (cachedTopics) {
    console.log(`Cache hit for topics: ${subject} (age ${studentAge})`);
    return cachedTopics;
  }

  // Check if offline
  if (!offlineManager.checkOnlineStatus()) {
    console.warn('Offline: No cached topics available');
    return [];
  }

  let contents = '';
  const subjectLower = subject.toLowerCase();

  if (subjectLower === 'computing' || subjectLower === 'coding') {
    contents = `List 30 key topics for an introduction to Computing for a ${studentAge}-year-old UK Key Stage 2 student. Focus on foundational concepts using block-based coding (like Scratch), an introduction to Python (e.g., variables, loops, simple commands), and digital literacy (e.g., internet safety, how the internet works). Ensure topics are aligned with the UK Department for Education (DfE) computing curriculum.

IMPORTANT: Content must be appropriate for children aged ${studentAge}. Use simple, encouraging language. Avoid any complex, scary, or inappropriate topics.`;
  } else if (subjectLower === 'languages') {
    contents = `List 30 key language learning topics for a ${studentAge}-year-old UK Key Stage 2 student. 
    
    You MUST include topics for ALL of these languages: French, Spanish, German, Japanese, Mandarin, Romanian, and Yoruba.
    
    Format the topics clearly as "[Language]: [Topic]", for example:
    - "French: Greetings"
    - "Spanish: Numbers"
    - "German: Colors"
    - "Japanese: Introduction"
    - "Mandarin: Family"
    - "Yoruba: Common Phrases"
    - "Romanian: Food"
    
    Focus on vocabulary and basic conversation. Ensure topics are aligned with the UK DfE curriculum standards where applicable, or beginner levels for the other languages.

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
    const response = await ai.models.generateContent({
      model,
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
    });

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
    return topics;
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

export const generateLesson = async (subject: string, topic: string, difficulty: Difficulty, studentAge: number): Promise<string> => {
  const cacheKey = createCacheKey('lesson', subject, topic, difficulty, studentAge.toString());
  const cachedLesson = getFromCache<string>(cacheKey);
  if (cachedLesson) {
    console.log(`Cache hit for lesson: ${subject} - ${topic} (${difficulty}, age ${studentAge})`);
    return cachedLesson;
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
    const response = await ai.models.generateContent({
      model,
      contents,
    });
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
    return validation.sanitizedContent || lessonText;
  } catch (error) {
    console.error("Error generating lesson:", error);
    return "Oops! I couldn't prepare the lesson. Please try again.";
  }
};

export const generateQuiz = async (subject: string, topic: string, difficulty: Difficulty, studentAge: number): Promise<QuizQuestion[]> => {
  const usedQuestionIds = getUsedQuestions(subject, topic, studentAge, difficulty);
  let finalQuestions: QuizQuestion[] = [];

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
            where("difficulty", "==", difficulty),
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
                    explanation: data.explanation
                });
            }
        });

        const availableFirebaseQuestions = firebaseQuestions.filter(q => !usedQuestionIds.includes(q.id));
        
        if (availableFirebaseQuestions.length > 0) {
             console.log(`Found ${availableFirebaseQuestions.length} questions in Firebase`);
             finalQuestions = [...availableFirebaseQuestions];
        }
    }
  } catch (error) {
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

      let bankQuestions = getRandomQuestions(bankSubject, bankTopic, studentAge, difficulty, neededFromBank, usedQuestionIds);
      
      // If strict match failed for language, try to find any questions for this language
      if (isLanguage && bankQuestions.length === 0) {
          // Fetch ALL questions for "Languages" subject
          const allLanguageQuestions = getRandomQuestions(bankSubject, "", studentAge, difficulty, 50, usedQuestionIds);
          
          // Filter for the specific language (e.g. "French")
          // The bank topics are like "French: Greetings", so we check if topic starts with "French"
          const languagePrefix = subject + ":";
          const specificLanguageQuestions = allLanguageQuestions.filter(q => 
              q.topic.startsWith(languagePrefix) || q.topic.includes(subject)
          );
          
          if (specificLanguageQuestions.length > 0) {
              console.log(`Found ${specificLanguageQuestions.length} general ${subject} questions in bank`);
              // Shuffle and take what we need
              const shuffled = specificLanguageQuestions.sort(() => Math.random() - 0.5);
              bankQuestions = shuffled.slice(0, neededFromBank);
          }
      }

      finalQuestions = [...finalQuestions, ...bankQuestions];
  }
  
  // Fallback: If no questions found for specific topic, try finding questions for the subject generally
  if (finalQuestions.length === 0) {
    console.log(`No exact match for topic "${topic}", searching for general ${subject} questions...`);
    
    let fallbackSubject = subject;
    // For languages, we don't want to mix languages, so we skip general fallback 
    // unless we can filter by language. Since getRandomQuestions is strict, 
    // we skip general fallback for languages to avoid showing Spanish questions in French quiz.
    const subjectLower = subject.toLowerCase();
    const isLanguage = ['french', 'spanish', 'german', 'japanese', 'mandarin', 'romanian', 'yoruba'].includes(subjectLower);

    if (!isLanguage) {
        const allSubjectQuestions = getRandomQuestions(fallbackSubject, "", studentAge, difficulty, 10, usedQuestionIds);
        if (allSubjectQuestions.length > 0) {
            finalQuestions = allSubjectQuestions;
        }
    }
  }
  
  if (finalQuestions.length >= 10) {
    // We have enough unique questions!
    console.log(`Using ${finalQuestions.length} questions (Firebase + Bank)`);
    // Shuffle them
    finalQuestions = finalQuestions.sort(() => Math.random() - 0.5).slice(0, 10);

    const questionIds = finalQuestions.map(q => q.id);
    markQuestionsAsUsed(subject, topic, studentAge, difficulty, questionIds);
    
    const cacheKey = createCacheKey('quiz', subject, topic, difficulty, studentAge.toString());
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
    resetUsedQuestions(subject, topic, studentAge, difficulty);
    // Recursive call to try again with fresh tracker? 
    // Or just proceed to AI. Let's proceed to AI to generate fresh content.
  }

  // STEP 3: Fallback to cache if we have it
  // ... existing cache logic ...
  const cacheKey = createCacheKey('quiz', subject, topic, difficulty, studentAge.toString());
  const cachedData = getFromCache<{ questions: QuizQuestion[], timestamp: number, source: string }>(cacheKey);
  if (cachedData && cachedData.questions && cachedData.questions.length >= 10) {
    console.log(`Using cached ${cachedData.source || 'AI'}-generated quiz: ${subject} - ${topic} (${difficulty}, age ${studentAge})`);
    return cachedData.questions;
  }
  
  // Legacy cache format support (for backward compatibility)
  const legacyCachedQuiz = getFromCache<QuizQuestion[]>(cacheKey);
  if (legacyCachedQuiz && Array.isArray(legacyCachedQuiz) && legacyCachedQuiz.length >= 10) {
    console.log(`Using legacy cached quiz: ${subject} - ${topic} (${difficulty}, age ${studentAge})`);
    return legacyCachedQuiz;
  }

  // STEP 3: Generate new questions with AI (and cache them for later)
  console.log(`Generating new questions with AI for: ${subject} - ${topic} (${difficulty})`);
  
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

  // Add subject-specific guidance for better questions
  const subjectGuidance: Record<string, string> = {
    maths: `
      - Include a MIX of question types: calculations, word problems, shape recognition, pattern finding
      - For word problems, use real-life scenarios (shopping, cooking, sports)
      - Include visual descriptions when helpful ("Imagine a rectangle with...")
      - Test both procedural knowledge AND conceptual understanding
    `,
    science: `
      - Mix factual recall with application questions
      - Include "What would happen if..." prediction questions
      - Reference real experiments and observations children might do
      - Connect to everyday phenomena (why does ice melt, how do plants grow)
    `,
    english: `
      - Mix grammar, vocabulary, comprehension, and creative elements
      - Use interesting sentence examples from stories or real life
      - Include questions about word meanings in context
      - Test punctuation with purpose (how it changes meaning)
    `,
    history: `
      - Focus on cause and effect, not just dates
      - Include "Why did..." and "What happened because..." questions
      - Connect historical events to daily life back then
      - Make it relatable to children's experience
    `,
    geography: `
      - Include map-reading skills and real locations
      - Ask about human and physical geography
      - Connect to environmental awareness and current events
      - Include "Where in the world..." exploration questions
    `,
  };

  const subjectSpecificTips = subjectGuidance[subjectLower] || '';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `You are MiRa, a creative AI tutor designing an ENGAGING 10-question multiple-choice quiz for a UK Key Stage 2 student (age ${studentAge}) on '${topic}' in '${subject}'.

QUIZ QUALITY REQUIREMENTS:
1. VARIETY: Mix different question types (factual recall, application, reasoning, "what if" scenarios)
2. ENGAGEMENT: Make questions interesting with real-world connections and fun scenarios
3. DIFFICULTY: ${difficulty} level - ${difficulty === 'Easy' ? 'build confidence with clear, achievable questions' : difficulty === 'Medium' ? 'challenge without frustrating, include some thinking questions' : 'push their knowledge with multi-step thinking'}
4. UNIQUENESS: Avoid typical textbook phrasing - make questions feel fresh and creative

QUESTION DESIGN TIPS:
- Start questions in varied ways ("Which...", "What happens when...", "Why do you think...", "If you were...", "Imagine...")
- Use child-friendly scenarios (games, food, animals, family activities)
- Include one "fun fact" style question that teaches something surprising
- Make wrong answers PLAUSIBLE but distinguishable (avoid obviously silly options)

${specificQuizInstructions}
${subjectSpecificTips}

CRITICAL RULES:
- All content must be 100% appropriate for children aged ${studentAge}
- Every answer option must be SPECIFIC and RELATED to the topic (NO generic placeholders!)
- Include a brief, encouraging explanation for each answer
- Align with UK National Curriculum / DfE expectations for KS2

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
                  explanation: { type: Type.STRING }, // Request explanation from AI
                },
                required: ['question', 'options', 'correctAnswer'],
              },
            },
          },
          required: ['quiz'],
        },
      },
    });
    
    const jsonResponse = JSON.parse(response.text);
    const quizQuestions = jsonResponse.quiz || [];
    
    // Validate each quiz question
    const validQuestions = quizQuestions.filter((question: QuizQuestion) => {
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
    
    // Shuffle options for AI-generated questions to randomize answer positions
    const shuffledAIQuestions = validQuestions.map(question => ({
      ...question,
      options: [...question.options].sort(() => Math.random() - 0.5)
    }));
    
    // Combine bank questions with AI-generated questions if needed
    let combinedQuestions = [...finalQuestions, ...shuffledAIQuestions];
    
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
    console.log(`Generated ${validQuestions.length} new AI questions, combined with ${finalQuestions.length} existing questions`);

    // SAVE TO FIREBASE (The "Cloud Bank")
    // We process sequentially to check for duplicates
    // Note: This requires appropriate Firestore permissions
    for (const q of validQuestions) {
        try {
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
                    difficulty,
                    age: studentAge,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation || "",
                    createdAt: new Date()
                });
                console.log("Saved new unique question to Cloud Bank");
            } else {
                console.log("Skipped saving duplicate question to Cloud Bank");
            }
        } catch (e) {
            // Firebase write permissions may not be configured for public access
            // App continues to work with local cache and AI-generated content
            if (process.env.NODE_ENV === 'development') {
                console.debug("Firebase save skipped (permissions or network issue):", (e as Error).message);
            }
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
    return [];
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
  context?: { subject?: string; topic?: string }
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
  const avgScore = Object.values(topics).reduce((a: number, b: number) => a + b, 0) / Object.values(topics).length;
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