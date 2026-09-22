import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';
import type { AxiosError } from 'axios';
import { Link, Navigate } from 'react-router-dom';

import { usePageError } from '../hooks/usePageError';
import { useAuth } from '../components/AuthContext';
import { authService } from '../services/authService';

type RegistrationError = AxiosError<{
  errors?: { name?: string; email?: string; password?: string };
  message: string;
}>;

function validateEmail(value: string) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

const validatePassword = (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
};

const validateName = (value: string) => {
  if (!value) return 'Name is required';
};

export const RegistrationPage = () => {
  const [error, setError] = usePageError('');
  const [registered, setRegistered] = useState(false);

  const { isChecked, currentUser } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" />;
  }

  if (registered) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-xl font-bold text-emerald-600">✓</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Check your email
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            We have sent you an email with the activation link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Formik
        initialValues={{ name: '', email: '', password: '' }}
        validateOnMount={true}
        onSubmit={({ name, email, password }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          authService
            .register(name, email, password)
            .then(() => setRegistered(true))
            .catch((error: RegistrationError) => {
              if (error.message) setError(error.message);

              if (!error.response?.data) return;

              const { errors, message } = error.response.data;

              formikHelpers.setFieldError('name', errors?.name);
              formikHelpers.setFieldError('email', errors?.email);
              formikHelpers.setFieldError('password', errors?.password);

              if (message) setError(message);
            })
            .finally(() => formikHelpers.setSubmitting(false));
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign up
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Create your account to get started.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Name
                </label>

                <Field
                  validate={validateName}
                  name="name"
                  type="text"
                  id="name"
                  placeholder="Bob"
                  autoComplete="name"
                  className={cn(
                    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2',
                    touched.name && errors.name
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
                  )}
                />

                {touched.name && errors.name && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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
                    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2',
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
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <Field
                  validate={validatePassword}
                  name="password"
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={cn(
                    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2',
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
                  !!errors.password ||
                  !!errors.name
                }
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account...' : 'Sign up'}
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Log in
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
