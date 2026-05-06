import type { Note } from '../types';

interface Props {
  note: Note;
  deletingId: string | null;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, deletingId, onView, onEdit, onDelete }: Props) {
  const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="note-card" onClick={() => onView(note)}>
      <div className="note-card-color-bar" style={{ background: note.color }} />

      <h3 className="note-card-title">{note.title}</h3>

      {note.content && (
        <p className="note-card-content">{note.content}</p>
      )}

      <div className="note-card-footer">
        <span className="note-card-date">{formattedDate}</span>
        <div className="note-card-actions">
          <button
            className="note-card-btn"
            aria-label="Edit"
            onClick={e => { e.stopPropagation(); onEdit(note); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="note-card-btn note-card-btn--danger"
            aria-label="Delete"
            disabled={deletingId === note.id}
            onClick={e => { e.stopPropagation(); onDelete(note.id); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
