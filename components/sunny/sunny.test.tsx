import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UISettingsProvider, useUISettings } from '../../context/UISettingsContext';
import { accessibilityService } from '../../services/accessibilityService';
import { KidButton } from './KidButton';
import { Meter } from './Meter';
import { OwlLogo } from './OwlLogo';
import { Owl } from './Owl';
import { SubjectIcon } from './SubjectIcon';
import { MiraFace } from './MiraFace';

beforeEach(() => { localStorage.clear(); accessibilityService.resetSettings(); });
afterEach(() => { cleanup(); accessibilityService.resetSettings(); });

describe('Sunny Owl accessible building blocks', () => {
  it('keeps native button/link behaviour and never submits a surrounding form by default', () => {
    const onClick = vi.fn();
    render(<><KidButton onClick={onClick}>Carry on</KidButton><KidButton href="/help">Help</KidButton></>);
    const button = screen.getByRole('button', { name: 'Carry on' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help');
  });

  it('honours disabled buttons and explicit submit types', () => {
    const onClick = vi.fn();
    render(<><KidButton disabled onClick={onClick}>Wait</KidButton><KidButton type="submit">Save</KidButton></>);
    fireEvent.click(screen.getByRole('button', { name: 'Wait' }));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it.each([[8, 5, 5], [-2, 5, 0], [NaN, 5, 0]])('keeps progress within its accessible range (%s / %s)', (value, max, expected) => {
    render(<Meter label="Lesson progress" value={value} max={max} />);
    expect(screen.getByRole('progressbar', { name: 'Lesson progress' })).toHaveAttribute('aria-valuenow', String(expected));
  });

  it('announces a meaningful image once and hides decorative artwork', () => {
    render(<><OwlLogo /><Owl pose="reading" /><SubjectIcon name="maths" /><MiraFace /></>);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'DemiWura' }).tagName.toLowerCase()).toBe('svg');
  });

  it('supports a captioned mascot and an already-labelled home button', () => {
    render(<><Owl pose="wave" label="Wura says hello" /><button aria-label="Go to home page"><OwlLogo decorative /></button></>);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Wura says hello' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to home page' })).toBeInTheDocument();
  });
});

function Preferences() {
  const { settings, updateSettings } = useUISettings();
  return <><button onClick={() => updateSettings({ reducedAnimations: !settings.reducedAnimations })}>Less movement</button><button onClick={() => updateSettings({ highContrast: true, largerText: true })}>Reading preferences</button></>;
}

describe('Sunny Owl preference bridge', () => {
  it('uses one root motion switch and preserves either preference until both are off', () => {
    render(<UISettingsProvider><Preferences /></UISettingsProvider>);
    fireEvent.click(screen.getByText('Less movement'));
    expect(document.documentElement).toHaveClass('reduce-motion');
    act(() => accessibilityService.updateSetting('reducedMotion', true));
    fireEvent.click(screen.getByText('Less movement'));
    expect(document.documentElement).toHaveClass('reduce-motion');
    act(() => accessibilityService.updateSetting('reducedMotion', false));
    expect(document.documentElement).not.toHaveClass('reduce-motion');
  });

  it('honours saved preferences on first mount and cleans up on unmount', () => {
    localStorage.setItem('ks2_ui_settings', JSON.stringify({ reducedAnimations: true }));
    const { unmount } = render(<UISettingsProvider><Preferences /></UISettingsProvider>);
    expect(document.documentElement).toHaveClass('reduce-motion');
    fireEvent.click(screen.getByText('Reading preferences'));
    expect(document.documentElement).toHaveClass('sunny-high-contrast', 'sunny-large-text');
    unmount();
    expect(document.documentElement).not.toHaveClass('reduce-motion', 'sunny-high-contrast', 'sunny-large-text');
  });
});
