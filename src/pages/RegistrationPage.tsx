import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { authService } from '../services/authService';
import { AxiosError } from 'axios';
import { usePageError } from '../hooks/usePageError';
import { useAuth } from '../components/AuthContext';

type RegistrationError = AxiosError<{
  errors?: { email?: string; password?: string };
  message: string;
}>;

function validateEmail(value: string) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

const validatePassword = (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
};

export const RegistrationPage = () => {
  const [error, setError] = usePageError('');
  const [registered, setRegistered] = useState(false);

  const { isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  if (registered) {
    return (
      <section className="">
        <h1 className="title">Check your email</h1>
        <p>We have sent you an email with the activation link</p>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validateOnMount={true}
        onSubmit={({ email, password }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          authService
            .register(email, password)
            .then(() => setRegistered(true))
            .catch((error: RegistrationError) => {
              if (error.message) setError(error.message);
              if (!error.response?.data) return;

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('email', errors?.email);
              formikHelpers.setFieldError('password', errors?.password);

              if (message) setError(message);
            })
            .finally(() => formikHelpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Sign up</h1>
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
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || !!errors.email || !!errors.password}
              >
                Sign up
              </button>
            </div>
            Already have an account? <Link to="/login">Log in</Link>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
