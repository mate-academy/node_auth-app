import { Field, Form, Formik } from 'formik';
import { validatePassword } from '../helper/helperFunctions';
import { usePageError } from '../hooks/usePageError';
import { Link, useParams } from 'react-router-dom';
import { authClient } from '../http/authClient';
import { authService } from '../services/authService';
import { useState } from 'react';
import cn from 'classnames';

export const SetNewPasswordPage = () => {
  const [reseted, setReseted] = useState(false);
  const [error, setError] = usePageError('');
  const { resetToken } = useParams();

  if (reseted) {
    return (
      <section className="">
        <h1 className="title">Password changed</h1>
        <p>
          Your password has been changed. To authorize, please use the following
          link
        </p>
        <Link to="/login">Log in</Link>
      </section>
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
          const errors = {};

          if (!password) {
            errors.password = 'Password is required';
          } else if (password.length < 6) {
            errors.password = 'At least 6 characters';
          }

          if (confirmation !== password) {
            errors.confirmation = 'Passwords do not match';
          }

          return errors;
        }}
        onSubmit={({ password, confirmation }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          authService
            .resetPassword({ resetToken, password, confirmation })
            .then(() => setReseted(true))
            .catch(error => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('password', errors?.password);

              if (message) {
                setError(message);
              }
            })
            .finally(() => formikHelpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting }) => {
          return (
            <Form className="box">
              <h1 className="title">Reset password</h1>
              <div className="field">
                <label htmlFor="password" className="label">
                  New password
                </label>
                <div className="control has-icons-left has-icons-right">
                  <Field
                    type="password"
                    name="password"
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
                  Confirm Password
                </label>
                <div className="control has-icons-left has-icons-right">
                  <Field
                    type="password"
                    name="confirmation"
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
                    isSubmitting || errors.confirmation || errors.password
                  }
                >
                  Reset Password
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
