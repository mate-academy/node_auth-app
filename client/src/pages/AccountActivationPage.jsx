import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../components/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';

export const AccountActivationPage = () => {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const { user, isChecked, activate, logout } = useContext(AuthContext);
  const { activationToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activationToken) {
      setResult('Invalid or missing confirmation link.');
      return;
    }

    if (!isChecked) {
      return;
    }

    if (user) {
      navigate('/profile');
      return;
    }

    const processActivation = async () => {
      try {
        // await logout();
        await activate(activationToken);
        navigate('/profile');
      } catch (error) {
        setError(error.response?.data?.message || `Wrong activation link`);
      } finally {
        setDone(true);
      }
    };

    processActivation();
  }, [activationToken, isChecked, user, logout, activate]);

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
