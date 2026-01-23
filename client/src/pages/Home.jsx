'use strict'

import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function Home() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('accessToken');

  const loadMe = async() => {
    setError('');
    setMsg('');

    try {
      const data = await apiRequest('/profile', { token });
      setMe(data);
      setUserName(data.userName || '');
      setEmail(data.email || '');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!userName.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }

    try {
      await apiRequest('/profile', {
        method: 'PATCH',
        token,
        body: { userName: userName.trim(), email: email.trim() }
      });

      setMsg('Profile updated successfully.');
      await loadMe();
    } catch (e) {
      setError(e.message);
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!currentPassword || !newPassword || !confirmation) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmation) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      await apiRequest('/profile/password', {
        method: 'PATCH',
        token,
        body: { currentPassword, newPassword, confirmation }
      });

      setMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;
  if (!me) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>

      {msg && <div style={{ color: 'green' }}>{msg}</div>}

      <h2>Personal data</h2>
      <form onSubmit={onSaveProfile} className="table">
        <input
          className="field"
          type="text"
          placeholder="Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Save</button>
      </form>

      <h2>Change password</h2>
      <form onSubmit={onChangePassword} className="table">
        <input
          className="field"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          className="field"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          className="field"
          type="password"
          placeholder="Confirm new password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />

        <button type="submit">Update password</button>
      </form>
    </div>
  );
}
