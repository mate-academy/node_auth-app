import React, { useState } from 'react';
import { AuthCard } from '../../components/AuthCard';
import { authApi } from '../../api/authApi';
import axios from 'axios';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isRegistered, setIsRegistered] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPasswordLong = password.length >= 6;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    try {
      await authApi.register(name, email, password);
      setIsRegistered(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrors(error.response.data.errors ?? {});
      } else {
        setErrors({ form: 'Server is not responding' });
      }
    }
  };

  if (isRegistered) {
    return (
      <AuthCard title="Check your email 📬">
        <p className="has-text-centered has-text-grey-light mb-1">
          We sent an activation link to
        </p>
        <p className="has-text-centered has-text-link has-text-weight-semibold mb-5">
          {email}
        </p>
        <p className="has-text-centered is-size-7 has-text-grey">
          Didn't get it? Check your spam folder.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create account" subtitle="Join the galaxy">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="name">
            Name
          </label>
          <div className="control">
            <input
              id="name"
              autoComplete="name"
              className="input"
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {errors.name && <p className="help is-danger">{errors.name}</p>}
        </div>

        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="control">
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="Email"
              id="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {errors.email && <p className="help is-danger">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="control">
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              id="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {errors.password && (
            <p className="help is-danger">{errors.password}</p>
          )}
          {isPasswordLong ? (
            <p className="help is-success">At least 6 characters</p>
          ) : (
            <p className="help">At least 6 characters</p>
          )}
        </div>

        {errors.form && <p className="help is-danger mb-3">{errors.form}</p>}

        <button className="button is-link is-fullwidth" type="submit">
          Sign up
        </button>
      </form>
    </AuthCard>
  );
};
