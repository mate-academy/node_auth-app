import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { useAuth } from '../components/AuthContext';
import { profileService } from '../services/profileService';

export const ProfilePage = () => {
  const { currentUser } = useAuth();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [newEmail, setNewEmail] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [emailPassword, setEmailPassword] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const userId = currentUser.id;

  const handleNameSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await profileService.updateName(userId, name);
      setSuccess('Name was updated');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message ?? 'Something went wrong');
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('At least 6 characters');
      return;
    }

    if (newPassword !== confirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      await profileService.updatePassword(
        userId,
        oldPassword,
        newPassword,
        confirmation,
      );

      setOldPassword('');
      setNewPassword('');
      setConfirmation('');

      setSuccess('Password was updated');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message ?? 'Something went wrong');
    }
  };

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await profileService.updateEmail(userId, emailPassword, newEmail);

      setNewEmail('');
      setEmailPassword('');

      setSuccess('Email was updated. Notification was sent to old email.');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message ?? 'Something went wrong');
    }
  };

  return (
    <>
      <h1 className="title">Profile</h1>

      {success && (
        <p className="notification is-success is-light">
          {success}
        </p>
      )}

      {error && (
        <p className="notification is-danger is-light">
          {error}
        </p>
      )}

      <div className="box">
        <h2 className="subtitle">Your account</h2>

        <p>
          <strong>Email:</strong> {currentUser.email}
        </p>
      </div>

      <form className="box" onSubmit={handleNameSubmit}>
        <h2 className="subtitle">Change name</h2>

        <div className="field">
          <label className="label">Name</label>

          <div className="control">
            <input
              className="input"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Your name"
            />
          </div>
        </div>

        <button className="button is-success">
          Save name
        </button>
      </form>

      <form className="box" onSubmit={handlePasswordSubmit}>
        <h2 className="subtitle">Change password</h2>

        <div className="field">
          <label className="label">Old password</label>

          <div className="control">
            <input
              className="input"
              type="password"
              value={oldPassword}
              onChange={event => setOldPassword(event.target.value)}
              placeholder="Old password"
            />
          </div>
        </div>

        <div className="field">
          <label className="label">New password</label>

          <div className="control">
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              placeholder="New password"
            />
          </div>

          <p className="help">At least 6 characters</p>
        </div>

        <div className="field">
          <label className="label">Confirmation</label>

          <div className="control">
            <input
              className="input"
              type="password"
              value={confirmation}
              onChange={event => setConfirmation(event.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <button
          className="button is-success"
          disabled={
            !oldPassword ||
            newPassword.length < 6 ||
            confirmation !== newPassword
          }
        >
          Change password
        </button>
      </form>

      <form className="box" onSubmit={handleEmailSubmit}>
        <h2 className="subtitle">Change email</h2>

        <div className="field">
          <label className="label">New email</label>

          <div className="control">
            <input
              className="input"
              type="email"
              value={newEmail}
              onChange={event => setNewEmail(event.target.value)}
              placeholder="New email"
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Password</label>

          <div className="control">
            <input
              className="input"
              type="password"
              value={emailPassword}
              onChange={event => setEmailPassword(event.target.value)}
              placeholder="Your password"
            />
          </div>
        </div>

        <button
          className="button is-success"
          disabled={!newEmail || !emailPassword}
        >
          Change email
        </button>
      </form>
    </>
  );
};
