type RuntimeConfig = {
  API_BASE_URL?: string;
  GATEWAY_BASE_URL?: string;
  WS_REMINDERS_URL?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

export const API_BASE_URL =
  window.__APP_CONFIG__?.API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:8090/api/v1';

export const GATEWAY_BASE_URL =
  window.__APP_CONFIG__?.GATEWAY_BASE_URL ??
  import.meta.env.VITE_GATEWAY_BASE_URL ??
  'http://localhost:8090';

export const WS_BASE_URL =
  window.__APP_CONFIG__?.WS_REMINDERS_URL?.replace(/\/ws$/, '') ??
  import.meta.env.VITE_WS_GATEWAY_URL ??
  'ws://localhost:8090';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

let memoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

export function jsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();

  if (!token) {
    return jsonHeaders();
  }

  return {
    ...jsonHeaders(),
    Authorization: `Bearer ${token}`,
  };
}

export function getRefreshToken(): string | null {
  return null;
}

export function saveTokens(accessToken: string): void {
  memoryAccessToken = accessToken;
}

export function clearTokens(): void {
  memoryAccessToken = null;
  clearLegacyStoredClientData();
}

export function clearLegacyStoredClientData(): void {
  // Remove legacy persisted auth data from older builds.
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('tokenBundle');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('email');
  localStorage.removeItem('darkMode');
}

// Track if we're currently refreshing to avoid multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // If already refreshing, wait for that promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      // Refresh token is in httpOnly cookie, sent automatically by browser
      // No need to send it in request body
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: jsonHeaders(),
        credentials: 'include', // Important! Sends cookies with request
      });

      if (!res.ok) {
        // If refresh fails, clear tokens and redirect to login
        clearTokens();
        window.location.href = '/'; // Redirect to login page
        throw new Error('Token refresh failed');
      }

      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      const data = body?.data || body;

      // Extract new access token (data IS the AccessToken object now)
      const newAccessToken = data.token || data;

      if (!newAccessToken || typeof newAccessToken !== 'string') {
        throw new Error('Invalid token response');
      }

      // Keep access token in memory only. Refresh token stays in httpOnly cookie.
      saveTokens(newAccessToken);

      return newAccessToken;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function parseApiResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const error = body?.error;

    throw new ApiError(
      error?.code ?? 'REQUEST_FAILED',
      error?.message ?? body?.message ?? `Request failed with status ${res.status}`,
      res.status
    );
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }

  return body as T;
}

/**
 * Enhanced fetch wrapper that automatically handles token refresh on 401 responses
 * and includes credentials (cookies) in requests
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Add auth headers if not already present
  const headers = new Headers(options.headers);

  if (!headers.has('Authorization')) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Make the initial request with credentials to send cookies
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Important! Sends cookies (refresh_token)
  });

  // If unauthorized and we have a refresh token cookie, try to refresh
  if (response.status === 401) {
    // Only attempt refresh if this isn't already a refresh request
    if (!url.includes('/auth/refresh')) {
      try {
        // Get new access token (refresh token sent automatically in cookie)
        const newAccessToken = await refreshAccessToken();

        // Retry the original request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include'
        });
      } catch (error) {
        // Refresh failed, return the original 401 response
        console.error('Token refresh failed:', error);
      }
    }
  }

  return response;
}
