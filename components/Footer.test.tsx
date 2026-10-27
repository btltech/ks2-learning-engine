import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

const renderFooter = () => render(
  <MemoryRouter>
    <Footer />
  </MemoryRouter>,
);

describe('Footer accessibility settings', () => {
  it('opens the accessibility settings dialog from the footer', async () => {
    renderFooter();
    expect(screen.queryByRole('dialog', { name: /accessibility settings/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /voice & display settings/i }));

    expect(await screen.findByRole('dialog', { name: /accessibility settings/i })).toBeTruthy();
  });

  it('shows the Natural English Voice switch once text-to-speech is on', async () => {
    renderFooter();
    fireEvent.click(screen.getByRole('button', { name: /voice & display settings/i }));
    await screen.findByRole('dialog', { name: /accessibility settings/i });

    const speech = screen.getAllByRole('switch').find((el) => el.closest('div')?.textContent?.includes('Text-to-Speech'));
    expect(speech).toBeTruthy();
    if (speech?.getAttribute('aria-checked') !== 'true') fireEvent.click(speech as HTMLElement);

    expect(await screen.findByText('Natural English Voice')).toBeTruthy();
  });
});
