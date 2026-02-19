import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { AuthContext } from '../components/AuthContext';

export const EmailConfirmPage = () => {
  const { activationToken } = useParams();
  const [result, setResult] = useState('Verifying...');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    userService.confirmEmailChange(activationToken)
      .then(() => setResult('Success! Your email has been updated.'))
      .catch(() => setResult('Error: Link is invalid or expired.'));
  }, [activationToken]);

  return (
    <div className="container has-text-centered mt-6">
      <div className="box">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <h1 className="title">{result}</h1>

            {user ? (
              <Link to="/profile" className="button is-primary">
                Go to Profile
              </Link>
            ) : (
              <Link to="/login" className="button is-primary">
                Go to Login
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};
