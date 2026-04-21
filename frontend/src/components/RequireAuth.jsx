import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { Loader } from './Loader.jsx';

export const RequireAuth = ({ children }) => {
  const { isChecked, user } = useContext(AuthContext);
  const location = useLocation();

  if (!isChecked) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};
