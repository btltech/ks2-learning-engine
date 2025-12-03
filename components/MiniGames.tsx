import React, { useState, useEffect, useCallback } from 'react';

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
              onClick={() => setSelectedGame(game.id)}
              className={`bg-gradient-to-r ${game.color} rounded-2xl p-6 text-left hover:scale-[1.02] hover:shadow-2xl transition-all`}
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
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [message, setMessage] = useState('');

  // Comprehensive word list for KS2 level (300+ common words)
  const validWords = new Set([
    // 2-letter words
    'an', 'am', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we',
    // 3-letter words  
    'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all', 'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ash', 'ask', 'ate',
    'bad', 'bag', 'ban', 'bar', 'bat', 'bay', 'bed', 'bee', 'beg', 'bet', 'big', 'bin', 'bit', 'bow', 'box', 'boy', 'bud', 'bug', 'bus', 'but', 'buy',
    'cab', 'can', 'cap', 'car', 'cat', 'cod', 'cog', 'cop', 'cot', 'cow', 'cry', 'cub', 'cup', 'cut',
    'dad', 'dam', 'day', 'den', 'dew', 'did', 'die', 'dig', 'dim', 'dip', 'dog', 'dot', 'dry', 'dug', 'dye',
    'ear', 'eat', 'egg', 'elf', 'elk', 'elm', 'end', 'era', 'eve', 'eye',
    'fad', 'fan', 'far', 'fat', 'fax', 'fed', 'fee', 'few', 'fig', 'fin', 'fir', 'fit', 'fix', 'fly', 'foe', 'fog', 'for', 'fox', 'fry', 'fun', 'fur',
    'gag', 'gap', 'gas', 'gel', 'gem', 'get', 'gin', 'got', 'gum', 'gun', 'gut', 'guy', 'gym',
    'had', 'ham', 'has', 'hat', 'hay', 'hen', 'her', 'hid', 'him', 'hip', 'his', 'hit', 'hob', 'hog', 'hop', 'hot', 'how', 'hub', 'hue', 'hug', 'hum', 'hut',
    'ice', 'icy', 'ill', 'imp', 'ink', 'inn', 'ion', 'its', 'ivy',
    'jab', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jig', 'job', 'jog', 'jot', 'joy', 'jug', 'jut',
    'keg', 'ken', 'key', 'kid', 'kin', 'kit',
    'lab', 'lad', 'lag', 'lap', 'law', 'lay', 'led', 'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'log', 'lot', 'low', 'lug',
    'mad', 'man', 'map', 'mat', 'may', 'men', 'met', 'mid', 'mix', 'mob', 'mop', 'mud', 'mug', 'mum',
    'nab', 'nag', 'nap', 'net', 'new', 'nil', 'nip', 'nit', 'nod', 'nor', 'not', 'now', 'nun', 'nut',
    'oak', 'oar', 'oat', 'odd', 'off', 'oil', 'old', 'one', 'opt', 'orb', 'ore', 'our', 'out', 'owe', 'owl', 'own',
    'pad', 'pal', 'pan', 'pat', 'paw', 'pay', 'pea', 'peg', 'pen', 'pep', 'per', 'pet', 'pie', 'pig', 'pin', 'pit', 'ply', 'pod', 'pop', 'pot', 'pro', 'pry', 'pub', 'pug', 'pun', 'pup', 'pus', 'put',
    'rag', 'ram', 'ran', 'rap', 'rat', 'raw', 'ray', 'red', 'ref', 'rep', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob', 'rod', 'rot', 'row', 'rub', 'rug', 'run', 'rut', 'rye',
    'sac', 'sad', 'sag', 'sap', 'sat', 'saw', 'say', 'sea', 'set', 'sew', 'she', 'shy', 'sin', 'sip', 'sir', 'sis', 'sit', 'six', 'ski', 'sky', 'sly', 'sob', 'sod', 'son', 'sop', 'sot', 'sow', 'soy', 'spa', 'spy', 'sty', 'sub', 'sue', 'sum', 'sun', 'sup',
    'tab', 'tad', 'tag', 'tan', 'tap', 'tar', 'tax', 'tea', 'ten', 'the', 'thy', 'tic', 'tie', 'tin', 'tip', 'toe', 'ton', 'too', 'top', 'tot', 'tow', 'toy', 'try', 'tub', 'tug', 'two',
    'urn', 'use',
    'van', 'vat', 'vet', 'vie', 'vim', 'vow',
    'wad', 'wag', 'war', 'was', 'wax', 'way', 'web', 'wed', 'wee', 'wet', 'who', 'why', 'wig', 'win', 'wit', 'woe', 'wok', 'won', 'woo', 'wow',
    'yak', 'yam', 'yap', 'yaw', 'yea', 'yes', 'yet', 'yew', 'yin', 'you', 'yow',
    'zap', 'zed', 'zee', 'zen', 'zig', 'zip', 'zit', 'zoo',
    // 4-letter words
    'able', 'ache', 'acid', 'aged', 'aide', 'also', 'area', 'army', 'arts', 'away', 'baby', 'back', 'bake', 'bald', 'ball', 'band', 'bank', 'bare', 'bark', 'barn', 'base', 'bath', 'bead', 'beak', 'beam', 'bean', 'bear', 'beat', 'been', 'beef', 'beer', 'bell', 'belt', 'bend', 'bent', 'best', 'bike', 'bill', 'bind', 'bird', 'bite', 'blow', 'blue', 'boat', 'body', 'boil', 'bold', 'bolt', 'bomb', 'bond', 'bone', 'book', 'boom', 'boot', 'born', 'boss', 'both', 'bowl', 'boys', 'bulk', 'bull', 'burn', 'bury', 'bush', 'busy', 'cafe', 'cage', 'cake', 'calf', 'call', 'calm', 'came', 'camp', 'cape', 'card', 'care', 'cart', 'case', 'cash', 'cast', 'cave', 'cell', 'chat', 'chef', 'chin', 'chip', 'chop', 'city', 'clam', 'clap', 'claw', 'clay', 'clip', 'club', 'clue', 'coal', 'coat', 'code', 'coil', 'coin', 'cold', 'come', 'cook', 'cool', 'cope', 'copy', 'cord', 'core', 'corn', 'cost', 'cozy', 'crab', 'crew', 'crop', 'crow', 'cube', 'cure', 'curl', 'cute', 'damp', 'dare', 'dark', 'dart', 'dash', 'data', 'date', 'dawn', 'days', 'dead', 'deaf', 'deal', 'dean', 'dear', 'debt', 'deck', 'deed', 'deep', 'deer', 'demo', 'dent', 'deny', 'desk', 'dial', 'dice', 'diet', 'dirt', 'disc', 'dish', 'disk', 'dive', 'dock', 'does', 'doll', 'dome', 'done', 'door', 'dose', 'down', 'drag', 'draw', 'drew', 'drip', 'drop', 'drug', 'drum', 'dual', 'duck', 'dull', 'dumb', 'dump', 'dust', 'duty', 'each', 'earn', 'ears', 'ease', 'east', 'easy', 'edge', 'edit', 'else', 'emit', 'ends', 'envy', 'epic', 'euro', 'even', 'ever', 'evil', 'exam', 'exit', 'expo', 'eyes', 'face', 'fact', 'fade', 'fail', 'fair', 'fake', 'fall', 'fame', 'fans', 'fare', 'farm', 'fast', 'fate', 'fear', 'feat', 'feed', 'feel', 'fees', 'feet', 'fell', 'felt', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish', 'fist', 'five', 'flag', 'flap', 'flat', 'flaw', 'fled', 'flew', 'flex', 'flip', 'flow', 'foam', 'fold', 'folk', 'fond', 'font', 'food', 'fool', 'foot', 'ford', 'fork', 'form', 'fort', 'four', 'free', 'frog', 'from', 'fuel', 'full', 'fund', 'game', 'gang', 'gate', 'gave', 'gaze', 'gear', 'gene', 'gets', 'gift', 'girl', 'give', 'glad', 'glow', 'glue', 'goal', 'goat', 'goes', 'gold', 'golf', 'gone', 'good', 'gown', 'grab', 'grad', 'gram', 'gray', 'grew', 'grey', 'grid', 'grin', 'grip', 'grow', 'gulf', 'guru', 'guys', 'hack', 'hail', 'hair', 'half', 'hall', 'halt', 'hand', 'hang', 'hard', 'harm', 'hate', 'haul', 'have', 'hawk', 'head', 'heal', 'heap', 'hear', 'heat', 'heel', 'held', 'hell', 'help', 'herb', 'herd', 'here', 'hero', 'hide', 'high', 'hike', 'hill', 'hint', 'hire', 'hold', 'hole', 'holy', 'home', 'hood', 'hook', 'hope', 'horn', 'host', 'hour', 'huge', 'hulk', 'hull', 'hung', 'hunt', 'hurt', 'icon', 'idea', 'idle', 'inch', 'info', 'into', 'iron', 'isle', 'item', 'jack', 'jail', 'jams', 'jane', 'jazz', 'jean', 'jeep', 'jerk', 'jobs', 'joey', 'john', 'join', 'joke', 'jolt', 'jose', 'josh', 'judy', 'jump', 'june', 'junk', 'jury', 'just', 'kate', 'keen', 'keep', 'kept', 'keys', 'kick', 'kids', 'kill', 'kind', 'king', 'kiss', 'kite', 'knee', 'knew', 'knit', 'knob', 'knot', 'know', 'labs', 'lack', 'lady', 'laid', 'lake', 'lamb', 'lamp', 'land', 'lane', 'laps', 'last', 'late', 'lawn', 'laws', 'lead', 'leaf', 'lean', 'leap', 'left', 'lend', 'lens', 'less', 'liar', 'lick', 'lids', 'lies', 'life', 'lift', 'like', 'limb', 'lime', 'limp', 'line', 'link', 'lion', 'lips', 'list', 'live', 'load', 'loaf', 'loan', 'lock', 'logo', 'logs', 'lone', 'long', 'look', 'loop', 'lord', 'lose', 'loss', 'lost', 'lots', 'loud', 'love', 'luck', 'lump', 'lung', 'lure', 'lurk', 'made', 'mail', 'main', 'make', 'male', 'mall', 'many', 'maps', 'mark', 'mars', 'mask', 'mass', 'mate', 'math', 'maze', 'meal', 'mean', 'meat', 'meek', 'meet', 'melt', 'memo', 'menu', 'mere', 'mesh', 'mess', 'mice', 'mild', 'mile', 'milk', 'mill', 'mind', 'mine', 'mint', 'miss', 'mist', 'mode', 'mold', 'mole', 'monk', 'mood', 'moon', 'more', 'moss', 'most', 'moth', 'move', 'much', 'mule', 'must', 'myth', 'nail', 'name', 'navy', 'near', 'neat', 'neck', 'need', 'nest', 'nets', 'news', 'next', 'nice', 'nick', 'nine', 'node', 'none', 'noon', 'norm', 'nose', 'note', 'noun', 'nude', 'numb', 'nuts', 'odds', 'oils', 'okay', 'once', 'ones', 'only', 'onto', 'open', 'oral', 'ours', 'oven', 'over', 'owed', 'owes', 'owns', 'pace', 'pack', 'page', 'paid', 'pain', 'pair', 'pale', 'palm', 'pans', 'park', 'part', 'pass', 'past', 'path', 'pave', 'peak', 'pear', 'peas', 'peel', 'peer', 'pens', 'perk', 'perm', 'pest', 'pets', 'pick', 'pier', 'pigs', 'pike', 'pile', 'pill', 'pine', 'pink', 'pins', 'pint', 'pipe', 'pits', 'pity', 'plan', 'play', 'plea', 'plow', 'ploy', 'plug', 'plum', 'plus', 'pods', 'poem', 'poet', 'pole', 'poll', 'polo', 'pond', 'pony', 'pool', 'poor', 'pope', 'pops', 'pork', 'port', 'pose', 'post', 'pots', 'pour', 'pray', 'prep', 'prey', 'prod', 'prop', 'pubs', 'pull', 'pulp', 'pump', 'punk', 'pure', 'push', 'quit', 'quiz', 'race', 'rack', 'rage', 'raid', 'rail', 'rain', 'ramp', 'rang', 'rank', 'rare', 'rash', 'rate', 'rats', 'rays', 'read', 'real', 'rear', 'reed', 'reef', 'reel', 'rely', 'rent', 'rest', 'ribs', 'rice', 'rich', 'ride', 'rift', 'ring', 'riot', 'rise', 'risk', 'road', 'roam', 'roar', 'robe', 'rock', 'rode', 'role', 'roll', 'roof', 'room', 'root', 'rope', 'rose', 'rows', 'rude', 'rugs', 'ruin', 'rule', 'runs', 'rush', 'rust', 'sack', 'safe', 'sage', 'said', 'sail', 'sake', 'sale', 'salt', 'same', 'sand', 'sane', 'sang', 'sank', 'save', 'says', 'scan', 'seal', 'seam', 'seas', 'seat', 'seed', 'seek', 'seem', 'seen', 'sees', 'self', 'sell', 'semi', 'send', 'sent', 'sets', 'shed', 'ship', 'shop', 'shot', 'show', 'shut', 'sick', 'side', 'sigh', 'sign', 'silk', 'sing', 'sink', 'site', 'sits', 'size', 'skin', 'skip', 'slab', 'slam', 'slap', 'sled', 'slew', 'slid', 'slim', 'slip', 'slit', 'slot', 'slow', 'slug', 'slum', 'snap', 'snow', 'soak', 'soap', 'soar', 'sock', 'soda', 'sofa', 'soft', 'soil', 'sold', 'sole', 'solo', 'some', 'song', 'sons', 'soon', 'sore', 'sort', 'soul', 'soup', 'sour', 'span', 'spar', 'spec', 'sped', 'spin', 'spit', 'spot', 'star', 'stay', 'stem', 'step', 'stew', 'stir', 'stop', 'stud', 'such', 'suck', 'sued', 'suit', 'sung', 'sunk', 'sure', 'surf', 'swap', 'swim', 'tabs', 'tack', 'tags', 'tail', 'take', 'tale', 'talk', 'tall', 'tame', 'tank', 'tape', 'taps', 'tart', 'task', 'team', 'tear', 'teas', 'tech', 'teen', 'tell', 'temp', 'tend', 'tens', 'tent', 'term', 'test', 'text', 'than', 'that', 'them', 'then', 'they', 'thin', 'this', 'thus', 'tick', 'tide', 'tidy', 'tied', 'tier', 'ties', 'tile', 'till', 'tilt', 'time', 'tint', 'tiny', 'tips', 'tire', 'toad', 'toes', 'toil', 'told', 'toll', 'tomb', 'tone', 'tons', 'tony', 'took', 'tool', 'tops', 'tore', 'torn', 'toss', 'tour', 'town', 'toys', 'trap', 'tray', 'tree', 'trek', 'trim', 'trio', 'trip', 'trot', 'true', 'tube', 'tuck', 'tugs', 'tune', 'turf', 'turn', 'twin', 'twit', 'type', 'ugly', 'undo', 'unit', 'unto', 'upon', 'urge', 'used', 'user', 'uses', 'vale', 'vase', 'vast', 'veil', 'vein', 'vent', 'verb', 'very', 'vest', 'veto', 'vibe', 'vice', 'view', 'vile', 'vine', 'visa', 'void', 'volt', 'vote', 'wade', 'wage', 'wail', 'wait', 'wake', 'walk', 'wall', 'wand', 'want', 'ward', 'warm', 'warn', 'warp', 'wars', 'wary', 'wash', 'wasp', 'wave', 'wavy', 'waxy', 'ways', 'weak', 'wear', 'weed', 'week', 'weep', 'weld', 'well', 'went', 'were', 'west', 'what', 'when', 'whim', 'whip', 'whom', 'wick', 'wide', 'wife', 'wild', 'will', 'wilt', 'wimp', 'wind', 'wine', 'wing', 'wink', 'wins', 'wipe', 'wire', 'wise', 'wish', 'with', 'woke', 'wolf', 'womb', 'wont', 'wood', 'wool', 'word', 'wore', 'work', 'worm', 'worn', 'wrap', 'wren', 'yard', 'yarn', 'yawn', 'year', 'yell', 'yoga', 'yoke', 'your', 'zeal', 'zero', 'zest', 'zinc', 'zone', 'zoom',
    // 5-letter words
    'about', 'above', 'abuse', 'actor', 'adapt', 'added', 'admit', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien', 'align', 'alike', 'alive', 'alley', 'allow', 'alone', 'along', 'alpha', 'alter', 'among', 'angel', 'anger', 'angle', 'angry', 'ankle', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'armor', 'arose', 'array', 'arrow', 'Asian', 'aside', 'asset', 'avoid', 'awake', 'award', 'aware', 'awful', 'bacon', 'badge', 'badly', 'basic', 'basin', 'basis', 'batch', 'beach', 'beard', 'beast', 'began', 'begin', 'being', 'belly', 'below', 'bench', 'berry', 'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze', 'bleed', 'blend', 'bless', 'blind', 'blink', 'block', 'blond', 'blood', 'bloom', 'blown', 'blues', 'blunt', 'blush', 'board', 'boast', 'bonus', 'booth', 'bound', 'brain', 'brake', 'brand', 'brass', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief', 'bring', 'broad', 'broke', 'brook', 'broom', 'brown', 'brush', 'build', 'built', 'bunch', 'burst', 'buyer', 'cabin', 'cable', 'camel', 'candy', 'cargo', 'carry', 'carve', 'catch', 'cause', 'cease', 'chain', 'chair', 'chalk', 'champ', 'chant', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'cheat', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chick', 'chief', 'child', 'chill', 'china', 'chips', 'choir', 'chord', 'chose', 'chunk', 'civic', 'civil', 'claim', 'clamp', 'clash', 'clasp', 'class', 'clean', 'clear', 'clerk', 'click', 'cliff', 'climb', 'cling', 'cloak', 'clock', 'clone', 'close', 'cloth', 'cloud', 'clown', 'coach', 'coast', 'cobra', 'colon', 'color', 'comet', 'coral', 'couch', 'cough', 'could', 'count', 'court', 'cover', 'crack', 'craft', 'crane', 'crash', 'crawl', 'craze', 'crazy', 'cream', 'creek', 'creep', 'crest', 'crime', 'crisp', 'cross', 'crowd', 'crown', 'crude', 'cruel', 'crush', 'curve', 'cycle', 'daily', 'dairy', 'dance', 'dandy', 'dealt', 'death', 'debut', 'decay', 'decor', 'decoy', 'delay', 'delta', 'demon', 'dense', 'depot', 'depth', 'derby', 'desk', 'devil', 'diary', 'dirty', 'disco', 'ditch', 'dodge', 'doing', 'doubt', 'dough', 'dozen', 'draft', 'drain', 'drake', 'drama', 'drank', 'drape', 'drawn', 'dread', 'dream', 'dress', 'dried', 'drift', 'drill', 'drink', 'drive', 'droit', 'drown', 'drunk', 'dwell', 'dying', 'eager', 'eagle', 'early', 'earth', 'eaten', 'eight', 'elder', 'elect', 'elite', 'empty', 'ended', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'equip', 'erase', 'error', 'essay', 'ethic', 'event', 'every', 'exact', 'excel', 'exist', 'extra', 'fable', 'faced', 'facts', 'faint', 'fairy', 'faith', 'false', 'fancy', 'farce', 'fatal', 'fatty', 'fault', 'feast', 'fence', 'ferry', 'fetch', 'fever', 'fewer', 'fiber', 'field', 'fiery', 'fifth', 'fifty', 'fight', 'final', 'finch', 'first', 'fixed', 'flags', 'flame', 'flank', 'flare', 'flash', 'flask', 'fleet', 'flesh', 'float', 'flock', 'flood', 'floor', 'flour', 'flown', 'fluid', 'fluke', 'flung', 'flush', 'focus', 'foggy', 'folks', 'force', 'forge', 'forth', 'forty', 'forum', 'fossil', 'found', 'frame', 'frank', 'fraud', 'freak', 'freed', 'fresh', 'fried', 'fries', 'front', 'frost', 'fruit', 'fully', 'funny', 'fungi', 'gains', 'games', 'gamma', 'gases', 'gauge', 'gaunt', 'gavel', 'genes', 'genre', 'ghost', 'giant', 'given', 'gives', 'gland', 'glare', 'glass', 'gleam', 'glide', 'glint', 'globe', 'gloom', 'glory', 'gloss', 'glove', 'gnome', 'godly', 'going', 'grace', 'grade', 'grain', 'grand', 'grant', 'grape', 'graph', 'grasp', 'grass', 'grave', 'gravy', 'graze', 'great', 'greed', 'greek', 'green', 'greet', 'grief', 'grill', 'grind', 'groan', 'groom', 'gross', 'group', 'grove', 'growl', 'grown', 'guard', 'guess', 'guest', 'guide', 'guild', 'guilt', 'guise', 'gulch', 'gummy', 'habit', 'hairy', 'hands', 'handy', 'happy', 'hardy', 'harsh', 'haste', 'hasty', 'hatch', 'haven', 'havoc', 'heads', 'heard', 'heart', 'heavy', 'hedge', 'heels', 'hello', 'hence', 'herbs', 'hills', 'hinge', 'hippy', 'hitch', 'hobby', 'holly', 'honey', 'honor', 'hoped', 'hopes', 'horse', 'hotel', 'hound', 'hours', 'house', 'hover', 'human', 'humid', 'humor', 'hurry', 'ideal', 'ideas', 'image', 'imply', 'inbox', 'incur', 'index', 'indie', 'inner', 'input', 'intel', 'inter', 'intro', 'irate', 'irony', 'issue', 'items', 'ivory', 'japan', 'jelly', 'jewel', 'jimmy', 'joint', 'jolly', 'joust', 'judge', 'juice', 'juicy', 'jumbo', 'jumpy', 'junky', 'kayak', 'kebab', 'keeps', 'keyed', 'kills', 'kinds', 'kings', 'knife', 'knock', 'known', 'knows', 'label', 'labor', 'lacks', 'large', 'laser', 'latch', 'later', 'laugh', 'layer', 'leads', 'learn', 'lease', 'least', 'leave', 'ledge', 'legal', 'lemon', 'level', 'lever', 'light', 'liked', 'likes', 'limbs', 'limit', 'lined', 'linen', 'liner', 'lines', 'links', 'lions', 'lists', 'liter', 'lived', 'liver', 'lives', 'llama', 'lobby', 'local', 'lodge', 'logic', 'logos', 'lonely', 'looks', 'loops', 'loose', 'lords', 'loses', 'lotus', 'loved', 'lover', 'loves', 'lower', 'loyal', 'lucky', 'lucid', 'lunar', 'lunch', 'lying', 'lyric', 'macho', 'macro', 'magic', 'magma', 'major', 'maker', 'makes', 'manga', 'mango', 'mania', 'manor', 'maple', 'march', 'marks', 'marsh', 'mason', 'match', 'maybe', 'mayor', 'meals', 'means', 'meant', 'meats', 'medal', 'media', 'meets', 'melon', 'mercy', 'merge', 'merit', 'merry', 'messy', 'metal', 'meter', 'midst', 'might', 'mimic', 'minds', 'miner', 'mines', 'minor', 'minus', 'mirth', 'misty', 'mixed', 'mixer', 'model', 'modem', 'modes', 'moist', 'molar', 'mommy', 'money', 'month', 'moose', 'moral', 'motif', 'motor', 'motto', 'mould', 'mound', 'mount', 'mourn', 'mouse', 'mouth', 'moved', 'mover', 'moves', 'movie', 'muddy', 'mural', 'music', 'musty', 'naive', 'named', 'names', 'nanny', 'nasal', 'nasty', 'naval', 'navel', 'needs', 'nerve', 'never', 'newer', 'newly', 'night', 'ninth', 'noble', 'nodes', 'noise', 'noisy', 'north', 'notch', 'noted', 'notes', 'novel', 'nurse', 'occur', 'ocean', 'oddly', 'offer', 'often', 'olive', 'omega', 'onset', 'opens', 'opera', 'opted', 'optic', 'orbit', 'order', 'other', 'ought', 'ounce', 'outer', 'outgo', 'overt', 'owned', 'owner', 'oxide', 'ozone', 'paced', 'paces', 'packs', 'pagan', 'pages', 'pains', 'paint', 'pairs', 'panda', 'panel', 'panic', 'pants', 'paper', 'parks', 'parts', 'party', 'pasta', 'paste', 'pasty', 'patch', 'patio', 'pause', 'peace', 'peach', 'peaks', 'pearl', 'pears', 'pedal', 'penny', 'perch', 'peril', 'perky', 'petal', 'petty', 'phase', 'phone', 'photo', 'piano', 'picks', 'piece', 'piety', 'piggy', 'pilot', 'pinch', 'pines', 'pitch', 'pivot', 'pixel', 'pizza', 'place', 'plaid', 'plain', 'plane', 'plank', 'plans', 'plant', 'plate', 'plaza', 'plead', 'pleat', 'pledge', 'pliers', 'plots', 'pluck', 'plumb', 'plump', 'plums', 'plunk', 'plush', 'poems', 'poets', 'point', 'poise', 'polar', 'poles', 'polka', 'polls', 'ponds', 'pools', 'poppy', 'porch', 'pores', 'ports', 'posed', 'poser', 'poses', 'posts', 'pouch', 'pound', 'pours', 'power', 'praie', 'prank', 'prawn', 'prays', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prism', 'prize', 'probe', 'promo', 'prone', 'proof', 'props', 'prose', 'proud', 'prove', 'prune', 'psalm', 'pulls', 'pulse', 'punch', 'pupil', 'puppy', 'purge', 'purse', 'quack', 'quake', 'qualm', 'quart', 'queen', 'query', 'quest', 'queue', 'quick', 'quiet', 'quilt', 'quirk', 'quota', 'quote', 'radar', 'radio', 'rainy', 'raise', 'rally', 'ranch', 'range', 'ranks', 'rapid', 'rated', 'rates', 'ratio', 'razor', 'reach', 'react', 'reads', 'ready', 'realm', 'reams', 'rebel', 'recap', 'refer', 'reign', 'relax', 'relay', 'relic', 'rely', 'remit', 'renal', 'renew', 'repay', 'repel', 'reply', 'reset', 'resin', 'retro', 'rider', 'rides', 'ridge', 'rifle', 'right', 'rigid', 'rings', 'rinse', 'riots', 'ripen', 'risen', 'rises', 'risks', 'risky', 'ritzy', 'rival', 'river', 'roads', 'roast', 'robed', 'robot', 'rocks', 'rocky', 'rogue', 'roles', 'rolls', 'roman', 'rooms', 'roots', 'ropes', 'roses', 'rotor', 'rouge', 'rough', 'round', 'route', 'royal', 'rugby', 'ruins', 'ruled', 'ruler', 'rules', 'rural', 'rusty', 'sadly', 'safer', 'saint', 'salad', 'sales', 'salon', 'salsa', 'salty', 'sands', 'sandy', 'sauce', 'saved', 'saver', 'saves', 'scale', 'scalp', 'scant', 'scare', 'scarf', 'scary', 'scene', 'scent', 'scope', 'score', 'scout', 'scrap', 'screw', 'seals', 'seams', 'seats', 'seeds', 'seeks', 'seems', 'seize', 'sells', 'sends', 'sense', 'serum', 'serve', 'setup', 'seven', 'sever', 'shade', 'shady', 'shaft', 'shake', 'shaky', 'shall', 'shame', 'shape', 'share', 'shark', 'sharp', 'shave', 'sheep', 'sheer', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shiny', 'ships', 'shire', 'shirt', 'shock', 'shoes', 'shone', 'shook', 'shoot', 'shops', 'shore', 'short', 'shots', 'shout', 'shove', 'shown', 'shows', 'shred', 'shrub', 'shrug', 'sides', 'siege', 'sight', 'sigma', 'signs', 'silly', 'since', 'sinks', 'sites', 'sixth', 'sixty', 'sized', 'sizes', 'skate', 'skill', 'skimp', 'skins', 'skirt', 'skull', 'slabs', 'slack', 'slain', 'slang', 'slant', 'slash', 'slate', 'slave', 'sleek', 'sleep', 'slept', 'slice', 'slide', 'slime', 'slimy', 'sling', 'slope', 'sloth', 'slots', 'slows', 'slump', 'slush', 'small', 'smart', 'smash', 'smell', 'smile', 'smirk', 'smoke', 'smoky', 'snack', 'snail', 'snake', 'snare', 'snarl', 'sneak', 'sniff', 'snore', 'snort', 'snout', 'snowy', 'soapy', 'soars', 'sober', 'socks', 'sofas', 'solar', 'solid', 'solve', 'songs', 'sonic', 'sorry', 'sorts', 'souls', 'sound', 'soups', 'south', 'space', 'spade', 'spare', 'spark', 'spasm', 'spawn', 'speak', 'spear', 'specs', 'speed', 'spell', 'spend', 'spent', 'spice', 'spicy', 'spill', 'spine', 'spiral', 'spite', 'split', 'spoke', 'spoof', 'spoon', 'sport', 'spots', 'spray', 'spree', 'squad', 'stack', 'staff', 'stage', 'stain', 'stair', 'stake', 'stale', 'stall', 'stamp', 'stand', 'stare', 'stark', 'stars', 'start', 'stash', 'state', 'stays', 'steak', 'steal', 'steam', 'steel', 'steep', 'steer', 'stems', 'steps', 'stern', 'stick', 'stiff', 'still', 'sting', 'stink', 'stint', 'stock', 'stoic', 'stole', 'stomp', 'stone', 'stony', 'stood', 'stool', 'stoop', 'stops', 'store', 'stork', 'storm', 'story', 'stout', 'stove', 'strap', 'straw', 'stray', 'strip', 'strum', 'strut', 'stuck', 'study', 'stuff', 'stump', 'stung', 'stunk', 'stunt', 'style', 'suave', 'sugar', 'suite', 'suits', 'sunny', 'super', 'surge', 'sushi', 'swamp', 'swarm', 'swear', 'sweat', 'sweep', 'sweet', 'swept', 'swift', 'swing', 'swipe', 'swirl', 'swiss', 'sword', 'swore', 'sworn', 'swung', 'syrup', 'table', 'taboo', 'tacky', 'tacos', 'tails', 'taken', 'takes', 'tales', 'talks', 'tally', 'tango', 'tanks', 'tapes', 'tasks', 'taste', 'tasty', 'taxes', 'teach', 'teams', 'tears', 'teens', 'teeth', 'tempo', 'tends', 'tense', 'tenth', 'tents', 'terms', 'tests', 'texts', 'thank', 'theft', 'theme', 'thick', 'thief', 'thigh', 'thing', 'think', 'third', 'thorn', 'those', 'three', 'threw', 'throw', 'thumb', 'thump', 'tidal', 'tides', 'tiger', 'tight', 'tiles', 'tilts', 'timer', 'times', 'timid', 'tired', 'tires', 'title', 'toast', 'today', 'token', 'tonal', 'toned', 'tones', 'tonic', 'tools', 'tooth', 'topic', 'torch', 'torso', 'total', 'totem', 'touch', 'tough', 'tours', 'towel', 'tower', 'towns', 'toxic', 'trace', 'track', 'tract', 'trade', 'trail', 'train', 'trait', 'tramp', 'traps', 'trash', 'trawl', 'tread', 'treat', 'trees', 'trend', 'trial', 'tribe', 'trick', 'tried', 'tries', 'trims', 'trips', 'trite', 'troll', 'troop', 'trout', 'truce', 'truck', 'truly', 'trump', 'trunk', 'trust', 'truth', 'tubes', 'tulip', 'tumor', 'tuned', 'tunes', 'tunic', 'turbo', 'turns', 'tutor', 'tweak', 'tweed', 'tweet', 'twice', 'twigs', 'twine', 'twins', 'twirl', 'twist', 'tying', 'types', 'ultra', 'uncle', 'under', 'undue', 'unfed', 'unfit', 'unify', 'union', 'unite', 'units', 'unity', 'until', 'unwed', 'upper', 'upset', 'urban', 'urged', 'urges', 'usage', 'users', 'using', 'usual', 'utter', 'vague', 'valid', 'valor', 'value', 'valve', 'vapor', 'vault', 'vegan', 'veins', 'velvet', 'venue', 'verbs', 'verse', 'video', 'views', 'vigor', 'villa', 'vines', 'vinyl', 'viola', 'viral', 'virus', 'visit', 'visor', 'vista', 'vital', 'vivid', 'vocal', 'vodka', 'vogue', 'voice', 'vomit', 'voted', 'voter', 'votes', 'vouch', 'vowel', 'wacky', 'waged', 'wager', 'wages', 'wagon', 'waist', 'waits', 'waked', 'waken', 'wakes', 'walks', 'walls', 'waltz', 'wands', 'wants', 'wards', 'wares', 'warns', 'warps', 'waste', 'watch', 'water', 'waved', 'waver', 'waves', 'weary', 'weave', 'wedge', 'weeds', 'weeks', 'weigh', 'weird', 'wells', 'welsh', 'whale', 'wharf', 'wheat', 'wheel', 'where', 'which', 'while', 'whine', 'whirl', 'whisk', 'white', 'whole', 'whose', 'widen', 'wider', 'width', 'wield', 'wills', 'winds', 'windy', 'wines', 'wings', 'winks', 'wiped', 'wiper', 'wipes', 'wired', 'wires', 'witch', 'witty', 'wives', 'woken', 'woman', 'women', 'woods', 'woody', 'words', 'wordy', 'works', 'world', 'worms', 'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'woven', 'wraps', 'wrath', 'wreak', 'wreck', 'wring', 'wrist', 'write', 'wrong', 'wrote', 'yacht', 'yards', 'years', 'yeast', 'yield', 'young', 'yours', 'youth', 'yummy', 'zebra', 'zesty', 'zones',
  ]);

  // Check if word can be made from available letters
  const canMakeWord = (word: string, availableLetters: string[]): boolean => {
    const letterPool = [...availableLetters.map(l => l.toLowerCase())];
    for (const char of word.toLowerCase()) {
      const index = letterPool.indexOf(char);
      if (index === -1) return false;
      letterPool.splice(index, 1);
    }
    return true;
  };

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      const vowels = 'AEIOU';
      const commonConsonants = 'RSTLNBCDFGHMPWY'; // More common consonants for better words
      const newLetters: string[] = [];
      
      // Ensure at least 3 vowels for better word possibilities
      for (let i = 0; i < 3; i++) {
        newLetters.push(vowels[Math.floor(Math.random() * vowels.length)]);
      }
      // Add common consonants
      for (let i = 0; i < 4; i++) {
        newLetters.push(commonConsonants[Math.floor(Math.random() * commonConsonants.length)]);
      }
      
      setLetters(newLetters.sort(() => Math.random() - 0.5));
      setFoundWords([]);
      setCurrentWord('');
      setUsedIndices([]);
      setTimeLeft(90); // More time
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
    if (usedIndices.includes(index)) return; // Don't allow reusing same letter tile
    if (currentWord.length < 7) {
      setCurrentWord(prev => prev + letter);
      setUsedIndices(prev => [...prev, index]);
    }
  };

  const handleClear = () => {
    setCurrentWord('');
    setUsedIndices([]);
  };

  const handleBackspace = () => {
    if (currentWord.length > 0) {
      setCurrentWord(prev => prev.slice(0, -1));
      setUsedIndices(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    const word = currentWord.toLowerCase();
    
    if (word.length < 2) {
      setMessage('Word too short! (min 2 letters)');
      setTimeout(() => setMessage(''), 1500);
      setCurrentWord('');
      setUsedIndices([]);
      return;
    }

    if (foundWords.includes(word)) {
      setMessage('Already found!');
      setTimeout(() => setMessage(''), 1500);
      setCurrentWord('');
      setUsedIndices([]);
      return;
    }

    // Check if word is in dictionary
    if (validWords.has(word)) {
      const points = word.length * 10 + (word.length >= 4 ? 10 : 0) + (word.length >= 5 ? 15 : 0);
      setFoundWords(prev => [...prev, word]);
      setGameState(prev => ({ ...prev, score: prev.score + points }));
      setMessage(`✓ "${word.toUpperCase()}" +${points} points!`);
    } else {
      setMessage(`"${word.toUpperCase()}" not in word list`);
    }
    
    setCurrentWord('');
    setUsedIndices([]);
    setTimeout(() => setMessage(''), 1500);
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
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {letters.map((letter, i) => {
          const isUsed = usedIndices.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleLetterClick(letter, i)}
              disabled={isUsed}
              className={`w-12 h-12 rounded-xl font-bold text-xl transition-all ${
                isUsed 
                  ? 'bg-white/30 text-white/50 cursor-not-allowed scale-90' 
                  : 'bg-white text-blue-600 hover:bg-white/90 hover:scale-105'
              }`}
            >
              {letter}
            </button>
          );
        })}
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
          onClick={handleBackspace}
          disabled={currentWord.length === 0}
          className="px-4 py-3 bg-white/20 text-white rounded-xl font-bold disabled:opacity-50"
        >
          ⌫
        </button>
        <button
          onClick={() => { setCurrentWord(''); setUsedIndices([]); }}
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
          {foundWords.length === 0 ? (
            <span className="text-white/40 text-sm">Make words from the letters above!</span>
          ) : (
            foundWords.map((word, i) => (
              <span key={i} className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-sm">
                {word}
              </span>
            ))
          )}
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
  const [gameWords, setGameWords] = useState<{ word: string; hint: string }[]>([]);
  const [totalRounds] = useState(10);

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
    if (userInput.toUpperCase() === currentWord.word) {
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
          onXpEarned?.(score + points);
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

  const startGame = () => {
    const words = shuffleWords();
    setGameWords(words);
    setCurrentWord(words[0]);
    setIsPlaying(true);
    setScore(0);
    setRound(1);
    setUserInput('');
    setFeedback('');
  };

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🐝</div>
        <h2 className="text-3xl font-bold text-white mb-4">Spelling Bee</h2>
        <p className="text-white/80 mb-6">Listen to the word and spell it correctly! {totalRounds} rounds with KS2 words.</p>
        {score > 0 && <p className="text-white mb-4">Final Score: {score}</p>}
        <button
          onClick={startGame}
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
        <span className="text-white font-bold">Round {round}/{totalRounds}</span>
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className="bg-white/20 rounded-xl p-6 mb-4 text-center">
        <button
          onClick={speakWord}
          className="text-6xl mb-4 hover:scale-110 transition-transform"
        >
          🔊
        </button>
        <p className="text-white text-sm mb-1">Click to hear the word</p>
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

const ScienceLabGame: React.FC<{ onExit: () => void; onXpEarned?: (xp: number) => void }> = ({ onExit, onXpEarned }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [experiment, setExperiment] = useState({
    question: 'What happens when you mix baking soda and vinegar?',
    options: ['It fizzes', 'It turns blue', 'Nothing happens', 'It freezes'],
    correct: 0,
  });
  const [round, setRound] = useState(1);
  const [gameQuestions, setGameQuestions] = useState<typeof allQuestions>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [totalRounds] = useState(10);

  // Comprehensive science questions for KS2
  const allQuestions = [
    // Biology - Living Things
    { question: 'What happens when you mix baking soda and vinegar?', options: ['It fizzes and bubbles', 'It turns blue', 'Nothing happens', 'It freezes'], correct: 0 },
    { question: 'What gas do plants produce during photosynthesis?', options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Helium'], correct: 2 },
    { question: 'What is the boiling point of water?', options: ['50°C', '100°C', '150°C', '0°C'], correct: 1 },
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2 },
    { question: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], correct: 2 },
    { question: 'What do plants need to make their own food?', options: ['Just water', 'Sunlight, water and carbon dioxide', 'Only soil', 'Oxygen only'], correct: 1 },
    { question: 'What organ pumps blood around your body?', options: ['Brain', 'Lungs', 'Heart', 'Liver'], correct: 2 },
    { question: 'What type of animal is a frog?', options: ['Mammal', 'Reptile', 'Amphibian', 'Fish'], correct: 2 },
    { question: 'What are baby frogs called?', options: ['Larvae', 'Tadpoles', 'Cubs', 'Fry'], correct: 1 },
    { question: 'What do we call animals that only eat plants?', options: ['Carnivores', 'Herbivores', 'Omnivores', 'Insectivores'], correct: 1 },
    { question: 'What do we call animals that eat both plants and meat?', options: ['Carnivores', 'Herbivores', 'Omnivores', 'Predators'], correct: 2 },
    { question: 'Which part of the plant takes in water?', options: ['Leaves', 'Stem', 'Roots', 'Flower'], correct: 2 },
    { question: 'What do plants release at night?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Water'], correct: 1 },
    { question: 'How many bones does an adult human have?', options: ['106', '156', '206', '256'], correct: 2 },
    { question: 'What is the largest organ in the human body?', options: ['Heart', 'Brain', 'Liver', 'Skin'], correct: 3 },
    
    // Physics - Forces and Energy
    { question: 'What force pulls objects towards the Earth?', options: ['Magnetism', 'Friction', 'Gravity', 'Air resistance'], correct: 2 },
    { question: 'What happens to water when it freezes?', options: ['It shrinks', 'It expands', 'Nothing changes', 'It evaporates'], correct: 1 },
    { question: 'What type of energy does a moving car have?', options: ['Potential energy', 'Kinetic energy', 'Sound energy', 'Light energy'], correct: 1 },
    { question: 'What does a thermometer measure?', options: ['Speed', 'Weight', 'Temperature', 'Length'], correct: 2 },
    { question: 'Which material is a good conductor of electricity?', options: ['Wood', 'Plastic', 'Copper', 'Rubber'], correct: 2 },
    { question: 'What is the freezing point of water?', options: ['10°C', '0°C', '-10°C', '50°C'], correct: 1 },
    { question: 'What force slows down moving objects?', options: ['Gravity', 'Magnetism', 'Friction', 'Push'], correct: 2 },
    { question: 'What type of energy does a stretched rubber band have?', options: ['Kinetic', 'Elastic potential', 'Heat', 'Light'], correct: 1 },
    { question: 'What happens to shadows when the Sun is low?', options: ['They disappear', 'They get shorter', 'They get longer', 'They stay the same'], correct: 2 },
    { question: 'How does sound travel?', options: ['In straight lines', 'Through vibrations', 'Only in air', 'Faster in solids than liquids'], correct: 1 },
    
    // Chemistry - Materials
    { question: 'What are the three states of matter?', options: ['Hot, cold, warm', 'Solid, liquid, gas', 'Hard, soft, medium', 'Heavy, light, medium'], correct: 1 },
    { question: 'What happens to ice when you heat it?', options: ['It stays the same', 'It melts', 'It gets colder', 'It disappears'], correct: 1 },
    { question: 'Which of these is a reversible change?', options: ['Burning paper', 'Melting ice', 'Cooking an egg', 'Rusting iron'], correct: 1 },
    { question: 'What gas makes up most of the air we breathe?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], correct: 2 },
    { question: 'Which material is magnetic?', options: ['Aluminium', 'Copper', 'Iron', 'Gold'], correct: 2 },
    { question: 'What is H2O commonly known as?', options: ['Salt', 'Sugar', 'Water', 'Air'], correct: 2 },
    { question: 'What causes rust on iron?', options: ['Heat', 'Cold', 'Oxygen and water', 'Light'], correct: 2 },
    { question: 'Which of these dissolves in water?', options: ['Sand', 'Salt', 'Chalk', 'Plastic'], correct: 1 },
    { question: 'What do we call a mixture that cannot be separated by filtering?', options: ['Suspension', 'Solution', 'Compound', 'Residue'], correct: 1 },
    { question: 'What is evaporation?', options: ['Solid to liquid', 'Liquid to gas', 'Gas to liquid', 'Solid to gas'], correct: 1 },
    
    // Earth and Space
    { question: 'How long does it take Earth to orbit the Sun?', options: ['24 hours', '7 days', '1 month', '1 year'], correct: 3 },
    { question: 'What causes day and night?', options: ['The Moon moving', 'Earth spinning on its axis', 'The Sun moving', 'Clouds blocking light'], correct: 1 },
    { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correct: 2 },
    { question: 'What is the largest planet in our solar system?', options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'], correct: 2 },
    { question: 'What causes the Moon to shine?', options: ['It makes its own light', 'It reflects sunlight', 'Stars light it up', 'Fire inside it'], correct: 1 },
    { question: 'What are the phases of the Moon caused by?', options: ['Clouds', 'Earth shadow', 'Position relative to Sun', 'Distance from Earth'], correct: 2 },
    { question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correct: 1 },
    { question: 'What is a group of stars that form a pattern called?', options: ['Galaxy', 'Constellation', 'Solar system', 'Asteroid belt'], correct: 1 },
    { question: 'What type of rock is formed from cooled lava?', options: ['Sedimentary', 'Metamorphic', 'Igneous', 'Mineral'], correct: 2 },
    { question: 'What causes earthquakes?', options: ['Wind', 'Moving tectonic plates', 'Volcanoes only', 'Heavy rain'], correct: 1 },
    
    // Light and Sound
    { question: 'What is the speed of light?', options: ['Very slow', 'Faster than sound', 'Same as sound', 'Slower than sound'], correct: 1 },
    { question: 'What do we call the bending of light?', options: ['Reflection', 'Refraction', 'Absorption', 'Diffraction'], correct: 1 },
    { question: 'What colors make up white light?', options: ['Red and blue', 'All colors of the rainbow', 'Black and white', 'Yellow and green'], correct: 1 },
    { question: 'What is an echo?', options: ['A loud sound', 'Sound bouncing back', 'Sound stopping', 'Sound getting quieter'], correct: 1 },
    { question: 'What part of your body detects light?', options: ['Ears', 'Nose', 'Eyes', 'Tongue'], correct: 2 },
    { question: 'What makes a shadow?', options: ['Dark objects', 'Light being blocked', 'Cold air', 'Moving objects'], correct: 1 },
    { question: 'What do we call materials that let light through?', options: ['Opaque', 'Transparent', 'Reflective', 'Dark'], correct: 1 },
    { question: 'What vibrates to make sound in your throat?', options: ['Tongue', 'Teeth', 'Vocal cords', 'Lips'], correct: 2 },
    
    // More Biology
    { question: 'What do lungs help us do?', options: ['Digest food', 'Pump blood', 'Breathe', 'Think'], correct: 2 },
    { question: 'What protects the brain?', options: ['Skin', 'Skull', 'Hair', 'Blood'], correct: 1 },
    { question: 'What type of teeth tear food?', options: ['Molars', 'Incisors', 'Canines', 'Wisdom teeth'], correct: 2 },
    { question: 'How do fish breathe underwater?', options: ['They hold their breath', 'Through gills', 'Through their skin', 'They come up for air'], correct: 1 },
    { question: 'What is the life cycle stage between caterpillar and butterfly?', options: ['Egg', 'Larva', 'Pupa', 'Adult'], correct: 2 },
    { question: 'Which part of blood fights germs?', options: ['Red blood cells', 'White blood cells', 'Plasma', 'Platelets'], correct: 1 },
  ];

  const shuffleQuestions = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalRounds);
  };

  const handleAnswer = (index: number) => {
    const isCorrect = index === experiment.correct;
    if (isCorrect) {
      setScore(prev => prev + 20);
      setFeedback({ correct: true, message: 'Correct! Well done! 🎉' });
    } else {
      setFeedback({ correct: false, message: `Not quite. The answer was: ${experiment.options[experiment.correct]}` });
    }
    
    setTimeout(() => {
      setFeedback(null);
      if (round < totalRounds) {
        setRound(prev => prev + 1);
        setExperiment(gameQuestions[round]);
      } else {
        onXpEarned?.(score + (isCorrect ? 20 : 0));
        setIsPlaying(false);
      }
    }, 1500);
  };

  const startGame = () => {
    const questions = shuffleQuestions();
    setGameQuestions(questions);
    setExperiment(questions[0]);
    setIsPlaying(true);
    setScore(0);
    setRound(1);
    setFeedback(null);
  };

  if (!isPlaying) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4">🧪</div>
        <h2 className="text-3xl font-bold text-white mb-4">Science Lab</h2>
        <p className="text-white/80 mb-6">Test your science knowledge! {totalRounds} questions covering biology, physics, chemistry, and space.</p>
        {score > 0 && <p className="text-white mb-4">Final Score: {score}</p>}
        <button
          onClick={startGame}
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
        <span className="text-white font-bold">Question {round}/{totalRounds}</span>
        <span className="text-white font-bold">Score: {score}</span>
      </div>

      <div className="bg-white/20 rounded-xl p-6 mb-4">
        <p className="text-white font-bold text-lg text-center">{experiment.question}</p>
      </div>

      {feedback && (
        <div className={`rounded-xl p-4 mb-4 text-center ${feedback.correct ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
          <p className="text-white font-bold">{feedback.message}</p>
        </div>
      )}

      <div className="space-y-2">
        {experiment.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !feedback && handleAnswer(i)}
            disabled={feedback !== null}
            className={`w-full py-3 rounded-xl text-white font-medium text-left px-4 transition-all ${
              feedback
                ? i === experiment.correct
                  ? 'bg-green-500'
                  : 'bg-white/10'
                : 'bg-white/20 hover:bg-white/30'
            }`}
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
  const [currentPairs, setCurrentPairs] = useState<{ event: string; date: string }[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

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

  const selectPairs = (diff: 'easy' | 'medium' | 'hard') => {
    const count = diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8;
    
    // Mix from different categories
    const allAvailable = [
      ...allPairs.british,
      ...allPairs.world,
      ...allPairs.ancient.slice(0, 5),
      ...allPairs.people,
    ];
    
    const shuffled = [...allAvailable].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const startGame = (diff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(diff);
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
  };

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
      const pair = currentPairs.find(p => 
        (p.event === card1.content && p.date === card2.content) ||
        (p.event === card2.content && p.date === card1.content)
      );

      setTimeout(() => {
        if (pair) {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards([...newCards]);
          const points = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 30 : 35;
          setScore(prev => prev + points);
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === currentPairs.length) {
              onXpEarned?.(score + points);
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
        
        <div className="space-y-3">
          <button
            onClick={() => startGame('easy')}
            className="w-full px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600"
          >
            Easy (4 pairs)
          </button>
          <button
            onClick={() => startGame('medium')}
            className="w-full px-8 py-4 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600"
          >
            Medium (6 pairs)
          </button>
          <button
            onClick={() => startGame('hard')}
            className="w-full px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600"
          >
            Hard (8 pairs)
          </button>
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
