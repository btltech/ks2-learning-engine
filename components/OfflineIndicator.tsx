import React, { useState, useEffect } from 'react';
import { WifiIcon, CloudIcon } from '@heroicons/react/24/solid';
import { offlineManager } from '../services/offlineManager';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(offlineManager.checkOnlineStatus());
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineManager.subscribe((online) => {
      setIsOnline(online);
      setShowNotification(true);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    });

    return unsubscribe;
  }, []);

  if (isOnline && !showNotification) {
    return null;
  }

  return (
    <div 
      className={`fixed top-20 right-4 z-40 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline 
          ? 'bg-green-50 border-2 border-green-300' 
          : 'bg-yellow-50 border-2 border-yellow-300'
      } ${showNotification ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3">
        {isOnline ? (
          <>
            <WifiIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
            <div>
              <p className="font-bold text-green-800">Back Online!</p>
              <p className="text-sm text-green-600">Connection restored</p>
            </div>
          </>
        ) : (
          <>
            <CloudIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
            <div>
              <p className="font-bold text-yellow-800">Offline Mode</p>
              <p className="text-sm text-yellow-600">Using cached content</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
