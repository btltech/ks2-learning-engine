import mira from './assets/mira.svg';

export interface MiraFaceProps { size?: number; label?: string; className?: string; }

export function MiraFace({ size = 64, label, className = '' }: MiraFaceProps) {
  return <img src={mira} width={size} height={size} alt={label || ''} aria-hidden={label ? undefined : true} className={className} />;
}
