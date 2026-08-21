import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ConfirmEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const hasConfirmed = useRef(false);

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasConfirmed.current) {
      return;
    }

    hasConfirmed.current = true;

    const confirmEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/confirm-email/${token}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Email confirmation failed');
          setStatus('error');

          return;
        }

        localStorage.setItem('accessToken', data.accessToken);

        setStatus('success');

        navigate('/profile');
      } catch {
        setError('Something went wrong');
        setStatus('error');
      }
    };

    confirmEmail();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <header className="auth-card__header">
            <p className="auth-eyebrow">
              auth.system / email confirmation
            </p>

            <h1 className="auth-title">
              Confirming email...
            </h1>

            <p className="auth-description">
              Please wait while we verify your new email address.
            </p>
          </header>

          <div className="auth-message">
            Processing confirmation token...
          </div>
        </section>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <header className="auth-card__header">
            <p className="auth-eyebrow">
              auth.system / confirmation error
            </p>

            <h1 className="auth-title">
              Email confirmation failed
            </h1>
          </header>

          <div className="auth-message auth-message--error">
            {error}
          </div>

          <div className="auth-links">
            <Link
              className="auth-link"
              to="/login"
            >
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return null;
};
