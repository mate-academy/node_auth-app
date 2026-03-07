import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getStrength();
  const labels = ['', 'Слабкий', 'Середній', 'Добрий', 'Сильний'];
  const colors = ['', '#ff4444', '#ffaa00', '#88cc00', '#44cc44'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <p style={{ color: colors[strength], fontSize: 11, marginTop: 4 }}>{labels[strength]}</p>
    </div>
  );
};

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.register(name, email, password);
      navigate('/check-email');
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка реєстрації');
    }
  };

  const glassInput = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 30%, #4a6a4a 60%, #6b8f6b 100%)',
      fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: '-100px', left: '-100px', background: 'radial-gradient(circle, rgba(80,120,80,0.4) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', bottom: '-150px', right: '-100px', background: 'radial-gradient(circle, rgba(40,80,40,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div style={{
        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, padding: '48px 40px',
        width: '100%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1,
      }}>
        <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 300, textAlign: 'center', marginBottom: 32, letterSpacing: 2 }}>Register</h1>

        {error && (
          <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 10, padding: '10px 14px', color: '#ff9999', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="text" placeholder="Ім'я" value={name} onChange={e => setName(e.target.value)} style={glassInput} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={glassInput} />
          <div>
            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} style={glassInput} />
            <PasswordStrength password={password} />
          </div>

          <button type="submit" style={{ padding: '14px', background: 'rgba(255,255,255,0.9)', color: '#2d4a2d', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>
            Зареєструватись
          </button>

          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>або</div>

          <a href="http://localhost:3005/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 14, textDecoration: 'none' }}>
            <img src="https://www.google.com/favicon.ico" style={{ width: 16, height: 16 }} />
            Continue with Google
          </a>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
            Вже є акаунт?{' '}
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, textDecoration: 'none' }}>Увійти</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
