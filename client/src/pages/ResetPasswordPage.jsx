import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (password !== confirmation) {
      setError('Passwords do not match');

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/reset-password/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password,
            confirmation,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.errors
          ? data.errors.join(', ')
          : data.message;

        setError(errorMessage || 'Failed to reset password');

        return;
      }

      navigate('/reset-success');
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-eyebrow">
            auth.system / reset password
          </p>

          <h1 className="auth-title">
            Reset password
          </h1>

          <p className="auth-description">
            Create a new password for your account.
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="password"
            >
              New password
            </label>

            <input
              className="auth-input"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="confirmation"
            >
              Confirm password
            </label>

            <input
              className="auth-input"
              id="confirmation"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>

          <div>
            <p className="auth-label">
              Password requirements
            </p>

            <ul className="auth-rules">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
            </ul>
          </div>

          {error && (
            <div className="auth-message auth-message--error">
              {error}
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </section>
    </main>
  );
};
