import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitHubMarkIcon } from './GitHubMarkIcon';
import {
  login,
  setAccessToken,
  startGithubAuthentication,
  type ApiError,
} from './api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string[] {
  if (!EMAIL_REGEX.test(email)) {
    return ['Invalid email address'];
  }

  return [];
}

function validatePassword(password: string): string[] {
  if (password.length === 0) {
    return ['Password is required'];
  }

  return [];
}

type LoginFormProps = {
  initialMessage?: string | null;
};

export function LoginForm({ initialMessage = null }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [githubSubmitting, setGithubSubmitting] = useState(false);
  const [serverMessageState, setServerMessageState] = useState(() => ({
    initialMessage,
    value: initialMessage,
  }));

  const emailErrors = validateEmail(email);
  const passwordErrors = validatePassword(password);
  const hasClientErrors = emailErrors.length > 0 || passwordErrors.length > 0;

  if (serverMessageState.initialMessage !== initialMessage) {
    setServerMessageState({
      initialMessage,
      value: initialMessage,
    });
  }

  const serverMessage = serverMessageState.value;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerMessageState(current => ({ ...current, value: null }));

    if (hasClientErrors) {
      return;
    }

    setSubmitting(true);

    try {
      const { accessToken } = await login({ email, password });
      setAccessToken(accessToken);
      navigate('/account', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setServerMessageState(current => ({
        ...current,
        value: apiError?.message ?? 'Could not log you in.',
      }));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGithubLogin() {
    setServerMessageState(current => ({ ...current, value: null }));
    setGithubSubmitting(true);

    try {
      const { url } = await startGithubAuthentication();
      window.location.assign(url);
    } catch (err) {
      const apiError = err as ApiError;
      setServerMessageState(current => ({
        ...current,
        value: apiError?.message ?? 'Could not start GitHub sign-in.',
      }));
      setGithubSubmitting(false);
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
      <h2 style={{ margin: 0 }}>Log in</h2>

      <button
        className="app-button"
        type="button"
        onClick={handleGithubLogin}
        disabled={submitting || githubSubmitting}
      >
        <span className="app-button__content">
          <span className="app-button__icon">
            <GitHubMarkIcon />
          </span>
          <span>
            {githubSubmitting ? 'Opening GitHub...' : 'Continue with GitHub'}
          </span>
        </span>
      </button>

      <p style={{ margin: 0, fontSize: 13, color: '#666', textAlign: 'center' }}>
        Or use your email and password
      </p>

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
          {emailErrors.map(error => <li key={error}>{error}</li>)}
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
          {passwordErrors.map(error => <li key={error}>{error}</li>)}
        </ul>
      )}

      {serverMessage && (
        <p style={{ color: '#c00', margin: 0, fontSize: 13 }}>{serverMessage}</p>
      )}

      <button className="app-button" type="submit" disabled={submitting}>
        {submitting ? 'Logging in...' : 'Log in'}
      </button>

      <p style={{ margin: 0, fontSize: 14 }}>
        <Link to="/reset-password">Forgot your password?</Link>
      </p>

      <p style={{ margin: 0, fontSize: 14 }}>
        No account yet? <Link to="/register">Create one</Link>
      </p>
    </form>
  );
}
