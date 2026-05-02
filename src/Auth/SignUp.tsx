import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { SignUpData, Page } from '../types';
import './Auth.css';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function SignUp({ onNavigate }: Props) {
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpData>();


  //using local storage for testing 
  const onSubmit = (data: SignUpData) => {
    setServerError('');
    if (localStorage.getItem(data.email)) {
      setServerError('An account with this email already exists.');
      return;
    }
    const userId = crypto.randomUUID();
    localStorage.setItem(data.email, JSON.stringify({ name: data.name, password: data.password, userId }));
    onNavigate('login');
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

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Start organising your notes</p>

        {serverError && <div className="auth-error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-field">
            <label className="auth-label">Name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Your name"
              {...register('name', { required: true })}
            />
            {errors.name && <span className="auth-error">Name is required.</span>}
          </div>

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
              placeholder="••••••••"
              {...register('password', { required: true, minLength: 6 })}
            />
            {errors.password?.type === 'required' && <span className="auth-error">Password is required.</span>}
            {errors.password?.type === 'minLength' && <span className="auth-error">Password must be at least 6 characters.</span>}
          </div>

          <button className="auth-btn" type="submit">Create account</button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <button className="auth-link" onClick={() => onNavigate('login')}>Log in</button>
        </p>
      </div>
    </div>
  );
}
