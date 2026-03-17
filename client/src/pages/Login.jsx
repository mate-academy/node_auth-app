import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fields, setFields] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(fields),
    });

    const data = await res.json();

    if (!res.ok) {
      return setError(data.error);
    }

    login(data.user);
    navigate('/profile');
  }

  return (
    <div className="container">
      <h1>Log in</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={fields.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={fields.password} onChange={handleChange} required />
        </div>
        <button type="submit">Log in</button>
      </form>

      <div className="links">
        <Link to="/forgot-password">Forgot password?</Link> &middot;{' '}
        <Link to="/register">Create an account</Link>
      </div>
    </div>
  );
}
