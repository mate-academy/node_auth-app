import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { api } from './api/client.js';

const AuthContext = createContext(null);

const passwordRules = [
  'At least 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one number',
];

function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong';
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      setUser,
      reloadUser: loadUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

function Page({ title, children, aside }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <Link className="brand" to="/">
          Auth App
        </Link>
        {aside}
      </header>
      <h1>{title}</h1>
      {children}
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function Message({ type = 'info', children }) {
  if (!children) {
    return null;
  }

  return <p className={`message ${type}`}>{children}</p>;
}

function PasswordRules() {
  return (
    <ul className="rules">
      {passwordRules.map((rule) => (
        <li key={rule}>{rule}</li>
      ))}
    </ul>
  );
}

function GuestRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Page title="Loading">Checking session...</Page>;
  }

  return user ? <Navigate to="/profile" replace /> : children;
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Page title="Loading">Checking session...</Page>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function HomePage() {
  const { user } = useAuth();

  return (
    <Page title="Auth App">
      <p className="lead">
        A fullstack auth flow with activation, JWT cookies and profile settings.
      </p>
      <div className="actions">
        {user ? (
          <Link to="/profile">Open profile</Link>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </Page>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmation: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function update(field) {
    return (event) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const { data } = await api.post('/auth/register', form);
      setMessage(data.message);
      setTimeout(() => navigate('/email-sent'), 1200);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <Page title="Register" aside={<Link to="/login">Login</Link>}>
      <form onSubmit={submit} className="form">
        <Field label="Name" value={form.name} onChange={update('name')} />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={update('email')}
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={update('password')}
        />
        <Field
          label="Confirm password"
          type="password"
          value={form.confirmation}
          onChange={update('confirmation')}
        />
        <PasswordRules />
        <Message type="error">{error}</Message>
        <Message type="success">{message}</Message>
        <button type="submit">Create account</button>
      </form>
    </Page>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function update(field) {
    return (event) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user);
      navigate('/profile');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <Page title="Login" aside={<Link to="/register">Register</Link>}>
      <form onSubmit={submit} className="form">
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={update('email')}
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={update('password')}
        />
        <Message type="error">{error}</Message>
        <button type="submit">Login</button>
        <Link className="text-link" to="/forgot-password">
          Forgot password?
        </Link>
      </form>
    </Page>
  );
}

function ActivatePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('Activating account...');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/auth/activate/${token}`)
      .then(({ data }) => {
        setUser(data.user);
        setStatus('Account activated');
        navigate('/profile');
      })
      .catch((requestError) => {
        setError(getErrorMessage(requestError));
      });
  }, [token, navigate, setUser]);

  return (
    <Page title="Activation">
      <p>{status}</p>
      <Message type="error">{error}</Message>
    </Page>
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      navigate('/email-sent');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <Page title="Password reset">
      <form onSubmit={submit} className="form">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Message type="error">{error}</Message>
        <button type="submit">Send reset link</button>
      </form>
    </Page>
  );
}

function EmailSentPage() {
  return (
    <Page title="Email sent">
      <p className="lead">
        Check your inbox and follow the link from the email.
      </p>
    </Page>
  );
}

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmation: '' });
  const [error, setError] = useState('');

  function update(field) {
    return (event) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      await api.post(`/auth/reset-password/${token}`, form);
      navigate('/reset-success');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <Page title="Choose new password">
      <form onSubmit={submit} className="form">
        <Field
          label="New password"
          type="password"
          value={form.password}
          onChange={update('password')}
        />
        <Field
          label="Confirm password"
          type="password"
          value={form.confirmation}
          onChange={update('confirmation')}
        />
        <PasswordRules />
        <Message type="error">{error}</Message>
        <button type="submit">Change password</button>
      </form>
    </Page>
  );
}

function ResetSuccessPage() {
  return (
    <Page title="Password changed">
      <p className="lead">Your password was updated successfully.</p>
      <div className="actions">
        <Link to="/login">Go to login</Link>
      </div>
    </Page>
  );
}

function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    password: '',
    confirmation: '',
  });
  const [emailForm, setEmailForm] = useState({ password: '', newEmail: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
    navigate('/login');
  }

  async function updateName(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const { data } = await api.patch('/profile/name', { name });
      setUser(data.user);
      setMessage('Name updated');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const { data } = await api.patch('/profile/password', passwordForm);
      setUser(null);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 900);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function requestEmailChange(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const { data } = await api.patch('/profile/email', emailForm);
      setMessage(data.message);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  function updatePasswordField(field) {
    return (event) =>
      setPasswordForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
  }

  function updateEmailField(field) {
    return (event) =>
      setEmailForm((current) => ({ ...current, [field]: event.target.value }));
  }

  return (
    <Page title="Profile" aside={<button onClick={logout}>Logout</button>}>
      <p className="lead">{user.email}</p>
      <Message type="error">{error}</Message>
      <Message type="success">{message}</Message>

      <form onSubmit={updateName} className="form settings-section">
        <h2>Change name</h2>
        <Field
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">Save name</button>
      </form>

      <form onSubmit={updatePassword} className="form settings-section">
        <h2>Change password</h2>
        <Field
          label="Old password"
          type="password"
          value={passwordForm.oldPassword}
          onChange={updatePasswordField('oldPassword')}
        />
        <Field
          label="New password"
          type="password"
          value={passwordForm.password}
          onChange={updatePasswordField('password')}
        />
        <Field
          label="Confirm password"
          type="password"
          value={passwordForm.confirmation}
          onChange={updatePasswordField('confirmation')}
        />
        <PasswordRules />
        <button type="submit">Change password</button>
      </form>

      <form onSubmit={requestEmailChange} className="form settings-section">
        <h2>Change email</h2>
        <Field
          label="Password"
          type="password"
          value={emailForm.password}
          onChange={updateEmailField('password')}
        />
        <Field
          label="New email"
          type="email"
          value={emailForm.newEmail}
          onChange={updateEmailField('newEmail')}
        />
        <button type="submit">Send confirmation</button>
      </form>
    </Page>
  );
}

function ConfirmEmailPage() {
  const { token } = useParams();
  const [message, setMessage] = useState('Confirming email...');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/profile/email/confirm/${token}`)
      .then(({ data }) => setMessage(data.message))
      .catch((requestError) => {
        setMessage('');
        setError(getErrorMessage(requestError));
      });
  }, [token]);

  return (
    <Page title="Email confirmation">
      <Message type="success">{message}</Message>
      <Message type="error">{error}</Message>
      <div className="actions">
        <Link to="/login">Go to login</Link>
      </div>
    </Page>
  );
}

function NotFoundPage() {
  return (
    <Page title="404">
      <p className="lead">Page not found.</p>
      <div className="actions">
        <Link to="/">Go home</Link>
      </div>
    </Page>
  );
}

export function App() {
  return (
    <AuthProvider>
      <main className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/activate/:token"
            element={
              <GuestRoute>
                <ActivatePage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="/email-sent" element={<EmailSentPage />} />
          <Route
            path="/reset-password/:token"
            element={
              <GuestRoute>
                <ResetPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="/reset-success" element={<ResetSuccessPage />} />
          <Route path="/confirm-email/:token" element={<ConfirmEmailPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
