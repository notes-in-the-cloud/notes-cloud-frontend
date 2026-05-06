const BASE = '/authService/api/v1';

interface Success<T> { data: T; }
interface Error { error: { code: string; message: string }; }

export interface AccessToken {
  token: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
}

export interface TokenBundle {
  accessToken: AccessToken;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export class AuthError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = (body as Error | null)?.error;
    throw new AuthError(
      err?.code ?? 'UNKNOWN_ERROR',
      err?.message ?? `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return (body as Success<T>).data;
}

export async function register(data: { email: string; password: string; name: string }): Promise<UserResponse> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseResponse<UserResponse>(res);
}

export async function login(data: { email: string; password: string }): Promise<TokenBundle> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseResponse<TokenBundle>(res);
}

export async function logout(refreshToken: string): Promise<void> {
  const res = await fetch(`${BASE}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return parseResponse<void>(res);
}

export async function refresh(refreshToken: string): Promise<TokenBundle> {
  const res = await fetch(`${BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return parseResponse<TokenBundle>(res);
}

export async function me(accessToken: string): Promise<UserResponse> {
  const res = await fetch(`${BASE}/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return parseResponse<UserResponse>(res);
}