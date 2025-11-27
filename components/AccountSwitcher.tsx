import React, { useState, useEffect } from 'react';
import { UserGroupIcon, ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { UserProfile } from '../types';

interface AccountSwitcherProps {
  currentUser: UserProfile | null;
  onSwitchAccount: (user: UserProfile) => void;
  onLogout: () => void;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  currentUser,
  onSwitchAccount,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?.role === 'parent') {
      loadChildAccounts();
    }
  }, [isOpen, currentUser]);

  const loadChildAccounts = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const children = await firebaseAuthService.getParentChildren(currentUser.id);
      setAccounts(children);
    } catch (error) {
      console.error('Error loading child accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Account Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Switch accounts"
      >
        <UserGroupIcon className="h-5 w-5 text-gray-600" />
        <span className="hidden sm:inline text-sm font-medium text-gray-700">Accounts</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 animate-pop-in">
          {/* Current Account */}
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <p className="text-xs font-bold text-gray-600 mb-2">Currently logged in as:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-600 capitalize">{currentUser.role}</p>
              </div>
              <div className="text-2xl">
                {currentUser.role === 'parent' ? '👨‍👩‍👧' : '👧'}
              </div>
            </div>
          </div>

          {/* Available Accounts */}
          {currentUser.role === 'parent' && (
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-600">
                  <p className="text-sm">Loading children...</p>
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-1">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        onSwitchAccount(account);
                        setIsOpen(false);
                      }}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0 flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{account.name}</p>
                        <p className="text-xs text-gray-600">
                          {account.totalPoints} points • Age {account.age}
                        </p>
                      </div>
                      <div className="text-2xl opacity-70 group-hover:opacity-100">👧</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-600">
                  <p className="text-sm">No children linked yet</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Overlay to close menu */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
};

export default AccountSwitcher;
