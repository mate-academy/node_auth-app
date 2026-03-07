import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/userApi';
import { authApi } from '../api/authApi';

const Section = ({ title, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14,
  }}>
    <h2 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500, margin: 0, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</h2>
    {children}
  </div>
);

const GlassInput = ({ placeholder, type = 'text', value, onChange }) => (
  <input
    type={type} placeholder={placeholder} value={value} onChange={onChange}
    style={{
      width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff',
      fontSize: 13, outline: 'none', boxSizing: 'border-box',
    }}
  />
);

const SaveButton = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '11px', background: 'rgba(255,255,255,0.85)', color: '#2d4a2d',
    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
  }}>{children}</button>
);

const Msg = ({ message }) => {
  if (!message) return null;

  return (
    <p style={{ color: message.type === 'success' ? '#88ee88' : '#ff9999', fontSize: 12, margin: 0 }}>
      {message.text}
    </p>
  );
};

export const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');

    if (token) {
      localStorage.setItem('accessToken', token);
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

  const setMsg = (key, type, text) =>
    setMessages((m) => ({ ...m, [key]: { type, text } }));

  const handleChangeName = async (e) => {
    e.preventDefault();

    try {
      const { data } = await userApi.updateName(name);

      setUser(data);
      setMsg('name', 'success', 'Імʼя оновлено');
    } catch {
      setMsg('name', 'error', 'Помилка');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmation) {
      return setMsg('password', 'error', 'Паролі не співпадають');
    }

    try {
      await userApi.changePassword(password, newPassword);
      setMsg('password', 'success', 'Пароль змінено');
      setPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (err) {
      setMsg('password', 'error', err.response?.data?.message || 'Помилка');
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();

    try {
      const { data } = await userApi.changeEmail(emailPassword, newEmail);

      setUser(data);
      setMsg('email', 'success', 'Email змінено');
      setEmailPassword('');
      setNewEmail('');
    } catch (err) {
      setMsg('email', 'error', err.response?.data?.message || 'Помилка');
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    logout();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 30%, #4a6a4a 60%, #6b8f6b 100%)',
      fontFamily: "'Segoe UI', sans-serif", padding: '40px 16px',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '24px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#fff', fontWeight: 300,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: 20, fontWeight: 500, margin: 0 }}>{user?.name || '—'}</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '2px 0 0' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            padding: '8px 20px', background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: 8, color: '#ff9999', fontSize: 13, cursor: 'pointer',
          }}>Вийти</button>
        </div>

        {/* 2 columns: name + password */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Section title="Змінити імʼя">
            <GlassInput placeholder="Імʼя" value={name} onChange={(e) => setName(e.target.value)} />
            <Msg message={messages['name']} />
            <SaveButton onClick={handleChangeName}>Зберегти</SaveButton>
          </Section>

          <Section title="Змінити пароль">
            <GlassInput placeholder="Поточний пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <GlassInput placeholder="Новий пароль" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <GlassInput placeholder="Підтвердження" type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            <Msg message={messages['password']} />
            <SaveButton onClick={handleChangePassword}>Зберегти</SaveButton>
          </Section>
        </div>

        {/* Email — full width */}
        <Section title="Змінити email">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <GlassInput placeholder="Поточний пароль" type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} />
            <GlassInput placeholder="Новий email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <Msg message={messages['email']} />
          <div style={{ maxWidth: 200 }}>
            <SaveButton onClick={handleChangeEmail}>Зберегти</SaveButton>
          </div>
        </Section>

      </div>
    </div>
  );
};
