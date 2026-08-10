import React, { ReactNode, useId } from 'react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

type ShellTone = 'blue' | 'purple' | 'slate' | 'plain';

const pageToneClasses: Record<ShellTone, string> = {
  blue: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
  purple: 'bg-gradient-to-br from-purple-50 via-white to-pink-50',
  slate: 'bg-gradient-to-br from-slate-100 via-white to-blue-50',
  plain: 'bg-transparent',
};

const headerToneClasses: Record<ShellTone, string> = {
  blue: 'from-blue-600 to-indigo-700',
  purple: 'from-purple-600 to-indigo-700',
  slate: 'from-slate-700 to-slate-900',
  plain: 'from-gray-700 to-gray-900',
};

interface PageShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  tone?: ShellTone;
  maxWidth?: '2xl' | '4xl' | '6xl' | '7xl';
  className?: string;
}

const maxWidthClasses = {
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export const PageShell: React.FC<PageShellProps> = ({
  title,
  subtitle,
  icon,
  onBack,
  backLabel = 'Back',
  actions,
  children,
  tone = 'blue',
  maxWidth = '7xl',
  className = '',
}) => {
  const headingId = useId();

  return (
    <section className={`min-h-screen px-4 py-6 sm:py-8 ${pageToneClasses[tone]} ${className}`} aria-labelledby={headingId}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        <header className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {onBack && (
              <button type="button" onClick={onBack} className="mb-3 min-h-11 rounded-lg px-3 font-semibold text-blue-700 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                ← {backLabel}
              </button>
            )}
            <div className="flex items-center gap-3">
              {icon && <span className="text-3xl" aria-hidden="true">{icon}</span>}
              <div>
                <h1 id={headingId} className="text-3xl sm:text-4xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="mt-1 text-base sm:text-lg text-gray-600">{subtitle}</p>}
              </div>
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </header>
        {children}
      </div>
    </section>
  );
};

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onExit?: () => void;
  exitLabel?: string;
  actions?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
  tone?: ShellTone;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  title,
  subtitle,
  icon,
  onExit,
  exitLabel = 'Back',
  actions,
  navigation,
  children,
  tone = 'purple',
}) => {
  const headingId = useId();

  return (
    <section className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gray-100" aria-labelledby={headingId}>
      <header className={`bg-gradient-to-r ${headerToneClasses[tone]} text-white shadow-lg`}>
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {icon && <span className="text-3xl" aria-hidden="true">{icon}</span>}
            <div>
              <h1 id={headingId} className="text-xl sm:text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
            {onExit && (
              <button type="button" onClick={onExit} className="min-h-11 rounded-lg bg-white/20 px-4 font-semibold hover:bg-white/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60">
                {exitLabel}
              </button>
            )}
          </div>
        </div>
        {navigation && <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">{navigation}</div>}
      </header>
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </section>
  );
};

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: ShellTone;
  maxWidth?: 'lg' | '2xl' | '4xl' | '5xl';
  bodyClassName?: string;
}

const modalWidthClasses = {
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  onClose,
  children,
  actions,
  footer,
  tone = 'purple',
  maxWidth = '2xl',
  bodyClassName = 'p-4 sm:p-6',
}) => {
  const titleId = useId();
  const dialogRef = useModalAccessibility(onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
      <div ref={dialogRef} tabIndex={-1} className={`flex max-h-[90vh] w-full ${modalWidthClasses[maxWidth]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-pop-in`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className={`flex items-start justify-between gap-4 bg-gradient-to-r ${headerToneClasses[tone]} px-5 py-4 text-white`}>
          <div>
            <h2 id={titleId} className="text-xl sm:text-2xl font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-white/80">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button type="button" onClick={onClose} className="min-h-11 min-w-11 rounded-lg bg-white/20 p-2 font-bold hover:bg-white/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60" aria-label={`Close ${title}`}>
              ✕
            </button>
          </div>
        </header>
        <div className={`overflow-y-auto ${bodyClassName}`}>{children}</div>
        {footer && <footer className="border-t border-gray-200 bg-gray-50 px-5 py-4">{footer}</footer>}
      </div>
    </div>
  );
};
