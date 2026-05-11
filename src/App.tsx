import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './Auth/LogIn';
import SignUp from './Auth/SignUp';
import Notes from './Notes/Notes';
import { loadSession } from './Auth/Session';
import type { Page } from './types';

const THEME_KEY = 'darkMode';

function App() {
  const [page, setPage] = useState<Page>(() => loadSession() ? 'notes' : 'login');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === null ? true : stored === 'true';
  });

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