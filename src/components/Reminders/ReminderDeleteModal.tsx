import type { Reminder } from '../../types';
import { Icon } from './Icons';

interface Props {
  reminder: Reminder;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ReminderDeleteModal({
  reminder,
  deleting,
  onCancel,
  onConfirm,
}: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!deleting) {
      onConfirm();
    }
  }

  return (
    <div className="reminder-delete-overlay" onClick={onCancel}>
      <form className="reminder-delete-modal" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <div className="reminder-delete-icon">
          {Icon.alert}
        </div>

        <div className="reminder-delete-content">
          <h2>Delete reminder?</h2>
          <p>
            You are about to delete <strong>{reminder.heading}</strong>.
          </p>
          <p className="reminder-delete-note">
            This action cannot be undone.
          </p>
        </div>

        <div className="reminder-delete-footer">
          <button
            type="button"
            className="reminder-form-btn reminder-form-btn--cancel"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="reminder-form-btn reminder-form-btn--danger"
            disabled={deleting}
            autoFocus
          >
            {deleting ? 'Deleting...' : 'Delete reminder'}
          </button>
        </div>
      </form>
    </div>
  );
}
