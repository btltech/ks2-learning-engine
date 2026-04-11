/**
 * Social Learning Service
 * Manages friends, study rooms, and social interactions
 */

export interface Friend {
  userId: string;
  displayName: string;
  avatar?: string;
  level: number;
  points: number;
  lastActive: number;
  mutualFriends: number;
  status: 'online' | 'offline' | 'in-quiz';
}

export interface FriendRequest {
  requestId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  timestamp: number;
  message?: string;
}

export interface StudyRoom {
  roomId: string;
  name: string;
  subject: string;
  topic?: string;
  hostId: string;
  hostName: string;
  participants: string[];
  maxParticipants: number;
  isPublic: boolean;
  createdAt: number;
  status: 'waiting' | 'active' | 'completed';
  currentActivity?: 'quiz' | 'discussion' | 'challenge';
}

export interface FriendChallenge {
  challengeId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: number;
  expiresAt: number;
  fromScore?: number;
  toScore?: number;
  winnerId?: string;
}

const STORAGE_KEY_FRIENDS = 'ks2_friends';
const STORAGE_KEY_REQUESTS = 'ks2_friend_requests';
const STORAGE_KEY_CHALLENGES = 'ks2_challenges';

class SocialLearningService {
  private friends: Friend[] = [];
  private friendRequests: FriendRequest[] = [];
  private challenges: FriendChallenge[] = [];
  private currentUserId: string = '';

  constructor() {
    this.loadData();
  }

  /**
   * Initialize with current user ID
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
    this.loadData();
  }

  // ============ FRIEND SYSTEM ============

  /**
   * Send friend request
   */
  async sendFriendRequest(
    toUserId: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Check if already friends
    if (this.friends.some(f => f.userId === toUserId)) {
      return { success: false, error: 'Already friends' };
    }

    // Check if request already sent
    const existingRequest = this.friendRequests.find(
      r => r.fromUserId === this.currentUserId
    );
    if (existingRequest) {
      return { success: false, error: 'Request already sent' };
    }

    // In production, this would call Firebase RTDB
    // For now, simulate with localStorage
    const request: FriendRequest = {
      requestId: `req_${Date.now()}`,
      fromUserId: this.currentUserId,
      fromUserName: 'You', // Would be from user profile
      timestamp: Date.now(),
      message,
    };

    this.friendRequests.push(request);
    this.saveData();

    return { success: true };
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string): Promise<boolean> {
    const request = this.friendRequests.find(r => r.requestId === requestId);
    if (!request) return false;

    // Add to friends list
    const newFriend: Friend = {
      userId: request.fromUserId,
      displayName: request.fromUserName,
      avatar: request.fromUserAvatar,
      level: 1, // Would fetch from database
      points: 0,
      lastActive: Date.now(),
      mutualFriends: 0,
      status: 'offline',
    };

    this.friends.push(newFriend);

    // Remove request
    this.friendRequests = this.friendRequests.filter(r => r.requestId !== requestId);
    this.saveData();

    return true;
  }

  /**
   * Decline friend request
   */
  declineFriendRequest(requestId: string): void {
    this.friendRequests = this.friendRequests.filter(r => r.requestId !== requestId);
    this.saveData();
  }

  /**
   * Remove friend
   */
  removeFriend(userId: string): void {
    this.friends = this.friends.filter(f => f.userId !== userId);
    this.saveData();
  }

  /**
   * Get all friends
   */
  getFriends(): Friend[] {
    return [...this.friends];
  }

  /**
   * Get online friends
   */
  getOnlineFriends(): Friend[] {
    return this.friends.filter(f => f.status === 'online' || f.status === 'in-quiz');
  }

  /**
   * Get friend requests
   */
  getFriendRequests(): FriendRequest[] {
    return [...this.friendRequests];
  }

  /**
   * Search for friends by name
   */
  searchFriends(query: string): Friend[] {
    const lowerQuery = query.toLowerCase();
    return this.friends.filter(f =>
      f.displayName.toLowerCase().includes(lowerQuery)
    );
  }

  // ============ FRIEND CHALLENGES ============

  /**
   * Create friend challenge
   */
  createChallenge(
    friendId: string,
    subject: string,
    topic: string,
    difficulty: string,
    questionCount: number = 10
  ): FriendChallenge {
    const friend = this.friends.find(f => f.userId === friendId);
    if (!friend) throw new Error('Friend not found');

    const challenge: FriendChallenge = {
      challengeId: `challenge_${Date.now()}`,
      fromUserId: this.currentUserId,
      fromUserName: 'You',
      toUserId: friendId,
      subject,
      topic,
      difficulty,
      questionCount,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };

    this.challenges.push(challenge);
    this.saveData();

    return challenge;
  }

