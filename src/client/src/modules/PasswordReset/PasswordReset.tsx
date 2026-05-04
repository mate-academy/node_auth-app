import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageResponse } from '../../types/auth';
import { client } from '../../utils/client';
import './PasswordReset.css';

type FormStatus = {
  type: 'error' | 'success';
  message: string;
};

const getFieldValue = (form: HTMLFormElement, fieldName: string) => {
  const formData = new FormData(form);
  return String(formData.get(fieldName) || '').trim();
};

export const PasswordReset = () => {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const password = getFieldValue(form, 'password');
    const confirmPassword = getFieldValue(form, 'confirmPassword');

    setStatus(null);

    if (!token) {
      setStatus({
        type: 'error',
        message: 'Password reset token is missing.',
      });

      return;
    }

    if (!password || !confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Both password fields are required.',
      });

      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match.',
      });

      return;
    }

    try {
      const response = await client.post<MessageResponse>(
        `/password-reset/confirm/${token}`,
        {
          password,
          confirmPassword,
        },
      );

      setStatus({
        type: 'success',
        message: response.message,
      });

      setTimeout(
        () =>
          navigate('/password-reset/success', {
            state: {
              mode: 'confirm',
            },
          }),
        1200,
      );
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Request failed',
      });
    }
  };

  return (
    <section className="password-flow">
      <div className="password-flow__card">
        <p className="password-flow__eyebrow">Password reset</p>
        <h1 className="password-flow__title">Create a new password</h1>
        <p className="password-flow__subtitle">
          Choose a new password and confirm it to finish the reset flow.
        </p>

        <form className="password-flow__form" onSubmit={handleSubmit}>
          <label className="password-flow__field">
            <span>New password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Enter new password"
              required
            />
          </label>

          <label className="password-flow__field">
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Repeat new password"
              required
            />
          </label>

          {status && (
            <p
              className={`password-flow__status password-flow__status--${status.type}`}
            >
              {status.message}
            </p>
          )}

          <button className="password-flow__submit" type="submit">
            Update password
          </button>
        </form>

        <Link className="password-flow__link" to="/login">
          Back to login
        </Link>
      </div>
    </section>
  );
};
