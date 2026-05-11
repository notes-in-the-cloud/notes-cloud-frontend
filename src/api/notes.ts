import type { Note } from '../types';
import { API_BASE_URL, authHeaders, parseApiResponse } from './config';

export interface NoteDto {
  title: string;
  content: string;
  color?: string;
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API_BASE_URL}/notes`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<Note[]>(res);
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<Note>(res);
}

export async function createNote(data: NoteDto): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<Note>(res);
}

export async function updateNote(noteId: string, data: NoteDto): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<Note>(res);
}

export async function deleteNote(noteId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return parseApiResponse<void>(res);
}
