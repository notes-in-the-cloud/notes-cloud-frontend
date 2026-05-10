import { useState } from 'react';
import type { Note } from '../../types';
import './NoteEditor.css';

const NOTE_COLORS = ['#E8DCC8', '#C8D8E8', '#D8E8C8', '#E8C8D8', '#D8C8E8', '#E8E0C8'];

interface Props {
  existing: Note | null;
  submitting: boolean;
  formError: string;
  onSubmit: (data: { title: string; content: string; color: string }) => void;
  onClose: () => void;
}

export default function NoteEditor({ existing, submitting, formError, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [color, setColor] = useState(existing?.color ?? NOTE_COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, content, color });
  }

  return (
    <div className="note-editor-overlay" onClick={onClose}>
      <div className="note-editor" onClick={e => e.stopPropagation()}>

        <div className="note-editor-header">
          <div className="note-editor-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <h3>{existing ? 'Edit note' : 'New note'}</h3>
          </div>
          <button className="note-editor-close" type="button" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="note-editor-body">
          <div className="note-editor-color-row">
            <span className="note-editor-color-label">Color</span>
            {NOTE_COLORS.map(c => (
              <span
                key={c}
                className={`note-editor-color-swatch${color === c ? ' note-editor-color-swatch--active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          {formError && <div className="note-editor-error">{formError}</div>}

          <label className="note-editor-label">Title</label>
          <input
            className="note-editor-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Note title"
            autoFocus
            required
            style={{ marginBottom: '0.875rem' }}
          />

          <label className="note-editor-label">Content</label>
          <textarea
            className="note-editor-input note-editor-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Start writing..."
            rows={5}
          />

          <div className="note-editor-footer">
            <button type="button" className="note-editor-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="note-editor-btn-save" disabled={submitting}>
              {submitting ? 'Saving…' : existing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
