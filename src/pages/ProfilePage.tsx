import { Navigate } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { useAuth } from '../components/AuthContext';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import {
  PASSWORD_RULES,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation';

type Status = { type: 'success' | 'error'; text: string } | null;

const getErrorText = (err: unknown, fallback: string) => {
  const { response } = err as AxiosError<{ message?: string }>;

  return response?.data?.message ?? fallback;
};

const StatusMessage = ({ status }: { status: Status }) =>
  status && (
    <p
      className={`mt-3 ${status.type === 'success' ? 'has-text-success' : 'has-text-danger'}`}
    >
      {status.text}
    </p>
  );

export const ProfilePage = () => {
  const { isChecked, currentUser, updateName, updateEmail, updatePassword } =
    useAuth();

  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<Status>(null);

  const [emailPassword, setEmailPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<Status>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);

  const handleNameSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNameStatus(null);

    const validationError = validateName(name);

    if (validationError) {
      setNameStatus({ type: 'error', text: validationError });

      return;
    }

    try {
      await updateName(name.trim());
      setName('');
      setNameStatus({ type: 'success', text: 'Name updated successfully' });
    } catch (err) {
      setNameStatus({
        type: 'error',
        text: getErrorText(err, 'Failed to update name'),
      });
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailStatus(null);

    const validationError = validateEmail(email);

    if (validationError) {
      setEmailStatus({ type: 'error', text: validationError });

      return;
    }

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setEmailStatus({ type: 'error', text: 'Emails do not match' });

      return;
    }

    try {
      await updateEmail(emailPassword, email.trim(), confirmEmail.trim());
      setEmailPassword('');
      setEmail('');
      setConfirmEmail('');
      setEmailStatus({
        type: 'success',
        text: 'Email updated. We notified your old email address.',
      });
    } catch (err) {
      setEmailStatus({
        type: 'error',
        text: getErrorText(err, 'Failed to update email'),
      });
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordStatus(null);

    const validationError = validatePassword(newPassword);

    if (validationError) {
      setPasswordStatus({ type: 'error', text: validationError });

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'Passwords do not match' });

      return;
    }

    try {
      await updatePassword(currentPassword, newPassword, confirmPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({
        type: 'success',
        text: 'Password updated successfully',
      });
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        text: getErrorText(err, 'Failed to update password'),
      });
    }
  };

  if (!isChecked) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="section">
      <h1 className="title">Profile</h1>

      <p>Name: {currentUser.name}</p>
      <p>Email: {currentUser.email}</p>

      <hr />

      <h2 className="subtitle">Change name</h2>

      <form onSubmit={handleNameSubmit}>
        <div className="field">
          <label className="label" htmlFor="name">
            New name
          </label>

          <div className="control">
            <input
              id="name"
              className="input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your new name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
        </div>

        <button className="button is-primary" type="submit">
          Update name
        </button>

        <StatusMessage status={nameStatus} />
      </form>

      <hr />

      <h2 className="subtitle">Change email</h2>

      <form onSubmit={handleEmailSubmit}>
        <div className="field">
          <label className="label" htmlFor="emailPassword">
            Password
          </label>

          <div className="control">
            <input
              id="emailPassword"
              className="input"
              type="password"
              value={emailPassword}
              onChange={(event) => setEmailPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="email">
            New email
          </label>

          <div className="control">
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your new email"
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="confirmEmail">
            Confirm new email
          </label>

          <div className="control">
            <input
              id="confirmEmail"
              className="input"
              type="email"
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
              placeholder="Repeat your new email"
              required
            />
          </div>
        </div>

        <button className="button is-primary" type="submit">
          Update email
        </button>

        <StatusMessage status={emailStatus} />
      </form>

      <hr />

      <h2 className="subtitle">Change password</h2>

      <form onSubmit={handlePasswordSubmit}>
        <div className="field">
          <label className="label" htmlFor="currentPassword">
            Current password
          </label>

          <div className="control">
            <input
              id="currentPassword"
              className="input"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="newPassword">
            New password
          </label>

          <div className="control">
            <input
              id="newPassword"
              className="input"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <p className="help">Password rules:</p>
          <ul className="help">
            {PASSWORD_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="field">
          <label className="label" htmlFor="confirmPassword">
            Confirm new password
          </label>

          <div className="control">
            <input
              id="confirmPassword"
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <button className="button is-primary" type="submit">
          Update password
        </button>

        <StatusMessage status={passwordStatus} />
      </form>
    </section>
  );
};
