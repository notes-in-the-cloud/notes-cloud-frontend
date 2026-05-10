import type { Note } from '../types';
import { getCurrentUserId } from '../Auth/Session';

const BASE = 'http://localhost:8083';
const MOCK_MODE = true; 
const MOCK_TTL_MS = 5 * 60 * 1000;
const MOCK_KEY = 'mock_share_links';

export interface ShareLinkResponse {
  id: string;
  noteId: string;
  url: string;
  expiresAt: string;
}

interface MockEntry {
  note: Note;
  expiresAt: number;
}

function mockStore(): Record<string, MockEntry> {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function mockSave(store: Record<string, MockEntry>) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(store));
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createShareLink(note: Note): Promise<ShareLinkResponse> {
  if (MOCK_MODE) {
    const token = generateToken();
    const expiresAt = Date.now() + MOCK_TTL_MS;
    const store = mockStore();
    store[token] = { note, expiresAt };
    mockSave(store);
    return {
      id: crypto.randomUUID(),
      noteId: note.id,
      url: `${BASE}/api/v1/share-links/${token}`,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  const userId = getCurrentUserId() ?? '';
  const res = await fetch(`${BASE}/api/v1/users/${userId}/notes/${note.id}/share-links`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to create share link');
  return res.json();
}

export async function getSharedNote(token: string): Promise<Note> {
  if (MOCK_MODE) {
    const store = mockStore();
    const entry = store[token];
    if (!entry)
       throw new Error('not_found');
    if (Date.now() > entry.expiresAt)
       throw new Error('expired');
    return entry.note;
  }

  const res = await fetch(`${BASE}/api/v1/share-links/${token}`);
  if (res.status === 410)
     throw new Error('expired');
  if (res.status === 404)
     throw new Error('not_found');
  if (!res.ok)
     throw new Error('Failed to load shared note');
  return res.json();
}

export function extractToken(backendUrl: string): string {
  return backendUrl.split('/').pop() ?? '';
}

export function buildFrontendShareUrl(token: string): string {
  return `${window.location.origin}/?share=${token}`;
}
