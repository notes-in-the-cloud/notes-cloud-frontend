import { API_BASE_URL, authHeaders, jsonHeaders, parseApiResponse } from './config';

export interface AccessToken {
  token: string;
  tokenType?: string;
  expiresIn?: number;
  expiresAt?: string;
}

export interface TokenBundle {
  accessToken: AccessToken | string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  displayName?: string;
  name?: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<UserResponse>(res);
}

export async function login(data: LoginRequest): Promise<TokenBundle> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<TokenBundle>(res);
}

export async function logout(refreshToken: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ refreshToken }),
  });

  return parseApiResponse<void>(res);
}

export async function refresh(refreshToken: string): Promise<TokenBundle> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ refreshToken }),
  });

  return parseApiResponse<TokenBundle>(res);
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<void>(res);
}

export async function resendVerification(data: ResendVerificationRequest): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/resend`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<void>(res);
}

export async function me(): Promise<UserResponse> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<UserResponse>(res);
}

export function startGoogleLogin(): void {
  window.location.href = `${API_BASE_URL}/auth/google/start`;
}

export function startGitLabLogin(): void {
  window.location.href = `${API_BASE_URL}/auth/gitlab/start`;
}
