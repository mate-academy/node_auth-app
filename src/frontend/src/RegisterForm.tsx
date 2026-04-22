import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GitHubMarkIcon } from './GitHubMarkIcon';
import {
  register,
  startGithubAuthentication,
  type ApiError,
} from './api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name: string): string[] {
  if (name.trim().length === 0) {
    return ['Name is required'];
  }

  return [];
}

function validateEmail(email: string): string[] {
  if (!EMAIL_REGEX.test(email)) {
    return ['Invalid email address'];
  }

  return [];
}

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

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [githubSubmitting, setGithubSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nameErrors = [...validateName(name), ...(serverErrors.name ? [serverErrors.name] : [])];
  const emailErrors = [...validateEmail(email), ...(serverErrors.email ? [serverErrors.email] : [])];
  const passwordErrors = [...validatePassword(password), ...(serverErrors.password ? [serverErrors.password] : [])];
  const hasClientErrors =
    validateName(name).length > 0 ||
    validateEmail(email).length > 0 ||
    validatePassword(password).length > 0;

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
      await register({ name, email, password });
      setSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setServerErrors(apiError?.errors ?? {});
      setServerMessage(apiError?.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGithubSignup() {
    setServerErrors({});
    setServerMessage(null);
    setGithubSubmitting(true);

    try {
      const { url } = await startGithubAuthentication();
      window.location.assign(url);
    } catch (err) {
      const apiError = err as ApiError;
      setServerMessage(
        apiError?.message ?? 'Could not start GitHub sign-up.',
      );
      setGithubSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <h2>Check your email</h2>
        <p>We sent an activation link to <strong>{email}</strong>. Follow it to activate your account.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, width: '100%', margin: '60px auto', padding: '0 16px' }}>
      <h2 style={{ margin: 0 }}>Create account</h2>

      <button
        className="app-button"
        type="button"
        onClick={handleGithubSignup}
        disabled={submitting || githubSubmitting}
      >
        <span className="app-button__content">
          <span className="app-button__icon">
            <GitHubMarkIcon />
          </span>
          <span>
            {githubSubmitting ? 'Opening GitHub...' : 'Sign up with GitHub'}
          </span>
        </span>
      </button>

      <p style={{ margin: 0, fontSize: 13, color: '#666', textAlign: 'center' }}>
        Or create an account with email and password
      </p>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        style={{ padding: 8, fontSize: 14, borderColor: submitted && nameErrors.length > 0 ? '#c00' : undefined }}
      />

      {submitted && nameErrors.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, color: '#c00', fontSize: 13 }}>
          {nameErrors.map(err => <li key={err}>{err}</li>)}
        </ul>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ padding: 8, fontSize: 14, borderColor: submitted && emailErrors.length > 0 ? '#c00' : undefined }}
      />

      {submitted && emailErrors.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, color: '#c00', fontSize: 13 }}>
          {emailErrors.map(err => <li key={err}>{err}</li>)}
        </ul>
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ padding: 8, fontSize: 14, borderColor: submitted && passwordErrors.length > 0 ? '#c00' : undefined }}
      />

      {submitted && passwordErrors.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, color: '#c00', fontSize: 13 }}>
          {passwordErrors.map(err => <li key={err}>{err}</li>)}
        </ul>
      )}

      {serverMessage && Object.keys(serverErrors).length === 0 && (
        <p style={{ color: '#c00', margin: 0, fontSize: 13 }}>{serverMessage}</p>
      )}

      <button className="app-button" type="submit" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Sign Up'}
      </button>

      <p style={{ margin: 0, fontSize: 14 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
