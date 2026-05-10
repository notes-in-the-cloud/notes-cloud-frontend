import type { Note } from '../types';
import { getCurrentUserId } from '../Auth/Session';

const BASE = 'http://localhost:5075';

function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

function getUserId(): string {
  return getCurrentUserId() ?? '';
}

export interface NoteDto {
  title: string;
  content: string;
  color: string;
}

export async function fetchNotes(): Promise<Note[]> {
  const userId = getUserId();
  const res = await fetch(`${BASE}/api/users/${userId}/notes`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const userId = getUserId();
  const res = await fetch(`${BASE}/api/users/${userId}/notes/${noteId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch note');
  return res.json();
}

export async function createNote(data: NoteDto): Promise<Note> {
  const userId = getUserId();
  const res = await fetch(`${BASE}/api/users/${userId}/notes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}

export async function updateNote(noteId: string, data: NoteDto): Promise<Note> {
  const userId = getUserId();
  const res = await fetch(`${BASE}/api/users/${userId}/notes/${noteId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteNote(noteId: string): Promise<void> {
  const userId = getUserId();
  const res = await fetch(`${BASE}/api/users/${userId}/notes/${noteId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete note');
}
