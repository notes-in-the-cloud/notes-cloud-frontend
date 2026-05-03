import type { Notification } from '../types';

const BASE = 'http://localhost:8084/api/notifications';

function headers(userId: string) {
  return { 'X-User-Id': userId };
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const res = await fetch(BASE, { headers: headers(userId) });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function fetchUnreadNotifications(userId: string): Promise<Notification[]> {
  const res = await fetch(`${BASE}/unread`, { headers: headers(userId) });
  if (!res.ok) throw new Error('Failed to fetch unread notifications');
  return res.json();
}

export async function markAsRead(userId: string, id: string): Promise<Notification> {
  const res = await fetch(`${BASE}/${id}/read`, {
    method: 'POST',
    headers: headers(userId),
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function markAllAsRead(userId: string): Promise<void> {
  const res = await fetch(`${BASE}/read-all`, {
    method: 'POST',
    headers: headers(userId),
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const res = await fetch(`${BASE}/unread/count`, { headers: headers(userId) });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}
