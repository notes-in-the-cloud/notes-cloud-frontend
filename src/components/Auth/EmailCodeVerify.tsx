import { useState, useRef } from 'react';
import type { Page } from '../../types';
import './Auth.css';

interface Props {
  email: string;
  onNavigate: (page: Page) => void;
}

export default function EmailCodeVerify({ email, onNavigate }: Props) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) 
      return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) 
      inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) 
      return;
    e.preventDefault();
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) 
      next[i] = pasted[i];
    setDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  //connect with backend
  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
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
          We sent a 6-digit code to<br />
          <span className="auth-email-highlight">{email}</span>
        </p>

        <form onSubmit={handleVerify}>
          <div className="auth-code-row" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                className="auth-code-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button className="auth-btn" type="submit" disabled={digits.some(d => !d)}>
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
