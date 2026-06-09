import { useState, useMemo } from 'react';
import HeaderBar from '../Header/HeaderBar';
import RemindersPage from '../Reminders/Reminders';
import NotesList from './NotesList';
import NotificationsPanel from '../Notifications/Notifications';
import ToastContainer from '../Notifications/ToastNotification';
import { useNotifications } from '../../hooks/useNotifications';
import { loadSession } from '../Auth/Session';
import type { Page } from '../../types';
import TodosPage from '../Todos/Todos';
import AccountSettingsModal from '../Header/AccountSettingsModal';

interface Props {
  onNavigate: (page: Page) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function Notes({ onNavigate, darkMode, onToggleTheme }: Props) {
  const [showReminders, setShowReminders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openReminderId, setOpenReminderId] = useState<string | undefined>(undefined);

  const session = useMemo(() => loadSession(), []);
  const userId = session?.userId ?? null;
  const userName = session?.userName;

  const [showTodos, setShowTodos] = useState(false);

  const {
    displayed, unreadCount, allCount, latestNotification, tab, setTab,
    toasts, dismissToast, completeFromToast, markAsRead, markAllAsRead,
  } = useNotifications(userId, showNotifications);

  function handleOpenReminder(reminderId: string) {
    setOpenReminderId(reminderId);
    setShowReminders(true);
  }

  function handleBackFromReminders() {
    setShowReminders(false);
    setOpenReminderId(undefined);
  }

  function handleBackFromTodos() {
    setShowTodos(false);
  }

  return (
    <div className="notes-layout">
      <HeaderBar
        userName={userName}
        onLogOut={() => onNavigate('login')}
        onTodos={() => {
          setShowReminders(false);
          setOpenReminderId(undefined);
          setShowTodos(true);
        }}
        onReminders={() => {
          setShowTodos(false);
          setOpenReminderId(undefined);
          setShowReminders(true);
        }}
        onNotifications={() => {
          if (!showNotifications && unreadCount > 0) {
            setTab('unread');
          }

          setShowNotifications(prev => !prev);
        }}
        onSettings={() => setShowSettings(true)}
        notifCount={unreadCount}
        notificationPreview={latestNotification?.heading}
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
      />

      {showTodos ? (
        <TodosPage onBack={handleBackFromTodos} />
      ) : showReminders ? (
        <RemindersPage onBack={handleBackFromReminders} openReminderId={openReminderId} />
      ) : (
        <main className="main-container">
          <NotesList />
        </main>
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

      {showSettings && (
        <AccountSettingsModal
          userName={userName}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
