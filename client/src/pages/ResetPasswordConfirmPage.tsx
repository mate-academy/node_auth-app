import { useState } from 'react';
import { Formik, Form, Field, FormikErrors } from 'formik';
import { Link, useParams } from 'react-router-dom';
import cn from 'classnames';
import { authService } from '../services/authService';

interface ResetValues {
  password?: string;
  confirmation?: string;
}

export const ResetPasswordConfirmPage = () => {
  const { token } = useParams<{ token: string }>();
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="section container">
        <div className="notification is-success">
          <p>Your password has been reset successfully!</p>
          <Link to="/login" className="button is-light mt-3">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section container">
      <div className="box">
        <h1 className="title">New Password</h1>
        
        <Formik
          initialValues={{ password: '', confirmation: '' }}
          validate={(values: ResetValues) => {
            const errors: FormikErrors<ResetValues> = {};
            
            if (!values.password) {
              errors.password = 'Required';
            } else if (values.password.length < 6) {
              errors.password = 'Too short';
            }

            if (values.password !== values.confirmation) {
              errors.confirmation = 'Must match';
            }

            return errors;
          }}
          onSubmit={async (values) => {
            if (!token || !values.password) {
              return;
            }

            try {
              await authService.resetPassword(token, values.password);
              setIsSuccess(true);
            } catch {
              alert('Failed to reset password. The link might be expired or invalid.');
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="field">
                <label className="label">New Password</label>
                <div className="control">
                  <Field
                    name="password"
                    type="password"
                    className={cn('input', { 'is-danger': touched.password && errors.password })}
                  />
                </div>
                {touched.password && errors.password && (
                  <p className="help is-danger">{errors.password}</p>
                )}
              </div>

              <div className="field">
                <label className="label">Confirm Password</label>
                <div className="control">
                  <Field
                    name="confirmation"
                    type="password"
                    className={cn('input', { 'is-danger': touched.confirmation && errors.confirmation })}
                  />
                </div>
                {touched.confirmation && errors.confirmation && (
                  <p className="help is-danger">{errors.confirmation}</p>
                )}
              </div>

              <div className="field">
                <button
                  type="submit"
                  className={cn('button is-primary', { 'is-loading': isSubmitting })}
                  disabled={isSubmitting}
                >
                  Save Password
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};