import React, { useState } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [age, setAge] = useState<number>(9);
  const [parentCode, setParentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name to continue.');
      return;
    }

    if (role === 'student' && parentCode && parentCode.length !== 6) {
      setError('Parent code must be exactly 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(name, role, role === 'student' ? age : undefined);
      onLogin(user);
    } catch (error) {
      console.error('Login failed', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md animate-pop-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl sm:text-4xl">
            🤖
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome to KS2 Learning!</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Your AI-powered learning buddy</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  role === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <span className="text-2xl block mb-1">🎓</span>
                <span className="font-bold text-sm sm:text-base">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  role === 'parent'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <span className="text-2xl block mb-1">👨‍👩‍👧</span>
                <span className="font-bold text-sm sm:text-base">Parent</span>
              </button>
            </div>
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How old are you?</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
          )}

          {role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Code (Optional)</label>
              <p className="text-xs text-gray-500 mb-2">If your parent created an account, ask them for their code to link your account</p>
              <input
                type="text"
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="e.g., ABC123"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-center text-lg font-bold"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting Engines...' : 'Start Learning! 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
