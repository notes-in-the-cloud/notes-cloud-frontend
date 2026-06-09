import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { SignUpData, Page } from '../../types';
import { registerUser } from '../../api/auth';
import { ApiError } from '../../api/config';
import './Auth.css';

interface Props {
  onNavigate: (page: Page) => void;
  onEmailSubmit: (email: string) => void;
}

export default function SignUp({ onNavigate, onEmailSubmit }: Props) {
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit } = useForm<SignUpData>();

  const onSubmit = async (data: SignUpData) => {
    setServerError('');

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      // Registration successful, navigate to email verification
      onEmailSubmit(data.email);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'EMAIL_ALREADY_EXISTS') {
          setServerError('An account with this email already exists.');
        } else if (error.code === 'INVALID_PASSWORD_LENGTH') {
          setServerError('Password must be at least 8 characters long.');
        } else if (error.code === 'VALIDATION_FAILED') {
          setServerError('Please check your input and try again.');
        } else {
          setServerError(error.message || 'Registration failed. Please try again.');
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
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
              {...register('name')}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="text"
              placeholder="email@example.com"
              {...register('email')}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
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
