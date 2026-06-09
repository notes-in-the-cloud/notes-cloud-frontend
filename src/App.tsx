import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './components/Auth/LogIn';
import SignUp from './components/Auth/SignUp';
import Notes from './components/Notes/Notes';
import SharedNoteView from './components/Notes/SharedNoteView';
import EmailCodeVerify from './components/Auth/EmailCodeVerify';
import { loadSession, saveSession } from './components/Auth/Session';
import { refresh } from './api/auth';
import { clearLegacyStoredClientData } from './api/config';
import type { Page } from './types';

// Helper to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function clearCookie(name: string): void {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

function App() {
  const sharedToken = getSharedTokenFromUrl();
  const initialSession = loadSession();
  const [page, setPage] = useState<Page>(() => loadSession() ? 'notes' : 'login');
  const [authChecking, setAuthChecking] = useState(() => !sharedToken && !initialSession);
  const [loginEmail, setLoginEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    clearLegacyStoredClientData();
  }, []);

  // Check for OAuth redirect on mount
  useEffect(() => {
    if (sharedToken) {
      return;
    }

    if (loadSession()) {
      window.setTimeout(() => setAuthChecking(false), 0);
      return;
    }

    let active = true;

    // Check for OAuth errors first
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');

    if (error) {
      // Clear error from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Display error (you might want to show this in a toast/alert)
      console.error('OAuth error:', error, errorMessage);
      alert(errorMessage || 'Authentication failed. Please try again.');
      window.setTimeout(() => {
        if (active) {
          setAuthChecking(false);
        }
      }, 0);
      return;
    }

    // Check for successful OAuth login
    const accessTokenCookie = getCookie('access_token');

    if (accessTokenCookie && !loadSession()) {
      // User just completed OAuth, extract info from token
      try {
        saveSession(createSessionFromAccessToken(accessTokenCookie));

        // Clear any success indicator from URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Navigate to notes
        window.setTimeout(() => {
          if (active) {
            setPage('notes');
            setAuthChecking(false);
          }
        }, 0);
        return;
      } catch (error) {
        console.error('Failed to parse OAuth token:', error);
      } finally {
        clearCookie('access_token');
      }
    }

    refresh()
      .then(accessToken => {
        if (!active) {
          return;
        }

        saveSession(createSessionFromAccessToken(accessToken.token));
        setPage('notes');
      })
      .catch(() => {
        if (active) {
          setPage('login');
        }
      })
      .finally(() => {
        if (active) {
          setAuthChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [sharedToken]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  function handleEmailSubmit(email: string) {
    setLoginEmail(email);
    setPage('verify-email');
  }

  return (
    <>
      {sharedToken && <SharedNoteView token={sharedToken} />}
      {!sharedToken && authChecking && (
        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-brand">
              <svg className="auth-brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
              <span className="auth-brand-name">Notes Cloud</span>
            </div>
            <p className="auth-subtitle">Restoring session...</p>
          </div>
        </div>
      )}
      {!sharedToken && !authChecking && page === 'login' && <LogIn onNavigate={setPage} />}
      {!sharedToken && !authChecking && page === 'register' && <SignUp onNavigate={setPage} onEmailSubmit={handleEmailSubmit} />}
      {!sharedToken && !authChecking && page === 'verify-email' && (
        <EmailCodeVerify email={loginEmail} onNavigate={setPage} />
      )}
      {!sharedToken && !authChecking && page === 'notes' && (
        <Notes
          onNavigate={setPage}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(d => !d)}
        />
      )}
    </>
  );
}

function createSessionFromAccessToken(accessToken: string) {
  const payload = parseJwtPayload(accessToken);

  if (!payload) {
    throw new Error('Invalid access token');
  }

  return {
    userId: payload.userId || payload.sub || '',
    userName: payload.name || payload.displayName || '',
    email: payload.email || '',
    accessToken,
    refreshToken: '',
  };
}

function parseJwtPayload(accessToken: string): Record<string, string> | null {
  try {
    const [, payload] = accessToken.split('.');

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

    return JSON.parse(atob(padded)) as Record<string, string>;
  } catch {
    return null;
  }
}

function getSharedTokenFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const queryToken = params.get('share');

  if (queryToken) {
    return queryToken;
  }

  const [, route, token] = window.location.pathname.split('/');

  if ((route === 'shared' || route === 'public') && token) {
    return decodeURIComponent(token);
  }

  return '';
}

export default App;
