import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';

/** The same existing destinations, shown as pills or phone tabs. */
export function ChildNavigation({
  mobile = false,
  playClick,
}: {
  mobile?: boolean;
  playClick: () => void;
}) {
  const { pathname, hash } = useLocation();
  const items = [
    {
      label: 'Home',
      to: '/',
      icon: HomeIcon,
      current: pathname === '/' && hash !== '#subjects',
    },
    {
      label: 'Learn',
      to: '/#subjects',
      icon: BookOpenIcon,
      current:
        pathname.startsWith('/subject/') ||
        (pathname === '/' && hash === '#subjects'),
    },
    {
      label: 'My progress',
      to: '/progress',
      icon: ChartBarIcon,
      current: pathname === '/progress',
    },
    {
      label: 'Games',
      to: '/games',
      icon: PuzzlePieceIcon,
      current: pathname === '/games',
    },
  ];
  return (
    <nav
      aria-label={mobile ? 'Main (phone)' : 'Main'}
      className={`sunny-child-nav ${mobile ? 'sunny-bottom-tabs' : 'sunny-top-pills'}`}
    >
      {items.map(({ label, to, icon: Icon, current }) => (
        <Link
          key={label}
          to={to}
          aria-current={current ? 'page' : undefined}
          onClick={playClick}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
