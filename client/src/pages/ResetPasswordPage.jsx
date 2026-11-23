import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { PASSWORD_MIN_LENGTH } from '../constans.js';

export default function ResetPasswordPage() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmation) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(resetToken, form);
      navigate('/reset-success', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Reset password</h1>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          New password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <small className="field__hint">
            At least {PASSWORD_MIN_LENGTH} characters
          </small>
        </label>

        <label className="field">
          Confirmation
          <input
            type="password"
            name="confirmation"
            value={form.confirmation}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && <p className="form__error">{error}</p>}

        <button className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save password'}
        </button>
      </form>

      <p className="card__footer">
        <Link to="/forgot-password">Request a new link</Link>
      </p>
    </section>
  );
}
