import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeToggle } from '../ThemeToggle';

interface Props {
  onUpgrade?: () => void;
}

export function UserProfileButton({ onUpgrade }: Props) {
  const { t } = useTranslation('auth');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const usedBacktests = user.backtestExecutionCount;
  const maxBacktests = user.isPremium ? '∞' : '20';
  const progressPercentage = user.isPremium ? 0 : Math.min((usedBacktests / 20) * 100, 100);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
          {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            {user.displayName || t('profile.button.user')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user.isPremium ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Premium</span>
            ) : (
              `${usedBacktests}/${maxBacktests} backtest`
            )}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-slate-900 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{user.displayName || t('profile.button.user')}</p>
                <p className="text-indigo-100 text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {user.isPremium ? t('profile.dropdown.planPremium') : t('profile.dropdown.planFree')}
              </span>
              {user.isPremium ? (
                <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  {t('profile.dropdown.active')}
                </span>
              ) : (
                <span className="text-sm font-bold text-slate-900 dark:text-white">{t('profile.dropdown.backtestsUsed', { used: usedBacktests })}</span>
              )}
            </div>

            {!user.isPremium && (
              <>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progressPercentage >= 100
                        ? 'bg-red-500'
                        : progressPercentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {usedBacktests >= 20
                    ? t('profile.dropdown.limitReached')
                    : t('profile.dropdown.backtestsRemaining', { remaining: 20 - usedBacktests })}
                </p>
              </>
            )}
          </div>

          {/* Upgrade Button */}
          {!user.isPremium && (
            <div className="px-4">
              <button
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                onClick={() => {
                  setIsOpen(false);
                  onUpgrade?.();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t('profile.dropdown.upgrade')}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('profile.dropdown.upgradeSubtitle')}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* Settings */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('profile.dropdown.settings', 'Impostazioni')}
            </p>
            <div className="space-y-3">
              {/* Language Selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {t('profile.dropdown.language', 'Lingua')}
                </span>
                <LanguageSwitcher />
              </div>
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {t('profile.dropdown.theme', 'Tema')}
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 dark:border-slate-700 py-3 px-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('profile.dropdown.logout')}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
