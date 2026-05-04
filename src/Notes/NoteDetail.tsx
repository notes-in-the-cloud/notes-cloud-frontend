import type { Note } from '../types';

interface Props {
  note: Note;
  onBack: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteDetail({ note, onBack, onEdit, onDelete }: Props) {
  const formattedDate = new Date(note.updatedAt).toLocaleString(undefined, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="note-detail">
      <header className="note-detail-header">
        <button className="note-detail-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back</span>
        </button>

        <div className="note-detail-actions">
          <button className="note-detail-action-btn" onClick={() => onEdit(note)} aria-label="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            className="note-detail-action-btn note-detail-action-btn--danger"
            onClick={() => onDelete(note.id)}
            aria-label="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </header>

      <div className="note-detail-color-bar" style={{ background: note.color }} />

      <h1 className="note-detail-title">{note.title}</h1>

      <p className="note-detail-meta">Last updated: {formattedDate}</p>

      <div className="note-detail-content">{note.content}</div>
    </div>
  );
}
