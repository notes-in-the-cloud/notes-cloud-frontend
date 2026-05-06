import type { Reminder } from '../types';

const BASE = 'http://localhost:8084';

function userId(): string {
  return localStorage.getItem('userId') ?? '';
}

function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

export async function fetchReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE}/api/users/${userId()}/reminders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

export async function fetchPendingReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE}/api/users/${userId()}/reminders?status=PENDING`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

export async function fetchCompletedReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE}/api/users/${userId()}/reminders?status=COMPLETED`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

export async function fetchReminderById(id: string): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/users/${userId()}/reminders/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reminder');
  return res.json();
}

export type CreateReminderData = Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export async function createReminder(data: CreateReminderData): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/users/${userId()}/reminders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create reminder');
  return res.json();
}

export async function updateReminder(data: Reminder): Promise<Reminder> {
  const res = await fetch(`${BASE}/api/users/${userId()}/reminders`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update reminder');
  return res.json();
}

export async function deleteReminder(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/users/${userId()}/reminders/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete reminder');
}
