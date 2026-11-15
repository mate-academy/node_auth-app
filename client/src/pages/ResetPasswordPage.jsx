import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { authService } from '../services/authService.js';
import { usePageError } from '../hooks/usePageError.js';

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

export const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const [error, setError] = usePageError('');
  const [isDone, setIsDone] = useState(false);

  if (isDone) {
    return (
      <section className="box">
        <h1 className="title">Password changed</h1>
        <p className="mb-4">
          Your password has been changed successfully.
        </p>
        <Link to="/login" className="button is-success has-text-weight-bold">
          Log in
        </Link>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{ password: '', confirmation: '' }}
        validateOnMount={true}
        validate={({ password, confirmation }) => {
          const formErrors = {};

          if (confirmation && password !== confirmation) {
            formErrors.confirmation = 'Passwords do not match';
          }

          return formErrors;
        }}
        onSubmit={({ password, confirmation }, formikHelpers) => {
          return authService
            .resetPassword(resetToken, { password, confirmation })
            .then(() => {
              setIsDone(true);
            })
            .catch(error => {
              const data = error.response?.data;

              formikHelpers.setFieldError('password', data?.errors?.password);
              formikHelpers.setFieldError(
                'confirmation',
                data?.errors?.confirmation,
              );

              setError(data?.message || error.message);
            });
        }}
      >
        {({ touched, errors, values, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Set a new password</h1>

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
                  placeholder="*******"
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

            <div className="field">
              <label htmlFor="confirmation" className="label">
                Confirm password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  name="confirmation"
                  type="password"
                  id="confirmation"
                  placeholder="*******"
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
                  isSubmitting ||
                  errors.password ||
                  errors.confirmation ||
                  !values.confirmation
                }
              >
                Change password
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
