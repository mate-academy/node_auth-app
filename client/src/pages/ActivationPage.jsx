import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export const ActivationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const hasActivated = useRef(false);

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasActivated.current) {
      return;
    }

    hasActivated.current = true;

    const activateAccount = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/activation/${token}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Account activation failed');
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

    activateAccount();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <header className="auth-card__header">
            <p className="auth-eyebrow">
              auth.system / activation
            </p>

            <h1 className="auth-title">
              Activating account...
            </h1>

            <p className="auth-description">
              Please wait while we confirm your email address.
            </p>
          </header>

          <div className="auth-message">
            Processing activation token...
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
              auth.system / activation error
            </p>

            <h1 className="auth-title">
              Activation failed
            </h1>

            <p className="auth-description">
              We could not activate your account.
            </p>
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

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-eyebrow">
            auth.system / activation
          </p>

          <h1 className="auth-title">
            Email activated
          </h1>

          <p className="auth-description">
            Your email has been successfully confirmed.
          </p>
        </header>

        <div className="auth-message auth-message--success">
          Account activation complete.
        </div>
      </section>
    </main>
  );
};
