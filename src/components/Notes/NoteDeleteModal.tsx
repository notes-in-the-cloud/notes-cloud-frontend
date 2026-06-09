import type { Note } from '../../types';

interface Props {
  note: Note;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function NoteDeleteModal({
  note,
  deleting,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="note-delete-backdrop" onClick={onCancel}>
      <section className="note-delete-modal" onClick={e => e.stopPropagation()}>
        <div className="note-delete-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div className="note-delete-content">
          <h2>Delete note?</h2>
          <p>
            You are about to delete <strong>{note.title}</strong>.
          </p>
          <p className="note-delete-note">
            This note will be removed from your account.
          </p>
        </div>

        <div className="note-delete-footer">
          <button
            type="button"
            className="note-delete-secondary"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="note-delete-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete note'}
          </button>
        </div>
      </section>
    </div>
  );
}
