import { useEffect, useState } from 'react';
import type { Notification, Priority } from '../../types';
import './Toast.css';

const DURATION = 5000;
const TICK_MS = 50;

const PRIO_CLS: Record<Priority, string> = {
  URGENT: 'toast-prio--urgent',
  HIGH: 'toast-prio--high',
  MEDIUM: 'toast-prio--medium',
  LOW: 'toast-prio--low',
};

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

interface ToastProps {
  toast: Notification;
  onDismiss: (id: string) => void;
  onComplete: (reminderId: string, toastId: string) => void;
}

function Toast({ toast, onDismiss, onComplete }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / DURATION) * 100);
      setProgress(pct);

      if (pct === 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [toast.id, onDismiss]);

  const priorityLabel = toast.priority.charAt(0) + toast.priority.slice(1).toLowerCase();

  return (
    <div className="toast" role="alert" aria-live="assertive">
      <div className="toast-icon-wrap">
        <BellIcon />
      </div>

      <div className="toast-content">
        <div className="toast-top">
          <div className="toast-heading">
            <span className="toast-kicker">Reminder due now</span>
            <span className="toast-title">{toast.heading}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <CloseIcon />
          </button>
        </div>

        {toast.message && <div className="toast-message">{toast.message}</div>}

        <div className="toast-meta">
          <span className={`toast-prio ${PRIO_CLS[toast.priority]}`}>{priorityLabel}</span>
          <span className="toast-time">Just now</span>
        </div>

        <div className="toast-actions">
          <button
            className="toast-btn toast-btn--complete"
            onClick={() => onComplete(toast.reminderId, toast.id)}
          >
            Complete
          </button>
          <button
            className="toast-btn toast-btn--dismiss"
            onClick={() => onDismiss(toast.id)}
          >
            Dismiss
          </button>
        </div>

        <div className="toast-progress">
          <div className="toast-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

interface ContainerProps {
  toasts: Notification[];
  onDismiss: (id: string) => void;
  onComplete: (reminderId: string, toastId: string) => void;
}

export default function ToastContainer({ toasts, onDismiss, onComplete }: ContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} onComplete={onComplete} />
      ))}
    </div>
  );
}
