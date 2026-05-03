import { useState } from 'react';
import HeaderBar from './HeaderBar';
import RemindersPage from './Reminders';
import NotificationsPanel from './Notifications';
import type { Page } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function Notes({ onNavigate, darkMode, onToggleTheme }: Props) {
  const [showReminders, setShowReminders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="notes-layout">
      <HeaderBar
        onLogOut={() => onNavigate('login')}
        onReminders={() => setShowReminders(true)}
        onNotifications={() => setShowNotifications(prev => !prev)}
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
      />

      {showReminders ? (
        <RemindersPage onBack={() => setShowReminders(false)} />
      ) : (
        <main className="main-container" />
      )}

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
