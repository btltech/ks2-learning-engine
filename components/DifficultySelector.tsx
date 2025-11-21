
import React from 'react';
import { Difficulty } from '../types';
import { useGameSounds } from '../hooks/useGameSounds';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

const difficulties = [
    { level: Difficulty.Easy, color: 'bg-green-500 hover:bg-green-600', ring: 'focus:ring-green-400' },
    { level: Difficulty.Medium, color: 'bg-yellow-500 hover:bg-yellow-600', ring: 'focus:ring-yellow-400' },
    { level: Difficulty.Hard, color: 'bg-red-500 hover:bg-red-600', ring: 'focus:ring-red-400' },
];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selectedDifficulty, onSelectDifficulty }) => {
    const { playClick } = useGameSounds();

    const handleSelect = (level: Difficulty) => {
        playClick();
        onSelectDifficulty(level);
    };

    return (
        <div 
            className="flex justify-center space-x-2 sm:space-x-4 my-6"
            role="radiogroup"
            aria-label="Select difficulty level"
        >
            {difficulties.map(({level, color, ring}) => (
                <button
                    key={level}
                    onClick={() => handleSelect(level)}
                    role="radio"
                    aria-checked={selectedDifficulty === level}
                    aria-label={`${level} difficulty`}
                    className={`px-4 py-2 sm:px-6 sm:py-3 text-white font-bold rounded-full shadow-md transform transition-transform duration-200 focus:outline-none focus:ring-4 ${ring} ${
                        selectedDifficulty === level ? 'scale-110 ring-4' : 'hover:scale-105'
                    } ${color}`}
                >
                    {level}
                </button>
            ))}
        </div>
    );
};

export default DifficultySelector;
