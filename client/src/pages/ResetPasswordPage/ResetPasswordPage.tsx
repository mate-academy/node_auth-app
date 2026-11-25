import React, { useState } from 'react';
import axios from 'axios';
import { authApi } from '../../api/authApi';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AuthCard } from '../../components/AuthCard';
import { useAuth } from '../../context/AuthContext';

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const { resetToken } = useParams();
  const { user, isChecking } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  const isPasswordLong = password.length >= 6;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsSaved(false);

    if (!resetToken) {
      return;
    }
    try {
      await authApi.resetPassword(password, confirmation, resetToken);
      setIsSaved(true);
      setPassword('');
      setConfirmation('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrors(
          error.response.data.errors ?? { form: error.response.data.message },
        );
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
    return <Navigate to="/profile" replace />;
  }

  if (isSaved) {
    return (
      <AuthCard
        title="Password changed ✅"
        subtitle="You can now log in with your new password"
      >
        <p className="has-text-centered">
          <Link to="/login">Log in</Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="New password 🔑" subtitle="Choose a new password">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="password">
            New Password
          </label>
          <div className="field has-addons mb-0">
            <div className="control is-expanded">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                id="password"
                autoComplete="new-password"
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
          {isPasswordLong ? (
            <p className="help is-success">At least 6 characters</p>
          ) : (
            <p className="help">At least 6 characters</p>
          )}
        </div>

        <div className="field">
          <label className="label" htmlFor="confirmation">
            Confirmation
          </label>
          <div className="field has-addons mb-0">
            <div className="control is-expanded">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                id="confirmation"
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
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
          {errors.confirmation && (
            <p className="help is-danger">{errors.confirmation}</p>
          )}
        </div>

        {errors.form && <p className="help is-danger mb-3">{errors.form}</p>}
        <button className="button is-link is-fullwidth" type="submit">
          Save
        </button>
      </form>
    </AuthCard>
  );
};
