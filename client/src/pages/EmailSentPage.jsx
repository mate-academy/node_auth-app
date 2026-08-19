import { Link } from 'react-router-dom';

export const EmailSentPage = () => {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-eyebrow">
            auth.system / email sent
          </p>

          <h1 className="auth-title">
            Check your email
          </h1>

          <p className="auth-description">
            We sent you a password reset link.
            Follow the instructions in the email to continue.
          </p>
        </header>

        <div className="auth-message auth-message--success">
          Reset instructions have been sent.
        </div>

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
