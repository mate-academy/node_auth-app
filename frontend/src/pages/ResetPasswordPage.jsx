import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmation) return setError('Паролі не співпадають');
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка');
    }
  };

  const bgStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 30%, #4a6a4a 60%, #6b8f6b 100%)',
    fontFamily: "'Segoe UI', sans-serif",
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, padding: '48px 40px',
    width: '100%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  };

  const glassInput = {
    width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  if (done) {
    return (
      <div style={bgStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 300, marginBottom: 12 }}>Пароль змінено!</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>Тепер можеш увійти з новим паролем</p>
          <Link to="/login" style={{ display: 'inline-block', padding: '12px 32px', background: 'rgba(255,255,255,0.9)', color: '#2d4a2d', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Увійти</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 300, textAlign: 'center', marginBottom: 32, letterSpacing: 2 }}>New Password</h1>
        {error && <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 10, padding: '10px', color: '#ff9999', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="password" placeholder="Новий пароль" value={password} onChange={e => setPassword(e.target.value)} style={glassInput} />
          <input type="password" placeholder="Підтвердження" value={confirmation} onChange={e => setConfirmation(e.target.value)} style={glassInput} />
          <button type="submit" style={{ padding: '14px', background: 'rgba(255,255,255,0.9)', color: '#2d4a2d', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Зберегти
          </button>
        </form>
      </div>
    </div>
  );
};
