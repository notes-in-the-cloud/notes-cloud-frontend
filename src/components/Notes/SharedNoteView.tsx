import { useState, useEffect } from 'react';
import type { Note } from '../../types';
import { getSharedNote } from '../../api/sharing';
import './SharedNoteView.css';

interface Props {
  token: string;
}

export default function SharedNoteView({ token }: Props) {
  const [note, setNote] = useState<Note | null>(null);
  const [status, setStatus] = useState<'loading' | 'expired' | 'not_found' | 'error' | 'ok'>('loading');

  useEffect(() => {
    getSharedNote(token)
      .then(n => { setNote(n); setStatus('ok'); })
      .catch(err => {
        if (err.message === 'expired')
           setStatus('expired');
        else if (err.message === 'not_found')
           setStatus('not_found');
        else 
          setStatus('error');
      });
  }, [token]);

  const formattedDate = note
    ? new Date(note.updatedAt).toLocaleString(undefined, {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    : '';

  return (
    <div className="shared-note-page">
      <header className="shared-note-header">
        <span className="shared-note-badge">Shared note</span>
      </header>

      {status === 'loading' && (
        <div className="shared-note-state">Loading…</div>
      )}

      {status === 'expired' && (
        <div className="shared-note-state shared-note-state--error">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p>This link has expired.</p>
          <span>Share links are valid for 5 minutes.</span>
        </div>
      )}

      {status === 'not_found' && (
        <div className="shared-note-state shared-note-state--error">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>Link not found.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="shared-note-state shared-note-state--error">
          <p>Could not load note.</p>
        </div>
      )}

      {status === 'ok' && note && (
        <div className="shared-note-body">
          <div className="shared-note-color-bar" style={{ background: note.color }} />
          <h1 className="shared-note-title">{note.title}</h1>
          <p className="shared-note-meta">Last updated: {formattedDate}</p>
          <div className="shared-note-content">{note.content}</div>
        </div>
      )}
    </div>
  );
}
