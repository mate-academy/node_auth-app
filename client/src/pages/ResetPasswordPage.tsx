import { Link, useParams } from 'react-router-dom';
import cn from 'classnames';
import { Formik, Form, Field, type FormikErrors } from 'formik';
import { useState } from 'react';
import { authService } from '../services/authService';

interface ResetValues {
  password?: string;
  confirmation?: string;
}

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-xl font-bold text-emerald-600">✓</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Password reset
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Your password has been reset successfully.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            New password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Choose a new password for your account.
          </p>
        </div>

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
              alert(
                'Failed to reset password. The link might be expired or invalid.',
              );
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label
                  htmlFor="reset-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  New password
                </label>

                <Field
                  id="reset-password"
                  name="password"
                  type="password"
                  className={cn(
                    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2',
                    touched.password && errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
                  )}
                />

                {touched.password && errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reset-confirmation"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <Field
                  id="reset-confirmation"
                  name="confirmation"
                  type="password"
                  className={cn(
                    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2',
                    touched.confirmation && errors.confirmation
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
                  )}
                />

                {touched.confirmation && errors.confirmation && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.confirmation}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : 'Save password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
