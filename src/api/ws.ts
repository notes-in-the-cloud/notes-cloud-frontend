import { getAccessToken, WS_BASE_URL } from './config';

export function createReminderSocket(): WebSocket {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Missing access token');
  }

  return new WebSocket(
    `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`
  );
}
