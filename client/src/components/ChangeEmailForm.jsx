import { useState } from 'react';
import { requestEmailChange } from '../api/auth';

export default function ChangeEmailForm() {
  const [form, setForm] = useState({ password: '', newEmail: '' });
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSentTo('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSentTo('');
    setLoading(true);

    try {
      await requestEmailChange(form);
      setSentTo(form.newEmail);
      setForm({ password: '', newEmail: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Change email</h2>

      <label className="field">
        New email
        <input
          type="email"
          name="newEmail"
          value={form.newEmail}
          onChange={handleChange}
          autoComplete="email"
          required
        />
      </label>

      <label className="field">
        Current password
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
      </label>

      {error && <p className="form__error">{error}</p>}
      {sentTo && (
        <p>
          We sent a confirmation link to <strong>{sentTo}</strong>. Your email
          will change after you open it.
        </p>
      )}

      <button className="btn btn--primary" disabled={loading}>
        {loading ? 'Sending…' : 'Change email'}
      </button>
    </form>
  );
}
