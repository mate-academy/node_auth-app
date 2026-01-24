import { useState } from 'react';
import { api } from '../api/api.js';

export default function UpdateEmailForm() {
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newEmail !== confirmation) {
      setError('The emails do not match');
    }

    try {
      await api.put('/profile/email', {
        password,
        newEmail,
        confirmation,
      });

      setMessage('Email updated successfully');
      setPassword('');
      setNewEmail('');
      setConfirmation('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing e-mail');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Change e-mail</h3>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <input
        type="password"
        placeholder="Current password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="New e-mail"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Confirm new e-mail"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        required
      />

      <button type="submit">Save e-mail</button>
    </form>
  );
}
