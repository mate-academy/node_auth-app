import { Link } from 'react-router-dom';

export const CheckEmailPage = () => (
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
      <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
      <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 300, marginBottom: 12, letterSpacing: 1 }}>Перевірте пошту</h1>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
        Ми надіслали листа з посиланням для активації акаунту. Перевірте папку &quot;Спам&quot; якщо не знайдете.
      </p>
      <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>← Повернутись до входу</Link>
    </div>
  </div>
);
