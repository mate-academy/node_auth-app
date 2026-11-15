import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { authService } from '../services/authService.js';
import { usePageError } from '../hooks/usePageError.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export const ResetPasswordRequestPage = () => {
  const [error, setError] = usePageError('');
  const [isSent, setIsSent] = useState(false);

  if (isSent) {
    return (
      <section className="box">
        <h1 className="title">Check your email</h1>
        <p>
          If this email is registered, we have sent you a link to reset your
          password. The link is valid for 1 hour.
        </p>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{ email: '' }}
        validateOnMount={true}
        onSubmit={({ email }, formikHelpers) => {
          return authService
            .requestPasswordReset(email)
            .then(() => {
              setIsSent(true);
            })
            .catch(error => {
              const data = error.response?.data;

              if (data?.errors?.email) {
                formikHelpers.setFieldError('email', data.errors.email);
              }

              setError(data?.message || error.message);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Reset password</h1>

            <p className="mb-4">
              Enter your email and we will send you a link to reset your
              password.
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
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.email}
              >
                Send reset link
              </button>
            </div>

            Remember your password? <Link to="/login">Log in</Link>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
