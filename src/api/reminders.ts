import type { Reminder } from '../types';
import { API_BASE_URL, parseApiResponse, fetchWithAuth } from './config';

export type ReminderStatus = 'PENDING' | 'COMPLETED';

export type CreateReminderData = Omit<
  Reminder,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export async function fetchReminders(status?: ReminderStatus): Promise<Reminder[]> {
  const url = new URL(`${API_BASE_URL}/reminders`);

  if (status) {
    url.searchParams.set('status', status);
  }

  const res = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  return parseApiResponse<Reminder[]>(res);
}

export async function fetchPendingReminders(): Promise<Reminder[]> {
  return fetchReminders('PENDING');
}

export async function fetchCompletedReminders(): Promise<Reminder[]> {
  return fetchReminders('COMPLETED');
}

export async function fetchReminderById(reminderId: string): Promise<Reminder> {
  const res = await fetchWithAuth(`${API_BASE_URL}/reminders/${reminderId}`, {
    method: 'GET',
  });

  return parseApiResponse<Reminder>(res);
}

export async function createReminder(data: CreateReminderData): Promise<Reminder> {
  const res = await fetchWithAuth(`${API_BASE_URL}/reminders`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return parseApiResponse<Reminder>(res);
}

// Gateway supports PUT /api/v1/reminders, not PUT /api/v1/reminders/{id}
export async function updateReminder(data: Reminder): Promise<Reminder> {
  const res = await fetchWithAuth(`${API_BASE_URL}/reminders`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return parseApiResponse<Reminder>(res);
}

export async function deleteReminder(reminderId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/reminders/${reminderId}`, {
    method: 'DELETE',
  });

  return parseApiResponse<void>(res);
}
