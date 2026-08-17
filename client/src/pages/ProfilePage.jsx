import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';
import PasswordRules from '../components/PasswordRules';

import { useAuth } from '../context/AuthContext';

import {
  changeName,
  changePassword,
  changeEmail,
} from '../services/authService';

const ProfilePage = () => {
  const navigate = useNavigate();

  const { user, accessToken, fetchMe, logout } = useAuth();

  const [name, setName] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmation: '',
  });

  const [emailForm, setEmailForm] = useState({
    password: '',
    newEmail: '',
  });

  const [nameMessage, setNameMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const [error, setError] = useState('');

  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      fetchMe().catch(() => {
        navigate('/login');
      });
    }
  }, [user, fetchMe, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleNameSubmit = async (event) => {
    event.preventDefault();

    setNameMessage('');
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must contain at least 2 characters.');
      return;
    }

    try {
      setNameLoading(true);

      await changeName(accessToken, name.trim());

      await fetchMe();

      setNameMessage('Name updated successfully.');
    } catch (error) {
      setError(error.message);
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value,
    });

    setError('');
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage('');
    setError('');

    if (!passwordForm.oldPassword) {
      setError('Old password is required.');
      return;
    }

    if (!passwordForm.newPassword) {
      setError('New password is required.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }

    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setError('New password must contain at least one uppercase letter.');
      return;
    }

    if (!/[a-z]/.test(passwordForm.newPassword)) {
      setError('New password must contain at least one lowercase letter.');
      return;
    }

    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setError('New password must contain at least one number.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmation) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);

      await changePassword(accessToken, passwordForm);

      setPasswordMessage('Password changed successfully. Please login again.');

      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmation: '',
      });

      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailChange = (event) => {
    setEmailForm({
      ...emailForm,
      [event.target.name]: event.target.value,
    });

    setError('');
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    setEmailMessage('');
    setError('');

    if (!emailForm.password) {
      setError('Password is required.');
      return;
    }

    if (!emailForm.newEmail) {
      setError('New email is required.');
      return;
    }

    try {
      setEmailLoading(true);

      await changeEmail(accessToken, emailForm);

      setEmailMessage('Confirmation link has been sent to your new email.');

      await fetchMe();

      setEmailForm({
        password: '',
        newEmail: '',
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();

    navigate('/login', { replace: true });
  };

  if (!user) {
    return (
      <section className="section">
        <div className="has-text-centered">
          <button className="button is-loading is-primary">Loading</button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Profile</h1>

        {error && (
          <div className="notification is-danger is-light">{error}</div>
        )}

        <div className="box">
          <h2 className="title is-4">Account information</h2>

          <p>
            <strong>Name:</strong> {user.name}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          {user.pendingEmail && (
            <p>
              <strong>Pending email:</strong> {user.pendingEmail}
            </p>
          )}

          <p>
            <strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="box">
          <h2 className="title is-4">Change name</h2>

          {nameMessage && (
            <div className="notification is-success is-light">
              {nameMessage}
            </div>
          )}

          <form onSubmit={handleNameSubmit}>
            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Button type="submit" loading={nameLoading}>
              Change name
            </Button>
          </form>
        </div>

        <div className="box">
          <h2 className="title is-4">Change password</h2>

          {passwordMessage && (
            <div className="notification is-success is-light">
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <Input
              label="Old password"
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
            />

            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />

            <PasswordRules password={passwordForm.newPassword} />

            <Input
              label="Confirm new password"
              name="confirmation"
              type="password"
              value={passwordForm.confirmation}
              onChange={handlePasswordChange}
            />

            <Button type="submit" loading={passwordLoading}>
              Change password
            </Button>
          </form>
        </div>

        <div className="box">
          <h2 className="title is-4">Change email</h2>

          <div className="notification is-info is-light">
            You need to confirm your new email address. Your old email will also
            receive a notification.
          </div>

          {emailMessage && (
            <div className="notification is-success is-light">
              {emailMessage}
            </div>
          )}

          <form onSubmit={handleEmailSubmit}>
            <Input
              label="Current password"
              name="password"
              type="password"
              value={emailForm.password}
              onChange={handleEmailChange}
            />

            <Input
              label="New email"
              name="newEmail"
              type="email"
              value={emailForm.newEmail}
              onChange={handleEmailChange}
              placeholder="new@example.com"
            />

            <Button type="submit" loading={emailLoading}>
              Change email
            </Button>
          </form>
        </div>

        <div className="box">
          <button className="button is-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
