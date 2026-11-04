import type { HTMLAttributes } from 'react';

export interface SpeechBubbleProps extends HTMLAttributes<HTMLDivElement> {
  tail?: 'left' | 'bottom' | 'none';
}

/** Ordinary text, not a live region: mascots must not interrupt a screen reader. */
export function SpeechBubble({ tail = 'left', className = '', ...props }: SpeechBubbleProps) {
  return <div {...props} className={`sunny-ui kid-speech-bubble ${className}`} data-tail={tail} />;
}
