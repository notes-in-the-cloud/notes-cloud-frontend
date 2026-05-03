import type { Reminder } from '../../types';
import { PRIORITY_META, type EnrichedReminder } from './Types';
import { formatTimeLabel, relativeLabel } from './Helper';
import { Icon } from './Icons';

interface Props {
  reminder: EnrichedReminder;
  now: Date;
  togglingId: string | null;
  deletingId: string | null;
  onOpenEdit: (r: Reminder) => void;
  onToggleComplete: (r: Reminder) => void;
  onDelete: (id: string) => void;
}

export default function ReminderCard({
  reminder: r,
  now,
  togglingId,
  deletingId,
  onOpenEdit,
  onToggleComplete,
  onDelete,
}: Props) {
  const isOverdue = r.status !== 'COMPLETED' && r._date < now;
  const isCompleted = r.status === 'COMPLETED';
  const accentClass =
    isCompleted ? 'reminder-card--completed' :
    isOverdue   ? 'reminder-card--overdue'   : '';

  return (
    <div
      className={`reminder-card ${accentClass}`}
      onClick={() => !isCompleted && onOpenEdit(r)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && !isCompleted) {
          e.preventDefault();
          onOpenEdit(r);
        }
      }}
    >
      <button
        className={`reminder-checkbox${isCompleted ? ' reminder-checkbox--checked' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleComplete(r); }}
        disabled={togglingId === r.id}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        {isCompleted && Icon.check}
      </button>

      <div className={`reminder-card-icon ${
        isCompleted ? 'reminder-card-icon--completed' :
        isOverdue   ? 'reminder-card-icon--overdue'   : ''
      }`}>
        {isOverdue ? Icon.alert : Icon.bell}
      </div>

      <div className="reminder-card-body">
        <div className="reminder-card-meta">
          <span className={`reminder-card-time${isOverdue ? ' reminder-card-time--overdue' : ''}`}>
            {formatTimeLabel(r._date, now)}
          </span>
          {!isCompleted && (
            <span className="reminder-card-relative">· {relativeLabel(r._date, now)}</span>
          )}
          <span className={`reminder-prio-badge ${PRIORITY_META[r.priority].cls}`}>
            <span className="reminder-prio-flag">{Icon.flag}</span>
            {PRIORITY_META[r.priority].label}
          </span>
        </div>

        <h3 className="reminder-card-title">{r.heading}</h3>

        {r.description && (
          <p className="reminder-card-desc">{r.description}</p>
        )}

        <div className="reminder-card-channels">
          {r.notifyInApp && (
            <span className="reminder-card-channel">{Icon.device}<span>In app</span></span>
          )}
          {r.notifyEmail && (
            <span className="reminder-card-channel">{Icon.mail}<span>Email</span></span>
          )}
          {r.notifyPush && (
            <span className="reminder-card-channel">{Icon.bellSmall}<span>Push</span></span>
          )}
        </div>
      </div>

      <button
        className="reminder-card-delete"
        aria-label="Delete"
        disabled={deletingId === r.id}
        onClick={e => { e.stopPropagation(); onDelete(r.id); }}
      >
        {Icon.trash}
      </button>
    </div>
  );
}