import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { Loader } from './Loader.jsx';

export const GuestRoute = ({ children }) => {
  const { isChecked, user } = useContext(AuthContext);
  const location = useLocation();
  console.log('@@ user from guestRoute!!! ===>', user)

  if (!isChecked) {
    return <Loader />;
  }

  if (user) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};
