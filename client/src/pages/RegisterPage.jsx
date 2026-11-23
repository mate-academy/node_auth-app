import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(form);
      navigate('/check-email', { state: { email: form.email } });
    } catch (err) {
      const { email, password } = err.errors || {};

      if (email || password) {
        const parts = [];

        if (email)
          parts.push(typeof email === 'string' ? email : 'Invalid email');
        if (password) {
          parts.push(
            typeof password === 'string'
              ? password
              : 'Password must be at least 6 characters',
          );
        }

        setError(parts.join('. '));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Registration</h1>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />
        </label>

        <label className="field">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary" disabled={loading}>
          {loading ? 'Creating an account…' : 'Create an account'}
        </button>
      </form>

      <p className="card__footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
