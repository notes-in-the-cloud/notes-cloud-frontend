import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './components/Auth/LogIn';
import SignUp from './components/Auth/SignUp';
import Notes from './components/Notes/Notes';
import SharedNoteView from './components/Notes/SharedNoteView';
import EmailCodeVerify from './components/Auth/EmailCodeVerify';
import { loadSession, saveSession } from './components/Auth/Session';
import type { Page } from './types';

const THEME_KEY = 'darkMode';

// Helper to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function App() {
  const sharedToken = getSharedTokenFromUrl();
  const [page, setPage] = useState<Page>(() => loadSession() ? 'notes' : 'login');
  const [loginEmail, setLoginEmail] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === null ? true : stored === 'true';
  });

  // Check for OAuth redirect on mount
  useEffect(() => {
    if (sharedToken) {
      return;
    }

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
      return;
    }

    // Check for successful OAuth login
    const accessTokenCookie = getCookie('access_token');

    if (accessTokenCookie && !loadSession()) {
      // User just completed OAuth, extract info from token
      try {
        const payload = JSON.parse(atob(accessTokenCookie.split('.')[1]));

        // Save session
        saveSession({
          userId: payload.userId || payload.sub || '',
          userName: payload.name || '',
          email: payload.email || '',
          accessToken: accessTokenCookie,
          refreshToken: '', // In httpOnly cookie
        });

        // Clear any success indicator from URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Navigate to notes
        window.setTimeout(() => setPage('notes'), 0);
      } catch (error) {
        console.error('Failed to parse OAuth token:', error);
      }
    }
  }, [sharedToken]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, String(darkMode));
  }, [darkMode]);

  function handleEmailSubmit(email: string) {
    setLoginEmail(email);
    setPage('verify-email');
  }

  return (
    <>
      {sharedToken && <SharedNoteView token={sharedToken} />}
      {!sharedToken && page === 'login' && <LogIn onNavigate={setPage} />}
      {!sharedToken && page === 'register' && <SignUp onNavigate={setPage} onEmailSubmit={handleEmailSubmit} />}
      {!sharedToken && page === 'verify-email' && (
        <EmailCodeVerify email={loginEmail} onNavigate={setPage} />
      )}
      {!sharedToken && page === 'notes' && (
        <Notes
          onNavigate={setPage}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(d => !d)}
        />
      )}
    </>
  );
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
