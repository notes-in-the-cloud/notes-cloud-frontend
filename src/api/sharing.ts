import { API_BASE_URL, authHeaders, parseApiResponse } from './config';

export interface ShareLinkResponse {
  token: string;
  url?: string;
  shareUrl?: string;
  expiresAt?: string;
}

export interface SharedNoteResponse {
  id: string;
  title: string;
  content: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createShareLink(noteId: string): Promise<ShareLinkResponse> {
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
