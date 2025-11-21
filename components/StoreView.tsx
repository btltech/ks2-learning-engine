import React, { useState } from 'react';
import { UserProfile, StoreItem } from '../types';
import { storeService } from '../services/storeService';
import { authService } from '../services/authService';

interface StoreViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onClose: () => void;
}

const StoreView: React.FC<StoreViewProps> = ({ user, onUpdateUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'color' | 'accessory'>('color');
  const [buyingItem, setBuyingItem] = useState<string | null>(null);

  const items = storeService.getItems().filter(item => item.type === activeTab);

  const handleBuy = async (item: StoreItem) => {
    if (user.totalPoints < item.cost) return;
    
    setBuyingItem(item.id);
    try {
      const updatedUser = await authService.purchaseItem(user.id, item);
      onUpdateUser(updatedUser);
    } catch (error) {
      console.error('Purchase failed', error);
      // Show error message to user or handle gracefully
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

  const isOwned = (itemId: string) => {
    return user.unlockedItems.includes(itemId);
  };

  const isEquipped = (item: StoreItem) => {
    if (item.type === 'color') return user.avatarConfig.color === item.value;
    if (item.type === 'accessory') return user.avatarConfig.accessory === item.value;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-pop-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              🛍️ Avatar Shop
            </h2>
            <p className="opacity-90">Customize your learning buddy!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-full font-bold flex items-center gap-2">
              🪙 {user.totalPoints} Coins
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('color')}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${
              activeTab === 'color' 
                ? 'text-orange-500 border-b-4 border-orange-500 bg-orange-50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🎨 Colors
          </button>
          <button
            onClick={() => setActiveTab('accessory')}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${
              activeTab === 'accessory' 
                ? 'text-orange-500 border-b-4 border-orange-500 bg-orange-50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🎩 Accessories
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => {
              const owned = isOwned(item.id);
              const equipped = isEquipped(item);
              const canAfford = user.totalPoints >= item.cost;

              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 flex flex-col items-center gap-3 transition-all ${
                    equipped ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100 hover:border-orange-200'
                  }`}
                >
                  <div className="text-4xl p-4 bg-gray-50 rounded-full">
                    {item.type === 'color' ? (
                      <div 
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: item.value.replace('bg-', '').replace('-500', '') }} // Hack for preview
                      />
                    ) : (
                      <span className="text-4xl">{item.icon}</span>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    {!owned && (
                      <p className="text-orange-500 font-bold text-sm">
                        🪙 {item.cost}
                      </p>
                    )}
                  </div>

                  <div className="w-full mt-auto">
                    {owned ? (
                      <button
                        onClick={() => handleEquip(item)}
                        disabled={equipped}
                        className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                          equipped
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford || buyingItem === item.id}
                        className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                          canAfford
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {buyingItem === item.id ? 'Buying...' : 'Buy'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreView;
