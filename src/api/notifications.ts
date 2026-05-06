import type { Notification } from '../types';

const BASE = 'http://localhost:8084';

function userId(): string {
  return localStorage.getItem('userId') ?? '';
}

const headers: HeadersInit = { 'Content-Type': 'application/json' };

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/api/users/${userId()}/notifications`, { headers });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function fetchUnreadNotifications(): Promise<Notification[]> {
  const res = await fetch(`${BASE}/api/users/${userId()}/notifications?read=false`, { headers });
  if (!res.ok) throw new Error('Failed to fetch unread notifications');
  return res.json();
}

export async function markAsRead(id: string): Promise<Notification> {
  const res = await fetch(`${BASE}/api/users/${userId()}/notifications/${id}/read`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function markAllAsRead(): Promise<void> {
  const res = await fetch(`${BASE}/api/users/${userId()}/notifications/read-all`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE}/api/users/${userId()}/notifications/unread-count`, { headers });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}

export async function deleteAllNotifications(): Promise<void> {
  const res = await fetch(`${BASE}/api/users/${userId()}/notifications`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete notifications');
}
