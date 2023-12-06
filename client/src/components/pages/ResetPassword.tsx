import React, { useState } from 'react';
import { emailPattern } from '../../utils/reqexp';
import { resetPasswordRequst } from '../../api/user';
import { usePageError } from '../../hooks/usePageError';
import cn from 'classnames';
import { Loader } from '../Loader';

export const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = usePageError(false);
  const [isSuccess, setIsSuccess] = usePageError(false);

  const onClearErrors = () => {
    setEmailError(false);
    setError(false);
  };

  const onCleanFields = () => {
    setEmail('');
  };

  const onSetEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError(false);
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FocusEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClearErrors();

    if (!email || !emailPattern.test(email)) {
      setEmailError(true);
    }

    if (emailError) {
      return;
    }

    try {
      setIsLoading(true);

      const user = {
        email,
      };

      const res = await resetPasswordRequst(user);
      console.log(res);

      setIsSuccess(true);

      onCleanFields();
    } catch (error) {
      console.log(error);
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
      {isSuccess && <p className="help is-success">Success!</p>}
    </>
  );
};
