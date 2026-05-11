import { useState } from 'react';
import type { Page } from '../../types';
import './Auth.css';

interface Props {
  email: string;
  onNavigate: (page: Page) => void;
}

export default function EmailCodeVerify({ email, onNavigate }: Props) {
  const [code, setCode] = useState('');

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    onNavigate('login');
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <svg className="auth-brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
          <span className="auth-brand-name">Notes Cloud</span>
        </div>

        <h1 className="auth-title">Check your email</h1>
        <p className="auth-subtitle">
          We sent a verification code to<br />
          <span className="auth-email-highlight">{email}</span>
        </p>

        <form onSubmit={handleVerify}>
          <div className="auth-field">
            <input
              className="auth-input"
              type="text"
              placeholder="Paste your verification code"
              value={code}
              onChange={e => setCode(e.target.value.trim())}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <button className="auth-btn" type="submit" disabled={!code}>
            Verify
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive it?{' '}
          <button className="auth-link" type="button">Resend code</button>
        </p>
        <p className="auth-footer" style={{ marginTop: '8px' }}>
          <button className="auth-link" type="button" onClick={() => onNavigate('login')}>
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
