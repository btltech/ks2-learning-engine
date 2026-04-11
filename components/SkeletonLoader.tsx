import React from 'react';
import { RADIUS, SHADOWS } from '../constants';

/**
 * Improved Skeleton Loading Component (Fix #6)
 * 
 * Better loading states that show content structure during loading.
 * Respects reduced motion preferences.
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: RADIUS.card,
  };

  const animationClasses = {
    pulse: 'motion-safe:animate-pulse',
    wave: 'motion-safe:animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  return (
    <div
      className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{ width, height }}
      aria-busy="true"
      aria-label="Loading"
    />
  );
};

// Pre-built skeleton patterns
export const CardSkeleton: React.FC<{ shadow?: keyof typeof SHADOWS }> = ({ shadow = 'secondary' }) => (
  <div className={`bg-white ${RADIUS.card} ${SHADOWS[shadow]} p-6 space-y-4`}>
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width="48px" height="48px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="rectangular" height="120px" />
    <div className="flex gap-2">
      <Skeleton variant="rectangular" height="36px" className="flex-1" />
      <Skeleton variant="rectangular" height="36px" className="flex-1" />
    </div>
  </div>
);

export const SubjectGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className={`${RADIUS.card} bg-gray-100 p-5 space-y-3`}>
        <Skeleton variant="circular" width="48px" height="48px" className="mx-auto" />
        <Skeleton variant="text" width="70%" className="mx-auto" />
      </div>
    ))}
  </div>
);

export const ActionCardSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {[...Array(6)].map((_, i) => (
      <Skeleton 
        key={i} 
        variant="rectangular" 
        height="120px" 
        className={RADIUS.card}
      />
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
