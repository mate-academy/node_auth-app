import React, { useState } from 'react';
import { setNewPassword } from '../../api/user';
import { usePageError } from '../../hooks/usePageError';
import cn from 'classnames';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from '../Loader';

export const SetNewPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordConfirmError, setPasswordConfirmError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = usePageError(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [successCreating, setSuccessCreating] = usePageError(false);

  const token = params.get('token');

  if (!token) {
    navigate('/login');
  }

  const onClearErrors = () => {
    setPasswordError(false);
    setError(false);
  };

  const onCleanFields = () => {
    setPassword('');
  };

  const onSetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError(false);
    setPassword(event.target.value);
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

    if (passwordError || passwordConfirmError) {
      return;
    }

    try {
      if (!token) {
        setError(true);

        return;
      }

      setIsLoading(true);

      const data = {
        token,
        newPassword: passwordConfirm,
      };

      await setNewPassword(data);

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
          <label className="label">Password</label>
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
          <label className="label">Confirm password</label>
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
              onChange={(e) => setPasswordConfirm(e.target.value)}
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
