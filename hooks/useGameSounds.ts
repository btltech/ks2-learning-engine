import useSound from 'use-sound';

// Define paths to sound files
// Note: These files should be placed in public/sounds/
const SOUNDS = {
  correct: '/sounds/correct.wav',
  incorrect: '/sounds/incorrect.wav',
  success: '/sounds/success.wav', // Level up / Badge
  click: '/sounds/click.wav',
};

export const useGameSounds = () => {
  // We use a try-catch block or check if window exists to avoid SSR issues, 
  // though Vite is mostly CSR. use-sound handles this well usually.
  
  const [playCorrect] = useSound(SOUNDS.correct, { volume: 0.5 });
  const [playIncorrect] = useSound(SOUNDS.incorrect, { volume: 0.5 });
  const [playSuccess] = useSound(SOUNDS.success, { volume: 0.6 });
  const [playClick] = useSound(SOUNDS.click, { volume: 0.25 });

  return {
    playCorrect,
    playIncorrect,
    playSuccess,
    playClick,
  };
};
