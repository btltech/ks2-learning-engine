import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`bg-gray-200 rounded ${className}`}
          style={{ 
            width: lines > 1 && i === lines - 1 ? '70%' : '100%',
            height: className?.includes('h-') ? undefined : '1rem'
          }}
        ></div>
      ))}
    </div>
  );
};
