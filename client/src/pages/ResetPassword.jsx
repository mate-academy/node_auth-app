import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const [fields, setFields] = useState({ password: '', confirmation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const res = await fetch(`/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(fields),
    });

    const data = await res.json();

    if (!res.ok) {
      return setError(data.error);
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="container">
        <h1>Password reset successful!</h1>
        <p>Your password has been updated.</p>
        <div className="links" style={{ marginTop: 20 }}>
          <Link to="/login" className="btn">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Set new password</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <p className="hint" style={{ marginBottom: 16 }}>
        Password rules: at least 8 characters, one uppercase letter, one lowercase letter, one digit.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New password</label>
          <input id="password" name="password" type="password" value={fields.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="confirmation">Confirm new password</label>
          <input id="confirmation" name="confirmation" type="password" value={fields.confirmation} onChange={handleChange} required />
        </div>
        <button type="submit">Reset password</button>
      </form>
    </div>
  );
}
