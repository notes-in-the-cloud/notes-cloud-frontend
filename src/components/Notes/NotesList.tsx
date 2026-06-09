import { useState, useEffect } from 'react';
import type { Note } from '../../types';
import { fetchNotes, createNote, updateNote, deleteNote } from '../../api/notes';
import NoteCard from './NoteCard';
import NoteDetail from './NoteDetail';
import NoteEditor from './NoteEditor';
import NoteDeleteModal from './NoteDeleteModal';
import './NotesList.css';

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError('');
      fetchNotes()
        .then(data => setNotes(data))
        .catch(err => {
          console.error('Failed to load notes:', err);
          setError('Could not load notes. Make sure the notes service is running.');
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingNote(null);
    setFormError('');
    setShowEditor(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setFormError('');
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setEditingNote(null);
    setFormError('');
  }

  async function handleSubmit(data: { title: string; content: string; color: string }) {
    setFormError('');
    setSubmitting(true);
    try {
      if (editingNote) {
        const updated = await updateNote(editingNote.id, data);
        setNotes(prev => prev.map(n => n.id === editingNote.id ? updated : n));
        if (viewingNote?.id === editingNote.id) setViewingNote(updated);
      } else {
        const created = await createNote(data);
        setNotes(prev => [created, ...prev]);
      }
      closeEditor();
    } catch (err) {
      console.error('Failed to save note:', err);
      setFormError('Could not save note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function openDeleteModal(id: string) {
    const note = notes.find(n => n.id === id) ?? (viewingNote?.id === id ? viewingNote : null);

    if (!note) {
      return;
    }

    setNoteToDelete(note);
  }

  function closeDeleteModal() {
    if (deletingId) {
      return;
    }

    setNoteToDelete(null);
  }

  async function handleDelete() {
    if (!noteToDelete) {
      return;
    }

    const id = noteToDelete.id;

    setDeletingId(id);
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (viewingNote?.id === id) setViewingNote(null);
      setNoteToDelete(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const deleteModal = noteToDelete && (
    <NoteDeleteModal
      note={noteToDelete}
      deleting={deletingId === noteToDelete.id}
      onCancel={closeDeleteModal}
      onConfirm={handleDelete}
    />
  );

  if (viewingNote) {
    return (
      <div className="notes-list-page">
        <NoteDetail
          note={viewingNote}
          onBack={() => setViewingNote(null)}
          onEdit={(note) => { openEdit(note); }}
          onDelete={openDeleteModal}
        />

        {showEditor && (
          <NoteEditor
            existing={editingNote}
            submitting={submitting}
            formError={formError}
            onSubmit={handleSubmit}
            onClose={closeEditor}
          />
        )}

        {deleteModal}
      </div>
    );
  }

  return (
    <div className="notes-list-page">
      <div className="notes-list-top">
        <div className="notes-list-heading">
          <h1>My Notes</h1>
          <p>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
        </div>
        <button className="notes-new-btn" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New note
        </button>
      </div>

      <div className="notes-search">
        <span className="notes-search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          className="notes-search-input"
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="notes-error">{error}</div>}

      {loading ? (
        <div className="notes-loading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
          Loading notes…
        </div>
      ) : filtered.length === 0 ? (
        <div className="notes-empty">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <p>{search ? 'No notes found.' : 'No notes yet. Create your first one!'}</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              deletingId={deletingId}
              onView={setViewingNote}
              onEdit={openEdit}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {showEditor && (
        <NoteEditor
          existing={editingNote}
          submitting={submitting}
          formError={formError}
          onSubmit={handleSubmit}
          onClose={closeEditor}
        />
      )}

      {deleteModal}
    </div>
  );
}
