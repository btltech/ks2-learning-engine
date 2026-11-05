import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import LanguageSelector from './LanguageSelector';
import { LANGUAGES } from '../constants';
afterEach(cleanup);
it('keeps all language choices and navigation, with a named selected stamp', () => {
  const onSelect = vi.fn(), onBack = vi.fn();
  render(<LanguageSelector onSelect={onSelect} onBack={onBack} />);
  LANGUAGES.forEach(language => expect(screen.getByRole('button', {name: new RegExp(language.name)})).toBeInTheDocument());
  const french = screen.getByRole('button', {name: /French/});
  fireEvent.click(french);
  expect(french).toHaveAttribute('aria-pressed', 'true');
  expect(onSelect).toHaveBeenCalledWith('French');
  expect(screen.getByText('Bonjour!')).toHaveAttribute('lang', 'fr');
  expect(screen.getByText('Hola!')).toHaveAttribute('lang', 'es');
  expect(screen.getByText('Báwo ni?!')).toHaveAttribute('lang', 'yo');
  fireEvent.click(screen.getByRole('button', {name: 'Go back to subjects'}));
  expect(onBack).toHaveBeenCalledOnce();
});
