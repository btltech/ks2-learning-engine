import maths from './assets/subjects/maths.svg';
import english from './assets/subjects/english.svg';
import science from './assets/subjects/science.svg';
import languages from './assets/subjects/languages.svg';
import history from './assets/subjects/history.svg';
import geography from './assets/subjects/geography.svg';
import art from './assets/subjects/art.svg';
import music from './assets/subjects/music.svg';
import computing from './assets/subjects/computing.svg';
import chest from './assets/subjects/chest.svg';

const icons = { maths, english, science, languages, history, geography, art, music, computing, chest };
export interface SubjectIconProps {
  name: keyof typeof icons;
  size?: number;
  label?: string;
  className?: string;
}

export function SubjectIcon({ name, size = 64, label, className = '' }: SubjectIconProps) {
  return <img src={icons[name]} width={size} height={size} alt={label || ''} aria-hidden={label ? undefined : true} className={className} />;
}
