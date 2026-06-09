import { clearTokens, getAccessToken as getMemoryAccessToken, saveTokens } from '../../api/config';

export interface Session {
  userId: string;
  userName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

let currentSession: Session | null = null;

export function saveSession(session: Session): void {
  currentSession = {
    ...session,
    refreshToken: '',
  };
  saveTokens(session.accessToken);
}

export function loadSession(): Session | null {
  return currentSession;
}

export function clearSession(): void {
  currentSession = null;
  clearTokens();
}

export function getCurrentUserId(): string | null {
  return currentSession?.userId ?? null;
}

export function getAccessToken(): string | null {
  return currentSession?.accessToken ?? getMemoryAccessToken();
}

export function getRefreshToken(): string | null {
  return null;
}

export function updateTokens(accessToken: string): void {
  saveTokens(accessToken);

  if (currentSession) {
    currentSession = {
      ...currentSession,
      accessToken,
      refreshToken: '',
    };
  }
}
