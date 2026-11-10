
import { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import cn from 'classnames';

import { usePageError } from '../hooks/usePageError';
import { authService } from '../services/authService';
import { validateEmail } from '../utils/validation';


export const ForgotPasswordPage = () => {
  const [error, setError] = usePageError('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Formik
        initialValues={{
          email: '',
        }}
        validateOnMount={true}
        onSubmit={({ email }) => {
          setError('');
          setSuccess(false);

          return authService
            .forgotPassword(email)
            .then(() => {
              setSuccess(true)
              navigate('/forgot-password/sent', {
                state: { email },
              });
            })
            .catch((error: AxiosError<{ message?: string }>) => {
              setError(error.response?.data?.message ?? '');
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Forgot password</h1>

            <p className="mb-4">
              Enter your email address and we will send you a
              password reset link.
            </p>

            <div className="field">
              <label htmlFor="email" className="label">
                Email
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validateEmail}
                  name="email"
                  type="email"
                  id="email"
                  placeholder="e.g. bobsmith@gmail.com"
                  className={cn('input', {
                    'is-danger': touched.email && errors.email,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-envelope"></i>
                </span>

                {touched.email && errors.email && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.email && errors.email && (
                <p className="help is-danger">{errors.email}</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn(
                  'button is-success has-text-weight-bold',
                  {
                    'is-loading': isSubmitting,
                  },
                )}
                disabled={isSubmitting || !!errors.email}
              >
                Send reset link
              </button>
            </div>

            {success && (
              <p className="notification is-success is-light">
                If an account with this email exists, a password
                reset link has been sent.
              </p>
            )}

            <p>
              Remember your password?{' '}
              <Link to="/login">Log in</Link>
            </p>
          </Form>
        )}
      </Formik>

      {error && (
        <p className="notification is-danger is-light">
          {error}
        </p>
      )}
    </>
  );
};
