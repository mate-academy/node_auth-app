import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';
import { AxiosError } from 'axios';

import { usePageError } from '../hooks/usePageError';
import { authService } from '../services/authService';
import { PASSWORD_RULES, validatePassword } from '../utils/validation';

export const PasswordResetConfirmPage = () => {
  const { token = '' } = useParams();

  const [error, setError] = usePageError('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="notification is-danger is-light">
        Reset token is missing. Please request a new reset link.
        <p>
          <Link to="/password-reset">Request a new link</Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
        }}
        validateOnMount
        validate={({ password, confirmPassword }) => {
          const errors: {
            password?: string;
            confirmPassword?: string;
          } = {};

          const passwordError = validatePassword(password);

          if (passwordError) {
            errors.password = passwordError;
          }

          if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
          } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
          }

          return errors;
        }}
        onSubmit={({ password, confirmPassword }) => {
          setError('');

          return authService
            .resetPassword(token, password, confirmPassword)
            .then(() => {
              setSuccess(true);
            })
            .catch((err: AxiosError<{ message?: string }>) => {
              setError(err.response?.data?.message ?? 'Request failed');
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Choose a new password</h1>

            <div className="field">
              <label htmlFor="password" className="label">
                New password
              </label>
              <Field
                name="password"
                id="password"
                type="password"
                validate={validatePassword}
                className={cn('input', {
                  'is-danger': touched.password && errors.password,
                })}
              />
              {touched.password && errors.password && (
                <p className="help is-danger">{errors.password}</p>
              )}
              <p className="help">Password rules:</p>
              <ul className="help">
                {PASSWORD_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>
              <Field
                name="confirmPassword"
                id="confirmPassword"
                type="password"
                className={cn('input', {
                  'is-danger':
                    touched.confirmPassword && errors.confirmPassword,
                })}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="help is-danger">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={
                  isSubmitting || !!errors.password || !!errors.confirmPassword
                }
              >
                Reset password
              </button>
            </div>

            {error && (
              <p className="notification is-danger is-light">{error}</p>
            )}

            {success && (
              <div className="notification is-success is-light">
                Password has been reset successfully.
                <p>
                  <Link to="/login">Go to login</Link>
                </p>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
};
