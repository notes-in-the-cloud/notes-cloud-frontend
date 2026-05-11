import type { Note } from '../types';
import { API_BASE_URL, authHeaders, parseApiResponse } from './config';

export interface ShareLinkResponse {
  token: string;
  url?: string;
  shareUrl?: string;
  expiresAt?: string;
}

export interface SharedNoteResponse {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export async function createShareLink(noteOrId: Note | string): Promise<ShareLinkResponse> {
  const noteId = typeof noteOrId === 'string' ? noteOrId : noteOrId.id;

  const res = await fetch(`${API_BASE_URL}/notes/${noteId}/share-links`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseApiResponse<ShareLinkResponse>(res);
}

export async function openShareLink(token: string): Promise<SharedNoteResponse> {
  const res = await fetch(`${API_BASE_URL}/share-links/${token}`, {
    method: 'GET',
  });

  return parseApiResponse<SharedNoteResponse>(res);
}

export async function getSharedNote(token: string): Promise<SharedNoteResponse> {
  return openShareLink(token);
}

export function extractToken(response: ShareLinkResponse | string): string {
  if (typeof response === 'string') {
    return response;
  }

  if (response.token) {
    return response.token;
  }

  if (response.shareUrl) {
    return extractTokenFromUrl(response.shareUrl);
  }

  if (response.url) {
    return extractTokenFromUrl(response.url);
  }

  return '';
}

export function buildFrontendShareUrl(token: string): string {
  return `${window.location.origin}/?share=${token}`;
}

function extractTokenFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1] ?? '';
}