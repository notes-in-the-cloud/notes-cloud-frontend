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
  const directToken =
    localStorage.getItem('accessToken') ??
    localStorage.getItem('token') ??
    localStorage.getItem('access_token');

  if (directToken) {
    return directToken;
  }

  const rawTokenBundle = localStorage.getItem('tokenBundle');

  if (!rawTokenBundle) {
    return null;
  }

  try {
    const tokenBundle = JSON.parse(rawTokenBundle);

    if (typeof tokenBundle?.accessToken === 'string') {
      return tokenBundle.accessToken;
    }

    if (typeof tokenBundle?.accessToken?.token === 'string') {
      return tokenBundle.accessToken.token;
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
