import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { usePageError } from '../hooks/usePageError';
import { useAuth } from '../components/AuthContext';
import { AxiosError } from 'axios';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value: string) {
  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

function validatePassword(value: string) {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = usePageError('');
  const { login, isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validateOnMount={true}
        onSubmit={({ email, password }) => {
          return login(email, password)
            .then(() => {
              const state = location.state as { from?: Location };
              navigate(state.from?.pathname ?? '/');
            })
            .catch((error: AxiosError<{ message?: string }>) => {
              setError(error.response?.data?.message ?? '');
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Log in</h1>
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
                Log in
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
