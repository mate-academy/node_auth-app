import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Loader } from '../components/Loader';

export const AccountActivationPage = () => {
  const { activate } = useAuth();
  const navigate = useNavigate();

  const { activationToken = '', email = '' } = useParams();

  const isLinkInvalid = !activationToken || !email;

  const [error, setError] = useState<string>(
    isLinkInvalid ? 'Wrong activation link' : '',
  );

  const [done, setDone] = useState<boolean>(isLinkInvalid);

  useEffect(() => {
    if (isLinkInvalid) return;

    activate(email, activationToken)
      .then(() => {
        navigate('/profile', { replace: true });
      })
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? 'Wrong activation link');
      })
      .finally(() => setDone(true));
  }, [activationToken, email, activate, isLinkInvalid, navigate]);

  if (!done) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full ${
            error ? 'bg-red-100' : 'bg-emerald-100'
          }`}
        >
          <span
            className={`text-xl font-bold ${
              error ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {error ? '!' : '✓'}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account activation
        </h1>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Your account is now active
          </p>
        )}
      </div>
    </div>
  );
};
