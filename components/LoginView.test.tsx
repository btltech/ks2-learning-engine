import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginView from './LoginView';

const auth = vi.hoisted(() => ({
  getCurrentUser: vi.fn(), login: vi.fn(), loginChildWithParentCode: vi.fn(),
  register: vi.fn(), logout: vi.fn(), sendPasswordReset: vi.fn(),
}));
vi.mock('../services/firebaseAuthService', () => ({ firebaseAuthService: auth }));
vi.mock('./TurnstileWidget', () => ({
  TurnstileWidget: ({ onToken }: { onToken: (token: string) => void }) => <button type="button" onClick={() => onToken('unit-test-response')}>Complete test challenge</button>,
}));

// Synthetic, nonexistent fixtures; never real account credentials.
const sample = { name: 'Example learner', parentCode: 'ZZZZZZ', pin: '000000', age: 10 };
const config = (siteKey = '') => ({ ok: true, json: async () => ({ turnstileSiteKey: siteKey }) });
const renderLogin = (onLogin = vi.fn(), route = '/login') => render(<MemoryRouter initialEntries={[route]}><LoginView onLogin={onLogin} /></MemoryRouter>);
async function childForm() {
  await screen.findByRole('heading', { name: 'Welcome Back!' });
  fireEvent.click(screen.getByRole('button', { name: 'Child', exact: true }));
  fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: sample.name } });
  fireEvent.change(screen.getByPlaceholderText('e.g., ABC123'), { target: { value: sample.parentCode.toLowerCase() } });
  fireEvent.change(screen.getByPlaceholderText('4 to 6 digits'), { target: { value: '00a00 00z9' } });
  fireEvent.click(screen.getByRole('button', { name: String(sample.age), exact: true }));
  return screen.getByPlaceholderText('4 to 6 digits').closest('form')!;
}

beforeEach(() => {
  vi.resetAllMocks();
  auth.getCurrentUser.mockResolvedValue(null);
  auth.logout.mockResolvedValue(undefined);
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(config() as Response);
});
afterEach(() => vi.restoreAllMocks());

describe('sign-in behaviour through the redesigned controls', () => {
  it('announces the selected mode, sign-in type and age as pressed', async () => {
    renderLogin();
    await screen.findByRole('heading', { name: 'Welcome Back!' });
    expect(screen.getByRole('button', { name: 'Sign In', exact: true, pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account', exact: true, pressed: false }));
    expect(screen.getByRole('button', { name: 'Create Account', exact: true, pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sign In', exact: true, pressed: false }));
    expect(screen.getByRole('button', { name: 'Parent / Teacher', pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Child', exact: true, pressed: false }));
    expect(screen.getByRole('button', { name: 'Parent / Teacher', pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Child', exact: true, pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: '9', exact: true, pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '10', exact: true, pressed: false }));
    expect(screen.getByRole('button', { name: '10', exact: true, pressed: true })).toBeTruthy();
    for (const age of [7, 8, 9, 11]) expect(screen.getByRole('button', { name: String(age), exact: true, pressed: false })).toBeTruthy();
  });

  it('keeps numeric PIN sanitisation and the child-session payload', async () => {
    const onLogin = vi.fn();
    const profile = { id: 'example-learner', role: 'student' };
    auth.loginChildWithParentCode.mockResolvedValue(profile);
    renderLogin(onLogin);
    fireEvent.submit(await childForm());
    await waitFor(() => expect(auth.loginChildWithParentCode).toHaveBeenCalledWith({ ...sample, turnstileToken: '' }));
    expect(onLogin).toHaveBeenCalledWith(profile);
  });

  it('preserves the existing child validation and server error messages', async () => {
    const onLogin = vi.fn();
    auth.loginChildWithParentCode.mockRejectedValue(new Error('Child profile not found. Please try again.'));
    renderLogin(onLogin);
    const form = await childForm();
    fireEvent.change(screen.getByPlaceholderText('4 to 6 digits'), { target: { value: '00' } });
    fireEvent.submit(form);
    expect(screen.getByText('Please enter a 4 to 6 digit PIN.')).toBeTruthy();
    expect(auth.loginChildWithParentCode).not.toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText('4 to 6 digits'), { target: { value: sample.pin } });
    fireEvent.submit(form);
    expect(await screen.findByText('Child profile not found. Please try again.')).toBeTruthy();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('still requires and forwards the Turnstile response when enabled', async () => {
    vi.mocked(fetch).mockResolvedValue(config('unit-test-public-site-key') as Response);
    auth.loginChildWithParentCode.mockResolvedValue({ id: 'example-learner' });
    renderLogin();
    const form = await childForm();
    await screen.findByRole('button', { name: 'Complete test challenge' });
    fireEvent.submit(form);
    expect(screen.getByText('Please complete the CAPTCHA.')).toBeTruthy();
    expect(auth.loginChildWithParentCode).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Complete test challenge' }));
    fireEvent.submit(form);
    await waitFor(() => expect(auth.loginChildWithParentCode).toHaveBeenCalledWith({ ...sample, turnstileToken: 'unit-test-response' }));
  });

  it('preserves the show/hide password labels and parent sign-in', async () => {
    const onLogin = vi.fn();
    const profile = { id: 'example-parent', role: 'parent' };
    auth.login.mockResolvedValue(profile);
    renderLogin(onLogin);
    await screen.findByRole('heading', { name: 'Welcome Back!' });
    const password = screen.getByPlaceholderText('••••••••');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password.getAttribute('type')).toBe('text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password.getAttribute('type')).toBe('password');
    fireEvent.change(screen.getByPlaceholderText('email@example.com'), { target: { value: 'parent@example.invalid' } });
    fireEvent.change(password, { target: { value: 'unit-test-password' } });
    fireEvent.submit(password.closest('form')!);
    await waitFor(() => expect(auth.login).toHaveBeenCalledWith('parent@example.invalid', 'unit-test-password'));
    expect(onLogin).toHaveBeenCalledWith(profile);
  });

  it('keeps registration behind email verification', async () => {
    const onLogin = vi.fn();
    auth.register.mockResolvedValue(undefined);
    renderLogin(onLogin, '/login?mode=register');
    await screen.findByRole('heading', { name: 'Join DemiWura!' });
    const email = screen.getByPlaceholderText('email@example.com');
    fireEvent.change(email, { target: { value: 'parent@example.invalid' } });
    for (const input of screen.getAllByPlaceholderText('••••••••')) fireEvent.change(input, { target: { value: 'unit-test-password' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'Example parent' } });
    fireEvent.submit(email.closest('form')!);
    await screen.findByRole('heading', { name: 'Check Your Inbox' });
    expect(auth.register).toHaveBeenCalledWith('parent@example.invalid', 'unit-test-password', 'Example parent', 'parent', undefined);
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText('Click the link in the email to activate your account, then sign in here.')).toBeTruthy();
  });

  it('keeps the verification-return message and password-reset flow', async () => {
    auth.sendPasswordReset.mockResolvedValue(undefined);
    renderLogin(vi.fn(), '/login?verified=true');
    await screen.findByRole('heading', { name: 'Welcome Back!' });
    expect(screen.getByText('Your email has been verified! Please sign in to continue.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Forgot your password?' }));
    const email = screen.getByPlaceholderText('email@example.com');
    fireEvent.change(email, { target: { value: 'parent@example.invalid' } });
    fireEvent.submit(email.closest('form')!);
    expect(await screen.findByText('Password reset email sent! Check your inbox (and spam folder).')).toBeTruthy();
    expect(auth.sendPasswordReset).toHaveBeenCalledWith('parent@example.invalid');
  });
});
