/**
 * Avatar Customization Service
 * 
 * Manages avatar customization options, unlockable items, and purchases
 */

// Types
export interface AvatarItem {
  id: string;
  name: string;
  category: AvatarCategory;
  icon: string;
  color?: string;
  unlockCondition: UnlockCondition;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type AvatarCategory = 
  | 'character' 
  | 'hat' 
  | 'accessory' 
  | 'background' 
  | 'effect' 
  | 'frame';

export interface UnlockCondition {
  type: 'default' | 'xp' | 'streak' | 'achievement' | 'subject_mastery' | 'daily_reward';
  value?: number | string;
  description?: string;
}

export interface AvatarConfig {
  character: string;
  characterColor: string;
  hat: string | null;
  accessory: string | null;
  background: string;
  effect: string | null;
  frame: string | null;
}

export interface AvatarState {
  config: AvatarConfig;
  unlockedItems: string[];
  totalXpSpent: number;
}

// Available avatar items
const AVATAR_ITEMS: AvatarItem[] = [
  // Characters (default unlocked)
  { id: 'char_robot', name: 'Robot', category: 'character', icon: '🤖', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'char_alien', name: 'Alien', category: 'character', icon: '👽', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'char_wizard', name: 'Wizard', category: 'character', icon: '🧙', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'char_astronaut', name: 'Astronaut', category: 'character', icon: '👨‍🚀', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'char_ninja', name: 'Ninja', category: 'character', icon: '🥷', unlockCondition: { type: 'xp', value: 500 }, rarity: 'rare' },
  { id: 'char_superhero', name: 'Superhero', category: 'character', icon: '🦸', unlockCondition: { type: 'streak', value: 7 }, rarity: 'rare' },
  { id: 'char_dragon', name: 'Dragon', category: 'character', icon: '🐉', unlockCondition: { type: 'xp', value: 2000 }, rarity: 'epic' },
  { id: 'char_unicorn', name: 'Unicorn', category: 'character', icon: '🦄', unlockCondition: { type: 'achievement', value: 'perfect_week' }, rarity: 'legendary' },

  // Character colors
  { id: 'color_blue', name: 'Blue', category: 'character', icon: '🔵', color: '#3B82F6', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'color_green', name: 'Green', category: 'character', icon: '🟢', color: '#22C55E', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'color_purple', name: 'Purple', category: 'character', icon: '🟣', color: '#A855F7', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'color_orange', name: 'Orange', category: 'character', icon: '🟠', color: '#F97316', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'color_pink', name: 'Pink', category: 'character', icon: '🩷', color: '#EC4899', unlockCondition: { type: 'xp', value: 200 }, rarity: 'rare' },
  { id: 'color_gold', name: 'Gold', category: 'character', icon: '🌟', color: '#EAB308', unlockCondition: { type: 'streak', value: 14 }, rarity: 'epic' },
  { id: 'color_rainbow', name: 'Rainbow', category: 'character', icon: '🌈', color: 'linear-gradient(90deg, red, orange, yellow, green, blue, violet)', unlockCondition: { type: 'streak', value: 30 }, rarity: 'legendary' },

  // Hats
  { id: 'hat_none', name: 'None', category: 'hat', icon: '❌', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'hat_crown', name: 'Crown', category: 'hat', icon: '👑', unlockCondition: { type: 'xp', value: 100 }, rarity: 'common' },
  { id: 'hat_wizard', name: 'Wizard Hat', category: 'hat', icon: '🎩', unlockCondition: { type: 'xp', value: 250 }, rarity: 'rare' },
  { id: 'hat_graduation', name: 'Graduation Cap', category: 'hat', icon: '🎓', unlockCondition: { type: 'subject_mastery', value: 'any' }, rarity: 'rare' },
  { id: 'hat_party', name: 'Party Hat', category: 'hat', icon: '🎉', unlockCondition: { type: 'daily_reward' }, rarity: 'common' },
  { id: 'hat_santa', name: 'Santa Hat', category: 'hat', icon: '🎅', unlockCondition: { type: 'achievement', value: 'holiday_special' }, rarity: 'epic' },
  { id: 'hat_viking', name: 'Viking Helmet', category: 'hat', icon: '⚔️', unlockCondition: { type: 'xp', value: 1000 }, rarity: 'epic' },

  // Accessories
  { id: 'acc_none', name: 'None', category: 'accessory', icon: '❌', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'acc_glasses', name: 'Glasses', category: 'accessory', icon: '👓', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'acc_sunglasses', name: 'Sunglasses', category: 'accessory', icon: '🕶️', unlockCondition: { type: 'xp', value: 150 }, rarity: 'common' },
  { id: 'acc_monocle', name: 'Monocle', category: 'accessory', icon: '🧐', unlockCondition: { type: 'xp', value: 300 }, rarity: 'rare' },
  { id: 'acc_bowtie', name: 'Bow Tie', category: 'accessory', icon: '🎀', unlockCondition: { type: 'daily_reward' }, rarity: 'common' },
  { id: 'acc_medal', name: 'Medal', category: 'accessory', icon: '🏅', unlockCondition: { type: 'achievement', value: 'first_perfect' }, rarity: 'rare' },
  { id: 'acc_trophy', name: 'Trophy', category: 'accessory', icon: '🏆', unlockCondition: { type: 'achievement', value: 'top_scorer' }, rarity: 'epic' },

  // Backgrounds
  { id: 'bg_default', name: 'Default', category: 'background', icon: '⬜', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'bg_stars', name: 'Stars', category: 'background', icon: '⭐', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'bg_forest', name: 'Forest', category: 'background', icon: '🌲', unlockCondition: { type: 'subject_mastery', value: 'Science' }, rarity: 'rare' },
  { id: 'bg_ocean', name: 'Ocean', category: 'background', icon: '🌊', unlockCondition: { type: 'xp', value: 400 }, rarity: 'rare' },
  { id: 'bg_space', name: 'Space', category: 'background', icon: '🚀', unlockCondition: { type: 'xp', value: 800 }, rarity: 'epic' },
  { id: 'bg_rainbow', name: 'Rainbow', category: 'background', icon: '🌈', unlockCondition: { type: 'streak', value: 21 }, rarity: 'epic' },
  { id: 'bg_galaxy', name: 'Galaxy', category: 'background', icon: '🌌', unlockCondition: { type: 'xp', value: 3000 }, rarity: 'legendary' },

  // Effects
  { id: 'effect_none', name: 'None', category: 'effect', icon: '❌', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'effect_sparkle', name: 'Sparkle', category: 'effect', icon: '✨', unlockCondition: { type: 'daily_reward' }, rarity: 'rare' },
  { id: 'effect_fire', name: 'Fire', category: 'effect', icon: '🔥', unlockCondition: { type: 'streak', value: 7 }, rarity: 'rare' },
  { id: 'effect_lightning', name: 'Lightning', category: 'effect', icon: '⚡', unlockCondition: { type: 'xp', value: 600 }, rarity: 'epic' },
  { id: 'effect_hearts', name: 'Hearts', category: 'effect', icon: '💕', unlockCondition: { type: 'streak', value: 14 }, rarity: 'epic' },
  { id: 'effect_confetti', name: 'Confetti', category: 'effect', icon: '🎊', unlockCondition: { type: 'achievement', value: 'party_time' }, rarity: 'legendary' },

  // Frames
  { id: 'frame_none', name: 'None', category: 'frame', icon: '❌', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'frame_circle', name: 'Circle', category: 'frame', icon: '⭕', unlockCondition: { type: 'default' }, rarity: 'common' },
  { id: 'frame_square', name: 'Square', category: 'frame', icon: '⬛', unlockCondition: { type: 'xp', value: 100 }, rarity: 'common' },
  { id: 'frame_star', name: 'Star', category: 'frame', icon: '⭐', unlockCondition: { type: 'xp', value: 300 }, rarity: 'rare' },
  { id: 'frame_diamond', name: 'Diamond', category: 'frame', icon: '💎', unlockCondition: { type: 'xp', value: 750 }, rarity: 'epic' },
  { id: 'frame_dragon', name: 'Dragon', category: 'frame', icon: '🐲', unlockCondition: { type: 'xp', value: 1500 }, rarity: 'legendary' },
];

// Default avatar configuration
const DEFAULT_CONFIG: AvatarConfig = {
  character: 'char_robot',
  characterColor: 'color_blue',
  hat: null,
  accessory: null,
  background: 'bg_default',
  effect: null,
  frame: 'frame_circle',
};

class AvatarCustomizationService {
  private state: AvatarState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AvatarState {
    const stored = localStorage.getItem('ks2_avatar_state');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initial state with default items unlocked
    const defaultUnlocked = AVATAR_ITEMS
      .filter(item => item.unlockCondition.type === 'default')
      .map(item => item.id);

    return {
      config: { ...DEFAULT_CONFIG },
      unlockedItems: defaultUnlocked,
      totalXpSpent: 0,
    };
  }

