import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './Auth/LogIn';
import SignUp from './Auth/SignUp';
import Notes from './components/Notes/Notes';
import SharedNoteView from './components/Notes/SharedNoteView';
import { loadSession } from './Auth/Session';
import type { Page } from './types';

const THEME_KEY = 'darkMode';

function getShareToken(): string | null {
  return new URLSearchParams(window.location.search).get('share');
}

function App() {
  const [shareToken] = useState<string | null>(getShareToken);
  const [page, setPage] = useState<Page>(() => loadSession() ? 'notes' : 'login');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, String(darkMode));
  }, [darkMode]);

  if (shareToken) {
    return <SharedNoteView token={shareToken} />;
  }

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