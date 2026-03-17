import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Section({ title, children }) {
  return (
    <>
      <h2>{title}</h2>
      {children}
    </>
  );
}

function Alert({ type, message }) {
  if (!message) return null;

  return <div className={`alert alert-${type}`}>{message}</div>;
}

export default function Profile() {
  const { user, login } = useAuth();

  const [nameField, setNameField] = useState(user?.name ?? '');
  const [nameMsg, setNameMsg] = useState({ type: '', text: '' });

  const [passwordFields, setPasswordFields] = useState({ oldPassword: '', newPassword: '', confirmation: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const [emailFields, setEmailFields] = useState({ newEmail: '', password: '' });
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  async function handleNameSubmit(e) {
    e.preventDefault();
    setNameMsg({ type: '', text: '' });

    const res = await fetch('/api/profile/name', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: nameField }),
    });

    const data = await res.json();

    if (!res.ok) {
      return setNameMsg({ type: 'error', text: data.error });
    }

    login({ ...user, name: nameField });
    setNameMsg({ type: 'success', text: data.message });
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    const res = await fetch('/api/profile/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(passwordFields),
    });

    const data = await res.json();

    if (!res.ok) {
      return setPasswordMsg({ type: 'error', text: data.error });
    }

    setPasswordFields({ oldPassword: '', newPassword: '', confirmation: '' });
    setPasswordMsg({ type: 'success', text: data.message });
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setEmailMsg({ type: '', text: '' });

    const res = await fetch('/api/profile/email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(emailFields),
    });

    const data = await res.json();

    if (!res.ok) {
      return setEmailMsg({ type: 'error', text: data.error });
    }

    setEmailFields({ newEmail: '', password: '' });
    setEmailMsg({ type: 'success', text: data.message });
  }

  if (!user) return null;

  return (
    <div className="container">
      <h1>Profile</h1>
      <p>Welcome, <strong>{user.name}</strong>! Your email: <strong>{user.email}</strong></p>

      <Section title="Change name">
        <Alert type={nameMsg.type} message={nameMsg.text} />
        <form onSubmit={handleNameSubmit}>
          <div className="form-group">
            <label htmlFor="name">New name</label>
            <input id="name" type="text" value={nameField} onChange={(e) => setNameField(e.target.value)} required />
          </div>
          <button type="submit">Update name</button>
        </form>
      </Section>

      <Section title="Change password">
        <Alert type={passwordMsg.type} message={passwordMsg.text} />
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword">Current password</label>
            <input id="oldPassword" name="oldPassword" type="password" value={passwordFields.oldPassword}
              onChange={(e) => setPasswordFields((p) => ({ ...p, oldPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New password</label>
            <input id="newPassword" name="newPassword" type="password" value={passwordFields.newPassword}
              onChange={(e) => setPasswordFields((p) => ({ ...p, newPassword: e.target.value }))} required />
            <span className="hint">Min 8 chars, uppercase, lowercase, digit.</span>
          </div>
          <div className="form-group">
            <label htmlFor="confirmation">Confirm new password</label>
            <input id="confirmation" name="confirmation" type="password" value={passwordFields.confirmation}
              onChange={(e) => setPasswordFields((p) => ({ ...p, confirmation: e.target.value }))} required />
          </div>
          <button type="submit">Update password</button>
        </form>
      </Section>

      <Section title="Change email">
        <Alert type={emailMsg.type} message={emailMsg.text} />
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label htmlFor="newEmail">New email</label>
            <input id="newEmail" name="newEmail" type="email" value={emailFields.newEmail}
              onChange={(e) => setEmailFields((p) => ({ ...p, newEmail: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label htmlFor="emailPassword">Your password</label>
            <input id="emailPassword" name="password" type="password" value={emailFields.password}
              onChange={(e) => setEmailFields((p) => ({ ...p, password: e.target.value }))} required />
          </div>
          <button type="submit">Send confirmation</button>
        </form>
      </Section>
    </div>
  );
}
