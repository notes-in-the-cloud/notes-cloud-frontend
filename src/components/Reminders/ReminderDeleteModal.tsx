import { useState } from 'react';
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
  const [confirmation, setConfirmation] = useState('');
  const expectedTitle = reminder.heading.trim();
  const canDelete = confirmation.trim() === expectedTitle;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (canDelete && !deleting) {
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
            Type the reminder title to confirm this action.
          </p>
        </div>

        <label className="reminder-delete-label" htmlFor="reminder-delete-confirmation">
          Reminder title
        </label>
        <input
          id="reminder-delete-confirmation"
          className="reminder-form-input"
          value={confirmation}
          onChange={e => setConfirmation(e.target.value)}
          placeholder={reminder.heading}
          autoFocus
          disabled={deleting}
        />

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
            disabled={!canDelete || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete reminder'}
          </button>
        </div>
      </form>
    </div>
  );
}
