import { FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { AxiosError } from 'axios';

export const ResetPasswordPage = () => {
  const { resetToken = '' } = useParams();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [confirmationError, setConfirmationError] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Password is required';
    }

    if (value.length < 6) {
      return 'At least 6 characters';
    }

    return '';
  };

  const validateConfirmation = (value: string) => {
    if (!value) {
      return 'Confirmation is required';
    }

    if (value !== password) {
      return 'Passwords do not match';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError('');

    const passwordValidationError = validatePassword(password);
    const confirmationValidationError = validateConfirmation(confirmation);

    setPasswordError(passwordValidationError);
    setConfirmationError(confirmationValidationError);

    if (passwordValidationError || confirmationValidationError) {
      return;
    }

    try {
      await authService.resetPassword(resetToken, password, confirmation);
      navigate('/reset-password/success');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message ?? 'Something went wrong');
    }
  };

  const isSubmitDisabled =
    password.length < 6 || confirmation.length < 6 || password !== confirmation;

  return (
    <>
      <h1 className="title">Create new password</h1>

      <form onSubmit={handleSubmit} className="box">
        <div className="field">
          <label className="label">Password</label>

          <div className="control">
            <input
              className={`input ${passwordError ? 'is-danger' : ''}`}
              type="password"
              value={password}
              onChange={event => {
                setPassword(event.target.value);
                setPasswordError('');
              }}
              placeholder="New password"
            />
          </div>

          {passwordError ? (
            <p className="help is-danger">{passwordError}</p>
          ) : (
            <p className="help">At least 6 characters</p>
          )}
        </div>

        <div className="field">
          <label className="label">Confirmation</label>

          <div className="control">
            <input
              className={`input ${confirmationError ? 'is-danger' : ''}`}
              type="password"
              value={confirmation}
              onChange={event => {
                setConfirmation(event.target.value);
                setConfirmationError('');
              }}
              placeholder="Confirm password"
            />
          </div>

          {confirmationError && (
            <p className="help is-danger">{confirmationError}</p>
          )}
        </div>

        <button
          className="button is-success"
          disabled={isSubmitDisabled}
        >
          Change password
        </button>
      </form>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
