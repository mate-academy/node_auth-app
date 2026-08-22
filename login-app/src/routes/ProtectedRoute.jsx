import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowAuthenticated }) => {
  const { token } = useAuth();

  if (allowAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowAuthenticated && token) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};
