import cn from 'classnames';
import { useState, useContext } from 'react';
import { usePageError } from '../hooks/usePageError';
import { useNavigate } from 'react-router-dom';
import { logout, updatePassword } from '../api/user';
import { Loader } from './Loader';
import { AuthContext } from './AuthContext';

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordConfirmError, setPasswordConfirmError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = usePageError(false);
  const navigate = useNavigate();
  const [successCreating, setSuccessCreating] = usePageError(false);
  const { onSetUser } = useContext(AuthContext);

  const onClearErrors = () => {
    setPasswordError(false);
    setError(false);
    setCurrentPasswordError(false);
  };

  const onCleanFields = () => {
    setPassword('');
    setPassword('');
    setCurrentPassword('');
  };

  const onSetPasswordConfirm = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirmError(false);
    setPasswordConfirm(event.target.value);
  };

  const onSetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError(false);
    setPassword(event.target.value);
  };

  const onSetCurrentPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPasswordError(false);
    setCurrentPassword(event.target.value);
  };

  const comparePassword = () => {
    if (password !== passwordConfirm) {
      setPasswordConfirmError(true);
    }
    if (password === passwordConfirm) {
      setPasswordConfirmError(false);
    }
  };

  const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearErrors();

    if (!password || password.length < 6) {
      setPasswordError(true);
    }

    if (passwordConfirm !== password) {
      setPasswordConfirmError(true);
    }

    if (passwordError || passwordConfirmError || currentPasswordError) {
      return;
    }

    try {

      setIsLoading(true);

      const data = {
        oldPassword: currentPassword,
        newPassword: password,
        newConfirmedPassword: passwordConfirm,
      };

      await updatePassword(data);

      await logout();

      onSetUser(null);

      setTimeout(() => {
        navigate('/login');
      }, 3000);

      onCleanFields();

      setSuccessCreating(true);
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Current password</label>
          <div className="control">
            <input
              className={cn(
                'input',
                { 'is-success': password && !passwordError },
                { 'is-danger': passwordError }
              )}
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={onSetCurrentPassword}
            />
          </div>

          {currentPassword && !currentPasswordError && (
            <p className="help is-success">This password is available</p>
          )}
          {currentPasswordError && (
            <p className="help is-danger">This password is invalid</p>
          )}
        </div>
        <div className="field">
          <label className="label">New password</label>
          <div className="control">
            <input
              className={cn(
                'input',
                { 'is-success': password && !passwordError },
                { 'is-danger': passwordError }
              )}
              type="password"
              placeholder="Password"
              value={password}
              onChange={onSetPassword}
              onBlur={comparePassword}
            />
          </div>

          {password && !passwordError && (
            <p className="help is-success">This password is available</p>
          )}
          {passwordError && (
            <p className="help is-danger">This password is invalid</p>
          )}
        </div>

        <div className="field">
          <label className="label">Confirm new password</label>
          <div className="control">
            <input
              className={cn(
                'input',
                { 'is-success': passwordConfirm && !passwordConfirmError },
                { 'is-danger': passwordConfirmError }
              )}
              type="password"
              placeholder="Confirm password"
              value={passwordConfirm}
              onChange={onSetPasswordConfirm}
              onBlur={comparePassword}
            />
          </div>

          {passwordConfirm && !passwordConfirmError && (
            <p className="help is-success">This password is available</p>
          )}
          {passwordConfirmError && (
            <p className="help is-danger">This password is invalid</p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              type="submit"
              className="button is-link"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>

        </div>
      </form>
      {isLoading && <Loader />}
      {error && <p className="help is-danger">Error</p>}
      {successCreating && <p className="help is-success">Successfully!</p>}
    </>
  );
};
