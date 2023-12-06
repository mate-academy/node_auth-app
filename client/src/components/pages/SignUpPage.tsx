import React, { useState } from 'react';
import { User } from '../../types/User';
import { emailPattern } from '../../utils/reqexp';
import { addUser } from '../../api/user';
import { usePageError } from '../../hooks/usePageError';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../Loader';
import { validate } from '../../utils/validate';

export const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordConfirmError, setPasswordConfirmError] = useState(false);

  const [error, setError] = usePageError(false);
  const [successCreating, setSuccessCreating] = usePageError(false);

  const [isLoading, setIsLoading] = useState(false);

  const onClearErrors = () => {
    setNameError(false);
    setPasswordError(false);
    setEmailError(false);
    setError(false);
  };

  const onCleanFields = () => {
    setName('');
    setPassword('');
    setEmail('');
  };

  const onSetName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameError(false);
    setName(event.target.value);
  };

  const onSetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError(false);
    setPassword(event.target.value);
  };

  const onSetEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError(false);
    setEmail(event.target.value);
  };

  const comparePassword = () => {
    if (password !== passwordConfirm) {
      setPasswordConfirmError(true);
    }
    if (password === passwordConfirm) {
      setPasswordConfirmError(false);
    }
  };

  const onValidatePassword = () => {
    console.log(!validate.password(password));

    if (!validate.password(password)) {
      setPasswordError(true);
    }
  };

  const onValidateName = () => {
    if (!validate.name(name)) {
      setNameError(true);
    }
  };

  const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearErrors();

    if (!validate.name(name)) {
      setNameError(true);
    }
    if (!validate.password(password)) {
      setPasswordError(true);
    }
    if (!validate.email(email)) {
      setEmailError(true);
    }

    if (passwordConfirm !== password) {
      setPasswordConfirmError(true);
    }

    if (nameError || passwordError || emailError || passwordConfirmError) {
      return;
    }

    try {
      setIsLoading(true);

      const user = {
        name,
        email,
        password,
      };

      await addUser(user);

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
          <label className="label">Name</label>
          <div className="control">
            <input
              className={cn(
                'input',
                { 'is-success': name && !nameError },
                { 'is-danger': nameError }
              )}
              type="text"
              placeholder="Name"
              value={name}
              onChange={onSetName}
              onBlur={onValidateName}
            />
          </div>

          {name && !nameError && (
            <p className="help is-success">This username is available</p>
          )}
          {nameError && <p className="help is-danger">This name is invalid</p>}
        </div>

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

          {email && !emailError && (
            <p className="help is-success">This email is available</p>
          )}
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
              onBlur={()=> {
                comparePassword();
                onValidatePassword();
              }}
            />
          </div>

          {password && !passwordError && (
            <p className="help is-success">This password is available</p>
          )}
          {passwordError && (
            <p className="help is-danger">Type more than six symbols</p>
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
      {error && <p className="help is-danger">Error user creating</p>}
      {successCreating && (
        <p className="help is-success">Successfully! Check your mail!</p>
      )}
    </>
  );
};
