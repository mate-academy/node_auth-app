import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';
import { Loading } from '../Loading/Loading.js';
import { useAuthContext } from '@/app/providers/Auth/AuthContext.js';
import styles from './styles.module.scss';

export const RequireAuth: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children }) => {
  const { isChecked, user } = useAuthContext();
  const location = useLocation();

  if (!isChecked) {
    return (
      <div className={styles.container}>
        <Loading width={300} height={300} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};
