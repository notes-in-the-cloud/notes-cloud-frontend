import { useState } from 'react';
import type { Page } from '../../types';
import { verifyEmail, resendVerification } from '../../api/auth';
import { ApiError } from '../../api/config';
import './Auth.css';

interface Props {
  email: string;
  onNavigate: (page: Page) => void;
}

export default function EmailCodeVerify({ email, onNavigate }: Props) {
  const [verificationCode, setVerificationCode] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    try {
      await verifyEmail({ verificationCode: verificationCode.trim() });
      setSuccessMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => onNavigate('login'), 2000);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_VERIFICATION_CODE') {
          setServerError('Invalid or expired verification code.');
        } else {
          setServerError(error.message || 'Verification failed. Please try again.');
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  }

  async function handleResend() {
    setServerError('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      await resendVerification({ email });
      setSuccessMessage('A new verification code has been sent to your email.');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message || 'Failed to resend code. Please try again.');
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
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

        {serverError && <div className="auth-error-banner">{serverError}</div>}
        {successMessage && <div className="auth-success-banner" style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#d1fae5',
          color: '#065f46',
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center'
        }}>{successMessage}</div>}

        <form onSubmit={handleVerify}>
          <div className="auth-field">
            <label className="auth-label">Verification Code</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Paste your verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              autoFocus
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <button className="auth-btn" type="submit">
            Verify
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive it?{' '}
          <button
            className="auth-link"
            type="button"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend code'}
          </button>
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
