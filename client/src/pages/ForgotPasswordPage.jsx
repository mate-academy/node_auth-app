import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:3000/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset email');

        return;
      }

      navigate('/email-sent');
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
            auth.system / password recovery
          </p>

          <h1 className="auth-title">
            Forgot password
          </h1>

          <p className="auth-description">
            Enter your email and we will send you a password reset link.
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="email"
            >
              Email
            </label>

            <input
              className="auth-input"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
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
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="auth-links">
          <Link
            className="auth-link"
            to="/login"
          >
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
};
