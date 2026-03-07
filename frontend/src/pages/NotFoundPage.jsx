import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 30%, #4a6a4a 60%, #6b8f6b 100%)',
    fontFamily: "'Segoe UI', sans-serif",
  }}>
    <div style={{
      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, padding: '48px 40px',
      width: '100%', maxWidth: 380, boxShadow: '0 25px 50px rgba(0,0,0,0.4)', textAlign: 'center',
    }}>
      <h1 style={{ color: '#fff', fontSize: 80, fontWeight: 100, margin: 0, letterSpacing: 4 }}>404</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 28 }}>Сторінку не знайдено</p>
      <Link to="/" style={{ display: 'inline-block', padding: '12px 32px', background: 'rgba(255,255,255,0.9)', color: '#2d4a2d', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>На головну</Link>
    </div>
  </div>
);
