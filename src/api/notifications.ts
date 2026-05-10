import type { Notification } from '../types';
import { API_BASE_URL, authHeaders, parseApiResponse } from './config';

export async function fetchNotifications(read?: boolean): Promise<Notification[]> {
  const url = new URL(`${API_BASE_URL}/notifications`);

  if (read !== undefined) {
    url.searchParams.set('read', String(read));
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<Notification[]>(res);
}

export async function fetchUnreadNotifications(): Promise<Notification[]> {
  return fetchNotifications(false);
}

export async function markAsRead(id: string): Promise<Notification> {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseApiResponse<Notification>(res);
}

export async function markAllAsRead(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseApiResponse<void>(res);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<number>(res);
}

export async function deleteAllNotifications(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return parseApiResponse<void>(res);
}
