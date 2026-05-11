import type { Notification } from '../types';
import { API_BASE_URL, parseApiResponse, fetchWithAuth } from './config';

export async function fetchNotifications(read?: boolean): Promise<Notification[]> {
  const url = new URL(`${API_BASE_URL}/notifications`);

  if (read !== undefined) {
    url.searchParams.set('read', String(read));
  }

  const res = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  return parseApiResponse<Notification[]>(res);
}

export async function fetchUnreadNotifications(): Promise<Notification[]> {
  return fetchNotifications(false);
}

export async function markAsRead(id: string): Promise<Notification> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'POST',
  });

  return parseApiResponse<Notification>(res);
}

export async function markAllAsRead(): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
    method: 'POST',
  });

  return parseApiResponse<void>(res);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notifications/unread-count`, {
    method: 'GET',
  });

  return parseApiResponse<number>(res);
}

export async function deleteAllNotifications(): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/notifications`, {
    method: 'DELETE',
  });

  return parseApiResponse<void>(res);
}
