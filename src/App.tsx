import { useState } from 'react';
import './App.css';
import LogIn from './Auth/LogIn';
import SignUp from './Auth/SignUp';
import Notes from './Notes/Notes';
import type { Page } from './types';

function App() {
  const [page, setPage] = useState<Page>('login');

  return (
    <>
      {page === 'login' && <LogIn onNavigate={setPage} />}
      {page === 'register' && <SignUp onNavigate={setPage} />}
      {page === 'notes' && <Notes onNavigate={setPage} />}
    </>
  );
}

export default App;
