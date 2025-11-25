/**
 * Quiz Battle Component
 * 
 * Real-time 1v1 quiz battles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { multiplayerBattleService, QuizBattle, BattlePlayer } from '../services/multiplayerBattleService';
import { useUser } from '../context/UserContext';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, Difficulty } from '../types';

interface QuizBattleProps {
  onClose: () => void;
  onComplete: (won: boolean, points: number) => void;
}

type BattleView = 'menu' | 'create' | 'join' | 'waiting' | 'battle' | 'results';

export const QuizBattleMode: React.FC<QuizBattleProps> = ({ onClose, onComplete }) => {
  const { currentChild, addPoints } = useUser();
  const [view, setView] = useState<BattleView>('menu');
  const [battle, setBattle] = useState<QuizBattle | null>(null);
  const [battleCode, setBattleCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Battle state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

  // Create a new battle
  const handleCreateBattle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate questions for the battle
      const questions = await generateQuiz(
        'Maths',
        'Mixed',
        Difficulty.Medium,
        5
      );

      const newBattle = await multiplayerBattleService.createBattle(
        currentChild?.id || 'player1',
        currentChild?.name || 'Player 1',
        '#8B5CF6',
        'Maths',
        'Mixed',
        Difficulty.Medium,
        questions
      );

      setBattle(newBattle);
      setView('waiting');
    } catch (err) {
      setError('Failed to create battle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join an existing battle
  const handleJoinBattle = async () => {
    if (battleCode.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const joinedBattle = await multiplayerBattleService.joinBattle(
        battleCode.toUpperCase(),
        currentChild?.id || 'player2',
        currentChild?.name || 'Player 2',
        '#EC4899'
      );

      if (joinedBattle) {
        setBattle(joinedBattle);
        setView('waiting');
        
        // Mark as ready after a brief delay
        setTimeout(() => {
          multiplayerBattleService.setPlayerReady(
            joinedBattle.id,
            currentChild?.id || 'player2'
          );
        }, 1000);
      } else {
        setError('Battle not found or already started');
      }
    } catch (err) {
      setError('Failed to join battle');
    } finally {
      setLoading(false);
    }
  };

  // Start battle timer
  useEffect(() => {
    if (view === 'battle' && !showResult) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto-submit wrong answer
            handleAnswer(-1);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [view, showResult, currentQuestionIndex]);

  // Set answer start time when question changes
  useEffect(() => {
    if (view === 'battle' && !showResult) {
      setAnswerStartTime(Date.now());
    }
  }, [currentQuestionIndex, view, showResult]);

  // Handle answer submission
  const handleAnswer = useCallback((answerIndex: number) => {
    if (!battle || showResult) return;

    const timeMs = Date.now() - answerStartTime;
    const currentQuestion = battle.questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    // Submit answer to battle service
    multiplayerBattleService.submitAnswer(
      battle.id,
      currentChild?.id || 'player1',
      currentQuestionIndex,
      isCorrect,
      timeMs
    );

    // Update local battle state
    const updatedBattle = multiplayerBattleService.getBattle(battle.id);
    if (updatedBattle) {
      setBattle(updatedBattle);
    }
  }, [battle, currentQuestionIndex, answerStartTime, showResult, currentChild?.id]);

  // Move to next question
  const handleNextQuestion = () => {
    if (!battle) return;

    if (currentQuestionIndex >= battle.questions.length - 1) {
      // Battle complete
      setView('results');
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeRemaining(30);
    }
  };

  // Simulate opponent (for demo - in production this would be real-time)
  useEffect(() => {
    if (view === 'waiting' && battle?.status === 'ready') {
      // Auto-start after brief delay
      setTimeout(() => {
        const startedBattle = multiplayerBattleService.setPlayerReady(
          battle.id,
          battle.players.host.id
        );
        if (startedBattle) {
          setBattle(startedBattle);
          setView('battle');
        }
      }, 2000);
    }
  }, [view, battle]);

  // Main Menu View
  if (view === 'menu') {
    return (
      <BattleModal onClose={onClose} title="Quiz Battle">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Challenge Mode</h3>
          <p className="text-gray-600 mb-8">
            Battle against friends in real-time quiz challenges!
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setView('create')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              🎮 Create Battle
            </button>
            
            <button
              onClick={() => setView('join')}
              className="w-full bg-gray-100 text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              🔗 Join with Code
            </button>
          </div>

          {/* Battle History */}
          <BattleHistory userId={currentChild?.id || 'default'} />
        </div>
      </BattleModal>
    );
  }

  // Create Battle View
  if (view === 'create') {
    return (
      <BattleModal onClose={() => setView('menu')} title="Create Battle">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Create a New Battle</h3>
          <p className="text-gray-600 mb-6">
            Set up a quiz battle and share the code with a friend!
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateBattle}
            disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Start Battle'}
          </button>
        </div>
      </BattleModal>
    );
  }

  // Join Battle View
  if (view === 'join') {
    return (
      <BattleModal onClose={() => setView('menu')} title="Join Battle">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Battle Code</h3>
          <p className="text-gray-600 mb-6">
            Ask your friend for their 6-character battle code
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

  // Waiting Room View
  if (view === 'waiting' && battle) {
    return (
      <BattleModal onClose={onClose} title="Waiting Room">
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {battle.players.challenger ? 'Battle Starting...' : 'Waiting for Opponent...'}
          </h3>

          {!battle.players.challenger && (
            <>
              <p className="text-gray-600 mb-6">
                Share this code with a friend:
              </p>
              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <div className="text-4xl font-mono font-bold tracking-widest text-purple-600">
                  {battle.battleCode}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                The battle will start when someone joins
              </p>
            </>
          )}

          {battle.players.challenger && (
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-8">
                <PlayerCard player={battle.players.host} />
                <span className="text-2xl font-bold text-gray-400">VS</span>
                <PlayerCard player={battle.players.challenger} />
              </div>
              <p className="text-gray-500">Get ready...</p>
            </div>
          )}
        </div>
      </BattleModal>
    );
  }

  // Battle View
  if (view === 'battle' && battle) {
    const currentQuestion = battle.questions[currentQuestionIndex];
    const myPlayer = battle.players.host.id === (currentChild?.id || 'player1')
      ? battle.players.host
      : battle.players.challenger;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col z-50">
        {/* Header with scores */}
        <div className="bg-white/10 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-white font-bold">{battle.players.host.name}</div>
                <div className="text-2xl font-bold text-yellow-400">{battle.players.host.score}</div>
              </div>
              
              <div className="text-center">
                <div className="text-white/60 text-sm">Question</div>
                <div className="text-2xl font-bold text-white">
                  {currentQuestionIndex + 1}/{battle.questions.length}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-white font-bold">
                  {battle.players.challenger?.name || 'Waiting...'}
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {battle.players.challenger?.score || 0}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="mt-4">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timeRemaining <= 10 ? 'bg-red-500' : 'bg-green-400'
                  }`}
                  style={{ width: `${(timeRemaining / 30) * 100}%` }}
                />
              </div>
              <div className="text-center text-white mt-1">
                {timeRemaining}s
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-xl">
              <p className="text-lg text-gray-900">{currentQuestion.question}</p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-4 rounded-xl text-left transition-all ";
                
                if (showResult) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += "bg-green-500 text-white";
                  } else if (index === selectedAnswer) {
                    buttonClass += "bg-red-500 text-white";
                  } else {
                    buttonClass += "bg-white/50 text-gray-500";
                  }
                } else if (selectedAnswer === index) {
                  buttonClass += "bg-purple-600 text-white";
                } else {
                  buttonClass += "bg-white text-gray-900 hover:bg-purple-100";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="font-bold mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Next Button */}
        {showResult && (
          <div className="bg-white/10 backdrop-blur-sm p-4">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={handleNextQuestion}
                className="w-full bg-white text-purple-900 font-bold py-4 rounded-xl hover:bg-purple-100"
              >
                {currentQuestionIndex >= battle.questions.length - 1
                  ? 'See Results'
                  : 'Next Question →'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results View
  if (view === 'results' && battle) {
    const myPlayer = battle.players.host.id === (currentChild?.id || 'player1')
      ? battle.players.host
      : battle.players.challenger;
    const opponent = battle.players.host.id === (currentChild?.id || 'player1')
      ? battle.players.challenger
      : battle.players.host;
    
    const won = myPlayer && opponent && myPlayer.score > opponent.score;
    const tied = myPlayer && opponent && myPlayer.score === opponent.score;

    return (
      <BattleModal onClose={() => {
        if (won) addPoints(50);
        onComplete(won || false, won ? 50 : 10);
        onClose();
      }} title="Battle Results">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">
            {won ? '🏆' : tied ? '🤝' : '💪'}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {won ? 'Victory!' : tied ? 'It\'s a Tie!' : 'Good Try!'}
          </h3>
          
          <div className="flex justify-center items-center gap-8 my-8">
            <div className={`text-center p-4 rounded-xl ${won ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <div className="font-bold text-gray-900">{myPlayer?.name}</div>
              <div className="text-3xl font-bold text-purple-600">{myPlayer?.score || 0}</div>
            </div>
            <span className="text-2xl font-bold text-gray-400">-</span>
            <div className={`text-center p-4 rounded-xl ${!won && !tied ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <div className="font-bold text-gray-900">{opponent?.name}</div>
              <div className="text-3xl font-bold text-pink-600">{opponent?.score || 0}</div>
            </div>
          </div>

          <div className="bg-purple-100 rounded-xl p-4 mb-6">
            <span className="text-purple-600 font-bold">
              +{won ? 50 : 10} points earned!
            </span>
          </div>

          <button
            onClick={() => {
              if (won) addPoints(50);
              onComplete(won || false, won ? 50 : 10);
              onClose();
            }}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700"
          >
            Continue
          </button>
        </div>
      </BattleModal>
    );
  }

  return null;
};

// Battle Modal Wrapper
const BattleModal: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}> = ({ children, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Player Card Component
const PlayerCard: React.FC<{ player: BattlePlayer }> = ({ player }) => {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2"
        style={{ backgroundColor: player.avatarColor }}
      >
        {player.name.charAt(0)}
      </div>
      <div className="font-medium text-gray-900">{player.name}</div>
    </div>
  );
};

// Battle History Component
const BattleHistory: React.FC<{ userId: string }> = ({ userId }) => {
  const [history, setHistory] = useState<QuizBattle[]>([]);

  useEffect(() => {
    const battles = multiplayerBattleService.getUserBattleHistory(userId, 5);
    setHistory(battles.filter(b => b.status === 'completed'));
  }, [userId]);

  if (history.length === 0) return null;

  const stats = multiplayerBattleService.getUserBattleStats(userId);

  return (
    <div className="mt-8 text-left">
      <h4 className="font-bold text-gray-900 mb-3">Your Battle Stats</h4>
      <div className="grid grid-cols-3 gap-2 mb-4">
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
