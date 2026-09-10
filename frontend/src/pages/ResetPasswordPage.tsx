import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { AxiosError } from 'axios';

export const ResetPasswordPage = () => {
  const { resetToken } = useParams<{ resetToken: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('The password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!resetToken) {
      setError('Reset token is missing.');
      return;
    }

    setIsLoading(true);
    setError('');

    authService
      .confirmPasswordReset(resetToken, password)
      .then(() => {
        setIsSuccess(true);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
  setError(err.response?.data?.message ?? 'Invalid or outdated link');
})
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isSuccess) {
    return (
      <div className="container tab-content">
        <div className="box has-text-centered">
          <h1 className="title has-text-success">Password successfully changed!</h1>
          <p className="notification is-success is-light mb-4">
           You can now log in to the system with your new password.
          </p>
          <Link to="/login" className="button is-success">
           Log in to your account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container tab-content">
      <form onSubmit={handleSubmit} className="box">
        <h1 className="title">New password</h1>

        <div className="field">
          <label className="label">New password</label>
          <div className="control">
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*******"
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Confirm password</label>
          <div className="control">
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="*******"
              required
            />
          </div>
        </div>

        {error && <p className="notification is-danger is-light">{error}</p>}

        <button
          type="submit"
          className={`button is-primary ${isLoading ? 'is-loading' : ''}`}
        >
          Save new password
        </button>
      </form>
    </div>
  );
};