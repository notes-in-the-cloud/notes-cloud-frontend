import { useState, useEffect } from 'react';
import './App.css';
import LogIn from './Auth/LogIn';
import SignUp from './Auth/SignUp';
import Notes from './Notes/Notes';
import type { Page } from './types';

function App() {
  const [page, setPage] = useState<Page>('login');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
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
