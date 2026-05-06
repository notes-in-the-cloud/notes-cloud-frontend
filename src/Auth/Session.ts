const USER_ID_KEY = 'userId';
const USER_NAME_KEY = 'userName';
const EMAIL_KEY = 'email';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface Session {
  userId: string;
  userName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export function saveSession(session: Session): void {
  localStorage.setItem(USER_ID_KEY, session.userId);
  localStorage.setItem(USER_NAME_KEY, session.userName);
  localStorage.setItem(EMAIL_KEY,session.email);
  localStorage.setItem(ACCESS_TOKEN_KEY,session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

export function loadSession(): Session | null {
  const userId = localStorage.getItem(USER_ID_KEY);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!userId || !accessToken || !refreshToken) return null;
  return {
    userId,
    userName: localStorage.getItem(USER_NAME_KEY) ?? '',
    email:localStorage.getItem(EMAIL_KEY)     ?? '',
    accessToken,
    refreshToken,
  };
}

export function clearSession(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function updateTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY,  accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}