  private saveState(): void {
    localStorage.setItem('ks2_avatar_state', JSON.stringify(this.state));
  }

  /**
   * Get current avatar configuration
   */
  getConfig(): AvatarConfig {
    return { ...this.state.config };
  }

  /**
   * Get all available items
   */
  getAllItems(): AvatarItem[] {
    return [...AVATAR_ITEMS];
  }

  /**
   * Get items by category
   */
  getItemsByCategory(category: AvatarCategory): AvatarItem[] {
    return AVATAR_ITEMS.filter(item => item.category === category);
  }

  /**
   * Get unlocked items
   */
  getUnlockedItems(): AvatarItem[] {
    return AVATAR_ITEMS.filter(item => this.state.unlockedItems.includes(item.id));
  }

  /**
   * Get locked items
   */
  getLockedItems(): AvatarItem[] {
    return AVATAR_ITEMS.filter(item => !this.state.unlockedItems.includes(item.id));
  }

  /**
   * Check if an item is unlocked
   */
  isUnlocked(itemId: string): boolean {
    return this.state.unlockedItems.includes(itemId);
  }

  /**
   * Check unlock progress for an item
   */
  getUnlockProgress(itemId: string, currentXp: number, currentStreak: number): {
    unlocked: boolean;
    progress: number;
    progressText: string;
  } {
    const item = AVATAR_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return { unlocked: false, progress: 0, progressText: 'Unknown item' };
    }

