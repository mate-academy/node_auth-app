import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../components/AuthContext';
import { Loader } from '../components/Loader';
import { AxiosError } from 'axios';

export const AccountActivationPage = () => {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const { activate } = useAuth();
  const { activationToken = '' } = useParams();

  useEffect(() => {
    if (!activationToken) {
      setError('Wrong activation link');
      setDone(true);

      return;
    }

    activate(activationToken)
      .then(() => {
        navigate('/profile');
      })
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
