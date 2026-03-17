import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirmation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;

    setFields((prev) => ({ ...prev, [name]: value }));

    if (name === 'password' || name === 'confirmation') {
      setError('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(fields),
    });

    const data = await res.json();

    if (!res.ok) {
      return setError(data.error);
    }

    setSuccess(data.message);
    setTimeout(() => navigate('/login'), 2000);
  }

  return (
    <div className="container">
      <h1>Create an account</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <p className="hint" style={{ marginBottom: 16 }}>
        Password rules: at least 8 characters, one uppercase letter, one lowercase letter, one digit.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" value={fields.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={fields.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={fields.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="confirmation">Confirm password</label>
          <input id="confirmation" name="confirmation" type="password" value={fields.confirmation} onChange={handleChange} required />
        </div>
        <button type="submit">Register</button>
      </form>

      <div className="links">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
