import { Link, useSearchParams } from 'react-router-dom';
import { PasswordResetConfirmForm } from '../PasswordResetConfirmForm';
import { useGuestOnly } from '../useGuestOnly';

export function ResetPasswordConfirmPage() {
  const isCheckingAuth = useGuestOnly();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  if (isCheckingAuth) {
    return null;
  }

  if (!token) {
    return (
      <main className="status-page">
        <p className="status-page__eyebrow">Password Reset</p>
        <h1 className="status-page__title">Invalid reset link</h1>
        <p className="status-page__text">
          This password reset link is missing or incomplete. Request a new one
          to keep going.
        </p>
        <Link className="app-button" to="/reset-password">
          Request a new link
        </Link>
      </main>
    );
  }

  return <PasswordResetConfirmForm token={token} />;
}
