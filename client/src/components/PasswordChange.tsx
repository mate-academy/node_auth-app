
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { userService } from '../services/userService';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export const PasswordChange = ({ onDone }) => {
  const { logout } = useAuth();

  return (
    <Formik
      initialValues={{
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }}
      //validateOnMount={true}
      validate={({ oldPassword, newPassword, confirmPassword }) => {
        const errors: {
          oldPassword?: string;
          newPassword?: string;
          confirmPassword?: string;
        } = {};

        if (!oldPassword) {
          errors.oldPassword = 'Current password is required';
        }

        if (!newPassword) {
          errors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
          errors.newPassword = 'At least 6 characters';
        }

        if (!confirmPassword) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
      }}
      onSubmit={({ oldPassword, newPassword, confirmPassword }) => {
        return userService
          .updatePassword(oldPassword, newPassword, confirmPassword)
          .then(() => {
            toast.success('Password successfully updated');
            onDone();
            setTimeout(logout, 3000);
           })
          .catch(() => {
            toast.error('Failed to update password');
          });
      }}
    >
      {({ touched, errors, isSubmitting }) => (
        <Form className="box">
          <div className="field">
            <label className="label" htmlFor="oldPassword">
              Current password
            </label>

            <Field
              name="oldPassword"
              type="password"
              id="oldPassword"
              className={cn('input', {
                'is-danger': touched.oldPassword && errors.oldPassword,
              })}
              disabled={isSubmitting}
            />

            {touched.oldPassword && errors.oldPassword && (
              <p className="help is-danger">{errors.oldPassword}</p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="newPassword">
              New password
            </label>

            <Field
              name="newPassword"
              type="password"
              id="newPassword"
              className={cn('input', {
                'is-danger': touched.newPassword && errors.newPassword,
              })}
              disabled={isSubmitting}
            />

            {touched.newPassword && errors.newPassword ? (
              <p className="help is-danger">{errors.newPassword}</p>
            ) : (
              <p className="help">At least 6 characters</p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="confirmPassword">
              Confirm new password
            </label>

            <Field
              name="confirmPassword"
              type="password"
              id="confirmPassword"
              className={cn('input', {
                'is-danger': touched.confirmPassword && errors.confirmPassword,
              })}
              disabled={isSubmitting}
            />

            {touched.confirmPassword && errors.confirmPassword && (
              <p className="help is-danger">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="field is-grouped">
            <button
              type="submit"
              className={cn('button is-success', {
                'is-loading': isSubmitting,
              })}
              disabled={isSubmitting}
            >
              Update password
            </button>

            <button
              type="button"
              className="button is-light"
              onClick={onDone}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
