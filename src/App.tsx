import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './components/Auth/LogIn';
import SignUp from './components/Auth/SignUp';
import Notes from './components/Notes/Notes';
import EmailCodeVerify from './components/Auth/EmailCodeVerify';
import { loadSession } from './components/Auth/Session';
import type { Page } from './types';

const THEME_KEY = 'darkMode';

function App() {
  const [page, setPage] = useState<Page>(() => loadSession() ? 'notes' : 'login');
  const [loginEmail, setLoginEmail] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === null ? true : stored === 'true';
  });

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