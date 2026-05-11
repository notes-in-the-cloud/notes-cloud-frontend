import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { LoginData, Page } from '../../types';
import { saveSession } from './Session';
import './Auth.css';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function LogIn({ onNavigate }: Props) {
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();

  //connect with backend
  function handleOAuth(_provider: 'google' | 'gitlab') {
  }

  const onSubmit = (data: LoginData) => {
    setServerError('');
    const stored = localStorage.getItem(data.email);
    if (!stored) {
      setServerError('No account found with this email.');
      return;
    }

    const userData = JSON.parse(stored);
    if (userData.password !== data.password) {
      setServerError('Incorrect password.');
      return;
    }

    saveSession({
      userId: userData.userId ?? '',
      userName: userData.name ?? '',
      email: data.email,
      accessToken: 'local-dev-token',
      refreshToken: 'local-dev-refresh',
    });

    onNavigate('notes');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <svg className="auth-brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
          <span className="auth-brand-name">Notes Cloud</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to your account</p>

        <div className="auth-oauth-group">
          <button className="auth-oauth-btn" type="button" onClick={() => handleOAuth('google')}>
            <svg className="auth-oauth-icon auth-google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button className="auth-oauth-btn" type="button" onClick={() => handleOAuth('gitlab')}>
            <svg className="auth-oauth-icon auth-gitlab-icon" viewBox="0 0 380 380" width="18" height="18">
              <path d="M189.93 350.96l53.8-165.55H136.13z"/>
              <path d="M189.93 350.96L136.13 185.41H29.44z"/>
              <path d="M29.44 185.41L8.19 248.1a14.64 14.64 0 0 0 5.32 16.37z"/>
              <path d="M29.44 185.41h106.69L89.03 48.25c-2.43-7.47-12.96-7.47-15.39 0z"/>
              <path d="M189.93 350.96l53.8-165.55h106.69z"/>
              <path d="M350.42 185.41l21.25 62.69a14.64 14.64 0 0 1-5.32 16.37z"/>
              <path d="M350.42 185.41H243.73l47.1-137.16c2.43-7.47 12.96-7.47 15.39 0z"/>
            </svg>
            Continue with GitLab
          </button>
        </div>

        <div className="auth-divider"><span>or</span></div>

        {serverError && <div className="auth-error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="email@example.com"
              {...register('email', { required: true })}
            />
            {errors.email && <span className="auth-error">Email is required.</span>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Enter password"
              {...register('password', { required: true })}
            />
            {errors.password && <span className="auth-error">Password is required.</span>}
          </div>

          <button className="auth-btn" type="submit">Log in</button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <button className="auth-link" onClick={() => onNavigate('register')}>Sign up</button>
        </p>
      </div>
    </div>
  );
}