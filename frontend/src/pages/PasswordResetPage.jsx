import { useState } from 'react';
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

function validateConfirmation(password) {
  return function(value) {
    if (!value) {
      return 'Confirmation is required';
    }

    if (value !== password) {
      return 'Passwords do not match';
    }
  };
}

export const PasswordResetPage = () => {
  const { passwordResetToken } = useParams();
  const [error, setError] = usePageError('');
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <section>
        <h1 className="title">Password changed</h1>
        <p>
          Your password has been reset. <Link to="/login">Log in</Link>
        </p>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{ password: '', confirmation: '' }}
        validateOnMount={true}
        onSubmit={({ password, confirmation }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          authService
            .resetPassword(passwordResetToken, password, confirmation)
            .then(() => setDone(true))
            .catch(error => {
              if (!error.response?.data) {
                setError(error.message);
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('password', errors?.password);
              formikHelpers.setFieldError('confirmation', errors?.confirmation);

              if (message) {
                setError(message);
              }
            })
            .finally(() => formikHelpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting, values }) => (
          <Form className="box">
            <h1 className="title">New password</h1>

            <div className="field">
              <label htmlFor="password" className="label">
                Password
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
                  validate={validateConfirmation(values.password)}
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
                  isSubmitting || !!errors.password || !!errors.confirmation
                }
              >
                Set new password
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
