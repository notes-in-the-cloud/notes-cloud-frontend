import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './Auth/LogIn';
import SignUp from './Auth/SignUp';
import Notes from './Notes/Notes';
import { loadSession } from './Auth/Session';
import type { Page } from './types';

const THEME_KEY = 'darkMode';

function App() {
  // Restore the page on first render: if the user already has a session,
  // skip the login screen and go straight to notes. Using a lazy initializer
  // (function form of useState) means we read localStorage exactly once,
  // before the first render — no flicker of the login screen.
  const [page, setPage] = useState<Page>(() => loadSession() ? 'notes' : 'login');

  // Restore the theme too. Default to dark if nothing was saved before.
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === null ? true : stored === 'true';
  });

  // Persist the current theme + apply it to the document root for CSS vars.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, String(darkMode));
  }, [darkMode]);

  return (
    <>
      {page === 'login' && <LogIn onNavigate={setPage} />}
      {page === 'register' && <SignUp onNavigate={setPage} />}
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