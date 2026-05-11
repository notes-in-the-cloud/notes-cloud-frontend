import type { Note } from '../types';
import { API_BASE_URL, parseApiResponse, fetchWithAuth } from './config';

export interface NoteDto {
  title: string;
  content: string;
  color?: string;
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notes`, {
    method: 'GET',
  });

  return parseApiResponse<Note[]>(res);
}

export async function fetchNoteById(noteId: string): Promise<Note> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'GET',
  });

  return parseApiResponse<Note>(res);
}

export async function createNote(data: NoteDto): Promise<Note> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return parseApiResponse<Note>(res);
}

export async function updateNote(noteId: string, data: NoteDto): Promise<Note> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return parseApiResponse<Note>(res);
}

export async function deleteNote(noteId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'DELETE',
  });

  return parseApiResponse<void>(res);
}
