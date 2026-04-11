import { useEffect, useState } from 'react';
import { offlineQueueService } from '../services/offlineQueueService';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to queue changes
    const unsubscribe = offlineQueueService.subscribe(setPendingCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Show success message when queue is cleared after being offline
    if (isOnline && pendingCount === 0) {
      const wasOffline = sessionStorage.getItem('was_offline');
      if (wasOffline === 'true') {
        setShowSyncSuccess(true);
        sessionStorage.removeItem('was_offline');
        setTimeout(() => setShowSyncSuccess(false), 3000);
      }
    } else if (!isOnline) {
      sessionStorage.setItem('was_offline', 'true');
    }
  }, [isOnline, pendingCount]);

  if (isOnline && pendingCount === 0 && !showSyncSuccess) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {!isOnline && (
        <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <span className="font-semibold">Offline Mode</span>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-semibold">{pendingCount} quiz{pendingCount !== 1 ? 'zes' : ''} syncing...</span>
        </div>
      )}

      {showSyncSuccess && (
        <div className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">All quizzes synced! ✨</span>
        </div>
      )}
    </div>
  );
}
