import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { gameService, GameHighScore } from '../services/gameService';
import { QuizQuestion } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface MiniGamesProps {
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
  onGameStarted?: () => void;
}

type GameType = 'number_ninja' | 'times_table_sprint' | 'spelling_bee' | 'science_sorter' | 'history_match';

interface GameState {
  score: number;
  level: number;
  lives: number;
  streak: number;
  isPlaying: boolean;
  gameOver: boolean;
}

const MiniGames: React.FC<MiniGamesProps> = ({ onClose, onXpEarned, onGameStarted }) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadScores = async () => {
      const scores = await gameService.getUserHighScores();
      setHighScores(scores);
    };
    loadScores();
  }, []);

  const games = [
    {
      id: 'number_ninja' as GameType,
      name: 'Number Ninja',
      icon: '🥷',
      subject: 'Maths',
      description: 'Solve maths problems fast before time runs out!',
      color: 'from-red-500 to-orange-600',
    },
    {
      id: 'times_table_sprint' as GameType,
      name: 'Times Table Sprint',
      icon: '⚡',
      subject: 'Maths',
      description: 'Race through 20 multiplication questions as fast as you can!',
      color: 'from-violet-500 to-purple-700',
    },
    {
      id: 'spelling_bee' as GameType,
      name: 'Spelling Bee',
      icon: '🐝',
      subject: 'English',
      description: 'Hear the word spoken aloud and spell it correctly!',
      color: 'from-yellow-500 to-amber-600',
    },
    {
      id: 'science_sorter' as GameType,
      name: 'Science Sorter',
      icon: '🔬',
      subject: 'Science',
      description: 'Sort animals, materials and more into the right categories!',
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'history_match' as GameType,
      name: 'History Match',
      icon: '🏛️',
      subject: 'History',
      description: 'Match historical events with their dates!',
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  const handleGameExit = async (gameId: string, score: number) => {
    if (score > (highScores[gameId] || 0)) {
      await gameService.saveHighScore(gameId, score);
      setHighScores(prev => ({ ...prev, [gameId]: score }));
      soundEffects.playWin();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setSelectedGame(null);
  };

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto">
        <div className="min-h-screen p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedGame(null)}
              className="text-white/70 hover:text-white mb-6 flex items-center gap-2 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back to Games</span>
            </button>

            {selectedGame === 'number_ninja' && (
              <NumberNinjaGame 
                onExit={(score) => handleGameExit('number_ninja', score)} 
                onXpEarned={onXpEarned}
              />
            )}
            {selectedGame === 'times_table_sprint' && (
              <TimesTableSprintGame
                onExit={(score) => handleGameExit('times_table_sprint', score)}
                onXpEarned={onXpEarned}
              />
            )}
            {selectedGame === 'spelling_bee' && (
              <SpellingBeeGame 
                onExit={(score) => handleGameExit('spelling_bee', score)} 
                onXpEarned={onXpEarned}
              />
            )}
            {selectedGame === 'science_sorter' && (
              <ScienceSorterGame
                onExit={(score) => handleGameExit('science_sorter', score)}
                onXpEarned={onXpEarned}
              />
            )}
            {selectedGame === 'history_match' && (
              <HistoryMatchGame 
                onExit={(score) => handleGameExit('history_match', score)} 
                onXpEarned={onXpEarned}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto">
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back to Home</span>
            </button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">🎮 Mini Games</h1>
            <p className="text-white/60">Learn while having fun!</p>
          </div>

          {/* Games Grid */}
          <div className="grid gap-4">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => {
                onGameStarted?.();
                setSelectedGame(game.id);
              }}
              className={`bg-gradient-to-r ${game.color} rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-2xl transition-all relative overflow-hidden`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <span className="text-5xl">{game.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <p className="text-white/80 text-sm">{game.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                      {game.subject}
                    </span>
                    {highScores[game.id] !== undefined && (
                      <span className="text-yellow-300 text-xs font-bold">
                        🏆 High Score: {highScores[game.id]}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-3xl text-white/50">→</span>
              </div>
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Number Ninja Game
const NumberNinjaGame: React.FC<{ onExit: (score: number) => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0, level: 1, lives: 3, streak: 0, isPlaying: false, gameOver: false,
  });
  const [problem, setProblem] = useState({ question: '', answer: 0, options: [0] });
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateProblem = useCallback((level: number) => {
    const operations = level < 5 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a: number, b: number, answer: number;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * (10 * level)) + 1;
        b = Math.floor(Math.random() * (10 * level)) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * (10 * level)) + 10;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
      case '÷': {
        // Always produce a clean division
        b = Math.floor(Math.random() * 11) + 2; // divisor 2–12
        answer = Math.floor(Math.random() * 12) + 1; // quotient 1–12
        a = b * answer;
        break;
      }
      default:
        a = 5; b = 5; answer = 10;
    }

    const options = [answer];
    while (options.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 20) - 10;
      if (wrong !== answer && wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }

    setProblem({
      question: `${a} ${op} ${b} = ?`,
      answer,
      options: options.sort(() => Math.random() - 0.5),
    });
    setTimeLeft(Math.max(5, 10 - level));
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      generateProblem(gameState.level);
    }
  }, [gameState.isPlaying, gameState.level, generateProblem, gameState.gameOver]);

  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.gameOver, problem]);

  const handleAnswer = (selected: number) => {
    if (feedback) return;
    soundEffects.playClick();

    const isCorrect = selected === problem.answer;
    if (isCorrect) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playWrong();
    }
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      
      if (isCorrect) {
        const newStreak = gameState.streak + 1;
        const points = 10 + (timeLeft * 2) + (newStreak >= 3 ? 5 : 0);
        const newScore = gameState.score + points;
        const newLevel = Math.floor(newScore / 50) + 1;

        setGameState(prev => ({
          ...prev,
          score: newScore,
          streak: newStreak,
          level: Math.min(newLevel, 10),
        }));
        generateProblem(newLevel);
      } else {
        const newLives = gameState.lives - 1;
        if (newLives <= 0) {
          setGameState(prev => ({ ...prev, lives: 0, gameOver: true }));
          onXpEarned?.(Math.floor(gameState.score / 2));
        } else {
          setGameState(prev => ({ ...prev, lives: newLives, streak: 0 }));
          generateProblem(gameState.level);
        }
      }
    }, 500);
  };

  if (!gameState.isPlaying) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🥷</div>
        <h2 className="text-3xl font-bold text-white mb-4">Number Ninja</h2>
        <p className="text-white/80 mb-6">
          Slash through maths problems as fast as you can!
          Answer quickly for bonus points!
        </p>
        <button
          onClick={() => setGameState(prev => ({ ...prev, isPlaying: true }))}
          className="px-8 py-4 bg-white text-red-600 rounded-xl font-bold text-xl hover:bg-white/90 transition-all"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (gameState.gameOver) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
        <p className="text-6xl font-bold text-white mb-4">{gameState.score}</p>
        <p className="text-white/80 mb-6">
          You earned {Math.floor(gameState.score / 2)} XP!
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setGameState({
              score: 0, level: 1, lives: 3, streak: 0, isPlaying: true, gameOver: false,
            })}
            className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-white/90"
          >
            Play Again
          </button>
          <button
            onClick={() => onExit(gameState.score)}
            className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="text-2xl">{i < gameState.lives ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <div className="text-white font-bold text-xl">Score: {gameState.score}</div>
        <div className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
          ⏱️ {timeLeft}
        </div>
      </div>

      {/* Problem */}
      <div className={`bg-white/20 rounded-2xl p-8 mb-6 text-center transition-all ${
        feedback === 'correct' ? 'bg-green-500/50' :
        feedback === 'wrong' ? 'bg-red-500/50' : ''
      }`}>
        {gameState.streak >= 3 && (
          <p className="text-yellow-300 text-sm mb-2">🔥 {gameState.streak} streak!</p>
        )}
        <p className="text-4xl font-bold text-white">{problem.question}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        {problem.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(option)}
            disabled={feedback !== null}
            className="py-6 bg-white/20 hover:bg-white/30 rounded-xl text-2xl font-bold text-white transition-all disabled:opacity-50"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Times Table Sprint Game
const TimesTableSprintGame: React.FC<{ onExit: (score: number) => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const TOTAL_QUESTIONS = 20;
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState<{ text: string; answer: number; options: number[] } | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const makeQuestion = useCallback(() => {
    const a = Math.floor(Math.random() * 11) + 2; // 2–12
    const b = Math.floor(Math.random() * 11) + 2;
    const answer = a * b;
    const opts = new Set<number>([answer]);
    while (opts.size < 4) {
      const wrong = answer + (Math.floor(Math.random() * 10) - 5) * (Math.floor(Math.random() * 2) === 0 ? 1 : -1);
      if (wrong > 0 && wrong !== answer) opts.add(wrong);
    }
    return { text: `${a} × ${b} = ?`, answer, options: [...opts].sort(() => Math.random() - 0.5) };
  }, []);

  const startGame = () => {
    setScore(0);
    setQIndex(0);
    setCorrect(0);
    setElapsedSec(0);
    setIsPlaying(true);
    setQuestion(makeQuestion());
    timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
    soundEffects.playClick();
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleAnswer = (chosen: number) => {
    if (feedback) return;
    const isCorrect = chosen === question!.answer;
    if (isCorrect) {
      soundEffects.playCorrect();
      setCorrect(c => c + 1);
      setScore(s => s + Math.max(5, 20 - Math.floor(elapsedSec / TOTAL_QUESTIONS)));
    } else {
      soundEffects.playWrong();
    }
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      const next = qIndex + 1;
      if (next >= TOTAL_QUESTIONS) {
        // done
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        soundEffects.playWin();
      } else {
        setQIndex(next);
        setQuestion(makeQuestion());
      }
    }, 600);
  };

  const starsEarned = () => {
    if (correct < 10) return 0;
    if (elapsedSec < 60) return 3;
    if (elapsedSec < 100) return 2;
    return 1;
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!isPlaying) {
    const stars = starsEarned();
    return (
      <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">⚡</div>
        <h2 className="text-3xl font-bold text-white mb-2">Times Table Sprint</h2>
        {score === 0 ? (
          <>
            <p className="text-white/80 mb-2">Answer {TOTAL_QUESTIONS} times table questions as fast as you can!</p>
            <p className="text-white/60 text-sm mb-6">⭐⭐⭐ under 60s · ⭐⭐ under 100s · ⭐ rest</p>
          </>
        ) : (
          <div className="mb-6">
            <div className="text-4xl mb-2">{stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : stars === 1 ? '⭐' : '💪'}</div>
            <p className="text-white text-xl font-bold">{correct}/{TOTAL_QUESTIONS} correct · {formatTime(elapsedSec)}</p>
            <p className="text-white/70">Score: {score}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button onClick={startGame} className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-xl">
            {score === 0 ? 'Start Sprint!' : 'Play Again'}
          </button>
          {score > 0 && (
            <button onClick={() => { onXpEarned?.(score); onExit(score); }} className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-xl hover:bg-white/30">
              Exit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-6">
      <div className="flex justify-between mb-3 text-white font-bold">
        <span>Q {qIndex + 1}/{TOTAL_QUESTIONS}</span>
        <span>⏱ {formatTime(elapsedSec)}</span>
        <span>✓ {correct}</span>
      </div>

      <div className="w-full bg-white/20 rounded-full h-2 mb-6">
        <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${((qIndex) / TOTAL_QUESTIONS) * 100}%` }} />
      </div>

      <div className={`bg-white/20 rounded-2xl p-8 text-center mb-6 transition-all ${feedback === 'correct' ? 'bg-green-400/40' : feedback === 'wrong' ? 'bg-red-400/40' : ''}`}>
        <p className="text-5xl font-bold text-white">{question?.text}</p>
        {feedback && (
          <p className="text-white font-bold mt-2">{feedback === 'correct' ? '✓ Correct!' : `✗ ${question?.answer}`}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question?.options.map(opt => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
            className="py-4 bg-white/20 hover:bg-white/30 text-white font-bold text-2xl rounded-xl transition-all disabled:opacity-60"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const SpellingBeeGame: React.FC<{ onExit: (score: number) => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState({ word: 'ELEPHANT', hint: 'A large grey animal with a trunk' });
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [round, setRound] = useState(1);
  const [gameWords, setGameWords] = useState<{ word: string; hint: string }[]>([]);
  const [totalRounds] = useState(10);
  const [loading, setLoading] = useState(false);

  // Comprehensive spelling words for KS2 (Years 3-6)
  const allWords = [
    // Animals
    { word: 'ELEPHANT', hint: 'A large grey animal with a trunk' },
    { word: 'GIRAFFE', hint: 'Tallest animal with a very long neck' },
    { word: 'DOLPHIN', hint: 'A clever sea mammal that jumps and plays' },
    { word: 'PENGUIN', hint: 'A black and white bird that cannot fly but can swim' },
    { word: 'LEOPARD', hint: 'A big cat with spots' },
    { word: 'CHEETAH', hint: 'The fastest land animal' },
    { word: 'GORILLA', hint: 'A large ape that lives in forests' },
    { word: 'BUTTERFLY', hint: 'An insect with colorful wings' },
    { word: 'SQUIRREL', hint: 'A small animal that collects nuts' },
    { word: 'CROCODILE', hint: 'A large reptile with powerful jaws' },
    { word: 'RHINOCEROS', hint: 'A large animal with a horn on its nose' },
    { word: 'HIPPOPOTAMUS', hint: 'A large animal that loves water' },
    { word: 'KANGAROO', hint: 'An Australian animal that hops' },
    { word: 'OCTOPUS', hint: 'A sea creature with eight arms' },
    { word: 'MOSQUITO', hint: 'A tiny insect that bites and buzzes' },
    
    // Adjectives
    { word: 'BEAUTIFUL', hint: 'Very pretty or attractive' },
    { word: 'DIFFERENT', hint: 'Not the same as another' },
    { word: 'IMPORTANT', hint: 'Something that matters a lot' },
    { word: 'INTERESTING', hint: 'Something that makes you want to learn more' },
    { word: 'DANGEROUS', hint: 'Something that could hurt you' },
    { word: 'MYSTERIOUS', hint: 'Something strange and hard to explain' },
    { word: 'ENORMOUS', hint: 'Extremely large' },
    { word: 'DELICIOUS', hint: 'Tastes really good' },
    { word: 'COMFORTABLE', hint: 'Feeling cozy and relaxed' },
    { word: 'INVISIBLE', hint: 'Cannot be seen' },
    { word: 'INCREDIBLE', hint: 'Hard to believe, amazing' },
    { word: 'SPECTACULAR', hint: 'Really impressive to look at' },
    { word: 'MAGNIFICENT', hint: 'Extremely beautiful or impressive' },
    { word: 'EXTRAORDINARY', hint: 'Very unusual or remarkable' },
    { word: 'COURAGEOUS', hint: 'Very brave' },
    
    // School subjects
    { word: 'SCIENCE', hint: 'Study of the natural world' },
    { word: 'GEOGRAPHY', hint: 'Study of places and maps' },
    { word: 'MATHEMATICS', hint: 'Study of numbers and shapes' },
    { word: 'LITERATURE', hint: 'Study of books and stories' },
    { word: 'TECHNOLOGY', hint: 'Study of machines and computers' },
    { word: 'PHYSICAL', hint: 'Related to the body' },
    { word: 'EDUCATION', hint: 'Learning at school' },
    { word: 'EXPERIMENT', hint: 'A test to discover something' },
    { word: 'DICTIONARY', hint: 'A book with word definitions' },
    { word: 'ENCYCLOPEDIA', hint: 'A book with information about everything' },
    
    // Common tricky words
    { word: 'NECESSARY', hint: 'Something you must have or do' },
    { word: 'SEPARATE', hint: 'To divide or keep apart' },
    { word: 'ESPECIALLY', hint: 'More than usual, particularly' },
    { word: 'DEFINITELY', hint: 'For certain, without doubt' },
    { word: 'IMMEDIATELY', hint: 'Right now, at once' },
    { word: 'OCCASIONALLY', hint: 'Sometimes, now and then' },
    { word: 'UNFORTUNATELY', hint: 'Sadly, unluckily' },
    { word: 'ENVIRONMENT', hint: 'The world around us, nature' },
    { word: 'GOVERNMENT', hint: 'People who run a country' },
    { word: 'RESTAURANT', hint: 'A place to eat meals' },
    { word: 'CHOCOLATE', hint: 'A sweet brown treat' },
    { word: 'VEGETABLE', hint: 'A healthy plant food' },
    { word: 'FAVOURITE', hint: 'The one you like best' },
    { word: 'CALENDAR', hint: 'Shows days and months' },
    { word: 'FEBRUARY', hint: 'The second month of the year' },
    { word: 'WEDNESDAY', hint: 'The middle day of the work week' },
    { word: 'KNOWLEDGE', hint: 'What you know and have learned' },
    { word: 'BEGINNING', hint: 'The start of something' },
    { word: 'DISAPPEAR', hint: 'To vanish or go away' },
    { word: 'APPRECIATE', hint: 'To be thankful for something' },
    
    // Places and things
    { word: 'MOUNTAIN', hint: 'A very tall natural land formation' },
    { word: 'ISLAND', hint: 'Land surrounded by water' },
    { word: 'LIBRARY', hint: 'A place with lots of books' },
    { word: 'MUSEUM', hint: 'A building with historical items' },
    { word: 'HOSPITAL', hint: 'Where sick people get better' },
    { word: 'ORCHESTRA', hint: 'A large group of musicians' },
    { word: 'TREASURE', hint: 'Valuable things like gold' },
    { word: 'LIGHTNING', hint: 'A flash of light in a storm' },
    { word: 'ATMOSPHERE', hint: 'The air around Earth' },
    { word: 'ADVENTURE', hint: 'An exciting journey' },
    
    // Actions
    { word: 'BELIEVE', hint: 'To think something is true' },
    { word: 'IMAGINE', hint: 'To picture something in your mind' },
    { word: 'REMEMBER', hint: 'To not forget' },
    { word: 'EXERCISE', hint: 'Physical activity to stay healthy' },
    { word: 'SURPRISE', hint: 'Something unexpected' },
    { word: 'RECOGNIZE', hint: 'To know who someone is' },
    { word: 'CELEBRATE', hint: 'To have a party for something special' },
    { word: 'DESCRIBE', hint: 'To explain what something is like' },
    { word: 'PERSUADE', hint: 'To convince someone' },
    { word: 'COMPLETE', hint: 'To finish something' },
    
    // More challenging words
    { word: 'PARLIAMENT', hint: 'Where laws are made in the UK' },
    { word: 'OPPORTUNITY', hint: 'A chance to do something' },
    { word: 'TEMPERATURE', hint: 'How hot or cold something is' },
    { word: 'COMPETITION', hint: 'A contest to see who wins' },
    { word: 'COMMUNICATION', hint: 'Sharing information with others' },
    { word: 'PRONUNCIATION', hint: 'How you say a word' },
    { word: 'EXAGGERATE', hint: 'To make something sound bigger than it is' },
    { word: 'QUESTIONNAIRE', hint: 'A form with questions' },
    { word: 'ACCOMMODATE', hint: 'To make room for' },
    { word: 'CONSCIENCE', hint: 'Knowing right from wrong inside you' },
  ];

  const shuffleWords = () => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalRounds);
  };

  const handleSubmit = () => {
    soundEffects.playClick();
    if (userInput.toUpperCase() === currentWord.word) {
      soundEffects.playCorrect();
      const points = 20 + (currentWord.word.length > 8 ? 10 : 0);
      setScore(prev => prev + points);
      setFeedback(`Correct! +${points} points! 🎉`);
      setTimeout(() => {
        if (round < totalRounds) {
          setRound(prev => prev + 1);
          setCurrentWord(gameWords[round]);
          setUserInput('');
          setFeedback('');
        } else {
          soundEffects.playWin();
          onXpEarned?.(score + points);
          setIsPlaying(false);
        }
      }, 1000);
    } else {
      soundEffects.playWrong();
      setFeedback('Try again! 🤔');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const speakWord = useCallback(() => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
  }, [currentWord.word]);

  // Auto-speak when a new word loads
  useEffect(() => {
    if (isPlaying && currentWord.word) {
      const t = setTimeout(() => speakWord(), 400);
      return () => clearTimeout(t);
    }
  }, [currentWord.word, isPlaying, speakWord]);

  const startGame = async () => {
    setLoading(true);
    try {
      // Try to fetch from qbank first
      const questions = await gameService.getQuestionsForGame('English', 30);
      
      // Filter for questions that look like spelling/vocab questions
      // We want single word answers
      const qbankWords = questions
        .filter(q => q.correctAnswer && q.correctAnswer.trim().split(' ').length === 1 && q.correctAnswer.length > 2)
        .map(q => ({
          word: q.correctAnswer.toUpperCase().trim(),
          hint: q.question
        }));

      let words: { word: string; hint: string }[] = [];
      
      if (qbankWords.length >= 5) {
        // Use qbank words if we have enough
        words = qbankWords.sort(() => Math.random() - 0.5).slice(0, totalRounds);
      } else {
        // Fallback to hardcoded
        words = shuffleWords();
      }

      setGameWords(words);
      setCurrentWord(words[0]);
      setIsPlaying(true);
      setScore(0);
      setRound(1);
      setUserInput('');
      setFeedback('');
    } catch (error) {
      console.error("Error starting game:", error);
      // Fallback
      const words = shuffleWords();
      setGameWords(words);
      setCurrentWord(words[0]);
      setIsPlaying(true);
      setScore(0);
      setRound(1);
      setUserInput('');
      setFeedback('');
    } finally {
      setLoading(false);
    }
  };

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🐝</div>
        <h2 className="text-3xl font-bold text-white mb-4">Spelling Bee</h2>
        <p className="text-white/80 mb-6">Listen to the word and spell it correctly! {totalRounds} rounds with KS2 words.</p>
        {score > 0 && <p className="text-white mb-4">Final Score: {score}</p>}
        <div className="flex gap-4 justify-center">
          <button
            onClick={startGame}
            disabled={loading}
            className="px-8 py-4 bg-white text-amber-600 rounded-xl font-bold text-xl disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Start Game'}
          </button>
          {score > 0 && (
            <button
              onClick={() => onExit(score)}
              className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-xl hover:bg-white/30"
            >
              Exit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6">
      <div className="flex justify-between mb-4">
        <span className="text-white font-bold">Round {round}/{totalRounds}</span>
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className="bg-white/20 rounded-xl p-6 mb-4 text-center">
        <button
          onClick={speakWord}
          className="text-5xl mb-2 hover:scale-110 transition-transform"
        >
          🔊
        </button>
        <p className="text-white text-xs font-semibold mb-3">Tap to hear again</p>
        <p className="text-white/80 text-sm">Hint: {currentWord.hint}</p>
        <p className="text-white/60 text-xs mt-2">({currentWord.word.length} letters)</p>
      </div>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value.toUpperCase())}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-full px-4 py-3 bg-white rounded-xl text-amber-600 font-bold text-xl text-center mb-4"
        placeholder="Type the word..."
        autoFocus
      />

      {feedback && <p className="text-center text-white font-bold mb-4">{feedback}</p>}

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-white text-amber-600 rounded-xl font-bold"
      >
        Check Spelling
      </button>
    </div>
  );
};

const ScienceSorterGame: React.FC<{ onExit: (score: number) => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  type SorterSet = { title: string; categories: string[]; cards: { label: string; category: string }[] };

  const SETS: SorterSet[] = [
    {
      title: 'Vertebrate or Invertebrate?',
      categories: ['Vertebrate', 'Invertebrate'],
      cards: [
        { label: 'Dog', category: 'Vertebrate' },
        { label: 'Ant', category: 'Invertebrate' },
        { label: 'Salmon', category: 'Vertebrate' },
        { label: 'Spider', category: 'Invertebrate' },
        { label: 'Eagle', category: 'Vertebrate' },
        { label: 'Worm', category: 'Invertebrate' },
        { label: 'Frog', category: 'Vertebrate' },
        { label: 'Snail', category: 'Invertebrate' },
        { label: 'Snake', category: 'Vertebrate' },
        { label: 'Jellyfish', category: 'Invertebrate' },
        { label: 'Shark', category: 'Vertebrate' },
        { label: 'Butterfly', category: 'Invertebrate' },
      ],
    },
    {
      title: 'Solid, Liquid or Gas?',
      categories: ['Solid', 'Liquid', 'Gas'],
      cards: [
        { label: 'Ice', category: 'Solid' },
        { label: 'Water', category: 'Liquid' },
        { label: 'Steam', category: 'Gas' },
        { label: 'Rock', category: 'Solid' },
        { label: 'Milk', category: 'Liquid' },
        { label: 'Oxygen', category: 'Gas' },
        { label: 'Wood', category: 'Solid' },
        { label: 'Juice', category: 'Liquid' },
        { label: 'Carbon Dioxide', category: 'Gas' },
        { label: 'Iron', category: 'Solid' },
        { label: 'Honey', category: 'Liquid' },
        { label: 'Nitrogen', category: 'Gas' },
      ],
    },
    {
      title: 'Living or Non-Living?',
      categories: ['Living', 'Non-Living'],
      cards: [
        { label: 'Mushroom', category: 'Living' },
        { label: 'Stone', category: 'Non-Living' },
        { label: 'Tree', category: 'Living' },
        { label: 'Cloud', category: 'Non-Living' },
        { label: 'Bacteria', category: 'Living' },
        { label: 'Wind', category: 'Non-Living' },
        { label: 'Moss', category: 'Living' },
        { label: 'Fire', category: 'Non-Living' },
        { label: 'Seaweed', category: 'Living' },
        { label: 'Sand', category: 'Non-Living' },
        { label: 'Coral', category: 'Living' },
        { label: 'Rain', category: 'Non-Living' },
      ],
    },
    {
      title: 'Which animal class?',
      categories: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish'],
      cards: [
        { label: 'Whale', category: 'Mammal' },
        { label: 'Robin', category: 'Bird' },
        { label: 'Crocodile', category: 'Reptile' },
        { label: 'Newt', category: 'Amphibian' },
        { label: 'Trout', category: 'Fish' },
        { label: 'Bat', category: 'Mammal' },
        { label: 'Penguin', category: 'Bird' },
        { label: 'Tortoise', category: 'Reptile' },
        { label: 'Toad', category: 'Amphibian' },
        { label: 'Clownfish', category: 'Fish' },
        { label: 'Dolphin', category: 'Mammal' },
        { label: 'Parrot', category: 'Bird' },
      ],
    },
  ];

  const TOTAL_ROUNDS = 12;
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [currentSet, setCurrentSet] = useState<SorterSet | null>(null);
  const [deck, setDeck] = useState<{ label: string; category: string }[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);

  const startGame = () => {
    const chosenSet = SETS[Math.floor(Math.random() * SETS.length)];
    const shuffled = [...chosenSet.cards].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    setCurrentSet(chosenSet);
    setDeck(shuffled);
    setCardIdx(0);
    setRound(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setFeedback(null);
    setIsPlaying(true);
    soundEffects.playClick();
  };

  const handleSort = (chosen: string) => {
    if (feedback) return;
    const card = deck[cardIdx];
    const isCorrect = chosen === card.category;
    if (isCorrect) {
      soundEffects.playCorrect();
      const bonus = streak >= 2 ? 5 : 0;
      setScore(s => s + 15 + bonus);
      setStreak(s => s + 1);
      setFeedback('correct');
    } else {
      soundEffects.playWrong();
      setLives(l => l - 1);
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      const nextIdx = cardIdx + 1;
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS || lives - (isCorrect ? 0 : 1) <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onXpEarned?.(score + (isCorrect ? 15 : 0));
        setIsPlaying(false);
        soundEffects.playWin();
      } else {
        setCardIdx(nextIdx);
        setRound(nextRound);
      }
    }, 700);
  };

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const currentCard = deck[cardIdx];

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🔬</div>
        <h2 className="text-3xl font-bold text-white mb-2">Science Sorter</h2>
        {score === 0 ? (
          <p className="text-white/80 mb-6">Sort science cards into the right categories! {TOTAL_ROUNDS} cards, 3 lives. Streak bonuses available!</p>
        ) : (
          <div className="mb-6">
            <p className="text-white text-xl font-bold">Score: {score}</p>
            <p className="text-white/70">Lives left: {'❤️'.repeat(lives)}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button onClick={startGame} className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-xl">
            {score === 0 ? 'Start Sorting!' : 'Play Again'}
          </button>
          {score > 0 && (
            <button onClick={() => onExit(score)} className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-xl hover:bg-white/30">
              Exit
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6">
      <div className="flex justify-between mb-2 text-white">
        <span className="font-bold">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
        <span className="font-bold">{round + 1}/{TOTAL_ROUNDS}</span>
        <span className="font-bold">Score: {score}</span>
      </div>
      {streak >= 2 && <p className="text-yellow-200 text-center text-sm font-bold mb-1">🔥 {streak}× streak!</p>}

      <p className="text-white/80 text-center text-sm font-semibold mb-4">{currentSet?.title}</p>

      {/* Card */}
      <div className={`bg-white rounded-2xl p-8 text-center mb-6 shadow-lg transition-all ${feedback === 'correct' ? 'ring-4 ring-yellow-300' : feedback === 'wrong' ? 'ring-4 ring-red-400' : ''}`}>
        <p className="text-4xl font-bold text-emerald-700">{currentCard?.label}</p>
        {feedback && (
          <p className={`mt-2 font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback === 'correct' ? '✓ Correct!' : `✗ It's a ${currentCard?.category}`}
          </p>
        )}
      </div>

      {/* Category buttons */}
      <div className="grid grid-cols-2 gap-3">
        {currentSet?.categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleSort(cat)}
            disabled={!!feedback}
            className="py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

const HistoryMatchGame: React.FC<{ onExit: (score: number) => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<{ id: number; content: string; type: 'event' | 'date'; matched: boolean; flipped: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [currentPairs, setCurrentPairs] = useState<{ event: string; date: string }[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [loading, setLoading] = useState(false);

  // Comprehensive history pairs for KS2
  const allPairs = {
    // British History
    british: [
      { event: 'Great Fire of London', date: '1666' },
      { event: 'Battle of Hastings', date: '1066' },
      { event: 'Queen Victoria became Queen', date: '1837' },
      { event: 'Queen Elizabeth II Coronation', date: '1953' },
      { event: 'Gunpowder Plot', date: '1605' },
      { event: 'King Henry VIII became King', date: '1509' },
      { event: 'English Civil War began', date: '1642' },
      { event: 'The Plague in London', date: '1665' },
      { event: 'Magna Carta signed', date: '1215' },
      { event: 'Battle of Trafalgar', date: '1805' },
      { event: 'Queen Elizabeth I became Queen', date: '1558' },
      { event: 'Spanish Armada defeated', date: '1588' },
      { event: 'Battle of Waterloo', date: '1815' },
      { event: 'The Blitz began', date: '1940' },
      { event: 'NHS was created', date: '1948' },
    ],
    // World History
    world: [
      { event: 'First Moon Landing', date: '1969' },
      { event: 'World War 1 began', date: '1914' },
      { event: 'World War 2 ended', date: '1945' },
      { event: 'Berlin Wall fell', date: '1989' },
      { event: 'Christopher Columbus reached America', date: '1492' },
      { event: 'French Revolution began', date: '1789' },
      { event: 'American Independence', date: '1776' },
      { event: 'Titanic sank', date: '1912' },
      { event: 'First aeroplane flight', date: '1903' },
      { event: 'World War 2 began', date: '1939' },
      { event: 'Martin Luther King "I Have a Dream"', date: '1963' },
      { event: 'Nelson Mandela freed', date: '1990' },
      { event: 'First computer invented', date: '1946' },
      { event: 'Internet created', date: '1991' },
      { event: 'First mobile phone call', date: '1973' },
    ],
    // Ancient History
    ancient: [
      { event: 'Pyramids of Giza built (approx)', date: '2560 BC' },
      { event: 'Roman Empire began', date: '27 BC' },
      { event: 'Julius Caesar died', date: '44 BC' },
      { event: 'Romans invaded Britain', date: '43 AD' },
      { event: 'Romans left Britain', date: '410 AD' },
      { event: 'Vikings first raided Britain', date: '793 AD' },
      { event: 'Ancient Olympics began (approx)', date: '776 BC' },
      { event: 'Alexander the Great died', date: '323 BC' },
      { event: 'Cleopatra became Queen', date: '51 BC' },
      { event: 'Great Wall of China built (approx)', date: '221 BC' },
    ],
    // Famous People
    people: [
      { event: 'Leonardo da Vinci born', date: '1452' },
      { event: 'Shakespeare born', date: '1564' },
      { event: 'Isaac Newton discovered gravity', date: '1687' },
      { event: 'Charles Darwin "Origin of Species"', date: '1859' },
      { event: 'Florence Nightingale in Crimea', date: '1854' },
      { event: 'Albert Einstein born', date: '1879' },
      { event: 'Winston Churchill became PM', date: '1940' },
      { event: 'Princess Diana died', date: '1997' },
      { event: 'Barack Obama elected President', date: '2008' },
      { event: 'Queen Elizabeth II died', date: '2022' },
    ],
  };

  const selectPairs = (diff: 'easy' | 'medium' | 'hard', sourcePairs?: { event: string; date: string }[]) => {
    const count = diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8;
    
    let allAvailable: { event: string; date: string }[] = [];

    if (sourcePairs && sourcePairs.length >= count) {
      allAvailable = sourcePairs;
    } else {
      // Mix from different categories (fallback)
      allAvailable = [
        ...allPairs.british,
        ...allPairs.world,
        ...allPairs.ancient.slice(0, 5),
        ...allPairs.people,
      ];
    }
    
    const shuffled = [...allAvailable].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const startGame = async (diff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(diff);
    setLoading(true);

    try {
      // Try to fetch from qbank
      const questions = await gameService.getQuestionsForGame('History', 30);
      
      // Filter for questions that look like date questions
      // We want short answers (dates usually)
      const qbankPairs = questions
        .filter(q => q.correctAnswer && q.correctAnswer.length < 20) // Arbitrary length check for "date-like" or short answer
        .map(q => ({
          event: q.question,
          date: q.correctAnswer
        }));

      const selectedPairs = selectPairs(diff, qbankPairs);
      setCurrentPairs(selectedPairs);
      
      const newCards = selectedPairs.flatMap((pair, i) => [
        { id: i * 2, content: pair.event, type: 'event' as const, matched: false, flipped: false },
        { id: i * 2 + 1, content: pair.date, type: 'date' as const, matched: false, flipped: false },
      ]).sort(() => Math.random() - 0.5);
      
      setCards(newCards);
      setMatches(0);
      setFlipped([]);
      setScore(0);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error starting history game:", error);
      // Fallback
      const selectedPairs = selectPairs(diff);
      setCurrentPairs(selectedPairs);
      
      const newCards = selectedPairs.flatMap((pair, i) => [
        { id: i * 2, content: pair.event, type: 'event' as const, matched: false, flipped: false },
        { id: i * 2 + 1, content: pair.date, type: 'date' as const, matched: false, flipped: false },
      ]).sort(() => Math.random() - 0.5);
      
      setCards(newCards);
      setMatches(0);
      setFlipped([]);
      setScore(0);
      setIsPlaying(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || cards[index].flipped || cards[index].matched) return;
    soundEffects.playClick();

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];

      // Check if they match
      const pair = currentPairs.find(p => 
        (p.event === card1.content && p.date === card2.content) ||
        (p.event === card2.content && p.date === card1.content)
      );

      setTimeout(() => {
        if (pair) {
          soundEffects.playCorrect();
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards([...newCards]);
          const points = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 30 : 35;
          setScore(prev => prev + points);
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === currentPairs.length) {
              soundEffects.playWin();
              onXpEarned?.(score + points);
              setIsPlaying(false);
            }
            return newMatches;
          });
        } else {
          soundEffects.playWrong();
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
        }
        setFlipped([]);
      }, 1000);
    }
  };

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🏛️</div>
        <h2 className="text-3xl font-bold text-white mb-4">History Match</h2>
        <p className="text-white/80 mb-6">Match historical events with their dates!</p>
        {score > 0 && <p className="text-white mb-4">Final Score: {score}</p>}
        
        <div className="space-y-3">
          <button
            onClick={() => startGame('easy')}
            disabled={loading}
            className="w-full px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Easy (4 pairs)'}
          </button>
          <button
            onClick={() => startGame('medium')}
            disabled={loading}
            className="w-full px-8 py-4 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Medium (6 pairs)'}
          </button>
          <button
            onClick={() => startGame('hard')}
            disabled={loading}
            className="w-full px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Hard (8 pairs)'}
          </button>
          {score > 0 && (
            <button
              onClick={() => onExit(score)}
              className="w-full px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30"
            >
              Exit & Save Score
            </button>
          )}
        </div>
      </div>
    );
  }

  const gridCols = difficulty === 'easy' ? 'grid-cols-4' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4';

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6">
      <div className="flex justify-between mb-4">
        <span className="text-white font-bold">Matches: {matches}/{currentPairs.length}</span>
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className={`grid ${gridCols} gap-2`}>
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(i)}
            className={`aspect-square rounded-xl font-bold text-xs sm:text-sm p-1 sm:p-2 transition-all ${
              card.matched
                ? 'bg-green-500 text-white'
                : card.flipped
                ? 'bg-white text-indigo-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {card.flipped || card.matched ? card.content : '?'}
          </button>
        ))}
      </div>
      
      <p className="text-white/60 text-xs text-center mt-4">
        Match each event with its year
      </p>
    </div>
  );
};

export default MiniGames;
