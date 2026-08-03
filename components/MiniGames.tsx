import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useGameSounds } from '../hooks/useGameSounds';
import {
  GameId,
  GameResult,
  GameSession,
  GameStatus,
  gameService,
} from '../services/gameService';
import { gamesUnlockService } from '../services/gamesUnlockService';

interface MiniGamesProps {
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
  status: GameStatus;
}

interface GameDefinition {
  id: GameId;
  name: string;
  icon: string;
  subject: string;
  description: string;
  learningGoal: string;
  colour: string;
  questions: number;
  needsYearGroup?: boolean;
  needsTable?: boolean;
}

const GAMES: GameDefinition[] = [
  {
    id: 'maths_mission',
    name: 'Maths Mission',
    icon: '🧭',
    subject: 'Maths',
    description: 'Solve real problems using number, fractions, measure and reasoning.',
    learningGoal: 'Explain and apply maths—not just answer quickly.',
    colour: 'from-blue-500 to-indigo-700',
    questions: 10,
    needsYearGroup: true,
  },
  {
    id: 'times_table_sprint',
    name: 'Times Table Sprint',
    icon: '⚡',
    subject: 'Maths',
    description: 'Build fluent multiplication recall with accuracy-first scoring.',
    learningGoal: 'Master one table or practise a mixed 2–12 challenge.',
    colour: 'from-violet-500 to-purple-700',
    questions: 20,
    needsTable: true,
  },
  {
    id: 'spelling_workshop',
    name: 'Spelling Workshop',
    icon: '🐝',
    subject: 'English',
    description: 'Practise statutory KS2 words with British spelling and useful clues.',
    learningGoal: 'Notice spelling patterns, roots and tricky letter groups.',
    colour: 'from-amber-500 to-orange-600',
    questions: 10,
    needsYearGroup: true,
  },
  {
    id: 'science_lab',
    name: 'Science Classification Lab',
    icon: '🔬',
    subject: 'Science',
    description: 'Classify living things, materials, light and electricity evidence.',
    learningGoal: 'Use scientific properties and read an explanation after every answer.',
    colour: 'from-emerald-500 to-teal-700',
    questions: 12,
    needsYearGroup: true,
  },
  {
    id: 'history_detective',
    name: 'History Detective',
    icon: '🔎',
    subject: 'History',
    description: 'Investigate chronology, sources, cause, consequence and significance.',
    learningGoal: 'Think like a historian instead of memorising isolated dates.',
    colour: 'from-rose-500 to-purple-700',
    questions: 10,
  },
];

const gameById = (gameId: GameId) => GAMES.find((game) => game.id === gameId) || GAMES[0];

