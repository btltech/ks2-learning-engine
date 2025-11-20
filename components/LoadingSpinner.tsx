
import React from 'react';
import ProgressBar from './ProgressBar';

interface LoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
  estimatedTime?: number;
  percent?: number | null;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Brewing up some knowledge...", 
  showProgress = false,
  estimatedTime = 10
  , percent = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-blue-500"></div>
      <p className="text-lg font-semibold text-gray-700 animate-pulse">{message}</p>
      {showProgress && (
        <div className="w-full max-w-md mt-4">
          <ProgressBar duration={estimatedTime} message="Please wait..." percent={percent} />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
