import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AxiosError } from 'axios';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value: string) {
  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }

  return '';
}

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError('');
    setEmailError('');

    const validationError = validateEmail(email);

    if (validationError) {
      setEmailError(validationError);
      return;
    }

    try {
      await authService.requestPasswordReset(email);
      navigate('/forgot-password/sent');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;

      setError(err.response?.data?.message ?? 'Something went wrong');
    }
  };

  return (
    <>
      <h1 className="title">Reset password</h1>

      <form onSubmit={handleSubmit} className="box">
        <div className="field">
          <label className="label">Email</label>

          <div className="control">
            <input
              className={`input ${emailError ? 'is-danger' : ''}`}
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="e.g. bobsmith@gmail.com"
            />
          </div>

          {emailError && (
            <p className="help is-danger">{emailError}</p>
          )}
        </div>

        <button className="button is-success">
          Send reset link
        </button>
      </form>

      {error && (
        <p className="notification is-danger is-light">
          {error}
        </p>
      )}
    </>
  );
};
