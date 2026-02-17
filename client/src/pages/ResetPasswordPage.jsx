import React, { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import { userService } from '../services/userService';
import { AuthContext } from '../components/AuthContext';

export const ResetPasswordPage = () => {
  const { activationToken } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // 1. Force logout on mount to clear any "Ghost Users" or old sessions
  useEffect(() => {
    logout().catch(() => {
      /* ignore if already logged out */
    });
  }, [logout]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await userService.resetPassword(activationToken, values.password);
      alert('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Link expired or invalid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-6">
      <div className="box" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1 className="title">Set New Password</h1>

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validate={(values) => {
            const errors = {};

            // Password strength validation
            if (!values.password) {
              errors.password = 'Required';
            } else if (values.password.length < 6) {
              errors.password = 'Password must be at least 6 characters';
            }

            // Matching validation
            if (values.confirmPassword !== values.password) {
              errors.confirmPassword = 'Passwords do not match';
            }

            return errors;
          }}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="field">
                <label className="label">New Password</label>
                <Field
                  name="password"
                  type="password"
                  className={`input ${touched.password && errors.password ? 'is-danger' : ''}`}
                  placeholder="At least 6 characters"
                />
                {touched.password && errors.password && (
                  <p className="help is-danger">{errors.password}</p>
                )}
              </div>

              <div className="field mt-3">
                <label className="label">Confirm Password</label>
                <Field
                  name="confirmPassword"
                  type="password"
                  className={`input ${touched.confirmPassword && errors.confirmPassword ? 'is-danger' : ''}`}
                  placeholder="Repeat new password"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="help is-danger">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className={`button is-success mt-4 is-fullwidth ${isSubmitting ? 'is-loading' : ''}`}
                disabled={isSubmitting}
              >
                Update Password
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
