import type { Reminder } from '../../types';
import type { EnrichedReminder } from './Types';
import ReminderCard from './RemindersCard';

interface Props {
  label: string;
  items: EnrichedReminder[];
  barClass: string;
  now: Date;
  togglingId: string | null;
  deletingId: string | null;
  onOpenEdit: (r: Reminder) => void;
  onToggleComplete: (r: Reminder) => void;
  onDelete: (id: string) => void;
}

export default function ReminderGroup({
  label,
  items,
  barClass,
  now,
  togglingId,
  deletingId,
  onOpenEdit,
  onToggleComplete,
  onDelete,
}: Props) {
  if (items.length === 0) return null;
  return (
    <div className="reminder-group">
      <div className="reminder-group-header">
        <span className={`reminder-group-bar ${barClass}`} />
        <h2 className="reminder-group-title">{label}</h2>
        <span className="reminder-group-count">{items.length}</span>
      </div>
      <div className="reminder-group-list">
        {items.map(r => (
          <ReminderCard
            key={r.id}
            reminder={r}
            now={now}
            togglingId={togglingId}
            deletingId={deletingId}
            onOpenEdit={onOpenEdit}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}