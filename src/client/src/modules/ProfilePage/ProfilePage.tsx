import { useState } from 'react';
import { AuthResponse, AuthUser, MessageResponse } from '../../types/auth';
import { client } from '../../utils/client';
import './ProfilePage.css';

type Props = {
  user: AuthUser;
  onProfileUpdate: (user: AuthUser) => void;
};

const getFieldValue = (form: HTMLFormElement, fieldName: string) => {
  const formData = new FormData(form);
  return String(formData.get(fieldName) || '').trim();
};

export const ProfilePage = ({ user, onProfileUpdate }: Props) => {
  const [message, setMessage] = useState('Manage your profile settings.');

  const handleNameSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      const response = await client.patch<AuthResponse>('/profile/name', {
        name: getFieldValue(form, 'name'),
      });

      onProfileUpdate(response.data);
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    }
  };

  const handlePasswordSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      const response = await client.patch<MessageResponse>('/profile/password', {
        oldPassword: getFieldValue(form, 'oldPassword'),
        newPassword: getFieldValue(form, 'newPassword'),
        confirmNewPassword: getFieldValue(form, 'confirmNewPassword'),
      });

      form.reset();
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    }
  };

  const handleEmailSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      const response = await client.patch<AuthResponse>('/profile/email', {
        newEmail: getFieldValue(form, 'newEmail'),
        confirmNewEmail: getFieldValue(form, 'confirmNewEmail'),
        password: getFieldValue(form, 'emailPassword'),
      });

      onProfileUpdate(response.data);
      form.reset();
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-page__hero">
        <p className="profile-page__eyebrow">Profile</p>
        <h1 className="profile-page__title">{user.name}</h1>
        <p className="profile-page__subtitle">
          Manage your public info, password and email settings.
        </p>
      </div>

      <div className="profile-page__grid">
        <form className="profile-card" onSubmit={handleNameSubmit}>
          <h2 className="profile-card__title">Change name</h2>
          <label className="profile-card__field">
            <span>Name</span>
            <input
              name="name"
              type="text"
              defaultValue={user.name}
              minLength={3}
              required
            />
          </label>
          <button className="profile-card__submit" type="submit">
            Save name
          </button>
        </form>

        <form className="profile-card" onSubmit={handlePasswordSubmit}>
          <h2 className="profile-card__title">Change password</h2>
          <label className="profile-card__field">
            <span>Old password</span>
            <input
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="profile-card__field">
            <span>New password</span>
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="profile-card__field">
            <span>Confirm new password</span>
            <input
              name="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button className="profile-card__submit" type="submit">
            Update password
          </button>
        </form>

        <form className="profile-card" onSubmit={handleEmailSubmit}>
          <h2 className="profile-card__title">Change email</h2>
          <label className="profile-card__field">
            <span>Current email</span>
            <input value={user.email} readOnly type="email" />
          </label>
          <label className="profile-card__field">
            <span>New email</span>
            <input name="newEmail" type="email" autoComplete="email" required />
          </label>
          <label className="profile-card__field">
            <span>Confirm new email</span>
            <input
              name="confirmNewEmail"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="profile-card__field">
            <span>Password confirmation</span>
            <input
              name="emailPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="profile-card__submit" type="submit">
            Request email change
          </button>
        </form>
      </div>

      <p className="profile-page__note">{message}</p>
    </section>
  );
};