  /**
   * Accept challenge
   */
  acceptChallenge(challengeId: string): FriendChallenge | null {
    const challenge = this.challenges.find(c => c.challengeId === challengeId);
    if (!challenge) return null;

    challenge.status = 'accepted';
    this.saveData();

    return challenge;
  }

  /**
   * Decline challenge
   */
  declineChallenge(challengeId: string): void {
    const challenge = this.challenges.find(c => c.challengeId === challengeId);
    if (challenge) {
      challenge.status = 'declined';
      this.saveData();
    }
  }

  /**
   * Complete challenge
   */
  completeChallenge(
    challengeId: string,
    isInitiator: boolean,
    score: number
  ): FriendChallenge | null {
    const challenge = this.challenges.find(c => c.challengeId === challengeId);
    if (!challenge) return null;

    if (isInitiator) {
      challenge.fromScore = score;
    } else {
      challenge.toScore = score;
    }

    // Determine winner if both scores are in
    if (challenge.fromScore !== undefined && challenge.toScore !== undefined) {
      challenge.status = 'completed';
      challenge.winnerId =
        challenge.fromScore > challenge.toScore
          ? challenge.fromUserId
          : challenge.toUserId;
    }

    this.saveData();
    return challenge;
  }

  /**
   * Get pending challenges
   */
  getPendingChallenges(): FriendChallenge[] {
    return this.challenges.filter(
      c => c.status === 'pending' && c.toUserId === this.currentUserId
    );
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(): FriendChallenge[] {
    return this.challenges.filter(
      c =>
        c.status === 'accepted' &&
        (c.fromUserId === this.currentUserId || c.toUserId === this.currentUserId)
    );
  }

  /**
   * Get challenge history
   */
  getChallengeHistory(): FriendChallenge[] {
    return this.challenges
      .filter(c => c.status === 'completed')
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ============ SOCIAL LEADERBOARD ============

  /**
   * Get friends leaderboard
   */
  getFriendsLeaderboard(): Friend[] {
    return [...this.friends].sort((a, b) => b.points - a.points);
  }

  /**
   * Get friend comparison
   */
  compareFriend(friendId: string): {
    friend: Friend;
    pointsDifference: number;
    levelDifference: number;
    ahead: boolean;
  } | null {
    const friend = this.friends.find(f => f.userId === friendId);
    if (!friend) return null;

    // Would get current user stats from context
    const currentUserPoints = 1000; // Placeholder
    const currentUserLevel = 5; // Placeholder

    return {
      friend,
      pointsDifference: Math.abs(currentUserPoints - friend.points),
      levelDifference: Math.abs(currentUserLevel - friend.level),
      ahead: currentUserPoints > friend.points,
    };
  }

  // ============ STUDY ROOMS (Stub for Phase 2.2.2) ============

  /**
   * Create study room
   */
  async createStudyRoom(
    name: string,
    subject: string,
    isPublic: boolean,
    maxParticipants: number = 6
  ): Promise<StudyRoom> {
    const room: StudyRoom = {
      roomId: `room_${Date.now()}`,
      name,
      subject,
      hostId: this.currentUserId,
      hostName: 'You',
      participants: [this.currentUserId],
      maxParticipants,
      isPublic,
      createdAt: Date.now(),
      status: 'waiting',
    };

    // Would save to Firebase RTDB
    console.log('[SocialLearning] Created study room:', room);
    return room;
  }

  /**
   * Join study room
   */
  async joinStudyRoom(roomId: string): Promise<boolean> {
    // Would update Firebase RTDB
    console.log('[SocialLearning] Joined study room:', roomId);
    return true;
  }

  // ============ STORAGE ============

  private loadData(): void {
    try {
      const friendsData = localStorage.getItem(STORAGE_KEY_FRIENDS);
      if (friendsData) {
        this.friends = JSON.parse(friendsData);
      }

      const requestsData = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (requestsData) {
        this.friendRequests = JSON.parse(requestsData);
      }

      const challengesData = localStorage.getItem(STORAGE_KEY_CHALLENGES);
      if (challengesData) {
        this.challenges = JSON.parse(challengesData);
      }
    } catch (error) {
      console.error('[SocialLearning] Failed to load data:', error);
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(this.friends));
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(this.friendRequests));
      localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(this.challenges));
    } catch (error) {
      console.error('[SocialLearning] Failed to save data:', error);
    }
  }

  /**
   * Clear all social data (for testing)
   */
  clearAll(): void {
    this.friends = [];
    this.friendRequests = [];
    this.challenges = [];
    this.saveData();
  }
}

// Export singleton
export const socialLearningService = new SocialLearningService();
