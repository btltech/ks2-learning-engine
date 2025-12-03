import React, { useState, useEffect } from 'react';
import { 
  avatarCustomizationService, 
  AvatarItem, 
  AvatarCategory, 
  AvatarConfig 
} from '../services/avatarCustomizationService';
import { useUser } from '../context/UserContext';

interface AvatarCustomizationProps {
  currentXp: number;
  currentStreak: number;
  onClose: () => void;
  onAvatarChange?: (config: AvatarConfig) => void;
}

const AvatarCustomization: React.FC<AvatarCustomizationProps> = ({
  currentXp,
  currentStreak,
  onClose,
  onAvatarChange,
}) => {
  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('character');
  const [config, setConfig] = useState(avatarCustomizationService.getConfig());
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState<AvatarItem | null>(null);

  useEffect(() => {
    // Sync with store purchases from user profile
    if (user?.unlockedItems) {
      const storeUnlocks = avatarCustomizationService.syncWithStorePurchases(user.unlockedItems);
      if (storeUnlocks.length > 0) {
        console.log('Synced store purchases to avatar system:', storeUnlocks);
      }
    }
    
    // Check for new unlocks based on XP and streak
    const unlocked = avatarCustomizationService.checkAllUnlocks(currentXp, currentStreak);
    if (unlocked.length > 0) {
      setNewUnlocks(unlocked);
      const item = avatarCustomizationService.getAllItems().find(i => i.id === unlocked[0]);
      if (item) setShowUnlockModal(item);
    }
    setUnlockedItems(avatarCustomizationService.getUnlockedItems().map(i => i.id));
  }, [currentXp, currentStreak, user?.unlockedItems]);

  const categories: { id: AvatarCategory; label: string; icon: string }[] = [
    { id: 'character', label: 'Character', icon: '👤' },
    { id: 'hat', label: 'Hats', icon: '🎩' },
    { id: 'accessory', label: 'Accessories', icon: '👓' },
    { id: 'background', label: 'Backgrounds', icon: '🖼️' },
    { id: 'effect', label: 'Effects', icon: '✨' },
    { id: 'frame', label: 'Frames', icon: '🖼️' },
  ];

  const handleEquip = (itemId: string) => {
    if (avatarCustomizationService.equipItem(itemId)) {
      const newConfig = avatarCustomizationService.getConfig();
      setConfig(newConfig);
      onAvatarChange?.(newConfig);
    }
  };

  const getItemsForCategory = (category: AvatarCategory) => {
    const items = avatarCustomizationService.getItemsByCategory(category);
    // For character category, separate characters and colors
    if (category === 'character') {
      return items.filter(item => !item.color);
    }
    return items;
  };

  const getColorsForCategory = () => {
    return avatarCustomizationService.getItemsByCategory('character').filter(item => item.color);
  };

  const isEquipped = (itemId: string) => {
    return config.character === itemId ||
           config.characterColor === itemId ||
           config.hat === itemId ||
           config.accessory === itemId ||
           config.background === itemId ||
           config.effect === itemId ||
           config.frame === itemId;
  };

  const display = avatarCustomizationService.getAvatarDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">{showUnlockModal.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-2">New Item Unlocked!</h2>
            <p className="text-white/90 mb-2">{showUnlockModal.name}</p>
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: avatarCustomizationService.getRarityColor(showUnlockModal.rarity) }}
            >
              {showUnlockModal.rarity.toUpperCase()}
            </span>
            <button
              onClick={() => {
                const remaining = newUnlocks.slice(1);
                if (remaining.length > 0) {
                  const item = avatarCustomizationService.getAllItems().find(i => i.id === remaining[0]);
                  if (item) setShowUnlockModal(item);
                  setNewUnlocks(remaining);
                } else {
                  setShowUnlockModal(null);
                  setNewUnlocks([]);
                }
              }}
              className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-white/90 transition-all"
            >
              {newUnlocks.length > 1 ? 'Next' : 'Awesome!'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-white">✨ Avatar Customization</h1>
            <p className="text-white/60">Personalize your character!</p>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="md:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sticky top-4">
              <h3 className="text-white font-semibold mb-4 text-center">Preview</h3>
              
              {/* Avatar Preview */}
              <div className="relative w-48 h-48 mx-auto">
                {/* Background */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center text-6xl opacity-30">
                  {display.background}
                </div>
                
                {/* Frame */}
                {display.frame && (
                  <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-50">
                    {display.frame}
                  </div>
                )}
                
                {/* Character */}
                <div
                  className="absolute inset-4 rounded-full flex items-center justify-center text-7xl"
                  style={{
                    background: display.color.includes('gradient') 
                      ? display.color 
                      : `radial-gradient(circle, ${display.color}40, ${display.color}80)`,
                  }}
                >
                  {display.character}
                </div>

                {/* Hat */}
                {display.hat && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl">
                    {display.hat}
                  </div>
                )}

                {/* Accessory */}
                {display.accessory && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-3xl">
                    {display.accessory}
                  </div>
                )}

                {/* Effect */}
                {display.effect && (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse">
                    {display.effect}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-2 text-center">
                <p className="text-white/60 text-sm">
                  ⭐ {currentXp} XP • 🔥 {currentStreak} Day Streak
                </p>
                <p className="text-white/40 text-xs">
                  {unlockedItems.length} / {avatarCustomizationService.getAllItems().length} items unlocked
                </p>
              </div>

              {/* Avatar uses */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/50 text-xs text-center">Your avatar appears in:</p>
                <div className="flex justify-center gap-3 mt-2 text-xs text-white/70">
                  <span>🏆 Leaderboard</span>
                  <span>👤 Profile</span>
                  <span>⚔️ Battles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="md:col-span-2">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
              {/* Character Colors (only show for character tab) */}
              {activeCategory === 'character' && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Colors</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {getColorsForCategory().map(item => {
                      const isUnlocked = unlockedItems.includes(item.id);
                      const equipped = isEquipped(item.id);
                      const progress = avatarCustomizationService.getUnlockProgress(
                        item.id, currentXp, currentStreak
                      );

                      return (
                        <button
                          key={item.id}
                          onClick={() => isUnlocked && handleEquip(item.id)}
                          disabled={!isUnlocked}
                          className={`relative p-3 rounded-xl transition-all ${
                            equipped
                              ? 'ring-2 ring-white bg-white/20'
                              : isUnlocked
                              ? 'bg-white/10 hover:bg-white/20'
                              : 'bg-white/5 opacity-50'
                          }`}
                          title={isUnlocked ? item.name : progress.progressText}
                        >
                          <div
                            className="w-8 h-8 rounded-full mx-auto"
                            style={{ background: item.color }}
                          />
                          {!isUnlocked && (
                            <span className="absolute top-0 right-0 text-xs">🔒</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items Grid */}
              <div>
                <h4 className="text-white font-medium mb-3">
                  {categories.find(c => c.id === activeCategory)?.label}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {getItemsForCategory(activeCategory).map(item => {
                    const isUnlocked = unlockedItems.includes(item.id);
                    const equipped = isEquipped(item.id);
                    const progress = avatarCustomizationService.getUnlockProgress(
                      item.id, currentXp, currentStreak
                    );

                    return (
                      <button
                        key={item.id}
                        onClick={() => isUnlocked && handleEquip(item.id)}
                        disabled={!isUnlocked}
                        className={`relative p-4 rounded-xl transition-all ${
                          equipped
                            ? 'ring-2 ring-white bg-white/20'
                            : isUnlocked
                            ? 'bg-white/10 hover:bg-white/20'
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="text-3xl text-center mb-2">{item.icon}</div>
                        <p className="text-white text-xs text-center truncate">{item.name}</p>
                        
                        {/* Rarity indicator */}
                        <div
                          className="absolute top-1 right-1 w-2 h-2 rounded-full"
                          style={{ backgroundColor: avatarCustomizationService.getRarityColor(item.rarity) }}
                        />

                        {/* Lock overlay */}
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-2xl mb-1">🔒</span>
                            <span className="text-white/60 text-xs text-center px-1">
                              {progress.progressText}
                            </span>
                          </div>
                        )}

                        {/* Equipped indicator */}
                        {equipped && (
                          <div className="absolute top-1 left-1">
                            <span className="text-green-400">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rarity Legend */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-white/40 text-xs mb-2">Rarity</p>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400" /> Common
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400" /> Rare
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400" /> Epic
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" /> Legendary
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomization;
