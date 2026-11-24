import React, { useState } from 'react';
import { userAuth } from '../../api/userApi';
import axios from 'axios';

export const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  const isPasswordLong = newPassword.length >= 6;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsSaved(false);
    try {
      await userAuth.changePassword(oldPassword, newPassword, confirmation);
      setIsSaved(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrors(error.response.data.errors ?? {});
      } else {
        setErrors({ form: 'Server is not responding' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="oldPassword">
          Old Password
        </label>
        <div className="field has-addons mb-0">
          <div className="control is-expanded">
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              id="oldPassword"
              autoComplete="current-password"
              required
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
            />
          </div>
          <div className="control">
            <button
              type="button"
              className="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🌝' : '🌚'}
            </button>
          </div>
        </div>
        {errors.oldPassword && (
          <p className="help is-danger">{errors.oldPassword}</p>
        )}
      </div>

      <div className="field">
        <label className="label" htmlFor="newPassword">
          New Password
        </label>
        <div className="field has-addons mb-0">
          <div className="control is-expanded">
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              id="newPassword"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="control">
            <button
              type="button"
              className="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🌝' : '🌚'}
            </button>
          </div>
        </div>
        {errors.newPassword && (
          <p className="help is-danger">{errors.newPassword}</p>
        )}
        {isPasswordLong ? (
          <p className="help is-success">At least 6 characters</p>
        ) : (
          <p className="help">At least 6 characters</p>
        )}
      </div>

      <div className="field">
        <label className="label" htmlFor="confirmation">
          Confirmation
        </label>
        <div className="field has-addons mb-0">
          <div className="control is-expanded">
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              id="confirmation"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
          <div className="control">
            <button
              type="button"
              className="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🌝' : '🌚'}
            </button>
          </div>
        </div>
        {errors.confirmation && (
          <p className="help is-danger">{errors.confirmation}</p>
        )}
      </div>

      {errors.form && <p className="help is-danger mb-3">{errors.form}</p>}
      {isSaved && <p className="help is-success mb-3">Password changed ✅</p>}
      <button className="button is-link is-fullwidth" type="submit">
        Save
      </button>
    </form>
  );
};
