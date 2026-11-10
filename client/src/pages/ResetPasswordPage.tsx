import { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import { Link, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authService } from '../services/authService';
import { validatePassword } from '../utils/validation';
import cn from 'classnames';

type PageStatus = 'form' | 'success' | 'error';

export const ResetPasswordPage = () => {
  const { token = '' } = useParams();

  const [status, setStatus] = useState<PageStatus>('form');
  const [error, setError] = useState('');

  if (status === 'error') {
    return (
      <>
        <h1 className="title">Password reset</h1>

        <p className="notification is-danger is-light">{error}</p>

        <p>
          <Link to="/forgot-password">Request a new reset link</Link>
        </p>
      </>
    );
  }

  if (status === 'success') {
    return (
      <>
        <h1 className="title">Password reset</h1>

        <p className="notification is-success is-light">
          Your password has been successfully changed!
        </p>

        <p>
          You can now <Link to="/login">log in</Link> with your new password.
        </p>
      </>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          confirmation: '',
        }}
        validateOnMount={true}
        validate={({ password, confirmation }) => {
          const errors: {
            password?: string;
            confirmation?: string;
          } = {};

          const passwordError = validatePassword(password);

          if (passwordError) {
            errors.password = passwordError;
          }

          if (!confirmation) {
            errors.confirmation = 'Please confirm your password';
          } else if (password !== confirmation) {
            errors.confirmation = 'Passwords do not match';
          }

          return errors;
        }}
        onSubmit={({ password, confirmation }) => {
          setError('');

          return authService
            .resetPassword(token, password, confirmation)
            .then(() => {
              setStatus('success');
            })
            .catch((error: AxiosError<{ message?: string }>) => {
              setError(
                error.response?.data?.message ??
                  'Invalid or expired reset password link',
              );

              setStatus('error');
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Reset password</h1>

            <p className="mb-4">Enter your new password.</p>

            {/* New password */}
            <div className="field">
              <label htmlFor="password" className="label">
                New password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="password"
                  type="password"
                  id="password"
                  placeholder="********"
                  className={cn('input', {
                    'is-danger': touched.password && errors.password,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.password && errors.password && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.password && errors.password ? (
                <p className="help is-danger">{errors.password}</p>
              ) : (
                <p className="help">At least 6 characters</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="field">
              <label htmlFor="confirmation" className="label">
                Confirm password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  name="confirmation"
                  type="password"
                  id="confirmation"
                  placeholder="********"
                  className={cn('input', {
                    'is-danger': touched.confirmation && errors.confirmation,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.confirmation && errors.confirmation && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.confirmation && errors.confirmation && (
                <p className="help is-danger">{errors.confirmation}</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={
                  isSubmitting || !!errors.password || !!errors.confirmation
                }
              >
                Reset password
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};
