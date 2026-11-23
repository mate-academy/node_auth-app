import { useState } from 'react';
import { changePassword } from '../api/auth';
import { PASSWORD_MIN_LENGTH } from '../constans.js';

const EMPTY = { oldPassword: '', newPassword: '', confirmation: '' };

export default function ChangePasswordForm() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSuccess(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (form.newPassword !== form.confirmation) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await changePassword(form);
      setForm(EMPTY);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Change password</h2>

      <label className="field">
        Old password
        <input
          type="password"
          name="oldPassword"
          value={form.oldPassword}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
      </label>

      <label className="field">
        New password
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
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
          minLength={PASSWORD_MIN_LENGTH}
          required
        />
      </label>

      {error && <p className="form__error">{error}</p>}
      {success && <p>Password changed.</p>}

      <button className="btn btn--primary" disabled={loading}>
        {loading ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
