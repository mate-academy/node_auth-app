import { Navigate, Outlet } from 'react-router-dom';
import React from 'react';
import { useAuthContext } from '@/app/providers/Auth/AuthContext.js';
import { Loading } from '../Loading/Loading';

export const RequireNonAuth: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children }) => {
  const { isChecked, user } = useAuthContext();

  if (!isChecked) {
    return <Loading width={300} height={300} />;

  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
};
