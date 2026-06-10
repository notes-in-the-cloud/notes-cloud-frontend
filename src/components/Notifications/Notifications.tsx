import { useState } from 'react';
import type { Notification } from '../../types';
import type { NotifTab } from '../../hooks/useNotifications';
import './Notifications.css';

interface Props {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  tab: NotifTab;
  onTabChange: (tab: NotifTab) => void;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onOpenReminder: (reminderId: string) => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;

  return date.toLocaleDateString();
}

function formatFullTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function NotificationsPanel({
  notifications,
  unreadCount,
  totalCount,
  tab,
  onTabChange,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenReminder,
}: Props) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  function handleClick(n: Notification) {
    setSelectedNotification({ ...n, read: true });

    if (!n.read) {
      onMarkAsRead(n.id);
    }
  }

  function handleTabChange(nextTab: NotifTab) {
    setSelectedNotification(null);
    onTabChange(nextTab);
  }

  function handleOpenReminder() {
    if (!selectedNotification) {
      return;
    }

    onOpenReminder(selectedNotification.reminderId);
    onClose();
  }

  return (
    <>
      <div className="notif-backdrop" onClick={onClose} />
      <div className="notif-dropdown">
        <div className="notif-header">
          {selectedNotification ? (
            <button className="notif-back-btn" type="button" onClick={() => setSelectedNotification(null)}>
              Back
            </button>
          ) : (
            <span className="notif-header-title">Notifications</span>
          )}

          {!selectedNotification && unreadCount > 0 && (
            <button className="notif-mark-all" type="button" onClick={onMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        {!selectedNotification && (
          <div className="notif-tabs">
            <button
              className={`notif-tab${tab === 'all' ? ' notif-tab--active' : ''}`}
              type="button"
              onClick={() => handleTabChange('all')}
            >
              All {totalCount}
            </button>
            <button
              className={`notif-tab${tab === 'unread' ? ' notif-tab--active' : ''}`}
              type="button"
              onClick={() => handleTabChange('unread')}
            >
              Unread {unreadCount}
            </button>
          </div>
        )}

        {selectedNotification ? (
          <div className="notif-detail">
            <div className="notif-detail-icon">
              <BellIcon />
            </div>
            <div className="notif-detail-content">
              <span className={`notif-priority notif-priority--${selectedNotification.priority.toLowerCase()}`}>
                {selectedNotification.priority}
              </span>
              <h2>{selectedNotification.heading}</h2>
              {selectedNotification.message && <p>{selectedNotification.message}</p>}
              <div className="notif-detail-meta">
                <span>{formatFullTime(selectedNotification.firedAt)}</span>
              </div>
            </div>
            <div className="notif-detail-actions">
              <button className="notif-secondary-btn" type="button" onClick={() => setSelectedNotification(null)}>
                Back to list
              </button>
              <button className="notif-primary-btn" type="button" onClick={handleOpenReminder}>
                Open reminder
              </button>
            </div>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                {tab === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
              </div>
            ) : (
              notifications.map(n => (
                <button
                  type="button"
                  key={n.id}
                  className={`notif-row${n.read ? ' notif-row--read' : ''}`}
                  onClick={() => handleClick(n)}
                >
                  <div className="notif-icon-wrap">
                    <BellIcon />
                  </div>
                  <div className="notif-body">
                    <div className="notif-body-title">{n.heading}</div>
                    {n.message && <div className="notif-body-sub">{n.message}</div>}
                    <div className="notif-body-meta">
                      <span>{formatTime(n.firedAt)}</span>
                      {!n.read && (
                        <>
                          <span>-</span>
                          <span className="notif-body-action">View notification</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!n.read && <div className="notif-unread-dot" />}
                </button>
              ))
            )}
          </div>
        )}

        {!selectedNotification && (
          <div className="notif-footer">
            <button className="notif-close-btn" type="button" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </>
  );
}
