import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');

        return;
      }

      localStorage.setItem('accessToken', data.accessToken);

      navigate('/profile');
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-eyebrow">
            auth.system / login
          </p>

          <h1 className="auth-title">
            Login
          </h1>

          <p className="auth-description">
            Enter your credentials to access your account.
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="email"
            >
              Email
            </label>

            <input
              className="auth-input"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="password"
            >
              Password
            </label>

            <input
              className="auth-input"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <div className="auth-message auth-message--error">
              {error}
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
          >
            Login
          </button>
        </form>

        <div className="auth-links">
          <Link
            className="auth-link"
            to="/forgot-password"
          >
            Forgot password?
          </Link>

          <Link
            className="auth-link"
            to="/register"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
};
