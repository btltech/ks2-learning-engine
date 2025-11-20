import { StoreItem } from '../types';

export const STORE_ITEMS: StoreItem[] = [
  // Colors
  { id: 'color-blue', name: 'Classic Blue', type: 'color', cost: 0, value: 'bg-blue-500', icon: '🔵' },
  { id: 'color-red', name: 'Rocket Red', type: 'color', cost: 50, value: 'bg-red-500', icon: '🔴' },
  { id: 'color-green', name: 'Forest Green', type: 'color', cost: 50, value: 'bg-green-500', icon: '🟢' },
  { id: 'color-purple', name: 'Magic Purple', type: 'color', cost: 100, value: 'bg-purple-500', icon: '🟣' },
  { id: 'color-gold', name: 'Super Gold', type: 'color', cost: 500, value: 'bg-yellow-400', icon: '🟡' },

  // Accessories
  { id: 'acc-glasses', name: 'Smart Glasses', type: 'accessory', cost: 150, value: 'glasses', icon: '👓' },
  { id: 'acc-hat', name: 'Cowboy Hat', type: 'accessory', cost: 200, value: 'hat', icon: '🤠' },
  { id: 'acc-crown', name: 'Royal Crown', type: 'accessory', cost: 1000, value: 'crown', icon: '👑' },
  { id: 'acc-bow', name: 'Cute Bow', type: 'accessory', cost: 150, value: 'bow', icon: '🎀' },
];

export const storeService = {
  getItems: () => STORE_ITEMS,
  
  getItemById: (id: string) => STORE_ITEMS.find(i => i.id === id),
};
