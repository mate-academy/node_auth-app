import './LoginPage.scss';
import React, { useContext, useState } from 'react';
import { Mail, Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    login(email, password)
      .then(() => navigate('/profile'))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to login');
      })
      .finally(() => setLoading(false))
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Шапка */}
        <div className="login-card__header">
          <div className="login-card__logo">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          <h1 className="login-card__title">Welcome back</h1>
          <p className="login-card__description">Please enter your access details.</p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Форма */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__group">
            <label className="login-form__label" htmlFor="login-email">Email</label>
            <div className="login-form__input-control">
              <Mail className="login-form__input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                className="login-form__input"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-form__group">
            <div className="login-form__label-row">
              <label className="login-form__label" htmlFor="login-pass">Password</label>
            </div>
            <div className="login-form__input-control">
              <Lock className="login-form__input-icon" size={18} />
              <input
                id="login-pass"
                type="password"
                className="login-form__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <button
                type="button"
                className="login-form__forgot-link"
                onClick={() => navigate('/forgot-pass')}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-form__submit"
            disabled={loading}
          >
            {loading ? <Loader2 className="login-form__spinner" size={20} /> : 'Login'}
          </button>
        </form>

        <footer className="login-card__footer">
          <span>Don't have an account?</span>
          <button
            className="login-card__footer-link"
            onClick={() => navigate('/registration')}
          >
            Sign Up
          </button>
        </footer>
      </div>
    </div>
  );
};