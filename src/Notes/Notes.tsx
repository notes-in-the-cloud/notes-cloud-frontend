import { useState } from 'react';
import HeaderBar from './HeaderBar';
import RemindersPanel from './Reminders';
import NotificationsPanel from './Notifications';
import type { Page } from '../types';

type Panel = 'reminders' | 'notifications' | null;

export default function Notes({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  const togglePanel = (panel: Panel) =>
    setOpenPanel(prev => (prev === panel ? null : panel));

  return (
    <div className="notes-layout">
      <HeaderBar
        onLogOut={() => onNavigate('login')}
        onReminders={() => togglePanel('reminders')}
        onNotifications={() => togglePanel('notifications')}
      />
      <main className="main-container" />

      {openPanel === 'reminders' && (
        <RemindersPanel onClose={() => setOpenPanel(null)} />
      )}
      {openPanel === 'notifications' && (
        <NotificationsPanel onClose={() => setOpenPanel(null)} />
      )}
    </div>
  );
}
