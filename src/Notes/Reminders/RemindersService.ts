import type { Reminder } from '../../types';
import { getCurrentUserId } from '../../Auth/Session';

const BASE = 'http://localhost:8084';

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': getCurrentUserId() ?? '',
  };
}

export async function fetchReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE}/api/reminders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

export async function fetchPendingReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE}/api/reminders/pending`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

export async function fetchCompletedReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE}/api/reminders/completed`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

export async function fetchReminderById(id: string): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/reminders/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminder');
  return res.json();
}

export type CreateReminderData = Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export async function createReminder(data: CreateReminderData): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/reminders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create reminder');
  return res.json();
}

export async function updateReminder(data: Reminder): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/reminders`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update reminder');
  return res.json();
}

export async function deleteReminder(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/reminders/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete reminder');
}