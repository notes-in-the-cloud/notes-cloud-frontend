import { useEffect, useState } from 'react';
import type { Page } from '../../types';
import { saveTokens } from '../../api/config';
import './Auth.css';

interface Props {
  onNavigate: (page: Page) => void;
  onSuccess: (userId: string, userName: string, email: string) => void;
}

export default function OAuthCallback({ onNavigate, onSuccess }: Props) {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Parse OAuth callback parameters from URL
    const params = new URLSearchParams(window.location.search);

    // Check for error first
    const errorParam = params.get('error');
    if (errorParam) {
      window.setTimeout(() => {
        setError(errorParam || 'OAuth authentication failed');
      }, 0);
      setTimeout(() => onNavigate('login'), 3000);
      return;
    }

    // OAuth providers typically redirect with tokens in URL or fragment
    // The auth service should handle the callback and redirect back with tokens

    // For now, check if tokens are in query params (backend might set them)
    const accessToken = params.get('access_token') || params.get('accessToken');
    const userId = params.get('user_id') || params.get('userId');
    const userName = params.get('user_name') || params.get('userName') || params.get('name');
    const email = params.get('email');

    if (accessToken) {
      saveTokens(accessToken);

      // Extract user info from JWT if not provided
      if (!userId || !userName || !email) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          onSuccess(
            userId || payload.userId || payload.sub || '',
            userName || payload.name || '',
            email || payload.email || ''
          );
        } catch {
          onSuccess(userId || '', userName || '', email || '');
        }
      } else {
        onSuccess(userId, userName, email);
      }

      // Navigate to notes page
      onNavigate('notes');
    } else {
      // No tokens found, might be processing or error
      window.setTimeout(() => {
        setError('Authentication in progress...');
      }, 0);
    }
  }, [onNavigate, onSuccess]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <svg className="auth-brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
          <span className="auth-brand-name">Notes Cloud</span>
        </div>

        <h1 className="auth-title">
          {error ? 'Authentication Failed' : 'Completing Sign In...'}
        </h1>

        {error ? (
          <>
            <div className="auth-error-banner">{error}</div>
            <p className="auth-subtitle" style={{ marginTop: '16px' }}>
              Redirecting to login...
            </p>
          </>
        ) : (
          <p className="auth-subtitle">
            Please wait while we complete your authentication.
          </p>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    </div>
  );
}
