import React, { useState, useEffect } from 'react';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { UserProfile } from '../types';
import { TurnstileWidget } from './TurnstileWidget';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginAs, setLoginAs] = useState<'parent' | 'child'>('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher' | 'admin'>('parent');
  const [age, setAge] = useState<number>(9);
  const [parentCode, setParentCode] = useState('');
  const [pin, setPin] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>(
    ((import.meta as any).env?.VITE_TURNSTILE_SITE_KEY as string) || ''
  );

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const existingUser = await firebaseAuthService.getCurrentUser();
        if (existingUser) {
          onLogin(existingUser);
        }
      } catch (err) {
        console.error('Error checking existing session:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkExistingSession();
  }, [onLogin]);

  // Fetch runtime config (lets Cloudflare enable Turnstile without rebuilding the frontend bundle)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await fetch('/api/public-config');
        const data = await resp.json().catch(() => ({}));
        if (cancelled) return;
        if (resp.ok && typeof data?.turnstileSiteKey === 'string') {
          setTurnstileSiteKey(data.turnstileSiteKey);
        }
      } catch {
        // ignore
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const hasEdgeWhitespace = (value: string): boolean => {
    // Leading/trailing whitespace in passwords is almost always accidental,
    // and causes users to be unable to log back in later.
    return /^\s|\s$/.test(value);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await firebaseAuthService.sendPasswordReset(email);
      setSuccessMessage('Password reset email sent! Check your inbox (and spam folder).');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChildStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic client-side validation (server validates too)
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!parentCode.trim() || parentCode.trim().length !== 6) {
      setError('Parent code must be exactly 6 characters.');
      return;
    }
    if (!pin.trim() || !/^[0-9]{4,6}$/.test(pin.trim())) {
      setError('Please enter a 4 to 6 digit PIN.');
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    setLoading(true);
    try {
      // Clear any cached user data before child login to prevent showing wrong child's profile
      localStorage.removeItem('ks2_user');
      
      const user = await firebaseAuthService.loginChildWithParentCode({
        parentCode,
        name,
        age,
        pin,
        turnstileToken,
      });
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Unable to start. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailInput = email.trim();

    // Validation
    if (!emailInput || !validateEmail(emailInput)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (hasEdgeWhitespace(password)) {
      setError("Password can't start or end with a space.");
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (hasEdgeWhitespace(confirmPassword)) {
        setError("Confirm password can't start or end with a space.");
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      // Clear any cached user data before login to prevent showing wrong user's profile
      localStorage.removeItem('ks2_user');
      
      let user: UserProfile;
      
      if (mode === 'register') {
        // Register new user with Firebase Auth
        user = await firebaseAuthService.register(
          emailInput,
          password,
          name,
          role,
          undefined
        );
      } else {
        // Login existing user
        user = await firebaseAuthService.login(emailInput, password);
      }
      
      onLogin(user);
    } catch (err: any) {
      console.error('Auth failed:', err);
      // Friendly error messages
      if (err.message?.includes('auth/email-already-in-use')) {
        setError('This email is already registered. Try logging in instead.');
      } else if (err.message?.includes('auth/wrong-password') || err.message?.includes('auth/user-not-found')) {
        setError('Invalid email or password. Please try again (or use “Forgot your password?”).');
      } else if (err.message?.includes('auth/invalid-credential')) {
        setError('Invalid email or password. Please try again (or use “Forgot your password?”).');
      } else if (err.message?.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (err.message?.includes('auth/weak-password')) {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md animate-pop-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl sm:text-4xl">
            {mode === 'forgot' ? '🔑' : '🤖'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {mode === 'forgot' ? 'Reset Password' : mode === 'login' ? 'Welcome Back!' : 'Join KS2 Learning!'}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {mode === 'forgot' ? "We'll send you a reset link" : 'Your AI-powered learning buddy'}
          </p>
          {mode === 'register' && (
            <p className="mt-2 text-xs font-semibold text-purple-700">
              Takes under 1 minute. Choose your role so we can show the right dashboard.
            </p>
          )}
        </div>

        {/* Mode Toggle - hide in forgot mode */}
        {mode !== 'forgot' && (
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'login' 
                ? 'bg-white shadow text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setLoginAs('parent'); setError(null); setSuccessMessage(null); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'register' 
                ? 'bg-white shadow text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium text-center">
            {successMessage}
          </div>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
              className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              ← Back to Sign In
            </button>
          </form>
        ) : mode === 'login' ? (
          <>
            {/* Login Type Toggle */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => { setLoginAs('child'); setError(null); setSuccessMessage(null); setTurnstileToken(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  loginAs === 'child'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Child
              </button>
              <button
                type="button"
                onClick={() => { setLoginAs('parent'); setError(null); setSuccessMessage(null); setTurnstileToken(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  loginAs === 'parent'
                    ? 'bg-white shadow text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Parent / Teacher
              </button>
            </div>

            {loginAs === 'child' ? (
              <form onSubmit={handleChildStart} className="space-y-4 sm:space-y-5">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  Enter your name, age, and your parent’s code to start learning.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How old are you?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[7, 8, 9, 10, 11].map((ageOption) => (
                      <button
                        key={ageOption}
                        type="button"
                        onClick={() => setAge(ageOption)}
                        className={`p-3 rounded-lg border-2 transition-all text-center font-bold ${
                          age === ageOption
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-200 text-gray-700'
                        }`}
                      >
                        {ageOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent code</label>
                  <input
                    type="text"
                    value={parentCode}
                    onChange={(e) => setParentCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="e.g., ABC123"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-center text-lg font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="4 to 6 digits"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-center text-lg font-bold"
                    required
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps keep your profile unique (so we don’t create duplicates).
                  </p>
                </div>

                {turnstileSiteKey ? (
                  <div className="flex justify-center">
                    <TurnstileWidget
                      siteKey={turnstileSiteKey}
                      onToken={setTurnstileToken}
                      className="min-h-[65px]"
                    />
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : 'Start Learning 🚀'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="email@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : 'Sign In 🚀'}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); setSuccessMessage(null); }}
                  className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Forgot your password?
                </button>
              </form>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 mt-1">Use at least 6 characters. Avoid starting or ending with a space.</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What's your name?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setRole('parent')}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                    role === 'parent'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <span className="text-2xl block mb-1">👨‍👩‍👧</span>
                  <span className="font-bold text-sm sm:text-base block">Parent</span>
                  <span className="text-xs text-gray-500 block mt-1">Track progress and link children with a parent code.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                    role === 'teacher'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <span className="text-2xl block mb-1">👩‍🏫</span>
                  <span className="font-bold text-sm sm:text-base block">Teacher</span>
                  <span className="text-xs text-gray-500 block mt-1">Manage classes, activities, and question quality.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                    role === 'admin'
                      ? 'border-gray-700 bg-gray-100 text-gray-800'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span className="text-2xl block mb-1">🛡️</span>
                  <span className="font-bold text-sm sm:text-base block">Admin</span>
                  <span className="text-xs text-gray-500 block mt-1">Review platform quality, access, and settings.</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                After signup, you will land in a dashboard tailored to the role you choose.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : 'Create Account 🎉'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-500 mt-4">
          {mode === 'forgot' 
            ? "Remember your password? Click 'Back to Sign In'"
            : mode === 'login' 
              ? "Don't have an account? Click 'Create Account' above"
              : "Already have an account? Click 'Sign In' above"
          }
        </p>
      </div>
    </div>
  );
};

export default LoginView;