const MiniGames: React.FC<MiniGamesProps> = ({ onClose, onXpEarned, status }) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [completedResult, setCompletedResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [error, setError] = useState('');
  const [yearGroup, setYearGroup] = useState<'3-4' | '5-6'>('3-4');
  const [table, setTable] = useState<number | 'mixed'>('mixed');

  const updateStatus = useCallback((next: GameStatus) => {
    setCurrentStatus(next);
    gamesUnlockService.setStatus(next);
  }, []);

  useEffect(() => setCurrentStatus(status), [status]);

  useEffect(() => {
    let cancelled = false;
    gameService.getState()
      .then((state) => {
        if (cancelled) return;
        updateStatus(state.status);
        setActiveSession(state.activeSession);
        if (state.activeSession) setSelectedGame(state.activeSession.gameId);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load games.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [updateStatus]);

  const selectedDefinition = selectedGame ? gameById(selectedGame) : null;

  const startGame = async () => {
    if (!selectedDefinition || starting) return;
    setStarting(true);
    setError('');
    try {
      const response = await gameService.startGame(selectedDefinition.id, {
        yearGroup,
        table: selectedDefinition.needsTable ? table : undefined,
      });
      setActiveSession(response.session);
      updateStatus(response.status);
      setCompletedResult(null);
    } catch (reason) {
      const serviceError = reason as Error & { data?: { activeSession?: GameSession; status?: GameStatus } };
      if (serviceError.data?.status) updateStatus(serviceError.data.status);
      if (serviceError.data?.activeSession) {
        setActiveSession(serviceError.data.activeSession);
        setSelectedGame(serviceError.data.activeSession.gameId);
      }
      setError(serviceError.message || 'Unable to start this game.');
    } finally {
      setStarting(false);
    }
  };

  const completeGame = (session: GameSession, result: GameResult, nextStatus: GameStatus) => {
    setActiveSession(session);
    setCompletedResult(result);
    updateStatus(nextStatus);
    onXpEarned?.(result.xpEarned);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && result.stars >= 2) {
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 } });
    }
  };

  const abandonActiveGame = async () => {
    if (!activeSession || abandoning) return;
    if (!window.confirm('End this game? The play has already started and will not be returned.')) return;
    setAbandoning(true);
    setError('');
    try {
      const response = await gameService.abandonGame(activeSession.sessionId);
      updateStatus(response.status);
      setActiveSession(null);
      setSelectedGame(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to end this game.');
    } finally {
      setAbandoning(false);
    }
  };

  if (loading) {
    return (
      <GamesShell onHome={onClose}>
        <div className="max-w-xl mx-auto rounded-2xl bg-white/10 p-10 text-center text-white" role="status">
          Loading your games…
        </div>
      </GamesShell>
    );
  }

  if (selectedDefinition && activeSession?.gameId === selectedDefinition.id && activeSession.status === 'active') {
    return (
      <GamesShell onHome={onClose} onBack={() => setSelectedGame(null)}>
        <GamePlayer
          definition={selectedDefinition}
          session={activeSession}
          onSessionChange={setActiveSession}
          onStatusChange={updateStatus}
          onComplete={completeGame}
          onLeave={() => setSelectedGame(null)}
        />
      </GamesShell>
    );
  }

  if (selectedDefinition && completedResult) {
    return (
      <GamesShell onHome={onClose} onBack={() => { setSelectedGame(null); setCompletedResult(null); }}>
        <GameResultCard
          definition={selectedDefinition}
          result={completedResult}
          highScore={currentStatus.highScores[selectedDefinition.id] || completedResult.score}
          gamesRemaining={currentStatus.gamesRemaining}
          onPlayAgain={() => {
            setActiveSession(null);
            setCompletedResult(null);
          }}
          onGames={() => {
            setSelectedGame(null);
            setActiveSession(null);
            setCompletedResult(null);
          }}
        />
      </GamesShell>
    );
  }

  if (selectedDefinition) {
    return (
      <GamesShell onHome={onClose} onBack={() => { setSelectedGame(null); setError(''); }}>
        <GameIntroduction
          definition={selectedDefinition}
          status={currentStatus}
          yearGroup={yearGroup}
          table={table}
          starting={starting}
          error={error}
          onYearGroup={setYearGroup}
          onTable={setTable}
          onStart={startGame}
        />
      </GamesShell>
    );
  }

  return (
    <GamesShell onHome={onClose}>
      <main className="max-w-4xl mx-auto" id="games-main">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">🎮 Learning Games</h1>
          <p className="text-white/75">Every game teaches a KS2 skill and explains the answers.</p>
        </div>

        <GameCreditPanel status={currentStatus} />

        {activeSession?.status === 'active' && (
          <section className="mb-5 rounded-2xl border-2 border-yellow-300 bg-yellow-300/15 p-4 text-white" aria-label="Saved game">
            <p className="font-bold">{gameById(activeSession.gameId).name} is saved</p>
            <p className="text-sm text-white/75">Question {activeSession.currentIndex + 1} of {activeSession.totalQuestions}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={() => setSelectedGame(activeSession.gameId)} className="rounded-lg bg-yellow-300 px-4 py-2 font-bold text-slate-900 focus-visible:ring-4 focus-visible:ring-yellow-100">
                Resume game
              </button>
              <button type="button" onClick={() => void abandonActiveGame()} disabled={abandoning} className="rounded-lg bg-white/15 px-4 py-2 font-bold text-white focus-visible:ring-4 focus-visible:ring-white disabled:opacity-50">
                {abandoning ? 'Ending…' : 'End game'}
              </button>
            </div>
          </section>
        )}

        {error && <p className="mb-4 rounded-xl bg-red-100 p-3 text-red-800" role="alert">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2" aria-label="Available learning games">
          {GAMES.map((game) => (
            <button
              type="button"
              key={game.id}
              onClick={() => { setSelectedGame(game.id); setError(''); }}
              className={`bg-gradient-to-br ${game.colour} rounded-2xl p-5 text-left shadow-lg transition motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white`}
              aria-label={`${game.name}, ${game.subject}. ${game.description}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl" aria-hidden="true">{game.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-black text-white">{game.name}</span>
                  <span className="block text-sm text-white/85 mt-1">{game.description}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-white">{game.subject}</span>
                    <span className="rounded-full bg-black/15 px-3 py-1 text-white">{game.questions} questions</span>
                    {currentStatus.highScores[game.id] > 0 && (
                      <span className="font-bold text-yellow-200">Best: {currentStatus.highScores[game.id]}</span>
                    )}
                  </span>
                </span>
                <span className="text-2xl text-white/70" aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </GamesShell>
  );
};

const GamesShell: React.FC<{ onHome: () => void; onBack?: () => void; children: React.ReactNode }> = ({ onHome, onBack, children }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        {onBack ? (
          <button type="button" onClick={onBack} className="rounded-lg px-3 py-2 text-white/80 hover:text-white focus-visible:ring-4 focus-visible:ring-cyan-300">
            ← Back to games
          </button>
        ) : <span />}
        <button type="button" onClick={onHome} className="rounded-lg px-3 py-2 text-white/80 hover:text-white focus-visible:ring-4 focus-visible:ring-cyan-300">
          Home
        </button>
      </div>
      {children}
    </div>
  </div>
);

const GameCreditPanel: React.FC<{ status: GameStatus }> = ({ status }) => {
  const quizzesLeft = Math.max(0, status.requiredPasses - status.passesCount);
  return (
    <section className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-white" aria-labelledby="game-credit-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="game-credit-title" className="font-bold">Game plays: {status.gamesRemaining}</h2>
          <p className="text-sm text-white/70">
            {status.gamesRemaining > 0
              ? 'A play is used only when you press Start.'
              : `Pass ${quizzesLeft} more ${quizzesLeft === 1 ? 'quiz' : 'quizzes'} with 70% or more to earn two plays.`}
          </p>
        </div>
        <div className="flex gap-2" aria-label={`${status.passesCount} of ${status.requiredPasses} passing quizzes completed`}>
          {Array.from({ length: status.requiredPasses }, (_, index) => (
            <span key={index} className="text-2xl" aria-hidden="true">{index < status.passesCount ? '⭐' : '☆'}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

interface GameIntroductionProps {
  definition: GameDefinition;
  status: GameStatus;
  yearGroup: '3-4' | '5-6';
  table: number | 'mixed';
  starting: boolean;
  error: string;
  onYearGroup: (value: '3-4' | '5-6') => void;
  onTable: (value: number | 'mixed') => void;
  onStart: () => void;
}

const GameIntroduction: React.FC<GameIntroductionProps> = ({
  definition, status, yearGroup, table, starting, error, onYearGroup, onTable, onStart,
}) => (
  <main className="max-w-2xl mx-auto">
    <div className={`rounded-3xl bg-gradient-to-br ${definition.colour} p-6 sm:p-9 text-center shadow-2xl`}>
      <div className="text-7xl mb-3" aria-hidden="true">{definition.icon}</div>
      <h1 className="text-3xl font-black text-white">{definition.name}</h1>
      <p className="mt-3 text-white/85">{definition.description}</p>
      <p className="mt-2 rounded-xl bg-black/15 p-3 text-sm text-white"><strong>Learning goal:</strong> {definition.learningGoal}</p>

      {definition.needsYearGroup && (
        <fieldset className="mt-6">
          <legend className="mb-2 font-bold text-white">Choose your practice level</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['3-4', '5-6'] as const).map((group) => (
              <button
                type="button"
                key={group}
                onClick={() => onYearGroup(group)}
                aria-pressed={yearGroup === group}
                className={`rounded-xl px-4 py-3 font-bold focus-visible:ring-4 focus-visible:ring-white ${yearGroup === group ? 'bg-white text-slate-900' : 'bg-white/20 text-white'}`}
              >
                Years {group.replace('-', '–')}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {definition.needsTable && (
        <label className="mt-6 block text-left font-bold text-white">
          Times table
          <select
            value={table}
            onChange={(event) => onTable(event.target.value === 'mixed' ? 'mixed' : Number(event.target.value))}
            className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-slate-900"
          >
            <option value="mixed">Mixed 2–12</option>
            {Array.from({ length: 11 }, (_, index) => index + 2).map((value) => (
              <option key={value} value={value}>{value} times table</option>
            ))}
          </select>
        </label>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-100 p-3 text-left text-red-800" role="alert">{error}</p>}

      <button
        type="button"
        onClick={onStart}
        disabled={starting || status.gamesRemaining <= 0}
        className="mt-6 w-full rounded-xl bg-white px-6 py-4 text-xl font-black text-indigo-700 shadow-lg hover:bg-indigo-50 focus-visible:ring-4 focus-visible:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {starting ? 'Starting…' : status.gamesRemaining > 0 ? `Start game · ${status.gamesRemaining} ${status.gamesRemaining === 1 ? 'play' : 'plays'} left` : 'Games locked'}
      </button>
      {status.gamesRemaining <= 0 && (
        <p className="mt-3 text-sm text-white/85">Pass three quizzes with at least 70% to earn two game plays.</p>
      )}
    </div>
  </main>
);

interface GamePlayerProps {
  definition: GameDefinition;
  session: GameSession;
  onSessionChange: (session: GameSession) => void;
  onStatusChange: (status: GameStatus) => void;
  onComplete: (session: GameSession, result: GameResult, status: GameStatus) => void;
  onLeave: () => void;
}

const GamePlayer: React.FC<GamePlayerProps> = ({ definition, session, onSessionChange, onStatusChange, onComplete, onLeave }) => {
  const { playCorrect, playIncorrect, playClick, soundEnabled, toggleSound } = useGameSounds();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string; explanation: string } | null>(null);
  const [error, setError] = useState('');
  const [speechMessage, setSpeechMessage] = useState('');
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.floor((Date.now() - Date.parse(session.startedAt)) / 1000)));
  const promptRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextResponseRef = useRef<Awaited<ReturnType<typeof gameService.answerQuestion>> | null>(null);

  const question = session.question;

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(Math.max(0, Math.floor((Date.now() - Date.parse(session.startedAt)) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, [session.startedAt]);

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    setError('');
    window.setTimeout(() => {
      promptRef.current?.focus();
      if (question?.kind === 'text') inputRef.current?.focus();
    }, 50);
  }, [question?.id]);

  const speakWord = useCallback(() => {
    if (!question?.speak) return;
    if (!('speechSynthesis' in window)) {
      setSpeechMessage('Speech is not available on this device. Use the sentence and spelling hint instead.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question.speak);
    const britishVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('en-gb'));
    if (britishVoice) utterance.voice = britishVoice;
    utterance.lang = 'en-GB';
    utterance.rate = 0.72;
    window.speechSynthesis.speak(utterance);
    setSpeechMessage('Word played.');
  }, [question?.speak]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const submitAnswer = async (chosen: string) => {
    if (!question || submitting || feedback) return;
    const value = chosen.trim();
    if (!value) {
      setError('Choose or type an answer first.');
      return;
    }
    setSubmitting(true);
    setError('');
    playClick();
    try {
      const response = await gameService.answerQuestion(session.sessionId, question.id, value);
      nextResponseRef.current = response;
      setFeedback({ correct: response.correct, answer: response.correctAnswer, explanation: response.explanation });
      if (response.correct) playCorrect();
      else playIncorrect();
      window.setTimeout(() => {
        const next = nextResponseRef.current;
        if (!next) return;
        onStatusChange(next.status);
        if (next.completed && next.result) onComplete(next.session, next.result, next.status);
        else onSessionChange(next.session);
        nextResponseRef.current = null;
      }, 1400);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit your answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitText = (event: FormEvent) => {
    event.preventDefault();
    void submitAnswer(answer);
  };

  const progress = Math.round((session.currentIndex / session.totalQuestions) * 100);
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  if (!question) return <p className="text-center text-white" role="status">Preparing the next question…</p>;

  return (
    <main className="max-w-2xl mx-auto">
      <div className={`rounded-3xl bg-gradient-to-br ${definition.colour} p-4 sm:p-7 shadow-2xl`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-white">
          <span>{definition.icon} {definition.name}</span>
          <span>Question {session.currentIndex + 1}/{session.totalQuestions}</span>
          <span aria-label={`Elapsed time ${formatTime(elapsed)}`}>⏱ {formatTime(elapsed)}</span>
          <button
            type="button"
            onClick={toggleSound}
            className="rounded-lg bg-white/15 px-3 py-1 focus-visible:ring-4 focus-visible:ring-white"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Turn game sounds off' : 'Turn game sounds on'}
          >
            {soundEnabled ? '🔊 Sound on' : '🔇 Sound off'}
          </button>
        </div>

        <div className="mb-5 h-3 overflow-hidden rounded-full bg-black/20" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Game progress">
          <div className="h-full rounded-full bg-white transition-all motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>

        <section className="rounded-2xl bg-white p-5 sm:p-7 text-center shadow-lg">
          <h1 ref={promptRef} tabIndex={-1} className="text-2xl sm:text-3xl font-black text-slate-900 focus:outline-none">{question.prompt}</h1>
          {question.context && <p className="mt-3 text-slate-600">{question.context}</p>}
          {question.speak && (
            <div className="mt-4">
              <button type="button" onClick={speakWord} className="rounded-xl bg-amber-100 px-5 py-3 font-bold text-amber-900 focus-visible:ring-4 focus-visible:ring-amber-400">
                🔊 Hear the word
              </button>
              <p className="mt-2 text-sm text-slate-500">{question.hint} · {question.speak.length} letters</p>
              <span className="sr-only" aria-live="polite">{speechMessage}</span>
            </div>
          )}
        </section>

        <div className="mt-4">
          {question.kind === 'choice' ? (
            <div className="grid gap-3 sm:grid-cols-2" aria-label="Answer choices">
              {question.options?.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => void submitAnswer(option)}
                  disabled={submitting || !!feedback}
                  className="min-h-16 rounded-xl bg-white/20 px-4 py-3 text-base font-bold text-white hover:bg-white/30 focus-visible:ring-4 focus-visible:ring-yellow-300 disabled:opacity-60"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={submitText}>
              <label htmlFor="spelling-answer" className="sr-only">Type the missing word</label>
              <input
                ref={inputRef}
                id="spelling-answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={submitting || !!feedback}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl bg-white px-4 py-4 text-center text-xl font-bold text-slate-900 focus-visible:ring-4 focus-visible:ring-yellow-300"
                placeholder="Type the word"
              />
              <button type="submit" disabled={submitting || !!feedback || !answer.trim()} className="mt-3 w-full rounded-xl bg-slate-950 px-5 py-4 font-bold text-white focus-visible:ring-4 focus-visible:ring-yellow-300 disabled:opacity-50">
                {submitting ? 'Checking…' : 'Check spelling'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 min-h-24" aria-live="polite" aria-atomic="true">
          {feedback && (
            <div className={`rounded-xl p-4 ${feedback.correct ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`} role="status">
              <p className="font-black">{feedback.correct ? '✓ Correct!' : `Not quite — the answer is ${feedback.answer}.`}</p>
              <p className="mt-1 text-sm">{feedback.explanation}</p>
            </div>
          )}
          {error && <p className="rounded-xl bg-red-100 p-3 text-red-800" role="alert">{error}</p>}
        </div>

        <button type="button" onClick={onLeave} className="mt-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/80 underline focus-visible:ring-4 focus-visible:ring-white">
          Save and return to games
        </button>
      </div>
    </main>
  );
};

const GameResultCard: React.FC<{
  definition: GameDefinition;
  result: GameResult;
  highScore: number;
  gamesRemaining: number;
  onPlayAgain: () => void;
  onGames: () => void;
}> = ({ definition, result, highScore, gamesRemaining, onPlayAgain, onGames }) => {
  const stars = result.stars ? '⭐'.repeat(result.stars) : '🌱';
  return (
    <main className="max-w-xl mx-auto">
      <div className={`rounded-3xl bg-gradient-to-br ${definition.colour} p-7 sm:p-10 text-center text-white shadow-2xl`}>
        <div className="text-6xl" aria-hidden="true">{stars}</div>
        <h1 className="mt-3 text-3xl font-black">Mission complete!</h1>
        <p className="mt-4 text-5xl font-black">{result.accuracy}%</p>
        <p className="mt-2 text-white/85">{result.correct} of {result.total} correct</p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl bg-white/15 p-3"><span className="block text-sm text-white/70">Score</span><strong>{result.score}</strong></div>
          <div className="rounded-xl bg-white/15 p-3"><span className="block text-sm text-white/70">Best</span><strong>{highScore}</strong></div>
          <div className="rounded-xl bg-white/15 p-3"><span className="block text-sm text-white/70">XP earned</span><strong>+{result.xpEarned}</strong></div>
          <div className="rounded-xl bg-white/15 p-3"><span className="block text-sm text-white/70">Time</span><strong>{Math.floor(result.durationSeconds / 60)}:{String(result.durationSeconds % 60).padStart(2, '0')}</strong></div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={onGames} className="rounded-xl bg-white/20 px-6 py-3 font-bold focus-visible:ring-4 focus-visible:ring-white">Choose another game</button>
          <button type="button" onClick={onPlayAgain} disabled={gamesRemaining <= 0} className="rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 focus-visible:ring-4 focus-visible:ring-yellow-300 disabled:opacity-50">
            {gamesRemaining > 0 ? 'Play again' : 'Earn more plays'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default MiniGames;
