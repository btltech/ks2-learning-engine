import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, FireIcon, StarIcon, TrophyIcon, XMarkIcon } from '@heroicons/react/24/solid';

export interface Notification {
  id: string;
  type: 'milestone' | 'badge' | 'streak' | 'warning' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  dismissible?: boolean;
}

interface ProgressNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
}

const ProgressNotifications: React.FC<ProgressNotificationsProps> = ({ 
  notifications, 
  onDismiss,
  maxVisible = 3 
}) => {
  const [visible, setVisible] = useState<Notification[]>([]);

  useEffect(() => {
    // Show newest notifications first, limited by maxVisible
    setVisible(notifications.slice(0, maxVisible));

    // Auto-dismiss notifications after 6 seconds
    const timers = notifications.map((notif) => {
      if (notif.dismissible !== false) {
        return setTimeout(() => {
          onDismiss(notif.id);
        }, 6000);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [notifications, onDismiss, maxVisible]);

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'milestone':
        return { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500' };
      case 'badge':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-500' };
      case 'streak':
        return { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500' };
      case 'warning':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' };
      case 'achievement':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500' };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' };
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const className = 'h-6 w-6';
    switch (type) {
      case 'milestone':
        return <CheckCircleIcon className={`${className} text-purple-500`} />;
      case 'badge':
        return <TrophyIcon className={`${className} text-yellow-500`} />;
      case 'streak':
        return <FireIcon className={`${className} text-orange-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${className} text-red-500`} />;
      case 'achievement':
        return <StarIcon className={`${className} text-green-500`} />;
      default:
        return <CheckCircleIcon className={`${className} text-blue-500`} />;
    }
  };

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {visible.map((notif) => {
        const colors = getNotificationColor(notif.type);
        return (
          <div
            key={notif.id}
            className={`${colors.bg} border-l-4 ${colors.border} rounded-lg shadow-lg p-4 animate-slide-in-right`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 pt-0.5">
                {getNotificationIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-grow">
                <p className="font-bold text-gray-800">{notif.title}</p>
                <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {notif.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {/* Dismiss Button */}
              {notif.dismissible !== false && (
                <button
                  onClick={() => onDismiss(notif.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressNotifications;
