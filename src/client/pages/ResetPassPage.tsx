import { usePageError } from '../hooks/usePageError';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useEffect, useState } from 'react';

import { catchError, ErrorResponse } from '../utils/catchError';
import { useAuth } from '../components/AuthContext';
import { Loader } from '../components/Loader';
import { AxiosError } from 'axios';
import { Fields } from '../types/Fields';
import { SubmitCallback } from '../types/SubmitCallback';
import { FormTemplate } from '../components/FormTemplate';

const fieldsNewPassword = {
  newPassword: { type: 'password', label: 'New password' },
  confirmPassword: { type: 'password', label: 'Confirm password' },
} as Fields;

const fieldsEmail = {
  email: { type: 'email', label: 'Email' },
} as Fields;

export const ResetPassPage = () => {
  const [error, setError] = usePageError('');
  const [valid, setValid] = useState<boolean | null>(null);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const { resetToken } = useParams();
  const { currentUser, checkAuth } = useAuth();
  const wasAuthenticated = Boolean(currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (resetToken || !currentUser) {
      return;
    }

    const alreadySent = sessionStorage.getItem('reset_email_sent');

    if (alreadySent) {
      setSent(true);

      return;
    }

    authService
      .requestPasswordReset(currentUser.email)
      .then(() => {
        setSent(true);
        sessionStorage.setItem('reset_email_sent', 'true');
      })
      .catch((e) => catchError(e, setError));
  }, [currentUser, resetToken]);

  useEffect(() => {
    if (!resetToken) {
      return;
    }

    authService
      .validateResetToken(resetToken)
      .then(() => setValid(true))
      .catch(() => setValid(false));
  }, [resetToken]);

  const handleSubmitNewPassword: SubmitCallback = async (
    { newPassword, confirmPassword },
    formikHelpers,
  ) => {
    formikHelpers.setSubmitting(true);

    try {
      await authService.resetPassword(
        resetToken || '',
        newPassword,
        confirmPassword,
      );

      if (wasAuthenticated) {
        await checkAuth();
      }

      setDone(true);
    } catch (e) {
      catchError(e as AxiosError<ErrorResponse>, setError);
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  const handleSubmitEmail: SubmitCallback = async (
    { email },
    formikHelpers,
  ) => {
    formikHelpers.setSubmitting(true);

    authService
      .requestPasswordReset(email)
      .then(() => setSent(true))
      .catch((e) => catchError(e, setError))
      .finally(() => formikHelpers.setSubmitting(false));
  };

  useEffect(() => {
    if (!done || !wasAuthenticated) {
      return;
    }

    const timer = setTimeout(() => {
      navigate('/profile');
    }, 2000);

    return () => clearTimeout(timer);
  }, [done]);

  return (
    <div className="content">
      <h1 className="title">Reset password</h1>

      {resetToken ? (
        valid ? (
          done ? (
            <>
              <p className="notification is-success is-light">
                Password successfully reset
              </p>
              {!wasAuthenticated && (
                <Link
                  to="/login"
                  className="button is-success has-text-weight-bold"
                >
                  Log in
                </Link>
              )}
            </>
          ) : (
            <FormTemplate
              fields={fieldsNewPassword}
              onSubmit={handleSubmitNewPassword}
            />
          )
        ) : valid === null ? (
          <Loader />
        ) : (
          <p className="notification is-danger is-light">
            This reset link is invalid or expired
          </p>
        )
      ) : sent ? (
        <p className="notification is-success is-light">
          We have sent you an email with the reset link
        </p>
      ) : wasAuthenticated ? (
        <Loader />
      ) : (
        <FormTemplate fields={fieldsEmail} onSubmit={handleSubmitEmail} />
      )}

      {error && <p className="notification is-danger is-light">{error}</p>}
    </div>
  );
};
