/**
 * Multiplayer Battle Service
 * 
 * Handles real-time 1v1 quiz battles using Firebase Realtime Database
 */

import { Difficulty, QuizQuestion } from '../types';

export type BattleStatus = 'waiting' | 'ready' | 'in_progress' | 'completed' | 'cancelled';

export interface BattlePlayer {
  id: string;
  name: string;
  avatarColor: string;
  score: number;
  currentQuestion: number;
  answers: { questionId: number; correct: boolean; timeMs: number }[];
  isReady: boolean;
  lastActivity: number;
}

export interface QuizBattle {
  id: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  status: BattleStatus;
  questions: QuizQuestion[];
  players: {
    host: BattlePlayer;
    challenger?: BattlePlayer;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  winnerId?: string;
  battleCode: string; // 6-character code for joining
}

export interface Tournament {
  id: string;
  name: string;
  subject: string;
  difficulty: Difficulty;
  startDate: string;
  endDate: string;
  participants: TournamentParticipant[];
  status: 'upcoming' | 'active' | 'completed';
  prizes: { position: number; points: number; badge?: string }[];
}

export interface TournamentParticipant {
  userId: string;
  userName: string;
  score: number;
  gamesPlayed: number;
  wins: number;
  averageTime: number;
}

const STORAGE_KEY = 'ks2_battles';
const TOURNAMENTS_KEY = 'ks2_tournaments';

// Generate a random 6-character battle code
const generateBattleCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

class MultiplayerBattleService {
  private battles: Map<string, QuizBattle> = new Map();
  private tournaments: Map<string, Tournament> = new Map();
  private currentBattleId: string | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.battles = new Map(Object.entries(parsed));
      }

