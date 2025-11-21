import React from 'react';

export type ProgressRingColor = 'blue' | 'green' | 'purple' | 'amber' | 'rose' | 'cyan' | 'lime';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  colorVariant?: ProgressRingColor;
  label?: string;
  animated?: boolean;
  showGlow?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  colorVariant = 'blue',
  label,
  animated = true,
  showGlow = true
}) => {
  // Color mapping with better separation
  const colorMap: Record<ProgressRingColor, { light: string; dark: string; glow: string }> = {
    blue: { light: '#3b82f6', dark: '#60a5fa', glow: 'rgba(59, 130, 246, 0.4)' },
    green: { light: '#10b981', dark: '#34d399', glow: 'rgba(16, 185, 129, 0.4)' },
    purple: { light: '#8b5cf6', dark: '#a78bfa', glow: 'rgba(139, 92, 246, 0.4)' },
    amber: { light: '#f59e0b', dark: '#fbbf24', glow: 'rgba(245, 158, 11, 0.4)' },
    rose: { light: '#f43f5e', dark: '#fb7185', glow: 'rgba(244, 63, 94, 0.4)' },
    cyan: { light: '#06b6d4', dark: '#22d3ee', glow: 'rgba(6, 182, 212, 0.4)' },
    lime: { light: '#84cc16', dark: '#a3e635', glow: 'rgba(132, 204, 22, 0.4)' },
  };

  const selectedColor = color || colorMap[colorVariant].light;
  const glowColor = colorMap[colorVariant].glow;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={selectedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-500 ease-out' : ''}
          style={{
            filter: showGlow ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
          }}
        />
        {/* Center text with adaptive color */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          className="text-xl font-bold"
          fill={selectedColor}
          style={{ pointerEvents: 'none' }}
        >
          {percentage}%
        </text>
      </svg>
      {label && (
        <p className="text-sm font-medium text-center text-gray-700">
          {label}
        </p>
      )}
    </div>
  );
};

export default ProgressRing;
