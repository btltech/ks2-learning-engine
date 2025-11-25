import { StoreItem } from '../types';

export const STORE_ITEMS: StoreItem[] = [
  // ===== COLORS =====
  // Common Colors (Free or Cheap)
  { 
    id: 'color-blue', 
    name: 'Classic Blue', 
    type: 'color', 
    cost: 0, 
    value: 'bg-blue-500', 
    icon: '🔵',
    description: 'A trusty blue - perfect for any learner!',
    rarity: 'common',
    previewColor: '#3B82F6'
  },
  { 
    id: 'color-green', 
    name: 'Forest Green', 
    type: 'color', 
    cost: 50, 
    value: 'bg-green-500', 
    icon: '🟢',
    description: 'Fresh as a forest morning!',
    rarity: 'common',
    previewColor: '#22C55E'
  },
  { 
    id: 'color-red', 
    name: 'Rocket Red', 
    type: 'color', 
    cost: 50, 
    value: 'bg-red-500', 
    icon: '🔴',
    description: 'Ready to blast off with learning!',
    rarity: 'common',
    previewColor: '#EF4444'
  },
  { 
    id: 'color-orange', 
    name: 'Sunset Orange', 
    type: 'color', 
    cost: 75, 
    value: 'bg-orange-500', 
    icon: '🟠',
    description: 'Warm like a beautiful sunset',
    rarity: 'common',
    previewColor: '#F97316'
  },
  
  // Rare Colors
  { 
    id: 'color-purple', 
    name: 'Magic Purple', 
    type: 'color', 
    cost: 150, 
    value: 'bg-purple-500', 
    icon: '🟣',
    description: 'Mystical and magical!',
    rarity: 'rare',
    previewColor: '#A855F7'
  },
  { 
    id: 'color-pink', 
    name: 'Bubblegum Pink', 
    type: 'color', 
    cost: 150, 
    value: 'bg-pink-500', 
    icon: '💗',
    description: 'Sweet as candy!',
    rarity: 'rare',
    previewColor: '#EC4899'
  },
  { 
    id: 'color-cyan', 
    name: 'Ocean Cyan', 
    type: 'color', 
    cost: 200, 
    value: 'bg-cyan-500', 
    icon: '🩵',
    description: 'Deep as the ocean, bright as the sky',
    rarity: 'rare',
    previewColor: '#06B6D4'
  },
  
  // Epic Colors
  { 
    id: 'color-gold', 
    name: 'Super Gold', 
    type: 'color', 
    cost: 500, 
    value: 'bg-yellow-400', 
    icon: '🌟',
    description: 'Shine bright like a star!',
    rarity: 'epic',
    previewColor: '#FACC15'
  },
  { 
    id: 'color-emerald', 
    name: 'Emerald Gem', 
    type: 'color', 
    cost: 600, 
    value: 'bg-emerald-500', 
    icon: '💎',
    description: 'Precious and rare like you!',
    rarity: 'epic',
    previewColor: '#10B981'
  },
  
  // Legendary Colors
  { 
    id: 'color-rainbow', 
    name: 'Rainbow Sparkle', 
    type: 'color', 
    cost: 2000, 
    value: 'bg-gradient-rainbow', 
    icon: '🌈',
    description: 'All the colors of the rainbow!',
    rarity: 'legendary',
    previewColor: 'linear-gradient(90deg, #EF4444, #F97316, #FACC15, #22C55E, #3B82F6, #A855F7)'
  },
  { 
    id: 'color-galaxy', 
    name: 'Galaxy Swirl', 
    type: 'color', 
    cost: 2500, 
    value: 'bg-gradient-galaxy', 
    icon: '🌌',
    description: 'As mysterious as outer space!',
    rarity: 'legendary',
    previewColor: 'linear-gradient(135deg, #1E1B4B, #7C3AED, #EC4899)'
  },

  // ===== ACCESSORIES =====
  // Common Accessories
  { 
    id: 'acc-glasses', 
    name: 'Smart Glasses', 
    type: 'accessory', 
    cost: 100, 
    value: 'glasses', 
    icon: '👓',
    description: 'Look super smart!',
    rarity: 'common'
  },
  { 
    id: 'acc-bow', 
    name: 'Cute Bow', 
    type: 'accessory', 
    cost: 100, 
    value: 'bow', 
    icon: '🎀',
    description: 'Pretty and perfect!',
    rarity: 'common'
  },
  { 
    id: 'acc-cap', 
    name: 'Baseball Cap', 
    type: 'accessory', 
    cost: 125, 
    value: 'cap', 
    icon: '🧢',
    description: 'Ready to play!',
    rarity: 'common'
  },
  
  // Rare Accessories
  { 
    id: 'acc-hat', 
    name: 'Cowboy Hat', 
    type: 'accessory', 
    cost: 250, 
    value: 'hat', 
    icon: '🤠',
    description: 'Yeehaw! Howdy partner!',
    rarity: 'rare'
  },
  { 
    id: 'acc-headphones', 
    name: 'Cool Headphones', 
    type: 'accessory', 
    cost: 300, 
    value: 'headphones', 
    icon: '🎧',
    description: 'Listen to the music of learning!',
    rarity: 'rare'
  },
  { 
    id: 'acc-wizard-hat', 
    name: 'Wizard Hat', 
    type: 'accessory', 
    cost: 350, 
    value: 'wizard-hat', 
    icon: '🧙',
    description: 'Master of magical knowledge!',
    rarity: 'rare'
  },
  
  // Epic Accessories
  { 
    id: 'acc-crown', 
    name: 'Royal Crown', 
    type: 'accessory', 
    cost: 1000, 
    value: 'crown', 
    icon: '👑',
    description: 'Rule the kingdom of knowledge!',
    rarity: 'epic'
  },
  { 
    id: 'acc-halo', 
    name: 'Angel Halo', 
    type: 'accessory', 
    cost: 1200, 
    value: 'halo', 
    icon: '😇',
    description: 'A perfect little angel!',
    rarity: 'epic'
  },
  { 
    id: 'acc-sunglasses', 
    name: 'Star Sunglasses', 
    type: 'accessory', 
    cost: 800, 
    value: 'star-sunglasses', 
    icon: '⭐',
    description: 'Too cool for school... but not for learning!',
    rarity: 'epic'
  },
  
  // Legendary Accessories
  { 
    id: 'acc-astronaut', 
    name: 'Astronaut Helmet', 
    type: 'accessory', 
    cost: 3000, 
    value: 'astronaut', 
    icon: '👨‍🚀',
    description: 'Ready to explore the universe of knowledge!',
    rarity: 'legendary'
  },
  { 
    id: 'acc-dragon', 
    name: 'Dragon Wings', 
    type: 'accessory', 
    cost: 3500, 
    value: 'dragon-wings', 
    icon: '🐉',
    description: 'Soar through your studies!',
    rarity: 'legendary'
  },

  // ===== BACKGROUNDS =====
  // Common Backgrounds
  { 
    id: 'bg-classroom', 
    name: 'Classroom', 
    type: 'background', 
    cost: 75, 
    value: 'classroom', 
    icon: '🏫',
    description: 'Classic learning environment',
    rarity: 'common'
  },
  { 
    id: 'bg-park', 
    name: 'Sunny Park', 
    type: 'background', 
    cost: 100, 
    value: 'park', 
    icon: '🌳',
    description: 'Learn under the trees!',
    rarity: 'common'
  },
  
  // Rare Backgrounds
  { 
    id: 'bg-beach', 
    name: 'Beach Paradise', 
    type: 'background', 
    cost: 300, 
    value: 'beach', 
    icon: '🏖️',
    description: 'Waves of knowledge!',
    rarity: 'rare'
  },
  { 
    id: 'bg-library', 
    name: 'Magic Library', 
    type: 'background', 
    cost: 350, 
    value: 'library', 
    icon: '📚',
    description: 'Surrounded by endless books!',
    rarity: 'rare'
  },
  
  // Epic Backgrounds
  { 
    id: 'bg-space', 
    name: 'Outer Space', 
    type: 'background', 
    cost: 800, 
    value: 'space', 
    icon: '🚀',
    description: 'Learn among the stars!',
    rarity: 'epic'
  },
  { 
    id: 'bg-underwater', 
    name: 'Underwater World', 
    type: 'background', 
    cost: 900, 
    value: 'underwater', 
    icon: '🐠',
    description: 'Dive deep into learning!',
    rarity: 'epic'
  },
  
  // Legendary Backgrounds
  { 
    id: 'bg-castle', 
    name: 'Royal Castle', 
    type: 'background', 
    cost: 2000, 
    value: 'castle', 
    icon: '🏰',
    description: 'Learn like royalty!',
    rarity: 'legendary'
  },

  // ===== TITLES =====
  // Common Titles
  { 
    id: 'title-learner', 
    name: 'Eager Learner', 
    type: 'title', 
    cost: 50, 
    value: 'Eager Learner', 
    icon: '📖',
    description: 'Show everyone you love to learn!',
    rarity: 'common'
  },
  { 
    id: 'title-explorer', 
    name: 'Knowledge Explorer', 
    type: 'title', 
    cost: 75, 
    value: 'Knowledge Explorer', 
    icon: '🔍',
    description: 'Always exploring new topics!',
    rarity: 'common'
  },
  
  // Rare Titles
  { 
    id: 'title-wizard', 
    name: 'Quiz Wizard', 
    type: 'title', 
    cost: 200, 
    value: 'Quiz Wizard', 
    icon: '🧙‍♂️',
    description: 'Master of quizzes!',
    rarity: 'rare'
  },
  { 
    id: 'title-champion', 
    name: 'Learning Champion', 
    type: 'title', 
    cost: 250, 
    value: 'Learning Champion', 
    icon: '🏆',
    description: 'A true champion of knowledge!',
    rarity: 'rare'
  },
  
  // Epic Titles
  { 
    id: 'title-genius', 
    name: 'Young Genius', 
    type: 'title', 
    cost: 750, 
    value: 'Young Genius', 
    icon: '🧠',
    description: 'Big brain energy!',
    rarity: 'epic'
  },
  { 
    id: 'title-superstar', 
    name: 'Superstar Scholar', 
    type: 'title', 
    cost: 1000, 
    value: 'Superstar Scholar', 
    icon: '⭐',
    description: 'Shine bright in every subject!',
    rarity: 'epic'
  },
  
  // Legendary Titles
  { 
    id: 'title-master', 
    name: 'Grand Master', 
    type: 'title', 
    cost: 2500, 
    value: 'Grand Master', 
    icon: '👑',
    description: 'The ultimate title for the ultimate learner!',
    rarity: 'legendary'
  },

  // ===== SPECIAL EFFECTS =====
  // Rare Effects
  { 
    id: 'effect-sparkle', 
    name: 'Sparkle Trail', 
    type: 'effect', 
    cost: 400, 
    value: 'sparkle', 
    icon: '✨',
    description: 'Leave sparkles wherever you go!',
    rarity: 'rare'
  },
  { 
    id: 'effect-bubbles', 
    name: 'Bubble Pop', 
    type: 'effect', 
    cost: 450, 
    value: 'bubbles', 
    icon: '🫧',
    description: 'Floating bubbles follow you!',
    rarity: 'rare'
  },
  
  // Epic Effects
  { 
    id: 'effect-fire', 
    name: 'Flame Aura', 
    type: 'effect', 
    cost: 1500, 
    value: 'fire', 
    icon: '🔥',
    description: 'On fire with learning!',
    rarity: 'epic'
  },
  { 
    id: 'effect-lightning', 
    name: 'Lightning Bolt', 
    type: 'effect', 
    cost: 1500, 
    value: 'lightning', 
    icon: '⚡',
    description: 'Electric energy surrounds you!',
    rarity: 'epic'
  },
  
  // Legendary Effects
  { 
    id: 'effect-rainbow-trail', 
    name: 'Rainbow Trail', 
    type: 'effect', 
    cost: 4000, 
    value: 'rainbow-trail', 
    icon: '🌈',
    description: 'A magical rainbow follows your every move!',
    rarity: 'legendary'
  },

  // ===== ACHIEVEMENT-LOCKED ITEMS =====
  { 
    id: 'acc-trophy', 
    name: 'Champion Trophy', 
    type: 'accessory', 
    cost: 0, 
    value: 'trophy', 
    icon: '🏆',
    description: 'Awarded for completing 50 quizzes!',
    rarity: 'epic',
    requiresAchievement: 'quizzes-50'
  },
  { 
    id: 'title-legend', 
    name: 'Living Legend', 
    type: 'title', 
    cost: 0, 
    value: 'Living Legend', 
    icon: '🌟',
    description: 'Earned by reaching a 30-day streak!',
    rarity: 'legendary',
    requiresAchievement: 'streak-30'
  },
  { 
    id: 'color-diamond', 
    name: 'Diamond Shine', 
    type: 'color', 
    cost: 0, 
    value: 'bg-gradient-diamond', 
    icon: '💎',
    description: 'Unlocked by earning 10,000 total points!',
    rarity: 'legendary',
    requiresAchievement: 'points-10000',
    previewColor: 'linear-gradient(135deg, #E0F2FE, #7DD3FC, #38BDF8, #0EA5E9)'
  },
];

