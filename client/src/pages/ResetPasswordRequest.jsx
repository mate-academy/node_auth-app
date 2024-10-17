import { Formik, Form, Field } from 'formik';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { useState } from 'react';
import { usePageError } from '../hooks/usePageError.js';
import { authService } from '../services/authService.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

export const ResetPasswordRequest = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = usePageError('');

  if (emailSent) {
    return (
      <section className="">
        <h1 className="title">Check your email</h1>
        <p>We have sent you following instructions</p>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
        }}
        validateOnMount={true}
        onSubmit={({ email }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          authService
            .resetPasswordRequest({ email })
            .then(() => {
              setEmailSent(true);
            })
            .catch((error) => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('email', errors?.email);

              if (message) {
                setError(message);
              }
            })
            .finally(formikHelpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Reset Password</h1>
            <div className="field">
              <label htmlFor="email" className="label">
                Email
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  style={{ marginBottom: '10px' }}
                  validate={validateEmail}
                  name="email"
                  type="email"
                  id="email"
                  placeholder="e.g. Johnjohnson@gmail.com"
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
                Send
              </button>
            </div>
            Do not have an account? <Link to="/sign-up">Sign up</Link>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
