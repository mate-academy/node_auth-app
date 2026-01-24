import { useState } from 'react';
import { api } from '../api/api.js';
import { isValidPassword } from './PasswordRules.jsx';
import { PasswordRules } from './PasswordRules.jsx';

export default function UpdatePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!isValidPassword(newPassword)) {
      setError('New password does not meet the requirements');
    }

    if (newPassword !== confirmation) {
      setError('The passwords do not match');
    }

    try {
      await api.put('/profile/password', {
        currentPassword,
        newPassword,
        confirmation,
      });

      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Change password</h3>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <PasswordRules password={newPassword} />

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        required
      />

      <button type="submit">Save password</button>
    </form>
  );
}
