/**
 * Voice Navigation Service
 * Provides voice commands and text-to-speech navigation
 */

interface VoiceCommand {
  phrases: string[];
  action: () => void;
  description: string;
}

class VoiceNavigationService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private commands: Map<string, VoiceCommand> = new Map();
  private onCommandCallback: ((command: string) => void) | null = null;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    this.registerDefaultCommands();
  }

  /**
   * Initialize Web Speech API for recognition
   */
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-GB';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('[Voice] Heard:', transcript);
        this.processCommand(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('[Voice] Recognition error:', event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      console.warn('[Voice] Speech recognition not supported');
    }
  }

  /**
   * Initialize Text-to-Speech synthesis
   */
  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.warn('[Voice] Speech synthesis not supported');
    }
  }

  /**
   * Register default navigation commands
   */
  private registerDefaultCommands(): void {
    this.registerCommand({
      phrases: ['go home', 'home', 'homepage'],
      action: () => window.location.href = '/',
      description: 'Navigate to home page',
    });

    this.registerCommand({
      phrases: ['start quiz', 'begin quiz', 'take quiz'],
      action: () => window.location.href = '/quiz',
      description: 'Start a new quiz',
    });

    this.registerCommand({
      phrases: ['show leaderboard', 'leaderboard', 'rankings'],
      action: () => window.location.href = '/leaderboard',
      description: 'View leaderboard',
    });

    this.registerCommand({
      phrases: ['my progress', 'show progress', 'progress'],
      action: () => window.location.href = '/progress',
      description: 'View your progress',
    });

    this.registerCommand({
      phrases: ['battle', 'quiz battle', 'start battle'],
      action: () => window.location.href = '/battle',
      description: 'Start a quiz battle',
    });

    this.registerCommand({
      phrases: ['help', 'show help', 'what can you do'],
      action: () => this.showHelpDialog(),
      description: 'Show voice commands help',
    });
  }

  /**
   * Register a new voice command
   */
  registerCommand(command: VoiceCommand): void {
    command.phrases.forEach((phrase) => {
      this.commands.set(phrase.toLowerCase(), command);
    });
  }

  /**
   * Start listening for voice commands
   */
  startListening(): void {
    if (!this.recognition) {
      this.speak('Voice commands are not supported on this device.');
      return;
    }

    if (this.isListening) return;

    try {
      this.recognition.start();
      this.isListening = true;
      this.speak('Listening...');
    } catch (error) {
      console.error('[Voice] Failed to start listening:', error);
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
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Process voice command
   */
  private processCommand(transcript: string): void {
    let commandFound = false;

    for (const [phrase, command] of this.commands.entries()) {
      if (transcript.includes(phrase)) {
        console.log('[Voice] Executing command:', phrase);
        this.speak(`Okay, ${phrase}`);
        command.action();
        commandFound = true;
        
        if (this.onCommandCallback) {
          this.onCommandCallback(phrase);
        }
        break;
      }
    }

    if (!commandFound) {
      this.speak("Sorry, I didn't understand that command. Say 'help' for available commands.");
    }
  }

  /**
   * Speak text using TTS
   */
  speak(text: string, rate: number = 1.0): void {
    if (!this.synthesis) {
      console.warn('[Voice] Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synthesis.speak(utterance);
  }

  /**
   * Read question aloud
   */
  readQuestion(question: string): void {
    this.speak(question, 0.9);
  }

  /**
   * Read answer options
   */
  readOptions(options: string[]): void {
    const text = `The options are: ${options.join(', or, ')}`;
    this.speak(text, 0.9);
  }

  /**
   * Provide feedback
   */
  provideFeedback(isCorrect: boolean, correctAnswer?: string): void {
    if (isCorrect) {
      const praise = [
        'Well done!',
        'Excellent!',
        'Great job!',
        'Perfect!',
        'You got it!',
      ];
      this.speak(praise[Math.floor(Math.random() * praise.length)]);
    } else {
      this.speak(`Not quite. The correct answer was ${correctAnswer}`);
    }
  }

  /**
   * Show help dialog
   */
  private showHelpDialog(): void {
    const commands = Array.from(this.commands.values())
      .map((cmd) => cmd.description)
      .join('. ');
    
    this.speak(`Available commands: ${commands}`);
  }

  /**
   * Set callback for when commands are recognized
   */
  onCommand(callback: (command: string) => void): void {
    this.onCommandCallback = callback;
  }

  /**
   * Check if voice navigation is supported
   */
  isSupported(): boolean {
    return this.recognition !== null && this.synthesis !== null;
  }

  /**
   * Get all available commands
   */
  getCommands(): VoiceCommand[] {
    return Array.from(new Set(this.commands.values()));
  }
}

// Export singleton
export const voiceNavigationService = new VoiceNavigationService();
