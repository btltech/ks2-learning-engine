import React from 'react';
import { AcademicCapIcon, StarIcon, ShoppingBagIcon, ChartBarIcon, ArrowRightOnRectangleIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import EmbeddingSelector from './EmbeddingSelector';
import TTSDemo from './TTSDemo';
import { UserProfile } from '../types';

interface HeaderProps {
  onHomeClick: () => void;
  user: UserProfile;
  onOpenStore: () => void;
  onOpenParentDashboard: () => void;
  onOpenLeaderboard: () => void;
  onOpenProgress: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  user, 
  onOpenStore, 
  onOpenParentDashboard,
  onOpenLeaderboard,
  onOpenProgress,
  onLogout 
}) => {
  return (
    <header className="bg-gradient-to-r from-white via-white to-blue-50/30 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm w-full sticky top-0 z-40" role="banner">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button 
            onClick={onHomeClick} 
            className="flex items-center space-x-2 sm:space-x-3 group"
            aria-label="Go to home page"
          >
            <AcademicCapIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors hidden sm:block tracking-tight">
              KS2 Learning
            </h1>
          </button>

          {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-4">
              {user.role === 'admin' && <EmbeddingSelector />}
              {user.role === 'admin' && <TTSDemo />}

            {/* Badges Display - Students only */}
            {user.role === 'student' && (
              <div 
                className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 font-semibold px-4 py-2 rounded-full shadow-sm border border-blue-200/50 cursor-help hover:shadow-md transition-shadow"
                role="status"
                aria-label={`Badges earned: ${user.badges?.length || 0}`}
                title={`Badges: ${user.badges?.map(b => b.name).join(', ') || 'None yet'}`}
              >
                <span className="text-xl">🏅</span>
                <span className="text-lg">{user.badges?.length || 0}</span>
              </div>
            )}

            {/* Streak Display - Students only */}
            {user.role === 'student' && (
              <div 
                className="flex items-center space-x-1 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm border border-orange-200/50 hover:shadow-md transition-shadow"
                role="status"
                aria-label={`Current streak: ${user.streak || 0} days`}
                title="Daily Streak"
              >
                <FireIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" aria-hidden="true" />
                <span className="text-sm sm:text-lg">{user.streak || 0}</span>
              </div>
            )}

            {/* Points Display - Students only */}
            {user.role === 'student' && (
              <div 
                className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm border border-yellow-200/50 hover:shadow-md transition-shadow"
                role="status"
                aria-label={`Total points: ${user.totalPoints}`}
              >
                <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" aria-hidden="true" />
                <span className="text-sm sm:text-lg">{user.totalPoints}</span>
              </div>
            )}

            {/* Leaderboard Button - Students only */}
            {user.role === 'student' && (
              <button
                onClick={onOpenLeaderboard}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-100 rounded-lg transition-all duration-200 hover:shadow-md"
                title="Leaderboard"
              >
                <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            )}

            {/* Progress Button - Students only */}
            {user.role === 'student' && (
              <button
                onClick={onOpenProgress}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:shadow-md"
                title="My Progress"
              >
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            )}

            {/* Store Button - Students only */}
            {user.role === 'student' && (
              <button
                onClick={onOpenStore}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-100 rounded-lg transition-all duration-200 hover:shadow-md"
                title="Open Store"
              >
                <ShoppingBagIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            )}

            {/* Parent Dashboard (Only visible to parents or via secret click?) - For now visible to all for demo */}
            <button
              onClick={onOpenParentDashboard}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:shadow-md hidden md:block"
              title="Parent Dashboard"
            >
              <span className="text-2xl">👨‍👩‍👧</span>
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="font-semibold text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
              </div>
              
              <div className="relative group">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-200 flex items-center justify-center text-lg sm:text-xl cursor-pointer transition-all group-hover:scale-110 group-hover:shadow-lg ${user.avatarConfig.color}`}
                >
                  {/* Simple avatar representation */}
                  {user.avatarConfig.accessory === 'glasses' && '👓'}
                  {user.avatarConfig.accessory === 'hat' && '🤠'}
                  {user.avatarConfig.accessory === 'crown' && '👑'}
                  {user.avatarConfig.accessory === 'bow' && '🎀'}
                  {!user.avatarConfig.accessory && '😊'}
                </div>
                
                {/* Dropdown for logout */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50 border border-gray-100">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-lg mx-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;