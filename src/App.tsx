import { useState } from 'react';
import './App.css';
import LogIn from './LogIn';
import SignUp from './SignUp';
import Notes from './Notes';
import Reminders from './Reminders';
import type { Page } from './types';

function App() {
  const [page, setPage] = useState<Page>('login');

  return (
    <>
      {page === 'login' && <LogIn onNavigate={setPage} />}
      {page === 'register' && <SignUp onNavigate={setPage} />}
      {page === 'notes' && <Notes onNavigate={setPage} />}
      {page === 'reminders' && <Reminders onNavigate={setPage} />}
    </>
  );
}

export default App;
