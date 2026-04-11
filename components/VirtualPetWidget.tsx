import { useState, useEffect } from 'react';
import { gamificationService, VirtualPet } from '../services/gamificationService';

export default function VirtualPetWidget() {
  const [pet, setPet] = useState<VirtualPet | null>(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    loadPet();
    // Update pet stats every 30 seconds
    const interval = setInterval(loadPet, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPet = () => {
    setPet(gamificationService.getPet());
  };

  const handleFeed = () => {
    gamificationService.feedPet();
    loadPet();
  };

  const handlePlay = () => {
    gamificationService.playWithPet();
    loadPet();
  };

  if (!pet) return null;

  const getEvolutionStage = () => {
    const stages = ['🥚 Egg', '🐣 Baby', '🦄 Teen', '🐉 Adult'];
    return stages[pet.evolution];
  };

  const getPetEmoji = () => {
    const emojis = {
      dragon: ['🥚', '🐣', '🦎', '🐉'],
      unicorn: ['🥚', '🐣', '🦄', '🦄✨'],
      phoenix: ['🥚', '🐣', '🦅', '🔥🦅'],
      owl: ['🥚', '🐣', '🦉', '🦉✨'],
      fox: ['🥚', '🐣', '🦊', '🦊✨'],
    };
    return emojis[pet.type][pet.evolution];
  };

  const getStatColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative">
      {/* Main Pet Widget */}
      <div
        className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
        onClick={() => setShowActions(!showActions)}
      >
        {/* Pet Display */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2 animate-bounce">{getPetEmoji()}</div>
          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
          <p className="text-sm text-gray-500">
            Level {pet.level} • {getEvolutionStage()}
          </p>
        </div>

        {/* Status Bars */}
        <div className="space-y-3">
          <StatBar label="Happiness" value={pet.happiness} emoji="😊" color={getStatColor(pet.happiness)} />
          <StatBar label="Hunger" value={100 - pet.hunger} emoji="🍎" color={getStatColor(100 - pet.hunger)} />
          <StatBar label="Energy" value={pet.energy} emoji="⚡" color={getStatColor(pet.energy)} />
        </div>

        {/* Status Message */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center font-medium">
            {gamificationService.getPetStatus()}
          </p>
        </div>

        {/* Tap to interact hint */}
        <p className="text-xs text-gray-400 text-center mt-3">
          Click to interact with {pet.name}
        </p>
      </div>

      {/* Actions Panel */}
      {showActions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-50 border-2 border-purple-200">
          <h4 className="font-bold text-gray-900 mb-3">Care for {pet.name}</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFeed();
              }}
              disabled={pet.hunger < 20}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🍎 Feed
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              disabled={pet.energy < 15}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎾 Play
            </button>
          </div>

          {/* Tips */}
          <div className="mt-3 p-2 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-700">
              💡 Complete quizzes to level up {pet.name}!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, emoji, color }: { label: string; value: number; emoji: string; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 flex items-center gap-1">
          {emoji} {label}
        </span>
        <span className="text-xs font-semibold text-gray-700">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
