import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../api';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const query = useQuery();
  const token = query.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('No token in URL');
      return;
    }

    if (!password.trim() || !confirmation.trim()) {
      setError('Enter password and confirmation');
      return;
    }

    if (password !== confirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { token, password, confirmation },
      });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Reset failed');
    }
  };

  if (done) {
    return (
      <div>
        <h1>Password updated</h1>
        <Link to="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Reset password</h1>

      <form onSubmit={onSubmit} className="table">
        <input
          className="field"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="field"
          type="password"
          placeholder="Confirm new password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <button type="submit">Update password</button>
      </form>

      <Link to="/login">Back to login</Link>
    </div>
  );
}
