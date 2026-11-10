import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from './Loader';
import { useAuth } from './AuthContext';

export const RequireNonAuth = ({ children }: { children?: React.ReactNode }) => {
  const { isChecked, currentUser } = useAuth();

  if (!isChecked) {
    return <Loader />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};
