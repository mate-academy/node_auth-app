import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await authApi.login(email, password);

      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Невірний email або пароль');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 30%, #4a6a4a 60%, #6b8f6b 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', top: '-100px', left: '-100px',
        background: 'radial-gradient(circle, rgba(80,120,80,0.4) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', bottom: '-150px', right: '-100px',
        background: 'radial-gradient(circle, rgba(40,80,40,0.5) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1,
      }}>
        <h1 style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: 300,
          textAlign: 'center',
          marginBottom: 32,
          letterSpacing: 2,
        }}>
          Login
        </h1>

        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.15)',
            border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            color: '#ff9999',
            fontSize: 13,
            marginBottom: 16,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 44px 14px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>✉</span>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 44px 14px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>🔒</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textDecoration: 'none' }}>
              Forgot Password
            </Link>
          </div>

          <button
            type="submit"
            style={{
              padding: '14px',
              background: 'rgba(255,255,255,0.9)',
              color: '#2d4a2d',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: 1,
              transition: 'background 0.2s',
            }}
          >
            Login
          </button>

          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>або</div>

          <a
            href="http://localhost:3005/auth/google"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            <img src="https://www.google.com/favicon.ico" style={{ width: 16, height: 16 }} />
            Continue with Google
          </a>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
