import React, { useState, useContext } from 'react';
import { emailPattern } from '../../utils/reqexp';
import { login } from '../../api/user';
import { usePageError } from '../../hooks/usePageError';
import cn from 'classnames';
import { Link, useNavigate } from 'react-router-dom';
import { Loader } from '../Loader';
import { AuthContext } from '../AuthContext';

export const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = usePageError(false);
  const navigate = useNavigate();
  const { user, onSetUser } = useContext(AuthContext);

  if(user) {
    navigate('/user');
  }

  const onClearErrors = () => {
    setPasswordError(false);
    setEmailError(false);
    setError(false);
  };

  const onCleanFields = () => {
    setPassword('');
    setEmail('');
  };

  const onSetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError(false);
    setPassword(event.target.value);
  };

  const onSetEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError(false);
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearErrors();

    if (!password || password.length < 6) {
      setPasswordError(true);
    }
    if (!email || !emailPattern.test(email)) {
      setEmailError(true);
    }

    if (passwordError || emailError) {
      return;
    }

    try {
      setIsLoading(true);

      const user = {
        email,
        password,
      };

      const userData = await login(user);

      onSetUser(userData);

      navigate('/user');

      onCleanFields();
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
          <label className="label">Email</label>
          <div className="control">
            <input
              className={cn(
                'input',
                { 'is-success': email && !emailError },
                { 'is-danger': emailError }
              )}
              type="email"
              placeholder="Email"
              value={email}
              onChange={onSetEmail}
            />
          </div>
          {emailError && (
            <p className="help is-danger">This email is invalid</p>
          )}
        </div>
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
            />
          </div>
          {passwordError && (
            <p className="help is-danger">This name is invalid</p>
          )}
        </div>

        <Link to={'/reset-password'}>Forgot password?</Link>

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
    </>
  );
};
