import React from 'react';
import { NavLink } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="notFound">
      <div className="notFound__content">
        <h2 className="notFound__title">404 - Page Not Found</h2>
        <p className="notFound__text">
          The link you accessed does not exist or has been moved
        </p>
        <NavLink className="notFound__link" to={'/'}>
          Return to the Home Page
        </NavLink>
      </div>
    </div>
  );
};
