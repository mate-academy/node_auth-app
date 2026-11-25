import type React from 'react';
import { AuthCard } from '../../components/AuthCard';
import axios from 'axios';
import { useState } from 'react';
import { authApi } from '../../api/authApi';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { accessTokenService } from '../../api/accessToken';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showPassword, setShowPassword] = useState(false);

  const { user, isChecking, setUser } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    try {
      const { data } = await authApi.login(email, password);
      accessTokenService.save(data.accessToken);
      setUser(data.user);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { message } = error.response.data;
        setErrors({ form: message });
      } else {
        setErrors({ form: 'Server is not responding' });
      }
    }
  };

  if (isChecking) {
    return (
      <AuthCard title="Loading... 🛰️">
        <div className="has-text-centered">
          <span
            className="button is-loading is-ghost is-large"
            aria-label="Loading"
          />
        </div>
      </AuthCard>
    );
  }
  if (user) {
    return <Navigate to={'/profile'} replace />;
  }

  return (
    <AuthCard title="Login" subtitle="Welcome back">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="control">
            <input
              className="input"
              type="email"
              placeholder="Email"
              id="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {errors.email && <p className="help is-danger">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="field has-addons mb-0">
            <div className="control is-expanded">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="control">
              <button
                type="button"
                className="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🌝' : '🌚'}
              </button>
            </div>
          </div>
          {errors.password && (
            <p className="help is-danger">{errors.password}</p>
          )}

          <p className="has-text-right is-size-7 mt-1">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>

        {errors.form && <p className="help is-danger mb-3">{errors.form}</p>}

        <button className="button is-link is-fullwidth" type="submit">
          Log in
        </button>
      </form>
      <p className="has-text-centered mt-4">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </AuthCard>
  );
};
