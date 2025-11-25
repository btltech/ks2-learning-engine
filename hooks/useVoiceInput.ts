/**
 * Voice Input Hook
 * 
 * Uses Web Speech API for voice recognition
 * Supports answer input and navigation commands
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export interface VoiceInputConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onCommand?: (command: string) => void;
}

export interface VoiceInputResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Supported voice commands for navigation
const VOICE_COMMANDS = {
  // Navigation
  next: ['next', 'next question', 'continue', 'go on', 'skip'],
  previous: ['previous', 'back', 'go back', 'last question'],
  submit: ['submit', 'done', 'finish', 'complete'],
  hint: ['hint', 'help', 'give me a hint', 'need help'],
  
  // Answer selection (for multiple choice)
  selectA: ['a', 'option a', 'answer a', 'first option', 'first'],
  selectB: ['b', 'option b', 'answer b', 'second option', 'second'],
  selectC: ['c', 'option c', 'answer c', 'third option', 'third'],
  selectD: ['d', 'option d', 'answer d', 'fourth option', 'fourth'],
  
  // Quiz control
  pause: ['pause', 'wait', 'hold on', 'stop'],
  resume: ['resume', 'continue', 'go'],
  repeat: ['repeat', 'say again', 'read again'],
};

export const useVoiceInput = (config: VoiceInputConfig = {}): UseVoiceInputReturn => {
  const {
    language = 'en-GB', // British English for UK curriculum
    continuous = false,
    interimResults = true,
    onCommand,
  } = config;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setError(getErrorMessage(event.error));
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimText += text;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        
        // Check for voice commands
        if (onCommand) {
          const command = detectCommand(finalTranscript.toLowerCase().trim());
          if (command) {
            onCommand(command);
          }
        }
      }

      setInterimTranscript(interimText);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, onCommand]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Recognition might already be started
      console.error('Failed to start recognition:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

// Detect voice commands from transcript
function detectCommand(text: string): string | null {
  for (const [command, phrases] of Object.entries(VOICE_COMMANDS)) {
    for (const phrase of phrases) {
      if (text.includes(phrase)) {
        return command;
      }
    }
  }
  return null;
}

// Convert error codes to user-friendly messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your microphone.';
    case 'not-allowed':
      return 'Microphone access denied. Please allow microphone access.';
    case 'network':
      return 'Network error. Please check your connection.';
    case 'aborted':
      return 'Speech recognition was stopped.';
    case 'language-not-supported':
      return 'Language not supported.';
    default:
      return 'An error occurred. Please try again.';
  }
}

// Number words to digits conversion (for answer input)
const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4,
  five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};

/**
 * Parse number from voice input
 * Handles both spoken numbers ("three") and digits ("3")
 */
export function parseNumberFromVoice(text: string): number | null {
  const cleaned = text.toLowerCase().trim();
  
  // Try direct number
  const num = parseInt(cleaned, 10);
  if (!isNaN(num)) {
    return num;
  }
  
  // Try number word
  if (NUMBER_WORDS[cleaned] !== undefined) {
    return NUMBER_WORDS[cleaned];
  }
  
  // Try to find a number in the text
  const words = cleaned.split(' ');
  for (const word of words) {
    if (NUMBER_WORDS[word] !== undefined) {
      return NUMBER_WORDS[word];
    }
    const parsed = parseInt(word, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return null;
}

/**
 * Check if text is likely an answer
 * Returns the answer option (A, B, C, D) or null
 */
export function parseAnswerOption(text: string): 'A' | 'B' | 'C' | 'D' | null {
  const cleaned = text.toLowerCase().trim();
  
  const aPatterns = ['a', 'option a', 'answer a', 'first', 'first one'];
  const bPatterns = ['b', 'option b', 'answer b', 'second', 'second one'];
  const cPatterns = ['c', 'option c', 'answer c', 'third', 'third one'];
  const dPatterns = ['d', 'option d', 'answer d', 'fourth', 'fourth one'];
  
  if (aPatterns.some(p => cleaned.includes(p))) return 'A';
  if (bPatterns.some(p => cleaned.includes(p))) return 'B';
  if (cPatterns.some(p => cleaned.includes(p))) return 'C';
  if (dPatterns.some(p => cleaned.includes(p))) return 'D';
  
  // Single letter check
  if (cleaned === 'a' || cleaned === 'ay') return 'A';
  if (cleaned === 'b' || cleaned === 'be' || cleaned === 'bee') return 'B';
  if (cleaned === 'c' || cleaned === 'see' || cleaned === 'sea') return 'C';
  if (cleaned === 'd' || cleaned === 'de' || cleaned === 'dee') return 'D';
  
  return null;
}

export type VoiceCommand = keyof typeof VOICE_COMMANDS;
export { VOICE_COMMANDS };
