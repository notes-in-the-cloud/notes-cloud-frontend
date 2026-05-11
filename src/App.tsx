import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './components/Auth/LogIn';
import SignUp from './components/Auth/SignUp';
import Notes from './components/Notes/Notes';
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
  const [page, setPage] = useState<Page>(() => loadSession() ? 'notes' : 'login');
  const [loginEmail, setLoginEmail] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === null ? true : stored === 'true';
  });

  // Check for OAuth redirect on mount
  useEffect(() => {
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

        // Navigate to notes
        setPage('notes');
      } catch (error) {
        console.error('Failed to parse OAuth token:', error);
      }
    }
  }, []);

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
      {page === 'login' && <LogIn onNavigate={setPage} />}
      {page === 'register' && <SignUp onNavigate={setPage} onEmailSubmit={handleEmailSubmit} />}
      {page === 'verify-email' && (
        <EmailCodeVerify email={loginEmail} onNavigate={setPage} />
      )}
      {page === 'notes' && (
        <Notes
          onNavigate={setPage}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(d => !d)}
        />
      )}
    </>
  );
}

export default App;