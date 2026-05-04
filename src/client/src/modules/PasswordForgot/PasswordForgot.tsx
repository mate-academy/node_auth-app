import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageResponse } from '../../types/auth';
import { client } from '../../utils/client';
import './PasswordForgot.css';

type FormStatus = {
  type: 'error' | 'success';
  message: string;
};

const getFieldValue = (form: HTMLFormElement, fieldName: string) => {
  const formData = new FormData(form);
  return String(formData.get(fieldName) || '').trim();
};

export const PasswordForgot = () => {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = getFieldValue(form, 'email');

    setStatus(null);

    if (!email) {
      setStatus({
        type: 'error',
        message: 'Email is required.',
      });

      return;
    }

    try {
      const response = await client.post<MessageResponse>(
        '/password-reset/request',
        {
          email,
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
              mode: 'request',
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
        <h1 className="password-flow__title">Forgot your password?</h1>
        <p className="password-flow__subtitle">
          Enter your email and we will send you a reset link.
        </p>

        <form className="password-flow__form" onSubmit={handleSubmit}>
          <label className="password-flow__field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
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
            Send reset link
          </button>
        </form>

        <Link className="password-flow__link" to="/login">
          Back to login
        </Link>
      </div>
    </section>
  );
};
