import { Link } from 'react-router-dom';

export const ResetSuccessPage = () => {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-eyebrow">
            auth.system / success
          </p>

          <h1 className="auth-title">
            Password changed
          </h1>

          <p className="auth-description">
            Your password has been successfully updated.
          </p>
        </header>

        <div className="auth-message auth-message--success">
          You can now log in using your new password.
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
};
