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
    <header className="bg-white shadow-md w-full sticky top-0 z-40" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={onHomeClick} 
            className="flex items-center space-x-3 group"
            aria-label="Go to home page"
          >
            <AcademicCapIcon className="h-10 w-10 text-blue-500 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 group-hover:text-gray-900 transition-colors hidden sm:block">
              KS2 Learning
            </h1>
          </button>

          {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user.role === 'admin' && <EmbeddingSelector />}
              {user.role === 'admin' && <TTSDemo />}
            {/* Badges Display */}
            <div 
              className="hidden sm:flex items-center space-x-1 bg-blue-100 text-blue-800 font-bold px-3 py-2 rounded-full shadow-inner cursor-help"
              role="status"
              aria-label={`Badges earned: ${user.badges?.length || 0}`}
              title={`Badges: ${user.badges?.map(b => b.name).join(', ') || 'None yet'}`}
            >
              <span className="text-xl">🏅</span>
              <span className="text-lg">{user.badges?.length || 0}</span>
            </div>

            {/* Streak Display */}
            <div 
              className="flex items-center space-x-1 bg-orange-100 text-orange-800 font-bold px-3 py-2 rounded-full shadow-inner"
              role="status"
              aria-label={`Current streak: ${user.streak || 0} days`}
              title="Daily Streak"
            >
              <FireIcon className="h-6 w-6 text-orange-500" aria-hidden="true" />
              <span className="text-lg">{user.streak || 0}</span>
            </div>

            {/* Points Display */}
            <div 
              className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-full shadow-inner"
              role="status"
              aria-label={`Total points: ${user.totalPoints}`}
            >
              <StarIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />
              <span className="text-lg">{user.totalPoints}</span>
            </div>

            {/* Leaderboard Button */}
            <button
              onClick={onOpenLeaderboard}
              className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all"
              title="Leaderboard"
            >
              <TrophyIcon className="h-8 w-8" />
            </button>

            {/* Progress Button */}
            <button
              onClick={onOpenProgress}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
              title="My Progress"
            >
              <ChartBarIcon className="h-8 w-8" />
            </button>

            {/* Store Button */}
            <button
              onClick={onOpenStore}
              className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
              title="Open Store"
            >
              <ShoppingBagIcon className="h-8 w-8" />
            </button>

            {/* Parent Dashboard (Only visible to parents or via secret click?) - For now visible to all for demo */}
            <button
              onClick={onOpenParentDashboard}
              className="p-2 text-gray-600 hover:text-purple-500 hover:bg-purple-50 rounded-full transition-all hidden md:block"
              title="Parent Dashboard"
            >
              <span className="text-2xl">👨‍👩‍👧</span>
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="font-bold text-gray-800">{user.name}</span>
                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
              </div>
              
              <div className="relative group">
                <div 
                  className={`w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center text-xl cursor-pointer ${user.avatarConfig.color}`}
                >
                  {/* Simple avatar representation */}
                  {user.avatarConfig.accessory === 'glasses' && '👓'}
                  {user.avatarConfig.accessory === 'hat' && '🤠'}
                  {user.avatarConfig.accessory === 'crown' && '👑'}
                  {user.avatarConfig.accessory === 'bow' && '🎀'}
                  {!user.avatarConfig.accessory && '😊'}
                </div>
                
                {/* Dropdown for logout */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
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