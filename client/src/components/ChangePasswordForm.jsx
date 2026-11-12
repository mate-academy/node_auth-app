import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { useState } from 'react';
import { profileService } from '../services/profileService';
import { usePageError } from '../hooks/usePageError';

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }
}

export const ChangePasswordForm = () => {
  const [done, setDone] = useState(false);
  const [error, setError] = usePageError('');

  if (done) {
    return (
      <section className="">
        <h1 className="title">Password changed</h1>
        <p>Your password has been changed</p>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          oldPassword: '',
          newPassword: '',
          confirmation: '',
        }}
        validate={({ newPassword, confirmation }) => {
          const errors = {};

          if (confirmation !== newPassword) {
            errors.confirmation = 'Passwords do not match';
          }

          return errors;
        }}
        validateOnMount={true}
        onSubmit={(
          { oldPassword, newPassword, confirmation },
          formikHelpers,
        ) => {
          formikHelpers.setSubmitting(true);

          profileService
            .updatePassword({ oldPassword, newPassword, confirmation })
            .then(() => {
              setDone(true);
            })
            .catch(error => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('newPassword', errors?.newPassword);

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
            <h1 className="title">Update password</h1>

            <div className="field">
              <label htmlFor="oldPassword" className="label">
                Old Password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="oldPassword"
                  type="password"
                  id="oldPassword"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger': touched.oldPassword && errors.oldPassword,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>
                {touched.oldPassword && errors.oldPassword && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.oldPassword && errors.oldPassword ? (
                <p className="help is-danger">{errors.oldPassword}</p>
              ) : (
                <p className="help">Enter your current password</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="newPassword" className="label">
                New password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="newPassword"
                  type="password"
                  id="newPassword"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger': touched.newPassword && errors.newPassword,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.newPassword && errors.newPassword && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.newPassword && errors.newPassword ? (
                <p className="help is-danger">{errors.newPassword}</p>
              ) : (
                <p className="help">Enter your new password</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirmation" className="label">
                Confirm your new password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
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

              {touched.confirmation && errors.confirmation ? (
                <p className="help is-danger">{errors.confirmation}</p>
              ) : (
                <p className="help">Confirm your new password</p>
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
                  errors.oldPassword ||
                  errors.newPassword ||
                  errors.confirmation
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
