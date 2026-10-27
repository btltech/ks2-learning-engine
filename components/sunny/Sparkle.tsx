import type { SVGProps } from 'react';

export function Sparkle({ className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} className={`sunny-sparkle ${className}`} width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 2Q18 14 30 16Q18 18 16 30Q14 18 2 16Q14 14 16 2Z" fill="#FFC93C" stroke="#172033" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
