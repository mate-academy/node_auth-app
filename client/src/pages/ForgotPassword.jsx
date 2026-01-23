import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Enter your email');
      return;
    }

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Request failed');
    }
  };

  if (done) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>If the account exists, we sent a reset link.</p>
        <Link to="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Forgot password</h1>

      <form onSubmit={onSubmit} className="table">
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <button type="submit">Send reset link</button>
      </form>

      <Link to="/login">Back to login</Link>
    </div>
  );
}
