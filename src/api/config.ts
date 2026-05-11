export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090/api/v1';

export const GATEWAY_BASE_URL =
  import.meta.env.VITE_GATEWAY_BASE_URL ?? 'http://localhost:8090';

export const WS_BASE_URL =
  import.meta.env.VITE_WS_GATEWAY_URL ?? 'ws://localhost:8090';

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

export function getAccessToken(): string | null {
  // Check direct token storage (used by Session.ts)
  const directToken =
    localStorage.getItem('accessToken') ??
    localStorage.getItem('token') ??
    localStorage.getItem('access_token');

  if (directToken) {
    return directToken;
  }

  // Check for tokenBundle structure (legacy support)
  const rawTokenBundle = localStorage.getItem('tokenBundle');

  if (!rawTokenBundle) {
    return null;
  }

  try {
    const tokenBundle = JSON.parse(rawTokenBundle);

    // Handle nested accessToken object: {accessToken: {token: "...", tokenType: "...", ...}}
    if (tokenBundle?.accessToken?.token && typeof tokenBundle.accessToken.token === 'string') {
      return tokenBundle.accessToken.token;
    }

    // Handle flat accessToken string (legacy): {accessToken: "...", refreshToken: "..."}
    if (typeof tokenBundle?.accessToken === 'string') {
      return tokenBundle.accessToken;
    }

    return null;
  } catch {
    return null;
  }
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
  // Refresh token is now in httpOnly cookie, can't be accessed from JavaScript
  // This function is kept for backward compatibility but will return null
  return localStorage.getItem('refreshToken'); // Legacy support only
}

export function saveTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem('accessToken', accessToken);
  // Don't store refresh token - it's in httpOnly cookie
  // Only store if explicitly provided (legacy support)
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken'); // Legacy cleanup
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('tokenBundle');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('email');
  // Note: httpOnly cookie will be cleared by backend on logout
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

      // Save only access token (refresh token is updated in cookie by backend)
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
