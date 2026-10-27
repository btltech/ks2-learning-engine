import type { HTMLAttributes } from 'react';

export interface KidCardProps extends HTMLAttributes<HTMLDivElement> {
  tint?: 'white' | 'sky' | 'grape' | 'leaf' | 'gold' | 'orange' | 'bubblegum' | 'teal' | 'coral';
  hero?: boolean;
}

export function KidCard({ tint = 'white', hero = false, className = '', ...props }: KidCardProps) {
  return <div {...props} className={`sunny-ui kid-card ${className}`} data-tint={tint} data-hero={hero || undefined} />;
}
