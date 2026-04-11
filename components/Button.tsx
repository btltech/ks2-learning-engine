import React from 'react';
import { GRADIENTS, SHADOWS, RADIUS } from '../constants';

export type ButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'ghost' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  gradient?: keyof typeof GRADIENTS;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Design System Button Component (Fix #3)
 * 
 * Consistent button styling with variants, sizes, and proper focus states.
 * Supports reduced motion preferences and touch-friendly sizing.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  gradient,
  fullWidth = false,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // Variant classes (Fix #4: focus-visible instead of focus)
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white focus-visible:ring-orange-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus-visible:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-500',
    gradient: gradient 
      ? `bg-gradient-to-r ${GRADIENTS[gradient]} text-white focus-visible:ring-purple-500` 
      : `bg-gradient-to-r ${GRADIENTS.primary} text-white focus-visible:ring-purple-500`,
  };

  // Base classes with fix #4 (focus-visible), fix #5 (motion-safe), fix #8 (button radius)
  const baseClasses = `
    ${RADIUS.button}
    font-semibold
    transition-all
    duration-200
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    motion-safe:hover:scale-[1.02]
    motion-safe:active:scale-[0.98]
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <button
      className={baseClasses.trim().replace(/\s+/g, ' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="motion-safe:animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};

export default Button;
