import HeaderBar from './HeaderBar';
import type { Page } from './types';
import './Reminders.css';

export default function Reminders({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="reminders-layout">
      <HeaderBar onLogOut={() => onNavigate('login')} />
      <main className="reminders-main">
        <div className="reminders-container">
          <div className="reminders-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <h1 className="reminders-title">Reminders</h1>
          </div>
          <div className="reminders-content">
          </div>
        </div>
      </main>
    </div>
  );
}
