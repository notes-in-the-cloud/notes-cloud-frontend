import { useEffect, useState } from 'react';
import Avatar from '../../Avatar';
import { me, type UserResponse } from '../../api/auth';
import { loadSession } from '../Auth/Session';
import './AccountSettingsModal.css';

interface Props {
  userName?: string;
  userAvatar?: string;
  onClose: () => void;
}

function formatDate(value?: string): string {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getInitialsFallback(userName?: string): string {
  return userName?.trim() || 'User';
}

export default function AccountSettingsModal({ userName, userAvatar, onClose }: Props) {
  const session = loadSession();
  const [account, setAccount] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    me()
      .then(user => {
        if (active) {
          setAccount(user);
          setError('');
        }
      })
      .catch(err => {
        console.error('Failed to load account settings:', err);
        if (active) {
          setError('Could not load the latest account details.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const displayName = account?.displayName || session?.userName || userName || 'User';
  const email = account?.email || session?.email || 'Not available';

  return (
    <div className="account-settings-backdrop" onClick={onClose}>
      <section className="account-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="account-settings-header">
          <div className="account-settings-title">
            <Avatar name={getInitialsFallback(displayName)} src={userAvatar} size={40} />
            <div>
              <h2>Account settings</h2>
              <p>Profile and sign-in details</p>
            </div>
          </div>

          <button className="account-settings-close" onClick={onClose} aria-label="Close">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="account-settings-state">Loading account details...</div>
        ) : (
          <>
            {error && <div className="account-settings-error">{error}</div>}

            <div className="account-settings-grid">
              <div className="account-settings-field">
                <span className="account-settings-label">Name</span>
                <span className="account-settings-value">{displayName}</span>
              </div>

              <div className="account-settings-field">
                <span className="account-settings-label">Email</span>
                <span className="account-settings-value">{email}</span>
                {account?.emailVerified !== undefined && (
                  <span className={`account-settings-pill${account.emailVerified ? ' account-settings-pill--ok' : ''}`}>
                    {account.emailVerified ? 'Verified' : 'Not verified'}
                  </span>
                )}
              </div>

              <div className="account-settings-field">
                <span className="account-settings-label">Password</span>
                <span className="account-settings-value account-settings-password">********</span>
                <span className="account-settings-help">
                  Hidden for security. Passwords are not exposed to the browser.
                </span>
              </div>

              <div className="account-settings-field">
                <span className="account-settings-label">User ID</span>
                <span className="account-settings-value account-settings-mono">
                  {account?.id || session?.userId || 'Not available'}
                </span>
              </div>

              <div className="account-settings-field">
                <span className="account-settings-label">Created</span>
                <span className="account-settings-value">{formatDate(account?.createdAt)}</span>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