    if (this.state.unlockedItems.includes(itemId)) {
      return { unlocked: true, progress: 100, progressText: 'Unlocked!' };
    }

    const { type, value } = item.unlockCondition;

    switch (type) {
      case 'default':
        return { unlocked: true, progress: 100, progressText: 'Unlocked!' };
      
      case 'xp':
        const xpNeeded = value as number;
        const xpProgress = Math.min((currentXp / xpNeeded) * 100, 100);
        return {
          unlocked: currentXp >= xpNeeded,
          progress: xpProgress,
          progressText: `${currentXp}/${xpNeeded} XP`,
        };
      
      case 'streak':
        const streakNeeded = value as number;
        const streakProgress = Math.min((currentStreak / streakNeeded) * 100, 100);
        return {
          unlocked: currentStreak >= streakNeeded,
          progress: streakProgress,
          progressText: `${currentStreak}/${streakNeeded} day streak`,
        };
      
      case 'achievement':
        return {
          unlocked: false,
          progress: 0,
          progressText: `Earn "${value}" achievement`,
        };
      
      case 'subject_mastery':
        return {
          unlocked: false,
          progress: 0,
          progressText: `Master ${value === 'any' ? 'any subject' : value}`,
        };
      
      case 'daily_reward':
        return {
          unlocked: false,
          progress: 0,
          progressText: 'Collect from daily rewards',
        };
      
      default:
        return { unlocked: false, progress: 0, progressText: 'Unknown unlock condition' };
    }
  }

  /**
   * Attempt to unlock an item based on current stats
   */
  tryUnlock(itemId: string, currentXp: number, currentStreak: number): boolean {
    if (this.state.unlockedItems.includes(itemId)) {
      return true; // Already unlocked
    }

    const item = AVATAR_ITEMS.find(i => i.id === itemId);
    if (!item) return false;

    const { type, value } = item.unlockCondition;
    let canUnlock = false;

    switch (type) {
      case 'default':
        canUnlock = true;
        break;
      case 'xp':
        canUnlock = currentXp >= (value as number);
        break;
      case 'streak':
        canUnlock = currentStreak >= (value as number);
        break;
    }

    if (canUnlock) {
      this.state.unlockedItems.push(itemId);
      this.saveState();
      return true;
    }

    return false;
  }

