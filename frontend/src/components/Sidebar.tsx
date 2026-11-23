import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Bot,
  Zap,
  CalendarClock,
  Users,
  BookmarkCheck,
  History,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/messages', label: 'Quản lý tin nhắn', icon: MessageSquare },
  { to: '/ai-generator', label: 'Soạn tin nhắn AI', icon: Sparkles, badge: 'HOT' },
  { to: '/ai-conversation', label: 'Trợ lý hội thoại AI', icon: Bot },
  { to: '/automation', label: 'Tự động hóa', icon: Zap },
  { to: '/schedules', label: 'Lịch gửi tin nhắn', icon: CalendarClock },
  { to: '/contacts', label: 'Danh bạ', icon: Users },
  { to: '/templates', label: 'Thư viện mẫu tin', icon: BookmarkCheck },
  { to: '/history', label: 'Lịch sử hoạt động', icon: History },
  { to: '/settings', label: 'Cài đặt hệ thống', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r transition-transform duration-300 ease-in-out lg:translate-x-0 glass-panel border-slate-200/80 dark:border-slate-800/80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Messenger Assistant
              </h1>
              <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                AI Auto & Planner
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Menu chính
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-500 text-white tracking-wide">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Policy & Compliance badge */}
        <div className="absolute bottom-4 left-3 right-3 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-700 dark:text-slate-200">
              An toàn Meta Policy
            </div>
            <div className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              Không lấy cookie hay mật khẩu. Người dùng luôn kiểm soát xác nhận gửi.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
