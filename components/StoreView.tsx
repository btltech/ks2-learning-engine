import React, { useState, useMemo } from 'react';
import { UserProfile, StoreItem } from '../types';
import { storeService, RARITY_COLORS } from '../services/storeService';
import { authService } from '../services/authService';
import { SparklesIcon, LockClosedIcon, CheckCircleIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/solid';

interface StoreViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onClose: () => void;
}

type ItemType = 'color' | 'accessory' | 'background' | 'title' | 'effect';
type SortBy = 'default' | 'price-low' | 'price-high' | 'rarity';
type FilterBy = 'all' | 'owned' | 'affordable' | 'locked';

const StoreView: React.FC<StoreViewProps> = ({ user, onUpdateUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<ItemType>('color');
  const [buyingItem, setBuyingItem] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<StoreItem | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);

  // Get user's unlocked achievements for checking locked items
  const userAchievements = useMemo(() => {
    const achievements: string[] = [];
    // Check for quiz count achievement
    if ((user.quizHistory?.length || 0) >= 50) achievements.push('quizzes-50');
    // Check for streak achievement
    if (user.streak >= 30) achievements.push('streak-30');
    // Check for points achievement
    if (user.totalPoints >= 10000) achievements.push('points-10000');
    return achievements;
  }, [user]);

  // Filter and sort items
  const items = useMemo(() => {
    let filtered = storeService.getItemsByType(activeTab);
    
    // Apply filters
    switch (filterBy) {
      case 'owned':
        filtered = filtered.filter(item => user.unlockedItems.includes(item.id));
        break;
      case 'affordable':
        filtered = filtered.filter(item => user.totalPoints >= item.cost && !user.unlockedItems.includes(item.id));
        break;
      case 'locked':
        filtered = filtered.filter(item => item.requiresAchievement && !storeService.canAccessItem(item, userAchievements));
        break;
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.cost - b.cost);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.cost - a.cost);
        break;
      case 'rarity': {
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        filtered = [...filtered].sort((a, b) => 
          (rarityOrder[b.rarity || 'common']) - (rarityOrder[a.rarity || 'common'])
        );
        break;
      }
    }
    
    return filtered;
  }, [activeTab, sortBy, filterBy, user.unlockedItems, user.totalPoints, userAchievements]);

  const handleBuy = async (item: StoreItem) => {
    if (user.totalPoints < item.cost) return;
    if (item.requiresAchievement && !storeService.canAccessItem(item, userAchievements)) return;
    
    setBuyingItem(item.id);
    setPurchaseAnimation(item.id);
    
    try {
      const updatedUser = await authService.purchaseItem(user.id, item);
      onUpdateUser(updatedUser);
      
      // Show success animation
      setTimeout(() => {
        setPurchaseAnimation(null);
        setShowConfirmModal(null);
      }, 1000);
    } catch (error) {
      console.error('Purchase failed', error);
      setPurchaseAnimation(null);
    } finally {
      setBuyingItem(null);
    }
  };

  const handleEquip = async (item: StoreItem) => {
    try {
      const updatedUser = await authService.equipItem(user.id, item);
      onUpdateUser(updatedUser);
    } catch (error) {
      console.error('Equip failed', error);
    }
  };

  const isOwned = (itemId: string) => user.unlockedItems.includes(itemId);

  const isEquipped = (item: StoreItem) => {
    if (item.type === 'color') return user.avatarConfig.color === item.value;
    if (item.type === 'accessory') return user.avatarConfig.accessory === item.value;
    return false;
  };

  const isLocked = (item: StoreItem) => {
    return item.requiresAchievement && !storeService.canAccessItem(item, userAchievements);
  };

  const getRarityStyle = (rarity: string = 'common') => {
    return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
  };

  const renderColorPreview = (item: StoreItem) => {
    return (
      <div 
        className={`w-14 h-14 rounded-full border-4 border-white shadow-lg transition-transform hover:scale-110 ${
          item.rarity === 'legendary' ? 'animate-pulse' : ''
        }`}
        style={{ 
          background: item.previewColor || '#3B82F6',
        }}
      />
    );
  };

  const tabs: { type: ItemType; label: string; icon: string }[] = [
    { type: 'color', label: 'Colors', icon: '🎨' },
    { type: 'accessory', label: 'Accessories', icon: '🎩' },
    { type: 'background', label: 'Backgrounds', icon: '🖼️' },
    { type: 'title', label: 'Titles', icon: '🏷️' },
    { type: 'effect', label: 'Effects', icon: '✨' },
  ];

  // Calculate collection stats
  const collectionStats = useMemo(() => {
    const allItems = storeService.getItems();
    const owned = allItems.filter(i => user.unlockedItems.includes(i.id)).length;
    return { owned, total: allItems.length };
  }, [user.unlockedItems]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-pop-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white relative overflow-hidden">
          {/* Decorative sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <SparklesIcon className="absolute top-2 left-10 h-6 w-6 text-white/30 animate-pulse" />
            <SparklesIcon className="absolute bottom-4 right-20 h-8 w-8 text-white/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <SparklesIcon className="absolute top-8 right-40 h-5 w-5 text-white/25 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-4xl font-black flex items-center gap-3">
                <span className="text-5xl">🛍️</span> Gift Shop
              </h2>
              <p className="opacity-90 mt-1 font-medium">Customize your avatar with amazing items!</p>
              
              {/* Collection Progress */}
              <div className="mt-3 bg-white/20 rounded-full px-4 py-2 inline-flex items-center gap-2">
                <span className="text-sm font-bold">Collection:</span>
                <span className="font-black">{collectionStats.owned} / {collectionStats.total}</span>
                <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(collectionStats.owned / collectionStats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Coins Display */}
              <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-2xl font-black flex items-center gap-2 text-xl shadow-lg">
                <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🪙</span>
                {user.totalPoints.toLocaleString()}
              </div>
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all hover:rotate-90 duration-300"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex-1 min-w-max py-4 px-6 font-bold text-lg transition-all ${
                activeTab === tab.type 
                  ? 'text-orange-500 border-b-4 border-orange-500 bg-orange-50' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters & Sorting */}
        <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                showFilters ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filter
            </button>
            
            {showFilters && (
              <div className="flex gap-2 animate-fade-in">
                {(['all', 'owned', 'affordable', 'locked'] as FilterBy[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterBy(filter)}
                    className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                      filterBy === filter 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'owned' ? '✓ Owned' : filter === 'affordable' ? '💰 Can Buy' : '🔒 Locked'}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ArrowsUpDownIcon className="h-5 w-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 rounded-lg border border-gray-300 font-bold text-gray-700 bg-white focus:border-orange-400 outline-none"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-bold">No items found</p>
              <p className="text-sm">Try changing your filter settings</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {items.map((item) => {
                const owned = isOwned(item.id);
                const equipped = isEquipped(item);
                const canAfford = user.totalPoints >= item.cost;
                const locked = isLocked(item);
                const rarityStyle = getRarityStyle(item.rarity);

                return (
                  <div 
                    key={item.id}
                    className={`relative rounded-2xl p-5 border-2 flex flex-col items-center gap-3 transition-all duration-300 ${
                      equipped 
                        ? 'border-green-500 ring-4 ring-green-200 bg-green-50 scale-105' 
                        : locked
                          ? 'border-gray-300 bg-gray-100 opacity-75'
                          : `${rarityStyle.border} ${rarityStyle.bg} hover:scale-105 hover:shadow-xl`
                    } ${rarityStyle.glow} ${purchaseAnimation === item.id ? 'animate-bounce' : ''}`}
                  >
                    {/* Rarity Badge */}
                    {item.rarity && item.rarity !== 'common' && (
                      <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-black ${
                        item.rarity === 'rare' ? 'bg-blue-500 text-white' :
                        item.rarity === 'epic' ? 'bg-purple-500 text-white' :
                        'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse'
                      }`}>
                        {rarityStyle.label}
                      </div>
                    )}

                    {/* Lock Overlay */}
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-2xl z-10">
                        <div className="text-center text-white">
                          <LockClosedIcon className="h-10 w-10 mx-auto mb-2" />
                          <p className="text-xs font-bold px-2">Unlock by completing achievement!</p>
                        </div>
                      </div>
                    )}

                    {/* Owned Checkmark */}
                    {owned && (
                      <div className="absolute top-2 left-2">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      </div>
                    )}

                    {/* Item Preview */}
                    <div className={`p-4 rounded-full ${item.type === 'color' ? '' : 'bg-white shadow-md'}`}>
                      {item.type === 'color' ? (
                        renderColorPreview(item)
                      ) : (
                        <span className="text-5xl block">{item.icon}</span>
                      )}
                    </div>
                    
                    {/* Item Info */}
                    <div className="text-center flex-1">
                      <h3 className="font-black text-gray-800">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      {!owned && !locked && (
                        <p className={`font-black text-lg mt-2 ${canAfford ? 'text-orange-500' : 'text-gray-400'}`}>
                          🪙 {item.cost.toLocaleString()}
                        </p>
                      )}
                      {locked && item.requiresAchievement && (
                        <p className="text-xs text-gray-500 mt-2 font-bold">🔒 Achievement Required</p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="w-full mt-auto">
                      {owned ? (
                        <button
                          onClick={() => handleEquip(item)}
                          disabled={equipped}
                          className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                            equipped
                              ? 'bg-green-500 text-white cursor-default'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                          }`}
                        >
                          {equipped ? '✓ Equipped' : 'Equip'}
                        </button>
                      ) : !locked ? (
                        <button
                          onClick={() => setShowConfirmModal(item)}
                          disabled={!canAfford || buyingItem === item.id}
                          className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                            canAfford
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg transform hover:-translate-y-1'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {buyingItem === item.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin">⏳</span> Buying...
                            </span>
                          ) : canAfford ? 'Buy Now' : 'Not Enough Coins'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchase Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-pop-in">
              <div className="text-center">
                <div className="text-7xl mb-4">{showConfirmModal.icon}</div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">{showConfirmModal.name}</h3>
                <p className="text-gray-600 mb-4">{showConfirmModal.description}</p>
                
                <div className="bg-orange-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Purchase Price</p>
                  <p className="text-3xl font-black text-orange-500">🪙 {showConfirmModal.cost.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Balance after purchase: {(user.totalPoints - showConfirmModal.cost).toLocaleString()} coins
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmModal(null)}
                    className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-black hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleBuy(showConfirmModal)}
                    disabled={buyingItem === showConfirmModal.id}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-black hover:shadow-lg transition-all"
                  >
                    {buyingItem === showConfirmModal.id ? 'Purchasing...' : 'Confirm Purchase'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StoreView;
