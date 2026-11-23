import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/profile', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Log in</h1>

      <form className="form" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            required
          />
        </label>
        <Link to="/forgot-password">Forgot password?</Link>

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary" disabled={loading}>
          {loading ? "Let's go in..." : 'Log in'}
        </button>
      </form>

      <p className="card__footer">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
