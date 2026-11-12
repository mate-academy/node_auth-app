import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../components/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { authService } from '../services/authService.js';

export const ConfirmEmailPage = () => {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { email, token } = useParams();

  useEffect(() => {
    authService
      .confirmEmail(email, token)
      .then(({ user: updatedUser }) => {
        setUser(updatedUser);
        navigate('/profile');
      })
      .catch(error => {
        setError(error.response?.data?.message || 'Wrong confirmation link');
      })
      .finally(() => {
        setDone(true);
      });
  }, []);

  if (!done) {
    return <Loader />;
  }

  return (
    <>
      <h1 className="title">Email confirmation</h1>

      {error ? (
        <p className="notification is-danger is-light">{error}</p>
      ) : (
        <>
          <p className="notification is-success is-light">
            Your new email has been confirmed
          </p>
        </>
      )}
    </>
  );
};
