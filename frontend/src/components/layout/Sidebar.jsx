import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/helpers';

const navItems = [
  { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['ALL'] },
  { name: 'Documents', icon: 'description', path: '/documents', roles: ['ALL'] },
  { name: 'Upload Document', icon: 'cloud_upload', path: '/documents/upload', roles: ['ADMIN', 'CONTENT_OWNER'] },
  { name: 'Ask Question', icon: 'quiz', path: '/query', roles: ['ALL'] },
  { name: 'Query History', icon: 'history', path: '/query/history', roles: ['ALL'] },
  { name: 'Analytics', icon: 'bar_chart', path: '/analytics', roles: ['ADMIN', 'REVIEWER'] },
  { name: 'Audit Logs', icon: 'assignment', path: '/audit', roles: ['ADMIN'] },
  { name: 'Profile', icon: 'person', path: '/profile', roles: ['ALL'] },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const visibleItems = navItems.filter(item =>
    item.roles.includes('ALL') || hasRole(item.roles)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 dark:bg-dark-bg flex flex-col
        transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="material-icons text-white text-lg">library_books</span>
          </div>
          <span className="text-white font-semibold text-base truncate">Knowledge Platform</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <span className="material-icons text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {getInitials(user)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.username}</p>
              <p className="text-gray-500 text-xs truncate">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full mt-1"
          >
            <span className="material-icons text-xl">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

// Helper inside component file
const getInitials = (user) => user?.username?.[0]?.toUpperCase() || 'U';

export default Sidebar;
