import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { API_URL } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage('If this email exists, a password reset link has been sent.');
    } else {
      const data = await res.json();
      setError(data.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '40px auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2>Reset Password</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Enter your email address and we will send you instructions to reset your
        password.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        {message && (
          <p style={{ color: 'green', fontSize: '14px' }}>{message}</p>
        )}
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Send Instructions
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          Back to Login
        </Link>
      </p>
    </div>
  );
};
