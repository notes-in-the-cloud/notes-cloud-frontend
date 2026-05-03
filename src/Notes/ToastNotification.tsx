import { useEffect, useState } from 'react';
import type { Notification, Priority } from '../types';
import './Toast.css';

const DURATION = 5000;

const PRIO_CLS: Record<Priority, string> = {
  URGENT: 'toast-prio--urgent',
  HIGH:   'toast-prio--high',
  MEDIUM: 'toast-prio--medium',
  LOW:    'toast-prio--low',
};

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
    }, 50);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="toast">
      <div className="toast-top">
        <span className="toast-title">{toast.heading}</span>
        <button className="toast-close" onClick={() => onDismiss(toast.id)}>×</button>
      </div>

      {toast.message && <div className="toast-message">{toast.message}</div>}

      <span className={`toast-prio ${PRIO_CLS[toast.priority]}`}>
        {toast.priority.charAt(0) + toast.priority.slice(1).toLowerCase()}
      </span>

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
  );
}

interface ContainerProps {
  toasts: Notification[];
  onDismiss: (id: string) => void;
  onComplete: (reminderId: string, toastId: string) => void;
}

export default function ToastContainer({ toasts, onDismiss, onComplete }: ContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} onComplete={onComplete} />
      ))}
    </div>
  );
}
