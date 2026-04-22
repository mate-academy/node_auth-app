import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset, type ApiError } from './api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string[] {
  if (!EMAIL_REGEX.test(email.trim())) {
    return ['Invalid email address'];
  }

  return [];
}

export function PasswordResetRequestForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const emailErrors = [
    ...validateEmail(email),
    ...(serverErrors.email ? [serverErrors.email] : []),
  ];
  const hasClientErrors = validateEmail(email).length > 0;

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
      const normalizedEmail = email.trim();
      await requestPasswordReset({ email: normalizedEmail });
      navigate('/reset-password/sent', {
        replace: true,
        state: { email: normalizedEmail },
      });
    } catch (err) {
      const apiError = err as ApiError;
      setServerErrors(apiError?.errors ?? {});
      setServerMessage(apiError?.message ?? 'Could not send reset email.');
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
      <h2 style={{ margin: 0 }}>Reset password</h2>
      <p style={{ margin: 0, color: '#444', lineHeight: 1.5 }}>
        Enter the email address for your account and we send you a link
        to choose a new password.
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{
          padding: 8,
          fontSize: 14,
          borderColor:
            submitted && emailErrors.length > 0 ? '#c00' : undefined,
        }}
      />

      {submitted && emailErrors.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, color: '#c00', fontSize: 13 }}>
          {emailErrors.map(error => <li key={error}>{error}</li>)}
        </ul>
      )}

      {serverMessage && Object.keys(serverErrors).length === 0 && (
        <p style={{ color: '#c00', margin: 0, fontSize: 13 }}>{serverMessage}</p>
      )}

      <button className="app-button" type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send reset link'}
      </button>

      <p style={{ margin: 0, fontSize: 14 }}>
        Remembered it? <Link to="/login">Back to login</Link>
      </p>
    </form>
  );
}