  /**
   * Unlock an item (for achievements/daily rewards)
   */
  unlockItem(itemId: string): boolean {
    if (this.state.unlockedItems.includes(itemId)) {
      return false;
    }

    const item = AVATAR_ITEMS.find(i => i.id === itemId);
    if (!item) return false;

    this.state.unlockedItems.push(itemId);
    this.saveState();
    return true;
  }

  /**
   * Equip an item
   */
  equipItem(itemId: string): boolean {
    if (!this.state.unlockedItems.includes(itemId)) {
      return false;
    }

    const item = AVATAR_ITEMS.find(i => i.id === itemId);
    if (!item) return false;

    switch (item.category) {
      case 'character':
        if (item.color) {
          this.state.config.characterColor = itemId;
        } else {
          this.state.config.character = itemId;
        }
        break;
      case 'hat':
        this.state.config.hat = itemId === 'hat_none' ? null : itemId;
        break;
      case 'accessory':
        this.state.config.accessory = itemId === 'acc_none' ? null : itemId;
        break;
      case 'background':
        this.state.config.background = itemId;
        break;
      case 'effect':
        this.state.config.effect = itemId === 'effect_none' ? null : itemId;
        break;
      case 'frame':
        this.state.config.frame = itemId === 'frame_none' ? null : itemId;
        break;
    }

    this.saveState();
    return true;
  }

  /**
   * Get the display representation of current avatar
   */
  getAvatarDisplay(): {
    character: string;
    color: string;
    hat: string | null;
    accessory: string | null;
    background: string;
    effect: string | null;
    frame: string | null;
  } {
    const config = this.state.config;
    
    const getIcon = (id: string | null): string | null => {
      if (!id) return null;
      const item = AVATAR_ITEMS.find(i => i.id === id);
      return item?.icon || null;
    };

    const getColor = (id: string): string => {
      const item = AVATAR_ITEMS.find(i => i.id === id);
      return item?.color || '#3B82F6';
    };

    return {
      character: getIcon(config.character) || '🤖',
      color: getColor(config.characterColor),
      hat: getIcon(config.hat),
      accessory: getIcon(config.accessory),
      background: getIcon(config.background) || '⬜',
      effect: getIcon(config.effect),
      frame: getIcon(config.frame),
    };
  }

  /**
   * Check all unlockables against current stats
   */
  checkAllUnlocks(currentXp: number, currentStreak: number): string[] {
    const newlyUnlocked: string[] = [];

    AVATAR_ITEMS.forEach(item => {
      if (!this.state.unlockedItems.includes(item.id)) {
        if (this.tryUnlock(item.id, currentXp, currentStreak)) {
          newlyUnlocked.push(item.id);
        }
      }
    });

    return newlyUnlocked;
  }

