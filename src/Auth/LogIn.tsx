import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { LoginData, Page } from '../types';
import './Auth.css';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function LogIn({ onNavigate }: Props) {
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();

  const onSubmit = (data: LoginData) => {
    setServerError('');
    const raw = localStorage.getItem(data.email);
    const userData = raw ? JSON.parse(raw) : null;
    if (!userData || userData.password !== data.password) {
      setServerError('Email or password is incorrect.');
      return;
    }
    localStorage.setItem('userId', userData.userId ?? '');
    localStorage.setItem('userName', userData.name ?? '');
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
