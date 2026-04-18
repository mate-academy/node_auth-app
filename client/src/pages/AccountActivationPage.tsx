import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../components/AuthContext';
import { Loader } from '../components/Loader';
import { AxiosError } from 'axios';

export const AccountActivationPage = () => {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const { activate } = useAuth();
  const { activationToken = '', email = '' } = useParams();

  useEffect(() => {
    if (!activationToken || !email) {
      setError('Wrong activation link');
      setDone(true);

      return;
    }

    activate(email, activationToken)
      .catch((error: AxiosError<{ message?: string }>) => {
        setError(error.response?.data?.message ?? `Wrong activation link`);
      })
      .finally(() => setDone(true));
  }, []);

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
