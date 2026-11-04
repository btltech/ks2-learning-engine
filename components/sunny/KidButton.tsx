import type { ComponentPropsWithoutRef } from 'react';

type Appearance = {
  variant?: 'gold' | 'white' | 'tint' | 'action-blue';
  size?: 'sm' | 'md' | 'lg';
  tint?: 'sky' | 'grape' | 'leaf' | 'gold' | 'orange' | 'bubblegum' | 'teal' | 'coral';
};

export type KidButtonProps = Appearance & (
  | (ComponentPropsWithoutRef<'button'> & { href?: never })
  | (ComponentPropsWithoutRef<'a'> & { href: string })
);

/** Native link or button semantics; never use a clickable div. */
export function KidButton({ variant = 'gold', size = 'md', tint = 'sky', className = '', ...props }: KidButtonProps) {
  const appearance = { className: `sunny-ui kid-button ${className}`, 'data-variant': variant, 'data-size': size, 'data-tint': tint };
  if (props.href !== undefined) return <a {...props as ComponentPropsWithoutRef<'a'>} {...appearance} />;
  return <button type="button" {...props as ComponentPropsWithoutRef<'button'>} {...appearance} />;
}
