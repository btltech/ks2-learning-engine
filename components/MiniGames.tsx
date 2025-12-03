import React, { useState, useEffect, useCallback } from 'react';
import { Subject } from '../types';

interface MiniGamesProps {
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
}

type GameType = 'number_ninja' | 'word_builder' | 'spelling_bee' | 'science_lab' | 'history_match';

interface GameState {
  score: number;
  level: number;
  lives: number;
  streak: number;
  isPlaying: boolean;
  gameOver: boolean;
}

const MiniGames: React.FC<MiniGamesProps> = ({ onClose, onXpEarned }) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const games = [
    {
      id: 'number_ninja' as GameType,
      name: 'Number Ninja',
      icon: '🥷',
      subject: 'Maths',
      description: 'Slice the correct answers before time runs out!',
      color: 'from-red-500 to-orange-600',
    },
    {
      id: 'word_builder' as GameType,
      name: 'Word Builder',
      icon: '📝',
      subject: 'English',
      description: 'Create as many words as you can from the letters!',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'spelling_bee' as GameType,
      name: 'Spelling Bee',
      icon: '🐝',
      subject: 'English',
      description: 'Listen and spell the words correctly!',
      color: 'from-yellow-500 to-amber-600',
    },
    {
      id: 'science_lab' as GameType,
      name: 'Science Lab',
      icon: '🧪',
      subject: 'Science',
      description: 'Mix the right elements to complete experiments!',
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

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedGame(null)}
            className="text-white/70 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Games
          </button>

          {selectedGame === 'number_ninja' && (
            <NumberNinjaGame 
              onExit={() => setSelectedGame(null)} 
              onXpEarned={onXpEarned}
            />
          )}
          {selectedGame === 'word_builder' && (
            <WordBuilderGame 
              onExit={() => setSelectedGame(null)} 
              onXpEarned={onXpEarned}
            />
          )}
          {selectedGame === 'spelling_bee' && (
            <SpellingBeeGame 
              onExit={() => setSelectedGame(null)} 
              onXpEarned={onXpEarned}
            />
          )}
          {selectedGame === 'science_lab' && (
            <ScienceLabGame 
              onExit={() => setSelectedGame(null)} 
              onXpEarned={onXpEarned}
            />
          )}
          {selectedGame === 'history_match' && (
            <HistoryMatchGame 
              onExit={() => setSelectedGame(null)} 
              onXpEarned={onXpEarned}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">🎮 Mini Games</h1>
            <p className="text-white/60">Learn while having fun!</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Games Grid */}
        <div className="grid gap-4">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`bg-gradient-to-r ${game.color} rounded-2xl p-6 text-left hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{game.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <p className="text-white/80 text-sm">{game.description}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                    {game.subject}
                  </span>
                </div>
                <span className="text-3xl text-white/50">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Number Ninja Game
const NumberNinjaGame: React.FC<{ onExit: () => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0, level: 1, lives: 3, streak: 0, isPlaying: false, gameOver: false,
  });
  const [problem, setProblem] = useState({ question: '', answer: 0, options: [0] });
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateProblem = useCallback((level: number) => {
    const operations = ['+', '-', '×'];
    const op = operations[Math.floor(Math.random() * Math.min(level, 3))];
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

    const isCorrect = selected === problem.answer;
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
            onClick={onExit}
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

// Word Builder Game
const WordBuilderGame: React.FC<{ onExit: () => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0, level: 1, lives: 3, streak: 0, isPlaying: false, gameOver: false,
  });
  const [letters, setLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState('');

  // Simple word list (in production, use a proper dictionary API)
  const validWords = new Set([
    'cat', 'car', 'care', 'race', 'ace', 'are', 'ear', 'tea', 'eat', 'ate',
    'star', 'rats', 'arts', 'tars', 'sat', 'tar', 'rat', 'art', 'as', 'at',
    'the', 'hat', 'bat', 'tab', 'bit', 'hit', 'sit', 'its', 'is', 'it',
    'dog', 'god', 'go', 'do', 'log', 'fog', 'cog', 'hog', 'jog', 'bog',
    'pen', 'hen', 'ten', 'net', 'pet', 'set', 'get', 'let', 'met', 'wet',
  ]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      const vowels = 'AEIOU';
      const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
      const newLetters: string[] = [];
      
      // Ensure at least 2 vowels
      for (let i = 0; i < 2; i++) {
        newLetters.push(vowels[Math.floor(Math.random() * vowels.length)]);
      }
      // Add consonants
      for (let i = 0; i < 5; i++) {
        newLetters.push(consonants[Math.floor(Math.random() * consonants.length)]);
      }
      
      setLetters(newLetters.sort(() => Math.random() - 0.5));
      setFoundWords([]);
      setCurrentWord('');
      setTimeLeft(60);
    }
  }, [gameState.isPlaying, gameState.gameOver]);

  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState(p => ({ ...p, gameOver: true }));
          onXpEarned?.(gameState.score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.gameOver, gameState.score, onXpEarned]);

  const handleLetterClick = (letter: string, index: number) => {
    if (currentWord.length < 7) {
      setCurrentWord(prev => prev + letter);
    }
  };

  const handleSubmit = () => {
    const word = currentWord.toLowerCase();
    
    if (word.length < 2) {
      setMessage('Word too short!');
      setTimeout(() => setMessage(''), 1000);
      return;
    }

    if (foundWords.includes(word)) {
      setMessage('Already found!');
      setTimeout(() => setMessage(''), 1000);
      return;
    }

    if (validWords.has(word)) {
      const points = word.length * 10;
      setFoundWords(prev => [...prev, word]);
      setGameState(prev => ({ ...prev, score: prev.score + points }));
      setMessage(`+${points} points!`);
    } else {
      setMessage('Not a valid word!');
    }
    
    setCurrentWord('');
    setTimeout(() => setMessage(''), 1000);
  };

  if (!gameState.isPlaying) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">📝</div>
        <h2 className="text-3xl font-bold text-white mb-4">Word Builder</h2>
        <p className="text-white/80 mb-6">
          Create as many words as you can from the given letters in 60 seconds!
        </p>
        <button
          onClick={() => setGameState(prev => ({ ...prev, isPlaying: true }))}
          className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-xl hover:bg-white/90"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (gameState.gameOver) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-2">Time's Up!</h2>
        <p className="text-6xl font-bold text-white mb-2">{gameState.score}</p>
        <p className="text-white/80 mb-2">Points</p>
        <p className="text-white/60 mb-6">Found {foundWords.length} words!</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setGameState({
              score: 0, level: 1, lives: 3, streak: 0, isPlaying: true, gameOver: false,
            })}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold"
          >
            Play Again
          </button>
          <button onClick={onExit} className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold">
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white font-bold">Score: {gameState.score}</div>
        <div className="text-white font-bold text-xl">⏱️ {timeLeft}s</div>
      </div>

      {/* Letters */}
      <div className="flex justify-center gap-2 mb-4">
        {letters.map((letter, i) => (
          <button
            key={i}
            onClick={() => handleLetterClick(letter, i)}
            className="w-12 h-12 bg-white rounded-xl font-bold text-xl text-blue-600 hover:bg-white/90"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Current Word */}
      <div className="bg-white/20 rounded-xl p-4 mb-4 min-h-[60px] flex items-center justify-center">
        <span className="text-2xl font-bold text-white tracking-widest">
          {currentWord || 'Tap letters...'}
        </span>
      </div>

      {message && (
        <p className="text-center text-yellow-300 font-bold mb-2">{message}</p>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setCurrentWord('')}
          className="flex-1 py-3 bg-white/20 text-white rounded-xl font-bold"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-bold"
        >
          Submit
        </button>
      </div>

      {/* Found Words */}
      <div className="bg-white/10 rounded-xl p-4">
        <p className="text-white/60 text-sm mb-2">Found Words ({foundWords.length})</p>
        <div className="flex flex-wrap gap-2">
          {foundWords.map((word, i) => (
            <span key={i} className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-sm">
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Placeholder games (simplified versions)
const SpellingBeeGame: React.FC<{ onExit: () => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState({ word: 'ELEPHANT', hint: 'A large grey animal with a trunk' });
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [round, setRound] = useState(1);

  const words = [
    { word: 'ELEPHANT', hint: 'A large grey animal with a trunk' },
    { word: 'BEAUTIFUL', hint: 'Very pretty or attractive' },
    { word: 'SCIENCE', hint: 'Study of the natural world' },
    { word: 'NECESSARY', hint: 'Something you must have or do' },
    { word: 'DIFFERENT', hint: 'Not the same' },
  ];

  const handleSubmit = () => {
    if (userInput.toUpperCase() === currentWord.word) {
      setScore(prev => prev + 20);
      setFeedback('Correct! 🎉');
      setTimeout(() => {
        if (round < 5) {
          setRound(prev => prev + 1);
          setCurrentWord(words[round]);
          setUserInput('');
          setFeedback('');
        } else {
          onXpEarned?.(score + 20);
          setIsPlaying(false);
        }
      }, 1000);
    } else {
      setFeedback('Try again! 🤔');
      setTimeout(() => setFeedback(''), 1000);
    }
  };

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
  };

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🐝</div>
        <h2 className="text-3xl font-bold text-white mb-4">Spelling Bee</h2>
        <p className="text-white/80 mb-6">Listen to the word and spell it correctly!</p>
        {score > 0 && <p className="text-white mb-4">Final Score: {score}</p>}
        <button
          onClick={() => { setIsPlaying(true); setScore(0); setRound(1); setCurrentWord(words[0]); }}
          className="px-8 py-4 bg-white text-amber-600 rounded-xl font-bold text-xl"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6">
      <div className="flex justify-between mb-4">
        <span className="text-white font-bold">Round {round}/5</span>
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className="bg-white/20 rounded-xl p-6 mb-4 text-center">
        <button
          onClick={speakWord}
          className="text-6xl mb-4 hover:scale-110 transition-transform"
        >
          🔊
        </button>
        <p className="text-white/80 text-sm">Hint: {currentWord.hint}</p>
      </div>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value.toUpperCase())}
        className="w-full px-4 py-3 bg-white rounded-xl text-amber-600 font-bold text-xl text-center mb-4"
        placeholder="Type the word..."
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

const ScienceLabGame: React.FC<{ onExit: () => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [experiment, setExperiment] = useState({
    question: 'What happens when you mix baking soda and vinegar?',
    options: ['It fizzes', 'It turns blue', 'Nothing happens', 'It freezes'],
    correct: 0,
  });
  const [round, setRound] = useState(1);

  const experiments = [
    { question: 'What happens when you mix baking soda and vinegar?', options: ['It fizzes', 'It turns blue', 'Nothing happens', 'It freezes'], correct: 0 },
    { question: 'What gas do plants produce during photosynthesis?', options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Helium'], correct: 2 },
    { question: 'What is the boiling point of water?', options: ['50°C', '100°C', '150°C', '200°C'], correct: 1 },
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2 },
    { question: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], correct: 2 },
  ];

  const handleAnswer = (index: number) => {
    if (index === experiment.correct) {
      setScore(prev => prev + 20);
    }
    
    if (round < 5) {
      setRound(prev => prev + 1);
      setExperiment(experiments[round]);
    } else {
      onXpEarned?.(score + (index === experiment.correct ? 20 : 0));
      setIsPlaying(false);
    }
  };

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🧪</div>
        <h2 className="text-3xl font-bold text-white mb-4">Science Lab</h2>
        <p className="text-white/80 mb-6">Answer science questions correctly!</p>
        {score > 0 && <p className="text-white mb-4">Final Score: {score}</p>}
        <button
          onClick={() => { setIsPlaying(true); setScore(0); setRound(1); setExperiment(experiments[0]); }}
          className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-xl"
        >
          Start Experiment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6">
      <div className="flex justify-between mb-4">
        <span className="text-white font-bold">Experiment {round}/5</span>
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className="bg-white/20 rounded-xl p-6 mb-4">
        <p className="text-white font-bold text-lg text-center">{experiment.question}</p>
      </div>

      <div className="space-y-2">
        {experiment.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-medium text-left px-4"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const HistoryMatchGame: React.FC<{ onExit: () => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<{ id: number; content: string; type: 'event' | 'date'; matched: boolean; flipped: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);

  const pairs = [
    { event: 'Great Fire of London', date: '1666' },
    { event: 'First Moon Landing', date: '1969' },
    { event: 'World War 2 Ends', date: '1945' },
    { event: 'Queen Elizabeth II Coronation', date: '1953' },
  ];

  useEffect(() => {
    if (isPlaying) {
      const newCards = pairs.flatMap((pair, i) => [
        { id: i * 2, content: pair.event, type: 'event' as const, matched: false, flipped: false },
        { id: i * 2 + 1, content: pair.date, type: 'date' as const, matched: false, flipped: false },
      ]).sort(() => Math.random() - 0.5);
      setCards(newCards);
      setMatches(0);
      setFlipped([]);
    }
  }, [isPlaying]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || cards[index].flipped || cards[index].matched) return;

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
      const pair = pairs.find(p => 
        (p.event === card1.content && p.date === card2.content) ||
        (p.event === card2.content && p.date === card1.content)
      );

      setTimeout(() => {
        if (pair) {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards([...newCards]);
          setScore(prev => prev + 25);
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === pairs.length) {
              onXpEarned?.(score + 25);
              setIsPlaying(false);
            }
            return newMatches;
          });
        } else {
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
        <button
          onClick={() => { setIsPlaying(true); setScore(0); }}
          className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-xl"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6">
      <div className="flex justify-between mb-4">
        <span className="text-white font-bold">Matches: {matches}/{pairs.length}</span>
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(i)}
            className={`aspect-square rounded-xl font-bold text-sm p-2 transition-all ${
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
    </div>
  );
};

export default MiniGames;
