import {
  API_BASE_URL,
  jsonHeaders,
  parseApiResponse,
  fetchWithAuth,
  clearTokens,
  saveTokens,
  canAttemptRefresh,
} from './config';

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
  emailVerified: boolean;
  createdAt: string;
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
  verificationCode: string;
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

export async function login(data: LoginRequest): Promise<AccessToken> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: jsonHeaders(),
    credentials: 'include', // Include cookies - backend sets refresh_token cookie
    body: JSON.stringify(data),
  });

  // Response contains only AccessToken (refresh token is in httpOnly cookie)
  const accessToken = await parseApiResponse<AccessToken>(res);

  // Save only access token (refresh token is in httpOnly cookie)
  saveTokens(accessToken.token);

  return accessToken;
}

export async function logout(): Promise<void> {
    try {
    // Refresh token is in httpOnly cookie, sent automatically
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: jsonHeaders(),
      credentials: 'include', // Important! Sends refresh_token cookie
    });

    await parseApiResponse<void>(res);
  } finally {
    // Clear tokens regardless of logout success
    // Backend will clear the refresh_token cookie
    clearTokens();
  }
}

export async function refresh(): Promise<AccessToken> {
  if (!canAttemptRefresh()) {
    throw new Error('Token refresh is blocked until the next login');
  }

  // Refresh token is in httpOnly cookie, sent automatically
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: jsonHeaders(),
      credentials: 'include', // Important! Sends refresh_token cookie
    });

    // Response contains only AccessToken (new refresh token set in cookie)
    const accessToken = await parseApiResponse<AccessToken>(res);

    if (!accessToken.token || typeof accessToken.token !== 'string') {
      throw new Error('Invalid token response');
    }

    saveTokens(accessToken.token);

    return accessToken;
  } catch (error) {
    clearTokens();
    throw error;
  }
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
  // Use fetchWithAuth for automatic token refresh
  const res = await fetchWithAuth(`${API_BASE_URL}/me`, {
    method: 'GET',
  });

  return parseApiResponse<UserResponse>(res);
}

export function startGoogleLogin(): void {
  window.location.href = `${API_BASE_URL}/auth/google/start`;
}

export function startGitLabLogin(): void {
  window.location.href = `${API_BASE_URL}/auth/gitlab/start`;
}
