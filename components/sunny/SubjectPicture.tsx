import { BookOpenIcon } from '@heroicons/react/24/outline';
import { SubjectIcon, type SubjectIconProps } from './SubjectIcon';
import type { Subject } from '../../types';
import { CURATED_LANGUAGES } from '../../data/curriculumSequences';

const illustrations = new Set([
  'maths',
  'english',
  'science',
  'languages',
  'history',
  'geography',
  'art',
  'music',
  'computing',
]);
/** Reuse the supplied pictures, retaining existing icons for other subjects. */
export function SubjectPicture({
  name,
  size = 72,
  fallback: Fallback = BookOpenIcon,
}: {
  name: string;
  size?: number;
  fallback?: Subject['icon'];
}) {
  const key = (CURATED_LANGUAGES as readonly string[]).includes(name)
    ? 'languages'
    : name.toLowerCase();
  return illustrations.has(key) ? (
    <SubjectIcon name={key as SubjectIconProps['name']} size={size} />
  ) : (
    <Fallback width={size} height={size} aria-hidden="true" />
  );
}
