import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../components/AuthContext.jsx';

export const NotFoundPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <section className="box has-text-centered">
      <h1 className="title is-1">404</h1>
      <p className="subtitle">Page not found</p>

      {user ? (
        <Link to="/profile" className="button is-success has-text-weight-bold">
          Go to profile
        </Link>
      ) : (
        <Link to="/login" className="button is-success has-text-weight-bold">
          Log in
        </Link>
      )}
    </section>
  );
};
