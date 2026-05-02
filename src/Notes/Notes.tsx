import { useState } from 'react';
import HeaderBar from './HeaderBar';
import RemindersPage from './Reminders';
import NotificationsPanel from './Notifications';
import type { Page } from '../types';

export default function Notes({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [showReminders, setShowReminders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="notes-layout">
      <HeaderBar
        onLogOut={() => onNavigate('login')}
        onReminders={() => setShowReminders(true)}
        onNotifications={() => setShowNotifications(prev => !prev)}
      />

      {showReminders ? (
        <RemindersPage onBack={() => setShowReminders(false)} />
      ) : (
        <main className="main-container" />
      )}

      {!showReminders && showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
