import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  duration?: number; // in seconds
  message?: string;
  percent?: number | null;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ duration = 10, message = "Loading...", percent = null }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Cap at 95% until actual completion
        return prev + (100 / duration) * 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const shownProgress = typeof percent === 'number' ? percent : progress;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-gray-600">{message}</p>
        <p className="text-sm font-semibold text-blue-600">{Math.round(shownProgress)}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${shownProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
