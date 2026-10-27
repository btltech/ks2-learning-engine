import wave from './assets/owl/owl-wave.svg';
import reading from './assets/owl/owl-reading.svg';
import hooray from './assets/owl/owl-hooray.svg';
import sleepy from './assets/owl/owl-sleepy.svg';
import thinking from './assets/owl/owl-thinking.svg';
import standing from './assets/owl/owl-standing.svg';

const poses = { wave, reading, hooray, sleepy, thinking, standing };
export interface OwlProps {
  pose?: keyof typeof poses;
  height?: number;
  label?: string;
  className?: string;
}

/** Decorative by default. Pair Wura with a caption or SpeechBubble. */
export function Owl({ pose = 'standing', height = 160, label, className = '' }: OwlProps) {
  return <img src={poses[pose]} height={height} style={{ height, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} alt={label || ''} aria-hidden={label ? undefined : true} className={className} />;
}
