import { Link, useLocation } from 'react-router-dom';
import { useGuestOnly } from '../useGuestOnly';

type LocationState = {
  email?: string;
};

export function ResetPasswordEmailSentPage() {
  const isCheckingAuth = useGuestOnly();
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;

  if (isCheckingAuth) {
    return null;
  }

  return (
    <main className="status-page">
      <p className="status-page__eyebrow">Password Reset</p>
      <h1 className="status-page__title">Check your email</h1>
      <p className="status-page__text">
        {email ? (
          <>
            We sent a password reset link to <strong>{email}</strong>. Open the
            email and follow the link to choose a new password.
          </>
        ) : (
          'If an account exists for that email, we sent a password reset link. Open the email and follow the link to choose a new password.'
        )}
      </p>
      <Link className="app-button" to="/login">
        Back to login
      </Link>
    </main>
  );
}
