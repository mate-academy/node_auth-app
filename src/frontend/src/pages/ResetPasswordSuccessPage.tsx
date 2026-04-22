import { Link } from 'react-router-dom';
import { useGuestOnly } from '../useGuestOnly';

export function ResetPasswordSuccessPage() {
  const isCheckingAuth = useGuestOnly();

  if (isCheckingAuth) {
    return null;
  }

  return (
    <main className="status-page">
      <p className="status-page__eyebrow">Password Reset</p>
      <h1 className="status-page__title">Password updated</h1>
      <p className="status-page__text">
        Your password has been reset successfully. You can now sign in with
        your new password.
      </p>
      <Link className="app-button" to="/login">
        Go to login
      </Link>
    </main>
  );
}
