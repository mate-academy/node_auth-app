import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPasswordErrors } from '../utils/password.js';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const passwordErrors = getPasswordErrors(password);

if (passwordErrors.length) {
  setError(passwordErrors.join(', '));

  return;
}

    try {
      const response = await fetch(
        'http://localhost:3000/registration',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.errors
          ? data.errors.join(', ')
          : data.message;

        setError(errorMessage);

        return;
      }

      setSuccess(data.message);

      setName('');
      setEmail('');
      setPassword('');
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-card__header">
          <p className="auth-eyebrow">
            auth.system / register
          </p>

          <h1 className="auth-title">
            Create account
          </h1>

          <p className="auth-description">
            Register with your name, email and password.
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="name"
            >
              Name
            </label>

            <input
              className="auth-input"
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

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

          <div>
            <p className="auth-label">
              Password requirements
            </p>

            <ul className="auth-rules">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
            </ul>
          </div>

          {error && (
            <div className="auth-message auth-message--error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message auth-message--success">
              {success}
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
          >
            Create account
          </button>
        </form>

        <div className="auth-links">
          <Link
            className="auth-link"
            to="/login"
          >
            Already have an account?
          </Link>
        </div>
      </section>
    </main>
  );
};