  /**
   * Get rarity color
   */
  getRarityColor(rarity: AvatarItem['rarity']): string {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#A855F7';
      case 'legendary': return '#EAB308';
    }
  }

  /**
   * Reset to default
   */
  reset(): void {
    const defaultUnlocked = AVATAR_ITEMS
      .filter(item => item.unlockCondition.type === 'default')
      .map(item => item.id);

    this.state = {
      config: { ...DEFAULT_CONFIG },
      unlockedItems: defaultUnlocked,
      totalXpSpent: 0,
    };
    this.saveState();
  }

  /**
   * Sync with store purchases from user profile
   * Maps store item IDs to avatar item IDs and unlocks them
   */
  syncWithStorePurchases(userUnlockedItems: string[]): string[] {
    const newlyUnlocked: string[] = [];
    
    // Map store item IDs to avatar item IDs
    const storeToAvatarMapping: Record<string, string> = {
      // Colors
      'color-blue': 'color_blue',
      'color-green': 'color_green',
      'color-purple': 'color_purple',
      'color-orange': 'color_orange',
      'color-pink': 'color_pink',
      'color-gold': 'color_gold',
      'color-rainbow': 'color_rainbow',
      'color-red': 'color_blue', // Map red to blue (not in avatar system)
      'color-cyan': 'color_blue',
      'color-emerald': 'color_green',
      'color-galaxy': 'color_rainbow',
      'color-diamond': 'color_rainbow',
      
      // Hats/Accessories from store
      'acc-glasses': 'acc_glasses',
      'acc-sunglasses': 'acc_sunglasses',
      'acc-monocle': 'acc_monocle',
      'acc-bow': 'acc_bowtie',
      'acc-crown': 'hat_crown',
      'acc-wizard-hat': 'hat_wizard',
      'acc-party-hat': 'hat_party',
      'acc-viking': 'hat_viking',
      'acc-halo': 'effect_sparkle',
      'acc-trophy': 'acc_trophy',
      'acc-medal': 'acc_medal',
      
      // Effects
      'effect-sparkle': 'effect_sparkle',
      'effect-bubbles': 'effect_sparkle',
      'effect-fire': 'effect_fire',
      'effect-lightning': 'effect_lightning',
      'effect-rainbow-trail': 'effect_confetti',
      
      // Backgrounds
      'bg-stars': 'bg_stars',
      'bg-forest': 'bg_forest',
      'bg-ocean': 'bg_ocean',
      'bg-space': 'bg_space',
      'bg-rainbow': 'bg_rainbow',
      'bg-galaxy': 'bg_galaxy',
    };

    userUnlockedItems.forEach(storeItemId => {
      const avatarItemId = storeToAvatarMapping[storeItemId];
      if (avatarItemId && !this.state.unlockedItems.includes(avatarItemId)) {
        // Verify the avatar item exists
        const avatarItem = AVATAR_ITEMS.find(i => i.id === avatarItemId);
        if (avatarItem) {
          this.state.unlockedItems.push(avatarItemId);
          newlyUnlocked.push(avatarItemId);
        }
      }
      
      // Also add the store item ID directly if it matches an avatar item
      if (!this.state.unlockedItems.includes(storeItemId)) {
        const directMatch = AVATAR_ITEMS.find(i => i.id === storeItemId);
        if (directMatch) {
          this.state.unlockedItems.push(storeItemId);
          newlyUnlocked.push(storeItemId);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveState();
    }

    return newlyUnlocked;
  }

  /**
   * Get store item IDs that are unlocked in avatar system
   * Used for reverse sync
   */
  getUnlockedStoreItemIds(): string[] {
    const avatarToStoreMapping: Record<string, string> = {
      'color_blue': 'color-blue',
      'color_green': 'color-green',
      'color_purple': 'color-purple',
      'color_orange': 'color-orange',
      'color_pink': 'color-pink',
      'color_gold': 'color-gold',
      'color_rainbow': 'color-rainbow',
      'acc_glasses': 'acc-glasses',
      'acc_sunglasses': 'acc-sunglasses',
      'acc_monocle': 'acc-monocle',
      'acc_bowtie': 'acc-bow',
      'hat_crown': 'acc-crown',
      'hat_wizard': 'acc-wizard-hat',
      'hat_party': 'acc-party-hat',
      'hat_viking': 'acc-viking',
      'acc_trophy': 'acc-trophy',
      'acc_medal': 'acc-medal',
      'effect_sparkle': 'effect-sparkle',
      'effect_fire': 'effect-fire',
      'effect_lightning': 'effect-lightning',
      'effect_confetti': 'effect-rainbow-trail',
      'bg_stars': 'bg-stars',
      'bg_forest': 'bg-forest',
      'bg_ocean': 'bg-ocean',
      'bg_space': 'bg-space',
      'bg_rainbow': 'bg-rainbow',
      'bg_galaxy': 'bg-galaxy',
    };

    return this.state.unlockedItems
      .map(id => avatarToStoreMapping[id])
      .filter((id): id is string => !!id);
  }

  /**
   * Add unlocked items directly (for store purchases or rewards)
   */
  addUnlockedItems(itemIds: string[]): void {
    itemIds.forEach(id => {
      if (!this.state.unlockedItems.includes(id)) {
        this.state.unlockedItems.push(id);
      }
    });
    this.saveState();
  }
}

export const avatarCustomizationService = new AvatarCustomizationService();
