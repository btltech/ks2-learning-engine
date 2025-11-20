// Track used questions to prevent repetitions during the session

const STORAGE_KEY = 'ks2_used_questions';

interface UsedQuestionsData {
  [sessionKey: string]: string[]; // sessionKey format: "subject-topic-age-difficulty"
}

// Get all used question IDs for a specific session context
export const getUsedQuestions = (
  subject: string,
  topic: string,
  age: number,
  difficulty: string
): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data: UsedQuestionsData = JSON.parse(stored);
    const sessionKey = `${subject}-${topic}-${age}-${difficulty}`;
    
    return data[sessionKey] || [];
  } catch (error) {
    console.error('Error getting used questions:', error);
    return [];
  }
};

// Mark questions as used
export const markQuestionsAsUsed = (
  subject: string,
  topic: string,
  age: number,
  difficulty: string,
  questionIds: string[]
): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data: UsedQuestionsData = stored ? JSON.parse(stored) : {};
    
    const sessionKey = `${subject}-${topic}-${age}-${difficulty}`;
    
    // Append new question IDs to existing ones (maintaining uniqueness)
    const existingIds = data[sessionKey] || [];
    const uniqueIds = [...new Set([...existingIds, ...questionIds])];
    
    data[sessionKey] = uniqueIds;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error marking questions as used:', error);
  }
};

// Reset used questions for a specific context (e.g., when all questions exhausted)
export const resetUsedQuestions = (
  subject: string,
  topic: string,
  age: number,
  difficulty: string
): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: UsedQuestionsData = JSON.parse(stored);
    const sessionKey = `${subject}-${topic}-${age}-${difficulty}`;
    
    delete data[sessionKey];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error resetting used questions:', error);
  }
};

// Clear all tracked questions (useful for starting fresh)
export const clearAllUsedQuestions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing used questions:', error);
  }
};

// Get statistics about used questions
export const getUsageStats = (
  subject: string,
  topic: string,
  age: number,
  difficulty: string
): { used: number; available: number } => {
  try {
    const usedIds = getUsedQuestions(subject, topic, age, difficulty);
    
    // Import question bank to count available questions
    // Note: This is a simplified count - actual implementation would check the question bank
    return {
      used: usedIds.length,
      available: 0 // Will be calculated when integrated with question bank
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return { used: 0, available: 0 };
  }
};
