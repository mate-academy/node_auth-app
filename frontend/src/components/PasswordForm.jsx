import { usePageError } from '../hooks/usePageError';
import { userService } from '../services/userService';
import { Field, Form, Formik } from 'formik';
import cn from 'classnames';

export const PasswordForm = ({ onSuccess }) => {
  const [error, setError] = usePageError('');

  return (
    <>
      <h3 className="subtitle">Change Password</h3>
      <Formik
        initialValues={{ oldPassword: '', password: '', confirmPassword: '' }}
        validateOnMount={true}
        validate={({ oldPassword, password, confirmPassword }) => {
          const errors = {};

          if (!oldPassword) {
            errors.oldPassword = 'Password is required';
          }

          if (!password) {
            errors.password = 'Password is required';
          } else if (password.length < 6) {
            errors.password = 'At least 6 characters';
          }

          if (confirmPassword !== password) {
            errors.confirmPassword = 'Passwords do not match';
          }

          return errors;
        }}
        onSubmit={async (
          { oldPassword, password, confirmPassword },
          helpers,
        ) => {
          try {
            await userService.changePassword({
              oldPassword,
              password,
              confirmPassword,
            });

            onSuccess('Password has been successfully updated!');
            helpers.resetForm();
          } catch (error) {
            if (error.message) {
              setError(error.message);
            }

            if (!error.response?.data) {
              return;
            }

            const { errors, message } = error.response.data;

            helpers.setFieldError('oldPassword', errors?.oldPassword);
            helpers.setFieldError('password', errors?.password);

            if (message) {
              setError(message);
            }
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <div className="field">
              <label htmlFor="password" className="label">
                Current Password
              </label>
              <Field
                name="oldPassword"
                type="password"
                id="oldPassword"
                placeholder="Enter current password"
                className={cn('input', {
                  'is-danger': touched.oldPassword && errors.oldPassword,
                })}
              />
              {touched.oldPassword && errors.oldPassword && (
                <p className="help is-danger">{errors.oldPassword}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="password" className="label">
                New Password
              </label>
              <Field
                name="password"
                type="password"
                id="password"
                placeholder="Enter new password"
                className={cn('input', {
                  'is-danger': touched.password && errors.password,
                })}
              />
              {touched.password && errors.password ? (
                <p className="help is-danger">{errors.password}</p>
              ) : (
                <p className="help">At least 6 characters</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <Field
                name="confirmPassword"
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                className={cn('input', {
                  'is-danger':
                    touched.confirmPassword && errors.confirmPassword,
                })}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="help is-danger">{errors.confirmPassword}</p>
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
                  errors.password ||
                  errors.confirmPassword
                }
              >
                Update Password
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
