/**
 * Avatar Display Component
 * 
 * Reusable component that shows a user's customized avatar
 * Used in Header, Leaderboard, Profile, etc.
 */

import React from 'react';
import { avatarCustomizationService } from '../services/avatarCustomizationService';

interface AvatarDisplayProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showEffects?: boolean;
  className?: string;
  onClick?: () => void;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  size = 'md',
  showEffects = true,
  className = '',
  onClick,
}) => {
  const display = avatarCustomizationService.getAvatarDisplay();

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: { character: 'text-2xl', hat: 'text-sm', accessory: 'text-xs', effect: 'text-lg' },
    md: { character: 'text-3xl', hat: 'text-lg', accessory: 'text-sm', effect: 'text-xl' },
    lg: { character: 'text-5xl', hat: 'text-2xl', accessory: 'text-lg', effect: 'text-3xl' },
    xl: { character: 'text-7xl', hat: 'text-3xl', accessory: 'text-xl', effect: 'text-4xl' },
  };

  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        relative ${sizeClasses[size]} rounded-full
        ${isClickable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
        ${className}
      `}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 rounded-full flex items-center justify-center opacity-30"
        style={{
          background: display.color.includes('gradient') 
            ? display.color 
            : `radial-gradient(circle, ${display.color}60, ${display.color}90)`,
        }}
      >
        <span className={iconSizes[size].character}>{display.background}</span>
      </div>

      {/* Frame */}
      {display.frame && (
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <span className={iconSizes[size].character}>{display.frame}</span>
        </div>
      )}

      {/* Character */}
      <div
        className="absolute inset-1 rounded-full flex items-center justify-center border-2 border-white/30"
        style={{
          background: display.color.includes('gradient') 
            ? display.color 
            : `radial-gradient(circle, ${display.color}40, ${display.color}80)`,
        }}
      >
        <span className={iconSizes[size].character}>{display.character}</span>
      </div>

      {/* Hat */}
      {display.hat && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <span className={iconSizes[size].hat}>{display.hat}</span>
        </div>
      )}

      {/* Accessory */}
      {display.accessory && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
          <span className={iconSizes[size].accessory}>{display.accessory}</span>
        </div>
      )}

      {/* Effect */}
      {showEffects && display.effect && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse pointer-events-none">
          <span className={iconSizes[size].effect}>{display.effect}</span>
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;
