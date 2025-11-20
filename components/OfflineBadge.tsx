import React, { useState, useEffect } from 'react';
import { CloudArrowDownIcon } from '@heroicons/react/24/solid';
import { offlineManager } from '../services/offlineManager';

interface OfflineBadgeProps {
  cacheKey: string;
  className?: string;
}

const OfflineBadge: React.FC<OfflineBadgeProps> = ({ cacheKey, className = '' }) => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(offlineManager.isContentAvailable(cacheKey));
  }, [cacheKey]);

  if (!isAvailable) {
    return null;
  }

  return (
    <div 
      className={`inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold ${className}`}
      title="Available offline"
    >
      <CloudArrowDownIcon className="h-3 w-3 mr-1" aria-hidden="true" />
      <span className="sr-only">Available offline</span>
      Offline
    </div>
  );
};

export default OfflineBadge;
