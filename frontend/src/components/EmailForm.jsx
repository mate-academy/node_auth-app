import { Field, Form, Formik } from 'formik';
import { validateEmail, validatePassword } from '../helper/helperFunctions';
import { userService } from '../services/userService';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { usePageError } from '../hooks/usePageError';
import cn from 'classnames';

export const EmailForm = ({ id, onSuccess }) => {
  const [error, setError] = usePageError('');
  const { checkAuth } = useContext(AuthContext);

  return (
    <>
      <h3 className="subtitle">Change Email</h3>
      <Formik
        initialValues={{ email: '', confirmEmail: '', password: '' }}
        validateOnMount={true}
        validate={({ email, confirmEmail, password }) => {
          const errors = {};
          const errorEmail = validateEmail(email);
          const errorPassword = validatePassword(password);

          if (errorEmail) {
            errors.email = errorEmail;
          }

          if (errorPassword) {
            errors.password = errorPassword;
          }

          if (email !== confirmEmail) {
            errors.confirmEmail = 'The email addresses do not match.';
          }

          return errors;
        }}
        onSubmit={async ({ email, confirmEmail, password }, formikHelpers) => {
          try {
            const { user, accessToken } = await userService.changeEmail(id, {
              email,
              confirmEmail,
              password,
            });

            await checkAuth();

            onSuccess('Email has been successfully updated!');
            formikHelpers.resetForm();
          } catch (error) {
            if (error.message) {
              setError(error.message);
            }

            if (!error.response?.data) {
              return;
            }

            const { errors, message } = error.response.data;

            formikHelpers.setFieldError('email', errors?.email);
            formikHelpers.setFieldError('password', errors?.password);

            if (message) {
              setError(message);
            }
          }
        }}
      >
        {({ touched, errors, isSubmitting }, formikHelpers) => (
          <Form>
            <div className="field">
              <label htmlFor="email" className="label">
                Email
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  type="email"
                  name="email"
                  id="email"
                  placeholder="e.g. bobsmith@gmail.com"
                  className={cn('input', {
                    'is-danger': touched.email && errors.email,
                  })}
                />
                <span className="icon is-small is-left">
                  <i className="fa fa-user"></i>
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
              <label htmlFor="confirmEmail" className="label">
                Confirm Email
              </label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  type="email"
                  name="confirmEmail"
                  id="confirmEmail"
                  placeholder="e.g. bobsmith@gmail.com"
                  className={cn('input', {
                    'is-danger': touched.confirmEmail && errors.confirmEmail,
                  })}
                />
                <span className="icon is-small is-left">
                  <i className="fa fa-user"></i>
                </span>

                {touched.confirmEmail && errors.confirmEmail && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>
              {touched.confirmEmail && errors.confirmEmail && (
                <p className="help is-danger">{errors.confirmEmail}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="password" className="label">
                Password
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
                  <i className="fa fa-user"></i>
                </span>

                {touched.password && errors.password && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>
              {touched.password && errors.password && (
                <p className="help is-danger">{errors.password}</p>
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
                  errors.email ||
                  errors.confirmEmail ||
                  errors.password
                }
              >
                Update Email
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <br />
      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
