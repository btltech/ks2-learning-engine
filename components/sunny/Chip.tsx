import type { HTMLAttributes } from 'react';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tint?: 'white' | 'sky' | 'grape' | 'leaf' | 'gold' | 'orange' | 'bubblegum' | 'teal' | 'coral';
}

/** A non-interactive label. Use KidButton for a tappable action. */
export function Chip({ tint = 'white', className = '', ...props }: ChipProps) {
  return <span {...props} className={`sunny-ui kid-chip ${className}`} data-tint={tint} />;
}
