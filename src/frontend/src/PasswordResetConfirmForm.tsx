import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmPasswordReset, type ApiError } from './api';

function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('At least 12 characters');
  }

  if ((password.match(/\d/g) ?? []).length < 2) {
    errors.push('At least 2 numbers');
  }

  return errors;
}

function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string[] {
  if (confirmation.length === 0) {
    return ['Please confirm the new password'];
  }

  if (password !== confirmation) {
    return ['Passwords do not match'];
  }

  return [];
}

type Props = {
  token: string;
};

export function PasswordResetConfirmForm({ token }: Props) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const passwordErrors = [
    ...validatePassword(password),
    ...(serverErrors.password ? [serverErrors.password] : []),
  ];
  const confirmationErrors = [
    ...validatePasswordConfirmation(password, confirmation),
  ];
  const hasClientErrors =
    validatePassword(password).length > 0 ||
    validatePasswordConfirmation(password, confirmation).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerErrors({});
    setServerMessage(null);

    if (hasClientErrors) {
      return;
    }

    setSubmitting(true);

    try {
      await confirmPasswordReset({ token, password });
      navigate('/reset-password/success', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setServerErrors(apiError?.errors ?? {});
      setServerMessage(apiError?.message ?? 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 320,
        width: '100%',
        margin: '60px auto',
        padding: '0 16px',
      }}
    >
      <h2 style={{ margin: 0 }}>Choose a new password</h2>
      <p style={{ margin: 0, color: '#444', lineHeight: 1.5 }}>
        Create a new password for your account.
      </p>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{
          padding: 8,
          fontSize: 14,
          borderColor:
            submitted && passwordErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && passwordErrors.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, color: '#c00', fontSize: 13 }}>
          {passwordErrors.map(error => <li key={error}>{error}</li>)}
        </ul>
      )}

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmation}
        onChange={e => setConfirmation(e.target.value)}
        required
        style={{
          padding: 8,
          fontSize: 14,
          borderColor:
            submitted && confirmationErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && confirmationErrors.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, color: '#c00', fontSize: 13 }}>
          {confirmationErrors.map(error => <li key={error}>{error}</li>)}
        </ul>
      )}

      {serverMessage && (
        <p style={{ color: '#c00', margin: 0, fontSize: 13 }}>{serverMessage}</p>
      )}

      <button className="app-button" type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Reset password'}
      </button>

      <p style={{ margin: 0, fontSize: 14 }}>
        Need a new link? <Link to="/reset-password">Request another reset email</Link>
      </p>
    </form>
  );
}
