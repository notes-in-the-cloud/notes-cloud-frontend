// Centralised access to the user session stored in localStorage.
// All reads/writes of the session keys go through this module so we
// have a single place to change keys, add fields, or migrate later.

const USER_ID_KEY   = 'userId';
const USER_NAME_KEY = 'userName';

export interface Session {
  userId: string;
  userName: string;
}

// Persist the session after a successful login.
export function saveSession(session: Session): void {
  localStorage.setItem(USER_ID_KEY, session.userId);
  localStorage.setItem(USER_NAME_KEY, session.userName);
}

// Read the current session, if any. Returns null when not logged in.
export function loadSession(): Session | null {
  const userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) return null;
  const userName = localStorage.getItem(USER_NAME_KEY) ?? '';
  return { userId, userName };
}

// Clear the session on logout.
export function clearSession(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}

// Convenience: just the current user's id, or null.
export function getCurrentUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}