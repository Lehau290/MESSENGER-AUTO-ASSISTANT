import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ReminderModal, ReminderData } from '../components/ReminderModal';
import { getSocket } from '../services/socket';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<ReminderData | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleReminderTrigger = (data: ReminderData) => {
      console.log('[Socket] Nhận sự kiện nhắc nhở:', data);
      setActiveReminder(data);

      // Play audio notification chime
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch {
        // ignore
      }

      // Web Notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.contactName ? `Nhắc gửi tin cho ${data.contactName}` : 'Đến giờ gửi tin!', {
          body: data.content,
          icon: '/vite.svg',
        });
      }
    };

    socket.on('reminder:trigger', handleReminderTrigger);

    // Request notification permission once
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.off('reminder:trigger', handleReminderTrigger);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          pendingRemindersCount={activeReminder ? 1 : 0}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Reminder Alert Modal */}
      <ReminderModal
        data={activeReminder}
        onClose={() => setActiveReminder(null)}
      />
    </div>
  );
};
