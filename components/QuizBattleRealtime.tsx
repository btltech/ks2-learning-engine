/**
 * Real-time Quiz Battle Component
 * 
 * Enables real multiplayer quiz battles between students on different devices
 * Uses Firebase Realtime Database for live synchronization
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeBattleService, RealtimeBattle, BattlePlayer } from '../services/realtimeBattleService';
import { useUser } from '../context/UserContext';
import { generateQuiz } from '../services/geminiService';
import { Difficulty, QuizQuestion } from '../types';

interface QuizBattleProps {
  onClose: () => void;
  onComplete: (won: boolean, points: number) => void;
}

type BattleView = 'menu' | 'create' | 'join' | 'browse' | 'waiting' | 'countdown' | 'battle' | 'results';

// Transform QuizQuestion to have numeric correctAnswer index
interface BattleQuestion extends Omit<QuizQuestion, 'correctAnswer'> {
  correctAnswer: number;
  originalAnswer: string;
}

export const QuizBattleMode: React.FC<QuizBattleProps> = ({ onClose, onComplete }) => {
  const { user, addPoints } = useUser();
  const [view, setView] = useState<BattleView>('menu');
  const [battle, setBattle] = useState<RealtimeBattle | null>(null);
  const [localQuestions, setLocalQuestions] = useState<BattleQuestion[]>([]);
  const [battleCode, setBattleCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openBattles, setOpenBattles] = useState<RealtimeBattle[]>([]);
  
  // Battle state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);
  const [countdown, setCountdown] = useState(3);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(true);
  const [opponentOnline, setOpponentOnline] = useState(true);
  
  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botModeRef = useRef(false);

  // Get current user's player ID
  const myPlayerId = user?.id || `player_${Date.now()}`;
  const myPlayerName = user?.name || 'Player';

  // Transform questions to have numeric correctAnswer
  const transformQuestions = (questions: QuizQuestion[]): BattleQuestion[] => {
    return questions.map(q => {
      const correctIndex = q.options.findIndex(opt => opt === q.correctAnswer);
      return {
        ...q,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
        originalAnswer: q.correctAnswer,
      };
    });
  };

  // Subscribe to battle updates
  useEffect(() => {
    if (!battle?.id) return;

    console.log('[QuizBattle] Subscribing to battle:', battle.id);
    
    unsubscribeRef.current = realtimeBattleService.subscribeToBattle(
      battle.id,
      (updatedBattle) => {
        if (!updatedBattle) {
          console.log('[QuizBattle] Battle was deleted or cancelled');
          setError('Battle was cancelled');
          setView('menu');
          return;
        }

        console.log('[QuizBattle] Battle update:', updatedBattle.status);
        setBattle(updatedBattle);

        // Handle status changes
        if (updatedBattle.status === 'countdown' && view === 'waiting') {
          setView('countdown');
          setCountdown(3);
        } else if (updatedBattle.status === 'in_progress' && (view === 'countdown' || view === 'waiting')) {
          setView('battle');
          setCurrentQuestionIndex(0);
          setTimeRemaining(30);
          setAnswerStartTime(Date.now());
        } else if (updatedBattle.status === 'completed' && view !== 'results') {
          setView('results');
          // Save to history
          realtimeBattleService.saveBattleToHistory(updatedBattle);
        }

        // Check opponent connection
        if (updatedBattle.challenger) {
          const opponentLastSeen = updatedBattle.host.id === myPlayerId
            ? updatedBattle.challenger.lastSeen
            : updatedBattle.host.lastSeen;
          const now = Date.now();
          setOpponentOnline((now - opponentLastSeen) < 10000); // 10 second threshold
        }
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [battle?.id, view, myPlayerId]);

  // Countdown effect
  useEffect(() => {
    if (view === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [view, countdown]);

  // Battle timer
  useEffect(() => {
    if (view === 'battle' && !showResult && battle?.status === 'in_progress') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto-submit wrong answer
            handleAnswer(-1);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [view, showResult, battle?.status]);

  // Set answer start time when question changes
  useEffect(() => {
    if (view === 'battle' && !showResult) {
      setAnswerStartTime(Date.now());
    }
  }, [currentQuestionIndex, view, showResult]);

  // Bot simulation for solo play
  useEffect(() => {
    if (!botModeRef.current || view !== 'battle' || !battle || showResult) return;

    const botDelay = 2000 + Math.random() * 3000;
    const botTimer = setTimeout(async () => {
      const currentQuestion = localQuestions[currentQuestionIndex];
      if (!currentQuestion) return;

      const botCorrect = Math.random() < 0.7;
      
      await realtimeBattleService.submitAnswer(
        battle.id,
        'mira_bot',
        currentQuestionIndex,
        botCorrect,
        Math.floor(botDelay)
      );
    }, botDelay);

    return () => clearTimeout(botTimer);
  }, [view, battle?.id, currentQuestionIndex, showResult, localQuestions]);

  // Create a new battle
  const handleCreateBattle = async (withBot: boolean = false) => {
    setLoading(true);
    setError(null);
    botModeRef.current = withBot;

    try {
      // Generate questions
      const rawQuestions = await generateQuiz(
        'Maths',
        'Mixed',
        Difficulty.Medium,
        user?.age || 9
      );

      if (!rawQuestions || rawQuestions.length === 0) {
        setError('Could not generate quiz questions. Please try again.');
        setLoading(false);
        return;
      }

      const transformedQuestions = transformQuestions(rawQuestions);
      setLocalQuestions(transformedQuestions);

      console.log('[QuizBattle] Creating battle with', rawQuestions.length, 'questions');

      const newBattle = await realtimeBattleService.createBattle(
        myPlayerId,
        myPlayerName,
        '#8B5CF6',
        'Maths',
        'Mixed',
        Difficulty.Medium,
        rawQuestions
      );

      setBattle(newBattle);
      
      if (withBot) {
        // Auto-add MiRa bot
        setTimeout(async () => {
          await realtimeBattleService.joinBattle(
            newBattle.battleCode,
            'mira_bot',
            'MiRa 🤖',
            '#EC4899'
          );
          
          // Auto-ready the bot
          setTimeout(async () => {
            await realtimeBattleService.setPlayerReady(newBattle.id, 'mira_bot');
            await realtimeBattleService.setPlayerReady(newBattle.id, myPlayerId);
          }, 1000);
        }, 1500);
      }
      
      setView('waiting');
    } catch (err) {
      console.error('[QuizBattle] Create battle error:', err);
      setError('Failed to create battle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join an existing battle by code
  const handleJoinBattle = async () => {
    if (battleCode.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }

    setLoading(true);
    setError(null);
    botModeRef.current = false;

    try {
      const joinedBattle = await realtimeBattleService.joinBattle(
        battleCode.toUpperCase(),
        myPlayerId,
        myPlayerName,
        '#EC4899'
      );

      if (joinedBattle) {
        setBattle(joinedBattle);
        setLocalQuestions(transformQuestions(joinedBattle.questions));
        setView('waiting');

        // Auto-ready after a brief delay
        setTimeout(async () => {
          await realtimeBattleService.setPlayerReady(joinedBattle.id, myPlayerId);
        }, 1000);
      } else {
        setError('Battle not found or already in progress');
      }
    } catch (err) {
      console.error('[QuizBattle] Join battle error:', err);
      setError('Failed to join battle');
    } finally {
      setLoading(false);
    }
  };

  // Join a battle from the browser
  const handleJoinFromBrowse = async (battleToJoin: RealtimeBattle) => {
    setLoading(true);
    setError(null);
    botModeRef.current = false;

    try {
      const joinedBattle = await realtimeBattleService.joinBattle(
        battleToJoin.battleCode,
        myPlayerId,
        myPlayerName,
        '#EC4899'
      );

      if (joinedBattle) {
        setBattle(joinedBattle);
        setLocalQuestions(transformQuestions(joinedBattle.questions));
        setView('waiting');

        setTimeout(async () => {
          await realtimeBattleService.setPlayerReady(joinedBattle.id, myPlayerId);
        }, 1000);
      } else {
        setError('Could not join this battle');
        loadOpenBattles(); // Refresh list
      }
    } catch (err) {
      setError('Failed to join battle');
    } finally {
      setLoading(false);
    }
  };

  // Load open battles
  const loadOpenBattles = async () => {
    try {
      const battles = await realtimeBattleService.findOpenBattles();
      // Filter out my own battles
      setOpenBattles(battles.filter(b => b.host.id !== myPlayerId));
    } catch (err) {
      console.error('[QuizBattle] Load open battles error:', err);
    }
  };

  // Handle answer submission
  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (!battle || showResult) return;

    const timeMs = Date.now() - answerStartTime;
    const currentQuestion = localQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    // Submit to Firebase
    await realtimeBattleService.submitAnswer(
      battle.id,
      myPlayerId,
      currentQuestionIndex,
      isCorrect,
      timeMs
    );
  }, [battle, currentQuestionIndex, answerStartTime, showResult, myPlayerId, localQuestions]);

  // Move to next question
  const handleNextQuestion = () => {
    if (!battle || !localQuestions.length) return;

    if (currentQuestionIndex >= localQuestions.length - 1) {
      setView('results');
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeRemaining(30);
    }
  };

  // Leave battle
  const handleLeaveBattle = async () => {
    if (battle) {
      await realtimeBattleService.leaveBattle(battle.id, myPlayerId);
    }
    setBattle(null);
    setView('menu');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Get my player and opponent from battle
  const getPlayers = () => {
    if (!battle) return { myPlayer: null, opponent: null };
    
    const isHost = battle.host.id === myPlayerId;
    return {
      myPlayer: isHost ? battle.host : battle.challenger,
      opponent: isHost ? battle.challenger : battle.host,
    };
  };

  // ============ RENDER VIEWS ============

  // Main Menu
  if (view === 'menu') {
    return (
      <BattleModal onClose={onClose} title="Quiz Battle ⚔️">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-Time Battle</h3>
          <p className="text-gray-600 mb-8">
            Battle friends from anywhere, or practice with MiRa!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleCreateBattle(false)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              🌍 Create Battle (Play with Friend)
            </button>

            <button
              onClick={() => handleCreateBattle(true)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              🤖 Practice with MiRa
            </button>

            <button
              onClick={() => {
                loadOpenBattles();
                setView('browse');
              }}
              className="w-full bg-blue-100 text-blue-700 font-bold py-4 rounded-xl hover:bg-blue-200 transition-colors"
            >
              🔍 Find Open Battles
            </button>

            <button
              onClick={() => setView('join')}
              className="w-full bg-gray-100 text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              🔗 Join with Code
            </button>
          </div>

          {loading && (
            <div className="mt-4 text-purple-600">
              <span className="animate-spin inline-block mr-2">⏳</span>
              Setting up battle...
            </div>
          )}

          <BattleStats userId={myPlayerId} />
        </div>
      </BattleModal>
    );
  }

  // Browse Open Battles
  if (view === 'browse') {
    return (
      <BattleModal onClose={() => setView('menu')} title="Find Battles">
        <div className="py-4">
          <button
            onClick={loadOpenBattles}
            className="w-full mb-4 text-purple-600 hover:text-purple-800"
          >
            🔄 Refresh
          </button>

          {openBattles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600">No open battles right now</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your own battle and share the code!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openBattles.map((b) => (
                <div
                  key={b.id}
                  className="bg-gray-50 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-gray-900">{b.host.name}</div>
                    <div className="text-sm text-gray-500">
                      {b.subject} • {b.difficulty}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinFromBrowse(b)}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-4">
              {error}
            </div>
          )}
        </div>
      </BattleModal>
    );
  }

  // Join by Code
  if (view === 'join') {
    return (
      <BattleModal onClose={() => setView('menu')} title="Join Battle">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Battle Code</h3>
          <p className="text-gray-600 mb-6">
            Ask your friend for their 6-character code
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <input
            type="text"
            value={battleCode}
            onChange={(e) => setBattleCode(e.target.value.toUpperCase())}
            placeholder="XXXXXX"
            maxLength={6}
            className="w-full text-center text-3xl font-mono tracking-widest p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none mb-4"
          />

          <button
            onClick={handleJoinBattle}
            disabled={loading || battleCode.length !== 6}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Battle'}
          </button>
        </div>
      </BattleModal>
    );
  }

  // Waiting Room
  if (view === 'waiting' && battle) {
    const hasOpponent = !!battle.challenger;

    return (
      <BattleModal onClose={handleLeaveBattle} title="Waiting Room">
        <div className="text-center py-8">
          {!hasOpponent ? (
            <>
              <div className="text-6xl mb-4 animate-pulse">📡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Waiting for Opponent...
              </h3>
              <p className="text-gray-600 mb-6">
                Share this code with a friend:
              </p>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
                <div className="text-4xl font-mono font-bold tracking-widest text-purple-600 select-all">
                  {battle.battleCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(battle.battleCode);
                  }}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-800"
                >
                  📋 Copy Code
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Connected & waiting
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Opponent Found!
              </h3>

              <div className="flex justify-center items-center gap-6 my-6">
                <PlayerCard player={battle.host} isOnline={true} />
                <span className="text-3xl font-bold text-gray-300">VS</span>
                <PlayerCard player={battle.challenger!} isOnline={opponentOnline} />
              </div>

              <p className="text-gray-500 animate-pulse">
                Get ready to battle...
              </p>
            </>
          )}
        </div>
      </BattleModal>
    );
  }

  // Countdown
  if (view === 'countdown') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-9xl font-bold text-white animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <p className="text-white/80 text-xl mt-4">Battle starting...</p>
        </div>
      </div>
    );
  }

  // Battle View
  if (view === 'battle' && battle && localQuestions.length > 0) {
    const currentQuestion = localQuestions[currentQuestionIndex];
    const { myPlayer, opponent } = getPlayers();

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col z-50">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto">
            {/* Player scores */}
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${opponentOnline || botModeRef.current ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-white font-bold">{opponent?.name || 'Opponent'}</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{opponent?.score || 0}</div>
                <div className="text-xs text-white/60">Q{opponent?.currentQuestion || 0}/{localQuestions.length}</div>
              </div>

              <div className="text-center">
                <div className="text-white/60 text-sm">Question</div>
                <div className="text-3xl font-bold text-white">
                  {currentQuestionIndex + 1}/{localQuestions.length}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-white font-bold">{myPlayer?.name || 'You'}</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-400">{myPlayer?.score || 0}</div>
                <div className="text-xs text-white/60">Q{myPlayer?.currentQuestion || 0}/{localQuestions.length}</div>
              </div>
            </div>

            {/* Timer */}
            <div className="mt-4">
              <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timeRemaining <= 10 ? 'bg-red-500' : timeRemaining <= 20 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${(timeRemaining / 30) * 100}%` }}
                />
              </div>
              <div className={`text-center mt-1 font-bold ${
                timeRemaining <= 10 ? 'text-red-400' : 'text-white'
              }`}>
                {timeRemaining}s
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-xl">
              <p className="text-lg text-gray-900 font-medium">{currentQuestion.question}</p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-4 rounded-xl text-left transition-all font-medium ";

                if (showResult) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += "bg-green-500 text-white ring-4 ring-green-300";
                  } else if (index === selectedAnswer) {
                    buttonClass += "bg-red-500 text-white";
                  } else {
                    buttonClass += "bg-white/30 text-white/50";
                  }
                } else {
                  buttonClass += "bg-white text-gray-900 hover:bg-purple-100 hover:scale-[1.02] active:scale-100";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-center leading-8 mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showResult && (
              <div className={`mt-4 p-4 rounded-xl text-center ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-500/20 text-green-200'
                  : 'bg-red-500/20 text-red-200'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <span>✓ Correct! +{10 + Math.max(0, Math.floor((30 - (30 - timeRemaining)) / 3))} points</span>
                ) : (
                  <span>✗ The answer was: {currentQuestion.options[currentQuestion.correctAnswer]}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Next Button */}
        {showResult && (
          <div className="bg-white/10 backdrop-blur-sm p-4">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleNextQuestion}
                className="w-full bg-white text-purple-900 font-bold py-4 rounded-xl hover:bg-purple-100 transition-colors"
              >
                {currentQuestionIndex >= localQuestions.length - 1 ? '🏆 See Results' : 'Next Question →'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results View
  if (view === 'results' && battle) {
    const { myPlayer, opponent } = getPlayers();
    const myScore = myPlayer?.score || 0;
    const opponentScore = opponent?.score || 0;
    const won = myScore > opponentScore;
    const tied = myScore === opponentScore;
    const pointsEarned = won ? 50 : tied ? 25 : 10;

    return (
      <BattleModal
        onClose={() => {
          addPoints(pointsEarned);
          onComplete(won, pointsEarned);
          onClose();
        }}
        title="Battle Complete!"
      >
        <div className="text-center py-6">
          <div className="text-7xl mb-4">
            {won ? '🏆' : tied ? '🤝' : '💪'}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {won ? 'Victory!' : tied ? "It's a Tie!" : 'Good Fight!'}
          </h3>
          <p className="text-gray-600 mb-6">
            {won ? 'You dominated this battle!' : tied ? 'Perfectly matched!' : 'Keep practicing!'}
          </p>

          <div className="flex justify-center items-center gap-6 my-8">
            <div className={`text-center p-6 rounded-xl ${won ? 'bg-yellow-100 ring-4 ring-yellow-400' : 'bg-gray-100'}`}>
              <div className="font-bold text-gray-900 mb-1">{myPlayer?.name || 'You'}</div>
              <div className="text-4xl font-bold text-purple-600">{myScore}</div>
              <div className="text-sm text-gray-500">points</div>
            </div>
            <span className="text-3xl font-bold text-gray-300">—</span>
            <div className={`text-center p-6 rounded-xl ${!won && !tied ? 'bg-yellow-100 ring-4 ring-yellow-400' : 'bg-gray-100'}`}>
              <div className="font-bold text-gray-900 mb-1">{opponent?.name || 'Opponent'}</div>
              <div className="text-4xl font-bold text-pink-600">{opponentScore}</div>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6">
            <span className="text-xl font-bold text-purple-600">
              +{pointsEarned} points earned!
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                addPoints(pointsEarned);
                onComplete(won, pointsEarned);
                setBattle(null);
                setView('menu');
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90"
            >
              Play Again
            </button>

            <button
              onClick={() => {
                addPoints(pointsEarned);
                onComplete(won, pointsEarned);
                onClose();
              }}
              className="w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200"
            >
              Back to Learning
            </button>
          </div>
        </div>
      </BattleModal>
    );
  }

  return null;
};

// ============ HELPER COMPONENTS ============

const BattleModal: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}> = ({ children, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

const PlayerCard: React.FC<{ player: BattlePlayer; isOnline: boolean }> = ({ player, isOnline }) => {
  return (
    <div className="text-center">
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto"
          style={{ backgroundColor: player.avatarColor }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        <span
          className={`absolute bottom-0 right-1/2 translate-x-6 w-4 h-4 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>
      <div className="font-medium text-gray-900 mt-2">{player.name}</div>
      <div className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
  );
};

const BattleStats: React.FC<{ userId: string }> = ({ userId }) => {
  const stats = realtimeBattleService.getUserBattleStats(userId);

  if (stats.totalBattles === 0) return null;

  return (
    <div className="mt-8 text-left">
      <h4 className="font-bold text-gray-900 mb-3">Your Battle Stats</h4>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-gray-900">{stats.totalBattles}</div>
          <div className="text-xs text-gray-500">Battles</div>
        </div>
        <div className="bg-green-100 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-600">{stats.wins}</div>
          <div className="text-xs text-gray-500">Wins</div>
        </div>
        <div className="bg-purple-100 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-600">{stats.winRate}%</div>
          <div className="text-xs text-gray-500">Win Rate</div>
        </div>
      </div>
    </div>
  );
};
