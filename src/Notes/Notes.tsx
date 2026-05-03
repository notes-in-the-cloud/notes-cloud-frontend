import { useState } from 'react';
import HeaderBar from './HeaderBar';
import RemindersPage from './Reminders';
import NotificationsPanel from './Notifications';
import ToastContainer from './ToastNotification';
import { useNotifications } from '../hooks/useNotifications';
import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function Notes({ onNavigate, darkMode, onToggleTheme }: Props) {
  const [showReminders, setShowReminders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [openReminderId, setOpenReminderId] = useState<string | undefined>(undefined);

  const userId = localStorage.getItem('userId');
  const {
    displayed,
    unreadCount,
    allCount,
    tab,
    setTab,
    toasts,
    dismissToast,
    completeFromToast,
    markAsRead,
    markAllAsRead,
  } = useNotifications(userId, showNotifications);

  function handleOpenReminder(reminderId: string) {
    setOpenReminderId(reminderId);
    setShowReminders(true);
  }

  function handleBackFromReminders() {
    setShowReminders(false);
    setOpenReminderId(undefined);
  }

  return (
    <div className="notes-layout">
      <HeaderBar
        onLogOut={() => onNavigate('login')}
        onReminders={() => { setOpenReminderId(undefined); setShowReminders(true); }}
        onNotifications={() => setShowNotifications(prev => !prev)}
        notifCount={unreadCount}
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
      />

      {showReminders ? (
        <RemindersPage onBack={handleBackFromReminders} openReminderId={openReminderId} />
      ) : (
        <main className="main-container" />
      )}

      {showNotifications && (
        <NotificationsPanel
          notifications={displayed}
          unreadCount={unreadCount}
          totalCount={allCount}
          tab={tab}
          onTabChange={setTab}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onOpenReminder={handleOpenReminder}
        />
      )}

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onComplete={completeFromToast}
      />
    </div>
  );
}
