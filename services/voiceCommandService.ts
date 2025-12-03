/**
 * Voice Command Service
 * 
 * Handles speech recognition and voice command parsing for MiRa
 */

export interface VoiceCommand {
  type: 'quiz' | 'explain' | 'help' | 'navigate' | 'chat' | 'battle' | 'unknown';
  subject?: string;
  topic?: string;
  difficulty?: string;
  rawText: string;
  confidence: number;
}

// Subject keywords for recognition
const SUBJECT_KEYWORDS: { [key: string]: string } = {
  'maths': 'Maths',
  'math': 'Maths',
  'mathematics': 'Maths',
  'english': 'English',
  'reading': 'English',
  'writing': 'English',
  'science': 'Science',
  'biology': 'Science',
  'physics': 'Science',
  'chemistry': 'Science',
  'history': 'History',
  'geography': 'Geography',
  'french': 'French',
  'spanish': 'Spanish',
  'german': 'German',
  'music': 'Music',
  'art': 'Art',
  'computing': 'Computing',
  'coding': 'Computing',
  'programming': 'Computing',
};

// Topic keywords
const TOPIC_KEYWORDS: { [key: string]: string[] } = {
  'Maths': ['fractions', 'decimals', 'percentages', 'addition', 'subtraction', 'multiplication', 'division', 'algebra', 'geometry', 'shapes', 'angles', 'area', 'perimeter', 'volume', 'time', 'money', 'graphs', 'statistics', 'probability'],
  'English': ['grammar', 'spelling', 'punctuation', 'reading', 'writing', 'comprehension', 'vocabulary', 'poetry', 'stories', 'fiction', 'non-fiction'],
  'Science': ['plants', 'animals', 'human body', 'materials', 'forces', 'electricity', 'light', 'sound', 'earth', 'space', 'living things', 'habitats', 'evolution'],
};

// Command patterns
const COMMAND_PATTERNS = {
  quiz: /(?:quiz|test|practice|challenge)\s*(?:me\s*)?(?:on|about|in)?\s*/i,
  explain: /(?:explain|tell me about|what is|what are|how does|why|teach me)\s*/i,
  help: /(?:help|assist|i need help|i'm stuck|confused)/i,
  navigate: /(?:go to|open|show|take me to)\s*/i,
  battle: /(?:battle|fight|compete|versus|vs|challenge someone)/i,
};

class VoiceCommandService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResultCallback: ((command: VoiceCommand) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStatusCallback: ((status: 'listening' | 'stopped' | 'processing') => void) | null = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('[VoiceCommand] Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-GB';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log('[VoiceCommand] Heard:', transcript, 'Confidence:', confidence);
      
      const command = this.parseCommand(transcript, confidence);
      this.onResultCallback?.(command);
      this.onStatusCallback?.('stopped');
    };

    this.recognition.onerror = (event) => {
      console.error('[VoiceCommand] Error:', event.error);
      this.onErrorCallback?.(event.error);
      this.onStatusCallback?.('stopped');
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStatusCallback?.('stopped');
    };
  }

  /**
   * Parse spoken text into a structured command
   */
  parseCommand(text: string, confidence: number): VoiceCommand {
    const lowerText = text.toLowerCase().trim();
    
    // Detect command type
    let type: VoiceCommand['type'] = 'chat';
    
    if (COMMAND_PATTERNS.quiz.test(lowerText)) {
      type = 'quiz';
    } else if (COMMAND_PATTERNS.explain.test(lowerText)) {
      type = 'explain';
    } else if (COMMAND_PATTERNS.help.test(lowerText)) {
      type = 'help';
    } else if (COMMAND_PATTERNS.navigate.test(lowerText)) {
      type = 'navigate';
    } else if (COMMAND_PATTERNS.battle.test(lowerText)) {
      type = 'battle';
    }

    // Extract subject
    let subject: string | undefined;
    for (const [keyword, subjectName] of Object.entries(SUBJECT_KEYWORDS)) {
      if (lowerText.includes(keyword)) {
        subject = subjectName;
        break;
      }
    }

    // Extract topic
    let topic: string | undefined;
    if (subject && TOPIC_KEYWORDS[subject]) {
      for (const topicKeyword of TOPIC_KEYWORDS[subject]) {
        if (lowerText.includes(topicKeyword.toLowerCase())) {
          topic = topicKeyword;
          break;
        }
      }
    }

    // Extract difficulty
    let difficulty: string | undefined;
    if (lowerText.includes('easy') || lowerText.includes('simple')) {
      difficulty = 'Easy';
    } else if (lowerText.includes('hard') || lowerText.includes('difficult') || lowerText.includes('challenging')) {
      difficulty = 'Hard';
    } else if (lowerText.includes('medium') || lowerText.includes('normal')) {
      difficulty = 'Medium';
    }

    return {
      type,
      subject,
      topic,
      difficulty,
      rawText: text,
      confidence,
    };
  }

  /**
   * Start listening for voice commands
   */
  startListening(): boolean {
    if (!this.recognition) {
      this.onErrorCallback?.('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      this.onStatusCallback?.('listening');
      return true;
    } catch (error) {
      console.error('[VoiceCommand] Failed to start:', error);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Get current listening status
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Set callback for command results
   */
  onResult(callback: (command: VoiceCommand) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for status changes
   */
  onStatus(callback: (status: 'listening' | 'stopped' | 'processing') => void): void {
    this.onStatusCallback = callback;
  }

  /**
   * Generate a response message based on the command
   */
  getCommandResponse(command: VoiceCommand): string {
    switch (command.type) {
      case 'quiz':
        if (command.subject && command.topic) {
          return `Starting a ${command.difficulty || 'medium'} quiz on ${command.topic} in ${command.subject}!`;
        } else if (command.subject) {
          return `Let's do a ${command.subject} quiz! What topic would you like?`;
        }
        return "Sure! What subject would you like to be quizzed on?";

      case 'explain':
        if (command.subject && command.topic) {
          return `Let me explain ${command.topic} in ${command.subject} for you...`;
        }
        return "What would you like me to explain?";

      case 'help':
        return "I'm here to help! You can ask me to:\n• Quiz you on any subject\n• Explain topics\n• Start a battle with friends\n• Or just chat!";

      case 'navigate':
        return `Taking you to ${command.subject || 'the requested page'}...`;

      case 'battle':
        return "Let's battle! Opening Quiz Battle mode...";

      default:
        return command.rawText;
    }
  }
}

export const voiceCommandService = new VoiceCommandService();
