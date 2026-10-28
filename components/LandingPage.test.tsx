import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import { PublicLayout } from './PublicLayout';

function Location() {
  const { pathname, search } = useLocation();
  return <output aria-label="Current route">{pathname}{search}</output>;
}
function renderLanding(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><PublicLayout><LandingPage /></PublicLayout><Location /></MemoryRouter>);
}

describe('public landing navigation', () => {
  it.each([
    ['Start learning', 0], ['Start learning', 1],
    ['Create a family account', 0], ['Create a family account', 1],
  ] as const)('keeps the registration target for %s action %i', (name, index) => {
    renderLanding();
    fireEvent.click(screen.getAllByRole('button', { name })[index]);
    expect(screen.getByLabelText('Current route').textContent).toBe('/login?mode=register');
  });

  it('keeps sign-in and guide destinations', () => {
    renderLanding();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByLabelText('Current route').textContent).toBe('/login');
    fireEvent.click(screen.getByRole('button', { name: 'Read the parent guide' }));
    expect(screen.getByLabelText('Current route').textContent).toBe('/parent-guide');
    fireEvent.click(screen.getByRole('button', { name: 'Read the teacher guide' }));
    expect(screen.getByLabelText('Current route').textContent).toBe('/teacher-guide');
  });

  it('has valid in-page navigation and a non-interactive maths illustration', () => {
    renderLanding();
    for (const link of within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link')) {
      expect(document.getElementById(link.getAttribute('href')!.slice(1))).toBeTruthy();
    }
    expect(screen.getByRole('link', { name: 'Skip to main content' }).getAttribute('href')).toBe('#main-content');
    const preview = screen.getByRole('figure', { name: 'What is one quarter of 20?' });
    expect(within(preview).queryByRole('button')).toBeNull();
    expect(within(preview).getByText('✓ Correct')).toBeTruthy();
  });

  it.each(['/login', '/?verified=true', '/privacy-policy'])('keeps the calmer public header on %s', path => {
    renderLanding(path);
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
    expect(document.querySelector('.sunny-landing-footer')).toBeNull();
  });

  it('retains all footer policy destinations and settings on the sunny variant', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    renderLanding();
    const policies = { Privacy: '/privacy-policy', "Children's Privacy": '/privacy-for-children', Terms: '/terms-of-service', Cookies: '/cookie-policy', Safeguarding: '/safeguarding', Accessibility: '/accessibility', Help: '/help', Contact: '/contact' };
    const footer = within(screen.getByRole('contentinfo'));
    for (const [name, path] of Object.entries(policies)) {
      fireEvent.click(footer.getByRole('button', { name, exact: true }));
      expect(screen.getByLabelText('Current route').textContent).toBe(path);
    }
    expect(footer.getByRole('button', { name: 'Feedback' })).toBeTruthy();
    fireEvent.click(footer.getByRole('button', { name: 'Voice & display settings' }));
    expect(await screen.findByRole('dialog', { name: /accessibility settings/i })).toBeTruthy();
    vi.restoreAllMocks();
  });
});
