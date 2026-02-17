import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left: Menu button + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover"
        >
          <span className="material-icons">menu</span>
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      {/* Right: Theme toggle + user menu */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="material-icons">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {/* Notification bell */}
        <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors">
          <span className="material-icons">notifications_none</span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.username}
            </span>
            <span className="material-icons text-gray-400 text-sm">expand_more</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 card shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowMenu(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                >
                  <span className="material-icons text-lg">person</span>
                  My Profile
                </button>
                <button
                  onClick={() => { setShowMenu(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-icons text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
