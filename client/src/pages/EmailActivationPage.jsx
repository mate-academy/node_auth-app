import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../components/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import { userService } from '../services/userService.js';
import { accessTokenService } from '../services/accessTokenService.js';

export const EmailActivationPage = () => {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const { activationToken } = useParams();

  useEffect(() => {
    userService
      .activateChangeEmail({ token: activationToken })
      .then(res => {
        accessTokenService.remove();
      })
      .catch(error => {
        setError(error.response?.data?.message || `Wrong activation link`);
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
      <h1 className="title">Email change activation</h1>

      {error ? (
        <p className="notification is-danger is-light">{error}</p>
      ) : (
        <div>
          <p className="notification is-success is-light">
            Your email is now active
          </p>
          <Link to="/login" className="button is-success has-text-weight-bold">
            Log in
          </Link>
        </div>
      )}
    </>
  );
};
