import type { Notification } from '../types';
import './Reminders.css';

interface Props {
  notifications?: Notification[];
  onClose: () => void;
}

export default function NotificationsPanel({ notifications = [], onClose }: Props) {
  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <aside className="side-panel">
        <div className="panel-header">
          <div className="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Notifications</span>
          </div>
          <button className="panel-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="panel-content">
          {notifications.length === 0 ? (
            <p className="panel-empty">No notifications.</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item${n.read ? ' notif-item--read' : ''}`}>
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-subtitle">{n.subtitle}</div>
                <div className="notif-item-time">{n.time}</div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
