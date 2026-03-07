import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка');
    }
  };

  const bgStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 30%, #4a6a4a 60%, #6b8f6b 100%)',
    fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden',
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, padding: '48px 40px',
    width: '100%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1,
    textAlign: 'center',
  };

  if (sent) {
    return (
      <div style={bgStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 300, marginBottom: 12, letterSpacing: 1 }}>Перевірте пошту</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 }}>Ми надіслали посилання для скидання паролю на {email}</p>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>← Повернутись до входу</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: '-100px', left: '-100px', background: 'radial-gradient(circle, rgba(80,120,80,0.4) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={cardStyle}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 300, marginBottom: 8, letterSpacing: 2 }}>Forgot Password</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 28 }}>Введіть email і ми надішлемо посилання</p>

        {error && <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 10, padding: '10px', color: '#ff9999', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          <button type="submit" style={{ padding: '14px', background: 'rgba(255,255,255,0.9)', color: '#2d4a2d', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Надіслати
          </button>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>← Повернутись</Link>
        </form>
      </div>
    </div>
  );
};
