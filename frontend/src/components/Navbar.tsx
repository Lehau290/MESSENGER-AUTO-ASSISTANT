import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, ExternalLink, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenSidebar: () => void;
  pendingRemindersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, pendingRemindersCount = 0 }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b glass-panel border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Đồng bộ thời gian thực
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Open Messenger */}
        <a
          href="https://www.messenger.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/60 transition-all"
        >
          <span>Mở Messenger</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Notification Bell */}
        <Link
          to="/schedules"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Lịch nhắc nhở"
        >
          <Bell className="w-4 h-4" />
          {pendingRemindersCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </Link>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Chuyển chế độ sáng/tối"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-blue-200/50">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {user?.fullName || 'Người dùng'}
            </span>
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-52 py-1.5 rounded-2xl glass-panel shadow-xl shadow-slate-900/10 border border-slate-200/80 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="px-4 py-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Hồ sơ cá nhân
              </Link>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
