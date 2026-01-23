import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Fill in name, email, password');
      return;
    }

    if (password !== confirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Register failed');
    }
  };

  if (done) {
    return (
      <div>
        <h1 className="title">Check your email</h1>
        <p>We sent you an activation link.</p>
        <Link to="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title">Register</h1>

      <form onSubmit={onSubmit} className="table">
        <input
          className="field"
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <p className="hint">
          Password rules: at least 8 characters,
          use uppercase and lowercase letters and numbers.
        </p>

        <input
          className="field"
          type="password"
          placeholder="Confirm password"
          value={confirmation}
          onChange={e => setConfirmation(e.target.value)}
        />

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <button type="submit">Create account</button>
      </form>

      <div className="question">Have an account?</div>
      <Link to="/login" className="link">Login</Link>
    </div>
  );
}