      const tournamentsSaved = localStorage.getItem(TOURNAMENTS_KEY);
      if (tournamentsSaved) {
        const parsed = JSON.parse(tournamentsSaved);
        this.tournaments = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading multiplayer data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(this.battles)));
      localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(Object.fromEntries(this.tournaments)));
    } catch (error) {
      console.error('Error saving multiplayer data:', error);
    }
  }

  /**
   * Create a new battle room
   */
  async createBattle(
    hostId: string,
    hostName: string,
    hostAvatarColor: string,
    subject: string,
    topic: string,
    difficulty: Difficulty,
    questions: QuizQuestion[]
  ): Promise<QuizBattle> {
    const battleCode = generateBattleCode();
    const battleId = `battle_${Date.now()}_${battleCode}`;

    const battle: QuizBattle = {
      id: battleId,
      subject,
      topic,
      difficulty,
      status: 'waiting',
      questions,
      players: {
        host: {
          id: hostId,
          name: hostName,
          avatarColor: hostAvatarColor,
          score: 0,
          currentQuestion: 0,
          answers: [],
          isReady: true,
          lastActivity: Date.now(),
        },
      },
      createdAt: new Date().toISOString(),
      battleCode,
    };

    this.battles.set(battleId, battle);
    this.currentBattleId = battleId;
    this.saveToStorage();

    return battle;
  }

  /**
   * Join an existing battle by code
   */
  async joinBattle(
    battleCode: string,
    challengerId: string,
    challengerName: string,
    challengerAvatarColor: string
  ): Promise<QuizBattle | null> {
    // Find battle by code
    let targetBattle: QuizBattle | null = null;
    
    this.battles.forEach((battle) => {
      if (battle.battleCode === battleCode && battle.status === 'waiting') {
        targetBattle = battle;
      }
    });

    if (!targetBattle) {
      return null;
    }

    // Add challenger
    targetBattle.players.challenger = {
      id: challengerId,
      name: challengerName,
      avatarColor: challengerAvatarColor,
      score: 0,
      currentQuestion: 0,
      answers: [],
      isReady: false,
      lastActivity: Date.now(),
    };

    targetBattle.status = 'ready';
    this.battles.set(targetBattle.id, targetBattle);
    this.currentBattleId = targetBattle.id;
    this.saveToStorage();

    return targetBattle;
  }

  /**
   * Mark player as ready
   */
  setPlayerReady(battleId: string, playerId: string): QuizBattle | null {
    const battle = this.battles.get(battleId);
    if (!battle) return null;

    if (battle.players.host.id === playerId) {
      battle.players.host.isReady = true;
    } else if (battle.players.challenger?.id === playerId) {
      battle.players.challenger.isReady = true;
    }

    // Check if both players are ready
    if (battle.players.host.isReady && battle.players.challenger?.isReady) {
      battle.status = 'in_progress';
      battle.startedAt = new Date().toISOString();
    }

    this.battles.set(battleId, battle);
    this.saveToStorage();
    return battle;
  }

  /**
   * Submit an answer in a battle
   */
  submitAnswer(
    battleId: string,
    playerId: string,
    questionIndex: number,
    isCorrect: boolean,
    timeMs: number
  ): QuizBattle | null {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== 'in_progress') return null;

    const isHost = battle.players.host.id === playerId;
    const player = isHost ? battle.players.host : battle.players.challenger;
    
    if (!player) return null;

    // Record answer
    player.answers.push({
      questionId: questionIndex,
      correct: isCorrect,
      timeMs,
    });

    // Update score (10 points per correct answer, bonus for speed)
    if (isCorrect) {
      const speedBonus = Math.max(0, Math.floor((10000 - timeMs) / 1000));
      player.score += 10 + speedBonus;
    }

    player.currentQuestion = questionIndex + 1;
    player.lastActivity = Date.now();

    // Check if battle is complete
    if (this.isBattleComplete(battle)) {
      battle.status = 'completed';
      battle.completedAt = new Date().toISOString();
      battle.winnerId = this.determineWinner(battle);
    }

    this.battles.set(battleId, battle);
    this.saveToStorage();
    return battle;
  }

  private isBattleComplete(battle: QuizBattle): boolean {
    const totalQuestions = battle.questions.length;
    const hostDone = battle.players.host.currentQuestion >= totalQuestions;
    const challengerDone = battle.players.challenger?.currentQuestion 
      ? battle.players.challenger.currentQuestion >= totalQuestions 
      : false;
    return hostDone && challengerDone;
  }

  private determineWinner(battle: QuizBattle): string | undefined {
    if (!battle.players.challenger) return battle.players.host.id;
    
    const hostScore = battle.players.host.score;
    const challengerScore = battle.players.challenger.score;
    
    if (hostScore > challengerScore) return battle.players.host.id;
    if (challengerScore > hostScore) return battle.players.challenger.id;
    
    // Tie-breaker: total time
    const hostTime = battle.players.host.answers.reduce((sum, a) => sum + a.timeMs, 0);
    const challengerTime = battle.players.challenger.answers.reduce((sum, a) => sum + a.timeMs, 0);
    
    return hostTime < challengerTime ? battle.players.host.id : battle.players.challenger.id;
  }

  /**
   * Get current battle state
   */
  getBattle(battleId: string): QuizBattle | null {
    return this.battles.get(battleId) || null;
  }

  /**
   * Get current active battle
   */
  getCurrentBattle(): QuizBattle | null {
    if (!this.currentBattleId) return null;
    return this.battles.get(this.currentBattleId) || null;
  }

  /**
   * Cancel/leave a battle
   */
  leaveBattle(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (battle) {
      battle.status = 'cancelled';
      this.battles.set(battleId, battle);
      this.saveToStorage();
    }
    
    if (this.currentBattleId === battleId) {
      this.currentBattleId = null;
    }
  }

  /**
   * Get recent battles for a user
   */
  getUserBattleHistory(userId: string, limit: number = 10): QuizBattle[] {
    const userBattles: QuizBattle[] = [];
    
    this.battles.forEach((battle) => {
      if (
        battle.players.host.id === userId ||
        battle.players.challenger?.id === userId
      ) {
        userBattles.push(battle);
      }
    });

    return userBattles
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get battle statistics for a user
   */
  getUserBattleStats(userId: string): {
    totalBattles: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScore: number;
  } {
    let totalBattles = 0;
    let wins = 0;
    let totalScore = 0;

    this.battles.forEach((battle) => {
      if (battle.status !== 'completed') return;
      
      const isHost = battle.players.host.id === userId;
      const isChallenger = battle.players.challenger?.id === userId;
      
      if (!isHost && !isChallenger) return;

      totalBattles++;
      
      const playerScore = isHost 
        ? battle.players.host.score 
        : battle.players.challenger?.score || 0;
      
      totalScore += playerScore;
      
      if (battle.winnerId === userId) {
        wins++;
      }
    });

    return {
      totalBattles,
      wins,
      losses: totalBattles - wins,
      winRate: totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0,
      averageScore: totalBattles > 0 ? Math.round(totalScore / totalBattles) : 0,
    };
  }

  // Tournament Methods

  /**
   * Get active tournaments
   */
  getActiveTournaments(): Tournament[] {
    const now = new Date();
    return Array.from(this.tournaments.values()).filter((t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return now >= start && now <= end;
    });
  }

  /**
   * Get upcoming tournaments
   */
  getUpcomingTournaments(): Tournament[] {
    const now = new Date();
    return Array.from(this.tournaments.values()).filter((t) => {
      const start = new Date(t.startDate);
      return now < start;
    });
  }

  /**
   * Join a tournament
   */
  joinTournament(
    tournamentId: string,
    userId: string,
    userName: string
  ): Tournament | null {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;

    // Check if already joined
    const existing = tournament.participants.find((p) => p.userId === userId);
    if (existing) return tournament;

    tournament.participants.push({
      userId,
      userName,
      score: 0,
      gamesPlayed: 0,
      wins: 0,
      averageTime: 0,
    });

    this.tournaments.set(tournamentId, tournament);
    this.saveToStorage();
    return tournament;
  }

  /**
   * Update tournament score after a battle
   */
  updateTournamentScore(
    tournamentId: string,
    userId: string,
    won: boolean,
    score: number,
    timeMs: number
  ): void {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const participant = tournament.participants.find((p) => p.userId === userId);
    if (!participant) return;

    participant.gamesPlayed++;
    participant.score += score;
    if (won) participant.wins++;
    
    // Update average time
    const totalTime = participant.averageTime * (participant.gamesPlayed - 1) + timeMs;
    participant.averageTime = totalTime / participant.gamesPlayed;

    this.tournaments.set(tournamentId, tournament);
    this.saveToStorage();
  }

  /**
   * Get tournament leaderboard
   */
  getTournamentLeaderboard(tournamentId: string): TournamentParticipant[] {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return [];

    return [...tournament.participants].sort((a, b) => {
      // Sort by score, then by win rate, then by average time
      if (b.score !== a.score) return b.score - a.score;
      const aWinRate = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
      const bWinRate = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
      if (bWinRate !== aWinRate) return bWinRate - aWinRate;
      return a.averageTime - b.averageTime;
    });
  }

  /**
   * Clean up old battles (older than 24 hours)
   */
  cleanupOldBattles(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    
    this.battles.forEach((battle, id) => {
      if (new Date(battle.createdAt).getTime() < cutoff) {
        this.battles.delete(id);
      }
    });
    
    this.saveToStorage();
  }
}

export const multiplayerBattleService = new MultiplayerBattleService();
