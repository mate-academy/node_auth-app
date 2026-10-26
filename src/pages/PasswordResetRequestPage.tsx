import { Link } from 'react-router-dom';
import cn from 'classnames';
import { Form, Formik, Field } from 'formik';
import { AxiosError } from 'axios';
import { useState } from 'react';

import { usePageError } from '../hooks/usePageError';
import { authService } from '../services/authService';
import { validateEmail } from '../utils/validation';

export const PasswordResetRequestPage = () => {
  const [error, setError] = usePageError('');
  const [sentTo, setSentTo] = useState('');

  if (sentTo) {
    return (
      <section>
        <h1 className="title">Check your email</h1>
        <p className="mb-4">
          If an account exists for <b>{sentTo}</b>, we have sent a link to reset
          your password. The link is valid for 15 minutes.
        </p>
        <Link to="/login">Back to login</Link>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
        }}
        validateOnMount
        onSubmit={({ email }, { setSubmitting }) => {
          setError('');

          return authService
            .requestPasswordReset(email.trim())
            .then(() => {
              setSentTo(email.trim());
            })
            .catch((err: AxiosError<{ message?: string }>) => {
              setError(err.response?.data?.message ?? 'Request failed');
            })
            .finally(() => {
              setSubmitting(false);
            });
        }}
      >
        {({ touched, isSubmitting, errors }) => (
          <Form className="box">
            <h1 className="title">Reset Password</h1>
            <p className="mb-4">
              Enter your email address and we will send you instructions to
              reset your password.
            </p>
            <div className="field">
              <label htmlFor="email" className="label">
                Email
              </label>

              <div className="control has-icons-left">
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
                  <i className="fa fa-envelope" />
                </span>
              </div>

              {touched.email && errors.email && (
                <p className="help is-danger">{errors.email}</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || !!errors.email}
              >
                Send reset link
              </button>
            </div>

            {error && (
              <p className="notification is-danger is-light">{error}</p>
            )}

            <p>
              Remember your password? <Link to="/login">Log in</Link>
            </p>
          </Form>
        )}
      </Formik>
    </>
  );
};