// Rarity colors for UI
export const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-600',
    glow: '',
    label: 'Common'
  },
  rare: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-600',
    glow: 'shadow-blue-200',
    label: 'Rare'
  },
  epic: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-600',
    glow: 'shadow-purple-200',
    label: 'Epic'
  },
  legendary: {
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    border: 'border-yellow-400',
    text: 'text-yellow-600',
    glow: 'shadow-yellow-300 shadow-lg',
    label: 'Legendary'
  }
};

export const storeService = {
  getItems: () => STORE_ITEMS,
  
  getItemById: (id: string) => STORE_ITEMS.find(i => i.id === id),
  
  getItemsByType: (type: StoreItem['type']) => STORE_ITEMS.filter(i => i.type === type),
  
  getItemsByRarity: (rarity: string) => STORE_ITEMS.filter(i => i.rarity === rarity),
  
  // Check if user can see/buy an achievement-locked item
  canAccessItem: (item: StoreItem, userAchievements: string[]): boolean => {
    if (!item.requiresAchievement) return true;
    return userAchievements.includes(item.requiresAchievement);
  },
  
  // Get items sorted by price
  getItemsSortedByPrice: (ascending = true) => {
    return [...STORE_ITEMS].sort((a, b) => 
      ascending ? a.cost - b.cost : b.cost - a.cost
    );
  },
  
  // Get items sorted by rarity
  getItemsSortedByRarity: () => {
    const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
    return [...STORE_ITEMS].sort((a, b) => 
      (rarityOrder[b.rarity || 'common']) - (rarityOrder[a.rarity || 'common'])
    );
  },
  
  // Calculate total value of owned items
  getTotalOwnedValue: (ownedItemIds: string[]) => {
    return STORE_ITEMS
      .filter(item => ownedItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.cost, 0);
  },
  
  // Get achievement-locked items
  getAchievementItems: () => STORE_ITEMS.filter(i => i.requiresAchievement),
};
