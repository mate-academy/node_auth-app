import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { useState } from 'react';
import { profileService } from '../services/profileService';
import { usePageError } from '../hooks/usePageError';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }
}

export const ChangeEmailForm = () => {
  const [sent, setSent] = useState(false);
  const [error, setError] = usePageError('');

  if (sent) {
    return (
      <section className="">
        <h1 className="title">Check your email</h1>
        <p>We have sent you an new Email to confirm the change</p>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          newEmail: '',
        }}
        validateOnMount={true}
        onSubmit={({ password, newEmail }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          profileService
            .updateEmail({ password, newEmail })
            .then(() => {
              setSent(true);
            })
            .catch(error => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('newEmail', errors?.newEmail);

              if (message) {
                setError(message);
              }
            })
            .finally(() => {
              formikHelpers.setSubmitting(false);
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Update Email</h1>
            <div className="field">
              <label htmlFor="newEmail" className="label">
                New Email
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validateEmail}
                  name="newEmail"
                  type="email"
                  id="newEmail"
                  placeholder="e.g. bobsmith@gmail.com"
                  className={cn('input', {
                    'is-danger': touched.newEmail && errors.newEmail,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-envelope"></i>
                </span>

                {touched.newEmail && errors.newEmail && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.newEmail && errors.newEmail && (
                <p className="help is-danger">{errors.newEmail}</p>
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
                <p className="help">Enter your current password</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.newEmail || errors.password}
              >
                Change Email
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
