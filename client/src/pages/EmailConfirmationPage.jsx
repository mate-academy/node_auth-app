import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../services/userService';

export const EmailConfirmPage = () => {
  const { activationToken } = useParams();
  const [result, setResult] = useState('Verifying...');

  useEffect(() => {
    userService.confirmEmailChange(activationToken)
      .then(() => setResult('Success! Your email has been updated.'))
      .catch(() => setResult('Error: Link is invalid or expired.'));
  }, [activationToken]);

  return (
    <div className="container has-text-centered mt-6">
      <div className="box">
        <h1 className="title">{result}</h1>
        <Link to="/login" className="button is-primary">Go to Login</Link>
      </div>
    </div>
  );
};
