import type { Subject } from '../../types';
import { SubjectIcon, type SubjectIconProps } from './SubjectIcon';

const illustrated = new Set([
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
export function HomeSubjectIcon({
  subject,
  size = 72,
}: {
  subject: Subject;
  size?: number;
}) {
  const name = subject.name.toLowerCase();
  return illustrated.has(name) ? (
    <SubjectIcon name={name as SubjectIconProps['name']} size={size} />
  ) : (
    <subject.icon width={size} height={size} aria-hidden="true" />
  );
}
