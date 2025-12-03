/**
 * Real-time Multiplayer Battle Service
 * 
 * Uses Firebase Realtime Database for live synchronization
 * between two players on different devices/locations
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  onDisconnect,
  serverTimestamp,
  push,
  child,
  DatabaseReference,
  Unsubscribe
} from 'firebase/database';
import { Difficulty, QuizQuestion } from '../types';

// Firebase Configuration - hardcoded database URL for europe-west1 region
const DATABASE_URL = 'https://ks2-learning-engine-default-rtdb.europe-west1.firebasedatabase.app';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  databaseURL: DATABASE_URL,
};

console.log('[RealtimeBattle] Database URL:', DATABASE_URL);

// Initialize Firebase (reuse existing app if available)
let app;
try {
  app = getApp();
  console.log('[RealtimeBattle] Using existing Firebase app');
} catch {
  app = initializeApp(firebaseConfig);
  console.log('[RealtimeBattle] Initialized new Firebase app');
}

// Get database with explicit URL to ensure correct region
const database = getDatabase(app, DATABASE_URL);

// Types
export type BattleStatus = 'waiting' | 'ready' | 'countdown' | 'in_progress' | 'completed' | 'cancelled';

export interface BattlePlayer {
  id: string;
  name: string;
  avatarColor: string;
  score: number;
  currentQuestion: number;
  answers: { questionIndex: number; correct: boolean; timeMs: number }[];
  isReady: boolean;
  isConnected: boolean;
  lastSeen: number;
}

export interface RealtimeBattle {
  id: string;
  battleCode: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  status: BattleStatus;
  questions: QuizQuestion[];
  host: BattlePlayer;
  challenger?: BattlePlayer;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  winnerId?: string;
  countdownStart?: number;
}

export interface BattleUpdate {
  status?: BattleStatus;
  host?: Partial<BattlePlayer>;
  challenger?: Partial<BattlePlayer>;
  startedAt?: number;
  completedAt?: number;
  winnerId?: string;
  countdownStart?: number;
}

// Generate a random 6-character battle code
const generateBattleCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

class RealtimeBattleService {
  private currentBattleId: string | null = null;
  private currentPlayerId: string | null = null;
  private battleListeners: Map<string, Unsubscribe> = new Map();
  private connectionRef: DatabaseReference | null = null;
  private presenceRef: DatabaseReference | null = null;

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
  ): Promise<RealtimeBattle> {
    const battleCode = generateBattleCode();
    const battleId = `battle_${Date.now()}_${battleCode}`;

    const battle: RealtimeBattle = {
      id: battleId,
      battleCode,
      subject,
      topic,
      difficulty,
      status: 'waiting',
      questions,
      host: {
        id: hostId,
        name: hostName,
        avatarColor: hostAvatarColor,
        score: 0,
        currentQuestion: 0,
        answers: [],
        isReady: true,
        isConnected: true,
        lastSeen: Date.now(),
      },
      createdAt: Date.now(),
    };

    // Save to Firebase Realtime Database
    const battleRef = ref(database, `battles/${battleId}`);
    await set(battleRef, battle);

    // Also create a lookup by battle code for easy joining
    const codeRef = ref(database, `battleCodes/${battleCode}`);
    await set(codeRef, { battleId, createdAt: Date.now() });

    this.currentBattleId = battleId;
    this.currentPlayerId = hostId;

    // Setup presence tracking
    this.setupPresence(battleId, hostId, 'host');

    console.log(`[RealtimeBattle] Created battle ${battleCode}`);
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
  ): Promise<RealtimeBattle | null> {
    try {
      console.log(`[RealtimeBattle] Attempting to join battle with code: ${battleCode}`);
      
      // Look up battle ID from code
      const codeRef = ref(database, `battleCodes/${battleCode}`);
      const codeSnapshot = await get(codeRef);
      
      console.log(`[RealtimeBattle] Code lookup result:`, codeSnapshot.exists(), codeSnapshot.val());
      
      if (!codeSnapshot.exists()) {
        console.log(`[RealtimeBattle] Battle code ${battleCode} not found in database`);
        return null;
      }

      const { battleId } = codeSnapshot.val();
      console.log(`[RealtimeBattle] Found battleId: ${battleId}`);
      
      const battleRef = ref(database, `battles/${battleId}`);
      const battleSnapshot = await get(battleRef);

      if (!battleSnapshot.exists()) {
        console.log(`[RealtimeBattle] Battle ${battleId} not found`);
        return null;
      }

      const battle: RealtimeBattle = battleSnapshot.val();
      console.log(`[RealtimeBattle] Battle status: ${battle.status}, has challenger: ${!!battle.challenger}`);

      // Check if battle is joinable
      if (battle.status !== 'waiting') {
        console.log(`[RealtimeBattle] Battle ${battleCode} is not waiting (${battle.status})`);
        return null;
      }

      if (battle.challenger) {
        console.log(`[RealtimeBattle] Battle ${battleCode} already has a challenger`);
        return null;
      }

      // Add challenger
      const challenger: BattlePlayer = {
        id: challengerId,
        name: challengerName,
        avatarColor: challengerAvatarColor,
        score: 0,
        currentQuestion: 0,
        answers: [],
        isReady: false,
        isConnected: true,
        lastSeen: Date.now(),
      };

      await update(battleRef, {
        challenger,
        status: 'ready',
      });

      this.currentBattleId = battleId;
      this.currentPlayerId = challengerId;

      // Setup presence tracking
      this.setupPresence(battleId, challengerId, 'challenger');

      console.log(`[RealtimeBattle] Successfully joined battle ${battleCode}`);
      
      // Get updated battle
      const updatedSnapshot = await get(battleRef);
      return updatedSnapshot.val();
    } catch (error) {
      console.error(`[RealtimeBattle] Error joining battle:`, error);
      return null;
    }
  }

  /**
   * Mark player as ready
   */
  async setPlayerReady(battleId: string, playerId: string): Promise<void> {
    const battleRef = ref(database, `battles/${battleId}`);
    const snapshot = await get(battleRef);
    
    if (!snapshot.exists()) return;
    
    const battle: RealtimeBattle = snapshot.val();
    const isHost = battle.host.id === playerId;

    if (isHost) {
      await update(ref(database, `battles/${battleId}/host`), { 
        isReady: true,
        lastSeen: Date.now()
      });
    } else if (battle.challenger?.id === playerId) {
      await update(ref(database, `battles/${battleId}/challenger`), { 
        isReady: true,
        lastSeen: Date.now()
      });
    }

    // Check if both players are ready - start countdown
    const updatedSnapshot = await get(battleRef);
    const updatedBattle: RealtimeBattle = updatedSnapshot.val();
    
    if (updatedBattle.host.isReady && updatedBattle.challenger?.isReady && updatedBattle.status === 'ready') {
      await update(battleRef, {
        status: 'countdown',
        countdownStart: Date.now(),
      });
      
      // After 3 seconds, start the battle
      setTimeout(async () => {
        const currentSnapshot = await get(battleRef);
        if (currentSnapshot.exists()) {
          const current = currentSnapshot.val();
          if (current.status === 'countdown') {
            await update(battleRef, {
              status: 'in_progress',
              startedAt: Date.now(),
            });
          }
        }
      }, 3000);
    }
  }

  /**
   * Submit an answer
   */
  async submitAnswer(
    battleId: string,
    playerId: string,
    questionIndex: number,
    isCorrect: boolean,
    timeMs: number
  ): Promise<void> {
    const battleRef = ref(database, `battles/${battleId}`);
    const snapshot = await get(battleRef);
    
    if (!snapshot.exists()) return;
    
    const battle: RealtimeBattle = snapshot.val();
    const isHost = battle.host.id === playerId;
    const playerPath = isHost ? 'host' : 'challenger';
    const player = isHost ? battle.host : battle.challenger;

    if (!player) return;

    // Calculate score (10 points + speed bonus)
    const speedBonus = isCorrect ? Math.max(0, Math.floor((30000 - timeMs) / 1000)) : 0;
    const pointsEarned = isCorrect ? 10 + speedBonus : 0;

    // Update player state
    const newAnswers = [...(player.answers || []), { questionIndex, correct: isCorrect, timeMs }];
    const newScore = player.score + pointsEarned;
    const newCurrentQuestion = questionIndex + 1;

    await update(ref(database, `battles/${battleId}/${playerPath}`), {
      answers: newAnswers,
      score: newScore,
      currentQuestion: newCurrentQuestion,
      lastSeen: Date.now(),
    });

    // Check if battle is complete
    await this.checkBattleComplete(battleId);
  }

  /**
   * Check if battle is complete and determine winner
   */
  private async checkBattleComplete(battleId: string): Promise<void> {
    const battleRef = ref(database, `battles/${battleId}`);
    const snapshot = await get(battleRef);
    
    if (!snapshot.exists()) return;
    
    const battle: RealtimeBattle = snapshot.val();
    const totalQuestions = battle.questions.length;
    
    const hostDone = battle.host.currentQuestion >= totalQuestions;
    const challengerDone = battle.challenger?.currentQuestion 
      ? battle.challenger.currentQuestion >= totalQuestions 
      : false;

    if (hostDone && challengerDone) {
      // Determine winner
      const hostScore = battle.host.score;
      const challengerScore = battle.challenger?.score || 0;
      
      let winnerId: string;
      if (hostScore > challengerScore) {
        winnerId = battle.host.id;
      } else if (challengerScore > hostScore) {
        winnerId = battle.challenger!.id;
      } else {
        // Tie-breaker: total time
        const hostTime = (battle.host.answers || []).reduce((sum, a) => sum + a.timeMs, 0);
        const challengerTime = (battle.challenger?.answers || []).reduce((sum, a) => sum + a.timeMs, 0);
        winnerId = hostTime < challengerTime ? battle.host.id : battle.challenger!.id;
      }

      await update(battleRef, {
        status: 'completed',
        completedAt: Date.now(),
        winnerId,
      });
    }
  }

  /**
   * Subscribe to battle updates
   */
  subscribeToBattle(battleId: string, callback: (battle: RealtimeBattle | null) => void): Unsubscribe {
    const battleRef = ref(database, `battles/${battleId}`);
    
    const unsubscribe = onValue(battleRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('[RealtimeBattle] Subscription error:', error);
      callback(null);
    });

    this.battleListeners.set(battleId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Setup presence tracking for a player
   */
  private setupPresence(battleId: string, playerId: string, playerType: 'host' | 'challenger'): void {
    // Track connection state
    const connectedRef = ref(database, '.info/connected');
    const playerPresenceRef = ref(database, `battles/${battleId}/${playerType}`);
    
    this.presenceRef = playerPresenceRef;

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // We're connected
        update(playerPresenceRef, {
          isConnected: true,
          lastSeen: Date.now(),
        });

        // When we disconnect, update presence
        onDisconnect(playerPresenceRef).update({
          isConnected: false,
          lastSeen: Date.now(),
        });
      }
    });

    // Periodically update lastSeen
    const heartbeat = setInterval(() => {
      if (this.currentBattleId === battleId) {
        update(playerPresenceRef, { lastSeen: Date.now() }).catch(() => {
          clearInterval(heartbeat);
        });
      } else {
        clearInterval(heartbeat);
      }
    }, 5000);
  }

  /**
   * Find battles waiting for opponents
   */
  async findOpenBattles(): Promise<RealtimeBattle[]> {
    const battlesRef = ref(database, 'battles');
    const snapshot = await get(battlesRef);
    
    if (!snapshot.exists()) return [];

    const battles: RealtimeBattle[] = [];
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    snapshot.forEach((child) => {
      const battle = child.val() as RealtimeBattle;
      // Only show battles that are waiting and not too old
      if (battle.status === 'waiting' && (now - battle.createdAt) < maxAge) {
        battles.push(battle);
      }
    });

    return battles.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Leave/cancel a battle
   */
  async leaveBattle(battleId: string, playerId: string): Promise<void> {
    const battleRef = ref(database, `battles/${battleId}`);
    const snapshot = await get(battleRef);
    
    if (!snapshot.exists()) return;
    
    const battle: RealtimeBattle = snapshot.val();

    // Clean up listeners
    const listener = this.battleListeners.get(battleId);
    if (listener) {
      listener();
      this.battleListeners.delete(battleId);
    }

    // If host leaves waiting room, cancel the battle
    if (battle.host.id === playerId && battle.status === 'waiting') {
      await update(battleRef, { status: 'cancelled' });
      // Also remove the battle code lookup
      const codeRef = ref(database, `battleCodes/${battle.battleCode}`);
      await remove(codeRef);
    }
    // If challenger leaves, remove them
    else if (battle.challenger?.id === playerId && battle.status === 'ready') {
      await update(battleRef, { 
        challenger: null, 
        status: 'waiting' 
      });
    }
    // If battle is in progress, mark as forfeit
    else if (battle.status === 'in_progress') {
      const winnerId = battle.host.id === playerId ? battle.challenger?.id : battle.host.id;
      await update(battleRef, {
        status: 'completed',
        completedAt: Date.now(),
        winnerId,
      });
    }

    if (this.currentBattleId === battleId) {
      this.currentBattleId = null;
      this.currentPlayerId = null;
    }
  }

  /**
   * Get current battle ID
   */
  getCurrentBattleId(): string | null {
    return this.currentBattleId;
  }

  /**
   * Get current player ID
   */
  getCurrentPlayerId(): string | null {
    return this.currentPlayerId;
  }

  /**
   * Get battle by ID
   */
  async getBattle(battleId: string): Promise<RealtimeBattle | null> {
    const battleRef = ref(database, `battles/${battleId}`);
    const snapshot = await get(battleRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  /**
   * Clean up old battles (call periodically)
   */
  async cleanupOldBattles(): Promise<void> {
    const battlesRef = ref(database, 'battles');
    const codesRef = ref(database, 'battleCodes');
    const snapshot = await get(battlesRef);
    
    if (!snapshot.exists()) return;

    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((child) => {
      const battle = child.val() as RealtimeBattle;
      if ((now - battle.createdAt) > maxAge) {
        deletePromises.push(remove(child.ref));
        deletePromises.push(remove(ref(database, `battleCodes/${battle.battleCode}`)));
      }
    });

    await Promise.all(deletePromises);
    console.log(`[RealtimeBattle] Cleaned up ${deletePromises.length / 2} old battles`);
  }

  /**
   * Get battle statistics for a user (from localStorage history)
   */
  getUserBattleStats(userId: string): {
    totalBattles: number;
    wins: number;
    losses: number;
    winRate: number;
  } {
    try {
      const history = JSON.parse(localStorage.getItem('ks2_battle_history') || '[]');
      const userBattles = history.filter((b: any) => 
        b.hostId === userId || b.challengerId === userId
      );
      
      const wins = userBattles.filter((b: any) => b.winnerId === userId).length;
      
      return {
        totalBattles: userBattles.length,
        wins,
        losses: userBattles.length - wins,
        winRate: userBattles.length > 0 ? Math.round((wins / userBattles.length) * 100) : 0,
      };
    } catch {
      return { totalBattles: 0, wins: 0, losses: 0, winRate: 0 };
    }
  }

  /**
   * Save battle to history (call when battle completes)
   */
  saveBattleToHistory(battle: RealtimeBattle): void {
    try {
      const history = JSON.parse(localStorage.getItem('ks2_battle_history') || '[]');
      history.unshift({
        id: battle.id,
        hostId: battle.host.id,
        hostName: battle.host.name,
        hostScore: battle.host.score,
        challengerId: battle.challenger?.id,
        challengerName: battle.challenger?.name,
        challengerScore: battle.challenger?.score || 0,
        winnerId: battle.winnerId,
        completedAt: battle.completedAt,
        subject: battle.subject,
        difficulty: battle.difficulty,
      });
      // Keep only last 50 battles
      localStorage.setItem('ks2_battle_history', JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error('[RealtimeBattle] Failed to save battle history:', error);
    }
  }
}

export const realtimeBattleService = new RealtimeBattleService();
