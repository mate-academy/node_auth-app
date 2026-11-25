import React, { useState } from 'react';
import { userAuth } from '../../api/userApi';
import axios from 'axios';

export const ChangeEmailForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setIsSaved(false);
    try {
      await userAuth.changeEmail(email, password);
      setPassword('');
      setEmail('');
      setIsSaved(true);
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
        <label className="label" htmlFor="email">
          New email
        </label>
        <div className="control">
          <input
            className={errors.email ? 'input is-danger' : 'input'}
            type="email"
            placeholder="New email"
            id="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        {errors.newEmail && <p className="help is-danger">{errors.newEmail}</p>}
      </div>

      <div className="field">
        <label className="label" htmlFor="password">
          Password
        </label>
        <div className="field has-addons mb-0">
          <div className="control is-expanded">
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              id="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
        {errors.password && <p className="help is-danger">{errors.password}</p>}
      </div>

      {errors.form && <p className="help is-danger mb-3">{errors.form}</p>}
      {isSaved && (
        <p className="help is-success mb-3">
          Check your new email to confirm the change 📬
        </p>
      )}

      <button className="button is-link is-fullwidth" type="submit">
        Save
      </button>
    </form>
  );
};
