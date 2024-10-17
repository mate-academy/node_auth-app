import { Formik, Form, Field } from 'formik';
import { Link, useParams } from 'react-router-dom';
import cn from 'classnames';
import { usePageError } from '../hooks/usePageError.js';
import { authService } from '../services/authService.js';
import { useState } from 'react';

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

export const ChangePasswordPage = () => {
  const { activationToken } = useParams();
  const [error, setError] = usePageError('');
  const [changed, setChanged] = useState(false);

  if (changed) {
    return (
      <section>
        <p>
          Success. Your password has been changed.
          <Link to={'/login'}>Log in</Link>
        </p>
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
        onSubmit={({ password, confirmation }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          authService
            .changePassword({ password, confirmation, activationToken })
            .then(() => {
              setChanged(true);
            })
            .catch((error) => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('password', errors?.password);
              formikHelpers.setFieldError('confirmation', errors?.confirmation);

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
            <h1 className="title">Change password</h1>
            <div className="field">
              <label htmlFor="new-password" className="label">
                New password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="password"
                  type="password"
                  id="new-password"
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
              <label htmlFor="confirm-password" className="label">
                Confirm password
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="confirmation"
                  type="password"
                  id="confirm-password"
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
                <p className="help">At least 6 characters</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={
                  isSubmitting || error.newPassword || errors.confirmation
                }
              >
                Sign up
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
