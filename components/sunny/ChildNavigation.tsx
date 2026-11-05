import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
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
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    if (!mobile || !nav) return;
    const measure = () => {
      const height = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--sunny-bottom-tabs-height', `${height}px`);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(nav, { box: 'border-box' });
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      document.documentElement.style.removeProperty('--sunny-bottom-tabs-height');
    };
  }, [mobile]);
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
      ref={navRef}
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
