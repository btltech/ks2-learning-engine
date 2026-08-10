import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardShell, ModalShell, PageShell } from './AppShells';

describe('shared app shells', () => {
  it('gives feature pages one labelled heading and back action', () => {
    const onBack = vi.fn();
    render(
      <PageShell title="Practice" subtitle="A short activity" onBack={onBack}>
        <p>Page content</p>
      </PageShell>,
    );

    expect(screen.getByRole('region', { name: 'Practice' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('closes modal shells with Escape and exposes one dialog', () => {
    const onClose = vi.fn();
    render(
      <ModalShell title="Settings" onClose={onClose}>
        <button type="button">First setting</button>
      </ModalShell>,
    );

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('provides a consistent dashboard exit action', () => {
    const onExit = vi.fn();
    render(
      <DashboardShell title="Teacher Dashboard" onExit={onExit} exitLabel="Back to teacher home">
        <p>Dashboard content</p>
      </DashboardShell>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to teacher home' }));
    expect(onExit).toHaveBeenCalledOnce();
  });
});
