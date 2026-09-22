import { Link, Navigate, useNavigate } from 'react-router-dom';
import { usePageError } from '../hooks/usePageError';
import { useAuth } from '../components/AuthContext';
import { Formik, Form, Field } from 'formik';
import type { AxiosError } from 'axios';
import cn from 'classnames';

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

  const [error, setError] = usePageError('');
  const { login, isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validateOnMount={true}
        onSubmit={({ email, password }) => {
          return login(email, password)
            .then(() => {
              navigate('/profile');
            })
            .catch((error: AxiosError<{ message?: string }>) => {
              setError(error.response?.data?.message ?? '');
            });
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Log in
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Welcome back. Enter your credentials to continue.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <Field
                  validate={validateEmail}
                  name="email"
                  type="email"
                  id="email"
                  placeholder="e.g. bobsmith@gmail.com"
                  autoComplete="email"
                  className={cn(
                    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400',
                    'focus:ring-2',
                    touched.email && errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
                  )}
                />

                {touched.email && errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Field
                  validate={validatePassword}
                  name="password"
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400',
                    'focus:ring-2',
                    touched.password && errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
                  )}
                />

                {touched.password && errors.password ? (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.password}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    At least 6 characters
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !!errors.email ||
                  !!errors.password
                }
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/sign-up"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign up
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
