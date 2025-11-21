import useSound from 'use-sound';
import correctSound from '../assets/sounds/correct.wav';
import incorrectSound from '../assets/sounds/incorrect.wav';
import successSound from '../assets/sounds/success.wav';
import clickSound from '../assets/sounds/click.wav';

export const useGameSounds = () => {
  // We use a try-catch block or check if window exists to avoid SSR issues, 
  // though Vite is mostly CSR. use-sound handles this well usually.
  
  const [playCorrect] = useSound(correctSound, { volume: 0.5 });
  const [playIncorrect] = useSound(incorrectSound, { volume: 0.5 });
  const [playSuccess] = useSound(successSound, { volume: 0.6 });
  const [playClick] = useSound(clickSound, { volume: 0.25 });

  return {
    playCorrect,
    playIncorrect,
    playSuccess,
    playClick,
  };
};
