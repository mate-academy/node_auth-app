import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Enter your E-Mail')
      return
    }

    if (!password.trim()) {
      setError('Enter your Password')
      return
    }

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      localStorage.setItem('accessToken', data.accessToken);

      if (onLoggedIn) {
        onLoggedIn(data.accessToken);
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div>
      <h1 className="title">Login</h1>

      <form
        className="table"
        onSubmit={onSubmit}
      >
        <input
          className="field"
          type="email"
          placeholder="E-Mail"
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

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <button className="button" type="submit">Sign in</button>
      </form>
      <p className="appeal">
        No account?
      </p>
      <Link to="/register" className="linkRegistration">Registration</Link>
      <Link to="/forgot-password">Forgot password?</Link>
    </div>
  )
}
