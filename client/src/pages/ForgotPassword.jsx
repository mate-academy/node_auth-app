import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      setSent(true);
    } catch {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="container">
        <h1>Check your email</h1>
        <p>If an account with that email exists, we&apos;ve sent a reset link. Check your inbox.</p>
        <div className="links" style={{ marginTop: 20 }}>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Reset password</h1>
      <p style={{ marginBottom: 16 }}>Enter your email and we&apos;ll send you a reset link.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Send reset link</button>
      </form>

      <div className="links">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
