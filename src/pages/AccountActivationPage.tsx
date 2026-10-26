import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../components/AuthContext';
import { Loader } from '../components/Loader';
import { AxiosError } from 'axios';

export const AccountActivationPage = () => {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const started = useRef(false);

  const { activate } = useAuth();
  const { activationToken = '' } = useParams();

  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;

    if (!activationToken) {
      setError('Wrong activation link');
      setDone(true);

      return;
    }

    activate(activationToken)
      .catch((err: AxiosError<{ message?: string }>) => {
        setError(err.response?.data?.message ?? `Wrong activation link`);
      })
      .finally(() => setDone(true));
  }, [activationToken, activate]);

  if (!done) {
    return <Loader />;
  }

  return (
    <>
      <h1 className="title">Account activation</h1>

      {error ? (
        <p className="notification is-danger is-light">{error}</p>
      ) : (
        <p className="notification is-success is-light">
          Your account is now active
        </p>
      )}
    </>
  );
};
