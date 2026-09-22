import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Field, Form, Formik } from 'formik';
import { authService } from '../services/authService';

export const ForgotPasswordPage = () => {
  const [isSent, setIsSent] = useState(false);
  const { currentUser, isChecked } = useAuth();

  if (isChecked && currentUser) {
    return <Navigate to="/" replace />;
  }

  if (isSent) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-xl font-bold text-emerald-600">✓</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Check your email
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            If an account exists for that email, we have sent a password reset
            link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reset password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <Formik
          initialValues={{ email: '' }}
          onSubmit={async (values) => {
            try {
              await authService.forgotPassword(values.email);
            } finally {
              setIsSent(true);
            }
          }}
        >
          <Form className="space-y-5">
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <Field
                id="forgot-email"
                name="email"
                type="email"
                placeholder="e.g. bob@gmail.com"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Send reset link
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};
