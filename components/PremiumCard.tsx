import React from 'react';

type CardVariant = 'default' | 'blue' | 'green' | 'purple' | 'amber' | 'rose';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  hover?: boolean;
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  animate = false,
  delay = 0,
  onClick,
}) => {
  // Enhanced color variants with better separation
  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white shadow-lg hover:shadow-xl hover:border-blue-300',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/40',
    green: 'bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/40',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/40',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-300/40',
    rose: 'bg-gradient-to-br from-rose-50 to-rose-100 shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/40',
  };
  const animationClass = animate ? `animate-fadeInUp ${delay > 0 ? `animate-delay-${delay}` : ''}` : '';

  const baseClasses = `
    relative overflow-hidden rounded-2xl p-6 border border-opacity-20
    transition-all duration-300 ease-out
    ${variantStyles[variant]}
    ${hover ? 'cursor-pointer hover:-translate-y-2' : ''}
    ${animationClass}
  `;

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PremiumCard;
