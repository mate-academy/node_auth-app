import type React from 'react';
import { AuthCard } from '../../components/AuthCard';
import axios from 'axios';
import { useState } from 'react';
import { authApi } from '../../api/authApi';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSent, setIsSent] = useState(false);
  const { user, isChecking } = useAuth();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrors(
          error.response.data.errors ?? { form: error.response.data.message },
        );
      } else {
        setErrors({ form: 'Server is not responding' });
      }
    }
  };

  if (isChecking) {
    return (
      <AuthCard title="Loading... 🛰️">
        <div className="has-text-centered">
          <span
            className="button is-loading is-ghost is-large"
            aria-label="Loading"
          />
        </div>
      </AuthCard>
    );
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  if (isSent) {
    return (
      <AuthCard
        title="Check your email 📬"
        subtitle={`Reset link sent to ${email}`}
      >
        <p className="has-text-centered">
          <Link to="/login">← Back to login</Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot Password 🔑"
      subtitle="We'll beam a reset link to your inbox 📡"
    >
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="control">
            <input
              className="input"
              type="email"
              placeholder="Email"
              id="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {errors.email && <p className="help is-danger">{errors.email}</p>}
        </div>

        <button className="button is-link is-fullwidth" type="submit">
          Send
        </button>
      </form>
    </AuthCard>
  );
};
